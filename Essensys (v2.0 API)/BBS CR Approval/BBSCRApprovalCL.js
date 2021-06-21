/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/url'],
function(dialog, url) {
    
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
    
    function approve(recordID, invoiceID, total, level1Approved) {
    	
    	// define URL of Suitelet
		var suiteletURL = url.resolveScript({
			scriptId: 'customscript_bbs_cr_approval_sl',
			deploymentId: 'customdeploy_bbs_cr_approval_sl',
			params: {
				'id': recordID,
				'invoice': invoiceID,
				'total': total,
				'level1Approved': level1Approved
			}
		});
		
		Ext.Ajax.timeout = (60000*5);
		
		var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'<span style="font-size: 10pt;">The Credit Note Request is being Approved<br><br>Please Wait...</span>'});
		myMask.show();
		
		// call a backend Suitelet to update the PO with the rejection reason
		Ext.Ajax.request({
							url: suiteletURL,
							method: 'GET',
							success: function (response, result) {
								myMask.hide();
								location.reload();
							},
							failure: function (response, result) {
								myMask.hide();
								alert("Error Approving the Credit Note Request");
							}
						});
    }
    
    function reject(recordID) {
    	
    	// display dialog asking the user to enter a rejection reason
    	Ext.Msg.prompt('Reject', 'Please enter a reason for rejecting the Sales Order', function(btn, text) {
    	    
    		// check if the user clicked the OK button
    		if (btn == 'ok')
    			{
	    	        // check if the user entered a rejection reason
    				if (text)
    					{
    						// define URL of Suitelet
    						var suiteletURL = url.resolveScript({
    							scriptId: 'customscript_bbs_cr_rejection_sl',
    							deploymentId: 'customdeploy_bbs_cr_rejection_sl',
    							params: {
    								'id': recordID,
    								'reason': text
    							}
    						});
    						
    						Ext.Ajax.timeout = (60000*5);
    						
    						var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'<span style="font-size: 10pt;">The Credit Note Request is being Rejected<br><br>Please Wait...</span>'});
    						myMask.show();
    						
    						// call a backend Suitelet to update the PO with the rejection reason
    						Ext.Ajax.request({
    											url: suiteletURL,
    											method: 'GET',
    											success: function (response, result) {
    												myMask.hide();
    												location.reload();
    											},
    											failure: function (response, result) {
    												myMask.hide();
    												alert("Error Rejecting the Credit Note Request");
    											}
    										});
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

    return {
        pageInit: pageInit,
        approve: approve,
        reject: reject
    };
    
});
