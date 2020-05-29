/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/ui/message', 'N/format'],
function(url, message, format) {
    
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
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get a count of lines in the sublist
		var lineCount = currentRecord.getLineCount({
			sublistId: 'invoicesublist'
		});
		
		// set the 'Number of Invoices' field on the Suitelet
		currentRecord.setValue({
			fieldId: 'numberofinvoices',
			value: lineCount
		});

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
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// check that the 'Email' checkbox has been changed
    	if (scriptContext.sublistId == 'invoicesublist' && scriptContext.fieldId == 'email')
    		{
    			// declare/initialize variables
    			var numberOfInvoicesSelected = 0;
    		
    			// get a count of lines in the sublist
    			var lineCount = currentRecord.getLineCount({
    				sublistId: 'invoicesublist'
    			});
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get value of the 'Email' checkbox for the line
    					var email = currentRecord.getSublistValue({
    						sublistId: 'invoicesublist',
    						fieldId: 'email',
    						line: i
    					});
    					
    					// only process lines where the 'Email' checkbox is ticked
    					if (email == true)
    						{
    							// increase the numberOfInvoicesSelected variable
    							numberOfInvoicesSelected++;
    						}
    				}
    			
    			// set the 'Number of Invoices Selected' field on the Suitelet
    			currentRecord.setValue({
    				fieldId: 'numberofinvoicesselected',
    				value: numberOfInvoicesSelected
    			});
    		}
    	else if (scriptContext.fieldId == 'allowreemail') // if the 'Allow Re-Email' checkbox has been changed
    		{
    			// get the value of the 'Allow Re-Email' checkbox
    			var allowReEmail = currentRecord.getValue({
    				fieldId: 'allowreemail'
    			});
    			
    			// get the value of the 'Subsidiary' field
    			var subsidiary = currentRecord.getValue({
    				fieldId: 'subsidiary'
    			});
    			
    			// get the value of the 'Date From' field
    			var dateFrom = currentRecord.getValue({
    				fieldId: 'datefrom'
    			});
    			
    			// have we got a from date?
    			if (dateFrom)
    				{
    					// format dateFrom as a string
	    				dateFrom = format.format({
	        				type: format.Type.DATE,
	        				value: dateFrom
	        			});
    				}
    			
    			// get the value of the 'Date To' field
    			var dateTo = currentRecord.getValue({
    				fieldId: 'dateto'
    			});
    			
    			// have we got a to date?
    			if (dateTo)
    				{
    					// format dateTo as a string
    					dateTo = format.format({
	        				type: format.Type.DATE,
	        				value: dateTo
	        			});
    				}
    		
    			// get the value of the 'Invoice Type' field
				var invoiceType = currentRecord.getValue({
					fieldId: 'invoicetype'
				});
				
				// get the URL of the Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_email_invoice_sl',
					deploymentId: 'customdeploy_bbs_email_invoice_sl',
					params: {
						allowreemail: allowReEmail,
    					subsidiary: subsidiary,
    					datefrom: dateFrom,
    					dateto: dateTo,
    					invoicetype: invoiceType
					}
				});
    			
    			// reload the Suitelet
    			window.onbeforeunload = null;
				window.location.href = suiteletURL;
    			
    		}
    	else if (scriptContext.fieldId == 'subsidiary') // if the 'Subsidiary' field has been changed
    		{
	    		// get the value of the 'Subsidiary' field
				var subsidiary = currentRecord.getValue({
					fieldId: 'subsidiary'
				});
			
				// get the URL of the Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_email_invoice_sl',
					deploymentId: 'customdeploy_bbs_email_invoice_sl',
					params: {
						subsidiary: subsidiary
					}
				});
				
				// reload the Suitelet
				window.onbeforeunload = null;
				window.location.href = suiteletURL;
    			
    		}
    	else if (scriptContext.fieldId == 'datefrom') // if the 'Date From' field has been changed
    		{
    			// get the value of the 'Date From' field
    			var dateFrom = currentRecord.getValue({
    				fieldId: 'datefrom'
    			});
    			
    			// have we got a from date?
    			if (dateFrom)
    				{
    					// format dateFrom as a string
	    				dateFrom = format.format({
	        				type: format.Type.DATE,
	        				value: dateFrom
	        			});
    				}
    			
    			// get the value of the 'Date To' field
    			var dateTo = currentRecord.getValue({
    				fieldId: 'dateto'
    			});
    			
    			// have we got a to date?
    			if (dateTo)
    				{
    					// format dateTo as a string
    					dateTo = format.format({
	        				type: format.Type.DATE,
	        				value: dateTo
	        			});
    				}
    			
    			// get the value of the 'Allow Re-Email' checkbox
    			var allowReEmail = currentRecord.getValue({
    				fieldId: 'allowreemail'
    			});
    			
    			// get the value of the 'Subsidiary' field
    			var subsidiary = currentRecord.getValue({
    				fieldId: 'subsidiary'
    			});
    			
    			// get the value of the 'Invoice Type' field
				var invoiceType = currentRecord.getValue({
					fieldId: 'invoicetype'
				});
				
				// get the URL of the Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_email_invoice_sl',
					deploymentId: 'customdeploy_bbs_email_invoice_sl',
					params: {
						allowreemail: allowReEmail,
    					subsidiary: subsidiary,
    					datefrom: dateFrom,
    					dateto: dateTo,
    					invoicetype: invoiceType
					}
				});
				
				// reload the Suitelet
				window.onbeforeunload = null;
				window.location.href = suiteletURL;
    			
    		}
    	else if (scriptContext.fieldId == 'dateto') // if the 'Date To' field has been changed
    		{
	    		// get the value of the 'Date From' field
				var dateFrom = currentRecord.getValue({
					fieldId: 'datefrom'
				});
				
				// have we got a from date?
    			if (dateFrom)
    				{
    					// format dateFrom as a string
	    				dateFrom = format.format({
	        				type: format.Type.DATE,
	        				value: dateFrom
	        			});
    				}
    			
    			// get the value of the 'Date To' field
    			var dateTo = currentRecord.getValue({
    				fieldId: 'dateto'
    			});
    			
    			// have we got a to date?
    			if (dateTo)
    				{
    					// format dateTo as a string
    					dateTo = format.format({
	        				type: format.Type.DATE,
	        				value: dateTo
	        			});
    				}
				
				// get the value of the 'Allow Re-Email' checkbox
				var allowReEmail = currentRecord.getValue({
					fieldId: 'allowreemail'
				});
				
				// get the value of the 'Subsidiary' field
				var subsidiary = currentRecord.getValue({
					fieldId: 'subsidiary'
				});
				
				// get the value of the 'Invoice Type' field
				var invoiceType = currentRecord.getValue({
					fieldId: 'invoicetype'
				});
				
				// get the URL of the Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_email_invoice_sl',
					deploymentId: 'customdeploy_bbs_email_invoice_sl',
					params: {
						allowreemail: allowReEmail,
    					subsidiary: subsidiary,
    					datefrom: dateFrom,
    					dateto: dateTo,
    					invoicetype: invoiceType
					}
				});
				
				// reload the Suitelet
				window.onbeforeunload = null;
				window.location.href = suiteletURL;
    		}
    	else if (scriptContext.fieldId == 'invoicetype') // if the 'Invoice Type' field has been changed
    		{
	    		// get the value of the 'Date From' field
				var dateFrom = currentRecord.getValue({
					fieldId: 'datefrom'
				});
				
				// have we got a from date?
				if (dateFrom)
					{
						// format dateFrom as a string
	    				dateFrom = format.format({
	        				type: format.Type.DATE,
	        				value: dateFrom
	        			});
					}
				
				// get the value of the 'Date To' field
				var dateTo = currentRecord.getValue({
					fieldId: 'dateto'
				});
				
				// have we got a to date?
				if (dateTo)
					{
						// format dateTo as a string
						dateTo = format.format({
	        				type: format.Type.DATE,
	        				value: dateTo
	        			});
					}
				
				// get the value of the 'Allow Re-Email' checkbox
				var allowReEmail = currentRecord.getValue({
					fieldId: 'allowreemail'
				});
				
				// get the value of the 'Subsidiary' field
				var subsidiary = currentRecord.getValue({
					fieldId: 'subsidiary'
				});
				
				// get the value of the 'Invoice Type' field
				var invoiceType = currentRecord.getValue({
					fieldId: 'invoicetype'
				});
				
				// get the URL of the Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_email_invoice_sl',
					deploymentId: 'customdeploy_bbs_email_invoice_sl',
					params: {
						allowreemail: allowReEmail,
    					subsidiary: subsidiary,
    					datefrom: dateFrom,
    					dateto: dateTo,
    					invoicetype: invoiceType
					}
				});
				
				// reload the Suitelet
				window.onbeforeunload = null;
				window.location.href = suiteletURL;
    		}

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
    	
    	// declare and initialize variables
    	var invoicesToProcess = 0;
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get line count
    	var lineCount = currentRecord.getLineCount({
    		sublistId: 'invoicesublist'
    	});
    	
    	// loop through line count
    	for (var i = 0; i < lineCount; i++)
    		{
    			// get the value of the 'Email' checkbox for the line
    			var email = currentRecord.getSublistValue({
    				sublistId: 'invoicesublist',
    				fieldId: 'email',
    				line: i
    			});
    			
    			// only process lines where the 'Email' checkbox is ticked
				if (email == true)
					{
						// increase the invoicesToProcess variable
						invoicesToProcess++;
					}
    		}
    	
    	// check if invoicesToProcess variable is greater than 0
    	if (invoicesToProcess > 0)
    		{
    			// allow the Suitelet to be submitted
    			return true;
    		}
    	else
    		{
	    		// display an error message on the page
				message.create({
					type: message.Type.ERROR,
					title: 'Please Select At Least <b>1</b> Line',
					message: 'The Suitelet cannot be submitted as no lines have been selected.<br><br>Please select at least <b>1</b> line and try again.'
				}).show(5000); // show for 5 seconds
    		
    			// prevent the Suitelet from being submitted
    			return false;
    		}

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
