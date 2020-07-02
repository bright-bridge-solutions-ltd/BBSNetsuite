/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/task', 'N/format', 'N/url', 'N/redirect', 'N/ui/message'],
function(ui, search, task, format, url, redirect, message) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// on GET
    	if (context.request.method === 'GET')
			{
	    		// retrieve script parameters
    			var allowReEmail = context.request.parameters.allowreemail;
    			var scriptScheduled = context.request.parameters.scriptscheduled;
    			var subsidiary = context.request.parameters.subsidiary;
    			var dateFrom = context.request.parameters.datefrom;
    			var dateTo = context.request.parameters.dateto;
    			var invoiceType = context.request.parameters.invoicetype;
    			
    			log.debug({
    				title: 'Script Check',
    				details: dateFrom + '<br>' + dateTo
    			});
    			
    			// create form
				var form = ui.createForm({
	                title: 'Email Service Data Invoices',
	                hideNavBar: false
	            });
				
				// check if scriptScheduled returns true
				if (scriptScheduled == 'true')
					{
						// display a message at the top of the page
						form.addPageInitMessage({
				            type: message.Type.CONFIRMATION,
							title: 'Script Scheduled',
							message: 'The script to email invoices has been scheduled successfully'
						});
					}
				
				// set client script to run on the page
				form.clientScriptFileId = 24332;
				
				// add fields to the form
				var pageLogo = form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				var subsidiarySelect = form.addField({
					id: 'subsidiary',
					type: ui.FieldType.SELECT,
					label: 'Subsidiary',
					source: 'subsidiary'
				});
				
				// set default values of fields
				pageLogo.defaultValue = "<br><img src='https://5423837-sb1.app.netsuite.com/core/media/media.nl?id=2851&c=5423837_SB1&h=263dbead5b271f496136' alt='essensys Logo' style='width: 200px; height: 50px;'>";
				
				// update break types
				subsidiarySelect.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				
				// check the user has selected a subsidiary
				if (subsidiary)
					{
						// set value of 'Subsidiary' field
						subsidiarySelect.defaultValue = subsidiary;
					
						// add fields to the form
						var dateFromField = form.addField({
							id: 'datefrom',
							type: ui.FieldType.DATE,
							label: 'Date From'
						});
						
						var dateToField = form.addField({
							id: 'dateto',
							type: ui.FieldType.DATE,
							label: 'Date To'
						});
						
						// check if dateFrom and dateTo are empty
						if (dateFrom == null && dateTo == null)
							{
								// set value of date from/to fields to today
								dateFromField.defaultValue = new Date();
								dateToField.defaultValue = new Date();
							}
						else
							{
								// set value of date from/to fields using date parameters
								dateFromField.defaultValue = dateFrom;
								dateToField.defaultValue = dateTo;
							}
						
						var invoiceTypeField = form.addField({
							id: 'invoicetype',
							type: ui.FieldType.SELECT,
							label: 'Invoice Type'
						});
						
						// add select options to the invoice type field
						invoiceTypeField.addSelectOption({
							value: 0,
							text: ''
						});
						
						invoiceTypeField.addSelectOption({
							value: 1,
							text: 'Advance'
						});
						
						invoiceTypeField.addSelectOption({
							value: 2,
							text: 'Arrears'
						});
						
						// check if we have an invoiceType
						if (invoiceType)
							{
								// set value of the invoiceType field
								invoiceTypeField.defaultValue = invoiceType;
							}
						
						var numberOfInvoices = form.addField({
							id: 'numberofinvoices',
							type: ui.FieldType.INTEGER,
							label: 'Number of Invoices'
						});
						
						var numberOfInvoicesSelected = form.addField({
							id: 'numberofinvoicesselected',
							type: ui.FieldType.INTEGER,
							label: 'Number of Invoices Selected'
						});
						
						var allowReEmailField = form.addField({
							id: 'allowreemail',
							type: ui.FieldType.CHECKBOX,
							label: 'Allow Re-Email'
						});
						
						// update break types
						dateFromField.updateBreakType({
						    breakType : ui.FieldBreakType.STARTCOL
						});
						
						invoiceTypeField.updateBreakType({
						    breakType : ui.FieldBreakType.STARTCOL
						});
						
						numberOfInvoices.updateBreakType({
						    breakType : ui.FieldBreakType.STARTCOL
						});
						
						// update field display types
						numberOfInvoices.updateDisplayType({
							displayType: ui.FieldDisplayType.INLINE
						});
						
						numberOfInvoicesSelected.updateDisplayType({
							displayType: ui.FieldDisplayType.INLINE
						});
					
						// add a sublist to the form
						var invoiceSublist = form.addSublist({
							type: ui.SublistType.LIST,
							id: 'invoicesublist',
							label: 'Invoices',
						});
						
						// add fields to the sublist
						invoiceSublist.addField({
							type: ui.FieldType.CHECKBOX,
							id: 'email',
							label: 'Email'
						});
						
						invoiceSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'internalid',
							label: 'Internal ID'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
						
						invoiceSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'tranid',
							label: 'Tran ID'
						});
						
						invoiceSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'customername',
							label: 'Customer Name'
						});
						
						invoiceSublist.addField({
							type: ui.FieldType.TEXTAREA,
							id: 'customeremailaddresses',
							label: 'Customer Email Addresses'
						});
						
						invoiceSublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'amount',
							label: 'Amount'
						});
						
						// check if allowReEmail is true
						if (allowReEmail == 'true')
							{
								// tick 'Allow Re-Email' checkbox
								allowReEmailField.defaultValue = 'T';
								
								// add fields to sublist
								invoiceSublist.addField({
									type: ui.FieldType.CHECKBOX,
									id: 'emailsent',
									label: 'Email Already Sent'
								}).updateDisplayType({
									displayType: ui.FieldDisplayType.INLINE
								});
								
								invoiceSublist.addField({
									type: ui.FieldType.DATE,
									id: 'dateemailsent',
									label: 'Date Email Sent'
								}).updateDisplayType({
									displayType: ui.FieldDisplayType.INLINE
								});
							}
						
						// call function to search for invoice records. Pass subsdiary, allowReEmail, dateFrom, dateTo and invoiceType variables
						var searchResults = invoiceSearch(subsidiary, allowReEmail, dateFrom, dateTo, invoiceType);
						
						// initiate line variable
						var line = 0;
						
						// run search and process results
						searchResults.each(function(result){
							
							// retrieve search results
							var internalID = result.id;
							
							var tranID = result.getValue({
								name: 'tranid'
							});
							
							var customerName = result.getText({
								name: 'mainname'
							});
							
							var customerEmailAddresses = result.getValue({
								name: 'formulatext'
							});
							
							var amount = result.getValue({
								name: 'fxamount'
							});
							
							var emailSent = result.getValue({
								name: 'custbody_bbs_email_sent'
							});
							
							var dateEmailSent = result.getValue({
								name: 'custbody_bbs_date_email_sent'
							});
							
							// set sublist fields
							invoiceSublist.setSublistValue({
								id: 'internalid',
								line: line,
								value: internalID
							});
							
							invoiceSublist.setSublistValue({
								id: 'tranid',
								line: line,
								value: tranID
							});
							
							invoiceSublist.setSublistValue({
								id: 'customername',
								line: line,
								value: customerName
							});
							
							invoiceSublist.setSublistValue({
								id: 'customeremailaddresses',
								line: line,
								value: customerEmailAddresses
							});
							
							invoiceSublist.setSublistValue({
								id: 'amount',
								line: line,
								value: amount
							});
							
							// check if emailSent is true
							if (emailSent == true)
								{
									// format dateEmailSent as a date object
									dateEmailSent = format.format({
										type: format.Type.DATE,
										value: dateEmailSent
									});
								
									// tick 'Email Sent' checkbox
									invoiceSublist.setSublistValue({
										id: 'emailsent',
										line: line,
										value: 'T'
									});
									
									// set 'Date Email Sent' field
									invoiceSublist.setSublistValue({
										id: 'dateemailsent',
										line: line,
										value: dateEmailSent
									});
								}
							
							// increase line variable
							line ++;
							
							// continue processing additional results
							return true;
							
						});
						
						// add mark/unmark all buttons to the sublist
						invoiceSublist.addMarkAllButtons();
						
						// add submit button to the form
		   		 		form.addSubmitButton({
		   		 			label : 'Submit'
		   		 		});
					}
   		 		
   		 		// write the response to the page
				context.response.writePage(form);  	
			}
    	else if (context.request.method === 'POST') // on POST
    		{
    			// declare new array to hold IDs of invoices to be emailed
    			var invoicesArray = new Array();
    			
    			// get the subsidiary
    			var subsidiary = context.request.parameters.subsidiary;
    			
    			// get count of lines on the sublist
    			var lineCount = context.request.getLineCount('invoicesublist');
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the value of the 'Email' checkbox
    					var email = context.request.getSublistValue({
    						group: 'invoicesublist',
    						name: 'email',
    						line: i
    					});
    					
    					// only process lines where the email checkbox is ticked
    					if (email == 'T')
    						{
    						 	// get the internal ID of the invoice
    							var invoiceID = context.request.getSublistValue({
    	    						group: 'invoicesublist',
    	    						name: 'internalid',
    	    						line: i
    	    					});
    							
    							// push internalID to the invoicesArray
    							invoicesArray.push(invoiceID);
    						}
    				}
    			
    			// call function to schedule BBSEmailInvoicesMR script to send emails
    			sendEmails(invoicesArray, subsidiary);
    			
    			// get the URL of the Suitelet
    			var suiteletURL = url.resolveScript({
    				scriptId: 'customscript_bbs_email_invoice_sl',
    				deploymentId: 'customdeploy_bbs_email_invoice_sl',
    				params: {
    					scriptscheduled: true
    				}
    			});
    			
    			// redirect user to the Suitelet
				redirect.redirect({
				    url: suiteletURL
				});
    			
    		}

    }
    
    // ======================================================
    // FUNCTION TO SEARCH FOR INVOICE RECORDS TO BE PROCESSED
    // ======================================================
    
    function invoiceSearch(subsidiary, allowReEmail, dateFrom, dateTo, invoiceType)
    	{
    		// create search to find invoice records to be processed
    		var invoiceSearch = search.create({
    			type: search.Type.INVOICE,
    			
    			filters: [{
    				name: 'mainline',
    				operator: 'is',
    				values: ['T']
    			},
    					{
    				name: 'subsidiary',
    				operator: 'anyof',
    				values: [subsidiary]
    			},
						{
					name: 'amount',
					operator: 'greaterthan',
					values: [0]
				}],
    			
    			columns: [{
    				name: 'tranid'
    			},
    					{
    				name: 'mainname'
    			},
    					{
    				name: 'formulatext',
    				formula: "CONCAT({customermain.custentity_bbs_cust_trans_email},CONCAT('<br>', {customermain.custentity_bbs_cust_trans_cc}))"
    			},
    					{
    				name: 'fxamount'
    			},
    					{
    				name: 'custbody_bbs_email_sent'
    			},
    					{
    				name: 'custbody_bbs_date_email_sent'
    			}],

    		});
    		
    		// check if allowReEmail is NOT true
    		if (allowReEmail != 'true')
    			{
	    			// get the current search filters
    				var searchFilters = invoiceSearch.filters;
    				
    				// create new filter
    				var newSearchFilter = search.createFilter({
	    		            name: 'custbody_bbs_email_sent',
	    		            operator: 'is',
	    		            values: ['F']
	    		        });
	
    				// add the filter using .push() method
    				searchFilters.push(newSearchFilter);
    			}
    		
    		// check if dateFrom and dateTo are not null
    		if (dateFrom != null && dateTo != null)
    			{
	    			// get the current search filters
					var searchFilters = invoiceSearch.filters;
					
					// create new filter
					var newSearchFilter = search.createFilter({
	    		            name: 'datecreated',
	    		            operator: 'within',
	    		            values: [dateFrom, dateTo]
	    		        });
	
					// add the filter using .push() method
					searchFilters.push(newSearchFilter);
    			}
    		else
    			{
	    			// get the current search filters
					var searchFilters = invoiceSearch.filters;
					
					// create new filter
					var newSearchFilter = search.createFilter({
	    		            name: 'datecreated',
	    		            operator: 'within',
	    		            values: ['today']
	    		        });
	
					// add the filter using .push() method
					searchFilters.push(newSearchFilter);
    			}
    		
    		// check if invoiceType returns 1 (Advance)
    		if (invoiceType == 1)
    			{
	    			// get the current search filters
					var searchFilters = invoiceSearch.filters;
    			
    				// create new filter
					var newSearchFilter = search.createFilter({
		    				name: 'formulatext',
		    				operator: 'isempty',
		    				formula: '{custbody_bbs_service_data_records}'
		    		});
	
					// add the filter using .push() method
					searchFilters.push(newSearchFilter);
    			}
    		else if (invoiceType == 2) // if invoiceType is 2 (Arrears)
    			{
	    			// get the current search filters
					var searchFilters = invoiceSearch.filters;
					
					// create new filter
					var newSearchFilter = search.createFilter({
		    				name: 'formulatext',
		    				operator: 'isnotempty',
		    				formula: '{custbody_bbs_service_data_records}'
		    		});
	
					// add the filter using .push() method
					searchFilters.push(newSearchFilter);
    			}
    		
    		return invoiceSearch.run();
    		
    	}
    
    // =================================================
    // FUNCTION TO CALL MAP/REDUCE SCRIPT TO SEND EMAILS
    // =================================================
    
    function sendEmails(invoicesArray, subsidiary)
    	{
	    	// create a map/reduce task
	    	var mapReduceTask = task.create({
	    	    taskType: task.TaskType.MAP_REDUCE,
	    	    scriptId: 'customscript_bbs_email_invoice_mr',
	    	    deploymentId: 'customdeploy_bbs_email_invoice_mr',
	    	    params: {
	    	    	custscript_bbs_invoice_array: invoicesArray,
	    	    	custscript_bbs_subsidiary_select: subsidiary
	    	    }
	    	});
	    	
	    	// submit the map/reduce task
	    	var mapReduceTaskID = mapReduceTask.submit();
	    	
	    	log.audit({
	    		title: 'Script Scheduled',
	    		details: mapReduceTaskID
	    	});
    	}

    return {
        onRequest: onRequest
    };
    
});
