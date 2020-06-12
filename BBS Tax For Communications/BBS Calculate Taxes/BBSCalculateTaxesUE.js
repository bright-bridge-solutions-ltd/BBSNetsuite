/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', './libraryModule', 'N/plugin'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, libraryModule, plugin) 
	{
	    /**
	     * Function definition to be triggered before record is loaded.
	     *
	     * @param {Object} scriptContext
	     * @param {Record} scriptContext.newRecord - New record
	     * @param {Record} scriptContext.oldRecord - Old record
	     * @param {string} scriptContext.type - Trigger type
	     * @Since 2015.2
	     */
	    function calculateTaxesAS(scriptContext) 
		    {
		    	//Get the plugin implementation
				//
				var  tfcPlugin = plugin.loadImplementation({
															type: 'customscript_bbstfc_plugin'
															});

				//Call the plugin
				//
				if(tfcPlugin != null)
					{
						try
							{
								//Contruct a tax request
								//
								var taxReqObj = new libraryModule.libCalcTaxesRequestObj();
							    
								//Fill in the request config & company data properties
								//
								//TODO
								
								
								//Loop through each line to process
								//
								//TODO
								
								
									//Create a new invoice line object
									//
							        var taxReqInvObj = new libraryModule.libInvoicesObj();
							        
							        //Fill in the invoice line object properties
									//
									//TODO
							        
							        //Create a new invoice item object
							        //
							        var taxReqItemObj = new libraryModule.libLineItemObj();
							      
							        //Fill in the invoice item object properties
									//
									//TODO
							        
							        
							        //Add the item object to the invoice line object
							        //
							        taxReqInvObj.itms.push(taxReqItemObj);
							        
							        //Add the invoice line object to the request object
							        //
							      	taxReqObj.inv.push(taxReqInvObj);
						      
							    //End of loop
							    //
							      	
							      	
								//Finally, call the plugin method
								//
								var taxResult = tfcPlugin.getTaxCalculation(taxReqObj);
								
								//Check the result of the call to the plugin
								//
								if(taxResult != null && taxResult.httpResponseCode == '200')
									{
										var taxResultDetails = taxResult.apiResponse;
										
										//Process the tax results
										//
										//TODO
										
										
									}
							}
						catch(err)
							{
								log.error({
											title:		'Error calling plugin',
											details:	err
											});
							}
					}
		    }
	
	    return 	{
	        	afterSubmit: calculateTaxesAS
	    		};
	    
	});
