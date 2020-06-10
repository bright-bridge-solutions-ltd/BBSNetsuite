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
	    		// retrieve script parameters
    			var currentScript = runtime.getCurrentScript();
    			
    			var approvalRole = currentScript.getParameter({
    				name: 'custscript_bbs_seci_approval_role'
    			});
    			
    			var approvalUser = currentScript.getParameter({
    				name: 'custscript_bbs_seci_approval_user'
    			});
    		
    			// get the current user's role and id
    			var userRole 	= runtime.getCurrentUser().role;
    			var userID		= runtime.getCurrentUser().id;

    			// get the current record
				var currentRecord = scriptContext.newRecord;
				
				// get the value of the 'Approval Status' field
				var approvalStatus = currentRecord.getValue({
					fieldId: 'custrecord_bbs_seci_site_approval_status'
				});
				
				// if the approvalStatus is 2 (Pending Approval) and approvalRole = userRole OR approvalUser = userID
				if (approvalStatus == 2 && (approvalRole == userRole || approvalUser == userID))
					{
						// get ID of current record
		        		var recordID = currentRecord.id;
		        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 408492;
			        	
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
