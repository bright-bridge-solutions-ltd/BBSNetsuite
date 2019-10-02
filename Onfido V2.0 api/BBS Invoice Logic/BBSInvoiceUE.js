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
				    						
				    						//Read the contract record to see who we send the email version of the pdf to
				    						//
				    						var emailAddress = '';
				    						
				    						var billingLevel = search.lookupFields({
													    				            type: 'customrecord_bbs_contract',
													    				            id: thisContractId,
													    				            columns: ['custrecord_bbs_contract_billing_level']
													    				        })['custrecord_bbs_contract_billing_level'][0].value;
				    						
				    						if(billingLevel == 1)	//Parent level
				    							{
				    								//Find the parent id
				    								//
					    							var parentCustomerId = search.lookupFields({
																    				            type: search.Type.CUSTOMER,
																    				            id: thisCustomerId,
																    				            columns: ['parent']
																    				        })['parent'][0].value;
					    							
					    							//If we have a parent set on the customer, then find the email address from that parent
					    							//
					    							if(parentCustomerId != null && parentCustomerId != '')
					    								{
					    									emailAddress = search.lookupFields({
																    				            type: search.Type.CUSTOMER,
																    				            id: parentCustomerId,
																    				            columns: ['custentity_bbs_invoice_email']
																    				        })['custentity_bbs_invoice_email'];
					    								}
					    						}
				    						else	//Child level
				    							{
					    							emailAddress = search.lookupFields({
														    				            type: search.Type.CUSTOMER,
														    				            id: thisCustomerId,
														    				            columns: ['custentity_bbs_invoice_email']
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
				    								
				    								if(mergeResult != null)
					    								{
					    									var emailSubject = mergeResult.subject;
					    									var emailBody = mergeResult.body;
					    									
					    									try
																{
					    											email.send({
					    														author: 		runtime.getCurrentUser().id,
					    														recipients:		emailAddress,
					    														subject:		emailSubject,
					    														body:			emailBody,
					    														attachments:	emailAttachments
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
		
							//See if we have this product in the summary yet
							//
							if(!summary[itemId])
								{
									//Add it to the summary
									summary[itemId] = new itemSummaryInfo(itemId, itemDescription, itemUnitPrice, itemQuantity, itemAmount, itemVatAmount);
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
			    	try
			    		{
			    			record.submitFields({
			    				type: thisRecord.type,
			    				id: thisRecord.id,
			    				values: {
			    					custbody_bbs_json_summary: JSON.stringify(summary)
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
  function itemSummaryInfo(_itemid, _salesdescription, _unitPrice, _quantity, _amount, _vatAmount)
	  {
	  	//Properties
	  	//
	  	this.itemId 				= _itemid;
	  	this.salesDescription 		= _salesdescription;
	  	this.unitPrice 				= Number(_unitPrice);
	  	this.quantity 				= Number(_amount);
	  	this.amount 				= Number(_amount);
	  	this.vatAmount				= Number(_vatAmount);
	
	  }

  
  
  
  
    return {afterSubmit: invoiceAS};
    
});
