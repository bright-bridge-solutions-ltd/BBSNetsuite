/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/task'],

function(search, record, task) {

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
    	var brightlimeTransactionSearch = search.create({
			type: 'customrecord_bbs_bl_trans',
			
			columns: [{
				name: 'internalid'
			},
					{
				name: 'custrecord_bbs_bl_trans_club_id',
				sort: search.Sort.ASC,
			}],
			
			filters: [
			
			],
		});
    	
    	// create new array to hold search results
    	var searchResults = new Array();
    	
    	// declare variables
    	var recordID;
    	
    	// run each result and get ID and push it to array
    	brightlimeTransactionSearch.run().each(function(result) {
    		
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
    	
    	// declare variables
    	var account;
    	var debit;
    	var credit;
    	var location;
    	
    	// retrieve ID of the record ID from the search
    	var searchResult = JSON.parse(context.value);
		var recordID = searchResult.id;
		
		try
	    	{
		        // load the BBS Brightlime Transactions record
				var blTranRec = record.load ({
					type: 'customrecord_bbs_bl_trans',
					id: recordID
				});
				
				// get the club ID from the loaded record
				var clubID = blTranRec.getValue({
					fieldId: 'custrecord_bbs_bl_trans_club_id'
				});
				
				// get the subsidiary from the loaded record
				var subsidiary = blTranRec.getValue({
					fieldId: 'custrecord_bbs_bl_trans_subsidiary'
				});
				
				log.audit ({
					title: 'Record Loaded',
					details: 'Record ' + recordID + ' has been loaded. Club ID is ' + clubID +'. Subsidiary is ' + subsidiary
				});
				
				var lineCount = blTranRec.getLineCount ({
					sublistId: 'recmachcustrecord_bbs_bl_trans_lines_parent'
				});
				
				log.audit ({
					title: 'Line Count',
					details: 'There are ' + lineCount + ' lines on this record'
				});
				
				// create a new journal record
				var journalRec = record.create ({
					type: record.Type.JOURNAL_ENTRY,
					isDynamic: true // create new record in dynamic mode
				});
				
				// set header fields on the journal record
				journalRec.setValue({
					fieldId: 'customform',
					value: 121 // 121 = Brightlime Transaction JL Entry
				});
				
				journalRec.setValue({
					fieldId: 'subsidiary',
					value: subsidiary
				});
				
				journalRec.setValue({
					fieldId: 'memo',
					value: 'Brightlime Transaction Journal'
				});
				
				journalRec.setValue({
					fieldId: 'approvalstatus',
					value: 2 // 2 = Approved
				});
				
				// loop through lineCount
				for (var i = 0; i < lineCount; i++)
					{
						// get line values from the BBS Brightlime Transactions record
						account = blTranRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_trans_lines_parent',
							fieldId: 'custrecord_bbs_bl_trans_lines_gl_code',
							line: i
						});
						
						debit = blTranRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_trans_lines_parent',
							fieldId: 'custrecord_bbs_bl_trans_lines_debit',
							line: i
						});
							
						credit = blTranRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_trans_lines_parent',
							fieldId: 'custrecord_bbs_bl_trans_lines_credit',
							line: i
						});
							
						location = blTranRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_trans_lines_parent',
							fieldId: 'custrecord_bbs_bl_trans_lines_location',
							line: i
						});
						
						// add a new line to the journal record
						journalRec.selectNewLine({
							sublistId: 'line'
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: account
						});
						
						// set the debit column on the new journal line
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'debit',
							value: debit
						});

						// set the credit column on the new journal line
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'credit',
							value: credit
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'location',
							value: location
						});
						
						journalRec.commitLine({
							sublistId: 'line'
						});

					}
				
				// submit the journal record
				var journalRec = journalRec.save();
				
				log.audit({
					title: 'Journal ' + journalRec + ' created',
					details: 'Tran rec ' + recordID + ' | Club ID ' + clubID
				});			
		}
	catch (e) // catch any errors
		{
			// log the error
			log.audit({
				title: 'An error creating a Journal for Tran rec ' + recordID + ' | Club ID ' + clubID,
				details: e
			});
		}

    }
 
    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_delete_bl_trans_lines',
    	    deploymentId: 'customdeploy_bbs_delete_bl_trans_lines'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS Delete Brightlime Trans Lines script has been scheduled. Job ID ' + mapReduceTaskID
    	});
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
