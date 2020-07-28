
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {

	
	function customerLogic(currentRecord)
		{
			var currentId		= currentRecord.id;
			var addr1 			= '';
			var addr2 			= '';
			var city 			= '';
			var state 			= '';
			var zip 			= '';
			var country 		= '';
			var addrtext		= '';
			var addrUrl			= '';
			

			//Get the output document name & regular name
			//
			var outputDocName 	= currentRecord.getValue({fieldId: 'custentity_bbs_ouput_doc_name'});
			var companyName 	= currentRecord.getValue({fieldId: 'companyname'});
				
			//Get the count of address lines
			//
	    	var addressLines = currentRecord.getLineCount({sublistId: 'addressbook'}); 
					
	    	//Loop through the address lines looking for the default shipping address
	    	//
			for (var addressLine = 0; addressLine < addressLines; addressLine++) 
				{
					var defaultShipping = currentRecord.getSublistValue({sublistId: 'addressbook', fieldId: 'defaultshipping', line: addressLine});
						
					//Found the default shipping address
					//
					if(defaultShipping)
						{
							var addressSubRecord = currentRecord.getSublistSubrecord({
															    						sublistId: 	'addressbook',
															    						fieldId: 	'addressbookaddress',
															    						line: 		addressLine
															    						});
									
							addr1 		= addressSubRecord.getValue({fieldId: 'addr1'});
							addr2 		= addressSubRecord.getValue({fieldId: 'addr2'});
							city 		= addressSubRecord.getValue({fieldId: 'city'});
							state 		= addressSubRecord.getValue({fieldId: 'state'});
							zip 		= addressSubRecord.getValue({fieldId: 'zip'});
							country 	= addressSubRecord.getValue({fieldId: 'country'});
							addrtext	= addressSubRecord.getValue({fieldId: 'addrtext'});
							addrUrl		= 'https://www.google.com/maps/place/';
							//addrUrl		= '<p><a href="https://www.google.com/maps/place/';
									
							if(addr1 != null && addr1 != '')
								{
									addrUrl += addr1.replace(/ /g,'+') + ',';
								}
									
							if(addr2 != null && addr2 != '')
								{
									addrUrl += addr2.replace(/ /g,'+') + ',';
								}
								
							if(city != null && city != '')
								{
									addrUrl += city.replace(/ /g,'+') + ',';
								}
								
							if(state != null && state != '')
								{
									addrUrl += state.replace(/ /g,'+') + ',';
								}
								
							if(zip != null && zip != '')
								{
									addrUrl += zip.replace(/ /g,'+');
								}
								
							//addrUrl += '">Map</a></p>';
									
							//Set up the fields to update
							//
							var fieldObj = {};
									
							fieldObj['custentity_bbs_del_address'] 		= addrtext;
							fieldObj['custentity_bbs_del_address_map']	= addrUrl;
									
							//Check to see if we need to update output document name
							//
							if(outputDocName == null || outputDocName == '')
										{
											fieldObj['custentity_bbs_ouput_doc_name'] 	= companyName; 
											fieldObj['companyname'] 					= companyName + ' - ' + zip;
										}
									
							//Update the customer record
							//
							try
								{
									record.submitFields({
											    		type: 					record.Type.CUSTOMER,
											    		id: 					currentId,
											    		values:					fieldObj,
											    		enableSourcing: 		false,
														ignoreMandatoryFields: 	true
														});
								}
							catch(err)
								{
									log.error({
												title: 		'Error updating customer with id = ' + currentId,
												details: 	err
												});
								}
									
							//Update the contacts
							//
							updateContacts(currentId, addrtext);
									
							break;
						}
				}	
		}
	
	function updateContacts(_customerId, _address)
		{
			var contactSearchObj = getResults(search.create({
				   type: "contact",
				   filters:
				   [
				      ["company","anyof",_customerId]
				   ],
				   columns:
				   [
				      search.createColumn({name: "internalid", label: "Internal ID"})
				   ]
				}));
			
			if(contactSearchObj != null && contactSearchObj.length > 0)
				{
					for (var int = 0; int < contactSearchObj.length; int++) 
						{
							var contactId = contactSearchObj[int].id;
							
							try
								{
									record.submitFields({
											    		type: 					record.Type.CONTACT,
											    		id: 					contactId,
											    		values:					{
											    								custentity_bbs_contactaddress:	_address
											    								},
											    		enableSourcing: 		false,
														ignoreMandatoryFields: 	true
											    		});
								}
							catch(err)
								{
									log.error({
												title: 		'Error updating contact with id = ' + contactId,
												details: 	err
												});
								}
						}
				}
				
		}
	
    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }

	return 	{
    		customerLogic: 	customerLogic
			};	
});
