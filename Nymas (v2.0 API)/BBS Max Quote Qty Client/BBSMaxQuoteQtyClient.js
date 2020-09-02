/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog'],
function(dialog) {
    
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
    	
    	// check if the quantity field has been changed
    	if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'quantity')
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get the quantity for the line
    			var lineQuantity = currentRecord.getCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'quantity'
    			});
    			
    			// get the max quote quantity for the line
    			var maxQuoteQty = currentRecord.getCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'custcol_bbs_max_quote_qty'
    			});
    			
    			// if lineQuantity > maxQuoteQty
    			if (lineQuantity > maxQuoteQty)
    				{
    					// display an alert to the user
    					dialog.create({
    						title: '⚠️ Maximum Quote Quantity Exceeded',
    						message: 'The quantity you have entered (<b>' + lineQuantity + '</b>) is greater than the maximum quote quantity (<b>' + maxQuoteQty + '</b>) for this item.<br><br>If you continue, the transaction will require approval before it can be processed.'
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
    	var maxQuoteQtyExceeded = false;
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get count of item lines
    	var itemCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through item lines
    	for (var i = 0; i < itemCount; i++)
    		{
    			// get the quantity for the line
    			var lineQuantity = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'quantity',
    				line: i
    			});
    			
    			// get the max quote quantity for the line
    			var maxQuoteQty = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'custcol_bbs_max_quote_qty',
    				line: i
    			});
    			
    			// if lineQuantity > maxQuoteQty
    			if (lineQuantity > maxQuoteQty)
    				{
    					// set maxQuoteQtyExceeded flag to true
    					maxQuoteQtyExceeded = true;
    					
    					// break the loop
    					break;
    				}
    		}
    	
    	// set the 'Max Quote Qty Exceeded' checkbox on the record
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_apply_mqq_block',
    		value: maxQuoteQtyExceeded
    	});
    	
    	// allow the record to be saved
    	return true;

    }

    return {
    	fieldChanged: fieldChanged,
    	saveRecord: saveRecord
    };
    
});
