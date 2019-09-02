/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Sep 2019     sambatten
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function workOrderShortageSuitelet(request, response)
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
	


	//=====================================================================
	// Get request - so return a form for the user to process
	//=====================================================================
	//
	if (request.getMethod() == 'GET') 
		{
			//=====================================================================
			// Form creation
			//=====================================================================
			//
			var form = nlapiCreateForm('Work Order Shortage Report', false);
			form.setTitle('Work Order Shortage Report');					
			
			//=====================================================================
			// Field groups creation
			//=====================================================================
			//
							
			//Add a field group for filter info
			//
			var fieldGroupHeader = form.addFieldGroup('custpage_grp_filters', 'Filters');
			
			//Add a field group for filter info
			//
			var fieldGroupOutput = form.addFieldGroup('custpage_grp_output', 'Output Formatting');
			
			//=====================================================================
			// Fields creation
			//=====================================================================
			//
			
			var startDateField = form.addField('custpage_start_date', 'date', 'Work Order Date From', null,'custpage_grp_filters');
			var endDateField = form.addField('custpage_end_date', 'date', 'Work Order Date To', null,'custpage_grp_filters');
			
			var today = new Date();
			var todayString = nlapiDateToString(today);
			
			startDateField.setDefaultValue(todayString);
			//soEndDateField.setDefaultValue(todayString);
			
			//Add an option to chnage the output format
			//
			var outputTypeField = form.addField('custpage_output_type', 'checkbox', 'Output As CSV', null, 'custpage_grp_output');
			
			//Add a submit button
			//
			form.addSubmitButton('Generate Report');
					
			//Write the response
			//
			response.writePage(form);
		}
	else
		{
			//=====================================================================
			// Post request - so process the returned form
			//=====================================================================
			//
					
			//Get the sales order 
			//
			var woStartDate = request.getParameter('custpage_start_date');
			var woEndDate = request.getParameter('custpage_end_date');
			var outputTypeCSV = request.getParameter('custpage_output_type');
			
			// Build the output
			//	
			var file = buildOutput(woStartDate,woEndDate,outputTypeCSV);
			
			//Send back the output in the response message
			//
			if(outputTypeCSV == "T")
				{
					var fileName = 'Work Order Shortage Report.csv';
					
					response.setContentType('CSV', fileName, 'attachment');
					response.write(file);
				}
			else
				{
					response.setContentType('PDF', 'Work Order Shortage Report', 'inline');
					response.write(file.getValue());
				}
		}
}


