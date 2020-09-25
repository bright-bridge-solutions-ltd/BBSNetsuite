/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format'],
function(runtime, search, record, format) {
	
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
	
	// format journalDate as a date
	formattedDate = format.format({
		type: format.Type.DATE,
		value: journalDate
	});
	
	memo = 'Brightlime Charge Summary for ' + formattedDate;
   
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
    			name: 'custrecord_bbs_bl_charge_date',
    			operator: 'on',
    			values: ['1/9/2020']
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
    	var clubID 			= searchResult.values['GROUP(custrecord_bbs_brightlime_club_id)'];
    	var location 		= searchResult.values['MAX(internalid.custrecord_bbs_bl_location1)'];
    	var subsidiary 		= searchResult.values['MAX(internalid.custrecord_bbs_bl_subsidiary1)'];
    	
    	log.audit({
    		title: 'Processing Club',
    		details: 'Club ID: ' + clubID + '<br>Location: ' + location + '<br>Subsidiary: ' + subsidiary
    	});
    	
    	// call function to create a new journal record. Pass subsidiary, location and clubID
    	createJournal(subsidiary, location, clubID);
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
    
    // ===================================
    // FUNCTION TO CREATE A JOURNAL RECORD
    // ===================================
    
    function createJournal(subsidiary, location, clubID) {
    	
    	// declare/initialize variables
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
    	    	searchBLChargeLines(clubID).each(function(result) {
    	    		
    	    		// retrieve search results
    	    		var glAccountID = result.getValue({
    	    			name: 'formulatext',
    	    			summary: 'GROUP'
    	    		});
    	    		
    	    		var lineOfBusiness = result.getValue({
    	    			name: 'custrecord_bl_charges_line_of_business',
    	    			summary: 'GROUP'
    	    		});
    	    		
    	    		var amount = parseFloat(result.getValue({
    	    			name: 'formulacurrency',
    	    			summary: 'SUM'
    	    		}));
    	    		
    	    		try
    	    			{
	    	    			// ===========
		    	    		// CREDIT LINE
		    	    		// ===========
		    	    		
		    	    		journalRec.selectNewLine({
		    	    			sublistId: 'line'
		    	    		});
		    	    		
		    	    		// check if we have a glAccountID
		    	    		if (glAccountID != '- None -')
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
		    	    		
		    	    		journalRec.setCurrentSublistValue({
		    	    			sublistId: 'line',
		    	    			fieldId: 'class',
		    	    			value: lineOfBusiness
		    	    		});
		    	    		
		    	    		journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'memo',
    							value: memo
    						});
		    	    		
		    	    		journalRec.commitLine({
		    	    			sublistId: 'line'
		    	    		});
				    		
				    		// add the amount to the totalDebitAmount variable
				    		totalDebitAmount += amount;
				    		
    	    			}
    	    		catch(e)
    	    			{
    	    				log.error({
	    	    				title: 'Error Adding Credit Line',
	    	    				details: e
	    	    			});
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
	    		
	    		journalRec.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'memo',
					value: memo
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
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Journal',
    				details: e
    			});
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
        			name: 'custrecord_bbs_bl_charge_date',
        			operator: 'on',
        			values: ['1/9/2020']
        		},
        				{
        			name: 'custrecord_bbs_brightlime_club_id',
        			operator: 'is',
        			values: [clubID]
        		}],
        		
        		columns: [{
        			name: 'formulatext',
        			formula: "CASE WHEN {custrecord_bbs_bl_dd_nondd} = 'T' THEN '" + defaultCreditGLAccount + "' ELSE {custrecord_bbs_bl_gl_account_id} END",
        			summary: 'GROUP'
        		},
        				{
        			name: 'custrecord_bl_charges_line_of_business',
        			summary: 'GROUP'
        		},
        				{
        			name: 'formulacurrency',
        			formula: "{custrecord_bbs_bl_amount} - {custrecord_bbs_bl_vat_amount}",
        			summary: 'SUM'
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
