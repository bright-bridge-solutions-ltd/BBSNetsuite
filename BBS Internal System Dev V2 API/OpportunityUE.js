/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record'],
function(runtime, record) {
   
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
    	
    	// check the record is being inline edited
    	if (scriptContext.type == scriptContext.UserEventType.XEDIT)
    		{
    			// get the old record object
    			var oldRecord = scriptContext.oldRecord;
    			
    			// get the ID of the current record
    			var recordID = scriptContext.newRecord.id;
    			
    			// reload the opportunity record
    			var newRecord = record.load({
    				type: record.Type.OPPORTUNTIY,
    				id: recordID
    			});
    			
    			// retrieve values from the oldRecord object
    			var oldSubscriptionMargin = oldRecord.getValue({
    				fieldId: 'custbody_bbs_subscription_margin'
    			});
    			
    			var oldServicesMargin = oldRecord.getValue({
    				fieldId: 'custbody_bbs_sservices_margin'
    			});
    			
    			var oldSupportMargin = oldRecord.getValue({
    				fieldId: 'custbody_bbs_support_margin'
    			});
    			
    			// retrieve values from the newRecord object
    			var newSubscriptionMargin = newRecord.getValue({
    				fieldId: 'custbody_bbs_subscription_margin'
    			});
    			
    			var newServicesMargin = newRecord.getValue({
    				fieldId: 'custbody_bbs_sservices_margin'
    			});
    			
    			var newSupportMargin = newRecord.getValue({
    				fieldId: 'custbody_bbs_support_margin'
    			});
    			
    			// if oldSubscriptionMargin != newSubscriptionMargin OR oldServicesMargin != newServicesMargin OR oldSupportMargin != newSupportMargin (IE these fields have changed)
    			if (oldSubscriptionMargin != newSubscriptionMargin || oldServicesMargin != newServicesMargin || oldSupportMargin != newSupportMargin)
    				{
	    				// if newSubscriptionMargin contains a value
	        			if (newSubscriptionMargin)
	        				{
	        					// use parseFloat to convert to number
	        					newSubscriptionMargin = parseFloat(newSubscriptionMargin);
	        				}
	        			else
	        				{
	        					// set newSubscriptionMargin to 0
	        					newSubscriptionMargin = 0;
	        				}
	        			
	        			// if newServicesMargin contains a value
	        			if (newServicesMargin)
	        				{
	        					// use parseFloat to convert to number
	        					newServicesMargin = parseFloat(newServicesMargin);
	        				}
	        			else
	        				{
	        					// set newServicesMargin to 0
	        					newServicesMargin = 0;
	        				}
	        			
	        			// if newSupportMargin contains a value
	        			if (newSupportMargin)
	        				{
	        					// use parseFloat to convert to number
	        					newSupportMargin = parseFloat(newSupportMargin);
	        				}
	        			else
	        				{
	        					// set newSupportMargin to 0
	        					newSupportMargin = 0;
	        				}
	        			
	        			// add margins together to calculate margin total
	        			var marginTotal = newSubscriptionMargin + newServicesMargin + newSupportMargin;
	        			
	        			// update the Projected Total field on the record
	        			record.submitFields({
	        				type: record.Type.OPPORTUNITY,
	        				id: recordID,
	        				values: {
	        					projectedtotal: marginTotal
	        				}
	        			});
    				}
    			
    		}

    }

    return {
        afterSubmit: afterSubmit
    };
    
});