//=====================================================================
// Functions
//=====================================================================
//
function buildOutput(_woStartDate,_woEndDate,_outputTypeCSV)
{
	var workOrderList = [];
	var workOrderDetail = {};
	var itemsList = [];
	var itemsObject = {};
	var purchaseOrderItems = {};
	var worksOrderItems = {};	
	
	//
	//Process WORK ORDER HEADERS
	//
	
	//Search of work orders based on transaction date
	//
	var filters = [
				   ["type","anyof","WorkOrd"], 
				   "AND", 
				   ["mainline","is","T"], 
				   "AND", 
				   ["status","anyof","WorkOrd:A"] //Work Order:Planned
				];
	
	if(_woStartDate != '')
		{
			filters.push("AND", ["trandate","onorafter",_woStartDate])
		}
	
	if(_woEndDate != '')
		{
			filters.push("AND", ["trandate","onorbefore",_woEndDate])
		}

	var workOrderSearch = getResults(nlapiCreateSearch("workorder",filters,
			[
			   new nlobjSearchColumn("tranid"),
			   new nlobjSearchColumn("trandate").setSort(false),
			   new nlobjSearchColumn("itemid","item"),
			   new nlobjSearchColumn("displayname","item")
			]
			));

	//Have we got any results
	//
	if (workOrderSearch)
		{
			//Loop through the results
			//
			for (var int = 0; int < workOrderSearch.length; int++) 
				{
					//Save the id of the work order into an array for later use.
					var workOrderId = workOrderSearch[int].getId();
					workOrderList.push(workOrderId);
					
					//Build up the work order key which is order number + line number (0 for header line)
					//
					var orderAndLineKey = padding_left(workOrderId,'0', 6) + '|' + '000000';
					
					//Save the header details away in an object
					//
					var searchOrderId = workOrderSearch[int].getId();
					var searchOrderNumber = workOrderSearch[int].getValue("tranid");
					var searchOrderDate = workOrderSearch[int].getValue("trandate");
					var searchOrderAssemblyId = workOrderSearch[int].getValue("itemid","item");
					var searchOrderAssemblyDesc = workOrderSearch[int].getValue("displayname","item");
					searchOrderAssemblyDesc = searchOrderAssemblyDesc.replace("&", "&amp;"); // replace & symbol with correct XML character
					
					workOrderDetail[orderAndLineKey] = new workOrderInfo(searchOrderId, searchOrderNumber, searchOrderDate, searchOrderAssemblyId, searchOrderAssemblyDesc);
				}
		}
	
	//Process WORK ORDER LINES
	//
	if (workOrderList.length > 0)
		{
			var filters = [
						   ["type","anyof","WorkOrd"], 
						   "AND", 
						   ["mainline","is","F"], 
						   "AND", 
						   ["taxline","is","F"], 
						   "AND", 
						   ["shipping","is","F"],
						   "AND",
						   ["internalid","anyof",workOrderList]
						];
			
			var workOrderLineSearch = getResults(nlapiCreateSearch("workorder",filters,
					[
					   new nlobjSearchColumn("tranid").setSort(false), 
					   new nlobjSearchColumn("linesequencenumber").setSort(false),
					   new nlobjSearchColumn("item"),
					   new nlobjSearchColumn("displayname","item"),
					   new nlobjSearchColumn("type","item"), 
					   new nlobjSearchColumn("itemid","item",null), 
					   new nlobjSearchColumn("quantity"),
					   new nlobjSearchColumn("quantityavailable","item")
					]
					));
		
			//Have we got any results
			//
			if (workOrderLineSearch)
				{
					//Loop through the results
					//
					for (var int = 0; int < workOrderLineSearch.length; int++) 
						{
							var workOrderId = workOrderLineSearch[int].getId();
							var searchOrderNumber = workOrderLineSearch[int].getValue("tranid");
							var searchLineNumber = workOrderLineSearch[int].getValue("linesequencenumber");
							var searchLineItemType = workOrderLineSearch[int].getValue("type","item");
							var searchLineItemId = workOrderLineSearch[int].getValue("item");
							var searchLineItemText = workOrderLineSearch[int].getValue("itemid","item");
							var searchLineItemDesc = workOrderLineSearch[int].getValue("displayname","item");
							searchLineItemDesc = searchLineItemDesc.replace("&", "&amp;"); // replace & symbol with correct XML character
							var searchLineQuantity = Number(workOrderLineSearch[int].getValue("quantity"));
							var searchLineAvailableQuantity = Number(workOrderLineSearch[int].getValue("quantityavailable","item"));
							
							//Build up the work order key which is order number + line number
							//
							var orderAndLineKey = padding_left(workOrderId,'0', 6) + '|' + padding_left(searchLineNumber,'0', 6);
							var orderHeaderKey = padding_left(workOrderId,'0', 6) + '|' + '000000';
									
							//Update the total number of items ordered on the header
							//
							workOrderDetail[orderHeaderKey].orderItemsTotal += searchLineQuantity;
								
							//Increment the number of lines that are on this work order
							//
							workOrderDetail[orderHeaderKey].orderLineCount ++;
											
							//Save the line information to an object
							//
							var lineDetails = new workOrderInfo(workOrderId, searchOrderNumber, null, null, null);
							lineDetails.lineNumber = searchLineNumber;
							lineDetails.lineItemId = searchLineItemId;
							lineDetails.lineItemText = searchLineItemText;
							lineDetails.lineItemDesc = searchLineItemDesc;
							lineDetails.lineQuantity = searchLineQuantity;
							lineDetails.lineAvailableQuantity = searchLineAvailableQuantity;
										
							//Add to the order details object
							//
							workOrderDetail[orderAndLineKey] = lineDetails;
											
							//Save away the item to an object
							//
							itemsObject[searchLineItemId] = searchLineItemId;
						}
				}
			
			//Convert the items object to an array for use in a search
			//
			for (var items in itemsObject) 
				{
					itemsList.push(items);
				}
		}

	//Process PURCHASE ORDER LINES
	//
	if (itemsList.length > 0)
		{
			//We need to find any PO's for the items that are on the work orders
			//
			var purchaseOrderSearch = getResults(nlapiCreateSearch("purchaseorder",
					[
					   ["type","anyof","PurchOrd"],
					   "AND", 
					   ["mainline","is","F"], 
					   "AND", 
					   ["taxline","is","F"], 
					   "AND", 
					   ["shipping","is","F"], 
					   "AND", 
					   ["status","anyof","PurchOrd:D","PurchOrd:E","PurchOrd:B"], //Partially Received, Pending Billing/Partially Received, Pending Receipt
					   "AND", 
					   ["quantityshiprecv","equalto","0"], 
					   "AND", 
					   ["item","anyof",itemsList], 
					   "AND", 
					   ["expectedreceiptdate","isnotempty",""]
					], 
					[
					   new nlobjSearchColumn("item").setSort(false), 
					   new nlobjSearchColumn("expectedreceiptdate").setSort(true), 
					   new nlobjSearchColumn("tranid"),
					   new nlobjSearchColumn("quantity"),
					   new nlobjSearchColumn("entity")
					]
					));
			
			nlapiLogExecution('DEBUG', 'Items', itemsList);
			
			//Process the found purchase orders
			//
			if (purchaseOrderSearch)
				{
					lastItemId = '';
					
					for (var int = 0; int < purchaseOrderSearch.length; int++) 
						{
							var poItemId = purchaseOrderSearch[int].getValue('item');
							var poDueDate = purchaseOrderSearch[int].getValue('expectedreceiptdate');
							var poNumber = purchaseOrderSearch[int].getValue('tranid');
							var poQuantity = purchaseOrderSearch[int].getValue('quantity');
							var poId = purchaseOrderSearch[int].getId();
							
							if(lastItemId != poItemId)
								{
									lastItemId = poItemId;
									purchaseOrderItems[poItemId] = new purchaseOrderInfo(poNumber, poDueDate, poId, poQuantity);
								}
						}
				}
			
			//Loop through the work orders looking at the lines & then see if there is a po for the item
			//if there is one, then update the work order line with the po details
			//
			for (var workOrderKey in workOrderDetail) 
				{
					//Look for keys that represent lines, not headers (headers have a line number = '000000')
					//
					if (workOrderKey.split('|')[1] != '000000')
						{
							var workOrderItemId = workOrderDetail[workOrderKey].lineItemId;
							
							var matchingPoDetail = purchaseOrderItems[workOrderItemId];
							
							//See if we have found the po detail for the item
							//
							if(matchingPoDetail != null)
								{
									workOrderDetail[workOrderKey].linePoNo = matchingPoDetail.orderNumber;
									workOrderDetail[workOrderKey].linePoDueDate = matchingPoDetail.orderDueDate;
									workOrderDetail[workOrderKey].linePoId = matchingPoDetail.orderId;
									workOrderDetail[workOrderKey].linePoQuantity = matchingPoDetail.orderQuantity;
								}
						}
				}
	
		}
	
	//Remove any headers that have no lines to show
	//
	for (var woKey in workOrderDetail) 
		{
			if (woKey.split('|')[1] == '000000' && workOrderDetail[woKey].orderLineCount == 0)
				{
					delete workOrderDetail[woKey];
				}
		}
	
	
	//Remove any lines that do not have a header
	//
	for (var woKey in workOrderDetail) 
		{
			if(woKey.split('|')[1] != '000000')
				{
					var headerKey = woKey.split('|')[0] + '|000000';
					
					if(!workOrderDetail[headerKey])
						{
							delete workOrderDetail[woKey];
						}
				}
		}
	
	//
	//Process the output document
	//
	
	//Sort the work order object so that we are in work order number / line number order
	//
	const orderedWorkOrderDetail = {};
	Object.keys(workOrderDetail).sort().forEach(function(key) {
		orderedWorkOrderDetail[key] = workOrderDetail[key];
	});
	
	//Start the xml off with the basic header info 
	//
	var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
	
	//Start the csv off
	//
	var csv = '';
	
	//Header & style sheet
	//
	xml += "<pdf>"
	xml += "<head>";
	xml += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
	xml += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
	xml += "td {padding: 0px;vertical-align: top; font-size:8px;}";
	xml += "b {font-weight: bold;color: #333333;}";
	xml += "table.header td {padding: 0px; font-size: 10pt;}";
	xml += "table.footer td {padding: 0;font-size: 6pt;}";
	xml += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
	xml += "table.body td {padding-top: 0px;}";
	xml += "table.total {page-break-inside: avoid;}";
	xml += "table.message{border: 1px solid #dddddd;}";
	xml += "tr.totalrow {line-height: 200%;}";
	xml += "tr.messagerow{font-size: 6pt;}";
	xml += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
	xml += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
	xml += "td.address {padding-top: 0;font-size: 10pt;}";
	xml += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
	xml += "td.totalcell {border-bottom: 1px solid black;border-collapse: collapse;}";
	xml += "td.message{font-size: 8pt;}";
	xml += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
	xml += "td.ordhead {padding-bottom: 10px;vertical-align: top;font-size:10px; }";
	xml += "td.orddet {padding-bottom: 0px;vertical-align: top;font-size:8px; border: 1px solid #d9d9d9; border-collapse: collapse; }";
	xml += "th.orddet {font-size:8px;}";
	xml += "span.title {font-size: 28pt;}";
	xml += "span.number {font-size: 16pt;}";
	xml += "span.itemname {font-weight: bold;line-height: 150%;}";
	xml += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
	xml += "</style>";
					
	//Macros
	//
	xml += "<macrolist>";
	xml += "<macro id=\"nlfooter\">";
	xml += "<table class=\"footer\" style=\"width: 100%;\">";
	xml += "<tr>";
	xml += "<td align=\"right\">Page <pagenumber/> of <totalpages/>";
	xml += "</td>";
	xml += "</tr>";
	xml += "</table>";
	xml += "</macro>";
					
	xml += "<macro id=\"nlheader\">";
	xml += "<table class=\"header\" style=\"width: 100%;\">";
	xml += "<tr>";
	xml += "<td align=\"center\">Work Order Shortage Report";
	xml += "</td>";
	xml += "</tr>";
	xml += "</table>";
	xml += "</macro>";
	xml += "</macrolist>";
	xml += "</head>";
							
	//Body
	//
	xml += "<body header=\"nlheader\" header-height=\"30px\" footer=\"nlfooter\" footer-height=\"10px\" padding=\"0.25cm 0.25cm 0.25cm 0.25cm\" size=\"A4-LANDSCAPE\">";

	if (Object.keys(orderedWorkOrderDetail).length > 0)
		{
			var firstHeader = true;
			var firstDetail = true;
			
			for (var workOrderKey in orderedWorkOrderDetail) 
				{
					//Order header
					//
					if (workOrderKey.split('|')[1] == '000000')
						{
							if (firstHeader)
								{
									firstHeader = false;
								}
							else
								{	
									//End the detail table
									//
									if (!firstDetail)
										{
											xml += "</table>";
											
										}
									
									xml += "</div>";
								}
							
							firstDetail = true;
							
							xml += "<div style=\"page-break-inside: avoid; margin-top: 20px;\">";
							
							xml += "<table class=\"ordhead\" style=\"width: 100%;\">";
							xml += "<thead>";
							xml += "<tr style=\"background-color: #e3e3e3;\">";
							xml += "<th colspan=\"2\" align=\"left\">Work<br/>Order</th>";
							xml += "<th colspan=\"2\" align=\"left\">Order<br/>Id</th>";
							xml += "<th colspan=\"4\" align=\"left\">Order<br/>Date</th>";
							xml += "<th colspan=\"4\" align=\"left\"><br/>Assembly</th>";
							xml += "<th colspan=\"2\" align=\"right\"># Items<br/>Ordered</th>";
							xml += "</tr>";
							xml += "</thead>";
							xml += "<tr>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"left\"><a href=\"/app/accounting/transactions/salesord.nl?id=" + orderedWorkOrderDetail[workOrderKey].orderId + "\" target=\"_blank\">"   + nlapiEscapeXML(orderedWorkOrderDetail[workOrderKey].orderNumber) + "</a></td>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"left\">" + orderedWorkOrderDetail[workOrderKey].orderId + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"4\" align=\"left\">" + orderedWorkOrderDetail[workOrderKey].orderDate + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"4\" align=\"left\">" + orderedWorkOrderDetail[workOrderKey].assemblyItemId + " " + orderedWorkOrderDetail[workOrderKey].assemblyItemDesc + "</td>";
							xml += "<td class=\"ordhead\" colspan=\"2\" align=\"right\">" + orderedWorkOrderDetail[workOrderKey].orderItemsTotal.toFixed(0) + "</td>";
							xml += "</tr>";
							
							xml += "</table>";
						
							csv += "\r\n";
							csv += '"Work Order","Order Id","Order Date","Assembly","# Items Ordered"\r\n';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].orderNumber + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].orderId + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].orderDate + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].assemblyItemId + ' ' + orderedWorkOrderDetail[workOrderKey].assemblyItemDesc + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].orderItemsTotal.toFixed(0) + '",';
							
						}
					else
						{
							//Order detail
							//
							if(firstDetail)
								{
									firstDetail = false;
									
									xml += "<table class=\"orddet\" style=\"margin-left: 70px; width: 100%; \">";
									xml += "<thead>";
									xml += "<tr>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"left\">Order<br/>Number</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"left\">Line<br/>Number</th>";
									xml += "<th class=\"orddet\" colspan=\"3\" align=\"left\"><br/>Item</th>";
									xml += "<th class=\"orddet\" colspan=\"3\" align=\"left\"><br/>Description</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\"><br/>Quantity</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\"><br/>Available Quantity</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\">Purchase<br/>Order</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\"><br/>PO Quantity</th>";
									xml += "<th class=\"orddet\" colspan=\"1\" align=\"right\">PO Due<br/>Date</th>";
									xml += "</tr>";
									xml += "</thead>";
									
									csv += "\r\n";
									csv += '"","Work Order","Line Number","Item","Description","Quantity","Available Quantity","Purchase Order","PO Quantity","PO Due Date"\r\n';
									
								}
		
							xml += "<tr>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"left\">" + nlapiEscapeXML(orderedWorkOrderDetail[workOrderKey].orderNumber) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"left\">" + orderedWorkOrderDetail[workOrderKey].lineNumber + "</td>";
							xml += "<td class=\"orddet\" colspan=\"3\" align=\"left\">" + nlapiEscapeXML(removePrefix(orderedWorkOrderDetail[workOrderKey].lineItemText)) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"3\" align=\"left\">" + orderedWorkOrderDetail[workOrderKey].lineItemDesc + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedWorkOrderDetail[workOrderKey].lineQuantity.toFixed(0) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedWorkOrderDetail[workOrderKey].lineAvailableQuantity.toFixed(0) + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\"><a href=\"/app/accounting/transactions/purchord.nl?id=" + orderedWorkOrderDetail[workOrderKey].linePoId + "\" target=\"_blank\">" + nlapiEscapeXML(orderedWorkOrderDetail[workOrderKey].linePoNo) + "</a></td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedWorkOrderDetail[workOrderKey].linePoQuantity + "</td>";
							xml += "<td class=\"orddet\" colspan=\"1\" align=\"right\">" + orderedWorkOrderDetail[workOrderKey].linePoDueDate + "</td>";
							xml += "</tr>";
							
							csv += '"","' + orderedWorkOrderDetail[workOrderKey].orderNumber + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].lineNumber + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].lineItemText + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].lineItemDesc + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].lineQuantity.toFixed(0) + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].lineAvailableQuantity.toFixed(0) + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].linePoNo + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].linePoQuantity + '",';
							csv += '"' + orderedWorkOrderDetail[workOrderKey].linePoDueDate + '"\r\n';
							
							
						}
				}
			
			
			
			
			//End the detail table
			//
			if(!firstDetail)
				{
					xml += "</table>";
					
				}
			
			//Finish the body
			//
			xml += "</div>";
			xml += "</body>";
					
			//Finish the pdf
			//
			xml += "</pdf>";
		}
	else
		{
			xml += "<p>No Data To Display</p>";
			xml += "</body>";
		
			//Finish the pdf
			//
			xml += "</pdf>";
		}
	
	if(_outputTypeCSV == 'T')
		{
			return csv;
		}
	else
		{
			//Convert to pdf using the BFO library
			//
			var pdfFileObject = nlapiXMLToPDF(xml);
			
			return pdfFileObject;
		}
}


