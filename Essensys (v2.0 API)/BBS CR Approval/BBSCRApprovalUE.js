/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/url', 'N/https'],
function(runtime, url, https) {
   
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
		    	
		    	// get the value of the 'Status' field
		    	var status = currentRecord.getValue({
		    		fieldId: 'status'
		    	});
		    	
		    	// get the value of the 'Next Approver' field
		    	var nextApprover = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_next_approver'
		    	});
		    	
		    	// get the ID of the current user
		    	var currentUserID = runtime.getCurrentUser().id;
		    	
		    	// get the current user's role
		    	var currentUserRole = runtime.getCurrentUser().role;
		    	
		    	// if approvalStatus is 3 (Pending Approval) and status is Pending Approval and nextApprover is currentUserID OR currentUserRole is 3 (Administrator)
		    	if (approvalStatus == 3 && status == 'Pending Approval' && (nextApprover == currentUserID || currentUserRole == 3))
		    		{
			    		// get ID of current record
			        	var recordID = scriptContext.newRecord.id;
			        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 36119;
			        	
			        	// add buttons to the form
			        	scriptContext.form.addButton({
			    			id: 'custpage_approve',
			    			label: 'Approve',
			    			functionName: "approve(" + recordID + ")" // call client script when button is clicked. Pass recordID, invoiceID and level1Approved to client script
			    		});
			        	
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
