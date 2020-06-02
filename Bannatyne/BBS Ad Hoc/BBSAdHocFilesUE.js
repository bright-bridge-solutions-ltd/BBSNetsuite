/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 May 2020     sambatten
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
		// check the record is being created
		if (type == 'create')
			{
				// set client script to run on the form
				form.setScript('customscript_bbs_ad_hoc_files_cl_create');
			}
		else if (type == 'view' || type == 'edit') // else the record is being viewed or edited
			{
				// set client script to run on the form
				form.setScript('customscript_bbs_ad_hoc_files_cl_edit');
			}
		
		// check the record is being viewed
		if (type == 'view')
			{
				// get the 'Files' sublist
				var fileSublist = form.getSubList('mediaitem');
			
				// define URl of Suitelet
				var suiteletURL = nlapiResolveURL('SUITELET', 'customscript_bbs_ad_hoc_files_sl', 'customdeploy_bbs_ad_hoc_files_sl', false);
				suiteletURL += '&record=' + nlapiGetRecordId(); // pass internal ID of the current record
				
				// add a button and call Suitelet on click of button which will open in a new window
				fileSublist.addButton('custpage_adddocuments', 'Add Documents', "window.open('" + suiteletURL + "','_self');");
			}
	}