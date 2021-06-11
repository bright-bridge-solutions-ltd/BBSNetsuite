/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', './BBSCRApprovalLibrary'],
function(runtime, library) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// retrieve script parameters
    	var recordID = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_cr_approval_sch_record_id'
    	});
    	
    	// call library function to transform the RMA into a Credit Memo. Pass recordID
		var creditMemoID = library.transformToCreditMemo(recordID);
	        	
		// if we have been able to create the credit memo
		if (creditMemoID)
	        {
	        	// call library function to close the RMA record
	        	library.closeRMA(recordID, creditMemoID);
	        }	

    }

    return {
        execute: execute
    };
    
});
