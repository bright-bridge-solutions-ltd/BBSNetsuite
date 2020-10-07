/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/render', 'N/email'],
function(runtime, render, email) {
   
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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// declare and initialize variables
    			var assigneesArray = new Array();
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get count of assignees
    			var assignees = currentRecord.getLineCount({
    				sublistId: 'assignee'
    			});
    			
    			// do we have any assignees
    			if (assignees > 0)
    				{
		    			// loop through assignees
		    			for (var i = 0; i < assignees; i++)
		    				{
		    					// push the employee ID to the assigneesArray
		    					assigneesArray.push(
		    											currentRecord.getSublistValue({
		    												sublistId: 'assignee',
		    												fieldId: 'resource',
		    												line: i
		    											})
		    										);
		    				}
		    			
		    			// call function to send an email to the assignees
		    			sendEmail(currentRecord.id, assigneesArray);
    				}   			
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
    function afterSubmit(scriptContext) {

    }
    
    // ======================================
    // FUNCTION TO SEND AN EMAIL TO ASSIGNEES
    // ======================================
    
    function sendEmail(recordID, emailRecipients) {
    	
    	// retrieve script parameters
		var currentScript = runtime.getCurrentScript();
		
		var emailSender = currentScript.getParameter({
			name: 'custscript_bbs_project_task_ue_sender'
		});
		
		var emailTemplate = currentScript.getParameter({
			name: 'custscript_bbs_project_task_ue_template'
		});
		
		try
			{
				// create an email merge result
				var mergeResult = render.mergeEmail({
				    templateId: emailTemplate,
				    transactionId: recordID
				});
				
				// send the email
				email.send({
					author: 	emailSender,
					recipients: emailRecipients,
					subject: 	mergeResult.subject,
					body: 		mergeResult.body,
					relatedRecords: {
						transactionId: recordID
					}
				});   
			}
		catch(e)
			{
				log.error({
					title: 'Error Sending Email',
					details: 'Project Task ID: ' + recordID + '<br>Error: ' + e
				});
			}
    	
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});
