/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url'],
/**
 * @param {record} record
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
    function contractBL(scriptContext) {
    	
    	// get the currentRecord object
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the value of the 'status' field from the record
    	var status = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_contract_status'
    	});
    	
    	// if statement to check that the status variable returns 1 (Approved)
    	if (status == 1)
    		{
	    		// get the internal ID of the current record
    			var recordID = scriptContext.newRecord.id;
    		
    			// define URl of Suitelet
	    		var suiteletURL = url.resolveScript({
	    			scriptId: 'customscript_bbs_end_contract_sl',
	    			deploymentId: 'customdeploy_bbs_end_contract_sl',
	    		});
	    		
	    		// add parameters to Suitelet URL
	        	suiteletURL += '&record=' + recordID;
    		
    			// add button to the form
	    		scriptContext.form.addButton({
	    			id: 'custpage_end_contract_early',
	    			label: 'End Contract Early',
	    			functionName: "window.open('" + suiteletURL + "','_self');" // call Suitelet when button is clicked. This will open in the current window
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
    function contractBS(scriptContext) {
 
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
    function contractAS(scriptContext) {

    }

    return {
        beforeLoad: contractBL,
        beforeSubmit: contractBS,
        afterSubmit: contractAS
    };
    
});
