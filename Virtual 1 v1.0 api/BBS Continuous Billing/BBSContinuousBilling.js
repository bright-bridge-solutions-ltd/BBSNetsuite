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
	
	//Get a specific processing date from the script parameter if required
	//
	var processingDateString = nlapiGetContext().getPreference('custscript_bbs_processing_date');
	var processingDate = null;
	
	if(specificDate != null && specificDate != '')
		{
			processingDate = nlapiStringToDate(processingDateString);
		}
	else
		{
			processingDate = new Date();
		}
	
	
	//Find any sales orders with a billing end date that have not yet been processed
	//
	processBillingEndDates(processingDate);
	
	//Find any fully billed sales orders & create new sales orders from them
	//
	processFullyBilledOrders(processingDate);
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function processFullyBilledOrders(_processingDate)
{
	var todayString = _processingDate.format('d/m/Y');

	//Find any relevant sales orders
	//
	var salesorderSearch = getResults(nlapiCreateSearch("salesorder",
			[
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["status","anyof","SalesOrd:G"], 					//Fully billed
			   "AND", 
			   ["custbody_bbs_next_sales_order","anyof","@NONE@"],	//Does not have a next sales order
			   "AND", 
			   ["custbody_bbs_billing_end_date","isempty",""]		//We do not have a billing end date
			],
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("trandate")
			]
			));
	
	if(salesorderSearch != null && salesorderSearch.length > 0)
		{
			//Loop through the sales orders
			//
			for (var int = 0; int < salesorderSearch.length; int++) 
				{
					checkResources();
				
					var salesOrderId = salesorderSearch[int].getId();
					var salesDate = nlapiStringToDate(salesorderSearch[int].getValue('trandate'));
					var newSalesDate = new Date(salesDate.getFullYear() + 1, salesDate.getMonth(), salesDate.getDate());
					var newSalesDateString = nlapiDateToString(newSalesDate);
					
					//Make a copy of the sales order
					//
					var newSalesOrder = null;
					
					try
						{
							newSalesOrder = nlapiCopyRecord('salesorder', salesOrderId);
						}
					catch(err)
						{
							newSalesOrder = null;
							nlapiLogExecution('ERROR', 'Error copying sales order, id = ' + salesOrderId, err.message);
						}
					
					if(newSalesOrder != null)
						{
							//Set the relevant field values on the header
							//
							newSalesOrder.setFieldValue('custbody_bbs_billing_end_date', null);
							newSalesOrder.setFieldValue('trandate', newSalesDateString);
							newSalesOrder.setFieldValue('saleseffectivedate', newSalesDateString);
							
							//Update the header with the link to the old sales order
							//
							newSalesOrder.setFieldValue('custbody_bbs_prev_sales_order', salesOrderId);
						
							//Load the old sales order so we can copy across the billing schedules
							//
							var oldSalesOrder = null;
							
							try
								{
									oldSalesOrder = nlapiLoadRecord('salesorder', salesOrderId);
								}
							catch(err)
								{
									oldSalesOrder = null;
									nlapiLogExecution('ERROR', 'Error loading old sales order, id = ' + salesOrderId, err.message);
								}
							
							if(oldSalesOrder != null)
								{
									//Loop through the lines on the old sales order to see if there are any billing schedules to copy across
									//
									var lines = oldSalesOrder.getLineItemCount('item');
									
									for (var int2 = 1; int2 <= lines; int2++) 
										{
											var billingSchedule = oldSalesOrder.getLineItemValue('item', 'billingschedule', int2);
											
											try
												{
													newSalesOrder.setLineItemValue('item', 'billingschedule', int2, billingSchedule);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error setting billing schedule on new sales order', err.message);
												}
										}
							
								}
							
							//Save the new sales order
							//
							var newSalesOrderId = null;
							
							try 
								{
									newSalesOrderId = nlapiSubmitRecord(newSalesOrder, true, true);
								} 
							catch (err) 
								{
									newSalesOrderId = null;
									nlapiLogExecution('ERROR', 'Error saving new sales order', err.message);
								}
							
							if(newSalesOrderId != null)
								{
									//Load the old sales order
									//
									var oldSalesOrder = null;
									
									try
										{
											oldSalesOrder = nlapiLoadRecord('salesorder', salesOrderId);
										}
									catch(err)
										{
											oldSalesOrder = null;
											nlapiLogExecution('ERROR', 'Error loading old sales order, id = ' + salesOrderId, err.message);
										}
									
									if(oldSalesOrder != null)
										{
											//Sets the link to the new sales order
											//
											oldSalesOrder.setFieldValue('custbody_bbs_next_sales_order', newSalesOrderId);
											
											
											//Try to save the old sales order
											//
											try
												{
													nlapiSubmitRecord(oldSalesOrder, true, true);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error updating old sales order, id = ' + salesOrderId + ', deleting new sales order, id = ' + newSalesOrderId, err.message);
													nlapiDeleteRecord('salesorder', newSalesOrderId);
												}
										}
								}
						}
				}
		}
}

