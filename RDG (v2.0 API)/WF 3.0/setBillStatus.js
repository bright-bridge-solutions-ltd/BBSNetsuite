/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define([],
function() {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// set the bill status to approved
    	currentRecord.setValue({
    		fieldId: 'status',
    		value: 'Approved'
    	})

    }

    return {
        onAction : onAction
    };
    
});
