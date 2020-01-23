/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/ui/dialog'],
function(url, dialog) {
    
    function pageInit(scriptContext) {
    	
    }
	
	function createQuote(company) {
		
		// check if the company parameter returns a value
		if (company)
			{
				// get the URL to create a new quote record
				var newQuoteURL = url.resolveTaskLink({
					id: 'EDIT_TRAN_ESTIMATE',
					params: {
						entity: company
					}
				});
				
				// get the URL of the 'SCPQ-STE-Start-Product' Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_scpq_ste_start_product',
					deploymentId: 'customdeploy_scpq_start_product',
					params: {
						rectype: 'estimate',
						entity: company,
						isNew: 'T'
					}
				});
				
				// open a new quote in a new tab/window
				window.open(newQuoteURL);
				
				// open the 'SCPQ-STE-Start-Product' Suitelet in a new tab/window
				window.open(suiteletURL);
			}
		else // company parameter is empty
			{
				// show an alert to the user
				dialog.alert({
					title: '⚠️ Error',
					message: 'A new quote cannot be created as this event record is not associated to a customer'
				});
			}
	}

    return {
    	pageInit: pageInit,
    	createQuote: createQuote
    };
    
});
