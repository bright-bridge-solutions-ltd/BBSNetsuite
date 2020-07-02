/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
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
															type: 'customscript_bbstfc_plugin',
															});
				//Call the plugin
				//
				if(tfcPlugin != null)
					{
						try
							{
								// get the current record and required info to populate request
								var currentRecord 		= 	scriptContext.newRecord;
								var currentRecordType	=	currentRecord.type;
								var currentRecordID		=	currentRecord.id;
								var tranID				=	currentRecord.getValue({fieldId: 'tranid'});
								var tranDate			=	currentRecord.getValue({fieldId: 'trandate'});
								var createdFrom			=	currentRecord.getValue({fieldId: 'createdfrom'});
								var customerID			=	currentRecord.getValue({fieldId: 'entity'});
								var currency			=	currentRecord.getValue({fieldId: 'currency'});
								var siteID				=	currentRecord.getValue({fieldId: 'custbody_bbs_site_name'});
								var subsidiaryID		=	currentRecord.getValue({fieldId: 'subsidiary'});
								var billToPCode			=	currentRecord.getSubrecord({fieldId: 'billingaddress'}).getValue({fieldId: 'custrecord_bbstfc_address_pcode'});
								var lineCount			=	currentRecord.getLineCount({sublistId: 'item'});
								
								// if this is this a credit memo, cashrefund or returnauthorization
								if (currentRecordType == 'creditmemo' || currentRecordType == 'cashrefund' || currentRecordType == 'returnauthorization')
									{
										// set adjustment variable to true
										var adjustment = true;
										
										// check the record is not a standalone transaction
										if (createdFrom)
											{
												// call function to return/lookup the transaction date on the related transaction
												tranDate = libraryModule.getCreatedFromTransactionInfo(createdFrom);	
											}
									}
								else
									{
										// set adjustment variable to false
										var adjustment = false;	
									}
								
								// call function to return/lookup fields on the customer record
								var customerLookup 	= 	libraryModule.getCustomerInfo(customerID);
								var customerName	=	customerLookup[0];
								var customerType	=	customerLookup[1];
								var salesType		=	customerLookup[2];
								var lifeline		=	customerLookup[3];
								
								// call function to return/lookup fields on the subsidiary record
								var subsidiaryPCode	= libraryModule.getSubsidiaryPCode(subsidiaryID);
								
								// call function to return/lookup fields on the site record
								var shipToPCode	= libraryModule.getSitePCode(siteID);
								
								// call function to return any exemptions for the customer
								var customerExemptions = libraryModule.getCustomerExemptions(customerID, tranDate, shipToPCode);
								
								// call function to return/lookup fields on the currency record
								var ISOCode = libraryModule.getISOCode(currency);
								
								// get the configuration
								var configuration = tfcPlugin.getTFCConfiguration();
								
								//Construct a tax request
								//
								var taxReqObj = new libraryModule.libCalcTaxesRequestObj();
								
								// have we got a configuration object
								if (configuration != null)
									{
										//Fill in the request config & company data properties
										//
										taxReqObj.cfg.retnb 	= 	configuration.nonBillableTaxes;
										taxReqObj.cfg.retext	=	configuration.extendedTaxInfo;
										taxReqObj.cfg.incrf		=	configuration.reportingInfo;
										taxReqObj.cmpn.bscl		=	configuration.businessClass;
										taxReqObj.cmpn.svcl		=	configuration.serviceClass;
										taxReqObj.cmpn.fclt		=	configuration.ownFacilities;
										taxReqObj.cmpn.frch		=	configuration.franchise;
										taxReqObj.cmpn.reg		=	configuration.regulated;
								
										//Create a new invoice line object
										//
								        var taxReqInvObj = new libraryModule.libInvoicesObj();
								        
								        //Fill in the invoice line object properties (details about the invoice/sales order we are processing)
										//
										taxReqInvObj.doc			=	currentRecordID;
										taxReqInvObj.cmmt			=	false; // do not commit straight away
										taxReqInvObj.bill.pcd		=	billToPCode;
										taxReqInvObj.cust			=	customerType;
										taxReqInvObj.lfln			=	lifeline;
										taxReqInvObj.date			=	tranDate;
										taxReqInvObj.exms			=	customerExemptions;
										taxReqInvObj.invoiceMode	=	false; // line Items are unrelated
										taxReqInvObj.dtl			=	true; // return Line Item level tax results
										taxReqInvObj.summ			=	true; // return summarized tax results
										taxReqInvObj.acct			=	customerName;
										taxReqInvObj.custref		=	customerName;
										taxReqInvObj.invn			=	tranID;
										taxReqInvObj.bcyc			=	tranDate.getMonth()+1;
										taxReqInvObj.bpd.month		=	tranDate.getMonth()+1;
										taxReqInvObj.bpd.year		=	tranDate.getFullYear();
										taxReqInvObj.ccycd			=	ISOCode;
										
										//Loop through each item line to process
										//
										//
										for (var i = 0; i < lineCount; i++)
											{
										        // retrieve line item values
												var itemID		=	currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
												var itemType	=	currentRecord.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
												var itemRate	=	currentRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
												var quantity	=	currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
												
												// call function to return/lookup fields on the item record
												var itemLookup 			= 	libraryModule.getTransactionServicePair(itemType, itemID);
												var transactionType		=	itemLookup[0];
												var serviceType			=	itemLookup[1];
												
												// do we have a transaction/service pair
												if (transactionType)
													{
														//Create a new invoice item object
												        //
												        var taxReqItemObj = new libraryModule.libLineItemObj();
												      
												        //Fill in the invoice item object properties
														//
														taxReqItemObj.ref		=	i;
														taxReqItemObj.from.pcd	=	subsidiaryPCode;
														taxReqItemObj.to.pcd	=	shipToPCode;
														taxReqItemObj.chg		=	itemRate;
														taxReqItemObj.line		=	1;
														taxReqItemObj.loc		=	1;
														taxReqItemObj.min		=	0;
														taxReqItemObj.sale		=	salesType;
														taxReqItemObj.incl		=	false;
														taxReqItemObj.proadj	=	0;
														taxReqItemObj.tran		=	transactionType;
														taxReqItemObj.serv		=	serviceType;
														taxReqItemObj.dbt		=	false;
														taxReqItemObj.adj		=	adjustment;
														taxReqItemObj.adjm		=	0;
														taxReqItemObj.disc		=	0;
														taxReqItemObj.prop		=	0;
														taxReqItemObj.bill.pcd	=	billToPCode;
														taxReqItemObj.cust		=	customerType;
														taxReqItemObj.lfln		=	lifeline;
														taxReqItemObj.date		=	tranDate;
														taxReqItemObj.qty		=	quantity;
														taxReqItemObj.glref		=	i;
												        
												        //Add the item object to the invoice line object array
												        //
												        taxReqInvObj.itms.push(taxReqItemObj);
													}
											}
		
									    //End of loop
									    //
									      	
									    //Add the invoice line object to the request object
									    //
									    taxReqObj.inv.push(taxReqInvObj);
					
										//Finally, call the plugin method
										//
										var taxResult = tfcPlugin.getTaxCalculation(taxReqObj);
										
										// call function to create AFC Call Log records
										libraryModule.createAFCCallLogRecords(currentRecordID, taxReqObj, taxResult);
										
										//Check the result of the call to the plugin
										//
										if(taxResult != null && taxResult.httpResponseCode == '200')
											{
												// call function to delete existing Calculated Taxes records
												libraryModule.deleteCalculatedTaxes(currentRecordID);
											
												// get the API response body
												var taxResultDetails = taxResult.apiResponse;
												
												// get the invoices
												var invoices = taxResultDetails['inv'];
														
												// loop through invoices
												for (var i = 0; i < invoices.length; i++)
													{
														// declare and initialize variables
														var totalTaxes = 0;
														var linesToUpdate = new Array();
														var errorMessages = '';
													
														// get the internal ID of the invoice
														var invoiceID = invoices[i].doc;
																
														// get the errors
														var errors = invoices[i]['err'];
																
														// have we got any errors?
														if (errors)
															{
																// process errors
																for (var int2 = 0; int2 < errors.length; int2++)
																	{
																		log.error({
																			title: 'Error Returned by Avalara',
																			details: errors[int2].msg
																		});
																		
																		// add the error to the errorMessages string
																		errorMessages += errors[int2].msg;
																		errorMessages += '<br>';
																	}
															}
														
															// get the items
															var items = invoices[i]['itms'];
															
															// do we have any items
															if (items)
																{
																	// loop through items
																	for (var y = 0; y < items.length; y++)
																		{
																			// get the errors
																			var errors = items[y]['err'];
																				
																			// have we got any errors
																			if (errors)
																				{
																					// process errors
																					for (var int3 = 0; int3 < errors.length; int3++)
																						{
																							log.error({
																								title: 'Error Returned by Avalara',
																								details: errors[int3].msg
																							});
																								
																							// add the error to the errorMessages string
																							errorMessages += errors[int3].msg;
																							errorMessages += '<br>';
																						}
																				}
																			else
																				{
																					// get the line number
																					var lineNumber = items[y].ref;
																			
																					// push the line number to the linesToUpdate array
																					linesToUpdate.push(lineNumber);	
																						
																					// get the taxes
																					var taxes = items[y]['txs'];
																						
																					// loop through taxes
																					for (var z = 0; z < taxes.length; z++)
																						{
																							// add the tax amount to the totalTaxes variable
																							totalTaxes += parseFloat(taxes[z].tax);
																							
																							// call function to create a new Calculated Taxes record
																							libraryModule.createCalculatedTaxes(invoiceID, lineNumber, taxes[z]);
																						}
																				}
																		}
																}
														
														// call function to update the tax total on the record
														libraryModule.updateTaxTotal(currentRecordType, currentRecordID, linesToUpdate, errorMessages, totalTaxes);

													}
												
											}
									}
							}
						catch(err)
							{
								log.error({
									title:	'Error calling plugin',
									details:	err
								});
							}
					}
		    }
	
	    return 	{
					afterSubmit: calculateTaxesAS
	    		};
	    
	});
