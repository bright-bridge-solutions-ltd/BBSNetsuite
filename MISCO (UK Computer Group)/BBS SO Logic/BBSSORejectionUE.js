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
    	
    	// check the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the order and approval status from the record
    			var approvalStatus = currentRecord.getValue({
    				fieldId: 'custbody_bbs_approval_status'
    			});
    			
    			// get the user ID and role
    			var userID 		= runtime.getCurrentUser().id;
    			var userRole	= runtime.getCurrentUser().role;
    			
    			// lookup fields on the employee record
    			var isCreditController = searchEmployeeRecord(userID);
    			
    			// ===============================================
    			// SHOW REJECT BUTTON BASED UPON DEFINED CONDITION
    			// ===============================================
    			
    			if ((approvalStatus == 2 && (userRole == 1021 || userRole == 3)) || (approvalStatus == 3 && (userRole == 1008 || userRole == 3)) || (approvalStatus == 4 && (isCreditController == true || userRole == 3)) || (approvalStatus == 5 && (userRole == 1011 || userRole == 3)))
    				{
    					// set a client script to run on the form
    					scriptContext.form.clientScriptFileId = 285829;
    					
    					// add a button to the form and call client script when the button is clicked
    					scriptContext.form.addButton({
    						id: 'custpage_reject',
    			    		label: 'Reject',
    			    		functionName: "reject(" + currentRecord.id + ")"
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
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function searchEmployeeRecord(employeeID) {
    	
    	// lookup fields on the employee record
    	return search.lookupFields({
    		type: search.Type.EMPLOYEE,
    		id: employeeID,
    		columns: ['custentity_bbs_creditcontroller']
    	}).custentity_bbs_creditcontroller;
    	
    }

    return {
        beforeLoad: beforeLoad
    };
    
});
