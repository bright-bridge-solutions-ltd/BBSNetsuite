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
					// get the item ID
					var itemID = currentRecord.getCurrentSublistValue({
																		sublistId: 	'item',
																		fieldId: 	'item'
																		});
					// if we have an item ID
					if (itemID)
						{
							// declare and initialize variables
							var itemDescription = '';
						
							// lookup fields on the item record
							var itemLookup = search.lookupFields({
																		type:		search.Type.ITEM,
																		id:			itemID,
																		columns:	['custitem_bbs_matrix_style_name', 'custitem_bbs_customs_description', 'custitem_bbs_main_fabric_composition', 'custitem_bbs_matrix_cat']
																		});
							
							// if we have a matrix style name
							if (itemLookup.custitem_bbs_matrix_style_name.length > 0)
								{
									// add the matrix style name to the itemDescription string
									itemDescription += itemLookup.custitem_bbs_matrix_style_name[0].text;
									itemDescription += ' ';
								}
							
							// if we have a customs description
							if (itemLookup.custitem_bbs_customs_description.length > 0)
								{
									// add the customs description to the itemDescription string
									itemDescription += itemLookup.custitem_bbs_customs_description[0].text;
									itemDescription += ' ';
								}
							
							// if we have a fabric composition
							if (itemLookup.custitem_bbs_main_fabric_composition.length > 0)
								{
									// add the fabric composition to the itemDescription string
									itemDescription += itemLookup.custitem_bbs_main_fabric_composition[0].text;
									itemDescription += ' ';
								}
							
							// if we have a matrix cat
							if (itemLookup.custitem_bbs_matrix_cat.length > 0)
								{
									// add the matrix cat to the itemDescription string
									itemDescription += itemLookup.custitem_bbs_matrix_cat[0].text;
								}
							
							currentRecord.setCurrentSublistValue({
																	sublistId: 	'item',
																	fieldId: 	'description',
																	value: 		itemDescription
																});
						}
				}
	    }


    return 	{
        	postSourcing: postSourcing
    		};
    
});