//left padding s with c to a total of n chars
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

function getResults(_search)
{
	var searchResult = _search.runSearch();
	
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
				resultlen = moreSearchResultSet.length;

				searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;
}

function removePrefix(fullString)
{
	var returnString = fullString;
	
	var colon = fullString.indexOf(' : ');
	
	if(colon > -1)
		{
			returnString = fullString.substr(colon + 2);
		}
	
	return returnString;
}

//=====================================================================
//Objects
//=====================================================================
//
function workOrderInfo(_orderId, _orderNumber, _orderDate, _assemblyItemId, _assemblyItemDesc)
{
	this.orderId = _orderId;
	this.orderNumber = _orderNumber;
	this.orderDate = _orderDate;
	this.assemblyItemId = _assemblyItemId;
	this.assemblyItemDesc = _assemblyItemDesc;
	this.orderItemsTotal = Number(0);
	this.orderLineCount = Number(0);
	
	this.lineNumber = '';
	this.lineItemId = '';
	this.lineItemText = '';
	this.lineItemDesc = '';
	this.lineQuantity = Number(0);
	this.lineAvailableQuantity = Number(0);
	this.linePoNo = '';
	this.linePoDueDate = '';
	this.linePoQuantity = Number(0);
	this.linePoId = '';
}

function purchaseOrderInfo(_orderNumber, _orderDueDate, _poId, _poQuantity)
{
	this.orderNumber = _orderNumber;
	this.orderDueDate = _orderDueDate;
	this.orderId = _poId;
	this.orderQuantity = _poQuantity;
}

function worksOrderInfo(_orderNumber, _orderDueDate, _poId)
{
	this.orderNumber = _orderNumber;
	this.orderDueDate = _orderDueDate;	
	this.orderId = _poId;
}