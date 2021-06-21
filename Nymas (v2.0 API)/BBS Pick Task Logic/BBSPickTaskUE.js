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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			try
    				{
		    			// set the header item fulfilment field using the first pick action line
		    			record.submitFields({
		    				type: record.Type.PICK_TASK,
		    				id: scriptContext.newRecord.id,
		    				values: {
		    					custrecord_bbs_item_fulfilment: scriptContext.newRecord.getSublistValue({
		        					sublistId: 'pickactions',
		        					fieldId: 'shipnumberid',
		        					line: 0 
		        				})
		    				}
		    			});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Uploading Pick Task ' + scriptContext.newRecord.id,
    						details: e.message
    					});
    				}
    		}

    }

    return {
        afterSubmit: afterSubmit
    };
    
});
