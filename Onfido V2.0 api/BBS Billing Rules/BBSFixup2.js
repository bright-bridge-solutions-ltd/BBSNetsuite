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
    	
    	// create search to find journal records to be deleted
    	return search.create({
			type: search.Type.JOURNAL_ENTRY,
			
			columns: [{
				name: 'internalid',
				summary: 'GROUP'
			}],
			
			filters: [{
				name: 'custbody_bbs_contract_record',
				operator: 'anyof',
				values: ['324', '325', '326', '327']
			},
					{
				name: 'datecreated',
				operator: 'onorafter',
				values: ['04/02/2020']
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
    	
    	// get the internal ID of the journal record
    	var recordID = searchResult.values['GROUP(internalid)'].value
    	
    	log.audit({
    		title: 'Processing Journal Record',
    		details: recordID
    	});
    	
    	try
    		{
	    		// delete the journal record
				record.delete({
					type: record.Type.JOURNAL_ENTRY,
					id: recordID
				});

		    	log.audit({
		    		title: 'Journal Record Deleted',
		    		details: 'Record ID: ' + recordID
		    	});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Deleting Journal Record',
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
