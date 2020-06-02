/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, format, record) {
   
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
    		type: 'customrecord_bbs_contract',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_contract_status',
    			operator: 'anyof',
    			values: [1] // 1 = Approved
    		},
    				{
    			name: 'custrecord_bbs_contract_billing_type',
    			operator: 'anyof',
    			values: [2, 6] // 2 = UIOLI, 6 = AMBMA
    		},
    				{
    			name: 'internalid',
    			operator: 'noneof',
    			values: [22] // already created for this record
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_contract_start_date'
    		},
    				{
    			name: 'custrecord_bbs_contract_end_date'
    		},
    				{
    			name: 'custrecord_bbs_contract_term'
    		},
    				{
    			name: 'formulacurrency',
    			formula: "ROUND(CASE WHEN {custrecord_bbs_contract_billing_type} = 'AMBMA' THEN {custrecord_bbs_contract_min_ann_use} / 12 ELSE CASE WHEN {custrecord_bbs_contract_billing_type} = 'UIOLI' THEN {custrecord_bbs_contract_mon_min_use} END END,2)"
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
    	var searchResult = JSON.parse(context.value);
    	
    	var contractID 		= searchResult.id;
    	var startDate 		= searchResult.values["custrecord_bbs_contract_start_date"];
    	var endDate 		= searchResult.values["custrecord_bbs_contract_end_date"];
    	var contractTerm 	= searchResult.values["custrecord_bbs_contract_term"];
    	var monthlyMinimum	= searchResult.values["formulacurrency"];
    	
    	log.audit({
    		title: 'Processing Contract',
    		details: 'Contract ID: ' + contractID + '<br>Start Date: ' + startDate + '<br>End Date: ' + endDate + '<br>Contract Term: ' + contractTerm + ' Months<br>Monthly Minimum: ' + monthlyMinimum
    	});
    	
    	// call function to create minimum usage records
    	createMinimumUsageRecords(contractID, startDate, endDate, contractTerm, monthlyMinimum);
    	
    	log.audit({
    		title: 'Minimum Usage Records Created',
    		details: 'Contract ID: ' + contractID
    	});
    	
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
    		title: '*** SCRIPT COMPLETE ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }
    
    // ========================================
    // FUNCTION TO CREATE MINIMUM USAGE RECORDS
    // ========================================
    
    function createMinimumUsageRecords(contractID, startDate, endDate, contractTerm, monthlyMinimum) {
    	
    	// format startDate/endDate as date objects
    	startDate = format.parse({
    		type: format.Type.DATE,
    		value: startDate
    	});
    	
    	endDate = format.parse({
    		type: format.Type.DATE,
    		value: endDate
    	});
    	
    	// get the day of the start/end dates
		var startDay = startDate.getDate();
		var endDay = endDate.getDate();
		
		// check if startDay is not 1 (IE contract starts mid month)
		if (startDay != 1)
			{
				// increase contractTerm by 1
				contractTerm++;
			}
		
		// loop through contract term
    	for (var ct = 1; ct <= contractTerm; ct++)
    		{
	    		// reset the thisMonthlyMinimum variable's value using the monthlyMinimum variable
    			var thisMonthlyMinimum = monthlyMinimum;
    		
    			// check if this is the first month and the startDay is not equal to 1
    			if (ct == 1 && startDay != 1)
    				{
	    				// call function to calculate number of days in the startDate month
	        			var daysInMonth = getDaysInMonth(startDate.getMonth(), startDate.getFullYear());
    				
    					// calculate the days remaining in the month
						var daysRemaining = daysInMonth - (startDay-1);
						
						// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
						var dailyMinimum = thisMonthlyMinimum / daysInMonth;
						
						// multiply the dailyMinimum by daysRemaining to calculate the pro rata minimum usage
						thisMonthlyMinimum = parseFloat(dailyMinimum * daysRemaining);
						thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
    				}
    			else if (ct == contractTerm) // else if this is the last month
    				{
	    				// call function to calculate number of days in the endDate month
	        			var daysInMonth = getDaysInMonth(endDate.getMonth(), endDate.getFullYear());
	        			
	        			// check if this is not the last day in the month
	        			if (endDay != daysInMonth)
	        				{
		    					// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
								var dailyMinimum = thisMonthlyMinimum / daysInMonth;
								
								// multiply the dailyMinimum by the endDay to calculate the pro rata minimum usage
								thisMonthlyMinimum = parseFloat(dailyMinimum * endDay);
								thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
	        				}
    				}
    			
    			try
    				{
		    			// create a new Contract Minimum Usage record
		    			var contractMinUsageRecord = record.create({
		    				type: 'customrecord_bbs_contract_minimum_usage'
		    			});
		    			
		    			// set fields on the record
		    			contractMinUsageRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_min_usage_parent',
		    				value: contractID
		    			});
		    			
		    			contractMinUsageRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_min_usage_month',
		    				value: ct
		    			});
		    			
		    			contractMinUsageRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_min_usage',
		    				value: thisMonthlyMinimum
		    			});
		    			
		    			// submit the new Contract Minimum Usage record
		    			contractMinUsageRecord.save();
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Creating Minimum Usage Record',
    						details: e
    					});
    				}
    		}
    		
    }
    
    //================================================
	// FUNCTION TO GET THE NUMBER OF DAYS IN THE MONTH
	//================================================   
    
    function getDaysInMonth(month, year) {
    	
    	// day 0 is the last day in the current month
    	return new Date(year, month+1, 0).getDate(); // return the last day of the month
    
    }    

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
