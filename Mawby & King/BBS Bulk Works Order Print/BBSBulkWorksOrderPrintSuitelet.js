/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function woBulkPrintSuitelet(request, response)
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
	if (request.getMethod() == 'GET') 
		{
			//Get request - so return a form for the user to process
			//
			
			//Get parameters
			//
			var allowReprint 	= request.getParameter('allowreprint');
			var customerId 		= request.getParameter('customerid');
			var stage 			= Number(request.getParameter('stage'));
			var thickness 		= request.getParameter('thickness');
			var thicknessText 	= request.getParameter('thicknesstext');
			var productType 	= request.getParameter('producttype'); 
			var productTypeText = request.getParameter('producttypetext'); 
			var batches 		= request.getParameter('batches'); 
			var glassSpec 		= request.getParameter('glassspec'); 
			var glassSpecText 	= request.getParameter('glassspectext'); 
			var startDate 		= request.getParameter('startdate');
			var endDate 		= request.getParameter('enddate');
			var stockFlag 		= request.getParameter('stockflag');
			var stockFlagText 	= request.getParameter('stockflagtext');
			
			stage = (stage == null || stage == '' || stage == 0 ? 1 : stage);
			
			// Create a form
			//
			var form = nlapiCreateForm('Bulk Print Works Orders');
			form.setScript('customscript_bbs_bp_suitelet_client');
			
			//Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
			//
			var stageField = form.addField('custpage_stage', 'integer', 'stage');
			stageField.setDisplayType('hidden');
			stageField.setDefaultValue(stage);
			
			//Store the glass spec in a field in the form so that it can be retrieved in the POST section of the code
			//
			var glassSpecTextField = form.addField('custpage_glass_spec_text', 'text', 'Glass Spec Text');
			glassSpecTextField.setDisplayType('hidden');
			glassSpecTextField.setDefaultValue(glassSpecText);
			
			//Store the product type in a field in the form so that it can be retrieved in the POST section of the code
			//
			var productTypeTextField = form.addField('custpage_prod_type_text', 'text', 'Product Type Text');
			productTypeTextField.setDisplayType('hidden');
			productTypeTextField.setDefaultValue(productTypeText);
			
			//Store the thickness type text in a field in the form so that it can be retrieved in the POST section of the code
			//
			var thicknessTextField = form.addField('custpage_thickness_text', 'text', 'Thickness Text');
			thicknessTextField.setDisplayType('hidden');
			thicknessTextField.setDefaultValue(thicknessText);
			
			//Store the stockflag text in a field in the form so that it can be retrieved in the POST section of the code
			//
			var stockflagtextField = form.addField('custpage_stockflag_text', 'text', 'stockflag Text');
			stockflagtextField.setDisplayType('hidden');
			stockflagtextField.setDefaultValue(stockFlagText);
			
			//Set the form title
			//
			form.setTitle('Bulk Print Works Orders');
			
			//Add a field group for optional filters
			//
			var fieldGroup2 = form.addFieldGroup('custpage_grp2', 'Optional Filters');
	
			//Work out what the form layout should look like based on the stage number
			//
			switch(stage)
				{
					case 1:	
						//Add select fields
						//
						var customerField = form.addField('custpage_customer_select', 'select', 'Works Order Customer', 'customer', 'custpage_grp2');
						var producttypeField = form.addField('custpage_product_type_select', 'select', 'Product Type', 'customlist_bbs_item_product_type','custpage_grp2');
						var glassspecField = form.addField('custpage_glass_spec_select', 'select', 'Glass Spec', null,'custpage_grp2');
						var thicknessField = form.addField('custpage_thickness_select', 'select', 'Thickness', 'customlist_bbs_item_thickness','custpage_grp2');
						var stockflagField = form.addField('custpage_stockflag_select', 'select', 'Stock / Processed', 'customlist_bbs_item_stock_processed','custpage_grp2');
												
						//Hide the glass spec by default
						//
						//glassspecField.setDisplayType('hidden');
						
						var startDateField = form.addField('custpage_start_date', 'date', 'Ship Date Range From', null,'custpage_grp2');
						var endDateField = form.addField('custpage_end_date', 'date', 'Ship Date Range To', null,'custpage_grp2');
						
						var today = new Date();
						var todayString = nlapiDateToString(today);
						
						//startDateField.setDefaultValue(todayString);
						//endDateField.setDefaultValue(todayString);
						startDateField.setLayoutType('normal', 'startcol');
						
						//Add the allow reprint option
						//
						var allowReprintField = form.addField('custpage_allow_reprint_select', 'checkbox', 'Allow Reprint', null,'custpage_grp2');
						
						//Find the glass specs
						//
						var glassSpecSearch = nlapiSearchRecord("noninventoryresaleitem",null,
								[
								   ["type","anyof","NonInvtPart"], 
								   "AND", 
								   ["subtype","anyof","Resale"], 
								   "AND", 
								   ["custitem_bbs_item_product_type","anyof","5"]
								], 
								[
								   new nlobjSearchColumn("itemid").setSort(false), 
								   new nlobjSearchColumn("salesdescription")			   
								]
								);
						
						glassspecField.addSelectOption(0, '', true);
						
						if(glassSpecSearch)
							{
								for (var int4 = 0; int4 < glassSpecSearch.length; int4++) 
									{
										var glassSpecId = glassSpecSearch[int4].getId();
										var glassSpecDesc = glassSpecSearch[int4].getValue("salesdescription");
										
										glassspecField.addSelectOption(glassSpecId, glassSpecDesc, false);
									}
							}
						
						//Add a submit button to the form
						//
						form.addSubmitButton('Select Works Orders');
						
						break;
				
				case 2:	
						//Filter the items to display based on the criteria chosen in stage 1
						//
						var customerField = form.addField('custpage_customer_select', 'text', 'Assembly Customer', null, 'custpage_grp2');
						customerField.setDisplayType('disabled');
						
						if(customerId != '')
							{
								var text = nlapiLookupField('customer', customerId, 'companyname', false);
								customerField.setDefaultValue(text);
							}
						
						var producttypeField = form.addField('custpage_product_type_select', 'text', 'Product Type', null, 'custpage_grp2');
						producttypeField.setDisplayType('disabled');
						producttypeField.setDefaultValue(productTypeText);
							
						var glassspecField = form.addField('custpage_glass_spec_select', 'text', 'Glass Spec', null, 'custpage_grp2');
						glassspecField.setDisplayType('disabled');
						glassspecField.setDefaultValue(glassSpecText);
						
						if(productType != '5')
							{
								glassspecField.setDisplayType('hidden');
							}
						
						var thicknessField = form.addField('custpage_thickness_select', 'text', 'Thickness', null, 'custpage_grp2');
						thicknessField.setDisplayType('disabled');
						thicknessField.setDefaultValue(thicknessText);
		
						var stockflagField = form.addField('custpage_stockflag_select', 'text', 'Stock / Processed', null, 'custpage_grp2');
						stockflagField.setDisplayType('disabled');
						stockflagField.setDefaultValue(stockFlagText);
						
						var startDateField = form.addField('custpage_start_date', 'date', 'Ship Date Range From', null,'custpage_grp2');
						startDateField.setDisplayType('disabled');
						startDateField.setLayoutType('normal', 'startcol');
						
						if(startDate != '')
							{
								startDateField.setDefaultValue(startDate);
							}
						
						var endDateField = form.addField('custpage_end_date', 'date', 'Ship Date Range To', null,'custpage_grp2');
						endDateField.setDisplayType('disabled');
						
						if(endDate != '')
							{
								endDateField.setDefaultValue(endDate);
							}
						
						var allowReprintField = form.addField('custpage_allow_reprint_select', 'checkbox', 'Allow Reprint', null, 'custpage_grp2');
						allowReprintField.setDisplayType('disabled');
						allowReprintField.setDefaultValue(allowReprint);
		
						var tab = form.addTab('custpage_tab_items', 'Works Orders To Select');
						tab.setLabel('Works Orders To Select');
						
						var tab2 = form.addTab('custpage_tab_items2', '');
						
						form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
						
						var subList = form.addSubList('custpage_sublist_items', 'list', 'Works Orders To Select', 'custpage_tab_items');
						
						subList.setLabel('Works Orders To Select');
						
						//Add a mark/unmark button
						//
						subList.addMarkAllButtons();
						
						//Add the sublist fields
						//
						var listSelect 		= subList.addField('custpage_sublist_tick', 'checkbox', 'Select', null);
						var listWoNo 		= subList.addField('custpage_sublist_wo_no', 'text', 'Works Order No', null);
						var listSoNo 		= subList.addField('custpage_sublist_so_no', 'text', 'Sales Order No', null);
						var listCustomer 	= subList.addField('custpage_sublist_customer', 'text', 'WO Customer', null);
						var listAssembly 	= subList.addField('custpage_sublist_assembly', 'text', 'Assembly', null);
						var listQty 		= subList.addField('custpage_sublist_qty', 'float', 'Qty Required', null);
						var listShipDate 	= subList.addField('custpage_sublist_ship_date', 'date', 'Ship Date', null);
						var listShipPlanned = subList.addField('custpage_sublist_ship_planned', 'date', 'Planned Date', null);
						var listDate 		= subList.addField('custpage_sublist_date', 'date', 'Date Entered', null);
						var listProductType = subList.addField('custpage_sublist_product_type', 'text', 'Product Type', null);
						var listGlassSpec 	= subList.addField('custpage_sublist_glass_spec', 'text', 'Glass Spec', null);
						var listThickness 	= subList.addField('custpage_sublist_thickness', 'text', 'Thickness', null);
						var listStockFlag 	= subList.addField('custpage_sublist_stock_flag', 'text', 'Stock / Processed', null);
						var listPrintQty 	= subList.addField('custpage_sublist_copies', 'integer', 'Print Copies', null);
						//listPrintQty.setDisplayType('entry');
						
						var listPrinted = subList.addField('custpage_sublist_printed', 'checkbox', 'Printed', null);
						listPrinted.setDisplayType('disabled');
						
						var listId = subList.addField('custpage_sublist_id', 'text', 'Id', null);
						listId.setDisplayType('hidden');
						
						var listSoTranId = subList.addField('custpage_sublist_so_tranid', 'text', 'Sales Order TranId', null);
						listSoTranId.setDisplayType('hidden');
						
						var listCustEntityId = subList.addField('custpage_sublist_cust_entityid', 'text', 'Customer EntityId', null);
						listCustEntityId.setDisplayType('hidden');
						
						//Build the filter array
						//
						var filterArray = [
						                   ["mainline","is","T"], 
						                   "AND", 
						                   ["type","anyof","WorkOrd"], 
						                   "AND", 
						                   ["status","anyof","WorkOrd:A","WorkOrd:B","WorkOrd:D"]
						                ];
						
						if(customerId != '')
							{
								filterArray.push("AND",["entity","anyof",customerId]);
							}
						
						if(allowReprint != 'T')
							{
								filterArray.push("AND",["custbody_bbs_wo_printed","is",'F']);
							}
						
						if(thickness != '')
							{
								filterArray.push("AND",["item.custitem_bbs_item_thickness","anyof",thickness]);
							}
						
						if(stockFlag != '')
							{
								filterArray.push("AND",["item.custitem_bbs_item_stocked","is",stockFlag]);
							}
					
						//Search by product type except if the product type filter is set to 'glass spec'
						//
						if(productType != '' && productType != '5')
							{
								filterArray.push("AND",["item.custitem_bbs_item_product_type","anyof",productType]);
							}
						
						if(glassSpec != '' && glassSpec != '0')
							{
								filterArray.push("AND",["item.custitem_bbs_glass_spec","anyof",glassSpec]);
							}
						
						if(startDate != '')
							{
								filterArray.push("AND",["createdfrom.shipdate","onorafter",startDate]);
							}
						
						if(endDate != '')
							{
								filterArray.push("AND",["createdfrom.shipdate","onorbefore",endDate]);
							}
							
						var woSearch = getResults(nlapiCreateSearch("transaction", filterArray, 
								[
								   new nlobjSearchColumn("tranid",null,null), 
								   new nlobjSearchColumn("entity",null,null), 
								   new nlobjSearchColumn("item",null,null), 
								   new nlobjSearchColumn("custitem_bbs_item_belongs_to","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_thickness","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_stocked","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_product_type","item",null), 
								   new nlobjSearchColumn("custitem_bbs_glass_spec","item",null), 
								   new nlobjSearchColumn("quantity",null,null), 
								   new nlobjSearchColumn("datecreated",null,null), 
								   new nlobjSearchColumn("createdfrom",null,null),
								   new nlobjSearchColumn("tranid","createdFrom",null), 
								   new nlobjSearchColumn("externalid","customer",null),
								   new nlobjSearchColumn("shipdate","createdFrom",null),
								   new nlobjSearchColumn("custbody_bbs_sales_planned_ship","createdFrom",null),
								   new nlobjSearchColumn("custbody_bbs_wo_copies",null,null),
								   new nlobjSearchColumn("custbody_bbs_wo_printed",null,null)
								]
								));
								
						if(woSearch != null && woSearch.length > 0)
							{
								//Copy the results to the sublist
								//
								var line = Number(0);
								
								for (var int = 0; int < woSearch.length; int++) 
									{
										line++;
							
										subList.setLineItemValue('custpage_sublist_wo_no', line, woSearch[int].getValue('tranid'));
										subList.setLineItemValue('custpage_sublist_so_no', line, woSearch[int].getText('createdfrom'));
										subList.setLineItemValue('custpage_sublist_customer', line, woSearch[int].getText('entity'));
										subList.setLineItemValue('custpage_sublist_assembly', line, woSearch[int].getText('item'));
										subList.setLineItemValue('custpage_sublist_qty', line, woSearch[int].getValue('quantity'));
										
										subList.setLineItemValue('custpage_sublist_date', line, woSearch[int].getValue('datecreated').split(' ')[0]);
										
										subList.setLineItemValue('custpage_sublist_id', line, woSearch[int].getId());
										subList.setLineItemValue('custpage_sublist_so_tranid', line, woSearch[int].getValue('tranid','createdFrom'));
										subList.setLineItemValue('custpage_sublist_cust_entityid', line, woSearch[int].getValue('externalid','customer'));
										subList.setLineItemValue('custpage_sublist_ship_date', line, woSearch[int].getValue("shipdate","createdFrom"));
										subList.setLineItemValue('custpage_sublist_ship_planned', line, woSearch[int].getValue("custbody_bbs_sales_planned_ship","createdFrom"));
										
										subList.setLineItemValue('custpage_sublist_product_type', line, woSearch[int].getText('custitem_bbs_item_product_type', 'item'));
										subList.setLineItemValue('custpage_sublist_glass_spec', line, woSearch[int].getText('custitem_bbs_glass_spec'));
										subList.setLineItemValue('custpage_sublist_thickness', line, woSearch[int].getText('custitem_bbs_item_thickness', 'item'));
										subList.setLineItemValue('custpage_sublist_stock_flag', line, woSearch[int].getText("custitem_bbs_item_stocked","item"));
										
										subList.setLineItemValue('custpage_sublist_copies', line, woSearch[int].getValue('custbody_bbs_wo_copies'));
										subList.setLineItemValue('custpage_sublist_printed', line, woSearch[int].getValue('custbody_bbs_wo_printed'));	
									}
							}
						
						form.addSubmitButton('Bulk Print Works Orders');
			
						break;
		
					}
			
			//Write the response
			//
			response.writePage(form);
		}
	else
		{
			//Post request - so process the returned form
			//
			
			//Get the stage of the processing we are at
			//
			var stage = Number(request.getParameter('custpage_stage'));
			
			switch(stage)
				{
					case 1:
		
						var customerId 		= request.getParameter('custpage_customer_select');
						var allowReprint 	= request.getParameter('custpage_allow_reprint_select');
						var thickness 		= request.getParameter('custpage_thickness_select');
						var thicknesstext 	= request.getParameter('custpage_thickness_text');
						var producttype 	= request.getParameter('custpage_product_type_select');
						var producttypetext = request.getParameter('custpage_prod_type_text');
						var glassspec 		= request.getParameter('custpage_glass_spec_select');
						var glassspectext 	= request.getParameter('custpage_glass_spec_text');
						var startDate 		= request.getParameter('custpage_start_date');
						var endDate 		= request.getParameter('custpage_end_date');
						var stockflag 		= request.getParameter('custpage_stockflag_select');
						var stockflagtext 	= request.getParameter('custpage_stockflag_text');
						var otherrefnum 	= request.getParameter('custpage_stockflag_text');
						
						
						//Build up the parameters so we can call this suitelet again, but move it on to the next stage
						//
						var params 					= new Array();
						params['customerid'] 		= customerId;
						params['allowreprint'] 		= allowReprint;
						params['stage'] 			= '2';
						params['thickness'] 		= thickness;
						params['thicknesstext'] 	= thicknesstext;
						params['producttype'] 		= producttype;
						params['producttypetext'] 	= producttypetext;
						params['glassspec'] 		= glassspec;
						params['glassspectext'] 	= glassspectext;
						params['startdate'] 		= startDate;
						params['enddate'] 			= endDate;
						params['stockflag'] 		= stockflag;
						params['stockflagtext'] 	= stockflagtext;
						
						response.sendRedirect('SUITELET',nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
						
						break;
						
					case 2:
						
						var lineCount 	= request.getLineItemCount('custpage_sublist_items');
						var woObj 		= [];
						var today 		= new Date();
						var now 		= today.toUTCString();
						
						//
						//=====================================================================
						// Start the xml off with the basic header info & the start of a pdfset
						//=====================================================================
						//
						var xml 	= "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdfset>";  // Main XML
						var xmlPt 	= ''; 
						
						
						//Loop round the sublist to find rows that are ticked
						//
						for (var int = 1; int <= lineCount; int++) 
							{
								var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
										
								if (ticked == 'T')
									{
										var woId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id', int);
											
										woObj.push(woId);
									}
							}
		
						//Search for all of the wo data for the ticked lines
						//
						var workorderSearch = getResults(nlapiCreateSearch("workorder",
								[
								   ["type","anyof","WorkOrd"], 
								   "AND", 
								   ["mainline","is","T"], 
								   "AND", 
								   ["internalid","anyof",woObj]
								], 
								[
								   new nlobjSearchColumn("trandate"), 
								   new nlobjSearchColumn("tranid"), 
								   new nlobjSearchColumn("entity"), 
								   new nlobjSearchColumn("altname","customer",null), 
								   new nlobjSearchColumn("item"), 
								   new nlobjSearchColumn("memo"), 
								   new nlobjSearchColumn("quantity"), 
								   new nlobjSearchColumn("custbody_bbs_wo_copies"), 
								   new nlobjSearchColumn("custbody_bbs_wo_printed",null,null),
								   new nlobjSearchColumn("tranid","createdFrom",null), 
								   new nlobjSearchColumn("custbody_bbs_order_packing_notes","createdFrom",null), 
								   new nlobjSearchColumn("custbody_bbs_order_internal_note","createdFrom",null), 
								   new nlobjSearchColumn("custbody_bbs_order_delivery_notes","createdFrom",null), 
								   new nlobjSearchColumn("shipdate","createdFrom",null), 
								   new nlobjSearchColumn("custitem_bbs_item_bevel","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_brilliantcut","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_cwash","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_cut","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_doubleedge","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_drill","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_handcut","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_handwork","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_sfb","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_sle","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_swash","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_screenprint","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_slotting","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_toughen","item",null), 
								   new nlobjSearchColumn("custitem_bbs_item_wrapping","item",null)
								]
								));
						
						if(workorderSearch != null && workorderSearch.length > 0)
							{
								for (var resultCounter = 0; resultCounter < workorderSearch.length; resultCounter++) 
									{
										//Get the search results
										//
										var woId	 		= workorderSearch[resultCounter].getId();
										var woTranDate 		= workorderSearch[resultCounter].getValue("trandate");
										var woNumber 		= workorderSearch[resultCounter].getValue("tranid");
										var woCustomerId 	= workorderSearch[resultCounter].getValue("entity");
										var woCustomerName 	= workorderSearch[resultCounter].getValue("altname","customer");
										var woItemId		= workorderSearch[resultCounter].getValue("item");
										var woItemName		= workorderSearch[resultCounter].getText("item");
										var woMemo 			= workorderSearch[resultCounter].getValue("memo");
										var woQuantity 		= workorderSearch[resultCounter].getValue("quantity");
										var woCopies 		= Number(workorderSearch[resultCounter].getValue("custbody_bbs_wo_copies"));
										var woPrinted 		= workorderSearch[resultCounter].getValue("custbody_bbs_wo_printed");
										var woSalesOrder	= workorderSearch[resultCounter].getValue("tranid","createdFrom");
										var woShipDate		= workorderSearch[resultCounter].getValue("shipdate","createdFrom");
										var woPackNotes 	= workorderSearch[resultCounter].getValue("custbody_bbs_order_packing_notes","createdFrom");
										var woInternalNotes	= workorderSearch[resultCounter].getValue("custbody_bbs_order_internal_note","createdFrom");
										var woDeliveryNotes	= workorderSearch[resultCounter].getValue("custbody_bbs_order_delivery_notes","createdFrom");
										var woBevel			= workorderSearch[resultCounter].getValue("custitem_bbs_item_bevel","item");
										var woBrilliantCut	= workorderSearch[resultCounter].getValue("custitem_bbs_item_brilliantcut","item");
										var woCWash			= workorderSearch[resultCounter].getValue("custitem_bbs_item_cwash","item");
										var woCut			= workorderSearch[resultCounter].getValue("custitem_bbs_item_cut","item");
										var woDoubleEdge	= workorderSearch[resultCounter].getValue("custitem_bbs_item_doubleedge","item");
										var woDrill			= workorderSearch[resultCounter].getValue("custitem_bbs_item_drill","item");
										var woHandCut		= workorderSearch[resultCounter].getValue("custitem_bbs_item_handcut","item");
										var woHandWork		= workorderSearch[resultCounter].getValue("custitem_bbs_item_handwork","item");
										var woSFB			= workorderSearch[resultCounter].getValue("custitem_bbs_item_sfb","item");
										var woSLE			= workorderSearch[resultCounter].getValue("custitem_bbs_item_sle","item");
										var woSWash			= workorderSearch[resultCounter].getValue("custitem_bbs_item_swash","item");
										var woScreenPrint	= workorderSearch[resultCounter].getValue("custitem_bbs_item_screenprint","item");
										var woShapeBevel	= workorderSearch[resultCounter].getValue("custitem_bbs_item_","item");
										var woSlotting		= workorderSearch[resultCounter].getValue("custitem_bbs_item_slotting","item");
										var woToughen		= workorderSearch[resultCounter].getValue("custitem_bbs_item_toughen","item");
										var woWrapping		= workorderSearch[resultCounter].getValue("custitem_bbs_item_wrapping","item");
										var woCustPartNo 	= findCustPartNo(woCustomerId, woItemId);
										
										woCopies = (woCopies == null || woCopies == 0 ? 1 : woCopies);
										
										//Update the WO to say it has been printed
										//
										if(woPrinted != 'T')
											{
												try
													{
														nlapiSubmitField('workorder', woId, 'custbody_bbs_wo_printed', 'T', false);
													}
												catch(err)
													{
														nlapiLogExecution('ERROR', 'Error updating printed flag on works order id = ' + woId, err.message);
													}
											}
										
										//Process each work order into a pdf
										//
										xmlPt 		= '';
										var tickBox = 'https://5030713.app.netsuite.com/core/media/media.nl?id=4900&amp;c=5030713&amp;h=bca6ab8ca058a2e137be';
										
										for (var copyCounter = 1; copyCounter <= woCopies; copyCounter++) 
											{	
												//Header & style sheet
												//
												xmlPt += "<pdf>"
												xmlPt += "<head>";
												xmlPt += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
												xmlPt += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
												xmlPt += "td {padding: 0px;vertical-align: top;font-size:10px;}";
												xmlPt += "b {font-weight: bold;color: #333333;}";
												xmlPt += "table.header td {padding: 0px;font-size: 10pt;}";
												xmlPt += "table.footer td {padding: 0;font-size: 10pt;}";
												xmlPt += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
												xmlPt += "table.body td {padding-top: 0px;}";
												xmlPt += "table.total {page-break-inside: avoid;}";
												xmlPt += "table.message{border: 1px solid #dddddd;}";
												xmlPt += "tr.totalrow {line-height: 300%;}";
												xmlPt += "tr.messagerow{font-size: 6pt;}";
												xmlPt += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
												xmlPt += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
												xmlPt += "td.address {padding-top: 0;font-size: 10pt;}";
												xmlPt += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
												xmlPt += "td.totalcell {border: 1px solid black;border-collapse: collapse;}";
												xmlPt += "td.message{font-size: 8pt;}";
												xmlPt += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
												xmlPt += "span.title {font-size: 28pt;}";
												xmlPt += "span.number {font-size: 16pt;}";
												xmlPt += "span.itemname {font-weight: bold;line-height: 150%;}";
												xmlPt += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
												xmlPt += "</style>";
												xmlPt += "</head>";
												
												
												//Body
												//
												xmlPt += "<body padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
												xmlPt += "<table class=\"header\" style=\"width: 100%;\"><tr>";
												xmlPt += "<td>&nbsp;</td>";
												xmlPt += "<td align=\"right\">&nbsp;</td>";
												xmlPt += "<td align=\"right\">&nbsp;</td>";
												xmlPt += "<td align=\"right\" rowspan=\"6\"><img src=\"https://5030713.app.netsuite.com/core/media/media.nl?id=2269&amp;c=5030713&amp;h=df76bd14a6f1aa68ec27\" style=\"float: left; width:250px; height:80px;\" /></td>";
												xmlPt += "</tr>";
		
												xmlPt += "<tr>";
												xmlPt += "<td colspan=\"3\"><span style=\"font-size:20px; font-weight: bold;\">Production Ticket</span></td>";
												xmlPt += "<td align=\"right\">&nbsp;</td>";
												xmlPt += "</tr>";
												xmlPt += "</table>";
																								
												xmlPt += "<table style=\"width: 100%; margin-top: 20px;\">";
												xmlPt += "<tr>";
												xmlPt += "<td align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Order Details</b></td>";
												xmlPt += "</tr>";
												xmlPt += "</table>";
												
												xmlPt += "<table style=\"width: 100%; border: 1px solid black; \">";												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\"><b>Sales Order Id:</b></td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\"><b>" + woSalesOrder + "</b></td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\"><b>Customer:</b></td>";
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\"><b>" + woCustomerName + "</b></td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">Requested Delivery Date:</td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">" + nlapiStringToDate(woShipDate).format('d/m/Y') + "</td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">Product:</td>";
												xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">" + nlapiEscapeXML(woItemName) + "</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">Order QTY:</td>";
												xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">" + woQuantity + "</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">Customer Part Code:</td>";
												xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">" + woCustPartNo + "</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-left: 5px;\">Order Notes:</td>";
												xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; margin-right: 5px;\">" + nlapiEscapeXML(woPackNotes) + "</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"8\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">";
												
												xmlPt += "<table style=\"width: 100%;\">";
												xmlPt += "<tr style=\"line-height: 200%;\">";
												
												if(woCut == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">Cut</td>";
												
												if(woBevel == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">Bevel</td>";
												
												if(woSLE == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">SLE</td>";
												
												if(woBrilliantCut == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">BrilliantCut</td>";
												
												if(woSWash == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">SWash</td>";
												
												if(woShapeBevel == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">ShapeBevel</td>";
												
												if(woSlotting == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">Slotting</td>";
												
												if(woSFB == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">SFB</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												
												if(woHandCut == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">HandCut</td>";
												
												if(woDoubleEdge == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">DoubleEdge</td>";
												
												if(woDrill == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">Drill</td>";
												
												if(woHandWork == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">HandWork</td>";
												
												if(woCWash == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">CWash</td>";
												
												if(woScreenPrint == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">ScreenPrint</td>";
												
												if(woToughen == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">Toughen</td>";
												
												if(woWrapping == 'T')
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\"><img src=\"" + tickBox + "\" style=\"float: left; width:10px; height:10px;\" /></td>";
													}
												else
													{
														xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:10px; padding-left: 5px; padding-top: 4px;\">&nbsp;</td>";
													}
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:10px; padding-bottom: 2px;\">Wrapping</td>";
												xmlPt += "</tr>";									
												xmlPt += "</table>";
												
												xmlPt += "</td>";
												xmlPt += "</tr>";											
												xmlPt += "</table>";
																								
												xmlPt += "<table style=\"width: 100%; margin-top: 20px;\">";												
												xmlPt += "<tr>";
												xmlPt += "<td align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Production Data</b></td>";
												xmlPt += "</tr>";
												xmlPt += "</table>";
												
												xmlPt += "<table style=\"width: 100%; border: 1px solid black; \">";											
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\"><b>Works Order:</b></td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px; margin-right: 10px;\"><b>" + woNumber + "</b></td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px; margin-right: 5px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">Order Qty:</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 10px;\">" + woQuantity + "</td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">Employee Name:</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 5px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 200%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 2px;\">Produced Qty:</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 10px;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px;\">Clock Card No:</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 2px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 5px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 300%;\">";
												xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Wastage:</b></td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 250%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Seeds</td>";
												xmlPt += "<td colspan=\"3\"  align=\"left\" style=\"font-size:12px;\">Other Details:</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 250%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Scratches</td>";
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 5px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 250%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Stains</td>";
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 5px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 250%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Breakages</td>";
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 5px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 250%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Poor Process Quality</td>";
												xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; border-bottom: 1px solid; border-color: #cccccc; margin-right: 5px;\">&nbsp;</td>";
												xmlPt += "</tr>";
												
												xmlPt += "<tr style=\"line-height: 150%;\">";
												xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px;\">&nbsp;</td>";
												xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px;\">&nbsp;</td>";
												xmlPt += "</tr>";
								
												xmlPt += "</table>";
				
												xmlPt += "<table class=\"footer\" style=\"width: 100%; margin-top: 5px;\">";
												xmlPt += "<tr><td align=\"left\" style=\"font-size: 10px;\">Copy " + copyCounter + " of " + woCopies + "</td></tr>";
												xmlPt += "</table>";
												
												//Finish the body
												//
												xmlPt += "</body>";
												
												//Finish the pdf
												//
												xmlPt += "</pdf>";
											}
										
										//Update the main xml string
										//
										xml += xmlPt;
									}
								
								//Finish the pdfset
								//
								xml += "</pdfset>";
								
								//
								//=====================================================================
								// End of pdf generation
								//=====================================================================
								//
								
								
								//Convert to pdf using the BFO library
								//
								var pdfFileObject = null;
								
								try
									{
										pdfFileObject = nlapiXMLToPDF(xml);
									}
								catch(err)
									{
										pdfFileObject = null;
										nlapiLogExecution('ERROR', 'Error generating PDF output', err.message);
									}
								
								//Send back the output in the response message
								//
								if(pdfFileObject != null)
									{
										response.setContentType('PDF', 'Works Order Documents', 'inline');
										response.write(pdfFileObject.getValue());
									}
							}
						
						break;
				}
		}
}

//=====================================================================
//Functions
//=====================================================================
//

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
					start 	+= 1000;
					end 	+= 1000;
	
					var moreSearchResultSet = searchResult.getResults(start, end);
					
					if(moreSearchResultSet != null)
						{
							resultlen 		= moreSearchResultSet.length;
							searchResultSet = searchResultSet.concat(moreSearchResultSet);
						}
					else
						{
							resultlen = 0;
						}
			}
		
		return searchResultSet;
	}

function findCustPartNo(_customerId, _itemId)
	{
		var custPartNo = '';
		
		var customrecord_scm_customerpartnumberSearch = nlapiSearchRecord("customrecord_scm_customerpartnumber",null,
				[
				   ["custrecord_scm_cpn_customer","anyof",_customerId], 
				   "AND", 
				   ["custrecord_scm_cpn_item","anyof",_itemId]
				], 
				[
				   new nlobjSearchColumn("name").setSort(false)
				]
				);
		
		if(customrecord_scm_customerpartnumberSearch && customrecord_scm_customerpartnumberSearch.length == 1)
			{
				custPartNo = customrecord_scm_customerpartnumberSearch[0].getValue("name");
			}
		
		return custPartNo;
	}


