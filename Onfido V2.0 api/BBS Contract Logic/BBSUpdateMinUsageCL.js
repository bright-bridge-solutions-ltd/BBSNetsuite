/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/ui/dialog'],
function(url, dialog) {
    
    function cancelButton(record)
    	{
	    	// retrieve parameters that were passed to the function
			var recordID = record;
			
			// return URL of contract record
			var reloadURl = url.resolveRecord({
			    recordType: 'customrecord_bbs_contract',
			    recordId: recordID,
			    isEditMode: false
			});
			
			// redirect the user back to the contract record
			window.onbeforeunload = null;
			window.location.href = reloadURl;
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
    	
    	// check if the 'Minimum Usage' field has been changed
    	if (scriptContext.sublistId == 'minimumusagesublist' && scriptContext.fieldId == 'minimumusage')
    		{
    			// tick the 'Update' checkbox for the line
    			scriptContext.currentRecord.setCurrentSublistValue({
    				sublistId: 'minimumusagesublist',
    				fieldId: 'update',
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
    	
    	// declare and initialize variables
    	var selectedLines = 0;
    	
    	// load current record in order to manipulate it
		var currentRecord = scriptContext.currentRecord;
		
		// get count of sublist fields
		var lineCount = currentRecord.getLineCount({
			sublistId: 'minimumusagesublist'
		});
		
		// loop through line count
		for (var i = 0; i < lineCount; i++)
			{
				// get the 'Update' checkbox for the line
				var update = currentRecord.getSublistValue({
					sublistId: 'minimumusagesublist',
					fieldId: 'update',
					line: i
				});
				
				// check if the 'Update' checkbox is ticked
				if (update == true)
					{
						// increase selectedLines variable
						selectedLines++;
					}
			}
		
		// check if selectedLines is greater than 0
		if (selectedLines > 0)
			{
				// allow the Suitelet to be submitted
				return true;
			}
		else // no lines selected
			{
				// display an alert to the user
				dialog.alert({
					title: '⚠️ Warning',
					message: 'The Suitelet cannot be submitted as you have not selected any minimum usage records to be updated.<br><br>Please update at least one record and try again, or click the <b>Cancel</b> button to return to the contract record.'
				});
			
				// do not allow the Suitelet to be submitted
				return false;
			}
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        cancelButton: cancelButton
    };
    
});
