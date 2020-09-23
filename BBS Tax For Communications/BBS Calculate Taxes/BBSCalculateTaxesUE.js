/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/runtime', 'N/record', 'N/search', './libraryModule', 'N/plugin'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, record, search, libraryModule, plugin)
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
								// get the current record
								var currentRecord 		= 	scriptContext.newRecord;
								var currentRecordType	=	currentRecord.type;
								var currentRecordID		=	currentRecord.id;
								
								// reload the transaction record
								var transactionRecord = record.load({type: currentRecordType, id: currentRecordID, isDynamic: true});
								
								// get the transaction status
								var transactionStatus = transactionRecord.getValue({fieldId: 'status'});
								
								// if the transactionStatus is not Closed
								if (transactionStatus != 'Closed')
									{
										// return values from the transaction record to gather required info to populate request
										var tranID				=	transactionRecord.getValue({fieldId: 'tranid'});
										var tranDate			=	transactionRecord.getValue({fieldId: 'trandate'});
										var createdFrom			=	transactionRecord.getValue({fieldId: 'createdfrom'});
										var customerID			=	transactionRecord.getValue({fieldId: 'entity'});
										var currency			=	transactionRecord.getValue({fieldId: 'currency'});
										var siteID				=	transactionRecord.getValue({fieldId: 'custbody_bbs_site_name'});
										var subsidiaryID		=	transactionRecord.getValue({fieldId: 'subsidiary'});
										var billToPCode			=	transactionRecord.getSubrecord({fieldId: 'billingaddress'}).getValue({fieldId: 'custrecord_bbstfc_address_pcode'});
										var lineCount			=	transactionRecord.getLineCount({sublistId: 'item'});
										
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
										
										// if this is an invoice
										if (currentRecordType == 'invoice')
											{
												// get the value of the commit taxes field from the transactionRecord object
												var commitTaxes	= transactionRecord.getValue({fieldId: 'custbody_bbs_tfc_commit_taxes'});
											}
										else
											{
												// set commitTaxes variable to false
												var commitTaxes = false;
											}
										
										// call function to return/lookup fields on the customer record
										var customerLookup 		= 	libraryModule.getCustomerInfo(customerID);
										var customerName		=	customerLookup[0];
										var customerType		=	customerLookup[1];
										var defaultSalesType	=	customerLookup[2];
										var lifeline			=	customerLookup[3];
										
										// call function to return/lookup fields on the subsidiary record
										var subsidiaryLookup			= libraryModule.getSubsidiaryInfo(subsidiaryID);
										var subsidiaryClientProfileID	= subsidiaryLookup[0];
										var subsidiaryPCode				= subsidiaryLookup[1];
										
										// call function to return/lookup fields on the site record
										//var shipToPCode	= libraryModule.getSiteInfo(siteID);
										var shipToPCode	= libraryModule.libGetDestinationPcode(transactionRecord);
										
										// call function to return any exemptions for the customer
										var customerExemptions = libraryModule.getCustomerExemptions(customerID, tranDate);
										
										// call function to return/lookup fields on the currency record
										var ISOCode = libraryModule.getISOCode(currency);
										
										// get the configuration
										var configuration = tfcPlugin.getTFCConfiguration();
										
										// if we have been unable to return the P Code from the subsidiary
										if (subsidiaryPCode == null || subsidiaryPCode == '')
											{
												// get the P Code from the configuration object
												subsidiaryPCode = configuration.pCode;
											}
										
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
												taxReqInvObj.cmmt			=	commitTaxes;
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
												
												if (commitTaxes == true)
													{
														taxReqInvObj.doc = currentRecordID;
													}
												else if (commitTaxes == false)
													{
														taxReqInvObj.doc = null;
													}
												
												//Loop through each item line to process
												//
												//
												for (var i = 0; i < lineCount; i++)
													{
												        // retrieve line item values
														var itemID				=	transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
														var itemType			=	transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
														var itemRate			=	transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
														var quantity			=	transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
														var salesType			=	transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_sales_type', line: i});
														var discountType		=	transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_discount_type', line: i});
														var privateLineSplit	=	transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_private_line_split', line: i});
														
														// do we have a salesType
														if (salesType)
															{
																// call function to return the AFC sales type code
																salesType = libraryModule.getSalesTypeCode(salesType);
															}
														else
															{
																// set the salesType variable using defaultSalesType
																salesType = defaultSalesType;
															}
														
														// do we have a discountType
														if (discountType)
															{
																// call function to return the AFC discount type code
																discountType = libraryModule.getDiscountTypeCode(discountType);
															}
														else
															{
																// set the discountType variable to 0 (None)
																discountType = 0;
															}
														
														// call function to return/lookup fields on the item record
														var itemLookup 			= 	libraryModule.getTransactionServicePair(itemType, itemID);
														var transactionType		=	itemLookup[0];
														var serviceType			=	itemLookup[1];
														
														// check we have a transaction/service pair
														if (transactionType != '' && serviceType != '')
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
																taxReqItemObj.line		=	quantity;
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
																taxReqItemObj.disc		=	discountType;
																taxReqItemObj.prop		=	0;
																taxReqItemObj.bill.pcd	=	billToPCode;
																taxReqItemObj.cust		=	customerType;
																taxReqItemObj.lfln		=	lifeline;
																taxReqItemObj.date		=	tranDate;
																taxReqItemObj.qty		=	1;
																taxReqItemObj.glref		=	i;
																
																// have we got a private line split
																if (privateLineSplit)
																	{
																		// fill in the private line splut property in the item object
																		taxReqItemObj.plsp = privateLineSplit;
																	}
														        
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
												var taxResult = tfcPlugin.getTaxCalculation(taxReqObj, subsidiaryClientProfileID);
												
												// call function to create AFC Call Log records
												libraryModule.createAFCCallLogRecords(currentRecordID, taxReqObj, taxResult);
												
												// call function to delete existing Calculated Taxes records
												libraryModule.deleteCalculatedTaxes(currentRecordID);
												
												// declare and initialize variables
												var totalTaxes = 0;
												var linesToUpdate = new Array();
												var errorMessages = '';
												var taxSummary = {};
												
												//Check the result of the call to the plugin
												//
												if(taxResult != null && taxResult.httpResponseCode == '200')
													{
														// call functions to return the tax categories, levels and types
														var taxCategories 	= libraryModule.getTaxCategories();
														var taxLevels		= libraryModule.getTaxLevels();
														var taxTypes		= libraryModule.getTaxTypes();
														
														// get the API response body
														var taxResultDetails = taxResult.apiResponse;
														
														// get the invoices
														var invoices = taxResultDetails['inv'];
																
														// loop through invoices
														for (var i = 0; i < invoices.length; i++)
															{
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
																								
																						// do we have any taxes
																						if (taxes)
																							{
																								// loop through taxes
																								for (var z = 0; z < taxes.length; z++)
																									{
																										// get the tax name, tax category, tax level, tax type and tax amount
																										var taxName		= 	taxes[z].name;
																										var taxCategory	=	libraryModule.getTaxCategory(taxCategories, taxes[z].cid);
																										var taxLevel	=	libraryModule.getTaxLevel(taxLevels, taxes[z].lvl);
																										var taxType		=	libraryModule.getTaxType(taxTypes, taxes[z].tid);
																										var taxAmount	= 	parseFloat(taxes[z].tax);
																												
																										// build up the key for the summary
																										// taxName + taxLevel
																										var key = libraryModule.padding_left(taxName, '0', 6) + 
																										libraryModule.padding_left(taxLevel.name, '0', 6);
																												
																										// does the taxName exist in the tax summary, if not create a new entry
																										if (!taxSummary[key])
																											{
																												taxSummary[key] = new libraryModule.libTaxSummaryObj(taxName, taxLevel.name);
																											}
																													
																										// update the tax amount in the summary
																										taxSummary[key].taxAmount += taxAmount;
																												
																										// now we have done all summarising, we need to generate the output format
																										var outputArray = null;
																										outputArray = [];
					
																										// sort outputSummary
																										const sortedSummary = {};
																								                  
																										for (key in sortedSummary)
																											{
																												delete sortedSummary[key]
																											}
																											      
																										Object.keys(taxSummary).sort().forEach(function(key) {
																											sortedSummary[key] = taxSummary[key];
																										});
																											      
																										// loop through the summaries
																										for (var key in sortedSummary)
																											{
																												// push a new instance of the output summary object onto the output array
																												outputArray.push(new libraryModule.libOutputSummary(
																																										taxSummary[key].taxName,
																																										taxSummary[key].taxLevel,
																																										taxSummary[key].taxAmount
																																									)
																																);
																											}
																										
																										// add the tax amount to the totalTaxes variable
																										totalTaxes += taxAmount;
																												
																										// call function to create a new Calculated Taxes record
																										libraryModule.createCalculatedTaxes(currentRecordID, lineNumber, taxes[z], taxCategory.internalID, taxLevel.internalID, taxType.internalID);
																									}
																							}
																					}
																			}
																	}
														}
													
												}
											else
												{	
													// add the response code and api response to the error messages
													errorMessages += 'httpResponseCode: ' + taxResult.httpResponseCode;
													errorMessages += '<br>';
													errorMessages += 'responseMessage: ' + taxResult.responseMessage;
												}
												
											// call function to update the tax total on the record
											libraryModule.updateTaxTotal(currentRecordType, currentRecordID, linesToUpdate, errorMessages, outputArray, totalTaxes);	
												
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
