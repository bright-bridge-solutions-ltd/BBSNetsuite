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

function libEmailFiles(presentationId, templateId)
{
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
			   new nlobjSearchColumn("filetype","file",null)
			]
			);
	
	if(customrecord_bbs_presentation_recordSearch != null && customrecord_bbs_presentation_recordSearch.length > 0)
		{
		
		}
}