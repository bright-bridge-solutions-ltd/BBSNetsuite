/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/https', 'N/ui/message'],
function(url, https, message) {
    
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

    }
    
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

    return {
        pageInit: pageInit,
        emailInvoices: emailInvoices,
        connectFileSync: connectFileSync,
        createAdvanceReports: createAdvanceReports
    };
    
});
