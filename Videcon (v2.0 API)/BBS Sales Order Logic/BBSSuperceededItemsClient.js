/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/ui/dialog', 'N/ui/message'],
/**
 * @param {record} record
 * @param {search} search
 * @param {dialog} dialog
 * @param {message} message
 */
function(record, search, dialog, message) 
{
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
    function postSourcing(scriptContext) 
	    {
    		if(scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
    			{
    				debugger;
    				
    				var currentRecord 	= scriptContext.currentRecord;
    				var currentItem 	= currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
    				var currentItemText	= currentRecord.getCurrentSublistText({sublistId: 'item', fieldId: 'item'});
    				
    				//Check to see if the item has been superceeded
    				//
    				if(currentItem != null && currentItem != '')
    					{
		    				var supercededBy	= search.lookupFields({
		    															type:		search.Type.ITEM,
		    															id:			currentItem,
		    															columns:	'custitem_bbs_superceded_by_item'
		    															}).custitem_bbs_superceded_by_item;
		    				if(supercededBy.length > 0)
		    					{
				    				var itemId 		= supercededBy[0].value;
				    				var itemName 	= supercededBy[0].text;
				    				
				    				dialog.alert({title: '"' + currentItemText + '" - Superceded', message: 'This item has been superceded by <br/>"' + itemName + '"'});
				    				
				    				currentRecord.setCurrentSublistValue({
				    													sublistId: 			'item', 
				    													fieldId: 			'item', 
				    													value: 				itemId,
				    													ignoreFieldChange:	false,
				    													forceSyncSourcing:	true
				    													}); 
		    					}
    					}
    			}
	    }

    return {
    		postSourcing: postSourcing
        
    		};
    
});
