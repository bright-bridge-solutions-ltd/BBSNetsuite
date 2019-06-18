/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jun 2019     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	if (request.getMethod() == 'GET') 
		{
			//Get parameters
			//
			var recordId = Number(request.getParameter('prid'));
		
			var scheduleParams = {custscript_pr_id_to_email: recordId};
			nlapiScheduleScript('customscript_bbs_pr_emailer', null, scheduleParams);
			
			var form = nlapiCreateForm('Email Presentation Record');
			form.setTitle('Email Presentation Record');
			
			var stageParamField = form.addField('custpage_param_id', 'integer', 'Id');
			stageParamField.setDisplayType('hidden');
			stageParamField.setDefaultValue(recordId);
			
			//Add a message field 
			//
			var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
			messageField.setDisplaySize(120, 4);
			messageField.setDisplayType('readonly');
			messageField.setDefaultValue('A job has been submitted to email the Presentation Record to the Partner.\nPress "Ok" to continue');
		
			form.addSubmitButton('Ok');
			
			//Write the response
			//
			response.writePage(form);
		}
	else
		{
			var prId = request.getParameter('custpage_param_id');	
		
			response.sendRedirect('RECORD','customrecord_bbs_presentation_record', prId, false, null);
		
		}
}
