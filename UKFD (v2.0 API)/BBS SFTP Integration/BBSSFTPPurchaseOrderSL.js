/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['./BBSSFTPLibrary', 'N/record'],
/**
 * @param {ui} ui
 * @param {serverWidget} serverWidget
 */
function(sftpLibrary, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// get the purchase orders to update
    	var purchaseOrders = context.request.body;
    	
    	// remove characters from the list of purchase orders and create an array
    	purchaseOrders = purchaseOrders.replace('{', '').replace('}', '').split(',');
    	
    	// loop through purchase orders
    	for (var i = 0; i < purchaseOrders.length; i++)
    		{
    			// get the internal ID of the purchase order
    			var poID = purchaseOrders[i];
    			
    			// call library function to lookup values on the purchase order
    			var purchaseOrderInfo = sftpLibrary.getPurchaseOrderInfo(poID);
    			
    			// call library function to get the SFTP details for the supplier
    			var sftpDetails = sftpLibrary.getSftpDetails(purchaseOrderInfo.supplierID);
    			
    			// if we have SFTP details for this supplier
		    	if (sftpDetails.endpoint)
		    		{
		    			// call library function to calculate the required delivery date
						var requiredDeliveryDate = sftpLibrary.calculateDate(purchaseOrderInfo.soFulfilDate, sftpDetails.leadTime, sftpDetails.processingDays);
						
						try
							{
								// update the Furlong requested delivery date on the purchase order
								record.submitFields({
									type: record.Type.PURCHASE_ORDER,
									id: poID,
									values: {
										custbody_bbs_requested_delivery_date: requiredDeliveryDate
									}
								});
							}
						catch(e)
							{
								log.error({
									title: 'Error Updating Purchase Order ' + poID,
									details: e
								});
							}
		    		}
    		}
    	
    }
    
    return {
        onRequest: onRequest
    };
    
});
