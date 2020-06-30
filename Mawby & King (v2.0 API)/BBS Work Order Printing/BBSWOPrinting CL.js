/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url'],
function(currentRecord, url) {

    function fieldChanged(scriptContext) {
    	
    	// load current record in order to manipulate it
		var rec = currentRecord.get();
    	
    	// check if the 'printed' field has been changed
    	if (scriptContext.fieldId == 'printed')
    		{
    			// get the value of the poSelect field
    			var printed = rec.getValue({
    				fieldId: 'printed'
    			});

    			// reload Suitelet and pass parameters
    			var reloadURl = url.resolveScript({
    				scriptId: 'customscript_bbs_wo_printing_sl',
    				deploymentId: 'customdeploy_bbs_wo_printing_sl',
    				params: {'printed' : printed}
    			});
    			
    			window.onbeforeunload = null;
				window.location.href = reloadURl;
    		}
    }

    return {
        fieldChanged: fieldChanged
    };
    
});
