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
   
	//=============================================================================================
	//Prototypes
	//=============================================================================================
	//
	
	//Date & time formatting prototype 
	//
	(function() {

		Date.shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
		Date.longMonths = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
		Date.shortDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
		Date.longDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

		// defining patterns
		var replaceChars = {
		// Day
		d : function() {
			return (this.getDate() < 10 ? '0' : '') + this.getDate();
		},
		D : function() {
			return Date.shortDays[this.getDay()];
		},
		j : function() {
			return this.getDate();
		},
		l : function() {
			return Date.longDays[this.getDay()];
		},
		N : function() {
			return (this.getDay() == 0 ? 7 : this.getDay());
		},
		S : function() {
			return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
		},
		w : function() {
			return this.getDay();
		},
		z : function() {
			var d = new Date(this.getFullYear(), 0, 1);
			return Math.ceil((this - d) / 86400000);
		}, // Fixed now
		// Week
		W : function() {
			var target = new Date(this.valueOf());
			var dayNr = (this.getDay() + 6) % 7;
			target.setDate(target.getDate() - dayNr + 3);
			var firstThursday = target.valueOf();
			target.setMonth(0, 1);
			if (target.getDay() !== 4) {
				target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
			}
			var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

			return (retVal < 10 ? '0' + retVal : retVal);
		},
		// Month
		F : function() {
			return Date.longMonths[this.getMonth()];
		},
		m : function() {
			return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
		},
		M : function() {
			return Date.shortMonths[this.getMonth()];
		},
		n : function() {
			return this.getMonth() + 1;
		},
		t : function() {
			var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
			if (nextMonth === 12) {
				year = year++;
				nextMonth = 0;
			}
			return new Date(year, nextMonth, 0).getDate();
		},
		// Year
		L : function() {
			var year = this.getFullYear();
			return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
		}, // Fixed now
		o : function() {
			var d = new Date(this.valueOf());
			d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
			return d.getFullYear();
		}, //Fixed now
		Y : function() {
			return this.getFullYear();
		},
		y : function() {
			return ('' + this.getFullYear()).substr(2);
		},
		// Time
		a : function() {
			return this.getHours() < 12 ? 'am' : 'pm';
		},
		A : function() {
			return this.getHours() < 12 ? 'AM' : 'PM';
		},
		B : function() {
			return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
		}, // Fixed now
		g : function() {
			return this.getHours() % 12 || 12;
		},
		G : function() {
			return this.getHours();
		},
		h : function() {
			return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
		},
		H : function() {
			return (this.getHours() < 10 ? '0' : '') + this.getHours();
		},
		i : function() {
			return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
		},
		s : function() {
			return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
		},
		u : function() {
			var m = this.getMilliseconds();
			return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
		},
		// Timezone
		e : function() {
			return /\((.*)\)/.exec(new Date().toString())[1];
		},
		I : function() {
			var DST = null;
			for (var i = 0; i < 12; ++i) {
				var d = new Date(this.getFullYear(), i, 1);
				var offset = d.getTimezoneOffset();

				if (DST === null)
					DST = offset;
				else
					if (offset < DST) {
						DST = offset;
						break;
					}
					else
						if (offset > DST)
							break;
			}
			return (this.getTimezoneOffset() == DST) | 0;
		},
		O : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		},
		P : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		}, // Fixed now
		T : function() {
			return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
		},
		Z : function() {
			return -this.getTimezoneOffset() * 60;
		},
		// Full Date/Time
		c : function() {
			return this.format("Y-m-d\\TH:i:sP");
		}, // Fixed now
		r : function() {
			return this.toString();
		},
		U : function() {
			return this.getTime() / 1000;
		}
		};

		// Simulates PHP's date function
		Date.prototype.format = function(format) {
			var date = this;
			return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
				return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
			});
		};

	}).call(this);
	
	/**
     * Function definition to be triggered after record is saved.
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
    		var currentScript 		= runtime.getCurrentScript();
    		var attachmentsFolder 	= currentScript.getParameter({name: 'custscript_bbs_attachments_folder'});
    		var emailTemplate 		= currentScript.getParameter({name: 'custscript_bbs_email_template'});
    		var emailSender 		= currentScript.getParameter({name: 'custscript_bbs_invoice_email_sender'});
    		var today 				= new Date();
    		var newRecord 			= scriptContext.newRecord;
			var newRecordId 		= newRecord.id;
			var newRecordType 		= newRecord.type;
			
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
    								//Get data from the invoice record header
    								//
		    						var thisContract 		= thisRecord.getText({fieldId: 'custbody_bbs_contract_record'});
		    						var thisContractId 		= thisRecord.getValue({fieldId: 'custbody_bbs_contract_record'});
		    						var thisCustomer 		= thisRecord.getText({fieldId: 'entity'});
		    						var thisCustomerId 		= thisRecord.getValue({fieldId: 'entity'});
		    						var thisInvoiceNumber 	= thisRecord.getValue({fieldId: 'tranid'});
		    						var thisInvoiceDate 	= thisRecord.getValue({fieldId: 'trandate'}).format('d/m/Y');
		    						var thisInvoiceTotal 	= thisRecord.getValue({fieldId: 'total'});
		    						var thisInvoiceCurrency	= thisRecord.getText({fieldId: 'currency'});
		    						var thisSalesOrder 		= thisRecord.getValue({fieldId: 'createdfrom'});
		    						var doNotGenerateEmail 	= thisRecord.getValue({fieldId: 'custbody_bbs_do_not_auto_email'});
		    						var subsidiary 			= thisRecord.getValue({fieldId: 'subsidiary'});
		    				    	
		    				    	// if the subsidiary is 10 (Onfido India) and doNotGenerateEmail is false
		    				    	if (subsidiary == 10 && doNotGenerateEmail == false)
		    				    		{
		    					    		// get a count of lines in the 'Tax Details' sublist
		    				    			var taxLineCount = thisRecord.getLineCount({
		    				    				sublistId: 'taxdetails'
		    				    			});
		    				    			
		    				    			// is the tax details sublist empty?
		    				    			if (taxLineCount == 0)
		    				    				{
		    				    					// set doNotGenerateEmail checkbox to true
		    				    					doNotGenerateEmail = true;
		    				    				}
		    				    			else // tax details sublist is NOT empty
		    				    				{
			    				    				// set doNotGenerateEmail checkbox to false
		    				    					doNotGenerateEmail = false;
		    				    				}
		    				    		}
		    						
		    						//If doNotGenerateEmail is false
		    						//
		    						if(doNotGenerateEmail == false)
		    							{
				    						//If we have the contract on the invoice, then go ahead
				    						//
				    						if(thisContract != null && thisContract != '')
				    							{
				    								//Calculate the earliest & latest transaction dates from the item sublist
				    								//
				    								var startDate = null;
				    								var endDate = null;
				    								
				    								var lines = thisRecord.getLineCount({sublistId: 'item'});
				    								
				    								for (var int = 0; int < lines; int++) 
					    								{
															var searchDate = thisRecord.getSublistValue({
																										sublistId:		'item',
																										fieldId:		'custcol_bbs_so_search_date',
																										line:			int
																										});
															if(int == 0 && searchDate != null && searchDate != '')
																{
																	startDate 	= new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
																	endDate 	= new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
																}
															else
																{
																	if(searchDate != null && searchDate != '' && searchDate.getTime() < startDate.getTime())
																		{
																			startDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
																		}
																	
																	if(searchDate != null && searchDate != '' && searchDate.getTime() > endDate.getTime())
																		{
																			endDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
																		}
																}
														}
				    							
				    							
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
						    						var fileProperties = new filePropertiesObj(
						    								recordName + " # " + thisInvoiceNumber + " For Contract # " + thisContract, 
						    								(startDate == null ? '' : startDate.format('d/m/Y')), 
						    								(endDate == null ? '' : endDate.format('d/m/Y')), 
						    								thisInvoiceTotal, 
						    								thisInvoiceCurrency,
						    								thisInvoiceDate
						    								);
						    						
						    						transactionFile.description = JSON.stringify(fileProperties);
						    						//transactionFile.description = recordName + " # " + thisInvoiceNumber + " For Contract # " + thisContract;
						    						
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
						    								//Read the contract record to see who we send the email version of the PDF to
							    							//
							    							var emailAddress = '';
							    							var emailAddressCC1 = '';
							    							var emailAddressCC1 = '';
								    						
								    						var billingLevel = search.lookupFields({
																	    				            type: 		'customrecord_bbs_contract',
																	    				            id: 		thisContractId,
																	    				            columns: 	['custrecord_bbs_contract_billing_level']
																	    				        	})['custrecord_bbs_contract_billing_level'][0].value;
								    						
								    						// declare new array to hold CC email addresses
								    						var ccEmailAddresses = new Array();
								    						
								    						if(billingLevel == 1)	//Parent level
								    							{
									    							// get the parent from the customer
								    								var customerLookup = search.lookupFields({
									    								type: search.Type.CUSTOMER,
										    				            id: thisCustomerId,
										    				            columns: ['parent', 'custentity_bbs_invoice_email', 'custentity_bbs_invoice_email_cc_1', 'custentity_bbs_invoice_email_cc_2']
										    				        });
									    							
									    							// get the internal ID of the parent customer from the customerLookup
								    								var parentCustomerId = customerLookup.parent[0].value;
								    								
								    								// check that the parent customer is not this customer
								    								if (thisCustomerId != parentCustomerId)
								    									{
								    										// lookup fields on the parent customer
								    										var parentCustomerLookup = search.lookupFields({
											    								type: search.Type.CUSTOMER,
												    				            id: parentCustomerId,
												    				            columns: ['custentity_bbs_invoice_email', 'custentity_bbs_invoice_email_cc_1', 'custentity_bbs_invoice_email_cc_2']
												    				        });
								    										
								    										// get the customer email addresses from the parentCustomerLookup
								    										emailAddress = parentCustomerLookup.custentity_bbs_invoice_email;
								    										emailAddressCC1 = parentCustomerLookup.custentity_bbs_invoice_email_cc_1;
								    										emailAddressCC2 = parentCustomerLookup.custentity_bbs_invoice_email_cc_2;
								    										
								    										// check we have a CC1 email address
								    										if (emailAddressCC1)
								    											{
								    												// push the CC1 email address to the ccEmailAddresses array
								    												ccEmailAddresses.push(emailAddressCC1)
								    											}
								    										
								    										// check we have a CC2 email address
								    										if (emailAddressCC2)
								    											{
								    												// push the CC2 email address to the ccEmailAddresses array
								    												ccEmailAddresses.push(emailAddressCC2)
								    											}
								    									}
								    								else
								    									{
									    									// get the customer email addresses from the customerLookup
								    										emailAddress = customerLookup.custentity_bbs_invoice_email;
								    										emailAddressCC1 = customerLookup.custentity_bbs_invoice_email_cc_1;
								    										emailAddressCC2 = customerLookup.custentity_bbs_invoice_email_cc_2;
								    										
								    										// check we have a CC1 email address
								    										if (emailAddressCC1)
								    											{
								    												// push the CC1 email address to the ccEmailAddresses array
								    												ccEmailAddresses.push(emailAddressCC1)
								    											}
								    										
								    										// check we have a CC2 email address
								    										if (emailAddressCC2)
								    											{
								    												// push the CC2 email address to the ccEmailAddresses array
								    												ccEmailAddresses.push(emailAddressCC2)
								    											}
								    									}
			
									    						}
								    						else	//Child level
								    							{
									    							// lookup fields on the parent record
								    								var customerLookup = search.lookupFields({
								    									type: 		search.Type.CUSTOMER,
										    				            id: 		thisCustomerId,
										    				            columns: 	['custentity_bbs_invoice_email', 'custentity_bbs_invoice_email_cc_1', 'custentity_bbs_invoice_email_cc_2']
										    				        });
								    								
								    								// get the customer email addresses from the customerLookup
						    										emailAddress = customerLookup.custentity_bbs_invoice_email;
						    										emailAddressCC1 = customerLookup.custentity_bbs_invoice_email_cc_1;
						    										emailAddressCC2 = customerLookup.custentity_bbs_invoice_email_cc_2;
						    										
						    										// check we have a CC1 email address
						    										if (emailAddressCC1)
						    											{
						    												// push the CC1 email address to the ccEmailAddresses array
						    												ccEmailAddresses.push(emailAddressCC1)
						    											}
						    										
						    										// check we have a CC2 email address
						    										if (emailAddressCC2)
						    											{
						    												// push the CC2 email address to the ccEmailAddresses array
						    												ccEmailAddresses.push(emailAddressCC2)
						    											}
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
																    								    transactionId: newRecordId
																    								    });
								    								
								    								//Was the merge ok?
								    								//
								    								if(mergeResult != null)
									    								{
								    										//Get the body & subject from the merge to pass on to the email
								    										//
									    									var emailSubject = mergeResult.subject;
									    									var emailBody = mergeResult.body;
									    									
									    									//Send the email
									    									//
									    									try
																				{
									    											// do we have CC email addresses
									    											if (ccEmailAddresses.length > 0)
									    												{
										    												email.send({
									    														author: 		emailSender,
									    														recipients:		emailAddress,
									    														cc:				ccEmailAddresses,
									    														subject:		emailSubject,
									    														body:			emailBody,
									    														attachments:	emailAttachments,
									    														relatedRecords: {
									    																			entityId:	thisCustomerId,
									    																			transactionId: newRecordId
									    																		}
									    														});	
									    												}
									    											else
									    												{
											    											email.send({
											    														author: 		emailSender,
											    														recipients:		emailAddress,
											    														subject:		emailSubject,
											    														body:			emailBody,
											    														attachments:	emailAttachments,
											    														relatedRecords: {
											    																			entityId:	thisCustomerId,
											    																			transactionId: newRecordId
											    																		}
											    														});
									    												}
																					
																				}
																			catch(err)
																				{
																					log.error({
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
		
							//Get the item display name from the item record
							//
							var itemDisplayName = itemDescription;
							
							try
								{
									itemDisplayName = search.lookupFields({
																			type:		'item',
																			id:			itemId,
																			columns:	'displayname'
																		}).displayname;
								}
							catch(err)
								{
								
								}
							
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
							
							// build up the key for the summary
							// itemId + itemUnitPrice
							var key = padding_left(itemId, '0', 6) + padding_left(itemUnitPrice, '0', 6);
							
							//See if we have the key in the summary
							//
							if(!summary[key])
								{
									//Add it to the summary
									summary[key] = new itemSummaryInfo(itemId, itemDisplayName, itemUnitPrice, itemQuantity, itemAmount, itemVatAmount, itemVatRate, currencySymbol);
								}
							else
								{
									//Update the summary
									//
									summary[key].quantity += itemQuantity;
									summary[key].amount += itemAmount;
									summary[key].vatAmount += itemVatAmount;
								}
						}
		    	
			    	//Update the record with the new summary info
			    	//
			    	var outputArray = [];
			    	for (var summaryKey in summary) 
				    	{
			    			outputArray.push(summary[summaryKey]);
						}
			    	
			    	try
			    		{
			    			record.submitFields({
							    				type: 	thisRecord.type,
							    				id: 	thisRecord.id,
							    				values: {
							    						custbody_bbs_json_summary: JSON.stringify(outputArray)
							    						}
			    								});
			    		}
			    	catch(err)
			    		{
			    		
			    		}
				}
	    }
    
    //Left padding s with c to a total of n chars
    //
    function padding_left(s, c, n) 
	    {
	    	if (! s || ! c || s.length >= n) 
	    		{
	    			return s;
	    		}
	    	
	    	var max = (n - s.length)/c.length;
	    	
	    	for (var i = 0; i < max; i++) 
	    		{
	    			s = c + s;
	    		}
	    	
	    	return s;
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
    
    function filePropertiesObj(_description, _startDate, _endDate, _amount, _currency, _tranDate)
    	{
    		this.description 	= _description;
    		this.startDate		= _startDate;
    		this.endDate		= _endDate;
    		this.amount			= _amount;
    		this.currency		= _currency;
    		this.tranDate		= _tranDate;
    	}

    //=============================================================================
    //Return function definition to NS
    //=============================================================================
	//
    return {
    	afterSubmit: invoiceAS
    };
    
});
