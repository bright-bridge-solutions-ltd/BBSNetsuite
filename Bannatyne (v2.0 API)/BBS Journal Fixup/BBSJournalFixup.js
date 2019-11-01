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
    	
    	// load search to find Journal records to be updated
    	var journalSearch = search.load({
    		id: 'customsearch_bbs_journals_for_update',
    		type: search.Type.JOURNAL_ENTRY
    	});
    	
    	// create new array to hold search results
    	var searchResults = new Array();
    	
    	// declare variables
    	var recordID;
    	
    	// get search results using the getAllResults function
    	var searchResultSet = getAllResults(journalSearch);
    	
    	// process search results and push record ID to the array
    	searchResultSet.forEach(function(result) {
    		
    		// get the record ID from the search results
    		recordID = result.getValue({
    			name: 'internalid',
    			summary: 'GROUP'
    		});
    		
    		// push search result to searchResults array
    		searchResults.push({
    			'id': recordID
    		});
    		
    		// continue processing search results
    		return true;

    	});
    	
    	// log number of search results found
    	log.audit({
    		title: 'Search Results',
    		details: 'Search found ' + searchResults.length + ' journal records to be updated'
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
    	
    	// call function to retrieve region data
    	var locationSearchResults = getRegionData();
    	
    	// declare variables
    	var location;
    	var searchLocation;
    	var regionData;
    	var clubRegion;
		var spaRegion;
		var salesRegion;
		var estatesRegion;
    	
    	// retrieve ID of the record from the search
    	var searchResult = JSON.parse(context.value);
		var recordID = searchResult.id;
		
		log.audit({
			title: 'Processing Journal Record',
			details: recordID
		});
		
		try
			{
				// load the record
				var journalRecord = record.load({
					type: record.Type.JOURNAL_ENTRY,
					id: recordID,
					isDynamic: true
				});
				
				// get a count of item lines
				var lineCount = journalRecord.getLineCount({
					sublistId: 'line'
				});
				
				// loop through journal line count
				for (var j = 0; j < lineCount; j++)
					{
						// select the line
						journalRecord.selectLine({
							sublistId: 'line',
							line: j
						});
					
						// get the location id for the line
						location = journalRecord.getCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'location'
						});
						
						// check if the location variable returns a value
						if (location)
							{
								// loop through locationSearchResults
								for (var l = 0; l < locationSearchResults.length; l++)
									{
										// get the internal ID of the location from the search
										searchLocation = locationSearchResults[l].id;
										
										// check that location and searchLocation variables are the same
										if (location == searchLocation)
											{
												// retrieve region data from the search
												clubRegion = locationSearchResults[l].getValue({
													name: 'custrecord_n103_cseg2'
												});
												
												spaRegion = locationSearchResults[l].getValue({
													name: 'custrecord_n103_cseg1'
												});
												
												salesRegion = locationSearchResults[l].getValue({
													name: 'custrecord_n103_cseg3'
												});
												
												estatesRegion = locationSearchResults[l].getValue({
													name: 'custrecord_n103_cseg4'
												});
												
												// escape the loop
												break;
											}
									}
								
								// set line item fields on transaction record
								journalRecord.setCurrentSublistValue({
									sublistId: 'line',
									fieldId: 'custcol_cseg2',
									value: clubRegion
								});
								
								journalRecord.setCurrentSublistValue({
									sublistId: 'line',
									fieldId: 'custcol_cseg1',
									value: spaRegion
								});
								
								journalRecord.setCurrentSublistValue({
									sublistId: 'line',
									fieldId: 'custcol_cseg3',
									value: salesRegion
								});
								
								journalRecord.setCurrentSublistValue({
									sublistId: 'line',
									fieldId: 'custcol_cseg4',
									value: estatesRegion
								});
								
								// commit the changes to the line
								journalRecord.commitLine({
									sublistId: 'line'
								});

							}
					}
				
				// save the journal record
				journalRecord.save();
				
				log.audit({
					title: 'Journal Record Updated',
					details: recordID
				})
			}
		catch(error)
			{
				log.error({
					title: 'An Error Occured Processing Journal Record',
					details: 'ID: ' + recordID + ' | Error: ' + error
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
    
    function getRegionData()
	    {
	    	 // create search to retrieve region data for all active locations
	    	var locationSearch = search.create({
	    		type: search.Type.LOCATION,
	    		
	    		columns: [{
	    			name: 'custrecord_n103_cseg2'
	    		},
	    				{
	    			name: 'custrecord_n103_cseg1'
	    		},
	    				{
	    			name: 'custrecord_n103_cseg3'
	    		},
	    				{
	    			name: 'custrecord_n103_cseg4'
	    		}],
	    		
	    		filters: [{
	    			name: 'isinactive',
	    			operator: 'is',
	    			values: ['F'] // exclude inactive locations
	    		}],
	    		
	    	});
	    	
	    	// run search
	    	var resultSet = locationSearch.run();
	    	
	    	// return the first 100 results (only 88 locations exist)
	    	var locationSearchResults = resultSet.getRange({
	            start: 0,
	            end: 100
	        });
	    	
	    	// return the search results to the map() function
	    	return locationSearchResults;
	    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
