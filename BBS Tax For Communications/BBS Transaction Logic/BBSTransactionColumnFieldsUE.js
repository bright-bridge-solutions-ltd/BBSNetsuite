/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/record', 'N/ui/serverWidget', 'N/search','N/plugin'],
function(record, ui, search, plugin) 
{
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) 
    	{
    		var form 			= scriptContext.form;
    		var itemSublist 	= form.getSublist({id: 'item'});
    		var currentRecord 	= scriptContext.newRecord;
    		var configObject	= null;
    		
    		//Read the AFC config record
    		//
    		var customrecord_bbstfc_configSearchObj = getResults(search.create({
				   type: "customrecord_bbstfc_config",
				   filters:
				   [
				      ["isinactive","is","F"]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbstfc_from_address_field"}),
				      search.createColumn({name: "custrecord_bbstfc_to_address_field"})
				   ]
				}));
    		

    		//Check we can get the sublist & we have the config object
			//
    		if (itemSublist != null && customrecord_bbstfc_configSearchObj != null && customrecord_bbstfc_configSearchObj.length > 0)
				{
    				//Get the 'real' fields from the config object
    				//
	    			var realFromAddress = customrecord_bbstfc_configSearchObj[0].getValue({name: "custrecord_bbstfc_from_address_field"});
	    			var realToAddress 	= customrecord_bbstfc_configSearchObj[0].getValue({name: "custrecord_bbstfc_to_address_field"});
					
					// add new fields to the sublist
					var fromAddressField = itemSublist.addField({
																id: 	'custpage_bbstfc_endpoint_from',
																type: 	ui.FieldType.SELECT,
																label: 'EndPoint From Address'
																});
			
					var toAddressField = itemSublist.addField({
																id: 	'custpage_bbstfc_endpoint_to',
																type: 	ui.FieldType.SELECT,
																label: 'EndPoint To Address'
																});
		    		
					//Get the customer id
					//
		    		var customerId = currentRecord.getValue({fieldId: 'entity'});
		    			
		    		//Is the customer populated?
		    		//
		    		if(customerId != null && customerId != '')
		    			{
		    				//Find the customer addresses
		    				//
							var customerSearchObj = getResults(search.create({
								   type: "customer",
								   filters:
								   [
								      ["internalid","anyof",customerId]
								   ],
								   columns:
								   [
								      search.createColumn({name: "addresslabel", join: "Address", label: "Address Label"}),
								      search.createColumn({name: "addressinternalid", join: "Address", label: "Internal ID"})
								   ]
								}));
					
							//Set a blank option
							//
							fromAddressField.addSelectOption({
														    value: 			'',
														    text: 			'',
													//	    isSelected: 	true
															});
							
							toAddressField.addSelectOption({
														    value: 			'',
														    text: 			'',
													//	    isSelected: 	true
															});

							//Populate the select fields with options
							//
							if(customerSearchObj != null && customerSearchObj.length > 0)
								{
									for (var int = 0; int < customerSearchObj.length; int++) 
										{
											var addressLabel 	= customerSearchObj[int].getValue({name: "addresslabel", join: "Address"});
											var addressId 		= customerSearchObj[int].getValue({name: "addressinternalid", join: "Address"});
											
											fromAddressField.addSelectOption({
																				value: 	addressId,
																			    text: 	addressLabel
																			});
											
											toAddressField.addSelectOption({
																				value: 	addressId,
																			    text: 	addressLabel
																			});
										}
								}
							
							//Loop through the item sublist
							//
							var itemCount = currentRecord.getLineCount({sublistId: 'item'});
			    			
			    			for (var i = 0; i < itemCount; i++)
			    				{
			    					//Get field values from the line
			    					//
			    					var selectedFromAddress = currentRecord.getSublistValue({
																    						sublistId: 	'item',
																    						fieldId: 	realFromAddress,
																    						line: 		i
																    						});
			    					
			    					var selectedToAddress = currentRecord.getSublistValue({
																    						sublistId: 	'item',
																    						fieldId: 	realToAddress,
																    						line: 		i
																    						});

			    					//Set the selected value on the to/from address fields
			    					//
			    					
			    					if(selectedFromAddress != '')
			    						{
				    						currentRecord.setSublistValue({sublistId: 'item', fieldId: 'custpage_bbstfc_endpoint_from', line: i, value: selectedFromAddress});
				    					}
			    					
			    					if(selectedToAddress != '')
			    						{
			    							currentRecord.setSublistValue({sublistId: 'item', fieldId: 'custpage_bbstfc_endpoint_to', line: i, value: selectedToAddress});
			    						}
			    					
			    				}
		    		}
			}
    }

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
	    
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) 
	    {
    		var currentRecord 	= scriptContext.newRecord;
		
    		var customrecord_bbstfc_configSearchObj = getResults(search.create({
				   type: "customrecord_bbstfc_config",
				   filters:
				   [
				      ["isinactive","is","F"]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbstfc_from_address_field"}),
				      search.createColumn({name: "custrecord_bbstfc_to_address_field"})
				   ]
				}));
 		
 		if (customrecord_bbstfc_configSearchObj != null && customrecord_bbstfc_configSearchObj.length > 0)
				{
	 				//Get the 'real' fields from the config object
	 				//
	    			var realFromAddress = customrecord_bbstfc_configSearchObj[0].getValue({name: "custrecord_bbstfc_from_address_field"});
	    			var realToAddress 	= customrecord_bbstfc_configSearchObj[0].getValue({name: "custrecord_bbstfc_to_address_field"});
					
	    			//Loop through the item sublist
					//
					var itemCount = currentRecord.getLineCount({sublistId: 'item'});
	    			
	    			for (var i = 0; i < itemCount; i++)
	    				{
	    					//Get field values from the line
	    					//
	    					var selectedFromAddress = currentRecord.getSublistValue({
														    						sublistId: 	'item',
														    						fieldId: 	'custpage_bbstfc_endpoint_from',
														    						line: 		i
														    						});
	    					
	    					var selectedToAddress = currentRecord.getSublistValue({
														    						sublistId: 	'item',
														    						fieldId: 	'custpage_bbstfc_endpoint_to',
														    						line: 		i
														    						});

	    					//Set the selected value on the to/from address fields
	    					//
	    					
		    				currentRecord.setSublistValue({sublistId: 'item', fieldId: realFromAddress, line: i, value: selectedFromAddress});
	    					currentRecord.setSublistValue({sublistId: 'item', fieldId: realToAddress, line: i, value: selectedToAddress});
	    					
	    				}
				}
	    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) 
    	{
	    	
    	}
    

    return 	{
        	beforeLoad: 	beforeLoad,
        	beforeSubmit:	beforeSubmit
    		};
    
});
