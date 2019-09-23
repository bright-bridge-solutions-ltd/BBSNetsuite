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
    	var transactionSearch = search.create({
			type: search.Type.CASH_SALE,
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [{
				name: 'customform',
				operator: 'anyof',
				values: ['128'] // 128 = Clover Cash Sale
			},
					{
				name: 'mainline',
				operator: 'is',
				values: ['T']
			},
					{
				name: 'trandate',
				operator: 'within',
				values: ['1/9/2019','16/9/2019']
			},
					{
				name: 'location',
				operator: 'anyof',
				values: ['88'] // 88 = Cookridge Closed
			}],
		});
    	
    	// create new array to hold search results
    	var searchResults = new Array();
    	
    	// declare variables
    	var recordID;

    	// process search results push results to the array
    	transactionSearch.run().each(function(result) {
    		
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
    	
    	// initialize variables
    	var cashSaleInfoRecordID;
    	
    	// retrieve record ID from the search
    	var searchResults = JSON.parse(context.value);    	
		var cashSaleRecordID = searchResults.id;
		
		// run search to find Cash Sale Information records
		var cashSaleInfoSearch = search.create({
			type: 'customrecordbbs_cash_sale_information',
					
			columns: [{
				name: 'internalid'
			}],
					
			filters: [{
				name: 'custrecord_bbs_cash_sale',
				operator: 'anyof',
				values: [cashSaleRecordID]
			}],
		});
				
		// process search results
		cashSaleInfoSearch.run().each(function(result) {
    	    		
    	    // get the record ID from the search results
    	    cashSaleInfoRecordID = result.getValue({
    	    	name: 'internalid'
    	    });
    	    
    	    try
    	    	{
    	    		// delete the cash sale info record
	    	    	record.delete({
		    			type: 'customrecordbbs_cash_sale_information',
		    			id: cashSaleInfoRecordID
		    		});
	    	    	
	    	    	log.audit({
		    			title: 'Cash Sale Info Record Deleted',
		    			details: 'Record ' + cashSaleInfoRecordID + ' has been deleted'
		    		});	    	    	
    	    	}
    	    catch (error)
    	    	{
    	    		// log the error
    	    		log.error({
    	    			title: 'Error Deleting Cash Sale Info Record ' + cashSaleInfoRecordID,
    	    			details: error
    	    		});
    	    	}
    	    		
    	    // continue processing results
    	    return true;
		
		});
		
		try
			{
				// delete the cash sale record
	    		record.delete({
	    			type: record.Type.CASH_SALE,
	    			id: cashSaleRecordID
	    		});
	    		
	    		log.audit({
	    			title: 'Cash Sale Record Deleted',
	    			details: 'Record ' + cashSaleRecordID + ' has been deleted'
	    		});
			}
		catch (error)
			{
				// log the error
	    		log.error({
	    			title: 'Error Deleting Cash Sale Record ' + cashSaleRecordID,
	    			details: error
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
        map: map
    };
    
});
