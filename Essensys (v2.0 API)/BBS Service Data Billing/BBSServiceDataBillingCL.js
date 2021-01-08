/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/https', 'N/ui/message', 'N/search', 'N/record', 'N/format'],
function(url, https, message, search, record, format) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

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
    	
    	// get the value and text value of the subsidiary field from the currentRecord object
    	var subsidiary = currentRecord.getValue({
    		fieldId: 'subsidiaryselect'
    	});
    	
    	var subsidiaryName = currentRecord.getText({
    		fieldId: 'subsidiaryselect'
    	});
    	
    	// call function to check if the billing run has already been ran this month. Pass subsidiary
    	var billingAlreadyRan = searchBillingRun(subsidiary);
    	
    	// check if billingAlreadyRan is true
    	if (billingAlreadyRan == true)
    		{
    			// display an error message
	    		message.create({
					type: message.Type.ERROR,
			        title: 'Error',
			        message: 'The billing run for the ' + subsidiaryName + ' subsidiary cannot be scheduled as it has already been run this month.'
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
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function emailInvoices()
    	{
	    	// get the URL of the Suitelet
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_bbs_email_invoice_sl',
				deploymentId: 'customdeploy_bbs_email_invoice_sl'
			});
			
			// open the 'Suitelet in a new tab/window
    		window.open(suiteletURL, '_blank');
    	}
    
    function connectFileSync()
    	{
	    	// get the URL of the Suitelet
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_bbs_connect_file_sync_sl',
				deploymentId: 'customdeploy_bbs_connect_file_sync_sl'
			});
			
			// open the 'Suitelet in a new tab/window
			window.open(suiteletURL, '_blank');
    	}
    
    function createAdvanceReports()
    	{
	    	// ==========================================================================
			// CALL BACKEND SUITELET TO SCHEDULE CREATE ADVANCE REPORTS MAP/REDUCE SCRIPT
			// ==========================================================================
    	
    		// define URL of Suitelet
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_bbs_advance_reports_sl',
				deploymentId: 'customdeploy_bbs_advance_reports_sl'
			});
		
			// call the Suitelet
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
				        title: 'Create Advance Reports Scheduled',
				        message: 'The process for the creation of advance reports has been scheduled successfully.'
					}).show();
				}
			// check if response is false
			else if (response == 'false')
				{
					// display an error message
					message.create({
						type: message.Type.ERROR,
				        title: 'Error',
				        message: 'There was an error scheduling the creation of advance reports.<br><br>Please see script logs for further details.'
					}).show(5000); // show for 5 seconds
				}
    	}
    
    function searchBillingRun(subsidiary)
    	{
    		// declare and initialize variables
    		var billingRunRecordID = null;
    		var lastRunDate = null;
    		
    		// create search to find BBS Billing Run record
    		var billingRunSearch = search.create({
    			type: 'customrecord_bbs_billing_run',
    			
    			filters: [{
    				name: 'custrecord_bbs_billing_run_subsidiary',
    				operator: search.Operator.ANYOF,
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
    				// call function to create a new BBS Billing Run record. Pass billingType
    				createBillingRunRecord(subsidiary);
    				
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

    function createBillingRunRecord(subsidiary)
    	{
    		try
    			{
    				// create a new BBS Billing Run record
    				var billingRunRecord = record.create({
    					type: 'customrecord_bbs_billing_run'
    				});
    				
    				// set fields on the new record
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
    					details: 'Record ID: ' + billingRunRecordID + '<br>Subsidiary: ' + subsidiary
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

    return {
        saveRecord: saveRecord,
        emailInvoices: emailInvoices,
        connectFileSync: connectFileSync,
        createAdvanceReports: createAdvanceReports
    };
    
});
