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
				
				// open a new quote in a new tab/window
				window.open(newQuoteURL);
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
