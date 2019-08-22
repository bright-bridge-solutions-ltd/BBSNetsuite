/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/search'],
	function(record, search) {
	
    function getInputData() {

    	return search.create({
			type: search.Type.CASH_SALE,
			
			columns: [{
				name: 'tranid'
			},
					{
				name: 'location'
			},
					{
				name: 'custcol_cseg2' // club region
			},
					{
				name: 'custcol_cseg1' // spa region
			},
					{
				name: 'custcol_cseg3' // sales region
			},
					{
				name: 'custcol_cseg4' // estates region
			},
			
			
			
			
			
			
			
			
			],
			
			filters: [{
				name: 'mainline',
				operator: 'is',
				values: ['T']	
			},
					{
				name: 'trandate',
				operator: 'within',
				values: []
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
