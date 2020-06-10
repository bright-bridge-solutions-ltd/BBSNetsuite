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
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the value of the subsidiary field
    	var subsidiary = currentRecord.getValue({
    		fieldId: 'subsidiary'
    	});
    	
    	// check if the subsidiary is 10 (Onfido India)
    	if (subsidiary == 10)
    		{
		    	// get the ID of the current record
		    	var recordID = currentRecord.id;
		    	
		    	try
		    		{
		    			// reload the invoice record
		    			var invoiceRecord = record.load({
		    				type: record.Type.INVOICE,
		    				id: recordID,
		    				isDynamic: true
		    			});
		    			
		    			// run the tax calculation macro
		    			invoiceRecord.executeMacro({
		    				id: 'calculateTax'
		    			});
		    			
		    			// save the invoice record
		    			invoiceRecord.save();
		    			
		    			log.audit({
		    				title: 'Invoice Updated',
		    				details: recordID
		    			});
		    		}
		    	catch(e)
		    		{
		    			log.error({
		    				title: 'Error Updating Invoice',
		    				details: 'Invoice ID: ' + recordID + '<br>Error: ' + e
		    			});
		    		}
    		}
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
