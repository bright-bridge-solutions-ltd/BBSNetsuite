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
    	var rejectionReason = context.request.parameters.reason;
    	
    	try
    		{
		    	// set the 'Rejection Reason' and 'Approval Status' fields on the estimate
		    	record.submitFields({
		    		type: record.Type.ESTIMATE,
		    		id: recordID,
		    		values:	{
		    			custbody_bbs_rejected_reason: rejectionReason,
		    			custbody_bbs_approval_status: 5 // 5 = Rejected
		    		},
		    		enableSourcing: false,
					ignoreMandatoryFields: true
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
