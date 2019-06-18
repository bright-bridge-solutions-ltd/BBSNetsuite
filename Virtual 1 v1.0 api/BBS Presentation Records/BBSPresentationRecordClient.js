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
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function presentationRecordPageInit(type)
{
   
}

function sendEmail()
{
	var recordId = nlapiGetRecordId();
	
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_pr_emailer_su', 'customdeploy_bbs_pr_emailer_su');

	url = url + '&prid=' + recordId;
	
	// Open a new window
	//
	window.open(url, '_self', '', 'menubar=no, titlebar=no, toolbar=no, scrollbars=no, resizable=yes');

}
