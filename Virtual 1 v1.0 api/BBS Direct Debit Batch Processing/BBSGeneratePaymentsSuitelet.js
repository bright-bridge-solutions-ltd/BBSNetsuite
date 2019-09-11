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
var DD_BATCH_SAVED_SEARCH = nlapiGetContext().getPreference('custscript_bbs_dd_batch_saved_search');



/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function generatePaymentsSuitelet(request, response)
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
			
			stage = (stage == null || stage == '' ? 1 : stage);
	
			// Create a form
			//
			var form = nlapiCreateForm('Create DD Batch Payments');
			form.setTitle('Create DD Batch Payments');
			
			//Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
			//
			var stageParamField = form.addField('custpage_param_stage', 'integer', 'Stage');
			stageParamField.setDisplayType('hidden');
			stageParamField.setDefaultValue(stage);
			
			
			//Work out what the form layout should look like based on the stage number
			//
			switch(stage)
				{
					case 1:	
						var paymenDateField = form.addField('custpage_payment_date', 'date', 'Payment Date');
						paymenDateField.setMandatory(true);
	
						var tab = form.addTab('custpage_tab_items', 'DD Batches To Select');
						tab.setLabel('DD Batches To Select');
						
						var tab2 = form.addTab('custpage_tab_items2', '');
						form.addField('custpage_tab2', 'text', 'test', null, 'custpage_tab_items2');
						
						var subList = form.addSubList('custpage_sublist_items', 'list', 'DD Batches To Select', 'custpage_tab_items');
						
						subList.setLabel('DD Batches To Select');
						
						//Add required buttons to sublist and form
						//
						subList.addMarkAllButtons();
						subList.addRefreshButton();
						form.addSubmitButton('Create DD Batch Payment Records');
						
						//Load up the custom saved search
						//
						var recordSearch = nlapiLoadSearch(null, DD_BATCH_SAVED_SEARCH);
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
																							
											}
									}
							}
	
						break;
						
					case 2:
						
						//Get the context & the users email address
						//
						var context = nlapiGetContext();
						var emailAddress = context.getEmail();
						
						//Add a message field 
						//
						var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
						messageField.setDisplaySize(120, 4);
						messageField.setDisplayType('readonly');
						messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the payment records have been completed.');
					
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
						
						var lineCount = request.getLineItemCount('custpage_sublist_items');
						var paymentDate = request.getParameter('custpage_payment_date'); 

						var batchesToProcess = [];
						
						//Loop round the sublist to find rows that are ticked
						//
						for (var int = 1; int <= lineCount; int++) 
							{
								var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
								
								if (ticked == 'T')
									{
										var batchId = request.getLineItemValue('custpage_sublist_items', 'custpage_sublist_pr_id', int);
												
										batchesToProcess.push(batchId);
									}
							}

						//Schedule the job to create the payments
						//
						var scheduleParams = {custscript_batches_array: JSON.stringify(batchesToProcess), custscript_pay_file_date: paymentDate};
						nlapiScheduleScript('customscript_bbs_payments_scheduled', null, scheduleParams);
						
						//Build up the parameters so we can call this suitelet again, but move it on to the next stage
						//
						var params = new Array();
						params['stage'] = ++stage;
						
						response.sendRedirect('SUITELET', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), null, params);
						
						break;
				}
		}
}

//=====================================================================
//Functions
//=====================================================================
//

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





