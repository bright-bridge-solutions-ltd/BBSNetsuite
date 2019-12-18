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
    	
    	// create search to find period detail records to be updated
    	return search.create({
			type: 'customrecord_bbs_contract_period',
			
			columns: [{
				name: 'custrecord_bbs_contract_period_contract'
			}],
			
			filters: [{
				name: 'custrecord_bbs_contract_period_start',
				operator: 'within',
				values: ['lastmonth']
			},
					{
				name: 'custrecord_bbs_contract_period_end',
				operator: 'within',
				values: ['lastmonth']
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
    	
    	// get the internal ID of the period detail record
    	var recordID = searchResult.id;
    	
    	log.audit({
    		title: 'Processing Period Detail Record',
    		details: 'Record ID: ' + recordID
    	});
    	
    	try
    		{
    			// submit fields on the period detail record
    			record.submitFields({
    				type: 'customrecord_bbs_contract_period',
    				id: recordID,
    				values: {
    					custrecord_bbs_contract_period_prod_use: '',
						custrecord_bbs_contract_period_quantity: '',
						custrecord_bbs_contract_period_rate: ''
    				}
    			});
    			
    			log.audit({
    				title: 'Period Detail Record Updated',
    				details: 'Record ID: ' + recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating a Period Detail Record',
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
