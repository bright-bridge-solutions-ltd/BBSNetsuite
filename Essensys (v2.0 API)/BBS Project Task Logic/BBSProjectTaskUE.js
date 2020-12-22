/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/email'],
function(runtime, email) {
   
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
    	else if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// declare and initialize variables
				var assigneesArray = new Array();
				
				// get the old and new record images
				var oldRecord = scriptContext.oldRecord;
				var newRecord = scriptContext.newRecord;
				
				// get count of assignees from the old/new record images
				var oldAssigneeCount = oldRecord.getLineCount({
					sublistId: 'assignee'
				});
				
				var newAssigneeCount = newRecord.getLineCount({
					sublistId: 'assignee'
				});
				
				// loop through new assignees
				for (var i = 0; i < newAssigneeCount; i++)
					{
						// declare and initialize variables
						var isNewResource = true;
					
						// get the ID of the resource
						var newResource = newRecord.getSublistValue({
							sublistId: 'assignee',
							fieldId: 'resource',
							line: i
						});
						
						// loop through old assignees
						for (var x = 0; x < oldAssigneeCount; x++)
							{
								// get the ID of the resource
								var oldResource = oldRecord.getSublistValue({
									sublistId: 'assignee',
									fieldId: 'resource',
									line: x
								});
								
								if (newResource == oldResource)
									{
										// set isNewResource variable to false
										isNewResource = false;
										
										// break the loop
										break;
									}
							}
						
						if (isNewResource == true)
							{
								// push the ID of the resource to the assigneesArray
								assigneesArray.push(newResource);
							}
					}
				
				// do we have any assignees?
				if (assigneesArray.length > 0)
					{					
						// call function to send an email to the assignees
		    			sendEmail(newRecord.id, assigneesArray);
					}
				
    		}

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
		
		try
			{
				// declare and email subject and body
				var emailSubject = 'Project Task Assignee Notification';
				
				var emailBody = 'Hello<br/>';
				emailBody += '<br/>';
				emailBody += 'This alert is to notify you that a new project task has been assigned to you.<br />';
				emailBody += '<br/>';
				emailBody += 'Please <strong><a href="https://5423837-sb1.app.netsuite.com/app/accounting/project/projecttask.nl?id=' + recordID + '">click here</a></strong>&nbsp;to view the details of the task.<br />';
				emailBody += '<br/>';
				emailBody += '<span style="font-size:8px;">this alert has been sent by the script&nbsp;BBS Project Task UE</span>';
				
				// send the email
				email.send({
					author: 	emailSender,
					recipients: emailRecipients,
					subject: 	emailSubject,
					body: 		emailBody
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
        afterSubmit: afterSubmit
    };
    
});
