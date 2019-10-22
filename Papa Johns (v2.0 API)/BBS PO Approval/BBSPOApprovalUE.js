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
		    	
		    	// get the value of the 'BBS - APPROVAL STATUS' field
		    	var approvalStatus = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_appr_status'
		    	});
		    	
		    	// get the value of the 'BBS - NON STOCK NEXT APPROVER' field
		    	var nextApprover = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_non_stock_nextapprover'
		    	});
		    	
		    	// get the value of the 'BBS - SHOW REJECT BUTTON' field
		    	var showButton = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_show_reject_button'
		    	});
		    	
		    	// get the ID of the current user
		    	var currentUser = runtime.getCurrentUser().id;
		    	
		    	// get the ID of the current user's role
		    	var userRole = runtime.getCurrentUser().role;
		    	
		    	/* If statement to check that the following conditions are met:
		    	 * 
		    	 * showButton variable returns true
		    	 * AND
		    	 * approvalStatus variable returns 1 (Pending Approval)
		    	 * AND
		    	 * customForm variable returns 165 (BBS - Papa John's Non Stock Purchase Order)
		    	 * AND
		    	 * currentUser variable equals the nextApprover variable
		    	 * OR
		    	 * userRole variable returns 3 (Administrator)
		    	 * OR
		    	 * userRole variable returns 1039 (PJ A/P Controller)
		    	 */

		    	if (showButton == false && approvalStatus == '1' && (currentUser == nextApprover || userRole == 3 || userRole == 1039))
		    		{
			    		// get ID of current record
			        	var recordID = scriptContext.newRecord.id;
			        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 282220;
			    	
			    		// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Reject',
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
