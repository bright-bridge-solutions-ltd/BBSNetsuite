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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// retrieve script parameters
    			var allocationStrategy = runtime.getCurrentScript().getParameter({
    				name: 'custscript_bbs_wo_def_allocate_strategy'
    			});
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get count of item lines
    			var lineCount = currentRecord.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through items
    			for (var i = 0; i < lineCount; i++)
    				{
    					// set the allocation strategy
    					currentRecord.setSublistValue({
    						sublistId: 'item',
    						fieldId: 'orderallocationstrategy',
    						value: allocationStrategy,
    						line: i
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
    function afterSubmit(scriptContext) {

    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
