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
    	
    	// check if the record is being viewed
    	if (scriptContext.type == 'view')
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord; 
		    	
		    	// get the value of the 'Approval Status' field
		    	var approvalStatus = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_approval_status'
		    	});
		    	
		    	// get the ID of the current user's role
		    	var userRole = runtime.getCurrentUser().role;
		    	
		    	/* If statement to check that the following conditions are met:
		    	 * 
		    	 * approvalStatus variable returns 1 (Technical Approval)
		    	 * AND
		    	 * userRole variable returns 1014 (essensys COO (from CEO)), 1016 (essensys Head of Provisioning), 1000 (essensys Project Manager) or 3 (Administrator)
		    	 * OR
		    	 * approvalStatus variable returns 2 (Finance Approval)
		    	 * OR
		    	 * userRole variable 1012 (essensys CFO), 1013 (essensys Director of Finance) or 3 (Administator)
		    	 */

		    	if ((approvalStatus == 1 && (userRole == 1014 || userRole == 1016 || userRole == 1000 || userRole == 3)) || (approvalStatus == 2 && (userRole == 1012 || userRole == 1013 || userRole == 3)))
		    		{
			    		// get ID of current record
			        	var recordID = scriptContext.newRecord.id;
			        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 13933;
			    	
			    		// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Reject',
			    			functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID and userID to client script
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
