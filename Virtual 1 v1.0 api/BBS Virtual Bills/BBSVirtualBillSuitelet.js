/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Feb 2020     cedricgriffiths
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
			var recId = request.getParameter('record_id');

			sleep(2000);
			
			nlapiScheduleScript('customscript_bbs_vbill_recon', null, {custscript_bbs_vbill_id: recId});
			
			var configRecord = nlapiLoadConfiguration('companyinformation');
			var accountId = configRecord.getFieldValue('companyid');
			
			var urlPrefix = 'https://' + accountId.replace('_','-') + '.app.netsuite.com/';
	    	
			
			response.write(urlPrefix + "app/common/custom/custrecordentry.nl?rectype=118&id=" + recId + "&whence="); //', 'Virtual Bill', 'height=1056, width=816, resizable=yes, scrollbars=yes, toolbar=no, menubar=no'");
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