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
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the internal ID of the current record
    			var currentRecordID = currentRecord.id;
    			
    			// get the value of the approval status field
    			var approvalStatus = currentRecord.getValue({
    				fieldId: 'custrecord_refund_approval_status'
    			});
    			
    			// get the ID of the current user's role
    			var userRole = runtime.getCurrentUser().role;
    			
    			// get the ID of the current user
    			var userID = runtime.getCurrentUser().id;
    			
    			/*
    			 * is approvalStatus is 1 (Pending Approval) AND userRole is one of the following:
    			 * 
    			 * 3 	(Administrator)
    			 * 1062	(TBG - Central Regional Managers)
    			 * 1091	(TBG - Contact Centre)
    			 * 1060	(TBG - East Anglia Regional Manager)
    			 * 1088	(TBG - Legal Team)
    			 * 1076	(TBG - London Regional Manager)
    			 * 1025	(TBG - Management Accountant)
    			 * 1072	(TBG - North East Regional Manager)
    			 * 1068	(TBG - North West Regional Manager)	
    			 * 1036	(TBG - Regional Managers OLD)
    			 * 1064	(TBG - South East Regional Manager)
    			 * 1071	(TBG - South West Regional Manager)
    			 *   
    			 * OR
    			 *   
    			 * approvalStatus is 2 (Approved) AND userRole is one of the following OR userID is 541 (Paul Farrow)
    			 *   
    			 * 3	(Administrator)
    			 * 1091	(TBG - Contact Centre)
    			 * 1025	(TBG - Management Accountant)
    			 */
    			
    			if ((approvalStatus == 1 && (userRole == 3 || userRole == 1062 || userRole == 1091 || userRole == 1060 || userRole == 1088 || userRole == 1076 || userRole == 1025 || userRole == 1072 || userRole == 1068 || userRole == 1036 || userRole == 1064 || userRole == 1071)) || (approvalStatus == 2 && (userRole == 3 || userRole == 1091 || userRole == 1025 || userID == 541)))
    				{
    					// get the ID of the record
    					var recordID = currentRecord.id;
    				
    					// set client script to run on the form
    					scriptContext.form.clientScriptFileId = 414960;
    					
    					// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Rejected',
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
