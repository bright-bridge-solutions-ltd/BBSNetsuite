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
    function adyenRefundAS(scriptContext) 
	    {
    		//
    		//Function to refund a payment via adyen when a cash refund has been created from a cash sale
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
			    						
			   						//Get the NS transaction id of the refund
			   						//
			   						var refundTransactionId = search.lookupFields({type:		recordType,
																					id:			recordId,
																					columns:	'tranid'
																					})['tranid'];
			   						
			   						//Get the value of the cash refund
			   						//
			   						var refundValue 	= (Number(newRecord.getValue({fieldId: 'total'})) * 100.00).toFixed(0);
			   						var refundCurrency 	= newRecord.getValue({fieldId: 'currency'});
			    					
			   						if(createdFrom != null && createdFrom != '')
			   							{
			   								//Read the value of the adyen transaction id from the 'created from' transaction (cash sale)
			   								//
			   								var adyenTransactionId = search.lookupFields({
			   																				type:		search.Type.CASH_SALE,
			   																				id:			createdFrom,
			   																				columns:	adyenTransactionField
			   																				})[adyenTransactionField];	
			    								
			   								//Do we have a adyen transaction id?
			   								//
			   								if(adyenTransactionId != null && adyenTransactionId != '')
			   									{
			    									var adyenRefundDetailsObj 	= null;
			    									var adyenCaptureDetailsObj	= null;
			    									var refundAmount			= {};
			    									
			    									refundAmount.value			= Number(0);
			    									refundAmount.currency 		= '';
	
			    									refundAmount.currency	= getISOCode(refundCurrency);
					    							refundAmount.value		= refundValue;
					    									
					   								//Refund the payment
					   								//
					   								adyenRefundDetailsObj = adyenPlugin.refundPayment(adyenTransactionId, refundTransactionId, refundAmount);
					    														
					   								//Returned ok?
					   								//
					   								if(adyenRefundDetailsObj.httpResponseCode == '201')
					   									{
					   										var refundStatus 	= adyenRefundDetailsObj.apiResponse.status;
					   										var refundId		= adyenRefundDetailsObj.apiResponse.id;
					    															
					   												//Did the refund complete ok?
					   												//
					   												if(refundStatus == 'COMPLETED')
					   													{
					   														//Save the refund transaction id to the refund record
					   														//
					    													try
																				{
																					var fieldValues 					= {};
																					fieldValues[adyenTransactionField] = refundId;
																					fieldValues[adyenMessageField] 	= refundStatus;
																										
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
																					log.error({title: "Error updating cash refund id = " + recordId, details: err});
																				}
					   													}
					   												else
					   													{
					   														//Need to log an error as the refund failed
					   														//
									    									try
																				{
																					var fieldValues 				= {};
																					fieldValues[adyenMessageField] = JSON.stringify(adyenRefundDetailsObj.apiResponse);
																										
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
																					log.error({title: "Error updating cash refund id = " + recordId, details: err});
																				}
					   													}			
					   											}
					   										else
					   											{
						   											//Need to log an error as the get of the capture details failed
			   														//
							    									try
																		{
																			var fieldValues 				= {};
																			fieldValues[adyenMessageField] = JSON.stringify(adyenRefundDetailsObj);
																								
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
																			log.error({title: "Error updating cash refund id = " + recordId, details: err});
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
    		afterSubmit: 	adyenRefundAS
    		};
    
});
