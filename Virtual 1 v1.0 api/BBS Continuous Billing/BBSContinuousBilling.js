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
	var processingDateString 	= nlapiGetContext().getPreference('custscript_bbs_processing_date');
	var processingDate 			= null;
	
	if(processingDateString != null && processingDateString != '')
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
	
	//Find any fully billed purchase orders & create new purchase orders from them
	//
	processFullyBilledPurchaseOrders(processingDate);
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function processFullyBilledPurchaseOrders(_processingDate)
{
	var todayString = _processingDate.format('d/m/Y');

	//Find any relevant rental purchase orders
	//
	var purchaseOrderSearch = getResults(nlapiCreateSearch("purchaseorder",
			[
				   ["type","anyof","PurchOrd"], 
				   "AND", 
				   ["custbody_bbs_pe_reference","isnotempty",""], 	//Has a PE reference
				   "AND", 
				   ["mainline","is","T"], 							//Main line
				   "AND", 
				   ["status","anyof","PurchOrd:H"],					//Closed
				   "AND", 
				   ["class","anyof","1"]							//Rental
			],
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("trandate"),
			   new nlobjSearchColumn("custbody_bbs_pe_reference")
			]
			));
	
	if(purchaseOrderSearch != null && purchaseOrderSearch.length > 0)
		{
			//Loop through the purchase orders
			//
			for (var int = 0; int < purchaseOrderSearch.length; int++) 
				{
					checkResources();
				
					var purchaseOrderId 		= purchaseOrderSearch[int].getId();
					var purchaseDate 			= nlapiStringToDate(purchaseOrderSearch[int].getValue('trandate'));
					var purchasePeReference 	= purchaseOrderSearch[int].getValue('custbody_bbs_pe_reference');					
					var newPurchaseDate 		= new Date(purchaseDate.getFullYear() + 1, purchaseDate.getMonth(), purchaseDate.getDate());
					var newPurchaseDateString 	= nlapiDateToString(newPurchaseDate);
					
					//Make a copy of the purchase order
					//
					var newPurchaseOrder = null;
					
					try
						{
							newPurchaseOrder = nlapiCopyRecord('purchaseorder', purchaseOrderId);
						}
					catch(err)
						{
							newPurchaseOrder = null;
							nlapiLogExecution('ERROR', 'Error copying purchase order, id = ' + purchaseOrderId, err.message);
						}
					
					if(newPurchaseOrder != null)
						{
							//Update the external id on the old purchase order
							//
							nlapiSubmitField('purchaseorder', purchaseOrderId, 'externalid', 'po_' + purchasePeReference + '_' + purchaseOrderId, false);
						
							//Set the relevant field values on the header
							//
							newPurchaseOrder.setFieldValue('trandate', newPurchaseDateString);
							
							if(purchasePeReference != null && purchasePeReference != '')
								{
									newPurchaseOrder.setFieldValue('externalid', 'po_' + purchasePeReference);
								}
							
							//Update the header with the link to the old sales order
							//
							newPurchaseOrder.setFieldValue('custbody_bbs_prev_purchase_order', purchaseOrderId);
						
							//Correct the first line of the new purchase order
							//
							var newLines 	= newPurchaseOrder.getLineItemCount('item');
							var lineRate 	= Number(0);
							var lineAmount 	= Number(0);
							
							//Get the rate & amount from the next line after the first one
							//
							for (var lineCounter = 1; lineCounter <= newLines; lineCounter++) 
								{
									if(lineCounter > 1)
										{
											lineRate 	= Number(newPurchaseOrder.getLineItemValue('item', 'rate', lineCounter));
											lineAmount 	= Number(newPurchaseOrder.getLineItemValue('item', 'amount', lineCounter));
											
											break;
										}
								}
							
							//If we have a rate & amount, then set the first line to be those values
							//
							if(lineRate > 0 && lineAmount > 0)
								{
									newPurchaseOrder.setLineItemValue('item', 'rate', 1, lineRate);
									newPurchaseOrder.setLineItemValue('item', 'amount', 1, lineAmount);
								}

							//Save the new purchase order
							//
							var newPurchaseOrderId = null;
							
							try 
								{
									newPurchaseOrderId = nlapiSubmitRecord(newPurchaseOrder, true, true);
								} 
							catch (err) 
								{
									newPurchaseOrderId = null;
									nlapiLogExecution('ERROR', 'Error saving new purchase order', err.message);
								}
							
							//Update the old purchase order with the link to the new purchase order
							//
							if(newPurchaseOrderId != null)
								{
									try
										{
											nlapiSubmitField('purchaseorder', purchaseOrderId, 'custbody_bbs_next_purchase_order', newPurchaseOrderId, false);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error updating old purchase order, id = ' + purchaseOrderId + ', deleting new purchase order, id = ' + newPurchaseOrderId, err.message);
											nlapiDeleteRecord('purchaseorder', newPurchaseOrderId);
										}
								}
						}
				}
		}
}


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
			   new nlobjSearchColumn("trandate"),
			   new nlobjSearchColumn("custbody_bbs_pe_reference")
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
					var salesPeReference = salesorderSearch[int].getValue('custbody_bbs_pe_reference');
					
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
							
							if(salesPeReference != null && salesPeReference != '')
								{
									newSalesOrder.setFieldValue('externalid', 'so_' + salesPeReference);
								}
							
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
									//Blank out the original sales order external id
									//
									nlapiSubmitField('salesorder', salesOrderId, 'externalid', 'so_' + salesPeReference + '_' + salesOrderId, false);
									//oldSalesOrder.setFieldValue('externalid', null);
								
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
					
					//Get the sales order id
					//
					var salesOrderId = salesorderSearch[int].getId();
					
					//Check to see if we need to create a pro-rata invoice
					//
					checkForProRataInvoice(salesOrderId, _processingDate);
					
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
							
							//Get the billing type & PE reference from the sales order
							//
							var soBillingType = oldSalesOrder.getFieldValue('class');
							var soPEReference = oldSalesOrder.getFieldValue('custbody_bbs_pe_reference');
							var soCloseDate = oldSalesOrder.getFieldValue('custbody_bbs_sales_order_close_date');
							
							//Try to save the old sales order, update the end date on the revenue arrangement & update the associated PO
							//
							try
								{
									nlapiSubmitRecord(oldSalesOrder, true, true);
									endRevenueArrangement(salesOrderId, todayString);
									
									//Close purchase orders only for rental orders
									//
									if(soBillingType == 1)	//Rental
										{
											closePurchaseOrder(soPEReference, soCloseDate);
										}
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating old sales order, id = ' + salesOrderId, err.message);
								}
						}
				}
		}
}


