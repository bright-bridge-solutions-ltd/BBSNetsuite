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
    	
    	// create search to find BBS Brightlime Transactions records
    	var transactionSearch = search.create({
			type: 'transaction',
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [{
				name: 'type',
				operator: 'anyof',
				values: ['SalesOrd']
			},
					{
				name: 'customform',
				operator: 'anyof',
				values: ['123'] // 125 = Booking Portal Cash Sale, 123 = Booking Portal Sales Order
			},
					{
				name: 'mainline',
				operator: 'is',
				values: ['T']
			},
					{
				name: 'trandate',
				operator: 'within',
				values: ['1/8/2019','31/8/2019']
			}],
		});
    	
    	// create new array to hold search results
    	var searchResults = new Array();
    	
    	// declare variables
    	var recordID;
    	
    	// get search results using the getAllResults function
    	var searchResutSet = getAllResults(transactionSearch);

    	// process search results push results to the array
    	searchResutSet.forEach(function(result) {
    		
    		// get the record ID from the search results
    		recordID = result.getValue({
    			name: 'internalid'
    		});
    		
    		// push search result to searchResults array
    		searchResults.push({
    			'id': recordID
    		});
    		
    		// continue processing results
    		return true;
    	});
    	
    	// log number of search results found
    	log.audit({
    		title: 'Search Results',
    		details: 'Search found ' + searchResults.length + ' results'
    	});
    	
    	// pass array to Map() function
    	return searchResults;

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve record ID from the search
    	var searchResults = JSON.parse(context.value);    	
		var recordID = searchResults.id;
		
		try
			{
				// delete the record
	    		record.delete({
	    			type: record.Type.SALES_ORDER,
	    			id: recordID
	    		});
	    		
	    		log.audit({
	    			title: 'Record Deleted',
	    			details: 'Record ' + recordID + ' has been deleted'
	    		});
			}
		catch (e)
			{
				log.audit({
					title: 'Error deleting record ' + recordID,
					details: 'Error: ' + e
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
    
    function getAllResults(s) {
    	var results = s.run();
        var searchResults = [];
        var searchid = 0;
        do {
            var resultslice = results.getRange({start:searchid,end:searchid+1000});
            resultslice.forEach(function(slice) {
                searchResults.push(slice);
                searchid++;
                }
            );
        } while (resultslice.length >=1000);
        return searchResults;
    }

    return {
        getInputData: getInputData,
        map: map
    };
    
});
