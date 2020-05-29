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
    	
    	// get the current user's role
		var userRole = runtime.getCurrentUser().role;
    	
    	try
    		{
		    	// check if the userRole is 1028 (TBG - Procurement team)
    			if (userRole == 1028)
    				{
    					// set the rejection fields for the Procurement Approval section on the record
	    				record.submitFields({
	    		    		type: 'customrecord_tbg_supp_entry',
	    		    		id: recordID,
	    		    		values:	{
	    		    			custrecord_tbg_supp_entry_proc_rejection: rejectionReason,
	    		    			custrecord_tbg_supp_entry_proc_approve: 3 // 3 = Rejected
	    		    		}
	    				});
    				}
    			else if (userRole = 1014) // if the userRole is 1014 (TBG - CFO)
    				{
	    				// set the rejection fields for the CFO Approval section on the record
	    				record.submitFields({
	    		    		type: 'customrecord_tbg_supp_entry',
	    		    		id: recordID,
	    		    		values:	{
	    		    			custrecord_tbg_supp_entry_cfo_rejection: rejectionReason,
	    		    			custrecord_tbg_supp_entry_cfo_approval: 3 // 3 = Rejected
	    		 	    	}
	    				});
    				}
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