function closePurchaseOrder(_soPEReference, _closeDate)
{
	//Find the most recent PO for the PE reference given
	//
	var purchaseorderSearch = getResults(nlapiCreateSearch("purchaseorder",
			[
			   ["type","anyof","PurchOrd"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["custbody_bbs_pe_reference","is",_soPEReference], 
			   "AND", 
			   ["status","noneof","PurchOrd:H","PurchOrd:G","PurchOrd:A","PurchOrd:P","PurchOrd:C"]	//Not Pending Supervisor Approval, Rejected by Supervisor, Fully Billed, Closed, Planned
			], 
			[
			   new nlobjSearchColumn("trandate").setSort(true), 									//Ordered by po date descending
			   new nlobjSearchColumn("tranid")
			]
			));
	
	//Did we find a PO
	//
	if(purchaseorderSearch != null && purchaseorderSearch.length > 0)
		{
			checkResources();
			
			//Get the PO id & find the month number & day number of the relevant close date
			//
			var poId 			= purchaseorderSearch[0].id();
			var closeDate		= nlapiStringToDate(_closeDate);
			var closeDateMonth 	= closeDate.getMonth() + 1;		//Months start at 0
			var closeDateDay 	= Number(closeDate.getDate());
			var daysInMonth 	= Number(new Date(closeDate.getFullYear(), closeDate.getMonth(), 0).getDate());
			var poRecord		= null;
			
			//Load the PO record
			//
			try
				{
					poRecord = nlapiLoadRecord('purchaseorder', poId);
				}
			catch(err)
				{
					poRecord = null;
					nlapiLogExecution('ERROR', 'Error loading associated po with id = ' + poId, err.message);
				}
			
			//Did we get the PO record ok?
			//
			if(poRecord != null)
				{
					var poLines 		= poRecord.getLineItemCount('item');
					var lineProrated	= false;
					
					//Loop through the lines to find the one for the month in which the close date occurs
					//
					for (var poLine = 1; poLine <= poLines; poLine++) 
						{
							var lineMonth = poRecord.getLineItemValue('item', 'custcol_po_month', poLine);
							
							if(lineMonth == closeDateMonth)
								{
									var lineAmount 		= Number(poRecord.getLineItemValue('item', 'amount', poLine));
									var proRataAmount 	= (lineAmount / daysInMonth) * closeDateDay;
									proRataAmount		= Math.round((proRataAmount + 0.00001) * 100) / 100;	//Round to 2 dec places
									lineProrated		= true;
									
									//Set the line rate & amount to be the pro-rata amount
									//
									poRecord.setLineItemValue('item', 'rate', poLine, proRataAmount);
									poRecord.setLineItemValue('item', 'amount', poLine, proRataAmount);
								}
							else
								{
									if(lineProrated)
										{
											//Set all subsequent lines to be closed
											//
											poRecord.setLineItemValue('item', 'isclosed', poLine, 'T');
										}
								}
						}
				
					//Save the PO record
					//
					try
						{
							nlapiSubmitRecord(poRecord, true, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating the PO after pro-rating, id = ' + poId, err.message);
						}
				}
		}
}


function endRevenueArrangement(_salesOrderId, _endDate)
{
	//Find a revenue element for this sales order
	//
	var revenueelementSearch = nlapiSearchRecord("revenueelement",null,
			[
			   ["referenceid","is", "SalesOrd_" + _salesOrderId]
			], 
			[
			   new nlobjSearchColumn("internalid","revenueArrangement",null)
			]
			);
	
	if(revenueelementSearch != null && revenueelementSearch.length > 0)
		{
			//Loop through the search results
			//
			for (var int3 = 0; int3 < revenueelementSearch.length; int3++) 
				{
					var revArrangementId = revenueelementSearch[int3].getValue("internalid","revenueArrangement");

					//Have we got an associated revenue arrangement
					//
					if(revArrangementId != null && revArrangementId != '')
						{
							var arrangementRecord = null;
						
							//Try to load the revenue arrangement record
							//
							try
								{
									arrangementRecord = nlapiLoadRecord('revenuearrangement', revArrangementId);
								}
							catch(err)
								{
									arrangementRecord = null;
									nlapiLogExecution('ERROR', 'Error loading revenue arrangement, id = ' + revArrangementId, err.message);
								}
							
							if(arrangementRecord != null)
								{
									//Process the revenue arrangement record elements
									//
									var elements = arrangementRecord.getLineItemCount('revenueelement');
									
									//Loop through the elements
									//
									for (var int4 = 1; int4 <= elements; int4++) 
										{
											//Get the source from the line
											//
											var elementSource = arrangementRecord.getLineItemValue('revenueelement', 'referenceid', int4);
											
											//Check to make sure the source matches
											//
											if(elementSource == "SalesOrd_" + _salesOrderId)
												{
													//Get the start date
													//
													var revStartDate = arrangementRecord.getLineItemValue('revenueelement', 'revrecstartdate', int4);
												
													//Check to see if the new end date is before the start date
													//
													if(nlapiStringToDate(_endDate).getTime() < nlapiStringToDate(revStartDate).getTime())
														{
															//If it is, then set the end date to be the start date
															//
															arrangementRecord.setLineItemValue('revenueelement', 'revrecenddate', int4, revStartDate);
														}
													else
														{
															arrangementRecord.setLineItemValue('revenueelement', 'revrecenddate', int4, _endDate);
														}
												}
										}
								
									//Save the revenue arrangement record
									//
									try
										{
											nlapiSubmitRecord(arrangementRecord, false, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error saving revenue arrangement, id = ' + revArrangementId, err.message);
										}
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
	var start 			= 0;
	var end 			= 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen 		= searchResultSet.length;

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
						resultlen 		= moreSearchResultSet.length;
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

function checkForProRataInvoice(_salesOrderId, _processingDate)
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

	//Do we have a sales order record
	//
	if(salesOrderRecord != null)
		{
			var billingEndDate 	= nlapiStringToDate(salesOrderRecord.getFieldValue('custbody_bbs_billing_end_date'));
			var billingOffCycle = salesOrderRecord.getFieldValue('custbody_bbs_off_billing_cycle');
			
			//Make sure we have a billing end date
			//
			if(billingEndDate != null && billingEndDate != '')
				{
					var lineCount 			= salesOrderRecord.getLineItemCount('item');
					var billingFrequency 	= null;
					
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
							var thisMonthEnd 	= new Date(_processingDate.getFullYear(), _processingDate.getMonth() + 1, 0);
							var nextMonthStart 	= new Date(_processingDate.getFullYear(), _processingDate.getMonth() + 1, 1);
							
							//Billing end date is on or before this month
							//
							if(billingEndDate.getTime() <= thisMonthEnd.getTime())
								{
									//No need for a pro rata invoice, just update the credit note required checkbox
									//
									// NOT USED - NOW DONE CLIENT SIDE   nlapiSubmitField('salesorder', _salesOrderId, 'custbody_bbs_cre_not_req', 'T', false);
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
							var thisDate = nlapiDateToString(_processingDate);
							
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
											var thisDate = _processingDate;
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
	var billingEndDate 		= nlapiStringToDate(_salesOrderRecord.getFieldValue('custbody_bbs_billing_end_date'));
	var invoiceDate 		= new Date(salesOrderCloseDate.getFullYear(), salesOrderCloseDate.getMonth() + 1, 1); 	//1st day on month after the close date
	var salesOrderValue 	= Number(_salesOrderRecord.getFieldValue('subtotal'));
	var daysToInvoice 		= (Math.abs(billingEndDate.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24)) + 1;
	var invoiceValue 		= ((salesOrderValue / 365) * daysToInvoice).toFixed(2);
	
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
			var invoiceLines 	= invoiceRecord.getLineItemCount('item');
			var lineDescription = '';
			
			for (var int = invoiceLines; int >= 1; int--) 
				{
					lineDescription = invoiceRecord.getLineItemValue('item', 'description', int);
				
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
					
					invoiceRecord.setCurrentLineItemValue('item','description', lineDescription); 
					
					//Get fields from invoice header
					//
					var endCustomerName = invoiceRecord.getFieldValue('custbody_bbs_end_cust_name_body');
					var v1cNumber 		= invoiceRecord.getFieldValue('custbody_bbs_v1c_number');
					var siteName 		= invoiceRecord.getFieldValue('custbody_bbs_site_name_body');
					var postCode 		= invoiceRecord.getFieldValue('custbody__bbs_site_post_code_body');
					var billingFreq 	= invoiceRecord.getFieldValue('custbody_bbs_billing_frequency_body');
					var peReference 	= invoiceRecord.getFieldValue('custbody_bbs_pe_reference');

					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_end_cust_name', endCustomerName); 
					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_accessid_v1c', v1cNumber); 
					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_site_name', siteName); 
					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_site_post_code', postCode); 
					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_billing_frequency', billingFreq); 
					invoiceRecord.setCurrentLineItemValue('item','custcol_bbs_pe_reference', peReference); 
					
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