/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/record', 'N/render', 'N/runtime'],
/**
 * @param {file} file
 * @param {record} record
 * @param {render} render
 * @param {runtime} runtime
 */
function(file, record, render, runtime) 
{
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function invoiceAS(scriptContext) 
	    {
    		var currentScript = runtime.getCurrentScript();
    		var attachmentsFolder = currentScript.getParameter({name: 'custscript_bbs_attachments_folder'});
    		var today = new Date();
    		
    		if(attachmentsFolder != null && attachmentsFolder != '')
    			{
    				if(scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    					{
    						var thisRecord = scriptContext.newRecord;
    						var thisRecordId = thisRecord.id;
    						var thisContract = thisRecord.getText({fieldId: 'custbody_bbs_contract_record'});
    						var thisContractId = thisRecord.getValue({fieldId: 'custbody_bbs_contract_record'});
    						var thisCustomer = thisRecord.getText({fieldId: 'entity'});
    						var thisInvoiceNumber = thisRecord.getText({fieldId: 'tranid'});
    						
    						//If we have the contract on the invoice, then go ahead
    						//
    						if(thisContract != null && thisContract != '')
    							{
		    						var fileId = null;
		    						
		    						//Generate the pdf file
		    						//
		    						var transactionFile = render.transaction({
					    						    							entityId: thisRecordId,
					    						    							printMode: render.PrintMode.PDF,
					    						    							inCustLocale: false
		    						    									});
		    						
		    						//Set the attachments folder
		    						//
		    						transactionFile.folder = attachmentsFolder;
		    						
		    						//Set the file name
		    						//
		    						transactionFile.name = 'Invoice_' + thisContract + '_' + thisInvoiceNumber + '.pdf'
		    						
		    						//Make available without login
		    						//
		    						transactionFile.isOnline = true;
		    						
		    						//Try to save the file to the filing cabinet
		    						//
		    						try
		    							{
		    								fileId = transactionFile.save();
		    							}
		    						catch(err)
		    							{
		    								log.error({
		    											title: 'Error Saving PDF To File Cabinet ' + attachmentsFolder,
		    											details: error
		    											});
		    								
		    								fileId = null;
		    							}
		    						
		    						//If we have saved the file ok, then we need to attach the pdf
		    						//
		    						if(fileId != null)
		    							{
		    								record.attach({
		    												record: {type: 'file', id: fileId},
		    												to: {type: 'customrecord_bbs_contract', id: thisContractId}
		    												});
		    							}
    							}
    					}
    			}
	    }

    return {afterSubmit: invoiceAS};
    
});
