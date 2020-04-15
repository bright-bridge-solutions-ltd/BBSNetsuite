/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/url', 'N/https', 'N/search', 'N/format', 'N/record'],
function(message, url, https, search, format, record) {
    
    function cancelButton()
    	{
	    	// close the window
    		parent.close();
    	}
    
    function createQMPInvoices()
    	{
    		// ==============================================================
			// CALL BACKEND SUITELET TO SCHEDULE 'Create QMP Invoices' SCRIPT
			// ==============================================================
		
			// define URL of Suitelet
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_bbs_create_qmp_invoices_sl',
				deploymentId: 'customdeploy_bbs_create_qmp_invoices_sl'
			});
		
			// call a backend Suitelet to check if 'Billing Process Complete' company pref is set
			var response = 	https.get({
				url: suiteletURL
			});
			
			response = response.body; // get the response body
			
			// check if response is true
			if (response == 'true')
				{
					// display a confirmation message
					message.create({
						type: message.Type.CONFIRMATION,
				        title: 'Create QMP Invoices Scheduled',
				        message: 'The process for the creation of QMP invoices has been scheduled successfully.'
					}).show();
				}
			// check if response is false
			else if (response == 'false')
				{
					// display an error message
					message.create({
						type: message.Type.ERROR,
				        title: 'Error',
				        message: 'The billing process for QMP has not yet completed so the creation of QMP invoices cannot start.<br><br>Please wait until you have received an email informing you that the billing process has completed and try again.'
					}).show(5000); // show for 5 seconds	
				}		
    	}
    
    function createConsolidatedInvoices()
    	{
    		// return the URL of the 'Create Consolidated Invoices' Suitelet
			var reloadURL = url.resolveScript({
			    scriptId: 'customscript_nsts_ci_online_sl',
			    deploymentId: 'customdeploy_nsts_ci_online_sl'
			});
			
			// open the 'Create Consolidated Invoices' Suitelet in a new tab/window
    		window.open(reloadURL, '_blank');
    	}
    
    function updateContractUsage()
    	{
	    	// define URL of Suitelet
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_bbs_update_con_usage_sl',
				deploymentId: 'customdeploy_bbs_update_con_usage_sl'
			});
			
			// call a backend Suitelet to schedule the BBS Update Contract Usage MR script
			https.get({
				url: suiteletURL
			});
			
			// display a confirmation message
			message.create({
				type: message.Type.CONFIRMATION,
		        title: 'Contract Usage Update Scheduled',
		        message: 'Contract Usage Update script has been scheduled successfully.'
			}).show();
    	}
    
    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the value of the billing type field from the currentRecord object
    	var billingType = currentRecord.getValue({
    		fieldId: 'billingtypeselect'
    	});
    	
    	// get the text value of the billing type field from the currentRecord object
    	var billingTypeText = currentRecord.getText({
    		fieldId: 'billingtypeselect'
    	});
    	
    	// get the value of the subsidiary field from the currentRecord object
    	var subsidiary = currentRecord.getValue({
    		fieldId: 'subsidiaryselect'
    	});
    	
    	// get the text value of the subsidiary field from the currentRecord object
    	var subsidiaryText = currentRecord.getText({
    		fieldId: 'subsidiaryselect'
    	});
    	
    	// call function to check if the billing run has already been ran this month. Pass billingType and subsidiary
    	var billingAlreadyRan = searchBillingRun(billingType, subsidiary);
    	
    	// check if billingAlreadyRan is true
    	if (billingAlreadyRan == true)
    		{
    			// display an error message
	    		message.create({
					type: message.Type.ERROR,
			        title: 'Error',
			        message: 'The ' + billingTypeText + ' billing run for the ' + subsidiaryText + ' subsidiary cannot be scheduled as it has already been ran this month.'
				}).show();
	    		
	    		// prevent the Suitelet from being submitted
	    		return false;
    		}
    	else // billingAlreadyRan is false
    		{
    			// call function to find open sales orders for this billing type where the usage updated checkbox is NOT ticked. Pass billingType and subsidiary variables
				var salesOrders = searchSalesOrders(billingType, subsidiary);
				    	
				// check if the salesOrders variable is greater than 0
				if (salesOrders > 0)
				    {
					    // display an error message
						message.create({
							type: message.Type.ERROR,
							title: 'Error',
							message: 'The billing process for ' + billingTypeText + ' cannot be scheduled as there are open sales orders for the ' + subsidiaryText + ' subsidiary where the usage on the contract record has not been updated.<br><br><a href="https://5554661.app.netsuite.com/app/common/search/searchresults.nl?searchtype=Transaction&Transaction_SUBSIDIARY=' + subsidiary + '&BDY_CUSTRECORD_BBS_CONTRACT_BILLING_TYPE=' + billingType + '&style=NORMAL&report=&grid=&searchid=883">Click Here</a> to view details of these orders (this will open in a new tab/window)'
						}).show();
								
						// prevent the Suitelet from being submitted
						return false;
				   }
				else
				   {
				    	// allow the Suitelet to be submitted
				    	return true;
				   }
    		}
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function searchBillingRun(billingType, subsidiary)
    	{
    		// declare and initialize variables
    		var billingRunRecordID = null;
    		var lastRunDate = null;
    		
    		// create search to find BBS Billing Run record
    		var billingRunSearch = search.create({
    			type: 'customrecord_bbs_billing_run',
    			
    			filters: [{
    				name: 'custrecord_bbs_billing_run_billing_type',
    				operator: 'anyof',
    				values: [billingType]
    			},
    					{
    				name: 'custrecord_bbs_billing_run_subsidiary',
    				operator: 'anyof',
    				values: [subsidiary]
    			}],
    			
    			columns: [{
    				name: 'custrecord_bbs_billing_run_last_run_date'
    			}],
    			
    		});
    		
    		// run search and process results
    		billingRunSearch.run().each(function(result){
    			
    			// get the record ID from the search result
    			billingRunRecordID = result.id;
    			
    			// get the last run date from the search result
    			lastRunDate = result.getValue({
    				name: 'custrecord_bbs_billing_run_last_run_date'
    			});
    			
    		});
    		
    		// check that lastRunDate is not null
    		if (lastRunDate != null)
    			{
    				// format lastRunDate as a date object
    				lastRunDate = format.parse({
						type: format.Type.DATE,
						value: lastRunDate
					});
    				
    				// get today's date
    				var today = new Date();
    				
    				// get the month from the lastRunDate date object
    				var lastRunDateMonth = lastRunDate.getMonth()+1;
    				
    				// get the month from the today date object
    				var todayMonth = today.getMonth()+1;
    				
    				// check if the lastRunDateMonth and todayMonth variables are the same
    				if (lastRunDateMonth == todayMonth)
    					{
    						return true;
    					}
    				else // lastRunDateMonth and todayMonth variables are NOT the same
    					{
    						// call function to update the last run date field on the BBS Billing Run record. Pass billingRunRecordID
    						updateBillingRunRecord(billingRunRecordID);
    					
    						return false;
    					}
    			}
    		else // lastRunDate is null
    			{
    				// call function to create a new BBS Billing Run record. Pass billingType and subsidiary
    				createBillingRunRecord(billingType, subsidiary);
    				
    				return false;
    			}
    		
    	}
    
    function updateBillingRunRecord(billingRunRecordID)
    	{
    		try
    			{
    				// update the last run date field on the BBS Billing Run record
    				record.submitFields({
    					type: 'customrecord_bbs_billing_run',
    					id: billingRunRecordID,
    					values: {
    						custrecord_bbs_billing_run_last_run_date: new Date()
    					}
    				});
    				
    				log.audit({
    					title: 'BBS Billing Run Record Updated',
    					details: 'Record ID: ' + billingRunRecordID
    				});
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Updating BBS Billing Run Record',
    					details: e
    				});
    			}
    	}

    function createBillingRunRecord(billingType, subsidiary)
    	{
    		try
    			{
    				// create a new BBS Billing Run record
    				var billingRunRecord = record.create({
    					type: 'customrecord_bbs_billing_run'
    				});
    				
    				// set fields on the new record
    				billingRunRecord.setValue({
    					fieldId: 'custrecord_bbs_billing_run_billing_type',
    					value: billingType
    				});
    				
    				billingRunRecord.setValue({
    					fieldId: 'custrecord_bbs_billing_run_subsidiary',
    					value: subsidiary
    				});
    				
    				billingRunRecord.setValue({
    					fieldId: 'custrecord_bbs_billing_run_last_run_date',
    					value: new Date() // today
    				});
    				
    				// save the BBS Billing Run record
    				var billingRunRecordID = billingRunRecord.save();
    				
    				log.audit({
    					title: 'BBS Billing Run Record Created',
    					details: 'Record ID: ' + billingRunRecordID + '<br>Billing Type: ' + billingType + '<br>Subsidiary: ' + subsidiary
    				});    				
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Creating BBS Billing Run Record',
    					details: e
    				});
    			}
    	}
    
    function searchSalesOrders(billingType, subsidiary)
    	{
    		// declare and initialize variables
    		var salesOrders = 0;
    		
    		// create search to find open sales orders for this billing type where the usage updated checkbox is NOT ticked
	    	var salesOrderSearch = search.create({
	    		type: search.Type.SALES_ORDER,
	    		
	    		columns: [{
	    			name: 'tranid',
	    			summary: 'GROUP'
	    		}],
	    		
	    		filters: [{
	    			name: 'status',
	    			operator: 'anyof',
	    			values: ['SalesOrd:F'] // SalesOrd:F = Sales Order:Pending Billing
	    		},
	    		     	{
	    			name: 'custrecord_bbs_contract_billing_type',
	    			join: 'custbody_bbs_contract_record',
	    			operator: 'anyof',
	    			values: [billingType]
	    		},
	    				{
	    			name: 'custrecord_bbs_contract_exc_auto_bill',
	    			join: 'custbody_bbs_contract_record',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'subsidiary',
	    			operator: 'anyof',
	    			values: [subsidiary]
	    		},
	    				{
	    			name: 'custcol_bbs_usage_updated',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'custcol_bbs_so_search_date',
	    			operator: 'isnotempty'
	    		},
	    				{
	    			name: 'mainline',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'cogs',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'shipping',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'taxline',
	    			operator: 'is',
	    			values: ['F']
	    		}],
	    		
	    	});
	    	
	    	// run search and process search results
	    	salesOrderSearch.run().each(function(result) {
	    		
	    		// increase the salesOrders variable
	    		salesOrders++;
	    		
	    	});
    		
    	}

    return {
    	saveRecord: saveRecord,
    	cancelButton: cancelButton,
    	createQMPInvoices: createQMPInvoices,
    	createConsolidatedInvoices:  createConsolidatedInvoices,
    	updateContractUsage: updateContractUsage
    };
    
});
