/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jun 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function partnerBL(type, form, request)
{
	if(type == 'view')
		{
			form.addButton('custpage_statement_button', 'Email Statement To Partner', 'sendStatement()');
			form.setScript('customscript_bbs_partner_client');
		}
}