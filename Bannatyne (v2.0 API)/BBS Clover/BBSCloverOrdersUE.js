/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime'],
/**
 * @param {search} search
 */
function(search, runtime) {
   
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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the value of the 'Item' field
		    	var itemExternalID = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_clover_item'
		    	});
		    	
		    	// call function to search for item using the external ID
		    	var itemID = searchItems(itemExternalID);
		    	
		    	// is the itemID empty
		    	if (itemID == null)
		    		{
		    			// set the itemID variable using the unallocated item script parameter
		    			itemID = runtime.getCurrentScript().getParameter({
		    				name: 'custscript_bbs_unallocated_clover_item'
		    			});
		    		}
		    	
		    	// set the 'Item Record' field
		    	currentRecord.setValue({
		    		fieldId: 'custrecord_bbs_clover_item_record',
		    		value: itemID
		    	});
		    	
		    	// get the value of the 'Line Price' field
		    	var linePrice = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_clover_line_price'
		    	});
		    	
		    	// get the value of the 'Order Discount' field
		    	var orderDiscount = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_clover_order_dis'
		    	});
		    	
		    	// check if we have an order discount
		    	if (orderDiscount)
		    		{
				    	orderDiscount = orderDiscount * -1; // convert to positive number
				    	
				    	// if orderDiscount is greater than or equal to 100%
				    	if (orderDiscount >= 100)
				    		{
					    		// set the 'Line Price After Discount' field to 0
				    			currentRecord.setValue({
				    				fieldId: 'custrecord_bbs_clover_line_price_disc',
				    				value: 0
				    			});
				    		}
				    	else
				    		{
				    			// calculate the discount
				    			orderDiscount = 1 - (orderDiscount / 100);
				    			
				    			// set the 'Line Price After Discount' field
				    			currentRecord.setValue({
				    				fieldId: 'custrecord_bbs_clover_line_price_disc',
				    				value: linePrice * orderDiscount
				    			});
				    		}
		    		}
		    	else
		    		{
			    		// set the 'Line Price After Discount' field
		    			currentRecord.setValue({
		    				fieldId: 'custrecord_bbs_clover_line_price_disc',
		    				value: linePrice
		    			});
		    		}
    		}

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
    
    // =============================================
    // FUNCTION TO SEARCH FOR ITEM USING EXTERNAL ID
    // =============================================
    
    function searchItems(itemExternalID) {
    	
    	// declare and initialize variables
    	var itemID = null;
    	
    	// run search to find item for this external ID
    	search.create({
    		type: 'item',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'externalid',
    			operator: 'anyof',
    			values: itemExternalID
    		}],
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the internal ID of the item
    		itemID = result.getValue({
    			name: 'internalid'
    		});
    		
    	});
    	
    	return itemID;
   
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
