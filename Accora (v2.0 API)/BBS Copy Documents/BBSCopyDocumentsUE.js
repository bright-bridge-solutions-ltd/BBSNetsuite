/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url'],
/**
 * @param {serverWidget} serverWidget
 */
function(url) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	// check if the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    			// get the ID of the current record
    			var recordID = scriptContext.newRecord.id;
    			
    			// get the URL of the Copy Documents Suitelet
    			var suiteletURL = url.resolveScript({
    				scriptId: 'customscript_bbs_copy_documents_sl',
    				deploymentId: 'customdeploy_bbs_copy_documents_sl'
    			});
    			
    			// append the ID of the current record to the Suitelet's URL
    			suiteletURL += '&customerid=' + scriptContext.newRecord.id;
    			
    			// add a button to the form and open the Suitelet in a new tab/window when the button is clicked
    			scriptContext.form.addButton({
    				id: 'custpage_copydocuments',
    				label: 'ACC Copy Documents',
    				functionName: "window.open('" + suiteletURL + "')"
    			});
    			
    		}   	
    }

    return {
        beforeLoad: beforeLoad
    };
    
});