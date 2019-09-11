/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Sep 2019     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function sendEmailWorkflowAction() 
{
	//Get the record the workflow is currently processing
	//
	var currentRecord = nlapiGetNewRecord();
	var presentationId = currentRecord.getId();
	
	//Get the id of the passed in email template
	//
	var context = nlapiGetContext();
	var prEmailTemplateId = context.getSetting('SCRIPT', 'custscript_bbs_email_template_id');
	
	//Get the id of the current user
	//
	var currentUser = context.getUser();
	
	//Set up the link to the pr record for the email
	//
	var associatedRecords = {};
	associatedRecords['recordtype'] = 'customrecord_bbs_presentation_record';
	associatedRecords['record'] = presentationId;
	associatedRecords['entity'] = currentRecord.getFieldValue('custrecord_bbs_pr_partner');
		
		
	//Get the return email address from company setup page
	//
	var companyConfig = null;
	var returnEmail = null;
	
	try
		{
			companyConfig = nlapiLoadConfiguration('companyinformation');
			returnEmail = companyConfig.getFieldValue('email');
			returnEmail = (returnEmail == '' ? null : returnEmail);
		}
	catch(err)
		{
			returnEmail = null;
		}
	
	//Have we got an email template set up?
	//
	if(prEmailTemplateId != null && prEmailTemplateId != '')
		{
			//Find files attached to the PR record
			//
			var customrecord_bbs_presentation_recordSearch = nlapiSearchRecord("customrecord_bbs_presentation_record",null,
					[
					   ["file.filetype","anyof","@NONE@","PDF"],
					   "AND",
					   ["internalid","anyof",presentationId]
					], 
					[
					   new nlobjSearchColumn("name").setSort(false), 
					   new nlobjSearchColumn("custrecord_bbs_pr_type"), 
					   new nlobjSearchColumn("description","file",null), 
					   new nlobjSearchColumn("folder","file",null), 
					   new nlobjSearchColumn("internalid","file",null), 
					   new nlobjSearchColumn("name","file",null), 
					   new nlobjSearchColumn("filetype","file",null),
					   new nlobjSearchColumn("custentity_bbs_bill_add_list","CUSTRECORD_BBS_PR_PARTNER",null)
					]
					);
			
			//Have we got any results?
			//
			if(customrecord_bbs_presentation_recordSearch != null && customrecord_bbs_presentation_recordSearch.length > 0)
				{
					var attachments = [];
					var emailTo = null;
					
					//Loop through the results
					//
					for (var int = 0; int < customrecord_bbs_presentation_recordSearch.length; int++) 
						{
							var fileId = customrecord_bbs_presentation_recordSearch[int].getValue("internalid","file");
							
							if(fileId != null && fileId != '')
								{
									var attachedFile = nlapiLoadFile(fileId);
									attachments.push(attachedFile);
								}
							
							emailTo = customrecord_bbs_presentation_recordSearch[int].getValue("custentity_bbs_bill_add_list","CUSTRECORD_BBS_PR_PARTNER");
						}
					
					if(emailTo != null && emailTo != '')
						{
							var emailMerger = nlapiCreateEmailMerger(prEmailTemplateId);
							emailMerger.setCustomRecord('customrecord_bbs_presentation_record', presentationId);
							var mergeResult = emailMerger.merge();
							
							if(mergeResult != null)
								{
									var emailSubject = mergeResult.getSubject();
									var emailBody = mergeResult.getBody();
								
									try
										{
											nlapiSendEmail(currentUser, emailTo, emailSubject, emailBody, null, null, associatedRecords, attachments, true, false, returnEmail);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Failed to email PR id = ' + presentationId, err.message);
										}
								}
						}
				}
		}
}
