/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) {
   
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
    	
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// declare and initialize variables
    			var salesRepInitials = null;
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the sales rep field
    			var salesRep = currentRecord.getValue({
    				fieldId: 'salesrep'
    			});
    			
    			// if we have a sales rep
    			if (salesRep)
    				{
    					try
    						{
    							salesRepInitials = record.load({
    								type: record.Type.EMPLOYEE,
    								id: salesRep
    							}).getValue({
    								fieldId: 'initials'
    							});
    						}
    					catch(e)
    						{
    							log.error({
    								title: 'Error Loading Sales Rep ' + salesRep,
    								details: e.message
    							});
    						}
    				}
    			
    			// set the sales rep initials field
				currentRecord.setValue({
					fieldId: 'custbody_bbs_sales_rep_initials',
					value: salesRepInitials
				});
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
