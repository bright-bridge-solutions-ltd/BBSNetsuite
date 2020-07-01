/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param {search} search
 */
function(search) 
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
    		debugger;
    		
			var currentRecord = scriptContext.currentRecord;
					
			if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
				{
					var itemId = currentRecord.getCurrentSublistValue({
																		sublistId: 	'item',
																		fieldId: 	'item'
																		});
				
					if(itemId != null && itemId != '')
						{
							var itemDescription = search.lookupFields({
																		type:		search.Type.ITEM,
																		id:			itemId,
																		columns:	'custitem_bbs_description'
																		});
							
							
							currentRecord.setCurrentSublistValue({
																	sublistId: 	'item',
																	fieldId: 	'description',
																	value: 		itemDescription.custitem_bbs_description
																});
						}
				}
	    }


    return 	{
        	postSourcing: postSourcing
    		};
    
});
