/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search'],
function(runtime, search) {
   
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
    	
    	// check that the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
		    	// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the approval status field
    			var approvalStatus = currentRecord.getValue({
    				fieldId: 'custbody_bbs_approval_status'
    			});
    			
    			// get the user's ID and current role
    		    var userID = runtime.getCurrentUser().id;
    			var userRole = runtime.getCurrentUser().role;
    					
    			// get the user's supervisor
    			var supervisor = search.lookupFields({
    				type: search.Type.EMPLOYEE,
    				id: userID,
    				columns: ['supervisor']
    			}).supervisor[0].value;
    					
    			/*
    			 * approvalStatus = 1 (Technical Approval) AND userRole is 1016 (essensys Head of Provisioning), 1000 (essensys Project Manager) or 3 (Administrator)
    			 * OR
    			 * approvalStatus = 11 (Supervisor Approval) AND userID = supervisor OR userRole = 3 (Administrator)
    			 * 
    			 * orderType = 3 (Equipment) AND userRole is 1016 (essensys Head of Provisioning), 1000 (essensys Project Manager) or 3 (Administrator)
    			 * OR
    			 * userID = supervisor OR userRole = 3 (Administrator)
    			 */
    			
    			if ((approvalStatus == 1 && (userRole == 1016 || userRole == 1000 || userRole == 3)) || (approvalStatus == 11 && (userID == supervisor || userRole == 3)))
    				{
    					// get ID of current record
	    			  	var recordID = scriptContext.newRecord.id;
	    			        	
	    			  	// set client script to run on the form
	    			  	scriptContext.form.clientScriptFileId = 183766;
	    			  	
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
        beforeLoad: beforeLoad
    };
    
});
