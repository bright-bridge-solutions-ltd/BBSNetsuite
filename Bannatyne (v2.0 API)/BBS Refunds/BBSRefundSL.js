/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/runtime', 'N/task'],
function(ui, search, file, runtime, task) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method == 'GET')
			{
    			// retrieve parameters that have been passed to the Suitelet
				var refundType	= context.request.parameters.refundtype;
				var subsidiary	= context.request.parameters.subsidiary;
    		
    			// create a new form
	    		var form = ui.createForm({
	                title: 'Generate Refund Report',
	                hideNavBar: false
	            });
	    		
	    		// set client script to run on the page
				form.clientScriptFileId = 409640;
	    		
	    		// add fields to the form
	    		form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				}).defaultValue = "<img src='https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&c=4537381_SB1&h=7a14b6798dff769d5845' alt='Bannatyne Logo' style='width: 226px; height: 48px;'>";
	    		
	    		var refundTypeSelect = form.addField({
	    			id: 'refundtypeselect',
	    			type: ui.FieldType.SELECT,
	    			label: 'Refund Type',
	    			source: 'customlist_tbg_refund_types'
	    		});
	    		
	    		var subsidiarySelect = form.addField({
	    			id: 'subsidiaryselect',
	    			type: ui.FieldType.SELECT,
	    			label: 'Subsidiary',
	    			source: 'subsidiary'
	    		});
	    		
	    		// update field break types
	    		refundTypeSelect.updateBreakType({
	    			breakType: ui.FieldBreakType.STARTCOL
	    		});
	    		
	    		subsidiarySelect.updateBreakType({
	    			breakType: ui.FieldBreakType.STARTCOL
	    		});
	    		
	    		// set fields to be mandatory
	    		refundTypeSelect.isMandatory = true;
	    		subsidiarySelect.isMandatory = true;
	    		
	    		// if we have a refund type and a subsidiary selected
	    		if (refundType && subsidiary)
	    			{
	    				// set the value of the refund type and subsidiary fields
	    				refundTypeSelect.defaultValue = refundType;
	    				subsidiarySelect.defaultValue = subsidiary;
	    				
	    				// add a sublist to the form
	    				var refundSublist = form.addSublist({
							type: ui.SublistType.LIST,
							id: 'refundsublist',
							label: 'Refund Requests',
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.CHECKBOX,
							id: 'refund',
							label: 'Refund'
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'internalid',
							label: 'Internal ID'
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.DATE,
							id: 'requestdate',
							label: 'Request Date'
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'customername',
							label: 'Customer Name'
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'refundreason',
							label: 'Reason for Refund'
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'refundamount',
							label: 'Refund Amount'
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'location',
							label: 'Location'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'accountname',
							label: 'Account Name'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'sortcode',
							label: 'Sort Code'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'accountnumber',
							label: 'Account Number'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'businessarea',
							label: 'Business Area'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});

	    				refundSublist.addField({
							type: ui.FieldType.EMAIL,
							id: 'emailaddress',
							label: 'Email Address'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.DATE,
							id: 'originaltransactiondate',
							label: 'Date of Original Transaction'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
	    				
	    				refundSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'last4digits',
							label: 'Last 4 Digits'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
	    				
	    				// initiate line variable
						var line = 0;
	    				
	    				// call function to search/return refund requests to be processed for the selected refund type/subsidiary
	    				var searchResults = searchRefundRequests(refundType, subsidiary);
	    				
	    				// process search results
	    				searchResults.run().each(function(result){
	    					
	    					// retrieve search results
	    					var recordID 		= result.id;
	    					var refundDate		= result.getValue({name: 'custrecord_refund_request_date'});
	    					var customerName	= result.getValue({name: 'custrecord_refund_customer_name'});
	    					var refundReason	= result.getText({name: 'custrecord_refund_reason'});
	    					var refundAmount	= result.getValue({name: 'custrecord_refund_amount'});
	    					var location		= result.getText({name: 'custrecord_refund_location'});
	    					var accountName		= result.getValue({name: 'custrecord_refund_bank_acc_name'});
	    					var sortCode		= result.getValue({name: 'custrecord_refund_sort_code'});
	    					var accountNumber	= result.getValue({name: 'custrecord_refund_bank_account_number'});
	    					var businessArea	= result.getText({name: 'custrecord_refund_business_area'});
	    					var emailAddress	= result.getValue({name: 'custrecord_refund_email'});
	    					var origTranDate	= result.getValue({name: 'custrecord_refund_date_orig_tran'});
	    					var lastFourDigits	= result.getValue({name: 'custrecord_refund_last_4_digits'});
	    					
	    					// set sublist fields
	    					refundSublist.setSublistValue({
								id: 'internalid',
								value: recordID,
								line: line
							});
	    					
	    					if (refundDate)
	    						{
			    					refundSublist.setSublistValue({
										id: 'requestdate',
										value: refundDate,
										line: line
									});
	    						}
	    					
	    					if (customerName)
	    						{
			    					refundSublist.setSublistValue({
										id: 'customername',
										value: customerName,
										line: line
									});
	    						}
	    					
	    					if (refundReason)
	    						{
			    					refundSublist.setSublistValue({
										id: 'refundreason',
										value: refundReason,
										line: line
									});
	    						}
	    					
	    					if (refundAmount)
	    						{
			    					refundSublist.setSublistValue({
										id: 'refundamount',
										value: refundAmount,
										line: line
									});
	    						}
	    					
	    					if (location)
	    						{
			    					refundSublist.setSublistValue({
										id: 'location',
										value: location,
										line: line
									});
	    						}
	    					
	    					if (accountName)
	    						{
			    					refundSublist.setSublistValue({
										id: 'accountname',
										value: accountName,
										line: line
									});
	    						}
	    					
	    					if (sortCode)
	    						{
			    					refundSublist.setSublistValue({
										id: 'sortcode',
										value: sortCode,
										line: line
									});
	    						}
	    					
	    					if (accountNumber)
	    						{
			    					refundSublist.setSublistValue({
										id: 'accountnumber',
										value: accountNumber,
										line: line
									});
	    						}
	    					
	    					if (businessArea)
	    						{
			    					refundSublist.setSublistValue({
										id: 'businessarea',
										value: businessArea,
										line: line
									});
	    						}
	    					
	    					if (emailAddress)
	    						{
			    					refundSublist.setSublistValue({
										id: 'emailaddress',
										value: emailAddress,
										line: line
									});
	    						}
	    					
	    					if (origTranDate)
	    						{
			    					refundSublist.setSublistValue({
										id: 'originaltransactiondate',
										value: origTranDate,
										line: line
									});
	    						}
	    					
	    					if (lastFourDigits)
	    						{
			    					refundSublist.setSublistValue({
										id: 'last4digits',
										value: lastFourDigits,
										line: line
									});
	    						}
	    					
	    					// increase line variable
							line++;
	    					
	    					// continue processing search results
	    					return true;
	    					
	    				});
	    				
	    				// add mark/unmark all buttons to the sublist
						refundSublist.addMarkAllButtons();
	    				
	    				// add submit button to the form
	    	    		form.addSubmitButton({
	       		 			label: 'Generate Report'
	       		 		});
	    			}
	    		
	    		// write the response to the page
				context.response.writePage(form);  		
			}
    	else if (context.request.method == 'POST')
    		{
	    		// declare and initialize variables
    			var fileObj 		= null;
    			var refundRequests 	= new Array();
    		
    			// get the value of the refund type and subsidiary select fields
				var refundType	= parseInt(context.request.parameters.refundtypeselect);
				var subsidiary	= parseInt(context.request.parameters.subsidiaryselect);
				
				// switch the refund type to generate the appropriate CSV report
				switch(refundType) {
				
				case 1: // Bank Payment
					
					// start off the CSV
					var CSV = '"Due Date","Club","Document No.","Bank Account Name","Sort Code","Account No","Reference","Amount","Code"\r\n';
					
					// get count of lines on the sublist
	    			var lineCount = context.request.getLineCount('refundsublist');
	    			
	    			// loop through line count
	    			for (var i = 0; i < lineCount; i++)
	    				{
	    					// get the value of the 'Refund' checkbox
	    					var refund = context.request.getSublistValue({
	    						group: 'refundsublist',
	    						name: 'refund',
	    						line: i
	    					});
	    					
	    					// only process lines where the refund checkbox is ticked
	    					if (refund == 'T')
	    						{
		    						// add the line to the CSV
		    						CSV += new Date().format('d/m/y') + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'location', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'internalid', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'accountname', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'sortcode', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'accountnumber', line: i}) + ',';
		    						CSV += 'Bannatyne Refund' + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'refundamount', line: i}) + ',';
		    						CSV += '99' + ',';
		    						CSV += '\r\n';
		    						
		    						// push the internal ID of the refund request to the refundRequests array
		    						refundRequests.push(context.request.getSublistValue({group: 'refundsublist', name: 'internalid', line: i}));
	    						}
	    				}
					
					// generate the CSV file
					fileObj = file.create({
						name: 'Bacs Report_' + new Date().format('dmy') + '.csv',
						fileType: file.Type.CSV,
						contents: CSV,
						folder:	runtime.getCurrentScript().getParameter({name: 'custscript_bbs_refund_reports_folder_id'})
					});
					
				break;
					
				case 2: // Giftcard (Loylap)
					
					// start off the CSV
					var CSV = '"Date of Request","Customer Name","Amount","Club","Document No.","Area of Business","Email Address"\r\n';
					
					// get count of lines on the sublist
	    			var lineCount = context.request.getLineCount('refundsublist');
					
					// loop through line count
	    			for (var i = 0; i < lineCount; i++)
	    				{
	    					// get the value of the 'Refund' checkbox
	    					var refund = context.request.getSublistValue({
	    						group: 'refundsublist',
	    						name: 'refund',
	    						line: i
	    					});
	    					
	    					// only process lines where the refund checkbox is ticked
	    					if (refund == 'T')
	    						{
		    						// add the line to the CSV
		    						CSV += new Date().format('d/m/y') + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'customername', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'refundamount', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'location', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'internalid', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'businessarea', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'emailaddress', line: i}) + ',';
		    						CSV += '\r\n';
		    						
		    						// push the internal ID of the refund request to the refundRequests array
		    						refundRequests.push(context.request.getSublistValue({group: 'refundsublist', name: 'internalid', line: i}));
	    						}
	    				}
					
					// generate the CSV file
					fileObj = file.create({
						name: 'Loylap Report_' + new Date().format('dmy') + '.csv',
						fileType: file.Type.CSV,
						contents: CSV,
						folder:	runtime.getCurrentScript().getParameter({name: 'custscript_bbs_refund_reports_folder_id'})
					});
				
				break;
				
				case 3: // SagePay
					
					// start off the CSV
					var CSV = '"Customer Name","Date of Original Transaction","Last 4 Digits of Payment Card","Amount","Club","Document No.","Area of Business"\r\n';
					
					// get count of lines on the sublist
	    			var lineCount = context.request.getLineCount('refundsublist');
					
					// loop through line count
	    			for (var i = 0; i < lineCount; i++)
	    				{
	    					// get the value of the 'Refund' checkbox
	    					var refund = context.request.getSublistValue({
	    						group: 'refundsublist',
	    						name: 'refund',
	    						line: i
	    					});
	    					
	    					// only process lines where the refund checkbox is ticked
	    					if (refund == 'T')
	    						{
		    						// add the line to the CSV
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'customername', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'originaltransactiondate', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'last4digits', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'refundamount', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'location', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'internalid', line: i}) + ',';
		    						CSV += context.request.getSublistValue({group: 'refundsublist', name: 'businessarea', line: i}) + ',';
		    						CSV += '\r\n';
		    						
		    						// push the internal ID of the refund request to the refundRequests array
		    						refundRequests.push(context.request.getSublistValue({group: 'refundsublist', name: 'internalid', line: i}));
	    						}
	    				}
					
					// generate the CSV file
					fileObj = file.create({
						name: 'SagePay Report_' + new Date().format('dmy') + '.csv',
						fileType: file.Type.CSV,
						contents: CSV,
						folder:	runtime.getCurrentScript().getParameter({name: 'custscript_bbs_refund_reports_folder_id'})
					});
				
				}
				
				// save the file to the file cabinet
				fileObj.save();
				
				// return the file to the browser
				context.response.writeFile({
					file: fileObj,
					isInline: false
				});
				
				// schedule a map/reduce task to mark the refund requests as processed
				var scheduledTaskID = task.create({
		    	    taskType: task.TaskType.SCHEDULED_SCRIPT,
		    	    scriptId: 'customscript_bbs_refund_scheduled',
		    	    deploymentId: null,
		    	    params: {
		    	    	custscript_bbs_refund_requests_array: refundRequests,
		    	    	custscript_bbs_refund_type: refundType,
		    	    	custscript_bbs_subsidiary: subsidiary
    	    	    }
		    	}).submit();
				
				log.audit({
					title: 'Scheduled Script Scheduled',
					details: scheduledTaskID
				});
    		}

    }
    
    // ======================================================
    // FUNCTION TO SEARCH FOR REFUND REQUESTS TO BE PROCESSED
    // ======================================================
    
    function searchRefundRequests(refundType, subsidiary) {
    	
    	return search.create({
    		type: 'customrecord_refund_request',
			
			filters: [{
				name: 'isinactive',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'custrecord_refund_processed',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'custrecord_refund_approval_status',
				operator: search.Operator.ANYOF,
				values: [2] // 2 = Approved
			},
					{
				name: 'custrecord_refund_method',
				operator: search.Operator.ANYOF,
				values: [refundType]
			},
					{
				name: 'custrecord_refund_subsidiary',
				operator: search.Operator.ANYOF,
				values: [subsidiary]
			}],
			
			columns: [{
				name: 'custrecord_refund_request_date'
			},
					{
				name: 'custrecord_refund_customer_name'
			},
					{
				name: 'custrecord_refund_reason'
			},
					{
				name: 'custrecord_refund_amount'
			},
					{
				name: 'custrecord_refund_location'	
			},
					{
				name: 'custrecord_refund_bank_acc_name'
			},
					{
				name: 'custrecord_refund_sort_code',
			},
					{
				name: 'custrecord_refund_bank_account_number'
			},
					{
				name: 'custrecord_refund_business_area'
			},
					{
				name: 'custrecord_refund_email'
			},
					{
				name: 'custrecord_refund_date_orig_tran'
			},
					{
				name: 'custrecord_refund_last_4_digits'
			}],
    	
    	});
    	
    }
    
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

    return {
        onRequest: onRequest
    };
    
});
