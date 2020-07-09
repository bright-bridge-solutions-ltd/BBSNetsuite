/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url'],
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
		    	// get the internal ID of the current record
    			var recordID = scriptContext.newRecord.id;
		    	
				// define URl of Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_supplier_rma_sl',
					deploymentId: 'customdeploy_bbs_supplier_rma_sl',
				});
				
				// add recordID to Suitelet URL
		    	suiteletURL += '&record=' + recordID;
		    	
		    	// add button to the form
				scriptContext.form.addButton ({
					id: 'custpage_print_return',
					label: 'Print Return Authorisation',
					functionName: "window.open('" + suiteletURL + "');" // call Suitelet when button is clicked
				});
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {	
 
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
