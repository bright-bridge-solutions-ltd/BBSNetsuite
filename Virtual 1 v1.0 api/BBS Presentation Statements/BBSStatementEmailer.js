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
function statementEmailer(type) 
{
	var context = nlapiGetContext();
	var partnerId = context.getSetting('SCRIPT', 'custscript_bbs_partner_id');
	
	libGenerateStatement(partnerId);
}
