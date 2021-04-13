/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/plugin'],
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
    		try
				{
					//Get the plugin implementation
					//
					var  tfcPlugin = plugin.loadImplementation({
																type: 'customscript_bbstfc_plugin'
																});
					
					if(tfcPlugin != null)
						{
							//Get the current config 
							//
							configObject = tfcPlugin.getTFCConfiguration();
						}
				}
			catch(err)
				{
					log.error({
								title:		'Unexpected error when trying to get config record',
								details:	err
								});
					
					configObject = null;
				}
			
    		//Check we can get the sublist & we have the config object
			//
    		if (itemSublist != null && configObject != null)
				{
					// add new fields to the sublist
					var fromAddressField = itemSublist.addField({
																id: 	'custpage_from_address',
																type: 	ui.FieldType.SELECT,
																label: 'EndPoint "A" Address'
																});
			
					var toAddressField = itemSublist.addField({
																id: 	'custpage_to_address',
																type: 	ui.FieldType.SELECT,
																label: 'EndPoint "Z" Address'
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
								      search.createColumn({name: "internalid", join: "Address", label: "Internal ID"})
								   ]
								}));
					
							//Set a blank option
							//
							fromAddressField.addSelectOption({
														    value: 			'',
														    text: 			'',
														    isSelected: 	true
															});
							
							toAddressField.addSelectOption({
														    value: 			'',
														    text: 			'',
														    isSelected: 	true
															});

							//Populate the select fields with options
							//
							if(customerSearchObj != null && customerSearchObj.length > 0)
								{
									for (var int = 0; int < customerSearchObj.length; int++) 
										{
											var addressLabel 	= customerSearchObj[int].getValue({name: "addresslabel", join: "Address"});
											var addressId 		= customerSearchObj[int].getValue({name: "internalid", join: "Address"});
											
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
																    						fieldId: 	'packagetrackingnumber',
																    						line: 		i
																    						});
			    					
			    					var selectedToAddress = currentRecord.getSublistValue({
																    						sublistId: 	'item',
																    						fieldId: 	'packagetrackingnumber',
																    						line: 		i
																    						});

			    					//Set the selected value on the to/from address fields
			    					//
			    					if(selectedFromAddress != '')
			    						{
			    							
			    						}
			    					
			    					if(selectedToAddress != '')
			    						{
			    							
			    						}
			    				}
		    		}
			}
    }
	    
    /**
     * Function definition to be triggered before record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get line count
    	var lineCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through line count
    	for (var i = 0; i < lineCount; i++)
    		{
    			
    		}

    }

    /**
     * Function definition to be triggered after record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	
    
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getResults(_searchObject) {
    	
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
    	beforeLoad: 	beforeLoad,
    	beforeSubmit: 	beforeSubmit
    };
    
});
