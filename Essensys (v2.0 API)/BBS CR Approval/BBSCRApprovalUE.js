/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSCRApprovalLibrary', 'N/runtime', 'N/task'],
function(library, runtime, task) {
   
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
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
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
		    	
		    	// if approvalStatus is 15 (Financial Controller Approval) OR 16 (Finance Director Approval) OR 17 (CFO Approval) and status is Pending Approval and nextApprover is currentUserID OR currentUserRole is 3 (Administrator)
		    	if ((approvalStatus == 15 || approvalStatus == 16 || approvalStatus == 17) && status == 'Pending Approval' && (nextApprover == currentUserID || currentUserRole == 3))
		    		{
			    		// get ID of current record
			        	var recordID = scriptContext.newRecord.id;
			        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 44912;
			        	
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
    	
    	if (scriptContext.type == scriptContext.UserEventType.APPROVE)
    		{
    			// schedule a script to transform the RMA into a credit memo
	    		var scheduledTaskID = task.create({
	        	    taskType: task.TaskType.SCHEDULED_SCRIPT,
	        	    scriptId: 'customscript_bbs_cr_approval_sch',
	        	    deploymentId: '',
	        	    params: {
	        	    	custscript_bbs_cr_approval_sch_record_id: scriptContext.newRecord.id
	        	    }
	        	}).submit();
        	
	        	log.audit({
	        		title: 'Script Scheduled',
	        		details: 'BBS Create Site Reports script has been Scheduled. Job ID ' + scheduledTaskID
	        	});		
    		}

    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
    
});
