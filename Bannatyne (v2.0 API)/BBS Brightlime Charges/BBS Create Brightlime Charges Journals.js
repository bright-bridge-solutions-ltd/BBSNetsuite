/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/format', 'N/task'],
function(search, record, format, task) {
   
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
    	
    	// create search to find BBS Brightlime Charges records
    	return search.create({
			type: 'customrecord_bbs_bl_charges',
			
			columns: [{
				name: 'internalid'
			},
					{
				name: 'custrecord_bbs_bl_charges_club_id',
				sort: search.Sort.ASC,
			}],
			
			filters: [
			
			],
		});

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
    	
    	// retrieve ID of the record from the search
    	var searchResult = JSON.parse(context.value);
		var recordID = searchResult.id;
		
		try
    		{
		        // load the BBS Brightlime Charges record
				var blChargeRec = record.load ({
					type: 'customrecord_bbs_bl_charges',
					id: recordID
				});
				
				// get the club ID from the loaded record
				var clubID = blChargeRec.getValue({
					fieldId: 'custrecord_bbs_bl_charges_club_id'
				});
				
				// get the subsidiary from the loaded record
				var subsidiary = blChargeRec.getValue({
					fieldId: 'custrecord_bbs_bl_charges_subsidiary'
				});
				
				// get the date from the loaded record
				var journalDate = blChargeRec.getValue({
					fieldId: 'custrecord_bbs_bl_charges_date'
				});
				
				// format journalDate as a date object
				journalDate = format.parse({
					type: format.Type.DATE,
					value: journalDate
				});
				
				log.audit ({
					title: 'Processing Record',
					details: 'Record ID: ' + recordID + '<br>Club ID: ' + clubID + '<br>Subsidiary: ' + subsidiary
				});
				
				var lineCount = blChargeRec.getLineCount ({
					sublistId: 'recmachcustrecord_bbs_bl_charges_lines_parent'
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
					fieldId: 'trandate',
					value: journalDate
				});
				
				journalRec.setValue({
					fieldId: 'subsidiary',
					value: subsidiary
				});
				
				journalRec.setValue({
					fieldId: 'memo',
					value: 'Brightlime Charge Journal'
				});
				
				journalRec.setValue({
					fieldId: 'approvalstatus',
					value: 2 // 2 = Approved
				});
				
				// loop through lineCount
				for (var i = 0; i < lineCount; i++)
					{
						// get line values from the BBS Brightlime Charges record
						account = blChargeRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_charges_lines_parent',
							fieldId: 'custrecord_bbs_bl_charges_lines_account',
							line: i
						});
						
						debit = blChargeRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_charges_lines_parent',
							fieldId: 'custrecord_bbs_bl_charges_lines_debit',
							line: i
						});
							
						credit = blChargeRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_charges_lines_parent',
							fieldId: 'custrecord_bbs_bl_charges_lines_credit',
							line: i
						});
							
						location = blChargeRec.getSublistValue({
							sublistId: 'recmachcustrecord_bbs_bl_charges_lines_parent',
							fieldId: 'custrecord_bbs_bl_charges_lines_club',
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
					title: 'Journal Created',
					details: 'Journal Record: ' + journalRec + '<br>Charge Record: ' + recordID + '<br>Club ID: ' + clubID
				});			
		}
	catch (e) // catch any errors
		{
			// log the error
			log.error({
				title: 'An Error Occurred Creating a Journal Record',
				details: 'Charge Record: ' + recordID + '<br>Club ID: ' + clubID + '<br>Error: ' + e
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
    	    scriptId: 'customscript_bbs_delete_bl_charges_lines',
    	    deploymentId: 'customdeploy_bbs_delete_bl_charges_lines'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS Delete Brightlime Charges Lines script has been scheduled. Job ID ' + mapReduceTaskID
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
