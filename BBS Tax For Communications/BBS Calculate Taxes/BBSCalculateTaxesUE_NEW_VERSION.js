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
								var newRecord 			= 	scriptContext.newRecord;
								var oldRecord 			= 	scriptContext.oldRecord;
								var currentRecordType	=	newRecord.type;
								var currentRecordID		=	newRecord.id;
								var recordMode 			= 	scriptContext.type;
								
								//Work out what to do based on the record mode
								//
								switch(recordMode)
									{
										case scriptContext.UserEventType.CREATE:
											
											//Calculate the taxes based on the new record only
											//
											calculateTaxes(tfcPlugin, newRecord, currentRecordType, currentRecordID, false);	//Parameters are plugin, record to process, record type, record id, adjustment true/false
											
											break;
											
										case scriptContext.UserEventType.EDIT:
											
											//Calculate the taxes based on the old & new record
											//
											calculateTaxes(tfcPlugin, oldRecord, currentRecordType, currentRecordID, true);		
											calculateTaxes(tfcPlugin, newRecord, currentRecordType, currentRecordID, false);	
											
											break;
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
	
	    function calculateTaxes(tfcPlugin, _transactionRecord, _transactionRecordType, _transactionRecordId, _adjustmentFlag)
		    {
		    	// reload the transaction record
				// var transactionRecord = record.load({type: currentRecordType, id: currentRecordID, isDynamic: true});
				
				// get the transaction status
	    		//
				var transactionStatus = _transactionRecord.getValue({fieldId: 'status'});
				
				// if the transactionStatus is not Closed
				//
				if (transactionStatus != 'Closed')
					{
						// return values from the transaction record to gather required info to populate request
						//
						var tranID = search.lookupFields({
														type: 		_transactionRecordType,
														id: 		_transactionRecordId,
														columns: 	'tranid'
														})['tranid'];										//Get the document number as the record on a new transaction will have "To Be Generated" in the tranid field

						//var tranID				=	_transactionRecord.getValue({fieldId: 'tranid'});
						
						var tranDate			=	_transactionRecord.getValue({fieldId: 'trandate'});
						var createdFrom			=	_transactionRecord.getValue({fieldId: 'createdfrom'});
						var customerID			=	_transactionRecord.getValue({fieldId: 'entity'});
						var currency			=	_transactionRecord.getValue({fieldId: 'currency'});
						var subsidiaryID		=	_transactionRecord.getValue({fieldId: 'subsidiary'});
						var billToPCode			=	_transactionRecord.getSubrecord({fieldId: 'billingaddress'}).getValue({fieldId: 'custrecord_bbstfc_address_pcode'});
						var billToIncorporated	= 	_transactionRecord.getSubrecord({fieldId: 'billingaddress'}).getValue({fieldId: 'custrecord_bbstfc_incorporated'});
						var lineCount			=	_transactionRecord.getLineCount({sublistId: 'item'});
						
						// check the record is not a standalone transaction
						//
						if (createdFrom)
							{
								// call function to return/lookup the transaction date on the related transaction
								//
								tranDate = libraryModule.getCreatedFromTransactionInfo(createdFrom);	
							}

						//Work out how to set the adjustment flag based on the adjustment flag & the record type
						//
						var adjustment = null;
						
						switch(_adjustmentFlag)
							{
								case true:	//We want an adjustment
									
									switch(_transactionRecordType)
										{
											case record.Type.CREDIT_MEMO:
											case record.Type.CASH_REFUND:
											case record.Type.RETURN_AUTHORIZATION:
													
												adjustment = false;
												break;
													
											default:	//All other transaction types
													
												adjustment = true;
												break;
										}
										
									break;
									
								case false:	//No adjustment required
									
									switch(_transactionRecordType)
										{
											case record.Type.CREDIT_MEMO:
											case record.Type.CASH_REFUND:
											case record.Type.RETURN_AUTHORIZATION:
													
												adjustment = true;
												break;
													
											default:	//All other transaction types
													
												adjustment = false;
												break;
										}
									
									break;
							}
						
						
						// call function to return/lookup fields on the customer record
						//
						var customerLookup 		= 	libraryModule.getCustomerInfo(customerID);
						var customerName		=	customerLookup[0];
						var customerType		=	customerLookup[1];
						var defaultSalesType	=	customerLookup[2];
						var lifeline			=	customerLookup[3];
						
						// call function to return/lookup fields on the subsidiary record
						//
						var subsidiaryLookup			= libraryModule.getSubsidiaryInfo(subsidiaryID);
						var subsidiaryClientProfileID	= subsidiaryLookup[0];
						var subsidiaryPCode				= subsidiaryLookup[1];
						var subsidiaryIncorporated		= subsidiaryLookup[2];
						
						// call function to return/lookup fields on the address record
						//
						var addressData	= libraryModule.libGetDestinationPcode(_transactionRecord);
						
						// call function to return any exemptions for the customer
						//
						var customerExemptions = libraryModule.getCustomerExemptions(customerID, tranDate);
						
						// call function to return/lookup fields on the currency record
						//
						var ISOCode = libraryModule.getISOCode(currency);
						
						// get the configuration
						//
						var configuration = tfcPlugin.getTFCConfiguration(subsidiaryID);
						
						// if we have been unable to return the P Code from the subsidiary
						//
						if (subsidiaryPCode == null || subsidiaryPCode == '')
							{
								// get the P Code and incorporated flag from the configuration object
								//
								subsidiaryPCode 		= configuration.pCode;
								subsidiaryIncorporated 	= configuration.incorporated;
							}
						
						//Construct a tax request
						//
						var taxReqObj = new libraryModule.libCalcTaxesRequestObj();
						
						// have we got a configuration object
						//
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
						        
						        //Work out if we want to pass in the document number/commit the transaction or not
								//
						        var commitTaxes 	= null;
						        var documentNumber 	= null;
						        
								switch(_transactionRecordType)
									{
										case record.Type.SALES_ORDER:
										case record.Type.ESTIMATE:
										case record.Type.OPPORTUNITY:
										
											commitTaxes 	= false;
											documentNumber 	= null;
											
											break;
											
										default:
											
											commitTaxes 	= true;
											documentNumber 	= tranID;
											
											break;
									}
								
						        //Fill in the invoice line object properties (details about the invoice/sales order we are processing)
								//
								taxReqInvObj.cmmt			=	commitTaxes;
								taxReqInvObj.bill.pcd		=	addressData.pcode;
								taxReqInvObj.bill.int		= 	addressData.incorporated;
								taxReqInvObj.cust			=	customerType;
								taxReqInvObj.lfln			=	lifeline;
								taxReqInvObj.date			=	tranDate;
								taxReqInvObj.exms			=	customerExemptions;
								taxReqInvObj.invm			=	true; 
								taxReqInvObj.dtl			=	true; // return Line Item level tax results
								taxReqInvObj.summ			=	true; // return summarized tax results
								taxReqInvObj.acct			=	customerName;
								taxReqInvObj.custref		=	customerName;
								taxReqInvObj.invn			=	tranID;
								taxReqInvObj.bcyc			=	tranDate.getMonth() + 1;
								taxReqInvObj.bpd.month		=	tranDate.getMonth() + 1;
								taxReqInvObj.bpd.year		=	tranDate.getFullYear();
								taxReqInvObj.ccycd			=	ISOCode;
								taxReqInvObj.doc 			= 	documentNumber;
								
								
								//Loop through each item line to process
								//
								//
								for (var i = 0; i < lineCount; i++)
									{
								        // retrieve line item values
										//
										var itemID				=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
										var itemType			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
										var itemRate			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
										var quantity			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
										var salesType			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_sales_type', line: i});
										var discountType		=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_discount_type', line: i});
										var privateLineSplit	=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_private_line_split', line: i});
										
										// do we have a salesType
										//
										if (salesType)
											{
												// call function to return the AFC sales type code
												//
												salesType = libraryModule.getSalesTypeCode(salesType);
											}
										else
											{
												// set the salesType variable using defaultSalesType
												//
												salesType = defaultSalesType;
											}
										
										// do we have a discountType
										//
										if (discountType)
											{
												// call function to return the AFC discount type code
												//
												discountType = libraryModule.getDiscountTypeCode(discountType);
											}
										else
											{
												// set the discountType variable to 0 (None)
												//
												discountType = 0;
											}
										
										// call function to return/lookup fields on the item record
										//
										var itemLookup 			= 	libraryModule.getTransactionServicePair(itemType, itemID);
										var transactionType		=	itemLookup[0];
										var serviceType			=	itemLookup[1];
										
										// check we have a transaction/service pair
										//
										if (transactionType != '' && serviceType != '' && transactionType != null && serviceType != null)
											{
												//Create a new invoice item object
										        //
										        var taxReqItemObj = new libraryModule.libLineItemObj();
										      
										        //Fill in the invoice item object properties
												//
												taxReqItemObj.ref		=	i;
												taxReqItemObj.from.pcd	=	addressData.pcode;
												taxReqItemObj.from.int	= 	addressData.incorporated;
												taxReqItemObj.to.pcd	=	addressData.pcode;
												taxReqItemObj.to.int	=	addressData.incorporated;
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
												taxReqItemObj.bill.pcd	=	addressData.pcode;
												taxReqItemObj.bill.int	=	addressData.incorporated;
												taxReqItemObj.cust		=	customerType;
												taxReqItemObj.lfln		=	lifeline;
												taxReqItemObj.date		=	tranDate;
												taxReqItemObj.qty		=	1;
												taxReqItemObj.glref		=	i;
												
												// have we got a private line split
												//
												if (privateLineSplit)
													{
														// fill in the private line split property in the item object
														//
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
			
							    //Check to see if we are exceeding the maximum number of lines to process
							    //
							    if(taxReqObj.inv[0].itms.length > configuration.maxTaxLinesToProcess)
							    	{
							    		var linesExceededMsg = 'Number of lines to process has exceeded maximum allowed ' + taxReqObj.inv[0].itms.length + '/' + configuration.maxTaxLinesToProcess;
							    		
							    		//Report an error 
							    		//
								    	log.error({
													title: 	linesExceededMsg,
													details: ''
												});
								    	
								    	var totalTaxes 		= 0;
										var linesToUpdate 	= new Array();
										var errorMessages 	= '';
										var taxSummary 		= {};
										var outputArray 	= new Array();
										
										// call function to delete existing Calculated Taxes records
										//
										libraryModule.deleteCalculatedTaxes(_transactionRecordId);
										
										// call function to update the tax total on the record
										//
										libraryModule.updateTaxTotal(_transactionRecordType, _transactionRecordId, linesToUpdate, linesExceededMsg, outputArray, totalTaxes);
										
							    	}
							    else
							    	{
								    	// declare and initialize variables
										//
										var totalTaxes 		= 0;
										var linesToUpdate 	= new Array();
										var errorMessages 	= '';
										var taxSummary 		= {};
										var outputArray 	= new Array();
										
										//
							    		//LICENCE CHECK
							    		//
							    		var licenceResponse = libraryModule.doLicenceCheck();
							    		
							    		if(licenceResponse.status == 'OK')
							    			{
								    			//Call the plugin to get the taxes
												//
												var taxResult = tfcPlugin.getTaxCalculation(taxReqObj, subsidiaryClientProfileID);
												
												// call function to create AFC Call Log records
												//
												libraryModule.createAFCCallLogRecords(_transactionRecordId, taxReqObj, taxResult);
												
												// call function to delete existing Calculated Taxes records
												//
												libraryModule.deleteCalculatedTaxes(_transactionRecordId);
												
												
												//Check the result of the call to the plugin
												//
												if(taxResult != null && taxResult.httpResponseCode == '200')
													{
														// call functions to return the tax categories, levels and types
														//
														var taxCategories 	= libraryModule.getTaxCategories();
														var taxLevels		= libraryModule.getTaxLevels();
														var taxTypes		= libraryModule.getTaxTypes();
														
														// get the API response body
														//
														var taxResultDetails = taxResult.apiResponse;
														
														// get the invoices
														//
														var invoices = taxResultDetails['inv'];
																
														// loop through invoices
														//
														for (var i = 0; i < invoices.length; i++)
															{
																// get the errors
																//
																var errors = invoices[i]['err'];
																		
																// have we got any errors?
																//
																if (errors)
																	{
																		// process errors
																		//
																		for (var int2 = 0; int2 < errors.length; int2++)
																			{
																				log.error({
																					title: 'Error Returned by Avalara',
																					details: errors[int2].msg
																				});
																				
																				// add the error to the errorMessages string
																				//
																				errorMessages += errors[int2].msg;
																				errorMessages += '<br>';
																			}
																	}
																
																// get the tax summary
																//
																var taxes = invoices[i]['summ'];
																
																// do we have any taxes
																//
																if (taxes)
																	{
																		// loop through taxes
																		//
																		for (var int3 = 0; int3 < taxes.length; int3++)
																			{
																				// get the errors
																				//
																				var errors = taxes[int3]['err'];
																							
																				// have we got any errors
																				//
																				if (errors)
																					{
																						// process errors
																						//
																						for (var int4 = 0; int4 < errors.length; int4++)
																							{
																								log.error({
																									title: 'Error Returned by Avalara',
																									details: errors[int4].msg
																								});
																											
																								// add the error to the errorMessages string
																								//
																								errorMessages += errors[int4].msg;
																								errorMessages += '<br>';
																							}
																					}
																				else
																					{
																						// get the tax name, tax category, tax level, tax type and tax amount
																						//
																						var taxName		= 	taxes[int3].name;
																						var taxCategory	=	libraryModule.getTaxCategory(taxCategories, taxes[int3].cid);
																						var taxLevel	=	libraryModule.getTaxLevel(taxLevels, taxes[int3].lvl);
																						var taxType		=	libraryModule.getTaxType(taxTypes, taxes[int3].tid);
																						var taxAmount	= 	parseFloat(taxes[int3].tax);
																						
																						// build up the key for the summary
																						// taxName + taxLevel
																						var key = libraryModule.padding_left(taxName, '0', 6) + 
																						libraryModule.padding_left(taxLevel.name, '0', 6);
																								
																						// does the taxName exist in the tax summary, if not create a new entry
																						//
																						if (!taxSummary[key])
																							{
																								taxSummary[key] = new libraryModule.libTaxSummaryObj(taxName, taxLevel.name);
																							}
																									
																						// update the tax amount in the summary
																						//
																						taxSummary[key].taxAmount += taxAmount;
																						
																						// add the tax amount to the totalTaxes variable
																						//
																						totalTaxes += taxAmount;
																						
																						// call function to create a new Calculated Taxes record
																						//
																						libraryModule.createCalculatedTaxes(_transactionRecordId, null, taxes[int3], taxCategory.internalID, taxLevel.internalID, taxType.internalID);
																						
																					}
																			}
																	}
																else
																	{
																		// get the items
																		//
																		var items = invoices[i]['itms'];
																				
																		// do we have any items
																		//
																		if (items)
																			{
																				// loop through items
																				//
																				for (var int5 = 0; int5 < items.length; int5++)
																					{
																						// get the errors
																						//
																						var errors = items[int5]['err'];
																									
																						// have we got any errors
																						//
																						if (errors)
																							{
																								// process errors
																								//
																								for (var int6 = 0; int6 < errors.length; int6++)
																									{
																										log.error({
																											title: 'Error Returned by Avalara',
																											details: errors[int6].msg
																										});
																													
																										// add the error to the errorMessages string
																										//
																										errorMessages += errors[int6].msg;
																										errorMessages += '<br>';
																									}
																							}
																						else
																							{
																								// get the taxes
																								//
																								var taxes = items[int5]['txs'];
																										
																								// do we have any taxes
																								//
																								if (taxes)
																									{
																										// loop through taxes
																										//
																										for (var int7 = 0; int7 < taxes.length; int7++)
																											{
																												// get the tax name, tax category, tax level, tax type and tax amount
																												//
																												var taxName		= 	taxes[int7].name;
																												var taxCategory	=	libraryModule.getTaxCategory(taxCategories, taxes[int7].cid);
																												var taxLevel	=	libraryModule.getTaxLevel(taxLevels, taxes[int7].lvl);
																												var taxType		=	libraryModule.getTaxType(taxTypes, taxes[int7].tid);
																												var taxAmount	= 	parseFloat(taxes[int7].tax);
																														
																												// build up the key for the summary
																												// taxName + taxLevel
																												var key = libraryModule.padding_left(taxName, '0', 6) + 
																												libraryModule.padding_left(taxLevel.name, '0', 6);
																														
																												// does the taxName exist in the tax summary, if not create a new entry
																												//
																												if (!taxSummary[key])
																													{
																														taxSummary[key] = new libraryModule.libTaxSummaryObj(taxName, taxLevel.name);
																													}
																															
																												// update the tax amount in the summary
																												//
																												taxSummary[key].taxAmount += taxAmount;
																												
																												// add the tax amount to the totalTaxes variable
																												//
																												totalTaxes += taxAmount;
																														
																												// call function to create a new Calculated Taxes record
																												//
																												libraryModule.createCalculatedTaxes(_transactionRecordId, lineNumber, taxes[int7], taxCategory.internalID, taxLevel.internalID, taxType.internalID);
																											}
																									}
																							}
																					}
																			}
																	}
																
																// get the items
																//
																var items = invoices[i]['itms'];
																		
																// do we have any items
																//
																if (items)
																	{
																		// loop through items
																		//
																		for (var int8 = 0; int8 < items.length; int8++)
																			{
																				// get the errors
																				//
																				var errors = items[int8]['err'];
																							
																				// have we got NOT got any errors
																				//
																				if (!errors)
																					{
																						// get the line number
																						//
																						var lineNumber = items[int8].ref;
																						
																						// push the line number to the linesToUpdate array
																						//
																						linesToUpdate.push(lineNumber);	
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
							    			}
							    		else
							    			{
								    			errorMessages += 'Licence Check Status: ' + licenceResponse.status;
												errorMessages += '<br>';
												errorMessages += 'Licence Check Message: ' + licenceResponse.message;
							    			}
							    		
							    		/*
							    		 * now we have done all summarising, we need to generate the output format
							    		 */
										
										// sort outputSummary
										//
										var sortedSummary = {};
								                  
										for (key in sortedSummary)
											{
												delete sortedSummary[key]
											}
											      
										Object.keys(taxSummary).sort().forEach(function(key) {
											sortedSummary[key] = taxSummary[key];
										});
											      
										// loop through the summaries
										//
										for (var key in sortedSummary)
											{
												// push a new instance of the output summary object onto the output array
												//
												outputArray.push(new libraryModule.libOutputSummary(
																										taxSummary[key].taxName,
																										taxSummary[key].taxLevel,
																										taxSummary[key].taxAmount
																									));
											}

										// call function to update the tax total on the record
										libraryModule.updateTaxTotal(_transactionRecordType, _transactionRecordId, linesToUpdate, errorMessages, outputArray, totalTaxes);
							    	}
							}
					}
		    }
	    
	    return 	{
					afterSubmit: calculateTaxesAS
	    		};
	    
	});
