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
    function paypalCaptureAS(scriptContext) 
	    {
    		//
    		//Function to capture (collect) a payment from PayPal when a cash sale has been created
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
			    						
			   						//Get the NS transaction id of the cash sale
			   						//
			   						var cashSaleTransactionId = newRecord.getValue({fieldId: 'tranid'});
			    						
			   						if(createdFrom != null && createdFrom != '')
			   							{
			   								//Read the value of the paypal transaction id from the 'created from' transaction (sales order)
			   								//
			   								var paypalTransactionId = search.lookupFields({
			   																				type:		search.Type.SALES_ORDER,
			   																				id:			createdFrom,
			   																				columns:	paypalTransactionField
			   																				})[paypalTransactionField];	
			    								
			   								//Do we have a paypal transaction id?
			   								//
			   								if(paypalTransactionId != null && paypalTransactionId != '')
			   									{
			    									var paypalAuthorisationDetailsObj 	= null;
			    									var paypalCaptureDetailsObj 		= null;
			    									var paypalReauthorisationDetailsObj = null;
			    									var authorisationStatus 			= null;
	    											var authorisationAmount				= null;
	    												
			   										//Get the details of the authorised payment to see if it is still authorised
			   										//
			   										paypalAuthorisationDetailsObj = paypalPlugin.getPaymnentDetails(paypalTransactionId);
			    										
			   										//Was the call to paypal ok?
			   										//
			   										if(paypalAuthorisationDetailsObj.httpResponseCode == '200')
			   											{
			   												//Get the status & the amount
			   												//
			   												authorisationStatus = paypalAuthorisationDetailsObj.apiResponse.status;
			   												authorisationAmount	= paypalAuthorisationDetailsObj.apiResponse.amount;		//amount is an object 
			    												
			   												//If the authorisation has expired we will have to re-authorise
			   												//
			   												if(authorisationStatus == 'EXPIRED')
			   													{
			   														//Re-authorise
			   														//
			   														paypalReauthorisationDetailsObj = paypalPlugin.reauthorisePayment(paypalTransactionId, authorisationAmount);
			    														
			   														//Returned ok?
			   														//
			   														if(paypalReauthorisationDetailsObj.httpResponseCode == '200')
			   															{
			   																//Get the new transaction id from the re-authorise request, if the request was ok
			   																//
			   																if(paypalReauthorisationDetailsObj.apiResponse.status == 'CREATED')
			   																	{
			   																		paypalTransactionId = paypalReauthorisationDetailsObj.apiResponse.id;
			   																	}
			   															}
			    														
			   														//Re-get the authorisation details, if the re-authorisation failed, the this call will still use the old transaction id & the status will still be the same as before
			   														//
			   														paypalAuthorisationDetailsObj 	= paypalPlugin.getPaymnentDetails(paypalTransactionId);
			   														authorisationStatus 			= paypalAuthorisationDetailsObj.apiResponse.status;
				    												authorisationAmount				= paypalAuthorisationDetailsObj.apiResponse.amount;		//amount is an object 
			   													}
			    												
			   												//Is the authorisation status ok to proceed?
			   												//
			   												if(authorisationStatus == 'CREATED')
			   													{
			   														//Capture the payment
			   														//
			   														paypalCaptureDetailsObj = paypalPlugin.capturePayment(paypalTransactionId, cashSaleTransactionId, authorisationAmount);
			    														
			   														//Returned ok?
			   														//
			   														if(paypalCaptureDetailsObj.httpResponseCode == '200')
			   															{
			   																var captureStatus 	= paypalCaptureDetailsObj.apiResponse.status;
			   																var captureId		= paypalCaptureDetailsObj.apiResponse.id;
			    															
			   																//Did the capture complete ok?
			   																//
			   																if(captureStatus == 'COMPLETED')
			   																	{
			   																		//Save the capture transaction id to the cash sale record
			   																		//
			    																	try
																						{
																							var fieldValues 					= {};
																							fieldValues[paypalTransactionField] = captureId;
																							fieldValues[paypalMessageField] 	= '';
																								
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
																							fieldValues[paypalMessageField] = JSON.stringify(paypalCaptureDetailsObj.apiResponse);
																								
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
				    														//Need to log an error as we failed to call paypal to capture the payment
					    													//
			    															try
			    																{
			    																	var fieldValues = {};
			    																	fieldValues[paypalMessageField] = paypalCaptureDetailsObj.responseMessage;
			    																		
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
			    													//Need to log an error as the payment is not available to capture
			    													//
				    												try
																		{
																			var fieldValues = {};
																			fieldValues[paypalMessageField] = JSON.stringify(paypalAuthorisationDetailsObj.apiResponse);
																			
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
			    											//Need to log an error - as we failed to call paypal to get the authorisation details
    														//
				    										try
																{
																	var fieldValues = {};
																	fieldValues[paypalMessageField] = paypalAuthorisationDetailsObj.responseMessage;
																		
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

    
    return 	{
    		afterSubmit: 	paypalCaptureAS
    		};
    
});
