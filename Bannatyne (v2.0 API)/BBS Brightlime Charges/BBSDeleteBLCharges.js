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
			type: 'customrecord_bbs_brightlime_charges',
			
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
    	
    	// retrieve ID of the record from the search
    	var searchResult = JSON.parse(context.value);
		var recordID = searchResult.id;
		
		log.audit({
			title: 'Processing BL Charge Record',
			details: recordID
		});
		
		try
			{
				// delete the BL Charge Record
				record.delete({
					type: 'customrecord_bbs_brightlime_charges',
					id: recordID
				});
				
				log.audit({
					title: 'BL Charge Record Deleted',
					details: recordID
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Deleting BL Charge Record',
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
