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
    function paypalRefundAS(scriptContext) 
	    {
    		//
    		//Function to refund a payment via PayPal when a cash refund has been created from a cash sale
    		//
    		if(scriptContext.type == 'create')
    			{
	    			var newRecord	= scriptContext.newRecord;
    				var recordId	= newRecord.id;
    				var recordType	= newRecord.type;
					
			    	//Load up the paypal plugin
			    	//
			    	var paypalPlugin = null;
			    							
			    	try
			    		{
				    		var paypalPlugin = plugin.loadImplementation({type: 'customscript_bbs_paypal_plugin'});
			    		}
			    	catch(err)
			    		{
			    			log.error({title: 'Error in paypal plugin', details: err});
			    			paypalPlugin = null;
			    		}
			    							
			   		//Plugin loaded ok?
			   		//
			   		if(paypalPlugin != null)
						{
			   				//Load the config
			   				//
			   				var paypalConfigObj = paypalPlugin.getConfiguration();
		
			   				//Did we get the config ok?
			   				//
			   				if(paypalConfigObj != null)
			   					{
			   						//Get the transaction body field that holds the paypal transaction id
			   						//
			   						var paypalTransactionField 	= paypalConfigObj.fieldTransactionId;
			   						var paypalMessageField 		= paypalConfigObj.fieldMessage;
			    						
			   						//Get the created from field contents from the cash sale
			   						//
			   						var createdFrom = newRecord.getValue({fieldId: 'createdfrom'});
			    						
			   						//Get the NS transaction id of the refund
			   						//
			   						//var refundTransactionId = newRecord.getValue({fieldId: 'tranid'});
			   						var refundTransactionId = search.lookupFields({type:		recordType,
																					id:			recordId,
																					columns:	'tranid'
																					})['tranid'];
			   						
			   						//Get the value of the cash refund
			   						//
			   						var refundValue = Number(newRecord.getValue({fieldId: 'total'})).toFixed(2);
			    					
			   						if(createdFrom != null && createdFrom != '')
			   							{
			   								//Read the value of the paypal transaction id from the 'created from' transaction (cash sale)
			   								//
			   								var paypalTransactionId = search.lookupFields({
			   																				type:		search.Type.CASH_SALE,
			   																				id:			createdFrom,
			   																				columns:	paypalTransactionField
			   																				})[paypalTransactionField];	
			    								
			   								//Do we have a paypal transaction id?
			   								//
			   								if(paypalTransactionId != null && paypalTransactionId != '')
			   									{
			    									var paypalRefundDetailsObj 	= null;
			    									var paypalCaptureDetailsObj	= null;
			    									var refundAmount			= {};
	    												
			    									//Re-read the capture details to get the currency
			    									//
			    									paypalCaptureDetailsObj = paypalPlugin.getCaptureDetails(paypalTransactionId);
			    									
			    									//Returned ok?
			   										//
			   										if(paypalCaptureDetailsObj.httpResponseCode == '200')
					    								{
				   											var capturedAmountCurrency 	= paypalCaptureDetailsObj.apiResponse.amount.currency_code;
				   											var capturedAmountValue 	= paypalCaptureDetailsObj.apiResponse.amount.value;
				    									
					    									refundAmount.currency_code	= capturedAmountCurrency;
					    							//		refundAmount.value			= capturedAmountValue;
					    									refundAmount.value			= refundValue;
					    									
					   										//Refund the payment
					   										//
					   										paypalRefundDetailsObj = paypalPlugin.refundPayment(paypalTransactionId, refundTransactionId, refundAmount);
					    														
					   										//Returned ok?
					   										//
					   										if(paypalRefundDetailsObj.httpResponseCode == '201')
					   											{
					   												var refundStatus 	= paypalRefundDetailsObj.apiResponse.status;
					   												var refundId		= paypalRefundDetailsObj.apiResponse.id;
					    															
					   												//Did the refund complete ok?
					   												//
					   												if(refundStatus == 'COMPLETED')
					   													{
					   														//Save the refund transaction id to the refund record
					   														//
					    													try
																				{
																					var fieldValues 					= {};
																					fieldValues[paypalTransactionField] = refundId;
																					fieldValues[paypalMessageField] 	= refundStatus;
																										
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
																					fieldValues[paypalMessageField] = JSON.stringify(paypalRefundDetailsObj.apiResponse);
																										
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
																			fieldValues[paypalMessageField] = JSON.stringify(paypalRefundDetailsObj);
																								
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
																	fieldValues[paypalMessageField] = JSON.stringify(paypalCaptureDetailsObj);
																						
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

    
    return 	{
    		afterSubmit: 	paypalRefundAS
    		};
    
});
