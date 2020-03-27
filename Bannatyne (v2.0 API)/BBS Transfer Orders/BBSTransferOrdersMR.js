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
    			values: ['TrnfrOrd:E', 'TrnfrOrd:F'] // TrnfrOrd:E = Transfer Order:Pending Receipt/Partially Fulfilled, TrnfrOrd:F = Transfer Order:Pending Receipt
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
    		},
    				{
    			name: 'subsidiary'
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
    	var subsidiary = searchResult.values['subsidiary'].value;
    	
    	log.audit({
    		title: 'Processing Transfer Order',
    		details: recordID
    	});
    	
    	// call function to receive the transfer order. Pass recordID and transferLocation
    	var itemReceiptID = receiveTransferOrder(recordID, transferLocation);
    			
    	// check if an receipt has been created
    	if (itemReceiptID)
    		{
    			// call function to create an inventory adjustment. Pass itemReceiptID, transferLocation and subsidiary
    			createInventoryAdjustment(itemReceiptID, transferLocation, subsidiary);
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
					
					return itemReceiptID;
				}
			catch(e)
				{
					log.error({
						title: 'Error Creating Item Receipt',
						details: e
					});
					
					return;
				}
    	}
    
    // ==========================================
    // FUNCTION TO CREATE AN INVENTORY ADJUSTMENT
    // ==========================================
    
    function createInventoryAdjustment(itemReceiptID, adjustmentLocation, subsidiary)
    	{
    		// load the item receipt
    		var itemReceiptRecord = record.load({
    			type: record.Type.ITEM_RECEIPT,
    			id: itemReceiptID
    		});
    				
    		// get count of lines on the item receipt
    		var lineCount = itemReceiptRecord.getLineCount({
    			sublistId: 'item'
    		});
    		
    		// loop through line count
    		for (var i = 0; i < lineCount; i++)
    			{
    				// get the item, quantity and item type from the line
    				var itemID = itemReceiptRecord.getSublistValue({
    					sublistId: 'item',
    					fieldId: 'item',
    					line: i
    				});
    				
    				var quantity = itemReceiptRecord.getSublistValue({
    					sublistId: 'item',
    					fieldId: 'quantity',
    					line: i
    				});
    				
    				var itemType = itemReceiptRecord.getSublistValue({
    					sublistId: 'item',
    					fieldId: 'itemtype',
    					line: i
    				});
    				
    				// if the itemType is 'InvtPart'
					if (itemType == 'InvtPart')
						{
							// lookup fields on the item record
							var itemRecordLookup = search.lookupFields({
				    			type: record.Type.INVENTORY_ITEM,
				    			id: itemID,
				    			columns: ['custitem_bbs_auto_write_off', 'expenseaccount']
				    		});
						}
					else if (itemType == 'NonInvtPart') // if the itemType is 'NonInvtPart'
						{
							// lookup fields on the item record
		    				var itemRecordLookup = search.lookupFields({
		    					type: record.Type.NON_INVENTORY_ITEM,
		    					id: itemID,
		    					columns: ['custitem_bbs_auto_write_off', 'expenseaccount']
		    				});
						}
    						
    				// retrieve values from the item lookup
    				var doNotWriteOff = itemRecordLookup.custitem_bbs_auto_write_off;
    				var adjustmentAccount = itemRecordLookup.expenseaccount[0].value;
    				
    				// check if the do not write off flag on the item record is NOT ticked
    				if (doNotWriteOff == false)
    					{
	    					try
	        					{
			        				// create a new inventory adjustment record
			        				var inventoryAdjustment = record.create({
			        					type: record.Type.INVENTORY_ADJUSTMENT,
			        					isDynamic: true
			        				});
			        						
			        				// set header fields on the adjustment
			        				inventoryAdjustment.setValue({
			        					fieldId: 'subsidiary',
			        					value: subsidiary
			        				});
			        						
			        				inventoryAdjustment.setValue({
			        					fieldId: 'account',
			        					value: adjustmentAccount
			        				});
			        						
			        				inventoryAdjustment.setValue({
			        					fieldId: 'adjlocation',
			        					value: adjustmentLocation
			        				});
			        						
			        				// select a new line on the inventory adjustment
			        				inventoryAdjustment.selectNewLine({
			        					sublistId: 'inventory'
			        				});
			        						
			        				// set fields on the new line
			        				inventoryAdjustment.setCurrentSublistValue({
				    					sublistId: 'inventory',
				    					fieldId: 'item',
				    					value: itemID
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
				    						
				    				// save the inventory adjustment
				    	    		var inventoryAdjustmentID = inventoryAdjustment.save();
				    	    				
				    	    		log.audit({
				    	    			title: 'Inventory Adjustment Created',
				    	    			details: 'Record ID: ' + inventoryAdjustmentID + '<br>Item ID: ' + itemID
				    	    		});
	        					}
	        				catch(e)
	        					{
	        						log.error({
	        							title: 'Error Creating Inventory Adjustment',
	        							details: 'Item ID: ' + itemID + '<br>Error:' + e
	        						});
	        					}
    					}
    				else // do not write off is ticked
    					{
    						log.audit({
    							title: 'Inventory Adjustment Not Created',
    							details: 'Item ID: ' + itemID + '<br>Reason: Do Not Write Off is Ticked'
    						});
    					}
    			}
    	}
    
    

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
