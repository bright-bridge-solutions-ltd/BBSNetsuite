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
    	
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.COPY)
			{
				// set revision number field to 1
				scriptContext.newRecord.setValue({
					fieldId: 'custbody_bbs_revision_number',
					value: 1
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
    function beforeSubmit(scriptContext) {
    	
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the value of the revision number field
    			var revisionNumber = scriptContext.newRecord.getValue({
    				fieldId: 'custbody_bbs_revision_number'
    			});
    			
    			// if we have a revision number
    			if (revisionNumber)
    				{
    					// increment the revisionNumber by 1 and set the revision number field
    					scriptContext.newRecord.setValue({
    	    				fieldId: 'custbody_bbs_revision_number',
    	    				value: revisionNumber++
    	    			});
    				}
    			else
    				{
	    				// set revision number field to 1
	        			scriptContext.newRecord.setValue({
	        				fieldId: 'custbody_bbs_revision_number',
	        				value: 1
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
    	beforeLoad:		beforeLoad,
    	beforeSubmit: 	beforeSubmit
    };
    
});
