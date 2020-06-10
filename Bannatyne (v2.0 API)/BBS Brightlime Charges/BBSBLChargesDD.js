/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/task'],
function(runtime, search, record, task) {
   
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	customForm = currentScript.getParameter({
		name: 'custscript_bl_charge_journal_form'
	});
	
	defaultCreditGLAccount = currentScript.getParameter({
		name: 'custscript_bl_charge_jnl_dd_credit_gl'
	});
	
	defaultDebitGLAccount = currentScript.getParameter({
		name: 'custscript_bl_charge_jnl_dd_debit_gl'
	});
	
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
    	
    	// create search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_brightlime_charges',
    			
    		filters: [{
				name: 'isinactive',
				operator: 'is',
				values: ['F']
    		},
					{
				name: 'custrecord_bbs_bl_dd_nondd',
				operator: 'is',
				values: ['T']
			},
					{
				name: 'custrecord_bbs_bl_charges_processed',
				operator: 'is',
				values: ['F']
			}],
			
			columns: [{
				name: 'custrecord_bbs_brightlime_club_id',
				summary: 'GROUP'
			},
					{
    			name: 'internalid',
    			join: 'custrecord_bbs_bl_subsidiary1',
    			summary: 'MAX'
			},
					{
				name: 'internalid',
				join: 'custrecord_bbs_bl_location1',
				summary: 'MAX'
			},
					{
				name: 'formulacurrency',
				formula: "{custrecord_bbs_bl_amount} - {custrecord_bbs_bl_vat_amount}",
				summary: 'SUM'
			},
					{
    			name: 'formulatext',
    			formula: "REPLACE(NS_CONCAT({internalid}), ',','|')",
    			summary: 'MAX'
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
    	
    	// retrieve search results
    	var searchResults 		= JSON.parse(context.value);
    	var clubID 				= searchResults.values['GROUP(custrecord_bbs_brightlime_club_id)'].value;
    	var clubName 			= searchResults.values['GROUP(custrecord_bbs_brightlime_club_id)'].text;
    	var subsidiary 			= searchResults.values['MAX(internalid.custrecord_bbs_bl_subsidiary1)'];
    	var location 			= searchResults.values['MAX(internalid.custrecord_bbs_bl_location1)'];
    	var amount 				= searchResults.values['SUM(formulacurrency)'];
    	var blChargeRecords 	= searchResults.values['MAX(formulatext)'];
    	blChargeRecords 		= blChargeRecords.split('|'); // split on '|' as needs to be an array
    	
    	log.audit({
    		title: 'Processing Club',
    		details: 'Club ID: ' + clubID + '<br>Club Name: ' + clubName
    	});
    	
    	// call function to create a journal record. Pass context, subsidiary, location, amount and blChargeRecords
    	createJournal(context, subsidiary, location, amount, blChargeRecords);
    	
    }


    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
    	
    	// process key/value pairs
    	var key = context.key;
    	var value = context.values[0];
    	
    	try
			{
	    		// check if we have got a cash sale ID
		    	if (parseInt(value))
		    		{
			    		// update the Brightlime Charge record with the Journal ID
			    		record.submitFields({
			    			type: 'customrecord_bbs_brightlime_charges',
			    			id: key,
			    			values: {
			    				custrecord_bbs_bl_charges_processed: true,
			    				custrecord_bbs_bl_charges_journal_id: value,
			    				custrecord_bbs_bl_charges_error_messages: null
			    			}
			    		});
		    		}
		    	else // we have got an error message
		    		{
		    			// update the Brightlime Charge record with the error message
			    		record.submitFields({
				    		type: 'customrecord_bbs_brightlime_charges',
				    		id: key,
				    		values: {
				    			custrecord_bbs_bl_charges_error_messages: value
				    		}
				    	});
		    		}
	    	
		    	log.audit({
	    			title: 'Brightlime Charge Record Updated',
	    			details: key
	    		});
	    	}
		catch(e)
			{
				log.error({
					title: 'Error Updating Brightlime Charge Record',
					details: 'Record ID: ' + key + '<br>Error: ' + e
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
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }
    
    // ===================================
    // FUNCTION TO CREATE A JOURNAL RECORD
    // ===================================
    
    function createJournal(context, subsidiary, location, amount, blChargeRecords) {
    	
    	try
			{
				// create a new journal record
				var journalRec = record.create({
					type: record.Type.JOURNAL_ENTRY,
					isDynamic: true,
					defaultValues: {
						customform: customForm
					}
				});
			
				// set header fields on the journal record
				journalRec.setValue({
					fieldId: 'subsidiary',
					value: subsidiary
				});
				
				journalRec.setValue({
					fieldId: 'memo',
					value: 'Brightlime Charge Journal (DD)'
				});
				
				journalRec.setValue({
					fieldId: 'approvalstatus',
					value: 2 // Approved
				});
				
				// ===========
				// CREDIT LINE
				// ===========
			
				journalRec.selectNewLine({
					sublistId: 'line'
				});
				
				journalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'account',
					value: defaultCreditGLAccount
				});
				
				journalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'credit',
					value: amount
				});
			
				journalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'location',
					value: location
				});
			
				journalRec.commitLine({
					sublistId: 'line'
				});
				
				// ==========
				// DEBIT LINE
				// ==========
			
				journalRec.selectNewLine({
					sublistId: 'line'
				});
				
				journalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'account',
					value: defaultDebitGLAccount
				});
				
				journalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'debit',
					value: amount
				});
			
				journalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'location',
					value: location
				});
			
				journalRec.commitLine({
					sublistId: 'line'
				});
			
				// save the journal record
				var journalID = journalRec.save();
				
				log.audit({
					title: 'Journal Created',
					details: journalID
				});
				
				// loop through blChargeRecords array
				for (var i = 0; i < blChargeRecords.length; i++)
	    			{
		    			// create a new key/value pair
	    				context.write({
	    					key: blChargeRecords[i],
	    					value: journalID
	    				});
	    			}
			}
		catch(e)
			{
				log.error({
					title: 'Error Creating Journal',
					details: e
				});
				
				// loop through blChargeRecords array
				for (var i = 0; i < blChargeRecords.length; i++)
	    			{
		    			// create a new key/value pair
	    				context.write({
	    					key: blChargeRecords[i],
	    					value: e
	    				});
	    			}
			}
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
