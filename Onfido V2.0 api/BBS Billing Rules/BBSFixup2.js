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
    	
    	// create search to find sales order records to be updated
    	return search.create({
			type: 'customrecord_bbs_contract',
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [{
				name: 'custrecord_bbs_contract_customer',
				operator: 'anyof',
				values: ['2619', '3236', '3182', '3263', '3344', '3287', '2339', '2610', '3304']
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
    	
    	// get the internal ID of the sales order record
    	var recordID = searchResult.id;
    	
    	log.audit({
    		title: 'Processing Contract Record',
    		details: 'Internal ID: ' + recordID
    	});
    	
    	try
    		{
	    		// delete the sales order record
				record.delete({
					type: 'customrecord_bbs_contract',
					id: recordID
				});

		    	log.audit({
		    		title: 'Contract Record Deleted',
		    		details: 'Record ID: ' + recordID
		    	});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Deleting Contract Record',
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
    function summarize(context) {
    	
    	log.audit({
    		title: 'Units Used',
    		details: context.usage
    	});
    	
    	log.audit({
    		title: 'Number of Yields',
    		details: context.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
