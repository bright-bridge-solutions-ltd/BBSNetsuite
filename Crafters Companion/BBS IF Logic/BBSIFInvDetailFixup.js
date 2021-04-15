/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// run search to find records to be processed
    	return search.create({
    		type: search.Type.ITEM_FULFILLMENT,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'status',
    			operator: search.Operator.ANYOF,
    			values: ['ItemShip:B'] // Item Fulfillment:Packed
    		},
    				{
    			name: 'custbody_bbs_inventory_detail_fixup',
    			operator: search.Operator.IS,
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'tranid'
    		}],
    		
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search result
    	var searchResult = JSON.parse(context.value);
    	var recordID	 = searchResult.id;
    	var tranID		 = searchResult.values["tranid"];
    	
    	log.audit({
    		title: 'Processing Item Fulfillment',
    		details: 'Record ID: ' + recordID + '<br>Tran ID: ' + tranID
    	});
    	
    	try
    		{
    			// load the IF record
    			var itemFulfillment = record.load({
    				type: record.Type.ITEM_FULFILLMENT,
    				id: recordID,
    				isDynamic: true
    			});
    			
    			// get count of item lines
    			var lineCount = itemFulfillment.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through items
    			for (var i = 0; i < lineCount; i++)
    				{
    					// select the line
    					itemFulfillment.selectLine({
    						sublistId: 'item',
    						line: i
    					});
    					
    					// check if the inventory detail is available for this line
    					var invDetailAvailable = itemFulfillment.getCurrentSublistValue({
    						sublistId: 'item',
    						fieldId: 'inventorydetailavail'
    					});
    					
    					if (invDetailAvailable == 'T')
    						{
		    					// create the inventory detail subrecord
				    			itemFulfillment.getCurrentSublistSubrecord({
				    				sublistId: 'item',
				    				fieldId: 'inventorydetail'
				    			});
		    					
		    					// save the changes to the current line
		    					itemFulfillment.commitLine({
		    						sublistId: 'item'
		    					});
    						}
    				}
    			
    			// set the 'Inventory Detail Fixup' checkbox
    			itemFulfillment.setValue({
    				fieldId: 'custbody_bbs_inventory_detail_fixup',
    				value: true
    			});
    			
    			// save the changes to the item fulfillment
    			itemFulfillment.save();
    			
    			log.audit({
    	    		title: 'Item Fulfillment Updated',
    	    		details: 'Record ID: ' + recordID + '<br>Tran ID: ' + tranID
    	    	});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Item Fulfillment ' + recordID,
    				details: e.message
    			});
    		}

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
