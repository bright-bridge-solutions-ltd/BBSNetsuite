/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, search, record) {
   
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	writeoffAccount = currentScript.getParameter({
    	name: 'custscript_bbs_writeoff_account'
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
    	
    	// create search to find records to be processed
    	return search.create({
    		type: search.Type.TRANSFER_ORDER,
    		
    		filters: [{
    			name: 'status',
    			operator: 'anyof',
    			values: ['TrnfrOrd:B'] // TrnfrOrd:B = Transfer Order:Pending Fulfillment
    		},
    				{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		},
    				{
    			name: 'internalid',
    			operator: 'is',
    			values: ['4146154']
    		}],
    		
    		columns: [{
    			name: 'tranid'
    		},
    				{
    			name: 'transferlocation'
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
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	var recordID = searchResult.id;
    	var transferLocation = searchResult.values['transferlocation'].value;
    	
    	log.audit({
    		title: 'Processing Transfer Order',
    		details: recordID
    	});
    	
    	// call function to fulfill the transfer order. Pass recordID
    	var fulfillmentCreated = fulfillTransferOrder(recordID);
    	
    	// check if a fulfillment has been created
    	if (fulfillmentCreated == true)
    		{
    			// call function to receive the transfer order. Pass recordID and transferLocation
    			var receiptCreated = receiveTransferOrder(recordID, transferLocation);
    			
    			// check if a receipt has been created
    			if (receiptCreated == true)
    				{
    					// call function to create an inventory adjustment. Pass recordID and transferLocation
    					createInventoryAdjustment(recordID, transferLocation);
    				}
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
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }
    
    // ======================================
    // FUNCTION TO FULFILL THE TRANSFER ORDER
    // ======================================
    function fulfillTransferOrder(recordID)
    	{
    		try
    			{
    				// transform the transfer order to an item fulfillment
    				var itemFulfillment = record.transform({
    					fromType: record.Type.TRANSFER_ORDER,
    					fromId: recordID,
    					toType: record.Type.ITEM_FULFILLMENT,
    					isDynamic: true
    				});
    				
    				// get count of items
    				var lineCount = itemFulfillment.getLineCount({
    					sublistId: 'item'
    				});
    				
    				// loop through line count
    				for (var i = 0; i < lineCount; i++)
    					{
	    					// select the line
    						itemFulfillment.selectLine({
								sublistId: 'item',
								line: i
							});
    					
    						// set the 'Fulfill' checkbox on the line
    						itemFulfillment.setCurrentSublistValue({
    							sublistId: 'item',
    							fieldId: 'itemreceive',
    							value: true
    						});
    						
    						// save the changes to the line
    						itemFulfillment.commitLine({
    							sublistId: 'item'
    						});
    					}

    				// save the item fulfillment
    				var itemFulfillmentID = itemFulfillment.save();
    				
    				log.audit({
    					title: 'Item Fulfillment Created',
    					details: itemFulfillmentID
    				});
    				
    				return true;
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Creating Item Fulfillment',
    					details: e
    				});
    				
    				return false;
    			}
    	}
    
    // ======================================
    // FUNCTION TO RECEIVE THE TRANSFER ORDER
    // ======================================
    
    function receiveTransferOrder(recordID, transferLocation)
    	{
    		try
    			{
	    			// transform the transfer order to an item receipt
					var itemReceipt = record.transform({
						fromType: record.Type.TRANSFER_ORDER,
						fromId: recordID,
						toType: record.Type.ITEM_RECEIPT,
						isDynamic: true
					});
					
					// set the location field on the item receipt
					itemReceipt.setValue({
						fieldId: 'location',
						value: transferLocation
					});
					
					// get count of items
					var lineCount = itemReceipt.getLineCount({
						sublistId: 'item'
					});
					
					// loop through line count
					for (var i = 0; i < lineCount; i++)
						{
	    					// select the line
							itemReceipt.selectLine({
								sublistId: 'item',
								line: i
							});
						
							// set the 'Receive' checkbox on the line
							itemReceipt.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'itemreceive',
								value: true
							});
							
							// save the changes to the line
							itemReceipt.commitLine({
								sublistId: 'item'
							});
						}
	
					// save the item receipt
					var itemReceiptID = itemReceipt.save();
					
					log.audit({
						title: 'Item Receipt Created',
						details: itemReceiptID
					});
					
					return true;
				}
			catch(e)
				{
					log.error({
						title: 'Error Creating Item Receipt',
						details: e
					});
					
					return false;
				}
    	}
    
    // ==========================================
    // FUNCTION TO CREATE AN INVENTORY ADJUSTMENT
    // ==========================================
    
    function createInventoryAdjustment(recordID, adjustmentLocation)
    	{
    		try
    			{
    				// create an inventory adjustment
    				var inventoryAdjustment = record.create({
    					type: record.Type.INVENTORY_ADJUSTMENT,
    					isDynamic: true
    				});
    				
    				// set header fields on the inventory adjustment record
    				inventoryAdjustment.setValue({
    					fieldId: 'subsidiary',
    					value: 4 // 4 = Bannatyne Fitness Ltd
    				});
    				
    				inventoryAdjustment.setValue({
    					fieldId: 'account',
    					value: writeoffAccount
    				});
    				
    				inventoryAdjustment.setValue({
    					fieldId: 'adjlocation',
    					value: adjustmentLocation
    				});
    				
    				// load the transfer order record
    				var transferOrder = record.load({
    					type: record.Type.TRANSFER_ORDER,
    					id: recordID
    				});
    				
    				// get count of lines on the transfer order
    				var lineCount = transferOrder.getLineCount({
    					sublistId: 'item'
    				});
    				
    				// loop through line count
    				for (var i = 0; i < lineCount; i++)
    					{
    						// get the item from the line
    						var item = transferOrder.getSublistValue({
    							sublistId: 'item',
    							fieldId: 'item',
    							line: i
    						});
    						
    						// get the transfer quantity from the line
    						var quantity = transferOrder.getSublistValue({
    							sublistId: 'item',
    							fieldId: 'quantity',
    							line: i
    						});
    						
    						// lookup fields on the item record
    						var itemLookup = search.lookupFields({
    							type: 'item',
    							id: item,
    							columns: ['custitem_bbs_auto_write_off']
    						});
    						
    						// retrieve values from the item lookup
    						var writeOff = itemLookup.custitem_bbs_auto_write_off;
    						
    						// check if the write off flag on the item record is NOT ticked
    						if (writeOff == false)
    							{
		    						// select a new line on the inventory adjustment
		    						inventoryAdjustment.selectNewLine({
		    							sublistId: 'inventory'
		    						});
		    						
		    						// set fields on the new line
		    						inventoryAdjustment.setCurrentSublistValue({
		    							sublistId: 'inventory',
		    							fieldId: 'item',
		    							value: item
		    						});
		    						
		    						inventoryAdjustment.setCurrentSublistValue({
		    							sublistId: 'inventory',
		    							fieldId: 'location',
		    							value: adjustmentLocation
		    						});
		    						
		    						inventoryAdjustment.setCurrentSublistValue({
		    							sublistId: 'inventory',
		    							fieldId: 'adjustqtyby',
		    							value: (quantity * -1)
		    						});
		    						
		    						// commit the line
		    						inventoryAdjustment.commitLine({
		    							sublistId: 'inventory'
		    						});
    							}
    						
    					}
    				
    				// save the inventory adjustment
    				var inventoryAdjustmentID = inventoryAdjustment.save();
    				
    				log.audit({
    					title: 'Inventory Adjustment Created',
    					details: inventoryAdjustmentID
    				});
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Creating Inventory Adjustment',
    					details: e
    				});
    			}

    	}
    
    

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
