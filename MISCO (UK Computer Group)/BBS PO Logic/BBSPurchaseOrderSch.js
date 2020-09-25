/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	log.audit({
    		title: '*** BEGINNING OF SCRIPT ***'
    	});
    	
    	// call function to return the purchase orders to be processed
    	var purchaseOrders = getPurchaseOrders();
    	
    	// loop through purchase orders
    	for (var i = 0; i < purchaseOrders.length; i++)
    		{
    			// get the purchase order ID
    			var purchaseOrderID = purchaseOrders[i];
    			
    			log.audit({
    				title: 'Processing Purchase Order',
    				details: purchaseOrderID
    			});
    			
    			// call function to return the sales order ID
    			var salesOrderID = getCreatedFrom(purchaseOrderID);
    			
    			try
    				{
    					// transform the sales order into an item fulfilment
    					var itemFulfilment = record.transform({
    						fromType: record.Type.SALES_ORDER,
    						fromId: salesOrderID,
    						toType: record.Type.ITEM_FULFILLMENT
    					});
    					
    					// get count of lines on the fulfilment
    					var lineCount = itemFulfilment.getLineCount({
    						sublistId: 'item'
    					});
    					
    					// loop through items
    					for (var x = 0; x < lineCount; x++)
    						{
    							// get the value of the podoc field for the line
    							var poNumber = itemFulfilment.getSublistValue({
    								sublistId: 'item',
    								fieldId: 'podoc',
    								line: x
    							});
    							
    							if (poNumber != purchaseOrderID)
    								{
    									// untick the fulfill checkbox for the line
    									itemFulfilment.setSublistValue({
    										sublistId: 'item',
    										fieldId: 'itemreceive',
    										value: false,
    										line: x
    									});
    								}
    						}
    					
    					// save the fulfilment record
    					var fulfilmentID = itemFulfilment.save();
    					
    					log.audit({
    						title: 'Item Fulfilment Created',
    						details: 'Sales Order ID: ' + salesOrderID + '<br>Purchase Order ID: ' + purchaseOrderID + '<br>Fulfilment ID: ' + fulfilmentID
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Creating Item Fulfilment',
    						details: 'Sales Order ID: ' + salesOrderID + '<br>Purchase Order ID: ' + purchaseOrderID + '<br>Error: ' + e.message
    					});
    				}   			
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getPurchaseOrders() {
    	
    	// retrieve script parameters
    	var purchaseOrders = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_po_array'
    	});
    	
    	// replace characters in the string
    	purchaseOrders = purchaseOrders.replace('[', '');
    	purchaseOrders = purchaseOrders.replace(/"/g, ''); // replace ALL instances
    	purchaseOrders = purchaseOrders.replace(']', '');
    	
    	// split purchaseOrders string into an array and return to the main script function
    	return purchaseOrders.split(',');
    	
    }
    
    function getCreatedFrom(purchaseOrderID) {
    	
    	// lookup fields on the purchase order record and return to the main script function
    	return search.lookupFields({
    		type: search.Type.PURCHASE_ORDER,
    		id: purchaseOrderID,
    		columns: ['createdfrom']
    	}).createdfrom[0].value;
    	
    }

    return {
        execute: execute
    };
    
});
