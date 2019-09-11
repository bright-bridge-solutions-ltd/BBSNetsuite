/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
function() {

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

    	// get the old and new record images
    	var oldRecord = scriptContext.oldRecord;
    	var newRecord = scriptContext.newRecord;
    	
    	// get line count on the new record image
    	var lineCount = oldRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through the line count
    	for (var x = 0; x < lineCount; x++)
			{
    			// get the item description from the old record image
    			var description = oldRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'description',
    				line: x
    			});
    			
    			// set the description on the line on the new record image using the description from the old record image
    			newRecord.setSublistValue({
    				sublistId: 'item',
    				fieldId: 'description',
    				value: description,
    				line: x
    			});
			}
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
