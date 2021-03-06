/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jul 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
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
	
	
	//=============================================================================================
	//Start of main code
	//=============================================================================================
	//
	//Read in the parameter(s)
	//
	var context = nlapiGetContext();
	var ddBatchesString = context.getSetting('SCRIPT', 'custscript_batches_array');
	var paymentFileDate = context.getSetting('SCRIPT', 'custscript_pay_file_date');
	var ddBatches = JSON.parse(ddBatchesString);
	var usersEmail = context.getUser();
	var emailText = '';
	
	//Get company configuration
	//
	var configRecord = null;
	var urlPrefix = null;
	
	try
		{
			configRecord = nlapiLoadConfiguration('companyinformation');
		}
	catch(err)
		{
			configRecord = null;
		}
	
	if(configRecord != null)
		{
			urlPrefix = 'https://' + configRecord.getFieldValue('companyid').replace('_','-') + '.app.netsuite.com';
		}
	
	var today = new Date();
	var todayString = today.format('d/m/Y');
	var batchArray = [];
	
	//Find any relevant batches
	//
	var customrecord_bbs_dd_batchSearch = getResults(nlapiCreateSearch("customrecord_bbs_dd_batch",
			[
			   ["internalid","anyof",ddBatches]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_dd_partner"), 
			   new nlobjSearchColumn("custrecord_bbs_dd_processing_date"), 
			   new nlobjSearchColumn("custrecord_bbs_dd_bank_account")
			]
			));
	
	if(customrecord_bbs_dd_batchSearch != null && customrecord_bbs_dd_batchSearch.length > 0)
		{
			//Loop through the batches
			//
			for (var int = 0; int < customrecord_bbs_dd_batchSearch.length; int++) 
				{
					var batchPartnerId = customrecord_bbs_dd_batchSearch[int].getValue("custrecord_bbs_dd_partner");
					var bastchProcessingDate = customrecord_bbs_dd_batchSearch[int].getValue("custrecord_bbs_dd_processing_date");
					var batchBankAccountId = customrecord_bbs_dd_batchSearch[int].getValue("custrecord_bbs_dd_bank_account");
					var batchId = customrecord_bbs_dd_batchSearch[int].getId();
					
					var prRecordsArray = [];
					var prValues = {};
					
					//Search the batch detail records for PR records
					//
					var customrecordbbs_dd_batch_detSearch = getResults(nlapiCreateSearch("customrecordbbs_dd_batch_det",
							[
							   ["custrecord_bbs_dd_det_batch","anyof",batchId]
							], 
							[
							   new nlobjSearchColumn("custrecord_bbs_dd_det_pr"), 
							   new nlobjSearchColumn("custrecord_bbs_dd_det_amount")
							]
							));
					
					if(customrecordbbs_dd_batch_detSearch != null && customrecordbbs_dd_batch_detSearch.length > 0)
						{
							//Loop through the batch details
							//
							for (var int2 = 0; int2 < customrecordbbs_dd_batch_detSearch.length; int2++) 
								{
									var prId = customrecordbbs_dd_batch_detSearch[int2].getValue("custrecord_bbs_dd_det_pr");
									var amountToPayDD = customrecordbbs_dd_batch_detSearch[int2].getValue("custrecord_bbs_dd_det_amount");
								
									//Save the PR id in array for later processing
									//
									prRecordsArray.push(prId);
									
									prValues[prId] = amountToPayDD;
								}
						}
					
					var firstRecord = true;
					var paymentRecord = null;
					var paymentTotal = Number(0);
					
					
					//Now find all of the invoices to process 
					//
					var transactionSearch = getResults(nlapiCreateSearch("transaction",
							[
							   ["status","anyof","CustInvc:A"], 
							   "AND", 
							   ["custbody_bbs_disputed","is","F"], 
							   "AND", 
							   ["custbody_bbs_pr_id","anyof",prRecordsArray], 
							   "AND", 
							   ["mainline","is","T"]
							], 
							[
							   new nlobjSearchColumn("tranid")
							]
							));
					
					if(transactionSearch != null && transactionSearch.length > 0)
						{
							//Loop through the transaction results
							//
							for (var int3 = 0; int3 < transactionSearch.length; int3++) 
								{
									checkResources();
									
									var invoiceId = transactionSearch[int3].getId();
									
									//Is this the first pass through the results
									//
									if(firstRecord)
										{
											firstRecord = false;
											
											//Create the payment record
											//
											try
												{
													paymentRecord = nlapiTransformRecord('invoice', invoiceId, 'customerpayment', {recordmode: 'dynamic'});
												}
											catch(err)
												{
													paymentRecord = null;
													nlapiLogExecution('ERROR', 'Error creating payment record', err.message);
												}
											
											if(paymentRecord != null)
												{
													//Set the bank account
													//
													paymentRecord.setFieldValue('account', batchBankAccountId);
												
													//Set the transaction date
													//
													paymentRecord.setFieldValue('trandate', paymentFileDate);
													
													//Set the preferred entity bank
													//
													paymentRecord.setFieldValue('custbody_11187_pref_entity_bank', findEntityBank(batchPartnerId));	
													
													//Set all lines to be un-applied
													//
													var applyLines = paymentRecord.getLineItemCount('apply');
													
													for (var int4 = 1; int4 <= applyLines; int4++) 
														{
															paymentRecord.setLineItemValue('appy', 'apply', int4, 'F');
														}
												}
										}
									
									//Now find the relevant line in the apply sublist
									//
									if(paymentRecord != null)
										{
											var applyLines = paymentRecord.getLineItemCount('apply');
											
											for (var int4 = 1; int4 <= applyLines; int4++) 
												{
													var doc = paymentRecord.getLineItemValue('apply', 'doc', int4);
													
													if(doc == invoiceId)
														{
															var dueAmount = Number(paymentRecord.getLineItemValue('apply', 'due', int4));
															
															paymentRecord.setLineItemValue('apply', 'apply', int4, 'T');
															paymentRecord.setLineItemValue('apply', 'amount', int4, dueAmount);
															
															paymentTotal += dueAmount;
															
															break;
														}
												}
										}
								}
						}
					
					if(paymentRecord != null)
						{
							checkResources();
						
							//Update the total on the payment record
							//
							paymentRecord.setFieldValue('payment', paymentTotal);
							
							//Commit the payment record
							//
							var paymentId = null;
							
							try
								{
									paymentId = nlapiSubmitRecord(paymentRecord, true, true);
								}
							catch(err)
								{
									paymentId = null;
									nlapiLogExecution('ERROR', 'Error saving payment record', err.message);
								}
							
							//Update the dd batch 
							//
							if(paymentId != null)
								{
									nlapiSubmitField('customrecord_bbs_dd_batch', batchId, ['custrecord_bbs_dd_payment_record','custrecord_bbs_dd_status'], [paymentId,'2'], false);
									
									//Add info to the email message
									//
									if(emailText == '')
										{
											emailText += 'The following payment records have now been created \n\n';
										}
									
									var newUrl = urlPrefix + nlapiResolveURL('RECORD', 'customerpayment', paymentId, 'view');
									emailText += 'Customer Payment (' + paymentId.toString() + ') - ' + newUrl + '\n';
								}
						}
					
					for ( var prId in prValues) 
						{
							updatePrValues(prId, prValues[prId]);
						}
					
					for ( var prId in prValues) 
						{
							delete prValues[prId];
						}
				}
		}
	
	//Send the email to the user to say that we have finished
	//
	if(emailText == '')
		{
			emailText += 'No customer payment records have been created\n\n';
		}
	
	nlapiSendEmail(usersEmail, usersEmail, 'Payment Records Generation', emailText);
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function findEntityBank(_customerId)
{
	var bankId = null;
	var customerRecord = null;
	
	var customrecord_2663_entity_bank_detailsSearch = nlapiSearchRecord("customrecord_2663_entity_bank_details",null,
			[
			   ["isinactive","is","F"], 
			   "AND", 
			   ["custrecord_2663_entity_bank_type","anyof","1"], 		//Type = "Primary"
			   "AND", 
			   ["custrecord_2663_parent_customer","anyof",_customerId]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
	
	if(customrecord_2663_entity_bank_detailsSearch != null && customrecord_2663_entity_bank_detailsSearch.length == 1)
		{
			bankId = customrecord_2663_entity_bank_detailsSearch[0].getId();
		}
	
	return bankId;
}

function updatePrValues(prId, amountToPayDD)
{
	//Update the PR record's amount to pay by DD value
	//
	var prAmountToPayDD = Number(nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_inv_proc_by_dd', false));
	prAmountToPayDD -= amountToPayDD;
	nlapiSubmitField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_inv_proc_by_dd', prAmountToPayDD, false);
	
	//Get the outstanding amount & the current status
	//
	var oustandingAmount = Number(nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_inv_outstanding', false));
	var ddAmount = Number(nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_inv_proc_by_dd', false));
	var disputedAmount = Number(nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_inv_disputed', false));
	
	var unAppliedAmount = Number(nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_cn_unapplied', false));
	
	var status = nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', false);
	var recordType = nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_type', false);
	
	//If the PR record is an invoice & the outstanding amount is zero & the current status is 'open', then mark it as paid in full
	//
	if(recordType == 2 && oustandingAmount == 0 && ddAmount == 0 && disputedAmount == 0 && status != 2)
		{
			nlapiSubmitField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', '2', false);
		}

	//If the PR record is an invoice & the outstanding amount is not zero & the current status is 'paid in full', then mark it as open
	//
	if(recordType == 2 && status != 1 && (oustandingAmount != 0 || ddAmount != 0 || disputedAmount != 0))
		{
			nlapiSubmitField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', '1', false);
		}
	
	//If the PR record is an credit note & the outstanding amount is zero & the current status is 'open', then mark it as paid in full
	//
	if(recordType == 1 && unAppliedAmount == 0 && status != 2)
		{
			nlapiSubmitField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', '2', false);
		}

	//If the PR record is an credit note & the outstanding amount is not zero & the current status is 'paid in full', then mark it as open
	//
	if(recordType == 1 && unAppliedAmount != 0 && status != 1)
		{
			nlapiSubmitField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', '1', false);
		}	
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				
				if(moreSearchResultSet == null)
					{
						resultlen = 0;
					}
				else
					{
						resultlen = moreSearchResultSet.length;
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
					}
		}
	
	return searchResultSet;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}

