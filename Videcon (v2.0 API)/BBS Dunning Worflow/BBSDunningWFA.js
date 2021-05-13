/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record'],
function(record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// get internal ID of the customer
    	var customerID = scriptContext.newRecord.getValue({
    		fieldId: 'entity'
    	});
    	
    	try
    		{
    			// tick the 'On Hold' checkbox on the customer
    			record.submitFields({
    				type: record.Type.CUSTOMER,
    				id: customerID,
    				values: {
    					custentity_bbs_on_hold: true
    				}
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Customer ' + customerID,
    				details: e.message
    			});
    		}

    }

    return {
        onAction : onAction
    };
    
});
