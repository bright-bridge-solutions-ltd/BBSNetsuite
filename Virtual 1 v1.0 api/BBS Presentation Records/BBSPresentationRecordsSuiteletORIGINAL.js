/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     cedricgriffiths
 *
 */

//=============================================================================================
//Configuration
//=============================================================================================
//	
var PR_AUTO_MARK_ALL = (nlapiGetContext().getPreference('custscript_bbs_pr_mark_all') == 'T' ? true : false);
var PR_AUTO_SEND_DOCS = (nlapiGetContext().getPreference('custscript_bbs_pr_auto_send') == 'T' ? true : false);
var PR_SAVED_SEARCH = nlapiGetContext().getPreference('custscript_bbs_pr_saved_search');
var PR_INVOICE_FORM_ID = nlapiGetContext().getPreference('custscript_bbs_pr_inv_form_id');
var PR_CREDIT_FORM_ID = nlapiGetContext().getPreference('custscript_bbs_pr_cn_form_id');
var MAX_BATCH_SIZE = Number(nlapiGetContext().getPreference('custscript_bbs_prbatch_size'));


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function presentationRecordsSuitelet(request, response)
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
		if(isNaN(MAX_BATCH_SIZE) || MAX_BATCH_SIZE == 0)
			{
				MAX_BATCH_SIZE = Number(50);
			}
		
		nlapiLogExecution('DEBUG', 'Max Pr Size', MAX_BATCH_SIZE);
		
		//Get request - so return a form for the user to process
		//
		
		//Get parameters
		//
		var stage = Number(request.getParameter('stage'));		//The stage the suitelet is in
		var sessionId = request.getParameter('session');		//The session id  which is used when refreshing a page with the 'refresh' button
		var recordType = request.getParameter('recordtype');	//Record Type C=Credit Notes, I=Invoices
		var billingType = request.getParameter('billingtype'); 	//Billing type (class)
		var billingFreq = request.getParameter('billingfreq'); 	//Billing frequency
		var billingGroup = request.getParameter('billinggroup'); //Billing group
		var batches = request.getParameter('batches'); 			//Batches (PR records)
		var billingDate = request.getParameter('billingdate'); 	//Billing date
		
		stage = (stage == null || stage == '' ? 1 : stage);

		// Create a form
		//
		var form = nlapiCreateForm('Create Presentation Records');
		form.setScript('customscript_bbs_pr_suitelet_client');
		form.setTitle('Create Presentation Records');
		
		//Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
		//
		var stageParamField = form.addField('custpage_param_stage', 'integer', 'Stage');
		stageParamField.setDisplayType('hidden');
		stageParamField.setDefaultValue(stage);
		
		//Store the session id in a field in the form so that it can be retrieved in the POST section of the code
		//
		var sessionIdParamField = form.addField('custpage_param_session_id', 'text', 'Session Id');
		sessionIdParamField.setDisplayType('hidden');
		sessionIdParamField.setDefaultValue(sessionId);
		
		//Store the record type in a field in the form so that it can be retrieved in the POST section of the code
		//
		var recordTypeParamField = form.addField('custpage_param_rec_type', 'text', 'Record Type');
		recordTypeParamField.setDisplayType('hidden');
		recordTypeParamField.setDefaultValue(recordType);
		
		//Store the billing type in a field in the form so that it can be retrieved in the POST section of the code
		//
		var billingTypeParamField = form.addField('custpage_param_billing_type', 'text', 'Billing Type');
		billingTypeParamField.setDisplayType('hidden');
		billingTypeParamField.setDefaultValue(billingType);
		
		//Store the billing frequency in a field in the form so that it can be retrieved in the POST section of the code
		//
		var billingFreqParamField = form.addField('custpage_param_billing_freq', 'text', 'Billing Frequency');
		billingFreqParamField.setDisplayType('hidden');
		billingFreqParamField.setDefaultValue(billingFreq);
		
		//Store the billing group in a field in the form so that it can be retrieved in the POST section of the code
		//
		var billingGroupParamField = form.addField('custpage_param_billing_group', 'text', 'Billing Group');
		billingGroupParamField.setDisplayType('hidden');
		billingGroupParamField.setDefaultValue(billingGroup);
		
		//Store the billing date in a field in the form so that it can be retrieved in the POST section of the code
		//
		var billingDateParamField = form.addField('custpage_param_billing_date', 'text', 'Billing Date');
		billingDateParamField.setDisplayType('hidden');
		billingDateParamField.setDefaultValue(billingDate);
		
		//Work out what the form layout should look like based on the stage number
		//
		switch(stage)
			{
				case 1:	
					
					//Get a session & save it away
					//
					var sessionId = libCreateSession();
					sessionIdParamField.setDefaultValue(sessionId);
					
					//Add a select field to pick the record type from
					//
					var recordTypeSelectField = form.addField('custpage_select_rec_type', 'select', 'Record Type', null, null);
					recordTypeSelectField.addSelectOption('', '', false);
					recordTypeSelectField.addSelectOption('C', 'Credit Notes', false);
					recordTypeSelectField.addSelectOption('I', 'Invoices', false);
					recordTypeSelectField.setMandatory(true);
					
					//Add a field for the billing type
					//
					var billingTypeSelectField = form.addField('custpage_select_bill_type', 'select', 'Billing Type', 'classification', null);
					
					//Add a field for the billing frequency
					//
					var billingTypeSelectField = form.addField('custpage_select_bill_freq', 'select', 'Billing Frequency', 'customlist_bbs_billing_frequency', null);
					
					//Add a field for the billing group
					//
					var billingTypeSelectField = form.addField('custpage_select_bill_group', 'select', 'Billing Group', 'customlist_billing_group_list', null);
					
					//Add a field for the billing date
					//
					var billingDateSelectField = form.addField('custpage_select_bill_date', 'date', 'Billing Date', null, null);
					billingDateSelectField.setMandatory(true);
					
					//Add a submit button to the form
					//
					form.addSubmitButton('Select Records');
					
					break;
			
					
				case 2:	
					
					
					//Work out what the title of the form/sub list should be
					//
					var titleText = '';
					switch(recordType)
						{
							case 'C':
								titleText = 'Credit Notes to Select';
								
								break;
								
							case 'I':
								titleText = 'Invoices to Select';
								
								break;
						}
					
					var tab = form.addTab('custpage_tab_items', titleText);
					tab.setLabel(titleText);
					
					var tab2 = form.addTab('custpage_tab_items2', '');
					form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
					
					var subList = form.addSubList('custpage_sublist_items', 'list', titleText, 'custpage_tab_items');
					
					subList.setLabel(titleText);
					
					//Display the max batch size
					//
					var maxBatchField = form.addField('custpage_max_batch', 'inlinehtml', '', null, 'custpage_tab_items');
					maxBatchField.setLayoutType('outsidebelow', 'startrow');
					maxBatchField.setDefaultValue('<p style="font-size:16px; color:DarkRed;">Maximum Presentation Records Allowed = ' + MAX_BATCH_SIZE.toString() + '</p>');
					
					//Add a field to the sub tab to refine the partner
					//
					var partnerSelectField = form.addField('custpage_select_partner', 'select', 'Partner', null, 'custpage_tab_items');
					
					//Add a field to show the count of records returned
					//
					var resultsTotalField = form.addField('custpage_select_total', 'integer', 'Initial Record Count', null, 'custpage_tab_items');
					resultsTotalField.setDisplayType('disabled');
					resultsTotalField.setDefaultValue(0);
					resultsTotalField.setBreakType('startcol');
					
					var resultsTickedField = form.addField('custpage_select_ticked', 'integer', 'Total Records Selected', null, 'custpage_tab_items');
					resultsTickedField.setDisplayType('disabled');
					resultsTickedField.setDefaultValue(0);
					
					
					//Add required buttons to sublist and form
					//
					subList.addMarkAllButtons();
					subList.addRefreshButton();
					form.addSubmitButton('Create Presentation Records');
					
					//Load up the custom saved search
					//
					var recordSearch = nlapiLoadSearch(null, PR_SAVED_SEARCH);
					var recordColumns = recordSearch.getColumns();
					
					//Add a tick box as the first column
					//
					subList.addField('custpage_sublist_tick', 'checkbox', 'Select', null);
					
					//Add the record id as the second column
					//
					var sublistField = subList.addField('custpage_sublist_pr_id', 'text', 'ID', null);
					sublistField.setDisplayType('disabled');
					
					
					//Now add all of the other columns from the saved search
					//
					for(var int = 0; int < recordColumns.length; int++)
						{
							var columnLabel = recordColumns[int].getLabel();
							var columnType = recordColumns[int]['type'];
							var columnSearchType = recordColumns[int]['searchtype'];
							var columnName = recordColumns[int]['name'];
							
							//If the column type is 'select' then we would want to display it as a text field, but also have a column to hold its id value as well
							//
							if(columnType == 'select')
							{
								var sublistField = subList.addField('custpage_sublist_id_' + columnName, 'text', 'custpage_sublist_id_' + columnName, null);
								sublistField.setDisplayType('hidden');
							}
						
							if(columnType == 'select' && columnSearchType == null)
								{
									columnType = 'text';
								}
							
							var columnId = 'custpage_sublist_' + columnName; //int.toString();
							
							var sublistField = subList.addField(columnId, columnType, columnLabel, columnSearchType);
							sublistField.setDisplayType('disabled');
						}

					
					//Add filter based on invoice/credit notes
					//
					if(recordType != null && recordType != '')
						{
							switch(recordType)
								{
									case 'C':
										recordSearch.addFilter(new nlobjSearchFilter( 'type', null, 'anyof', 'CustCred'));
										break;
										
									case 'I':
										recordSearch.addFilter(new nlobjSearchFilter( 'type', null, 'anyof', 'CustInvc' ));
										break;
								}
						}
				
					//Add filter based on billing type
					//
					if(billingType != null && billingType != '')
						{
							recordSearch.addFilter(new nlobjSearchFilter( 'class', null, 'anyof', billingType ));
						}
					
					//Add filter based on billing frequency
					//
					if(billingFreq != null && billingFreq != '')
						{
							recordSearch.addFilter(new nlobjSearchFilter( 'custcol_bbs_billing_frequency', null, 'anyof', billingFreq ));
						}
					
					//Add filter based on billing group
					//
					if(billingGroup != null && billingGroup != '')
						{
							recordSearch.addFilter(new nlobjSearchFilter( 'custentity_bbs_billing_group', 'customer', 'anyof', billingGroup ));
						}
					
					
					//Get the session record to see if we are filtering by partner and add filter if needed
					//
					var selectedPartner = libGetSessionData(sessionId);
					
					if(selectedPartner != null && selectedPartner != '')
						{
							recordSearch.addFilter(new nlobjSearchFilter( 'entity', null, 'anyof', selectedPartner ));
						}
					
					
					//Get the search results
					//
					var recordSearchResults = getResults(recordSearch);
					var partnerList = {};
					
					//Do we have any results to process
					//
					if(recordSearchResults != null && recordSearchResults.length > 0)
						{
							var lineNo = Number(0);
						
							//Loop through the results
							//
							for (var int2 = 0; int2 < recordSearchResults.length; int2++) 
								{
									lineNo++;
								
									//See if we need to set the ticked option by default
									//
									if(PR_AUTO_MARK_ALL)
										{
											subList.setLineItemValue('custpage_sublist_tick', lineNo, 'T');
										}
								
									//Populate the internal id column
									//
									var resultLineId = recordSearchResults[int2].getId();
									subList.setLineItemValue('custpage_sublist_pr_id', lineNo, resultLineId);
									
									//Loop through the columns
									//
									for (var int3 = 0; int3 < recordColumns.length; int3++) 
										{
											var rowColumnData = '';
											
											//See if the column has a text equivalent
											//
											rowColumnData = recordSearchResults[int2].getText(recordColumns[int3]);
											
											//If no text is returned, i.e. the column is not a lookup or list
											//
											if(rowColumnData == null)
												{
													rowColumnData = recordSearchResults[int2].getValue(recordColumns[int3]);
												}
											else
												{
													//If it did have a text value, then we need to save the id value as well
													//
													var tempColumnId = 'custpage_sublist_id_' + recordColumns[int3]['name'];
													var tempColumnData = recordSearchResults[int2].getValue(recordColumns[int3]);
													
													subList.setLineItemValue(tempColumnId, lineNo, tempColumnData);
												}
											
											//Get the column name in the sublist
											//
											var columnId = 'custpage_sublist_' + recordColumns[int3]['name']; //int3.toString();
											
											//Assign the value to the column
											//
											subList.setLineItemValue(columnId, lineNo, rowColumnData);
											
											//See if we have a result column called 'Partner' then we need to add this to the list of partners to filter by
											//
											if(recordColumns[int3]['label'] == 'Partner')
												{
													var partnerId = recordSearchResults[int2].getValue(recordColumns[int3]);
													var partnerText = recordSearchResults[int2].getText(recordColumns[int3]);
													
													partnerList[partnerId] = partnerText;
												}
										}
								}
							
							//Update the count field
							//
							resultsTotalField.setDefaultValue(recordSearchResults.length);
							if(PR_AUTO_MARK_ALL)
								{
									resultsTickedField.setDefaultValue(recordSearchResults.length);
								}
						}

					
					//Fill in the partner select list
					//
					partnerSelectField.addSelectOption('', '-- All --', true);
					
					for ( var partner in partnerList) 
						{
							partnerSelectField.addSelectOption(partner, partnerList[partner], false);
						}
			
					break;
					
				case 3:
				
					//Show the generated list of PR records and their current status
					//
					var batchesField = form.addField('custpage_batches', 'longtext', 'Batches', null, null);
					batchesField.setDisplayType('hidden');
					batchesField.setDefaultValue(batches);
					
					var warningField = form.addField('custpage_warning', 'inlinehtml', null, null, null);
					warningField.setDefaultValue('<p style="font-size:16px; color:DarkRed;">Refresh the screen to view the progress of the presentation records<p/>');
					warningField.setDisplayType('disabled');
					
					var tab = form.addTab('custpage_tab_items', 'Presentation Records Created');
					tab.setLabel('Presentation Records Created');
					
					var tab2 = form.addTab('custpage_tab_items2', '');
					
					form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
					
					var subList = form.addSubList('custpage_sublist_items', 'list', 'Presentation Records Created', 'custpage_tab_items');
					
					subList.setLabel('Presentation Records Created');
					
					var listView = subList.addField('custpage_sublist_view', 'url', 'View', null);
					listView.setLinkText('View');
					
					var listId = subList.addField('custpage_sublist_id', 'text', 'Internal Id', null);
					var listType = subList.addField('custpage_sublist_type', 'text', 'Record Type', null);
					var listName = subList.addField('custpage_sublist_name', 'text', 'Name', null);
					var listPartner = subList.addField('custpage_sublist_partner', 'text', 'Partner', null);
					var listStatus = subList.addField('custpage_sublist_status', 'text', 'Status', null);
					var listUpdated = subList.addField('custpage_sublist_updated', 'text', 'Update Status', null);
					
					if(batches != '')
						{
							var lineNo = Number(0);
							
							var batchesArray = JSON.parse(batches);
							
							if(batchesArray.length > 0)
								{
									var filters = new Array();
									filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', batchesArray);
									
									var columns = new Array();
									columns[0] = new nlobjSearchColumn('custrecord_bbs_pr_type');
									columns[1] = new nlobjSearchColumn('custrecord_bbs_pr_partner');
									columns[2] = new nlobjSearchColumn('custrecord_bbs_pr_inv_pay_term');
									columns[3] = new nlobjSearchColumn('name');
									columns[4] = new nlobjSearchColumn('custrecord_bbs_pr_status');
									columns[5] = new nlobjSearchColumn('custrecord_bbs_pr_internal_status');
									
									var batchResults = nlapiSearchRecord('customrecord_bbs_presentation_record', null, filters, columns);
									
									for (var int2 = 0; int2 < batchResults.length; int2++) 
										{
											lineNo++;
											
											subList.setLineItemValue('custpage_sublist_view', lineNo, nlapiResolveURL('RECORD', 'customrecord_bbs_presentation_record', batchResults[int2].getId(), 'VIEW'));
											subList.setLineItemValue('custpage_sublist_id', lineNo, batchResults[int2].getId());
											subList.setLineItemValue('custpage_sublist_type', lineNo, batchResults[int2].getText('custrecord_bbs_pr_type'));
											subList.setLineItemValue('custpage_sublist_name', lineNo, batchResults[int2].getValue('name'));
											subList.setLineItemValue('custpage_sublist_partner', lineNo, batchResults[int2].getText('custrecord_bbs_pr_partner'));
											subList.setLineItemValue('custpage_sublist_status', lineNo, batchResults[int2].getText('custrecord_bbs_pr_status'));
											subList.setLineItemValue('custpage_sublist_updated', lineNo, batchResults[int2].getText('custrecord_bbs_pr_internal_status'));
										}
								}
						}
					
					//Add a refresh button
					//
					subList.addRefreshButton();
					
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
		var stage = Number(request.getParameter('custpage_param_stage'));
		
		switch(stage)
		{
			case 1:
				var sessionId = request.getParameter('custpage_param_session_id');		//The session id  which is used when refreshing a page with the 'refresh' button
				var recordType = request.getParameter('custpage_select_rec_type');	//Record Type C=Credit Notes, I=Invoices
				var billingType = request.getParameter('custpage_select_bill_type'); 	//Billing type (class)
				var billingFreq = request.getParameter('custpage_select_bill_freq'); 	//Billing frequency
				var billingGroup = request.getParameter('custpage_select_bill_group'); 	//Billing group
				var billingDate = request.getParameter('custpage_select_bill_date'); 	//Billing datwe

				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['stage'] = ++stage;
				params['session'] = sessionId;
				params['recordtype'] = recordType;
				params['billingtype'] = billingType;
				params['billingfreq'] = billingFreq;
				params['billinggroup'] = billingGroup;
				params['billingdate'] = billingDate;
				
				
				response.sendRedirect('SUITELET', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
				
				break;
				
			case 2:
				
				var lineCount = request.getLineItemCount('custpage_sublist_items');
				var recordType = request.getParameter('custpage_param_rec_type');
				var billingDate = request.getParameter('custpage_param_billing_date');
				var sessionId = request.getParameter('custpage_param_session_id');		//The session id  which is used when refreshing a page with the 'refresh' button
				
				libClearSessionData(sessionId);
				
				var woArray = {};
				var now = new Date();
				var nowFormatted = new Date(now.getTime() + (now.getTimezoneOffset() * 60000)).format('Ymd:Hi');
				var batchesCreated = [];
				var todaysDate = new Date();
						
				//Loop round the sublist to find rows that are ticked
				//
				for (var int = 1; int <= lineCount; int++) 
					{
						var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
						
						if (ticked == 'T')
							{
								var woId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_pr_id', int);
								var recordType = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_type', int);
								var billingType = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id_class', int);
								var partner = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id_entity', int);
								var partnerContact = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id_contact', int);
								var paymentTerms = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id_terms', int);
										
								//Build the batch key (which is used as the batch description)
								//
								var key = '';

								switch(recordType)
									{
										case 'Invoice':
											key = recordType + ':' + partner + ':' + billingType + ':' + paymentTerms + ':' + partnerContact;
											break;
											
										case 'Credit Memo':
											key = recordType + ':' + partner + ':' + partnerContact;
											break;
									}
	
								if(!woArray[key])
									{
										woArray[key] = [woId];
									}
								else
									{
										woArray[key].push(woId);
									}
							}
					}
				
				//Limit the qty of batches to be a maximum of MAX_BATCH_SIZE or 30 whichever is smaller
				//
				var batchCount = Number(Object.keys(woArray).length);
				
				var count = Number(0);
				
				for ( var wo in woArray) 
					{
						count++;
							
						if(count > MAX_BATCH_SIZE)
							{
								delete woArray[wo];
							}
					}
						
				var prodBatchId = '';
						
				var woToProcessArray = {};
						
				//Loop round the batch keys to create the batches
				//
				for (var woKey in woArray) 
					{
						prPrefix = '';
						
						//Create the PR record
						//
						var prodBatchRecord = nlapiCreateRecord('customrecord_bbs_presentation_record');   // 2GU's
						
						//Update the basic fields on the PR record
						//
						var keyElements = woKey.split(':');
						
						if(keyElements[0] == 'Invoice')
							{
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_type', '2');
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner', keyElements[1]);
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_pay_term', keyElements[3]);
								//prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_due_date', calculateDueDate(todaysDate, keyElements[3]));
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_due_date', calculateDueDate(nlapiStringToDate(billingDate), keyElements[3]));
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner_contact', keyElements[4]);
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_billing_type', keyElements[2]);
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_proc_by_dd','0');
								prodBatchRecord.setFieldValue('customform', PR_INVOICE_FORM_ID);
								prPrefix = 'SINV';
							}
						else
							{
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_type', '1');
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner', keyElements[1]);
								prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner_contact', keyElements[2]);
								prodBatchRecord.setFieldValue('customform', PR_CREDIT_FORM_ID);
								prPrefix = 'SCRE';
							}
						
						prodBatchRecord.setFieldValue('custrecord_bbs_pr_status', '1'); //Status = 1 (Open)
						prodBatchRecord.setFieldValue('custrecord_bbs_pr_internal_status', '1'); //Status = 1 (Awaiting Transaction Allocation)
						prodBatchRecord.setFieldValue('custrecord_bbs_presentation_record_date', billingDate); //Transaction date
						
						
						//Save the batch record & get the id
						//
						prodBatchId = nlapiSubmitRecord(prodBatchRecord, true, true);  // 4GU's
						batchesCreated.push(prodBatchId);
						
						//Fixup the PR name
						//
						var prName = prPrefix + nlapiLookupField('customrecord_bbs_presentation_record', prodBatchId, 'name', false);
						nlapiSubmitField('customrecord_bbs_presentation_record', prodBatchId, 'name', prName, false);
						
						//Loop round the w/o id's associated with this batch
						//
						woIds = woArray[woKey];
								
						//Save the id of the created batch along with the works orders that go with it
						//
						woToProcessArray[prodBatchId] = woIds;
							
						
					}
						
				var scheduleParams = {custscript_pr_array: JSON.stringify(woToProcessArray), custscript_pr_type: recordType, custscript_pr_date: billingDate};
				nlapiScheduleScript('customscript_pr_scheduled', null, scheduleParams);
						
				var batchesCreatedText = JSON.stringify(batchesCreated);
				var params = new Array();
						
				params['stage'] = ++stage;
				params['batches'] = batchesCreatedText;
				params['billingdate'] = billingDate;
						
				response.sendRedirect('SUITELET', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
						
				
				break;
		}
	}
}

//=====================================================================
//Functions
//=====================================================================
//
function calculateDueDate(_startDate, _payTerms)
{
	var payTermsRecord = null;
	var dueDate = _startDate;
	
	try
		{
			payTermsRecord = nlapiLoadRecord('term', _payTerms);
		}
	catch(err)
		{
			payTermsRecord = null;
		}
	
	if(payTermsRecord != null)
		{
			var days = Number(payTermsRecord.getFieldValue('daysuntilnetdue'));
			
			try
				{
					dueDate = nlapiAddDays(_startDate, days);
				}
			catch(err)
				{
					dueDate = _startDate;
				}
		}
	
	return(nlapiDateToString(dueDate));
}

function removePrefix(fullString)
{
	var returnString = fullString;
	
	var colon = fullString.indexOf(' : ');
	
	if(colon > -1)
		{
			returnString = fullString.substr(colon + 2);
		}
	
	
	if(returnString.indexOf('EM') == 0)
		{
			returnString = returnString.substr(2);
		}
	
	return returnString;
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




