/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/task'],
function(task) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// ====================================================
    	// SCHEDULE MAP/REDUCE SCRIPT TO CREATE ADVANCE REPORTS
		// ====================================================
    	
    	try
			{
		    	// create a scheduled task
		    	var mapReduceTaskID = task.create({
		    		taskType: task.TaskType.MAP_REDUCE,
				    scriptId: 'customscript_bbs_advance_reports_mr',
				    deploymentId: 'customdeploy_bbs_advance_reports_mr'
		    	}).submit();
				    	
		    	log.audit({
		    		title: 'Script Scheduled',
		    		details: 'BBS Create Advance Reports Map/Reduce script has been scheduled. Job ID ' + mapReduceTaskID
		    	});
		    	
		    	// return true to the client script
		    	context.response.write('true');
			}
		catch(e)
			{
				log.audit({
					title: 'Error Scheduling Script',
					details: e
				});
				
				// return false to the client script
				context.response.write('false');
			}

    }

    return {
        onRequest: onRequest
    };
    
});
