/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
function() {
   
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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the text value of the created from field
    			var createdFrom = currentRecord.getText({
    				fieldId: 'createdfrom'
    			});
    			
    			// if the createdFrom variable contains 'Purchase Order'
    			if (createdFrom.indexOf('Purchase Order') > -1)
    				{
    					// tick the landed cost per line checkbox
    					currentRecord.setValue({
    						fieldId: 'landedcostperline',
    						value: true
    					});   				
    				
    					// get count of items
    					var itemCount = currentRecord.getLineCount({
    						sublistId: 'item'
    					});
    					
    					// loop through item lines
    					for (var i = 0; i < itemCount; i++)
    						{
    							// tick the calculate est. landed cost checkbox for the line
    							currentRecord.setSublistValue({
    								sublistId: 'item',
    								fieldId: 'custcol_scm_lc_autocalc',
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
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
