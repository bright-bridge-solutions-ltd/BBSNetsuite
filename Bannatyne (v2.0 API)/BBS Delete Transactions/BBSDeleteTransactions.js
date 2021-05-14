/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
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
    	
    	// create search to find transactions to be deleted
    	return search.create({
			type: search.Type.CASH_SALE,
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [{
				name: 'internalid',
				operator: 'anyof',
				values: [10319579,10319580,11092626,11092627,11092635,11092636,11092637,11092638,11092639,11092640,11092641,11092732,11092733,11092734,11092735,11092736,11092737,11103720,11103721,11103722,11103723,11103724,11103725,11103726,11103727,11103728,11103729,11103817,11103818,11103910,11113455,11113456,11113457,11113458,11113459,11113460,11113461,11113462,11113463,11120837,11120838,11120839,11120840,11120841,11120842,11120843,11120844,11120845,11125825,11125826,11125827,11130138,11130139,11130140,11130141,11144532,11144533,11144534,11144535,11144536,11144537,11144538,11144539,11144540,11154914,11154915,11154916,11154917,11154918,11154919,11154920,11154921,11154922,11154923,11163011,11163012,11163013,11163014,11163015,11163016,11163017,11163018,11173273,11173274,11173275,11173276,11178223,11178224,11178225,11178226,11183016,11183017,11192536,11192537,11192538,11192539,11192540,11192541,11192542,11192543,11192544,11192545,11192546,11192547,11192548,11192549,11192550,11192576,11201782,11201783,11201784,11201785,11201786,11201787,11201788,11201789,11201790,11201791,11201792,11201793,11201794,11211289,11211290,11211291,11211292,11211293,11211294,11211295,11211296,11211297,11211298,11211299,11211300,11211301]
			},
					{
				name: 'mainline',
				operator: 'is',
				values: ['T']
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
    	
    	// retrieve search results from the search
    	var searchResults = JSON.parse(context.value);    	
		var cashSaleRecordID = searchResults.id;
		
		try
			{
				// delete the cash sale record
	    		record.delete({
	    			type: record.Type.CASH_SALE,
	    			id: cashSaleRecordID
	    		});
	    		
	    		log.audit({
	    			title: 'Cash Sale Record Deleted',
	    			details: cashSaleRecordID
	    		});
			}
		catch(e)
			{
				// log the error
	    		log.error({
	    			title: 'Error Deleting Cash Sale Record ' + cashSaleRecordID,
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
