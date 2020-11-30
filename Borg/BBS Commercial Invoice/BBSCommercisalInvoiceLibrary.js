/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Aug 2017     cedricgriffiths
 *
 */
function libExportInvoice()
{
	var url = nlapiResolveURL('SUITELET', 'customscript_bbs_commercial_invoice', 'customdeploy_bbs_commercial_invoice');
	
	var invId = nlapiGetRecordId();

	// Add the invoice id to the url
	//
	url += '&fulfillment=' + invId;

	// Open the suitelet in the current window
	//
	window.open(url, '_blank', 'Create Commercial Invoice', 'toolbar=no, scrollbars=no, resizable=no');
}
