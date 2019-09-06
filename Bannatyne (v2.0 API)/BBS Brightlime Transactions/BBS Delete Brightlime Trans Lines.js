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
    	
    	// create search to find BBS Brightlime Transactions records
    	var brightlimeTransactionLinesSearch = search.create({
			type: 'customrecord_bbs_bl_trans_lines',
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [
			
			],
		});
    	
    	// create new array to hold search results
    	var searchResults = new Array();
    	
    	// declare variables
    	var recordID;
    	
    	// run each result and get ID and push it to array
    	brightlimeTransactionLinesSearch.run().each(function(result) {
    		
    		// get the record ID from the search results
    		recordID = result.getValue ({
    			name: 'internalid'
    		});
    		
    		// push search result to searchResults array
    		searchResults.push({
    			'id': recordID
    		});
    		
    		// continue processing results
    		return true;
    	});
    	
    	// log number of search results found
    	log.audit({
    		title: 'Search Results',
    		details: 'Search found ' + searchResults.length + ' results'
    	});
    	
    	// pass array to Map() function
    	return searchResults;

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
	    			type: 'customrecord_bbs_bl_trans_lines',
	    			id: recordID
	    		});
	    		
	    		log.audit({
	    			title: 'Record Deleted',
	    			details: 'Record ' + recordID + ' has been deleted'
	    		});
			}
		catch (e)
			{
				log.audit({
					title: 'Error deleting record ' + recordID,
					details: 'Error: ' + e
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
    	    scriptId: 'customscript_bbs_delete_bl_trans',
    	    deploymentId: 'customdeploy_bbs_delete_bl_trans'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS Delete Brightlime Trans script has been scheduled. Job ID ' + mapReduceTaskID
    	});
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
