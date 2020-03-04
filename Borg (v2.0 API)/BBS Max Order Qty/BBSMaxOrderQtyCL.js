/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/ui/dialog'],
/**
 * @param {search} search
 */
function(runtime, search, dialog) {
    
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
    	
    	// get the current record object
		var currentRecord = scriptContext.currentRecord;
		
		// get the internal ID of the item from the current line
		var itemID = currentRecord.getCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'item'
		});
		
		// check that we have an item
		if (itemID)
			{
				// log the current user and role
		    	log.audit({
		    		title: 'Script Check',
		    		details: 'Item ID: ' + itemID + '<br>User ID: ' + runtime.getCurrentUser().name + '<br>User Role: ' + runtime.getCurrentUser().role
		    	});
				
				// lookup fields on the item record
				var itemRecordLookup = search.lookupFields({
					type: search.Type.ITEM,
					id: itemID,
					columns: ['custitem_bbs_max_order_quantity']
				});
						
				// get the max order quantity from the itemRecordLookup object
				var maxOrderQty = itemRecordLookup.custitem_bbs_max_order_quantity;
				
				// check if we have a max order quantity on the item
				if (maxOrderQty)
					{
						// get the quantity for the current line
						var quantity = currentRecord.getCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'quantity'
						});
						
						// check if the line quantity is greater than maxOrderQty
						if (quantity > maxOrderQty)
							{
								// display an alert warning the user
								dialog.alert({
									title: '⚠️ Max Order Qty Warning',
									message: 'The quantity you have entered is greater than the maximum allowed order quantity for this item.<br><br>The maximum allowed order quantity for this item is <b>' + maxOrderQty + '</b>.<br><br>Please amend the quantity and try again.'
								});
								
								// do not allow the line to be saved
								return false;
							}
						else // line quantity is less than or equal to maxOrderQty
							{
								// allow the line to be saved
								return true;
							}
					}
				else // no max order quantity on the item
					{
						// allow the line to be saved
						return true;
					}
			}

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
        validateLine: validateLine
    };
    
});
