/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSEOMTermsLibrary', 'N/runtime'],
function(libraryScript, runtime) {
   
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
    	
    	// check the record is being created/edited via any method OTHER than the UI
    	if ((scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) && runtime.executionContext != runtime.ContextType.USER_INTERFACE)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    		
    			// get the value of the override due date field
    			var overrideDueDate = currentRecord.getValue({
    				fieldId: 'custbody_bbs_override_due_date'
    			});
    			
    			// if the override checkbox is unticked
    			if (overrideDueDate == false)
    				{
    					// call library script function to recalculate the due date
    					libraryScript.recalculateDueDate(currentRecord);
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
    function afterSubmit(scriptContext) {

    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
