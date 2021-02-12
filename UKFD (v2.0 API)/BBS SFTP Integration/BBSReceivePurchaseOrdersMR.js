/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
	
	/*
	 * SCRIPT PARAMETERS
	 */
	
	var currentScript = runtime.getCurrentScript();
	
	savedSearchID = currentScript.getParameter({
		name: 'custscript_bbs_receipt_po_mr_ss'
	});
	
	receiveLocation = currentScript.getParameter({
		name: 'custscript_bbs_receipt_po_mr_location'
	});
	
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
    	
    	// load search to find purchase orders to be processed
    	return search.load({
    		type: search.Type.PURCHASE_ORDER,
    		id: savedSearchID
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search results
    	var searchResult 	= JSON.parse(context.value);
    	var tranID			= searchResult.values['GROUP(tranid)'];
    	var recordID		= searchResult.values['MAX(internalid)'];
    	
    	log.audit({
    		title: 'Processing Purchase Order',
    		details: 'Tran ID: ' + tranID + '<br>Record ID: ' + recordID
    	});
    	
    	try
    		{
    			// transform the purchase order to an item receipt
    			var itemReceipt = record.transform({
    				fromType:	record.Type.PURCHASE_ORDER,
    				fromId: 	recordID,
    				toType: 	record.Type.ITEM_RECEIPT,
    				isDynamic:	true
    			});
    			
    			var lineCount = itemReceipt.getLineCount({
    				sublistId: 'item'
    			});
    			
    			for (var i = 0; i < lineCount; i++)
    				{
    					// set the location on the line
    					itemReceipt.selectLine({
    						sublistId: 'item',
    						line: i
    					});
    					
    					itemReceipt.setCurrentSublistValue({
    						sublistId: 'item',
    						fieldId: 'location',
    						value: receiveLocation
    					});
    					
    					itemReceipt.commitLine({
    						sublistId: 'item'
    					});
    				}
    			
    			var itemReceiptID = itemReceipt.save({
    				ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Item Receipt Created',
    				details: 'PO ID: ' + recordID + '<br>Item Receipt ID: ' + itemReceiptID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Item Receipt',
    				details: 'PO ID: ' + recordID + '<br>Error: ' + e
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
    function summarize(context) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Units Used: ' + context.usage + '<br>Number of Yields: ' + context.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
