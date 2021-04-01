/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/url', 'N/https'],
function(url, https) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// get the internal ID of the current record
    	var recordID = scriptContext.newRecord.id;
    	
    	// define URL of Suitelet
		var suiteletURL = url.resolveScript({
			scriptId: 'customscript_bbs_transform_quote_sl',
			deploymentId: 'customdeploy_bbs_transform_quote_sl',
			returnExternalUrl: true,
			params: {
				'id': recordID
			}
		});
		
		// call a backend Suitelet to transform the estimate into a sales order
		https.get({
			url: suiteletURL
		});

    }

    return {
        onAction : onAction
    };
    
});
