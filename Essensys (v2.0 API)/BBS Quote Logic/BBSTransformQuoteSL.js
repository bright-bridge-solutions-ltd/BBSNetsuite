/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// retrieve parameters that were passed from the client script
    	var recordID = context.request.parameters.id;
    		recordID = parseInt(recordID); // use parseInt to convert to a number
    		
    	// declare and initialize variables
    	var salesOrderID = null;
    	
    	try
    		{
    			// transform the estimate into a sales order
    			salesOrderID = record.transform({
    				fromType: record.Type.ESTIMATE,
    				fromId: recordID,
    				toType: record.Type.SALES_ORDER
    			}).save({
    				ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Sales Order Created',
    				details: 'Quote ID: ' + recordID + '<br>Sales Order ID: ' + salesOrderID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Sales Order',
    				details: 'Quote ID: ' + recordID + '<br>Error: ' + e
    			});
    		}
    	
    	if (salesOrderID) // if a sales order has been created successfully
    		{
    			try
    				{
		    			// update the sales estimate
		    			record.submitFields({
		    				type: record.Type.ESTIMATE,
		    				id: recordID,
		    				values: {
		    					custbody_bbs_linked_sales_order: salesOrderID,
		    					custbody_bbs_approval_status: 10 // 10 = Approved & Agreed
		    				},
		    				enableSourcing: false,
							ignoreMandatoryFields: true
		    			});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Updating Estimate',
    						details: 'Record ID: ' + recordID + ' | Error: ' + e
    					});
    				}
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
