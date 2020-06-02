/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    	
    	// create search to find records to be deleted
    	return search.create({
    		type: search.Type.INVOICE,
    		
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		},
    				{
    			name: 'trandate',
    			operator: 'on',
    			values: ['31/03/2020']
    		},
    				{
    			name: 'datecreated',
    			operator: 'on',
    			values: ['today']
    		}],
    		
    		columns:[{
    			name: 'tranid'
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
    	var searchResult = JSON.parse(context.value);	
    	var recordID = searchResult.id;
    	
    	log.audit({
    		title: 'Processing Invoice',
    		details: recordID
    	});
    	
    	try
    		{
    			// delete the record
    			record.delete({
    				type: record.Type.INVOICE,
    				id: recordID
    			});
    			
    			log.audit({
    				title: 'Invoice Record Deleted',
    				details: tranID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Deleting Invoice Record',
    				details: 'Invoice: ' + tranID + '<br>Error: ' + e
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

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
