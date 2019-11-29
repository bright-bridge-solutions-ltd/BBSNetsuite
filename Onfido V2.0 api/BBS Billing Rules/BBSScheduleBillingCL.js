/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/url', 'N/https'],
function(message, url, https) {
    
    function cancelButton()
    	{
	    	// close the window
    		open(location, '_self').close();    
    	}
    
    function createQMPInvoices()
    	{
	    	// ==============================================================
			// CALL BACKEND SUITELET TO SCHEDULE 'Create QMP Invoices' SCRIPT
			// ==============================================================
		
			// define URL of Suitelet
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_bbs_create_qmp_invoices_sl',
				deploymentId: 'customdeploy_bbs_create_qmp_invoices_sl',
			});
		
			// call a backend Suitelet to update the PO with the rejection reason
			var response = 	https.get({
				url: suiteletURL
			});
			
			response = response.body; // get the response body
			
			// check if response is true
			if (response == 'true')
				{
					// display a confirmation message
					message.create({
						type: message.Type.CONFIRMATION,
				        title: 'Create QMP Invoices Scheduled',
				        message: 'The process for the creation of QMP invoices has been scheduled successfully.'
					}).show();
				}
			// check if response is false
			else if (response == 'false')
				{
					// display an error message
					message.create({
						type: message.Type.ERROR,
				        title: 'Error',
				        message: 'The billing process for QMP has not yet completed so the creation of QMP invoices cannot start.<br><br>Please wait until you have received an email informing you that the billing process has completed and try again.'
					}).show(5000); // show for 5 seconds	
				}   		
    	}
	
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    return {
    	pageInit: pageInit,
    	cancelButton: cancelButton,
    	createQMPInvoices: createQMPInvoices
    };
    
});
