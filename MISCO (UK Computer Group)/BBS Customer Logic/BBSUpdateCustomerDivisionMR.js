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
    	
    	// search for records to be updated
    	return search.create({
    		type: search.Type.CUSTOMER,
    		
    		filters: [{
    			name: 'formulatext',
    			formula: "CASE WHEN {cseg_bbs_division} != {salesrep.cseg_bbs_division} THEN 'UPDATE' END",
    			operator: search.Operator.IS,
    			values: ['UPDATE']
    		}],
    		
    		columns: [{
    			name: 'cseg_bbs_division',
    			join: 'salesRep'
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
    	
    	// return search results
    	var searchResult		= JSON.parse(context.value);
    	var customerID			= searchResult.id;
    	var salesRepDivision	= searchResult.values['cseg_bbs_division.salesRep'].value;
    	
    	log.audit({
    		title: 'Processing Customer',
    		details: customerID
    	});
    	
    	try
    		{
    			// update the division on the customer
    			record.submitFields({
    				type: record.Type.CUSTOMER,
    				id: customerID,
    				values: {
    					cseg_bbs_division: salesRepDivision
    				}
    			});
    			
    			log.audit({
    				title: 'Customer Updated',
    				details: customerID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Customer ' + customerID,
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

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
