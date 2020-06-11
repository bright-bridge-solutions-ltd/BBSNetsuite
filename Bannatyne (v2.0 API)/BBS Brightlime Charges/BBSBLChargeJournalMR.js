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
		name: 'custscript_bl_charge_jnl_credit_gl'
	});
	
	defaultDebitGLAccount = currentScript.getParameter({
		name: 'custscript_bl_charge_jnl_debit_gl'
	});
	
	// set the date of the journal
	journalDate = new Date();
	journalDate = new Date(journalDate.getFullYear(), journalDate.getMonth(), journalDate.getDate() - 1); // Yesterday
   
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
    	
    	// create search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_brightlime_charges',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_bl_charges_processed',
    			operator: 'is',
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_brightlime_club_id',
    			summary: 'GROUP',
    			sort: search.Sort.ASC
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_bl_location1',
    			summary: 'MAX'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_bl_subsidiary1',
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
    	var searchResult 	= JSON.parse(context.value);
    	var clubID 			= searchResult.values['GROUP(custrecord_bbs_brightlime_club_id)'].value;
    	var clubName		= searchResult.values['GROUP(custrecord_bbs_brightlime_club_id)'].text;
    	var location 		= searchResult.values['MAX(internalid.custrecord_bbs_bl_location1)'];
    	var subsidiary 		= searchResult.values['MAX(internalid.custrecord_bbs_bl_subsidiary1)'];
    	
    	log.audit({
    		title: 'Processing Club',
    		details: 'Club ID: ' + clubID + '<br>Club Name: ' + clubName + '<br>Location: ' + location + '<br>Subsidiary: ' + subsidiary
    	});
    	
    	// call function to create a new journal record. Pass context, subsidiary, location and clubID
    	createJournal(context, subsidiary, location, clubID);
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
	    	
		    	/*log.audit({
	    			title: 'Brightlime Charge Record Updated',
	    			details: key
	    		});*/
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
    
    function createJournal(context, subsidiary, location, clubID) {
    	
    	// declare new array to hold IDs of processed BL Charge records
    	var processedRecords = new Array();
    	var totalDebitAmount = 0;
    	
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
    			
    			// set header fields on the new journal record
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
    				value: 2 // Approved
    			});
    			
    			// call function to create/run search to find BrightLime Charge lines for this club
    	    	var brightlimeChargeLines = searchBLChargeLines(clubID);
    	    	
    	    	// process results
    	    	brightlimeChargeLines.each(function(result) {
    	    		
    	    		// retrieve search results
    	    		var glAccountID = result.getValue({
    	    			name: 'formulatext',
    	    			summary: 'GROUP'
    	    		});
    	    		
    	    		var amount = result.getValue({
    	    			name: 'formulacurrency',
    	    			summary: 'SUM'
    	    		});
    	    		
    	    		amount = parseFloat(amount); // convert to floating point number
    	    		
    	    		var blChargeRecords = result.getValue({
    	    			name: 'formulatext',
    	    			summary: 'MAX'
    	    		});
    	    		
    	    		blChargeRecords = blChargeRecords.split('|'); // split on '|' as needs to be an array
    	    		
    	    		try
    	    			{
	    	    			// ===========
		    	    		// CREDIT LINE
		    	    		// ===========
		    	    		
		    	    		journalRec.selectNewLine({
		    	    			sublistId: 'line'
		    	    		});
		    	    		
		    	    		// check if we have a glAccountID
		    	    		if (glAccountID)
		    	    			{
		    	    				// set account on the new journal line using the glAccountID
		    	    				journalRec.setCurrentSublistValue({
		    	    					sublistId: 'line',
		    	    					fieldId: 'account',
		    	    					value: glAccountID
		    	    				});
		    	    			}
		    	    		else
		    	    			{
		    	    				// set the account on the new journal line using the default
			    	    			journalRec.setCurrentSublistValue({
			    	    				sublistId: 'line',
			    	    				fieldId: 'account',
				    					value: defaultCreditGLAccount
				    				});
		    	    			}
		    	    		
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
		    	    		
		    	    		// loop through blChargeRecords array
				    		for (var i = 0; i < blChargeRecords.length; i++)
				    			{
				    				processedRecords.push(blChargeRecords[i]); // Push to processedRecords array
				    			}
				    		
				    		// add the amount to the totalDebitAmount variable
				    		totalDebitAmount += amount;
				    		
    	    			}
    	    		catch(e)
    	    			{
    	    				log.error({
	    	    				title: 'Error Adding Credit Line',
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
	    	    		
	    	    		// continue processing search results
	    	    		return true;
	    	    		
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
					value: totalDebitAmount.toFixed(2) // round to 2 decimal places
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
    	    	
    	    	// loop through processedRecords array
	    		for (var i = 0; i < processedRecords.length; i++)
	    			{
		    			// create a new key/value pair
	    				context.write({
	    					key: processedRecords[i],
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
    			
    			// loop through processedRecords array
	    		for (var i = 0; i < processedRecords.length; i++)
	    			{
		    			// create a new key/value pair
	    				context.write({
	    					key: processedRecords[i],
	    					value: e
	    				});
	    			}
    		}   	
    }
    
    // ==============================================
    // FUNCTION TO SEARCH FOR BRIGHTLIME CHARGE LINES
    // ==============================================
    
    function searchBLChargeLines(clubID) {
    		return search.create({
    			type: 'customrecord_bbs_brightlime_charges',
    			
    			filters: [{
        			name: 'isinactive',
        			operator: 'is',
        			values: ['F']
        		},
        				{
        			name: 'custrecord_bbs_bl_charges_processed',
        			operator: 'is',
        			values: ['F']
        		},
        				{
        			name: 'custrecord_bbs_brightlime_club_id',
        			operator: 'anyof',
        			values: [clubID]
        		}],
        		
        		columns: [{
        			name: 'formulatext',
        			formula: "CASE WHEN {custrecord_bbs_bl_dd_nondd} = 'T' THEN '" + defaultCreditGLAccount + "' ELSE {custrecord_bbs_bl_gl_account_id} END",
        			summary: 'GROUP'
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
    			
    		}).run();
    	}

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
