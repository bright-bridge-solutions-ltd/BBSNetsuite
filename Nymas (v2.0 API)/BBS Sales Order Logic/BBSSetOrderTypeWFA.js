/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define([],
function() {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// declare and initialize variables
    	var hasKitItem = 'F';
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get count of item lines
    	var itemCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through items
    	for (var i = 0; i < itemCount; i++)
    		{
    			// get the item type
    			var itemType = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'itemtype',
    				line: i
    			});
    			
    			// if this is a kit item
    			if (itemType == 'Kit')
    				{
    					hasKitItem = 'T';
    					
    					break;
    				}
    		}
    	
    	log.debug({
    		title: 'hasKitItem',
    		details: hasKitItem
    	});
    	
    	return hasKitItem;

    }

    return {
        onAction : onAction
    };
    
});
