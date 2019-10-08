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
    	
    	// create search to find item records to be updated
    	var itemSearch = search.create({
			type: 'item',
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [{
				name: 'custitem_bannatyne_inactive',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'type',
				operator: 'anyof',
				values: ['InvtPart']
			}],
		});
    	
    	// create new array to hold search results
    	var searchResults = new Array();
    	
    	// declare variables
    	var recordID;
    	
    	// get search results using the getAllResults function
    	var searchResutSet = getAllResults(itemSearch);

    	// process search results and push record ID to the array
    	searchResutSet.forEach(function(result) {
    		
    		// get the record ID from the search results
    		recordID = result.getValue ({
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
    	
    	// retrieve ID of the record from the search
    	var searchResult = JSON.parse(context.value);
		var recordID = searchResult.id;
		
		// declare new array called vendorArray
		var vendorArray = new Array();
		
		try
			{
				// load the record
				var itemRecord = record.load({
					type: record.Type.INVENTORY_ITEM,
					id: recordID,
					isDynamic: true
				});
				
				// get count of vendor lines
				var lineCount = itemRecord.getLineCount({
					sublistId: 'itemvendor'
				});
				
				// loop through line count
				for (var i = 0; i < lineCount; i++)
					{
						// get the vendor ID for the line
						var vendorID = itemRecord.getSublistValue({
							sublistId: 'itemvendor',
							fieldId: 'vendor',
							line: i
						});
						
						// push the vendorID to the vendorArray
						vendorArray.push(vendorID);
					}
				
				log.audit({
					title: 'Vendor Array Length',
					details: vendorArray.length
				});
				
				// set the multi-select field with a list of vendors
				itemRecord.setValue({
					fieldId: 'custitem_bbs_available_suppliers',
					value: vendorArray
				});
				
				// submit the record
				itemRecord.save();
				
				log.audit({
					title: 'Record Saved',
					details: 'ID: ' + recordID
				});
			}
		catch (e)
			{
				log.audit({
					title: 'Error updating record ' + recordID,
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

    return {
        getInputData: getInputData,
        map: map
    };

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
    
});
