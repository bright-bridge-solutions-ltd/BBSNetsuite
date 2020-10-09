/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Oct 2020     cedricgriffiths
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
			var form = nlapiCreateForm('Test', false);
			form.setScript('customscript_bbs_rich_text');
			
			var custIdField = form.addField('custpage_text_box', 'longtext', 'Text Box');
			var custIdField2 = form.addField('custpage_text_box2', 'richtext', 'Text Box');
			
			response.writePage(form);
		}
}
