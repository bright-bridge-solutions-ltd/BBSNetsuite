/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],
function() {
    
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
    	
    	if (scriptContext.fieldId == 'custcol_otdn_so_porate')
    		{
    			// call function to set the 'Est Extended Cost/PO Rate/Est Unit Cost' fields
        		poRateChanged(scriptContext.currentRecord);
    		}
    	else if (scriptContext.fieldId == 'custcol_otdn_so_povendor')
    		{
	    		// call function to set the 'PO Vendor' fields
	    		poVendorChanged(scriptContext.currentRecord);
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
    	
    	if (scriptContext.fieldId == 'item') // if the Item field has been changed
			{
	    		// set the 'Price Level' field to custom
				scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'price',
					value: -1
				});
			}

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
    	
    	// call functions to set the 'Est Extended Cost/PO Rate/Est Unit Cost' and 'PO Vendor' fields
    	poRateChanged(scriptContext.currentRecord);
    	poVendorChanged(scriptContext.currentRecord);
		
		return true;

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
    
    // ============================================================================
    // FUNCTIONS TO PERFORM ACTIONS WHEN THE PO RATE OR PO VENDOR HAVE BEEN CHANGED
    // ============================================================================
    
    function poRateChanged(currentRecord) {
    	
    	// get the PO rate
		var poRate = currentRecord.getCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'custcol_otdn_so_porate',
		});
		
		var quantity = currentRecord.getCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'quantity',
		});
	
		// set the 'Est Extended Cost/PO Rate/Est Unit Cost' fields
		currentRecord.setCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'costestimatetype',
			value: 'CUSTOM',
			ignoreFieldChange: true
		});
		
		currentRecord.setCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'costestimaterate',
			value: poRate,
			ignoreFieldChange: true
		});
		
		currentRecord.setCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'porate',
			value: poRate,
			ignoreFieldChange: true
		});
		
		currentRecord.setCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'costestimate',
			value: (poRate * quantity),
			ignoreFieldChange: true
		});
    	
    }
    
    function poVendorChanged(currentRecord) {
    	
    	// set the standard PO vendor and PO Rate fields
    	currentRecord.setCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'povendor',
			value: currentRecord.getCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_otdn_so_povendor',
			}),
			ignoreFieldChange: true
		});
    	
    	currentRecord.setCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'porate',
			value: currentRecord.getCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_otdn_so_porate',
			}),
			ignoreFieldChange: true
		});
    	
    } 

    return {
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        validateLine: validateLine
    };
    
});
