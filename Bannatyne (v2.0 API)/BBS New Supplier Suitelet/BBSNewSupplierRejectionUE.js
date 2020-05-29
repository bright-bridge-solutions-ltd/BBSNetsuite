/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime'],
function(runtime) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	// check the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
	    		// get the current user's role
    			var userRole = runtime.getCurrentUser().role;
    		
    			// get the current record
				var currentRecord = scriptContext.newRecord;
				
				// get the value of the 'Procurement Approval' field
				var procurementApproval = currentRecord.getValue({
					fieldId: 'custrecord_tbg_supp_entry_proc_approve'
				});
				
				// get the value of the 'CFO Approval' field
				var cfoApproval = currentRecord.getValue({
					fieldId: 'custrecord_tbg_supp_entry_cfo_approval'
				});
				
				/* IF statement to check that:
				 * 
				 * procurementApproval is 1 (Pending Approval) AND userRole is 1028 (TBG - Procurement team)
				 * OR
				 * procurementApproval is 2 (Approved) AND cfoApproval is 1 (Pending Approval) AND userRole is 1014 (TBG - CFO)
				 * 
				 */
				
				if ((procurementApproval == 1 && userRole == 1028) || (procurementApproval == 2 && cfoApproval == 1 && userRole == 1014))
					{
						// get ID of current record
		        		var recordID = scriptContext.newRecord.id;
		        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 406930;
			        	
			        	// add buttons to the form
			        	scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Rejected',
			    			functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
			    		});
					}
    		}
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
