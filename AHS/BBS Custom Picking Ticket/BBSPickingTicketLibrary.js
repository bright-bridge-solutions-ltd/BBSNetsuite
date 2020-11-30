/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Aug 2017     cedricgriffiths
 *
 */
function libExportPickingTicket()
{
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_pick_ticket_suitelet', 'customdeploy_bbs_pick_ticket_suitelet');
	
	var invId = nlapiGetRecordId();

	// Add the invoice id to the url
	//
	url += '&salesorder=' + invId;

	// Open the suitelet in the current window
	//
	window.open(url, '_blank', 'Create Picking Ticket', 'toolbar=no, scrollbars=no, resizable=no');
}
