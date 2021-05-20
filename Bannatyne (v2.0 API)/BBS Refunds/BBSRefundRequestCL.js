/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/https', 'N/ui/dialog', 'N/search'],
function(url, https, dialog, search) {

	function reject(recordID)
		{
			// display dialog asking the user to enter a rejection reason
			Ext.Msg.prompt('', 'Please enter a reason for rejecting the refund', function(btn, text) {
				
				// check if the user clicked the OK button
	    		if (btn == 'ok')
	    			{
		    	        // check if the user entered a rejection reason
	    				if (text)
	    					{
	    						// define URL of Suitelet
	    						var suiteletURL = url.resolveScript({
	    							scriptId: 'customscript_bbs_refund_rejection_sl',
	    							deploymentId: 'customdeploy_bbs_refund_rejection_sl',
	    							params: {
	    								'id': recordID,
	    								'reason': text
	    							}
	    						});
	    						
	    						// call a backend Suitelet to update the SO with the rejection reason
	    						https.get({
	    							url: suiteletURL
	    						});
	    						
	    						// reload the current record to display the changes to the user
	    						location.reload();
	    					}
	    				else // user clicked ok but did not enter a rejection reason
	    					{
	    						// display an alert to the user asking them to try again
	    						dialog.alert({
	    							title: '⚠️ Error',
	    							message: 'A rejection reason was not entered. Please click the Reject button and try again.'
	    						});
	    					}
		    	    }
			});
		}
	
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
    	
    	// if the sort code has been changed
    	if (scriptContext.fieldId == 'custrecord_refund_sort_code')
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get the value of the bank account detail fields
    			var accountNumber = currentRecord.getValue({
    				fieldId: 'custrecord_refund_bank_account_number'
    			});
    			
    			var sortCode = currentRecord.getValue({
    				fieldId: 'custrecord_refund_sort_code'
    			});
    			
    			// check the user has entered both an account number and a sort code
    			if (accountNumber && sortCode)
    				{
		    			// declare and initialize variables
    					var refundRequests = new Array();
    				
    					// run search to check if the bank details have been used before
		    			search.create({
		    				type: 'customrecord_refund_request',
		    				
		    				filters: [{
		    					name: 'isinactive',
		    					operator: search.Operator.IS,
		    					values: ['F']
		    				},
		    						{
		    					name: 'custrecord_refund_bank_account_number',
		    					operator: search.Operator.IS,
		    					values: [accountNumber]
		    				},
		    						{
		    					name: 'custrecord_refund_sort_code',
		    					operator: search.Operator.IS,
		    					values: [sortCode]
		    				}],
		    				
		    				columns: [{
		    					name: 'name'
		    				}],
		    			
		    			}).run().each(function(result){
		    				
		    				// get the refund request ID and push it to the refundRequests array
		    				refundRequests.push(
		    										result.getValue({
		    											name: 'name'
		    										})
		    									);
		    				
		    				// continue processing search results
		    				return true;
		    				
		    			});
		    			
		    			// if we have found any refund requests
		    			if (refundRequests.length > 0)
		    				{
		    					// display an alert to the user
			    				dialog.alert({
	    							title: '⚠️ Check Bank Details',
	    							message: 'The bank details you have entered have been used previously on the below refund request(s):<br><br>' + refundRequests + '<br><br>Please review and amend the bank details if required.'
	    						});
		    				}
    				}
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

    }

    return {
    	fieldChanged: fieldChanged,
        reject: reject
    };
    
});
