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


function suitelet(type)
{
	try 
		{
			var context = nlapiGetContext();
			var recordId = request.getParameter('partnerid');

			sleep(2000);
			
			nlapiScheduleScript('customscript_bbs_statement_emailer', null, {custscript_bbs_partner_id: recordId});
			
			//var configRecord = nlapiLoadConfiguration('companyinformation');
			//var accountId = configRecord.getFieldValue('companyid');
			
			//var urlPrefix = 'https://' + accountId.replace('_','-') + '.app.netsuite.com/';
	    	
			response.sendRedirect('RECORD','customer', recordId, false, null);
		}
	catch (e) 
		{
			if (e instanceof nlobjError) 
				{
		        	nlapiLogExecution('DEBUG', 'Suitelet', e.getCode() + '\n' + e.getDetails());
				}
		    else 
		    	{
		        	nlapiLogExecution('DEBUG', 'Suitelet - unexpected', e.toString());
		    	}
		}
}

function sleep(milliseconds) 
{
	  const date = Date.now();
	  
	  var currentDate = null;

	  do{ currentDate = Date.now();
		  } while (currentDate - date < milliseconds);
}

/*
function suitelet(request, response)
{
	if (request.getMethod() == 'GET') 
		{
			//Get parameters
			//
			var recordId = Number(request.getParameter('partnerid'));
		
			var scheduleParams = {custscript_bbs_partner_id: recordId};
			nlapiScheduleScript('customscript_bbs_statement_emailer', null, scheduleParams);
			
			var form = nlapiCreateForm('Email Statement');
			form.setTitle('Email Statement');
			
			var stageParamField = form.addField('custpage_param_id', 'integer', 'Id');
			stageParamField.setDisplayType('hidden');
			stageParamField.setDefaultValue(recordId);
			
			//Add a message field 
			//
			var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
			messageField.setDisplaySize(120, 4);
			messageField.setDisplayType('readonly');
			messageField.setDefaultValue('A job has been submitted to email the Statement to the Partner.\nPress "Ok" to continue');
		
			form.addSubmitButton('Ok');
			
			//Write the response
			//
			response.writePage(form);
		}
	else
		{
			var partnerId = request.getParameter('custpage_param_id');	
		
			response.sendRedirect('RECORD','customer', partnerId, false, null);
		
		}
}
*/