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
    	if (scriptContext.type == 'view')
    		{
    			// get the internal ID of the current user
    			var currentUser = runtime.getCurrentUser().id;
    			
    			// get the internal ID of the current user's role
    			var userRole = runtime.getCurrentUser().role;
    		
    			// get the current record object
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the 'PO Approval Workflow State' field
    			var workflowState = currentRecord.getValue({
    				fieldId: 'custbody_bbs_po_approval_state'
    			});
    			
    			// get the value of the 'Next Approver' field
    			var nextApprover = currentRecord.getValue({
    				fieldId: 'nextapprover'
    			});
    			
    			// get the value of the 'Approval Routing' field
    			var approvalRouting = currentRecord.getValue({
    				fieldId: 'custbody11'
    			});  			
    			
    			/*
    			 * check if:
    			 * 
    			 * workflowState = 'Pending L1 Approval'
    			 * AND
    			 * currentUser = nextApprover OR userRole = 3 (Administrator)
    			 * OR
    			 * currentUser = 178 (Kelly Smith) AND approvalRouting = 1 (Estates)
    			 * 
    			 * OR
    			 * 
    			 * workflowState = 'Pending L2 Approval'
    			 * AND
    			 * currentUser = nextApprover OR userRole = 3 (Administrator) OR currentUser = 3849 (Angela Trevor) or currentUser = 5096 (Kelly Spence)
    			 */
    			
    			if ((workflowState == 'Pending L1 Approval' && ((currentUser = nextApprover || userRole == 3) || (currentUser == 178 && approvalRouting == 1))) || (workflowState == 'Pending L2 Approval' && (currentUser == nextApprover || userRole == 3 || currentUser == 3849 || currentUser == 5096)))
    				{
    					// get the ID of the current record
    					var recordID = currentRecord.id;
    				
    					// set a client script to run on the form
		        		scriptContext.form.clientScriptFileId = 406628;
			    	
			    		// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Reject',
			    			functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID
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
