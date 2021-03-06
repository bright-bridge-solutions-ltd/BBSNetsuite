/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
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
    		}],
    		
    		columns: [{
    			name: 'transferlocation'
    		},
    				{
    			name: 'multisubsidiary',
    		},
    				{
    			name: 'subsidiary',
    		},
    				{
    			name: 'tosubsidiary'
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
    	var intercompany = searchResult.values['multisubsidiary'];
    	
    	// check if intercompany is 'T'
    	if (intercompany == 'T')
    		{
    			// get the tosubsidiary value from the search
    			var subsidiary = searchResult.values['tosubsidiary'].value;
    		}
    	else // intercompany is 'F'
    		{
    			// get the subsidiary value from the search
    			var subsidiary = searchResult.values['subsidiary'].value;
    		}
    	
    	log.audit({
    		title: 'Processing Transfer Order',
    		details: recordID
    	});
    	
    	// call function to receive the transfer order. Pass recordID and transferLocation
    	var itemReceiptID = receiveTransferOrder(recordID, transferLocation);
    			
    	// check if an receipt has been created
    	if (itemReceiptID)
    		{
    			// call function to create an inventory adjustment. Pass recordID, itemReceiptID, transferLocation and subsidiary
    			createInventoryAdjustment(recordID, itemReceiptID, transferLocation, subsidiary);
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
    
    function createInventoryAdjustment(transferOrderID, itemReceiptID, adjustmentLocation, subsidiary)
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
    				
    				// lookup fields on the item record
					var itemRecordLookup = search.lookupFields({
				    	type: record.Type.INVENTORY_ITEM,
				    	id: itemID,
				    	columns: ['custitem_bbs_auto_write_off', 'expenseaccount', 'class']
				    });
    						
    				// retrieve values from the item lookup
    				var writeOff = itemRecordLookup.custitem_bbs_auto_write_off;
    				var adjustmentAccount = itemRecordLookup.expenseaccount[0].value;
    				var lineOfBusiness = itemRecordLookup.class[0].value;
    				
    				// check if the write off flag on the item record is ticked
    				if (writeOff == true)
    					{
	    					// lookup fields on the location record
	        				var locationRecordLookup = search.lookupFields({
	        					type: record.Type.LOCATION,
	        					id: adjustmentLocation,
	        					columns: ['custrecord_n103_cseg1', 'custrecord_n103_cseg2', 'custrecord_n103_cseg3', 'custrecord_n103_cseg4']
	        				});
	        				
	        				// retrieve values from the location lookup
	        				var spaRegion = locationRecordLookup.custrecord_n103_cseg1[0].value;
	        				var clubRegion = locationRecordLookup.custrecord_n103_cseg2[0].value;
	        				var salesRegion = locationRecordLookup.custrecord_n103_cseg3[0].value;
	        				var estatesRegion = locationRecordLookup.custrecord_n103_cseg4[0].value;

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
			        				
			        				inventoryAdjustment.setValue({
			        					fieldId: 'custbody_cseg1',
			        					value: spaRegion
	        						});
			        				
			        				inventoryAdjustment.setValue({
			        					fieldId: 'custbody_cseg2',
			        					value: clubRegion
			        				});
			        				
			        				inventoryAdjustment.setValue({
			        					fieldId: 'custbody_cseg3',
			        					value: salesRegion
			        				});
			        				
			        				inventoryAdjustment.setValue({
			        					fieldId: 'custbody_cseg4',
			        					value: estatesRegion
			        				});
			        				
			        				inventoryAdjustment.setValue({
			        					fieldId: 'class',
			        					value: lineOfBusiness
			        				});
			        				
			        				inventoryAdjustment.setValue({
			        					fieldId: 'custbody_bbs_related_transfer_order',
			        					value: transferOrderID
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
    				else // write off is NOT ticked
    					{
    						log.audit({
    							title: 'Inventory Adjustment Not Created',
    							details: 'Item ID: ' + itemID + '<br>Reason: Write Off is NOT Ticked'
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
