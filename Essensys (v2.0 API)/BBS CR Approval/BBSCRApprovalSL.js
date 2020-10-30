/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// retrieve script parameters
    	var templateID = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_cr_approval_sl_email_temp'
    	});
    	
    	var level1ApprovalLimit = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_cr_approval_level_1_limit'
    	});
    	
    	// retrieve parameters that were passed from the client script
    	var recordID = context.request.parameters.id;
    		recordID = parseInt(recordID); // use parseInt to convert to a number
    		
    	// lookup fields on the RMA record
    	var rmaLookup = search.lookupFields({
    		type: record.Type.RETURN_AUTHORIZATION,
    		id: recordID,
    		columns: ['total', 'custbody_bbs_level_1_approved']
    	});
    	
    	// retrieve values from the RMA lookup
    	var total = parseFloat(rmaLookup.total * -1); // lookup returns negative number so multiply by -1 to get a positive number
    	var level1Approved = rmaLookup.custbody_bbs_level_1_approved;
    	
    	// check if the total is less than equal to the level1ApprovalLimit
    	if (total <= level1ApprovalLimit)
    		{
	    		// call function to mark the RMA record as approved
    			approveRMA(recordID);
    		}
    	else // total is greater than the level1ApprovalLimit
    		{
    			// check if the level1Approved is true
    			if (level1Approved == true)
    				{
    					// call function to mark the RMA record as approved
    					approveRMA(recordID);
    				}
    			else
    				{
    					// call function to update the 'Level 1 Approved' checkbox on the RMA record
    					updateLevel1Approved(recordID);
    				}
    		}

    }
    
    // ====================================
    // FUNCTION TO MARK THE RMA AS APPROVED
    // ====================================
    
    function approveRMA(recordID) {
    	
    	try
    		{
    			// update fields on the RMA record
    			record.submitFields({
    				type: record.Type.RETURN_AUTHORIZATION,
    				id: recordID,
    				values: {
    					custbody_bbs_approval_status: 6,// 6 = Approved
    					status: 'B' // B = Pending Receipt
    				},
    				enableSourcing: false,
					ignoreMandatoryFields: true
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Approving RMA Record',
    				details: 'ID: ' + recordID + '<br>Error: ' + e
    			});
    		}
    	
    }
    
    // =============================================================
    // FUNCTION TO UPDATE THE RMA RECORD'S LEVEL 1 APPROVED CHECKBOX
    // =============================================================
    
    function updateLevel1Approved(recordID) {
	    	
    	try
    		{
		    	record.submitFields({
			    	type: record.Type.RETURN_AUTHORIZATION,
			    	id: recordID,
			    	values:	{
			    		custbody_bbs_level_1_approved: true
			    	},
			    	enableSourcing: false,
					ignoreMandatoryFields: true
			    });
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Setting Level 1 Approved Checkbox',
    				details: 'ID: ' + recordID + '<br>Error: ' + e
    			});
    		}
    }

    return {
        onRequest: onRequest
    };
    
});
