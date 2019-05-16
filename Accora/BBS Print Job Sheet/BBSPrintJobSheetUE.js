/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Jul 2017     cedricgriffiths
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
function jobsheetBeforeLoad(type, form, request)
{
	//Add the export button to the form
	//
	if (type == 'edit')
		{
			form.addButton('custpage_butt_jobsheet', 'Print Job Sheet', 'printJobSheet');
		}

	if (type == 'view') 
		{
			// Add the global client script to the form manually as this is where
			// the 'on-click' function for the button is held
			form.setScript('customscript_bbs_gbl_jobsheet');

			form.addButton('custpage_butt_jobsheet', 'Print Job Sheet', 'glbprintJobSheet');
		}
}
