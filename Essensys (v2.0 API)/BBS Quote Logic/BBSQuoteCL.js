/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/url', 'N/https'],
function(dialog, url, https) {
    
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
    	
    	// check which field has been edited
    	if (scriptContext.fieldId == 'billingschedule' || scriptContext.fieldId == 'rate')
    		{
    			// tick the 'Non Standard Order' checkbox
    			scriptContext.currentRecord.setValue({
    				fieldId: 'custbody_bbs_non_standard_order',
    				value: true
    			});
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
    
    function reject(recordID) {
    	
    	// display dialog asking the user to enter a rejection reason
    	Ext.Msg.prompt('Reject', 'Please enter a reason for rejecting the Estimate/Quote', function(btn, text) {
    	    
    		// check if the user clicked the OK button
    		if (btn == 'ok')
    			{
	    	        // check if the user entered a rejection reason
    				if (text)
    					{
    						// define URL of Suitelet
    						var suiteletURL = url.resolveScript({
    							scriptId: 'customscript_bbs_quote_rejection_sl',
    							deploymentId: 'customdeploy_bbs_quote_rejection_sl',
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
    
    function transformToSalesOrder(recordID) {
    	
    	// define URL of Suitelet
		var suiteletURL = url.resolveScript({
			scriptId: 'customscript_bbs_transform_quote_sl',
			deploymentId: 'customdeploy_bbs_transform_quote_sl',
			params: {
				'id': recordID
			}
		});
		
		// call a backend Suitelet to update the estimate
		https.get({
			url: suiteletURL
		});
		
		// reload the current record to display the changes to the user
		location.reload();
    	
    }

    return {
        fieldChanged: fieldChanged,
        reject: reject,
        transformToSalesOrder: transformToSalesOrder
    };
    
});
