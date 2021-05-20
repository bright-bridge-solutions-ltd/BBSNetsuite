/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search) {
	
	// set transaction date
	transactionDate = new Date();
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	cloverCashControlBFL = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_control_bfl'
	});
		
	cloverCashControlBF2L = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_control_bf2l'
	});
		
	cloverCashControlBHL = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_control_bhl'
	});
	
	cloverProcessingDate = currentScript.getParameter({
		name: 'custscript_bbs_clover_processing_date'
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
    	
    	// search for locations to be processed
    	return search.create({
    		type: 'customrecord_bbs_clover_refunds',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_refund_date',
    			operator: 'on',
    			values: ['yesterday']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_refund_location',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_refund_subsidiary',
    			summary: 'GROUP'
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
    	
    	// process search result
    	var searchResult 	= JSON.parse(context.value);
    	var locationName 	= searchResult.values["GROUP(custrecord_bbs_refund_location)"].text;
    	var locationID		= searchResult.values["GROUP(custrecord_bbs_refund_location)"].value;
    	var subsidiaryName	= searchResult.values["GROUP(custrecord_bbs_refund_subsidiary)"].text;
    	var subsidiaryID	= searchResult.values["GROUP(custrecord_bbs_refund_subsidiary)"].value;
    	
    	log.audit({
    		title: 'Processing Location',
    		details: locationName + '(' + locationID + ')'
    	});
    	
    	// call function to create a new journal. Pass subsidiaryID, locationName and locationID
    	createJournal(subsidiaryID, locationName, locationID);
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
    
    // =======================================
    // FUNCTION TO CREATE A NEW JOURNAL RECORD
    // =======================================
    
    function createJournal(subsidiaryID, locationName, locationID) {
    	
    	// declare and initialize variables
    	var totalCreditAmount = 0;
    	
    	try
    		{
    			// create a new journal record
    			var journalRecord = record.create({
    				type: record.Type.JOURNAL_ENTRY,
    				isDynamic: true
    			});
    			
    			// set fields on the record
    			journalRecord.setValue({
    				fieldId: 'subsidiary',
    				value: subsidiaryID
    			});
    			
    			journalRecord.setValue({
    				fieldId: 'trandate',
    				value: transactionDate
    			});
    			
    			journalRecord.setValue({
    				fieldId: 'memo',
    				value: 'Clover Refund Journal for ' + locationName
    			});
    			
    			journalRecord.setValue({
    				fieldId: 'approvalstatus',
    				value: 2 // Approved
    			});
    			
    			// call function to return Clover Refund lines for this club
    			searchCloverRefundLines(locationID).each(function(result){
    				
    				// retrieve search results
    				var account = result.getValue({
    					name: 'custrecord_bbs_clovepayment_account',
    					join: 'custrecord_bbs_refund_payment_id',
    					summary: 'GROUP'
    				});
    				
    				var amount = parseFloat(result.getValue({
    					name: 'custrecord_bbs_refund_amount',
    					summary: 'SUM'
    				}));
    				
    				try
    					{
		    				// add a new line to the journal
		    				journalRecord.selectNewLine({
		    					sublistId: 'line'
		    				});
		    				
		    				journalRecord.setCurrentSublistValue({
		    					sublistId: 'line',
		    					fieldId: 'account',
		    					value: account
		    				});
		    				
		    				journalRecord.setCurrentSublistValue({
		    	    			sublistId: 'line',
		    	    			fieldId: 'debit',
		    					value: amount
		    				});
		    				
		    				journalRecord.setCurrentSublistValue({
		    	    			sublistId: 'line',
		    	    			fieldId: 'memo',
		    					value: 'Clover Refund Journal for ' + locationName
		    				});
		    				
		    				journalRecord.setCurrentSublistValue({
		    					sublistId: 'line',
		    					fieldId: 'location',
		    					value: locationID
		    				});
		    				
		    				journalRecord.commitLine({
		    					sublistId: 'line'
		    				});
		    				
		    				// add the amount to the totalCreditAmount
		    				totalCreditAmount += amount;
    					}
    				catch(e)
    					{
    						log.error({
    							title: 'Error Adding Debit Line',
    							details: e
    						});
    					}
    				
    				// continue processing search results
    				return true;
    				
    			});
    			
    			// add a line to the journal to subtract balances from the control account
    			journalRecord.selectNewLine({
    				sublistId: 'line'
    			});
    			
    			journalRecord.setCurrentSublistValue({
    				sublistId: 'line',
    				fieldId: 'account',
    				value: getPostingAccount(subsidiaryID) // call function to return the posting account. Pass subsdiaryID
    			});
    			
    			journalRecord.setCurrentSublistValue({
    				sublistId: 'line',
    				fieldId: 'credit',
    				value: totalCreditAmount.toFixed(2) // round to 2 decimal places
    			});
    			
    			journalRecord.setCurrentSublistValue({
    				sublistId: 'line',
    				fieldId: 'memo',
    				value: 'Clover Refund Journal for ' + locationName
    			});
    			
    			journalRecord.setCurrentSublistValue({
					sublistId: 'line',
					fieldId: 'location',
					value: locationID
				});
    			
    			journalRecord.commitLine({
    				sublistId: 'line'
    			});
    			
    			// save the journal record
    			var journalID = journalRecord.save();
    			
    			log.audit({
    	    		title: 'Journal Created',
    	    		details: journalID
    	    	});
    			
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Journal Record for ' + locationName,
    				details: e
    			});
    		}
    	
    }    
    
    // ======================================
    // FUNCTION TO RETURN CLOVER REFUND LINES
    // ======================================
    
    function searchCloverRefundLines(locationID) {
    	
    	return search.create({
    		type: 'customrecord_bbs_clover_refunds',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_refund_location',
    			operator: 'anyof',
    			values: [locationID]
    		},
    				{
    			name: 'custrecord_bbs_refund_date',
    			operator: 'on',
    			values: ['yesterday']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_clovepayment_account',
				join: 'custrecord_bbs_refund_payment_id',
				summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_refund_amount',
    			summary: 'SUM'
    		}],
    		
    	}).run();
    	
    }
    
    // ===================================
    // FUNCTION TO GET THE POSTING ACCOUNT
    // ===================================
    
    function getPostingAccount(subsidiaryID) {
    	
    	// declare and initialize variables
    	var postingAccount = null;
    	
    	// if subsidiaryID is 4 (Bannatyne Fitness Ltd)
    	if (subsidiaryID == 4)
    		{
    			// set the postingAccount using the cloverCashControlBFL script parameter
    			postingAccount = cloverCashControlBFL;
    		}
    	else if (subsidiaryID == 5) // if subsidiaryID is 5 (Bannatyne Fitness (2) Ltd)
			{
	    		// set the postingAccount using the cloverCashControlBF2L script parameter
				postingAccount = cloverCashControlBF2L;
			}
    	else if (subsidiaryID == 6) // if subsidiaryID is 6 (Bannatyne Hotels Ltd)
    		{
	    		// set the postingAccount using the cloverCashControlBHL script parameter
				postingAccount = cloverCashControlBHL;
    		}
    	
    	return postingAccount;
    	
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
