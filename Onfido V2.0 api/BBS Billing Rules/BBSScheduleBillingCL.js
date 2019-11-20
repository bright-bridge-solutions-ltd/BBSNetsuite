/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/ui/dialog'],
function(currentRecord, url, dialog) {
    
    function cancelButton()
    	{
	    	// close the window
    		open(location, '_self').close();    
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
    	cancelButton: cancelButton
    };
    
});
