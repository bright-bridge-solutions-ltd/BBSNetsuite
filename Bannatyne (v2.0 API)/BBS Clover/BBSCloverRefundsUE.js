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
   
    // retrieve script parameters. Parameters are global variables so can be accessed throughout the script
	unallocatedCloverItem = runtime.getCurrentScript().getParameter({
		name: 'custscript_bbs_unallocated_clover_item'
	});
	
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
		    	
		    	// get the value of the item name field
		    	var itemID = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_refund_item_name'
		    	});
		    	
		    	// do we have an item ID
		    	if (itemID)
		    		{
			    		// call function to search for item using the external ID
				    	itemID = searchItems(itemID);
		    		}
		    	else
		    		{
		    			// set the itemID using the unallocatedCloverItem variable
		    			itemID = unallocatedCloverItem;
		    		}
		    	
		    	// set the 'Item Record' field
		    	currentRecord.setValue({
		    		fieldId: 'custrecord_bbs_clover_refund_item_record',
		    		value: itemID
		    	});
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
    	
    	// if we have been unable to find a matching item
    	if (itemID == null)
    		{
    			// set the itemID using the unallocatedCloverItem variable
    			itemID = unallocatedCloverItem;
    		}
    	
    	return itemID;
   
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
