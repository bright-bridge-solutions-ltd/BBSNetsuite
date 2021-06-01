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
		    	// update fields on the SECI time entry record
		    	record.submitFields({
		    		type: 'customrecord_bbs_seci_time_entry',
		    		id: recordID,
		    		values: {
		    			custrecord_bbs_seci_time_entry_approval: 3, // 3 = Rejected
		    			custrecord_bbs_seci_time_entry_rejected: rejectionReason
		    		}
		    	});
    			
    			log.audit({
    				title: 'SECI Time Entry Record Updated',
    				details: recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating SECI Time Entry Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
    			});
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
