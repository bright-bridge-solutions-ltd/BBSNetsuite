/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['./BBSSOApprovalLibrary', 'N/record'],
function(libraryScript, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// declare and initialize variables
    	var allItemsInStock = false;
    	
    	// retrieve parameters that were passed from the client script
    	var recordID = context.request.parameters.id;
    		recordID = parseInt(recordID); // use parseInt to convert to a number
    	
    	try
    		{
		    	// load the sales order record
    			var soRecord = record.load({
    				type: record.Type.SALES_ORDER,
    				id: recordID
    			});
    			
    			// call function to check if all items are in stock
				allItemsInStock = libraryScript.checkStockLevels(soRecord);
				
				// update fields on the sales order
				record.submitFields({
					type: record.Type.SALES_ORDER,
					id: recordID,
					values: {
						custbody_bbs_all_items_in_stock: allItemsInStock,
						custbody_bbs_stock_last_checked: new Date() // today's date
					}
				});	
    		}
    	catch(e)
    		{
    			allItemsInStock = false;
    		
    			log.error({
    				title: 'Error Refreshing Stock Check on Sales Order ' + recordID,
    				details: e.message
    			});
    		}
    	
    	context.response.write('allItemsInStock: ' + allItemsInStock);

    }

    return {
        onRequest: onRequest
    };
    
});
