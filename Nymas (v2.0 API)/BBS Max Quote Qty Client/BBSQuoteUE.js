/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message'],
function(message) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// declare and initialize variables
    	var maxQuoteQtyExceeded = false;
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
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
    			
    			// if lineQuantity >= maxQuoteQty
    			if (lineQuantity >= maxQuoteQty)
    				{
    					// set maxQuoteQtyExceeded flag to true
    					maxQuoteQtyExceeded = true;
    					
    					// break the loop
    					break;
    				}
    		}
    	
    	// has the maximum quote quantity been exceeded?
    	if (maxQuoteQtyExceeded == true)
    		{
    			// display a message to the user
    			message.create({
    				type: message.Type.INFORMATION,
    				title: 'Maxmimum Quote Quantity Exceeded',
    				message: 'The maxmimum quote quantity has been exceeded.<br><br>The quotation will require approval.'
    			}).show(5000); // show message for 5 seconds
    		}
    	
    	// set the 'Max Quote Qty Exceeded' checkbox on the record
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_max_quote_qty_exceeded',
    		value: maxQuoteQtyExceeded
    	});

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
