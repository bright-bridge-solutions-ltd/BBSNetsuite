/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    	
    	// get the value of the 'Created From' field
    	var createdFrom = currentRecord.getValue({
    		fieldId: 'createdfrom'
    	});
    	
    	if (createdFrom)
    		{
    			// get the created from transaction's type
    			var createdFromType = search.lookupFields({
    				type: search.Type.TRANSACTION,
    				id: createdFrom,
    				columns: ['type']
    			}).type[0].value;
    			
    			// if the created from transaction's type is 'Estimate'
    			if (createdFromType == 'Estimate')
    				{
	    				try
		    				{
				    			// update the sales estimate
				    			record.submitFields({
				    				type: record.Type.ESTIMATE,
				    				id: createdFrom,
				    				values: {
				    					custbody_bbs_approval_status: 12 // 12 = SO Rejected by Finance
				    				},
				    				enableSourcing: false,
									ignoreMandatoryFields: true
				    			});
		    				}
		    			catch(e)
		    				{
		    					log.error({
		    						title: 'Error Updating Estimate',
		    						details: 'Record ID: ' + createdFrom + '<br>Error: ' + e
		    					});
		    				}
    				}
    		}

    }

    return {
        onAction : onAction
    };
    
});
