/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/task'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, task) {
   
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
    	
    	log.audit({
    		title: '*** BEGINNING OF SCRIPT ***'
    	});
    	
    	// create search of records to be processed
    	return search.create({
    		type: 'customrecord_bbs_brightlime_transactions',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_brightlime_tran_date',
    			operator: 'on',
    			values: ['yesterday']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_brightlime_tran_club_id'
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
    	
    	// retrieve search result
    	var searchResult = JSON.parse(context.value);
    	var recordID = searchResult.id;
    	var clubID = searchResult.values['custrecord_bbs_brightlime_tran_club_id'];
    	
    	/*log.audit({
    		title: 'Processing Record',
    		details: 'Record ID: ' + recordID
    	});*/
    	
    	// call function to return the Brightlime club, location and subsidiary IDs
    	var blClubSearch = searchBLClubID(clubID);
    	var locationID = blClubSearch[0]
    	var subsidiaryID = blClubSearch[1];

    	try
    		{
		    	// update fields on the current record
				record.submitFields({
					type: 'customrecord_bbs_brightlime_transactions',
					id: recordID,
					values: {
						custrecord_bbs_brightlime_tran_location: locationID,
						custrecord_bbs_brightlime_tran_sub_id: subsidiaryID
					}
				});
				
				/*log.audit({
					title: 'Record Updated',
					details: recordID
				});*/
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
    			})
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
    	
    	// =============================================================================
    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO UPDATE BRIGHTLIME CHARGE RECORDS
    	// =============================================================================
    	
    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_bl_charges_update_mr',
    	    deploymentId: 'customdeploy_bbs_bl_charges_update_mr'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script Scheduled',
    		details: 'BBS BL Charges Update Map/Reduce script has been Scheduled.<br>Job ID: ' + mapReduceTaskID
    	});

    }
    
    // ======================================================================
    // FUNCTIONS TO SEARCH AND RETURN VALUES TO POPULATE THE BL CHARGE RECORD
    // ======================================================================
    
    function searchBLClubID(clubID)
    	{
    		// declare new array to hold values to be returned
    		var returnValues = new Array();
    		
    		// declare and initialize variables
    		var locationID = null;
    		var subsidiaryID = null;
    		
    		// create search to find the matching BrightLime Club ID record
    		var blClubSearch = search.create({
    			type: 'customrecordbbs_club_id',
    			
    			filters: [{
    				name: 'isinactive',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'name',
    				operator: 'is',
    				values: [clubID]
    			}],
    			
    			columns: [{
    				name: 'custrecord_bbs_bl_location'
    			},
    					{
    				name: 'custrecord_bbs_subsidiary2'
    			}],
    			
    		});
    		
    		// run search and process results
    		blClubSearch.run().each(function(result){
    			
    			// retrieve search results
    			locationID = result.getValue({
    				name: 'custrecord_bbs_bl_location'
    			});
    			
    			subsidiaryID = result.getValue({
    				name: 'custrecord_bbs_subsidiary2'
    			});
    			
    		});
    		
    		// push values to the returnValues array
    		returnValues.push(locationID);
    		returnValues.push(subsidiaryID);
    		
    		// return the returnValues array
    		return returnValues;
    		
    	}

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
