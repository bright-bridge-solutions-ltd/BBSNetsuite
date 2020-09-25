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
    	
    	// if the supplier field has been changed
    	if (scriptContext.fieldId == 'supplier_select')
    		{
    			// get the value of the supplier field
    			var supplierID = scriptContext.currentRecord.getValue({
    				fieldId: 'supplier_select'
    			});
    			
    			// get the URL of the Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_purchase_order_suitelet',
					deploymentId: 'customdeploy_bbs_purchase_order_suitelet',
					params: {
						supplier: supplierID
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
    	var linesSelected = 0;
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get count of sublist lines
    	var lineCount = currentRecord.getLineCount({
    		sublistId: 'po_sublist'
    	});
    	
    	// loop through sublist lines
    	for (var i = 0; i < lineCount; i++)
    		{
    			// get the value of the mark_shipped checkbox for the line
    			var markShipped = currentRecord.getSublistValue({
    				sublistId: 'po_sublist',
    				fieldId: 'mark_shipped',
    				line: i
    			});
    			
    			// if markShipped is true
    			if (markShipped == true)
    				{
    					// increase linesSelected variable
    					linesSelected++;
    					
    					// break the loop
    					break;
    				}
    		}
    	
    	if (linesSelected > 0)
    		{
    			// allow the suitelet to be submitted
    			return true;
    		}
    	else
    		{
    			// display an error message to the user
    			dialog.alert({
    				title: '⚠️ Error',
    				message: 'You must select at least one purchase order before submitting the page'
    			});
    		}

    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