function processBillingEndDates(_processingDate)
{
	var todayString = _processingDate.format('d/m/Y');
	
	//Find any relevant sales orders
	//
	var salesorderSearch = getResults(nlapiCreateSearch("salesorder",
			[
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["status","anyof","SalesOrd:F","SalesOrd:E"], 				//Pending Billing, Pending Billing/Partially Fulfilled
			   "AND", 
			   ["custbody_bbs_sales_order_close_date","onorbefore",todayString],
			   "AND",
			   ["custbody_bbs_billing_end_date_proc","is","F"]
			], 
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("trandate")
			]
			));
	
	if(salesorderSearch != null && salesorderSearch.length > 0)
		{
			//Loop through the sales orders
			//
			for (var int = 0; int < salesorderSearch.length; int++) 
				{
					checkResources();
					
					var salesOrderId = salesorderSearch[int].getId();
					
					checkForProRataInvoice(salesOrderId);
					
					//Load the old sales order
					//
					var oldSalesOrder = null;
					
					try
						{
							oldSalesOrder = nlapiLoadRecord('salesorder', salesOrderId);
						}
					catch(err)
						{
							oldSalesOrder = null;
							nlapiLogExecution('ERROR', 'Error loading old sales order, id = ' + salesOrderId, err.message);
						}
					
					if(oldSalesOrder != null)
						{
							
							//Loop through the lines on the order setting the quantity to be the same as that invoiced
							//
							var lines = oldSalesOrder.getLineItemCount('item');
							
							for (var int2 = 1; int2 <= lines; int2++) 
								{
									var invoicedQuantity = oldSalesOrder.getLineItemValue('item', 'quantitybilled', int2);
									
									//If the invoice quantity is zero, then just mark the line as closed
									//
									if(invoicedQuantity == null || invoicedQuantity == '' || invoicedQuantity == 0)
										{
											oldSalesOrder.setLineItemValue('item', 'isclosed', int2, 'T');
										}
									else	
										{
											oldSalesOrder.setLineItemValue('item', 'quantity', int2, invoicedQuantity);
										}
								}
							
							//Mark the order as processed
							//
							oldSalesOrder.setFieldValue('custbody_bbs_billing_end_date_proc', 'T');
							
							//Try to save the old sales order
							//
							try
								{
									nlapiSubmitRecord(oldSalesOrder, true, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating old sales order, id = ' + salesOrderId, err.message);
								}
						}
				}
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

function checkForProRataInvoice(_salesOrderId)
{
	var salesOrderRecord = null;
	
	//Load the sales order record
	//
	try
		{
			salesOrderRecord = nlapiLoadRecord('salesorder', _salesOrderId)
		}
	catch(err)
		{
			salesOrderRecord = null;
		}

	//Do we have a sales orderrecord
	//
	if(salesOrderRecord != null)
		{
			var billingEndDate = nlapiStringToDate(salesOrderRecord.getFieldValue('custbody_bbs_billing_end_date'));
			
			//Make sure we have a billing end date
			//
			if(billingEndDate != null && billingEndDate != '')
				{
					var lineCount = salesOrderRecord.getLineItemCount('item');
					var billingFrequency = null;
					
					//Get the billing frequency from the line(s)
					//
					for (var int = 1; int <= lineCount; int++) 
						{
							var lineFrequency = salesOrderRecord.getLineItemValue('item', 'custcol_bbs_billing_frequency', int);
							
							if(lineFrequency != null && lineFrequency != '')
								{
									billingFrequency = lineFrequency;
									break;
								}
						}
				
					if(billingFrequency == 1)	//Monthly
						{
							var today = new Date();
							var thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
							var nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
							
							//Billing end date is on or before this month
							//
							if(billingEndDate.getTime() <= thisMonthEnd.getTime())
								{
									//No need for a pro rata invoice, just update the credit note required checkbox
									//
									nlapiSubmitField('salesorder', _salesOrderId, 'custbody_bbs_cre_not_req', 'T', false);
								}
							
							//Billing end date is on or after next month
							//
							if(billingEndDate.getTime() >= nextMonthStart.getTime())
								{
									//Need a pro rata invoice creating
									//
									createProRataInvoice(salesOrderRecord);
								}
						}
					
					if(billingFrequency == 2)	//Quarterly
						{
							//Get the end date of this current quarter
							//
							var thisDate = nlapiDateToString(new Date());
							
							var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
									[
									   ["isquarter","is","T"], 
									   "AND", 
									   ["isinactive","is","F"], 
									   "AND", 
									   ["enddate","onorafter",thisDate], 
									   "AND", 
									   ["startdate","onorbefore",thisDate]
									], 
									[
									   new nlobjSearchColumn("enddate").setSort(false)
									]
									);
							
							if(accountingperiodSearch != null && accountingperiodSearch.length > 0)
								{
									var thisQuarterEndDate = nlapiStringToDate(accountingperiodSearch[0].getValue('enddate'));
									
									//Processing for normal quarterly frequency
									//
									if(billingOffCycle == 'F')
										{
											//Create a pro rata invoice if the billing end date is after the last day of the current quarter
											//
											if(billingEndDate.getTime() > thisQuarterEndDate.getTime())
												{
													createProRataInvoice(salesOrderRecord);
												}
										}
									else
										{
											//Processing for off cycle quarterly frequency
											//
											var thisDate = new Date();
											var thisYear = thisDate.getFullYear();
											
											var offBillingQ1Start = new Date(thisYear, 11, 1);	//1st Dec
											var offBillingQ1End = new Date(thisYear, 1, 28);		//28th Feb
											
											var offBillingQ2Start = new Date(thisYear, 2, 1);	//1st Mar
											var offBillingQ2End = new Date(thisYear, 4, 31);		//31st May
											
											var offBillingQ3Start = new Date(thisYear, 5, 1);	//1st Jun
											var offBillingQ3End = new Date(thisYear, 7, 31);		//31st Aug
											
											var offBillingQ4Start = new Date(thisYear, 8, 1);	//1st Sep
											var offBillingQ4End = new Date(thisYear, 10, 30);	//30th Nov
										
											var offBillingQuarterEndDate = null;
											
											if(thisDate.getTime() >= offBillingQ1Start)
												{
													offBillingQuarterEndDate = new Date(invoiceYear + 1, 1, 28);	//28th Feb next year
												}
											
											if(thisDate.getTime() <= offBillingQ1End)
												{
													offBillingQuarterEndDate = offBillingQ1End; 						//28th Feb this year
												}
								
											if(thisDate.getTime() >= offBillingQ2Start && thisDate.getTime() <= offBillingQ2End)
												{
													offBillingQuarterEndDate = offBillingQ2End;
												}
										
											if(thisDate.getTime() >= offBillingQ3Start && thisDate.getTime() <= offBillingQ3End)
												{
													offBillingQuarterEndDate = offBillingQ3End;
												}
										
											if(thisDate.getTime() >= offBillingQ4Start && thisDate.getTime() <= offBillingQ4End)
												{
													offBillingQuarterEndDate = offBillingQ4End;
												}
									
											//Create a pro rata invoice if the billing end date is after the last day of the off cycle current quarter
											//
											if(billingEndDate.getTime() > offBillingQuarterEndDate.getTime())
												{
													createProRataInvoice(salesOrderRecord);
												}
										}
								}
						}
				}
		}
}

function createProRataInvoice(_salesOrderRecord)
{
	var salesOrderCloseDate = nlapiStringToDate(_salesOrderRecord.getFieldValue('custbody_bbs_sales_order_close_date'));
	var billingEndDate = nlapiStringToDate(_salesOrderRecord.getFieldValue('custbody_bbs_billing_end_date'));
	var invoiceDate = new Date(salesOrderCloseDate.getFullYear(), salesOrderCloseDate.getMonth() + 1, 1); 	//1st day on month after the close date
	var salesOrderValue = Number(_salesOrderRecord.getFieldValue('subtotal'));
	var daysToInvoice = (Math.abs(billingEndDate.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24)) + 1;
	var invoiceValue = ((salesOrderValue / 365) * daysToInvoice).toFixed(2);
	
	var invoiceRecord = null;
	
	try
		{
			invoiceRecord = nlapiTransformRecord('salesorder', _salesOrderRecord.getId(), 'invoice', {recordmode: 'dynamic'});
		}
	catch(err)
		{
			invoiceRecord = null;
			nlapiLogExecution('ERROR', 'Error transforming sales order to invoice id = ' + _salesOrderRecord.getId(), err.message);
		}
	
	if(invoiceRecord != null)
		{
			//Set the invoice date
			//
			invoiceRecord.setFieldValue('trandate', nlapiDateToString(invoiceDate));
		
			//Remove any lines on the invoice
			//
			var invoiceLines = invoiceRecord.getLineItemCount('item');
			
			for (var int = invoiceLines; int >= 1; int--) 
				{
					invoiceRecord.removeLineItem('item', int);
				}
			
			//Add the pro rata item line
			//
			var proRataItemId = getProRataItem();
			
			if(proRataItemId != null)
				{
					invoiceRecord.selectNewLineItem('item');
					invoiceRecord.setCurrentLineItemValue('item','item', proRataItemId); 
					invoiceRecord.setCurrentLineItemValue('item','quantity', 1); 
					invoiceRecord.setCurrentLineItemValue('item','rate', invoiceValue); 
					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_revenue_rec_start_date', nlapiDateToString(invoiceDate)); 
					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_revenue_rec_end_date', nlapiDateToString(billingEndDate)); 
					invoiceRecord.commitLineItem('item'); 
					
					var invoiceId = null;
					
					try
						{
							invoiceId = nlapiSubmitRecord(invoiceRecord, true);
						}
					catch(err)
						{
							invoiceId = null;
							nlapiLogExecution('ERROR', 'Error saving invoice for sales order id = ' + _salesOrderRecord.getId(), err.message);
						}
					
					if(invoiceId != null)
						{
							nlapiSubmitField('salesorder', _salesOrderRecord.getId(), 'custbody_bbs_clo_inv_pro_rata', invoiceId, false);
						}
				}
			else
				{
					nlapiLogExecution('ERROR', 'Error getting pro rata item id from external id', '');
				}
		}
}

function getProRataItem()
{
	var proRataItem = null;
	
	var itemSearch = nlapiSearchRecord("item",null,
			[
			   ["externalidstring","is","Rental - Pro Rata"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false)
			]
			);

	if(itemSearch != null && itemSearch.length > 0)
		{
			proRataItem = itemSearch[0].getId();
		}
	
	return proRataItem;
}