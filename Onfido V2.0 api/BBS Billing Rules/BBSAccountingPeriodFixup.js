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
    	
    	// create search to find invoice records to be updated
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
    			values: ['31/1/2020']
    		},
    				{
    			name: 'postingperiod',
    			operator: 'is',
    			values: ['136'] // 136 = Feb 2020
    		}],
    		
    		columns: [{
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
    	
    	// get the internal ID of the record from the search results
		var recordID = searchResult.id;
		
		// get the tran id of the record from the search results
		var tranID = searchResult.values.tranid;
		
		log.audit({
			title: 'Processing Invoice',
			details: 'Tran ID: ' + tranID + '<br>Internal ID: ' + recordID
		});
		
		try
			{
				// set the accounting period on the invoice record
				record.submitFields({
					type: record.Type.INVOICE,
					id: recordID,
					values: {
						postingperiod: 135 // 135 = Jan 2020
					}
				});
				
				log.audit({
					title: 'Invoice Updated',
					details: 'Tran ID: ' + tranID + '<br>Internal ID: ' + recordID
				});
				
			}
		catch(e)
			{
				log.error({
					title: 'Error Updating Invoice',
					details: 'Tran ID: ' + tranID + '<br>Internal ID: ' + recordID + '<br>Error: ' + e
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
