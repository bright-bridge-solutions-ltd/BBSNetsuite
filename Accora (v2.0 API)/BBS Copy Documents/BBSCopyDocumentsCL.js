/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/ui/dialog'],
function(url, dialog) {
    
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
    	
    	// check if the customer name or transaction type fields have been changed
    	if (scriptContext.fieldId == 'customername' || scriptContext.fieldId == 'transactiontype')
    		{
    			// get the value of the fields
    			var customerID = scriptContext.currentRecord.getValue({
    				fieldId: 'customername'
    			});
    			
    			var transactionType = scriptContext.currentRecord.getValue({
    				fieldId: 'transactiontype'
    			});
    			
    			// get the URL of the Suitelet and pass customer ID/openOnly to the Suitelet as a parameter
    			var suiteletURL = url.resolveScript({
    			    scriptId: 'customscript_bbs_copy_documents_sl',
    			    deploymentId: 'customdeploy_bbs_copy_documents_sl',
    			    params: {
    			    	customerid: customerID,
    			    	transactiontype: transactionType
    			    }
    			});
    			
    			// reload the Suitelet
    			window.onbeforeunload = null;
				window.location.href = suiteletURL;
    		}
    	else if (scriptContext.sublistId == 'transactionsublist' && scriptContext.fieldId == 'email') // if the email field on the transactionsublist has changed
    		{
    			// declare and initialize variables
    			var documentsSelected = 0;
    			
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get count of lines on the record
    			var lineCount = currentRecord.getLineCount({
    				sublistId: 'transactionsublist'
    			});
    			
    			// loop through lines
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the value of the email checkbox for the line
    					var email = currentRecord.getSublistValue({
    						sublistId: 'transactionsublist',
    						fieldId: 'email',
    						line: i
    					});
    					
    					// check if the email checkbox is ticked
    					if (email == true)
    						{
    							// increase documentsSelected count by 1
    							documentsSelected++;
    						}
    				}
    			
    			// check if documentsSelected is greater than 95 (API governance limit)
    			if (documentsSelected > 95)
    				{
    					// display an alert
	    				dialog.alert({
	    				    title: '⚠️ Error',
	    				    message: 'You cannot select this transaction as the limit of <b>95</b> has been reached.'
	    				});
    				
    					// untick the checkbox for the current line
    					currentRecord.setCurrentSublistValue({
    						sublistId: 'transactionsublist',
    						fieldId: 'email',
    						value: false
    					});
    				}
    			else
    				{
    					// set the selected documents field on the record using documentsSelected count
    					currentRecord.setValue({
    						fieldId: 'documentsselected',
    						value: documentsSelected
    					});
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
    	
    	// declare and initialize variables
    	var linesSelected = 0;
    	
    	// get the currentRecord
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get count of lines on the record
		var lineCount = currentRecord.getLineCount({
			sublistId: 'transactionsublist'
		});
		
		// loop through lines
		for (var i = 0; i < lineCount; i++)
			{
				// get the value of the email checkbox for the line
				var email = currentRecord.getSublistValue({
					sublistId: 'transactionsublist',
					fieldId: 'email',
					line: i
				});
				
				// check if the email checkbox is ticked
				if (email == true)
					{
						// increase linesSelected variable
						linesSelected++;
						
						// break the loop
						break;
					}
			}
		
		// if linesSelected is greater than 0
		if (linesSelected > 0)
			{
				// allow the Suitelet to be submitted
				return true;
			}
		else
			{
				// display an alert
				dialog.alert({
				    title: '⚠️ Error',
				    message: "You haven't selected any transactions.<br><br>Please select at least one transaction to be emailed and try again."
				});
			
				// do not allow the Suitelet to be submitted
				return false;
			}

    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
