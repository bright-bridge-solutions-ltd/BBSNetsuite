/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Oct 2019     cedricgriffiths
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
function uncommitBL(type, form, request)
{
	if(type == 'edit')
		{
			form.addButton('custpage_uncommit_button', 'UnCommit All Lines', 'uncommitButton');
		}
	
}
