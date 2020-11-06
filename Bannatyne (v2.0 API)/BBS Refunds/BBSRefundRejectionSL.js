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
		    	
		    	// update fields on the refund request record
		    	record.submitFields({
		    		type: 'customrecord_refund_request',
		    		id: recordID,
		    		values: {
		    			custrecord_refund_approval_status: 3, // 3 = Rejected
		    			custrecord_bbs_refund_rejection_reason: rejectionReason,
		    			custrecord_bbs_refund_rejected_by: currentUserID
		    		}
		    	});
    			
    			log.audit({
    				title: 'Refund Request Record Updated',
    				details: recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Refund Request Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
    			});
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
