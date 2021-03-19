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
    			
    			// retrieve values from the current record
    			var customerID = currentRecord.getValue({
    				fieldId: 'entity'
    			});
    			
    			var tranID = currentRecord.getValue({
    				fieldId: 'tranid'
    			});
    			
    			var tranDate = currentRecord.getValue({
    				fieldId: 'trandate'
    			});
    			
    			// call function to create a customer record
    			createCustomerRefund(customerID, tranID, tranDate);	
    		}

    }
    
    // ====================================
    // FUNCTION TO CREATE A CUSTOMER REFUND
    // ====================================
    
    function createCustomerRefund(customerID, tranID, tranDate) {
    	
    	try
    		{
    			// create a customer refund
    			var customerRefund = record.create({
    				type: record.Type.CUSTOMER_REFUND,
    				isDynamic: true
    			});
    			
    			// set fields on the customer refund
    			customerRefund.setValue({
    				fieldId: 'customer',
    				value: customerID
    			});
    			
    			customerRefund.setValue({
    				fieldId: 'trandate',
    				value: tranDate
    			});
    			
    			// get count of lines in the 'Apply' sublist
    			var lineCount = customerRefund.getLineCount({
    				sublistId: 'apply'
    			});
    			
    			// loop through 'Apply' sublist
    			for (var i = 0; i < lineCount; i++)
    				{
    					// select the line
    					customerRefund.selectLine({
    						sublistId: 'apply',
    						line: i
    					});
    					
    					// get the Ref No for the line
    					var refNum = customerRefund.getCurrentSublistValue({
    						sublistId: 'apply',
    						fieldId: 'refnum'
    					});
    					
    					if (refNum == tranID)
    						{
    							// tick the 'Apply' checkbox for this line
    							customerRefund.setCurrentSublistValue({
    								sublistId: 'apply',
    								fieldId: 'apply',
    								value: true
    							});
    							
    							// break the loop
    							break;
    						}
    				}
    			
    			// save the customer refund
    			var customerRefundID = customerRefund.save({
    				ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Customer Refund Created Successfully',
    				details: customerRefundID
    			});
    		}
    	catch(e)
    		{
    			log.debug({
    				title: 'Error Creating Customer Refund for Credit Memo ' + tranID,
    				details: e
    			});
    		}
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
