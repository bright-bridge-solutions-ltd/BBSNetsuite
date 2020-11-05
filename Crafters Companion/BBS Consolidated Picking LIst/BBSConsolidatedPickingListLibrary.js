/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search','N/record'],

function(search, record) 
{
   
	function libCreateSession()
		{
			var uniqueId = Number(Date.now()).toFixed(0).toString();
			
			var paramsRecord = record.create({
											type:		'customrecord_bbs_internal_params',
											isDynamic:	true
											});
					
			paramsRecord.setValue({
									fieldId:	'custrecord_bbs_params_id', 
									value:		uniqueId
									});
			
			var sessionId = paramsRecord.save();
			
			return sessionId.toString();
		}
	
	function libGetSessionData(sessionId)
		{
			var sessionRecord = record.load({
											type:		'customrecord_bbs_internal_params', 
											id:			sessionId,
											isDynamic:	true
											});
			var data = null;
			
			if (sessionRecord)
				{
					data = sessionRecord.getValue({
												fieldId:	'custrecord_bbs_params_data'
												});
					
				}
			
			return data;
		}
	
	function libSetSessionData(sessionId, sessionData)
		{
			var sessionRecord = record.load({
											type:		'customrecord_bbs_internal_params', 
											id:			sessionId,
											isDynamic:	true
											});
			
			if (sessionRecord)
				{
					sessionRecord.setValue({
											fieldId:	'custrecord_bbs_params_data', 
											value:		sessionData
											});
					
					sessionRecord.save();
				}
		}
		
	function libClearSessionData(sessionId)
		{
			record.delete({
							type:	'customrecord_bbs_internal_params', 
							id:		sessionId
							});
		}
	
		return	{
				libCreateSession:		libCreateSession,
				libGetSessionData:		libGetSessionData,
				libSetSessionData:		libSetSessionData,
				libClearSessionData:	libClearSessionData
				}
	});
