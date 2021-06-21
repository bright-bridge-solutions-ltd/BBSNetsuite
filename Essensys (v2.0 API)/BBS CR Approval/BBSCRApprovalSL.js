/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['./BBSCRApprovalLibrary', 'N/search'],
function(library, search) {
   
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
    		
    	// lookup fields on the RMA record
    	var rmaLookup = search.lookupFields({
    		type: search.Type.RETURN_AUTHORIZATION,
    		id: recordID,
    		columns: ['total', 'custbody_bbs_approval_status', 'custbody_bbs_next_approver']
    	});
    	
    	// retrieve values from the RMA lookup
    	var total 			= parseFloat(rmaLookup.total * -1); // lookup returns negative number so multiply by -1 to get a positive number
    	var approvalStatus 	= rmaLookup.custbody_bbs_approval_status[0].value;
    	var nextApprover	= rmaLookup.custbody_bbs_next_approver[0].value;
    	
    	// call library function to get the next approver's approval limit
    	var approvalLimit = library.getApprovalLimit(nextApprover);
    	
    	if (approvalStatus == 17) // if the approvalStatus is 17 (CFO Approval)
    		{
    			// call library function to mark the RMA record as approved
				library.approveRMA(recordID);
    		}
    	else if (approvalStatus == 16) // if the approvalStatus is 16 (Finance Director Approval)
    		{
    			if (total > approvalLimit)
    				{
    					// call library function to update the approval status on the RMA record
    					library.updateApprovalStatus(recordID, 17);
    				}
    			else
    				{
    					// call library function to mark the RMA record as approved
    					library.approveRMA(recordID);
    				}
    		}
    	else if (approvalStatus == 15) // if the approvalStatus is 15 (Financial Controller Approval)
    		{
	    		if (total > approvalLimit)
					{
						// call library function to update the approval status on the RMA record
	    				library.updateApprovalStatus(recordID, 16);
					}
				else
					{
						// call library function to mark the RMA record as approved
						library.approveRMA(recordID);
					}
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
