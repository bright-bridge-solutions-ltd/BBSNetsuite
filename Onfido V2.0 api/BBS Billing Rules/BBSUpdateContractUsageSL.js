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
    	
    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_update_contract_usage',
    	    deploymentId: 'customdeploy_bbs_update_contract_usage'
    	});
    	
    	// submit the map/reduce task. Return result to the client script
    	mapReduceTask.submit();

    }

    return {
        onRequest: onRequest
    };
    
});
