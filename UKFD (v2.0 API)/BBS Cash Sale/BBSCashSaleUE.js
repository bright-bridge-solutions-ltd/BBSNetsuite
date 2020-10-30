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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the linked RA field
    			var linkedRA = currentRecord.getValue({
    				fieldId: 'custbody_bbs_linked_ra'
    			});
    			
    			// if the linkedRA field is populated
    			if (linkedRA)
    				{
    					try
    						{
    							// update the RA with the cash sale ID
    							record.submitFields({
    								type: record.Type.RETURN_AUTHORIZATION,
    								id: linkedRA,
    								values: {
    									custbody_bbs_collection_fee_cash_sale: currentRecord.id
    								}
    							});
    						}
    					catch(e)
    						{
    							log.error({
    								title: 'Error Updating Return Authorisation',
    								details: 'ID: ' + linkedRA + '<br>Error: ' + e
    							});
    						}
    				}
    		}

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
