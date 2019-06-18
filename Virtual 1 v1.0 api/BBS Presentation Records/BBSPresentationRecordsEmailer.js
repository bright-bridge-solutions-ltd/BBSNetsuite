/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jun 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function prEmailer(type) 
{
	var context = nlapiGetContext();
	var presentationId = context.getSetting('SCRIPT', 'custscript_pr_id_to_email');
	
	libEmailFiles(presentationId);
}
