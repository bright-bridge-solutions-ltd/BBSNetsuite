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
		    	// set the rejection fields on the record
	    		record.submitFields({
	    		    type: 'customrecord_bbs_seci_site_form',
	    		    id: recordID,
	    		    values:	{
	    		    	custrecord_bbs_seci_site_reason_reject: rejectionReason,
	    		    	custrecord_bbs_seci_site_approval_status: 3 // 3 = Rejected
	    		    }
	    		});
    		}
    	catch(error)
	    	{
	    		log.error({
	    			title: 'Error Updating Record',
	    			details: 'Record ID: ' + recordID + ' | Error: ' + error
	    		});
	    	}

    }

    return {
        onRequest: onRequest
    };
    
});
