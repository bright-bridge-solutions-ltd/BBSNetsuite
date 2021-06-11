/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/https', 'N/record', 'N/search', 'N/plugin'],
/**
 * @param {https} https
 * @param {record} record
 * @param {search} search
 */
function(https, record, search, plugin) 
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
    function adyenCaptureAS(scriptContext) 
	    {
    		//
    		//Function to capture (collect) a payment from adyen when a cash sale has been created
    		//
    		if(scriptContext.type == 'create')
    			{
	    			var newRecord	= scriptContext.newRecord;
    				var recordId	= newRecord.id;
    				var recordType	= newRecord.type;
					
			    	//Load up the adyen plugin
			    	//
			    	var adyenPlugin = null;
			    							
			    	try
			    		{
				    		var adyenPlugin = plugin.loadImplementation({type: 'customscript_bbs_adyen_plugin'});
			    		}
			    	catch(err)
			    		{
			    			log.error({title: 'Error in adyen plugin', details: err});
			    			adyenPlugin = null;
			    		}
			    							
			   		//Plugin loaded ok?
			   		//
			   		if(adyenPlugin != null)
						{
			   				//Load the config
			   				//
			   				var adyenConfigObj = adyenPlugin.getConfiguration();
		
			   				//Did we get the config ok?
			   				//
			   				if(adyenConfigObj != null)
			   					{
			   						//Get the transaction body field that holds the adyen transaction id
			   						//
			   						var adyenTransactionField 	= adyenConfigObj.fieldTransactionId;
			   						var adyenMessageField 		= adyenConfigObj.fieldMessage;
			    						
			   						//Get the created from field contents from the cash sale
			   						//
			   						var createdFrom = newRecord.getValue({fieldId: 'createdfrom'});
			    						
			   						//Get the NS transaction id of the cash sale
			   						//
			   						var cashSaleTransactionId = search.lookupFields({type:		recordType,
			   																		id:			recordId,
			   																		columns:	'tranid'
			   																		})['tranid'];
			    					
			   						//Get the value & currency of the cash sale
			   						//
			   						var cashSaleValue 		= (Number(newRecord.getValue({fieldId: 'total'})) * 100.00).toFixed(0);
			   						var cashSaleCurrency 	= newRecord.getValue({fieldId: 'currency'});
			    					
			   						if(createdFrom != null && createdFrom != '')
			   							{
			   								//Read the value of the adyen transaction id from the 'created from' transaction (sales order)
			   								//
			   								var adyenTransactionId = search.lookupFields({
			   																				type:		search.Type.SALES_ORDER,
			   																				id:			createdFrom,
			   																				columns:	adyenTransactionField
			   																				})[adyenTransactionField];	
			    								
			   								//Do we have an adyen transaction id?
			   								//
			   								if(adyenTransactionId != null && adyenTransactionId != '')
			   									{
			    									var adyenCaptureDetailsObj 		= null;
			    									var authorisationAmount			= {};
			    									
			    									authorisationAmount.value		= Number(0);
			    									authorisationAmount.currency 	= '';
			    									
			   										//Override the amount to claim
			   										//
			   										authorisationAmount.value 		= cashSaleValue;
			   										authorisationAmount.currency	= getISOCode(cashSaleCurrency) ;
			   										
			   										//Capture the payment
			   										//
			   										adyenCaptureDetailsObj = adyenPlugin.capturePayment(adyenTransactionId, cashSaleTransactionId, authorisationAmount);
			    														
			   										//Returned ok?
			   										//
			   										if(adyenCaptureDetailsObj.httpResponseCode == '201')
			   											{
			   												var captureStatus 	= adyenCaptureDetailsObj.apiResponse.status;
			   												var captureId		= adyenCaptureDetailsObj.apiResponse.paymentPspReference;
			    															
			   												//Did the capture complete ok?
			   												//
			   												if(captureStatus == 'received')
			   													{
			   														//Save the capture transaction id to the cash sale record
			   														//
			    													try
																		{
																			var fieldValues 					= {};
																			fieldValues[adyenTransactionField] 	= captureId;
																			fieldValues[adyenMessageField] 		= captureStatus;
																								
																			record.submitFields({
																								type:					recordType,
																								id:						recordId,
																								values:					fieldValues,
																								enableSourcing:			false,
																								ignoreMandatoryFields:	true			
																								});
																		}
																	catch(err)
																		{
																			log.error({title: "Error updating cash sales id = " + recordId, details: err});
																		}
			   													}
			   												else
			   													{
			    													//Need to log an error as the capture failed
						    										//
							    									try
																		{
																			var fieldValues = {};
																			fieldValues[adyenMessageField] = JSON.stringify(adyenCaptureDetailsObj);
																								
																			record.submitFields({
																								type:					recordType,
																								id:						recordId,
																								values:					fieldValues,
																								enableSourcing:			false,
																								ignoreMandatoryFields:	true			
																								});
																		}
																	catch(err)
																		{
																			log.error({title: "Error updating cash sales id = " + recordId, details: err});
																		}
			   													}
			    																
			   											}
			    									else
			    										{
				    										//Need to log an error as we failed to call adyen to capture the payment
					    									//
			    											try
			    												{
			    													var fieldValues = {};
			    													fieldValues[adyenMessageField] = JSON.stringify(adyenCaptureDetailsObj);
			    																		
			    													record.submitFields({
			    																		type:					recordType,
			    																		id:						recordId,
			    																		values:					fieldValues,
			    																		enableSourcing:			false,
			    																		ignoreMandatoryFields:	true			
			    																		});
			    												}
			    											catch(err)
			    												{
			    													log.error({title: "Error updating cash sales id = " + recordId, details: err});
			    												}
			    										}
			    								}			
			    						}
    							}
    					}
    			}
	    }

    function getISOCode(currencyID) 
    	{
			var isoCurrencyCode = 'GBP';
			
			try
				{
					// get the ISO code from the currency record
					isoCurrencyCode = search.lookupFields({
															type: 		search.Type.CURRENCY,
															id: 		currencyID,
															columns: 	['symbol']
															}).symbol;
				}
			catch(err)
				{
					isoCurrencyCode = 'GBP';
				}
			
			return isoCurrencyCode;
    	}

    return 	{
    		afterSubmit: 	adyenCaptureAS
    		};
    
});
