/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
   
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
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the value of the subsidiary field
    	var subsidiary = currentRecord.getValue({
    		fieldId: 'subsidiary'
    	});
    	
    	// check that the subsidiary is 10 (Onfido India)
    	if (subsidiary == 10)
    		{
		    	// declare new array to hold item IDs
		    	var itemIDs = new Array();
		    	
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get count of item lines
		    	var lineCount = currentRecord.getLineCount({
		    		sublistId: 'item'
		    	});
		    	
		    	// loop through line count
		    	for (var i = 0; i < lineCount; i++)
		    		{
		    			// get the internal ID of the item
		    			var itemID = currentRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'item',
		    				line: i
		    			});
		    			
		    			// check the itemIDs variable doesn't already contain the item ID
		    			if (itemIDs.indexOf(itemID) == -1)
		    				{
			    				// push the itemID to the itemIDs array
			        			itemIDs.push(itemID);
		    				}
		    		}
		    	
		    	// loop through itemIDs array
		    	for (var x = 0; x < itemIDs.length; x++)
		    		{
		    			// get the item ID from the array
		    			var arrayItemID = itemIDs[x];
		    			
		    			// lookup fields on the item record
		    			var itemLookup = search.lookupFields({
		    				type: 'item',
		    				id: arrayItemID,
		    				columns: ['custitem_in_hsn_code']
		    			});
		    			
		    			// check that the item has a HSN code
		    			if (itemLookup.custitem_in_hsn_code.length > 0)
		    				{
				    			// get the HSN code from the item lookup
				    			var HSN = itemLookup.custitem_in_hsn_code[0].value;
				    			
				    			// loop through line count
				    			for (var y = 0; y < lineCount; y++)
				    				{
				    					// get the item from the line
				    					var lineItemID = currentRecord.getSublistValue({
				    	    				sublistId: 'item',
				    	    				fieldId: 'item',
				    	    				line: y
				    	    			});
				    					
				    					// check if the arrayItemID and lineItemID variables are the same
				    					if (arrayItemID == lineItemID)
				    						{
				    							// set the HSN code field on the line
					    						currentRecord.setSublistValue({
					    		    				sublistId: 'item',
					    		    				fieldId: 'custcol_in_hsn_code',
					    		    				value: HSN,
					    		    				line: y
					    		    			});
				    						}
				    				}
		    				}
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

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
