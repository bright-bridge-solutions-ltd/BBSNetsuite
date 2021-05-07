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
    	
    	// create search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_ims_usage_data',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
				name: 'custrecord_bbs_ims_usage_data_processed',
				operator: 'is',
				values: ['F']
    		},
    				{
				name: 'custrecord_bbs_ims_usage_data_processing',
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
    	var searchResult = JSON.parse(context.value);
    	var recordID	 = searchResult.id;
    	
    	log.audit({
    		title: 'Processing IMS Usage Data Record',
    		details: recordID
    	});
    	
    	try
    		{
    			// load the re-save the IMS usage data record
    			record.load({
    				type: 'customrecord_bbs_ims_usage_data',
    				id: recordID
    			}).save();
    			
    			log.audit({
    	    		title: 'IMS Usage Data Record Loaded/Re-Saved',
    	    		details: recordID
    	    	});
    		}
    	catch(e)
    		{
	    		log.error({
		    		title: 'Error Loaded/Re-Saving IMS Usage Data Record ' + recordID,
		    		details: e.message
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
        summarize: summarize
    };
    
});
