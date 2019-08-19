/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {

    function beforeSubmit(context) {
    	
    	var currentRecord = context.newRecord;
    	
    	// declare new object to hold item field values
    	var itemFields = {};

    	// get values from the first item line
    	var itemID = currentRecord.getSublistValue({
    		sublistId: 'item',
    		fieldId: 'item',
    		line: 0
    	});
    	
    	// lookup fields on the item record
		var itemFieldLookup = search.lookupFields({
            type: search.Type.INVENTORY_ITEM,
            id: itemID,
            columns: ['custitem_bbs_item_specification','custitem_bbs_item_trim','custitem_bbs_item_packaging','custitem_bbs_item_outer_packaging','custitem_bbs_item_purchase_terms']
        });

		itemFields['specifications'] = itemFieldLookup.custitem_bbs_item_specification;
		itemFields['trim'] = itemFieldLookup.custitem_bbs_item_trim;
		itemFields['packaging'] = itemFieldLookup.custitem_bbs_item_packaging;
		itemFields['outerpackaging'] = itemFieldLookup.custitem_bbs_item_outer_packaging;
		itemFields['terms'] = itemFieldLookup.custitem_bbs_item_purchase_terms;
		
		// now we need to generate the output format
		var outputArray = [];
		
		// push the itemFields to the outputArray
		outputArray.push(itemFields);
		
		// set the po matrix item json field on the record
		currentRecord.setValue({
			fieldId: 'custbody_po_matrix_item_json',
			value: JSON.stringify(outputArray)
		});
    	
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});