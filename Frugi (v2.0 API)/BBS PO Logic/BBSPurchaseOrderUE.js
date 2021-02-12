/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSPurchaseOrderLibrary', 'N/email'],

function(poLibrary, email) {
   
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
    	
    	// check the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    			// set client script to run on the form
    			scriptContext.form.clientScriptFileId = 3429;
    			
    			// add a button to the form and call a client script function when the button is clicked
    			scriptContext.form.addButton({
    				id: 'custpage_generate_csv',
    				label: 'Generate CSV File',
    				functionName: 'generateCSV(' + scriptContext.newRecord.id + ')'
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
    		
    			// call library script function to generate the CSV file. Pass the ID of the current record
    			var csvFile = poLibrary.generateCSV(currentRecord.id);
    			
    			// if we have been able to generate the CSV file
    			if (csvFile)
    				{
	    				// get the supplier ID from the current record
						var supplierID = currentRecord.getValue({
							fieldId: 'entity'
						});
    				
    					// call library script function to email the file to the supplier. Pass the ID of the current record, supplierID and csvFile
						poLibrary.sendEmail(currentRecord.id, supplierID, csvFile);
    				}
    		}

    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
    
});
