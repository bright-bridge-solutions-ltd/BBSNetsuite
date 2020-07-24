/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
   
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
    	
    	// run search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_clover_orders',
    		
    		columns: [{
				name: 'internalid'
			}],
			
			filters: [{
				name: 'custrecord_bbs_order_date',
				operator: search.Operator.ON,
				values: ['4/3/2020']
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
    	
    	// process search results
    	var searchResult 	= JSON.parse(context.value);
    	var recordID		= searchResult.id;
    	
    	try
    		{
    			// delete the Clover Orders record
    			record.delete({
    				type: 'customrecord_bbs_clover_orders',
    				id: recordID
    			});
    			
    			log.audit({
    				title: 'Record Deleted',
    				details: recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Deleting Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
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

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
