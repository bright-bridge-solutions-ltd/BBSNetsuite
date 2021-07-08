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
    	
    	if ((scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) && runtime.executionContext != runtime.ContextType.USER_INTERFACE)
    		{
	    		// get the due date from the header
				var dueDate = scriptContext.newRecord.getValue({
					fieldId: 'duedate'
				});
				
				// if we have a due date
				if (dueDate)
					{
		    			// if the selected due date is a weekend
		    			if (dueDate.getDay() == 6 || dueDate.getDay() == 0) // Saturday
		    				{
		    					// add 2 days to the dueDate to get to the next working day
		    					dueDate.setDate(dueDate.getDate() + 2);
		    				}
		    			
		    			// get count of items
		    			var itemCount = scriptContext.newRecord.getLineCount({
		    				sublistId: 'item'
		    			});
		    			
		    			// loop through items
		    			for (var i = 0; i < itemCount; i++)
		    				{
			    				// set the expected delivery date field on the line using the due date field on the header
				    			scriptContext.newRecord.setSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'expectedreceiptdate',
				    				value: dueDate,
				    				line: i
				    			});
		    				}
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
