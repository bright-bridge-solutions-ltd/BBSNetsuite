/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jan 2021     sambatten
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
function userEventBeforeLoad(type, form, request)
	{
		if (type == 'view') // else the record is being viewed
			{
				// set client script to run on the form
				form.setScript('customscript_bbs_hide_print_button_cl');
			}
	}