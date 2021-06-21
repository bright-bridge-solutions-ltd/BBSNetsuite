/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search'],
function(search) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// get the subsidiary ID from the current record
    	var subsidiaryID = scriptContext.newRecord.getValue({
    		fieldId: 'subsidiary'
    	});
    	
    	// call function to get the approver from the subsidiary record
    	var nextApprover = getSubsidiaryApprover(subsidiaryID);
    	
    	// set the BBS next approver field
    	scriptContext.newRecord.setValue({
    		fieldId: 'custbody_bbs_next_approver',
    		value: nextApprover
    	});

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getSubsidiaryApprover(subsidiaryID) {
    	
    	// declare and initialize variables
    	var subsidiaryApprover = null;
    	
    	// lookup values on the subsidiary record
    	var subsidiaryLookup = search.lookupFields({
    		type: search.Type.SUBSIDIARY,
    		id: subsidiaryID,
    		columns: ['custrecord_bbs_financial_controller']
    	});
    	
    	if (subsidiaryLookup.custrecord_bbs_financial_controller.length > 0)
    		{
    			subsidiaryApprover = subsidiaryLookup.custrecord_bbs_financial_controller[0].value;
    		}
    	
    	return subsidiaryApprover;
    	
    }

    return {
        onAction : onAction
    };
    
});
