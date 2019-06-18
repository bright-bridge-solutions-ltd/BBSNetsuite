/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Aug 2017     cedricgriffiths
 *
 */
function libCreateSession()
{
	var uniqueId = Number(Date.now()).toFixed(0).toString();
	
	var paramsRecord = nlapiCreateRecord('customrecord_bbs_internal_params');
	paramsRecord.setFieldValue('custrecord_bbs_params_id', uniqueId);
	var sessionId = nlapiSubmitRecord(paramsRecord, false, true);
	
	return sessionId;
}

function libGetSessionData(sessionId)
{
	var sessionRecord = nlapiLoadRecord('customrecord_bbs_internal_params', sessionId);
	var data = null;
	
	if (sessionRecord)
		{
			data = sessionRecord.getFieldValue('custrecord_bbs_params_data');
		}
	
	return data;
}

function libSetSessionData(sessionId, sessionData)
{
	var sessionRecord = nlapiLoadRecord('customrecord_bbs_internal_params', sessionId);
	
	if (sessionRecord)
		{
			sessionRecord.setFieldValue('custrecord_bbs_params_data', sessionData);
			
			nlapiSubmitRecord(sessionRecord, false, true);
		}
}

function libClearSessionData(sessionId)
{
	nlapiDeleteRecord('customrecord_bbs_internal_params', sessionId);
}

function libEmailFiles(presentationId)
{
	//Get the email template id from the general preferences
	//
	var prEmailTemplateId = nlapiGetContext().getPreference('custscript_bbs_pr_email_template');
	var currentUser = nlapiGetContext().getUser();
	var executionContext = nlapiGetContext().getExecutionContext();
	
	//Get the return email address from company setup page
	//
	var companyConfig = null;
	var returnEmail = null;
	
	companyConfig = nlapiLoadConfiguration('companyinformation');
	returnEmail = companyConfig.getFieldValue('email');
	returnEmail = (returnEmail == '' ? null : returnEmail);


	//Have we got an email template set up?
	//
	if(prEmailTemplateId != null && prEmailTemplateId != '')
		{
			//Find files attached to the PR record
			//
			var customrecord_bbs_presentation_recordSearch = nlapiSearchRecord("customrecord_bbs_presentation_record",null,
					[
					   ["file.internalid","noneof","@NONE@"],
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
					   new nlobjSearchColumn("email","CUSTRECORD_BBS_PR_PARTNER",null)
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
							var attachedFile = nlapiLoadFile(fileId);
							attachments.push(attachedFile);
							
							emailTo = customrecord_bbs_presentation_recordSearch[int].getValue("email","CUSTRECORD_BBS_PR_PARTNER");
						}
					
					if(emailTo != null)
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
											nlapiSendEmail(currentUser, emailTo, emailSubject, emailBody, null, null, null, attachments, true, false, returnEmail);
											
											var prRecord = nlapiLoadRecord('customrecord_bbs_presentation_record', presentationId);
											
											//Update the pr status
											//
											prRecord.setFieldValue('custrecord_bbs_pr_internal_status', '4'); //Documents emailed
										
											nlapiSubmitRecord(prRecord, false, true); //2GU's
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