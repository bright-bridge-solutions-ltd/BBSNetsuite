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
var DD_SAVED_SEARCH = nlapiGetContext().getPreference('custscript_bbs_dd_saved_search');



/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function ddBatchRecordsSuitelet(request, response)
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
		var stage = Number(request.getParameter('stage'));				//The stage the suitelet is in
		var sessionId = request.getParameter('session');				//The session id  which is used when refreshing a page with the 'refresh' button
		var processingDate = request.getParameter('processingdate'); 	//Processing date
		var bankAccount = request.getParameter('bankaccount'); 			//Billing frequency
		var batches = request.getParameter('batches'); 					//Batches (PR records)
		var monthly = request.getParameter('monthly'); 					//Monthly Installments
		
		stage = (stage == null || stage == '' ? 1 : stage);

		// Create a form
		//
		var form = nlapiCreateForm('Create DD Batch Records');
		form.setScript('customscript_bbs_dd_suitelet_client');
		form.setTitle('Create DD Batch Records');
		
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
		
		//Store the processing date in a field in the form so that it can be retrieved in the POST section of the code
		//
		var processingDateParamField = form.addField('custpage_param_proc_date', 'text', 'Processing Date');
		processingDateParamField.setDisplayType('hidden');
		processingDateParamField.setDefaultValue(processingDate);
		
		//Store the bank account in a field in the form so that it can be retrieved in the POST section of the code
		//
		var bankAccountParamField = form.addField('custpage_param_bank_acc', 'text', 'Bank Account');
		bankAccountParamField.setDisplayType('hidden');
		bankAccountParamField.setDefaultValue(bankAccount);
		
		//Store the monthly installments in a field in the form so that it can be retrieved in the POST section of the code
		//
		var installmentsParamField = form.addField('custpage_param_monthly', 'text', 'Monthly Installments');
		installmentsParamField.setDisplayType('hidden');
		installmentsParamField.setDefaultValue(monthly);
		
		
		//Work out what the form layout should look like based on the stage number
		//
		switch(stage)
			{
				case 1:	
					
					//Get a session & save it away
					//
					var sessionId = libCreateSession();
					sessionIdParamField.setDefaultValue(sessionId);
					
					//Add a field for the processing date
					//
					var processingDateSelectField = form.addField('custpage_select_proc_date', 'date', 'Bank Clearing Date', null, null);
					processingDateSelectField.setMandatory(true);
					
					//Add a field for the bank account
					//
					var bankAccountSelectField = form.addField('custpage_select_bank_acc', 'select', 'Bank Account', null, null);
					bankAccountSelectField.setMandatory(true);
					
					//bankAccountSelectField.addSelectOption('0', '', false);
					
					var accountSearch = nlapiSearchRecord("account",null,
							[
							   ["type","anyof","Bank"], 
							   "AND", 
							   ["issummary","is","F"]
							], 
							[
							   new nlobjSearchColumn("name").setSort(false)
							]
							);
					
					if(accountSearch != null && accountSearch.length > 0)
						{
							for (var int2 = 0; int2 < accountSearch.length; int2++) 
								{
									var bankId = accountSearch[int2].getId();
									var bankName = accountSearch[int2].getValue('name');
									
									bankAccountSelectField.addSelectOption(bankId, bankName, false);
								}
						}
					
					//Add a field for the monthly installments
					//
					var installmentsSelectField = form.addField('custpage_select_monthly', 'select', 'Monthly Installments', null, null);
					installmentsSelectField.setMandatory(true);
					installmentsSelectField.addSelectOption('F', 'No', true);
					installmentsSelectField.addSelectOption('T', 'Yes', false);

					
					//Add a submit button to the form
					//
					form.addSubmitButton('Select Records');
					
					break;
			
					
				case 2:	
					
					var tab = form.addTab('custpage_tab_items', 'Presentation Invoices To Select');
					tab.setLabel('Presentation Invoices To Select');
					
					var tab2 = form.addTab('custpage_tab_items2', '');
					form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
					
					var subList = form.addSubList('custpage_sublist_items', 'list', 'Presentation Invoices To Select', 'custpage_tab_items');
					
					subList.setLabel('Presentation Invoices To Select');
					
					//Add a field to the sub tab to refine the due date
					//
					var dateFilterField = form.addField('custpage_filter_due_date', 'date', 'Due Date (on or before)', null, 'custpage_tab_items');
					
					//Add a field to the sub tab to refine the partner
					//
					var partnerSelectField = form.addField('custpage_filter_partner', 'select', 'Partner', null, 'custpage_tab_items');
					
					//Add required buttons to sublist and form
					//
					subList.addMarkAllButtons();
					subList.addRefreshButton();
					form.addSubmitButton('Create DD Batch Records');
					
					//Load up the custom saved search
					//
					var recordSearch = nlapiLoadSearch(null, DD_SAVED_SEARCH);
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
							
							var columnId = 'custpage_sublist_' + columnName; 
							
							var sublistField = subList.addField(columnId, columnType, columnLabel, columnSearchType);
							sublistField.setDisplayType('disabled');
						}
					
					var amountToPayField = subList.addField('custpage_amount_to_pay', 'currency', 'Amount To Pay', null);
					amountToPayField.setDisplayType('entry');
					//amountToPayField.setDisplayType('disabled');
					
					//Add the monthly installments criteria
					//
					//if(monthly == 'T')
					//	{
							recordSearch.addFilter(new nlobjSearchFilter( 'installment', 'custrecord_bbs_pr_inv_pay_term', 'is', monthly));
					//	}
					
					
					//Get the session record to see if we are filtering by due date and add filter if needed
					//
					var sessionData = JSON.parse(libGetSessionData(sessionId));
					
					if(sessionData != null && sessionData != '')
						{
							var selectedDueDate = sessionData['date'];
							var selectedCustomer = sessionData['customer'];
							
							if(selectedDueDate != null && selectedDueDate != '')
								{
									recordSearch.addFilter(new nlobjSearchFilter( 'custrecord_bbs_pr_inv_due_date', null, 'onorbefore', selectedDueDate ));
								}
						
							if(selectedCustomer != null && selectedCustomer != '')
								{
									recordSearch.addFilter(new nlobjSearchFilter( 'custrecord_bbs_pr_partner', null, 'anyof', selectedCustomer ));
								}
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
								
									subList.setLineItemValue('custpage_sublist_tick', lineNo, 'T');
								
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
									
									//See if we have a result column for amount outstanding
									//
									var oustandingAmount = recordSearchResults[int2].getValue('custrecord_bbs_pr_inv_outstanding');
									
									if(monthly == 'T')
										{
											subList.setLineItemValue('custpage_amount_to_pay', lineNo, 0);
										}
									else
										{
											if(oustandingAmount != null && oustandingAmount != '')
												{
													subList.setLineItemValue('custpage_amount_to_pay', lineNo, oustandingAmount);
												}
										}
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
					warningField.setDefaultValue('<p style="font-size:16px; color:DarkRed;">Refresh the screen to view the progress of the direct debit batch records<p/>');
					warningField.setDisplayType('disabled');
					
					var tab = form.addTab('custpage_tab_items', 'DD Batch Records Created');
					tab.setLabel('Presentation Records Created');
					
					var tab2 = form.addTab('custpage_tab_items2', '');
					
					form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
					
					var subList = form.addSubList('custpage_sublist_items', 'list', 'DD Batch Records Created', 'custpage_tab_items');
					
					subList.setLabel('DD Batch Records Created');
					
					var listView = subList.addField('custpage_sublist_view', 'url', 'View', null);
					listView.setLinkText('View');
					
					var listId = subList.addField('custpage_sublist_id', 'text', 'Internal Id', null);
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
									columns[0] = new nlobjSearchColumn('custrecord_bbs_dd_partner');
									columns[1] = new nlobjSearchColumn('name');
									columns[2] = new nlobjSearchColumn('custrecord_bbs_dd_status');
									columns[3] = new nlobjSearchColumn('custrecord_bbs_dd_internal_status');
									
									var batchResults = nlapiSearchRecord('customrecord_bbs_dd_batch', null, filters, columns);
									
									for (var int2 = 0; int2 < batchResults.length; int2++) 
										{
											lineNo++;
											
											subList.setLineItemValue('custpage_sublist_view', lineNo, nlapiResolveURL('RECORD', 'customrecord_bbs_dd_batch', batchResults[int2].getId(), 'VIEW'));
											subList.setLineItemValue('custpage_sublist_id', lineNo, batchResults[int2].getId());
											subList.setLineItemValue('custpage_sublist_name', lineNo, batchResults[int2].getValue('name'));
											subList.setLineItemValue('custpage_sublist_partner', lineNo, batchResults[int2].getText('custrecord_bbs_dd_partner'));
											subList.setLineItemValue('custpage_sublist_status', lineNo, batchResults[int2].getText('custrecord_bbs_dd_status'));
											subList.setLineItemValue('custpage_sublist_updated', lineNo, batchResults[int2].getText('custrecord_bbs_dd_internal_status'));
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
				var sessionId = request.getParameter('custpage_param_session_id');			//The session id  which is used when refreshing a page with the 'refresh' button
				var processingDate = request.getParameter('custpage_select_proc_date'); 	//Processing date
				var bankAccount = request.getParameter('custpage_select_bank_acc'); 		//Bank account
				var monthly = request.getParameter('custpage_select_monthly');				//Monthly Installments
				
				//Build up the parameters so we can call this suitelet again, but move it on to the next stage
				//
				var params = new Array();
				params['stage'] = ++stage;
				params['session'] = sessionId;
				params['processingdate'] = processingDate;
				params['bankaccount'] = bankAccount;
				params['monthly'] = monthly;
				
				
				response.sendRedirect('SUITELET', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
				
				break;
				
			case 2:
				
				var lineCount = request.getLineItemCount('custpage_sublist_items');
				var processingDate = request.getParameter('custpage_param_proc_date'); 	//Processing date
				var bankAccount = request.getParameter('custpage_param_bank_acc'); 		//Bank account
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
								var partner = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_id_custrecord_bbs_pr_partner', int);
								var amountToPay = request.getLineItemValue('custpage_sublist_items', 'custpage_amount_to_pay', int);
										
								//Build the batch key (which is used as the batch description)
								//
								var key = partner;
								var prDetailObject = new prDetails(woId, amountToPay);
								
								if(!woArray[key])
									{
										woArray[key] = [prDetailObject];
									}
								else
									{
										woArray[key].push(prDetailObject);
									}
							}
					}
					
						
				var ddBatchId = '';
						
				nlapiLogExecution('DEBUG', 'Count of DD batches', (Object.keys(woArray).length).toString());
						
				var woToProcessArray = {};
						
				//Loop round the batch keys to create the batches
				//
				for (var woKey in woArray) 
					{
						//Create the DD record
						//
						var ddBatchRecord = nlapiCreateRecord('customrecord_bbs_dd_batch');   	// 2GU's
						
						ddBatchRecord.setFieldValue('custrecord_bbs_dd_status', '1');
						ddBatchRecord.setFieldValue('custrecord_bbs_dd_partner', woKey);
						ddBatchRecord.setFieldValue('custrecord_bbs_dd_processing_date', processingDate);
						ddBatchRecord.setFieldValue('custrecord_bbs_dd_bank_account', bankAccount);			
						ddBatchRecord.setFieldValue('custrecord_bbs_dd_status', '1'); 			//Status = 1 (Open)
						ddBatchRecord.setFieldValue('custrecord_bbs_dd_internal_status', '1'); 	//Status = 1 (Awaiting Transaction Allocation)
						
						//Save the batch record & get the id
						//
						ddBatchId = nlapiSubmitRecord(ddBatchRecord, true, true);  // 4GU's
						batchesCreated.push(ddBatchId);
								
						//Loop round the w/o id's associated with this batch
						//
						woIds = woArray[woKey];
								
						//Save the id of the created batch along with the works orders that go with it
						//
						woToProcessArray[ddBatchId] = woIds;
								
					}
						
				var scheduleParams = {custscript_dd_array: JSON.stringify(woToProcessArray)};
				nlapiScheduleScript('customscript_bbs_dd_scheduled', null, scheduleParams);
					
				nlapiLogExecution('DEBUG', 'Data to scheduled job', JSON.stringify(woToProcessArray));
				
				var batchesCreatedText = JSON.stringify(batchesCreated);
				var params = new Array();
						
				params['stage'] = ++stage;
				params['batches'] = batchesCreatedText;
						
				response.sendRedirect('SUITELET', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
						
				
				break;
		}
	}
}

//=====================================================================
//Functions
//=====================================================================
//
function prDetails(_prId, _prAmountToPay)
{
	this.prId = _prId;
	this.prAmountToPay = _prAmountToPay;
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




