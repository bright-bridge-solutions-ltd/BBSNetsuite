/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
/**
 * @param {search} search
 */
function(runtime, search, record) {
    
    function beforeSubmit(scriptContext) {
    	
    	// check the record is NOT being created/edited
		if ((scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) && runtime.executionContext != runtime.ContextType.USER_INTERFACE)
			{
				// get the current record
				var currentRecord = scriptContext.newRecord;
    	
				// get the ID of the current record
		    	var recordID = currentRecord.id;
		    	
		    	// get the value of the UPC field
		    	var UPC = currentRecord.getValue({
		    		fieldId: 'upccode'
		    	});
    	
		    	// do we have a UPC code
		    	if (UPC)
		    		{
				    	// call search to check for existing items with this UPC
				    	var existingItem = searchItems(recordID, UPC);
		    	
				    	// if existingItem returns a value (search found a result)
				    	if (existingItem)
				    		{
					    		// throw an error
				    			throw new Error('UPC code already in use for ' + existingItem);
				    		}
		    		}
			}
    		
    }
    
    function afterSubmit(scriptContext) {
    	
    	// check the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// call function to update matrix item attributes. Pass current record
		    	updateMatrixItemAttributes(scriptContext.newRecord);
    		}
    	
    }
    
    // ===================================================
    // FUNCTION TO SEARCH FOR EXISTING ITEMS WITH THIS UPC
    // ===================================================
    
    function searchItems(currentRecordID, UPC) {
    	
    	// declare and initialize variables
    	var existingItem = null;
    	
    	// create item search
    	var itemSearch = search.create({
    		type: search.Type.INVENTORY_ITEM,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'upccode',
    			operator: search.Operator.IS,
    			values: [UPC]
    		}],
    		
    		columns: [{
    			name: 'itemid'
    		}],
    		
    	});
    	
    	// is this an existing item record that is being edited
    	if (currentRecordID)
    		{
    			// create an additional filter to the search to exclude this item ID
    			var newSearchFilter = search.createFilter({
	    			name: 'internalid',
	    			operator: search.Operator.NONEOF,
	    			values: [currentRecordID] // exclude the current item
	    		});

    			// add the filter to the search using .push() method
    			itemSearch.filters.push(newSearchFilter);
    		}
    	
    	// run the search and process results
    	itemSearch.run().each(function(result){
    		
    		// get the item ID from the search results
    		existingItem = result.getValue({
    			name: 'itemid'
    		});
    		
    	});
    	
    	// return existingItem variable to main script function
    	return existingItem;
    	
    }
    
    // =========================================
    // FUNCTION TO UPDATE MATRIX ITEM ATTRIBUTES
    // =========================================
    
    function updateMatrixItemAttributes(currentRecord) {
    	
    	// retrieve item attributes from the current record object
    	var productType 	= currentRecord.getValue({fieldId: 'custitem_bbs_item_product_type'});
    	var bottomLength	= currentRecord.getValue({fieldId: 'custitem_bbs_item_bottom_length'});
    	var hipFit			= currentRecord.getValue({fieldId: 'custitem_bbs_item_hip_fit'});
    	var sleeveLength	= currentRecord.getValue({fieldId: 'custitem_bbs_item_sleeve_lengths'});
    	var backDetail		= currentRecord.getValue({fieldId: 'custitem_bbs_back_detail'});
    	var split			= currentRecord.getValue({fieldId: 'custitem_bbs_split'});
    	var waistSeam		= currentRecord.getValue({fieldId: 'custitem_bbs_item_waist_seam'});
    	var neckline		= currentRecord.getValue({fieldId: 'custitem_bbs_ietm_neckline'});
    	var pricePoint		= currentRecord.getValue({fieldId: 'custitem_bbs_price_point'});
    	var block			= currentRecord.getValue({fieldId: 'custitem_bbs_block'});
    	var description		= currentRecord.getValue({fieldId: 'custitem_bbs_description'});
    	var gender			= currentRecord.getValue({fieldId: 'custitem_bbs_gender'});
    	
    	// run search to find matrix items for this item
    	search.create({
    		type: search.Type.INVENTORY_ITEM,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'parent',
    			operator: search.Operator.ANYOF,
    			values: [currentRecord.id]
    		}],
    		
    		columns: [{
    			name: 'itemid'
    		}],
    		
    	}).run().each(function(result){
    		
    		// retrieve search results
    		var itemName = result.getValue({
    			name: 'itemid'
    		});
    		
    		var itemID = result.id;
    		
    		try
    			{
    				// update fields on the item record
	        		record.submitFields({
	        			type: record.Type.INVENTORY_ITEM,
	        			id: itemID,
	        			values: {
	        				custitem_bbs_item_product_type:		productType,
	        				custitem_bbs_item_bottom_length:	bottomLength,
	        				custitem_bbs_item_hip_fit:			hipFit,
	        				custitem_bbs_item_sleeve_lengths:	sleeveLength,
	        				custitem_bbs_back_detail:			backDetail,
	        				custitem_bbs_split:					split,
	        				custitem_bbs_item_waist_seam:		waistSeam,
	        				custitem_bbs_ietm_neckline:			neckline,
	        				custitem_bbs_price_point:			pricePoint,
	        				custitem_bbs_block:					block,
	        				custitem_bbs_description:			description,
	        				custitem_bbs_gender:				gender
	        			}
	        		});
    				
    				log.audit({
    					title: 'Item Record Updated',
    					details: 'Item Name: ' + itemName + '<br>Item ID: ' + itemID
    				});
    			}
    		catch(error)
    			{
    				log.error({
    					title: 'Error Updating Item Record',
    					details: 'Item Name: ' + itemName + '<br>Item ID: ' + itemID + '<br>Error: ' + error
    				});
    			}
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    }


    return 	{
        		beforeSubmit: beforeSubmit,
        		afterSubmit: afterSubmit
    		};
    
});
