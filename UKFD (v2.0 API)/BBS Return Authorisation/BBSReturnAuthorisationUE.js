/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/redirect', 'N/record'],
function(redirect, record) {
   
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
    			
    			// get the value of the charge collection fee checkbox
    			var collectionFee = currentRecord.getValue({
    				fieldId: 'custbody_bbs_charge_collection_fee'
    			});
    			
    			// get the collection fee amount
				var collectionFeeAmount = parseFloat(currentRecord.getValue({
					fieldId: 'custbody_bbs_collection_fee_amount'
				}));
    			
    			// if collectionFee returns true and collectionFeeAmount > 0
    			if (collectionFee == true && collectionFeeAmount > 0)
    				{
    					// get the customer ID
    					var customerID = currentRecord.getValue({
    						fieldId: 'entity'
    					});
    					
    					// get the location ID
    					var locationID = currentRecord.getValue({
    						fieldId: 'location'
    					});
    					
    					// redirect the user to a new cash sale
    					redirect.toRecordTransform({
    						fromId: 	customerID,
    						fromType: 	record.Type.CUSTOMER,
    						toType:		record.Type.CASH_SALE,
    						parameters: {
    							collection:				collectionFee,
    							collectionfee: 			collectionFeeAmount,
    							returnauthorisation:	currentRecord.id,
    							location:				locationID
    						}
    					});
    				}
    		}

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
