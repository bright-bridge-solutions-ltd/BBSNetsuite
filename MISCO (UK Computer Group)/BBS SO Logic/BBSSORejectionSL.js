/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record'],
function(runtime, record) {
   
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
    	
    	var rejectionReason = context.request.parameters.reason;
    	
    	try
    		{
		    	// get the current user
		    	var currentUserID = runtime.getCurrentUser().id;
		    	
		    	// update fields on the sales order record
		    	record.submitFields({
		    		type: record.Type.SALES_ORDER,
		    		id: recordID,
		    		values: {
		    			custbody_bbs_approval_status: 7, // 7 = Rejected
		    			custbody_bbs_rejection_reason: rejectionReason,
		    			custbody_bbs_rejected_by: currentUserID
		    		}
		    	});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Sales Order',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
    			});
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
