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
    			
    			// get the payment method
    			var paymentMethod = currentRecord.getValue({
    				fieldId: 'custbody_bbs_payment_method'
    			});
    			
    			// if paymentMethod = 8 (Stripe)
    			if (paymentMethod == 8)
    				{
    					// get the ID of the current record and the customer
    					var recordID = currentRecord.id;
    					
    					var customerID = currentRecord.getValue({
    						fieldId: 'entity'
    					});
    				
    					try
    						{
    							// create a customer deposit record
    							var customerDeposit = record.create({
    								type: record.Type.CUSTOMER_DEPOSIT
    							});
    							
    							customerDeposit.setValue({
    								fieldId: 'customer',
    								value: currentRecord.getValue({
    		    						fieldId: 'entity'
    		    					})
    							});
    							
    							customerDeposit.setValue({
    								fieldId: 'salesorder',
    								value: currentRecord.id
    							});
    							
    							customerDeposit.setValue({
    								fieldId: 'paymentmethod',
    								value: 8 // 8 = Stripe
    							});
    							
    							var depositID = customerDeposit.save({
    								ignoreMandatoryFields: true
    							});
    							
    							log.audit({
    								title: 'Customer Deposit Created',
    								details: 'Deposit ID: ' + depositID + '<br>Sales Order ID: ' + currentRecord.id
    							});
    						}
    					catch(e)
    						{
    							log.error({
    								title: 'Error Creating Customer Deposit',
    								details: 'Sales Order ID: ' + currentRecord.id + '<br>Error: ' + e
    							});
    						}
    				}
    		}
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
