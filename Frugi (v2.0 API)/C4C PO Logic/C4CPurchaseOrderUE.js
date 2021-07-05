/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./C4CPurchaseOrderLibrary'],

function(poLibrary) {
   
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
    			scriptContext.form.clientScriptFileId = 4195;
    			
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
    	
    	// check the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the old and new approval statuses
    			var oldApprovalStatus = scriptContext.oldRecord.getValue({
    				fieldId: 'approvalstatus'
    			});
    			
    			var newApprovalStatus = scriptContext.newRecord.getValue({
    				fieldId: 'approvalstatus'
    			});
    			
    			// has the approval status changed from 1 (Pending Approval) to 2 (Approved)
    			if (oldApprovalStatus == 1 && newApprovalStatus == 2)
    				{
    					// call library script function to generate a CSV file of the purchase order. Pass the ID of the current record
		    			var csvFile = poLibrary.generateCSV(scriptContext.newRecord.id);
		    			
		    			// if we have been able to generate the CSV file
		    			if (csvFile)
		    				{
		    					// call library script function to generate a PDF file of the purchase order. Pass the ID of the current record
			    				var pdfFile = poLibrary.generatePDF(scriptContext.newRecord.id);
			    				
			    				// if we have been able to generate the PDF file
			    				if (pdfFile)
			    					{
			    						// declare and initialize variables
			    						var emailAttachments = new Array();
			    					
				    					// push the csvFile/pdfFile objects to the emailAttachments array
			    						emailAttachments.push(csvFile);
			    						emailAttachments.push(pdfFile);
		    						
			    						// get the supplier ID from the current record
										var supplierID = scriptContext.newRecord.getValue({
											fieldId: 'entity'
										});
				    				
				    					// call library script function to email the file to the supplier. Pass the current record ID and the supplierID variables and emailAttachments array
										poLibrary.sendEmail(scriptContext.newRecord.id, supplierID, emailAttachments);
			    					}
		    				}
    				}
    		}

    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
    
});
