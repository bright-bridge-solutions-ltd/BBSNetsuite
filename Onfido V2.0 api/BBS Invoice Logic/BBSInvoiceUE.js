/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/record', 'N/render', 'N/runtime', 'N/search', 'N/email'],
/**
 * @param {file} file
 * @param {record} record
 * @param {render} render
 * @param {runtime} runtime
 */
function(file, record, render, runtime, search, email) 
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
    function invoiceAS(scriptContext) 
	    {
    		//Get runtime parameters
    		//
    		var currentScript = runtime.getCurrentScript();
    		var attachmentsFolder = currentScript.getParameter({name: 'custscript_bbs_attachments_folder'});
    		var emailTemplate = currentScript.getParameter({name: 'custscript_bbs_email_template'});
    		var emailSender = currentScript.getParameter({name: 'custscript_bbs_invoice_email_sender'});
    		
    		var today = new Date();
    		
    		var newRecord = scriptContext.newRecord;
			var newRecordId = newRecord.id;
			var newRecordType = newRecord.type;
			
			//Update the record with the JSON summary of the products by unit price
			//
			updateTransactionSummary(newRecord);
			
			
    		//Have we got an attachments folder defined
    		//
    		if(attachmentsFolder != null && attachmentsFolder != '')
    			{
    				//We only want to work on create or edit
    				//
    				if(scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    					{
    						
    						var thisRecord = null;
    						
    						//Read in the invoice record
    						//
    						try 
    							{
    								thisRecord = record.load({type: newRecordType, id: newRecordId, isDynamic: true});
								} 
    						catch (error) 
    							{
    								thisRecord = null;
    							}
    						
    						//Do we have the invoice record
    						//
    						if(thisRecord != null)
		    					{
    								//Get data from the invoice record
    								//
		    						var thisContract = thisRecord.getText({fieldId: 'custbody_bbs_contract_record'});
		    						var thisContractId = thisRecord.getValue({fieldId: 'custbody_bbs_contract_record'});
		    						var thisCustomer = thisRecord.getText({fieldId: 'entity'});
		    						var thisCustomerId = thisRecord.getValue({fieldId: 'entity'});
		    						var thisInvoiceNumber = thisRecord.getText({fieldId: 'tranid'});
		    						
		    						//If we have the contract on the invoice, then go ahead
		    						//
		    						if(thisContract != null && thisContract != '')
		    							{
				    						var fileId = null;
				    						
				    						//Generate the pdf file
				    						//
				    						var transactionFile = render.transaction({
							    						    							entityId: newRecordId,
							    						    							printMode: render.PrintMode.PDF,
							    						    							inCustLocale: false
				    						    									});
				    						
				    						//Set the attachments folder
				    						//
				    						transactionFile.folder = attachmentsFolder;
				    						
				    						//Build up the file name & description
				    						//
				    						var recordName = '';
				    						
				    						switch(newRecordType)
				    							{
				    								case record.Type.INVOICE:
				    									recordName = 'Invoice';
				    									break;
				    									
				    								case record.Type.CREDIT_MEMO:
				    									recordName = 'Credit';
				    									break;
				    										
				    							}
				    						
				    						//Set the file name
				    						//
				    						transactionFile.name = recordName + '_' + thisContract + '_' + thisInvoiceNumber + '.pdf'
				    						
				    						//Make available without login
				    						//
				    						transactionFile.isOnline = true;
				    						
				    						//Set the file description
				    						//
				    						transactionFile.description = recordName + " # " + thisInvoiceNumber + " For Contract # " + thisContract;
				    						
				    						//Try to save the file to the filing cabinet
				    						//
				    						try
				    							{
				    								fileId = transactionFile.save();
				    							}
				    						catch(err)
				    							{
				    								log.error({
				    											title: 'Error Saving PDF To File Cabinet ' + attachmentsFolder,
				    											details: error
				    											});
				    								
				    								fileId = null;
				    							}
				    						
				    						//If we have saved the file ok, then we need to attach the pdf
				    						//
				    						if(fileId != null)
				    							{
				    								record.attach({
				    												record: {type: 'file', id: fileId},
				    												to: {type: 'customrecord_bbs_contract', id: thisContractId}
				    												});
				    							}
				    						
				    						//Read the contract record to see if consolidated invoicing is required
				    						//If no consolidation then we can email the invoice
				    						//
				    						var consolidationRequired = search.lookupFields({
													    				            type: 		'customrecord_bbs_contract',
													    				            id: 		thisContractId,
													    				            columns: 	['custrecord_bbs_contract_consol_inv']
													    				        	})['custrecord_bbs_contract_consol_inv'][0].value;
				    						
				    						if(consolidationRequired == '2')	//No, then email the invoice
				    							{
				    								//Read the contract record to see who we send the email version of the pdf to
					    							//
					    							var emailAddress = '';
						    						
						    						var billingLevel = search.lookupFields({
															    				            type: 		'customrecord_bbs_contract',
															    				            id: 		thisContractId,
															    				            columns: 	['custrecord_bbs_contract_billing_level']
															    				        	})['custrecord_bbs_contract_billing_level'][0].value;
						    						
						    						if(billingLevel == 1)	//Parent level
						    							{
							    							emailAddress = search.lookupFields({
																    				            type: 		search.Type.CUSTOMER,
																    				            id: 		thisCustomerId,
																    				            columns: 	['parentcustomer.custentity_bbs_invoice_email']
																    				        	})['parentcustomer.custentity_bbs_invoice_email'];
							    						}
						    						else	//Child level
						    							{
							    							emailAddress = search.lookupFields({
																    				            type: 		search.Type.CUSTOMER,
																    				            id: 		thisCustomerId,
																    				            columns: 	['custentity_bbs_invoice_email']
																    				        	})['custentity_bbs_invoice_email'];
						    							}
						    						
						    						//Have we actually got an email address?
						    						//
						    						if(emailAddress != null && emailAddress != '')
						    							{
						    								//Build up the attachments array
						    								//
						    								var emailAttachments = [];
						    								emailAttachments.push(file.load({id: fileId}));
						    							
						    								//Create an email merger
						    								//
						    								var mergeResult = render.mergeEmail({
														    								    templateId: emailTemplate,
														    								    customRecord: {
																	    								        type: 'customrecord_bbs_contract',
																	    								        id: Number(thisContractId)
																	    								        }
														    								    });
						    								
						    								//Was the merge ok?
						    								//
						    								if(mergeResult != null)
							    								{
						    										//Get the body & subject from the merge to pass on to the email
						    										//
							    									var emailSubject = mergeResult.subject;
							    									var emailBody = mergeResult.body;
							    									
							    									log.debug({
																	    title: 'customer id', 
																	    details: thisCustomerId
																	    });
							    									
							    									//Send the email
							    									//
							    									try
																		{
							    											email.send({
							    														author: 		emailSender,
							    														recipients:		emailAddress,
							    														subject:		emailSubject,
							    														body:			emailBody,
							    														attachments:	emailAttachments,
							    														relatedRecords: {
							    																		entityId:	thisCustomerId
							    																		}
							    														})		
																			
																		}
																	catch(err)
																		{
																			log.debug({
																					    title: 'Error sending email', 
																					    details: err.message
																					    });
																		}
							    								}
						    							}
				    							}
		    							}
		    					}
    					}
    			}
	    }

    //=========================================================================
    // FUNCTIONS
    //=========================================================================
    //
    function updateTransactionSummary(_thisRecord)
	    {
    		var summary = {};
    		
    		var newRecordId = _thisRecord.id;
			var newRecordType = _thisRecord.type;
			var thisRecord = null;
			
    		//Read in the invoice record
			//
			try 
				{
					thisRecord = record.load({type: newRecordType, id: newRecordId, isDynamic: true});
				} 
			catch (error) 
				{
					thisRecord = null;
				}
			
			if(thisRecord != null)
				{
		    		var itemLines = thisRecord.getLineCount({sublistId: 'item'});
		    		var currencyId = thisRecord.getValue({fieldId: 'currency'});
		    		var currencyRecord = null;
		    		var currencySymbol = '';
		    		
		    		try 
						{
		    				currencyRecord = record.load({type: record.Type.CURRENCY, id: currencyId, isDynamic: true});
						} 
					catch (error) 
						{
							currencyRecord = null;
						}
		    		
					if(currencyRecord != null)
						{
							currencySymbol = currencyRecord.getValue({fieldId: 'displaysymbol'});
						}
		    		
		    		//Loop through the item lines
			    	//
			    	for (var int = 0; int < itemLines; int++) 
				    	{
				    		var itemId = thisRecord.getSublistValue({
							    sublistId: 'item',
							    fieldId: 'item',
							    line: int
							});
		
							var itemDescription = thisRecord.getSublistText({
							    sublistId: 'item',
							    fieldId: 'item',
							    line: int
							});
		
							var itemUnitPrice = Number(thisRecord.getSublistValue({
							    sublistId: 'item',
							    fieldId: 'rate',
							    line: int
							}));
		
							var itemQuantity = Number(thisRecord.getSublistValue({
							    sublistId: 'item',
							    fieldId: 'quantity',
							    line: int
							}));
		
							var itemAmount = Number(thisRecord.getSublistValue({
							    sublistId: 'item',
							    fieldId: 'amount',
							    line: int
							}));
		
							var itemVatAmount = Number(thisRecord.getSublistValue({
							    sublistId: 'item',
							    fieldId: 'taxamount',
							    line: int
							}));
		
							var itemVatRate = Number(0);
							
							try
								{
									itemVatRate = thisRecord.getSublistValue({
									    sublistId: 'taxdetails',
									    fieldId: 'taxrate',
									    line: int
									});
								}
							catch(err)
								{
									itemVatRate = Number(0);
								}
							
							//See if we have this product in the summary yet
							//
							if(!summary[itemId])
								{
									//Add it to the summary
									summary[itemId] = new itemSummaryInfo(itemId, itemDescription, itemUnitPrice, itemQuantity, itemAmount, itemVatAmount, itemVatRate, currencySymbol);
								}
							else
								{
									//Update the summary
									//
									summary[itemId].quantity += itemQuantity;
									summary[itemId].amount += itemAmount;
									summary[itemId].vatAmount += itemVatAmount;
								}
						}
		    	
			    	//Update the record with the new summary info
			    	//
			    	var outputArray = [];
			    	for ( var summaryKey in summary) 
				    	{
			    			outputArray.push(summary[summaryKey]);
						}
			    	
			    	try
			    		{
			    			record.submitFields({
			    				type: thisRecord.type,
			    				id: thisRecord.id,
			    				values: {
			    					custbody_bbs_json_summary: JSON.stringify(outputArray)
			    				}
			    			})
			    		}
			    	catch(err)
			    		{
			    		
			    		}
				}
	    }
    
    
    //=============================================================================
    //Objects
    //=============================================================================
    //
    function itemSummaryInfo(_itemid, _salesdescription, _unitPrice, _quantity, _amount, _vatAmount, _itemVatRate, _currencySymbol)
	  	{
		  	//Properties
		  	//
		  	this.itemId 				= _itemid;
		  	this.salesDescription 		= _salesdescription;
		  	this.unitPrice 				= Number(_unitPrice);
		  	this.quantity 				= Number(_quantity);
		  	this.amount 				= Number(_amount);
		  	this.vatAmount				= Number(_vatAmount);
		  	this.vatRate				= _itemVatRate + '%';
		  	this.symbol					= _currencySymbol;
		  }

  
    //=============================================================================
    //Return function definition to NS
    //=============================================================================
	//
    return {afterSubmit: invoiceAS};
    
});
