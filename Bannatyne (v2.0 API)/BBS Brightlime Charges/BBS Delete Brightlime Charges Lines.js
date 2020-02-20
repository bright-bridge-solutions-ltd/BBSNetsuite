/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/task'],
function(search, record, task) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// create search to find BBS Brightlime Charges Lines records
    	return search.create({
			type: 'customrecord_bbs_bl_charges_lines',
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [
			
			],
		});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve ID of the record ID from the search
    	var searchResult = JSON.parse(context.value);
		var recordID = searchResult.id;
		
		try
			{
				// delete the record
	    		record.delete({
	    			type: 'customrecord_bbs_bl_charges_lines',
	    			id: recordID
	    		});
	    		
	    		log.audit({
	    			title: 'Record Deleted',
	    			details: 'Record ' + recordID + ' has been deleted'
	    		});
			}
		catch (e)
			{
				log.error({
					title: 'Error Deleting Record',
					details: 'Record ID: ' + recordID + '<br>Error: ' + e
				});
			}

    }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_delete_bl_charges',
    	    deploymentId: 'customdeploy_bbs_delete_bl_charges'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS Delete Brightlime Charges script has been scheduled<br>Job ID: ' + mapReduceTaskID
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
