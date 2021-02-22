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
    	
    	// get the shipping method text value
    	return scriptContext.newRecord.getText({
    		fieldId: 'shipmethod'
    	}).toUpperCase();

    }

    return {
        onAction : onAction
    };
    
});
