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
    	
    	log.audit({
    		title: '*** BEGINNING OF SCRIPT ***'
    	});
    	
    	// create search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_brightlime_transactions',
    		
    		filters: [{
    			name: 'custrecord_bbs_brightlime_tran_processed',
    			operator: 'is',
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search results
    	var searchResult	= 	JSON.parse(context.value);
    	var recordID		= 	searchResult.id;
    	
    	try
    		{
    			// set the 'Processed' flag on the BrightLime Transaction record
    			record.submitFields({
    				type: 'customrecord_bbs_brightlime_transactions',
    				id: recordID,
    				values: {
    					custrecord_bbs_brightlime_tran_processed: true
    				}
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Brightlime Transaction Record ' + recordID,
    				details: e
    			});
    		}

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});
    	
    	// =============================================================================
    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO UPDATE BRIGHTLIME CHARGE RECORDS
    	// =============================================================================
    	
    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_bl_charges_map_reduce',
    	    deploymentId: 'customdeploy_bbs_bl_charges_map_reduce'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script Scheduled',
    		details: 'BBS BL Charges Processed Map/Reduce script has been Scheduled.<br>Job ID: ' + mapReduceTaskID
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
