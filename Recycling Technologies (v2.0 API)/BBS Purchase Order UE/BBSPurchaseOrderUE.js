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
    	
    	// declare variables
    	var description;
    	var unitPrice;
    	var quantity;
    	var oldLineNo;
    	var newLineNo;
    	var oldItem;
    	var newItem;

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
    			// get the line number from the old and new record images
    			oldLineNo = oldRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'line',
    				line: x
    			});
    			
    			newLineNo = newRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'line',
    				line: x
    			});
    			
    			// check that the oldLineNo and newLineNo variables are the same
    			if (oldLineNo == newLineNo)
    				{
    					// get the item from the old and new record images
    					oldItem = oldRecord.getSublistValue({
    						sublistId: 'item',
    						fieldId: 'item',
    						line: x
    					});
    					
    					newItem = newRecord.getSublistValue({
    						sublistId: 'item',
    						fieldId: 'item',
    						line: x
    					});
    					
    					// check that the oldItem and newItem variables are NOT the same
    					if (oldItem != newItem)
    						{
					    		// get line fields from the old record image
					    		description = oldRecord.getSublistValue({
					    			sublistId: 'item',
					    			fieldId: 'description',
					    			line: x
					    		});
		    			
				    			unitPrice = oldRecord.getSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'rate',
				    				line: x
				    			});
		    			
				    			quantity = oldRecord.getSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'quantity',
				    				line: x
				    			});
		    			
				    			// set line fields on the new record image using values from the old record image
				    			newRecord.setSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'description',
				    				value: description,
				    				line: x
				    			});
		    			
				    			newRecord.setSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'rate',
				    				value: unitPrice,
				    				line: x
				    			});
		    			
				    			newRecord.setSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'quantity',
				    				value: quantity,
				    				line: x
				    			});
				    			
    						}
    				}
			}
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
