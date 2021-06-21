/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search'],
function(search) {
   
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
    	var hasDocMItem = 'F';
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get count of item lines
    	var itemCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through items
    	for (var i = 0; i < itemCount; i++)
    		{
    			// get the internal ID of the item
    			var itemID = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'item',
    				line: i
    			});
    			
    			// lookup fields on the item record
    			var isDocM = search.lookupFields({
    				type: search.Type.ITEM,
    				id: itemID,
    				columns: ['custitem_bbs_is_doc_m_order_type']
    			}).custitem_bbs_is_doc_m_order_type;
    			
    			if (isDocM == true)
    				{
    					// set has docMItem to true
    					hasDocMItem = 'T';
    					
    					// break the loop
    					break;
    				}
    		}
    	
    	return hasDocMItem;

    }

    return {
        onAction : onAction
    };
    
});
