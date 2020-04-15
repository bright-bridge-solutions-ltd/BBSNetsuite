/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/record'],
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
    	
    	// return search of records to be processed
    	return search.create({
    		type: 'customrecord_bbs_contract_period',
    		
    		filters: [{
    			name: 'custrecord_bbs_contract_billing_type',
    			join: 'custrecord_bbs_contract_period_contract',
    			operator: 'anyof',
    			values: [7] // 7 = BUR
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_contract_bi_ann_use',
    			join: 'custrecord_bbs_contract_period_contract'
    		},
    				{
    			name: 'custrecord_bbs_contract_start_date',
    			join: 'custrecord_bbs_contract_period_contract'
    		},
    				{
    			name: 'custrecord_bbs_contract_period_start'
    		},
    				{
    			name: 'custrecord_bbs_contract_period_end'
    		},
    				{
    			name: 'custrecord_bbs_contract_period_quarter'
    		},
    				{
    			name: 'custrecord_bbs_contract_period_period'
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
    	
    	// set halfStart to false
		var halfStart = false;
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	var recordID = searchResult.id;
    	var biAnnualUsage = searchResult.values['custrecord_bbs_contract_bi_ann_use.custrecord_bbs_contract_period_contract'];
    	var contractStart = searchResult.values['custrecord_bbs_contract_start_date.custrecord_bbs_contract_period_contract'];
    	var periodStart = searchResult.values['custrecord_bbs_contract_period_start'];
    	var periodEnd = searchResult.values['custrecord_bbs_contract_period_end'];
    	var contractQuarter = searchResult.values['custrecord_bbs_contract_period_quarter'];
    	var contractPeriod = searchResult.values['custrecord_bbs_contract_period_period'];
    	
    	// divide biAnnualUsage by 6 to calculate the monthly minimum
    	var monthlyMinimum = parseFloat(biAnnualUsage / 6).toFixed(2);
    	
    	// format contractStart, periodStart and periodEnd as date objects
    	contractStart = format.parse({
    		type: format.Type.DATE,
    		value: contractStart
    	});
    	
    	periodStart = format.parse({
    		type: format.Type.DATE,
    		value: periodStart
    	});
    	
    	periodEnd = format.parse({
    		type: format.Type.DATE,
    		value: periodEnd
    	});
    	
    	// call function to calculate number of days in the periodStart month
		var daysInMonth = getDaysInMonth(periodStart.getMonth(), periodStart.getFullYear());
    	
    	// get the day of the period start
    	var periodStartDay = periodStart.getDate();
    	
    	// get the day of the period end
    	var periodEndDay = periodEnd.getDate();
		
		// check if the periodStartDay variable is not equal to 1
    	if (periodStartDay != 1)
    		{
	    		// calculate the days remaining in the month
				var daysRemaining = daysInMonth - (periodStartDay-1);
				
				// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
				var dailyMinimum = monthlyMinimum / daysInMonth;
				
				// multiply the dailyMinimum by daysRemaining to calculate the pro rata minimum usage
				monthlyMinimum = parseFloat(dailyMinimum * daysRemaining).toFixed(2);
    		}
    	// check if the periodEndDay variable is not equal to daysInMonth variable
    	else if (periodEndDay != daysInMonth)
    		{
	    		// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
				var dailyMinimum = monthlyMinimum / daysInMonth;
				
				// multiply dailyMinimum by periodEndDay to calculate the pro rata minimum usage
				monthlyMinimum = parseFloat(dailyMinimum * periodEndDay).toFixed(2);
    		}
    	
    	// check if contractQuarter is less than or equal to 2
    	if (contractQuarter <= 2)
    		{
    			// set contractHalf to 1
    			var contractHalf = 1;
    			
    			// set the end date of the contract half to be 6 months after the contract start date
    			var contractHalfEnd = new Date(contractStart.getFullYear(), contractStart.getMonth()+6, 0); // last day of the month
    		}
    	// check if contractQuarter is greater than 2
    	else if (contractQuarter > 2)
    		{
	    		// set contractHalf to 2
				var contractHalf = 2;
				
				// set the end date of the contract half to be 12 months after the contract start date
				var contractHalfEnd = new Date(contractStart.getFullYear(), contractStart.getMonth()+12, 0); // last day of the month
    		}
    	
    	// check if contractPeriod is equal to 7
    	if (contractPeriod == 7)
    		{
    			// set halfStart to true
    			halfStart = true;
    		}
    	
    	try
    		{
    			// update fields on the period detail record
    			record.submitFields({
    				type: 'customrecord_bbs_contract_period',
    				id: recordID,
    				values: {
    					custrecord_bbs_contract_period_half: contractHalf,
    					custrecord_bbs_contract_period_half_end: contractHalfEnd,
    					custrecord_bbs_contract_period_halfstart: halfStart,
    					custrecord_bbs_contract_period_min_mon: monthlyMinimum,
    					
    				}
    			});
    			
    			log.audit({
    				title: 'Period Detail Record Updated',
    				details: 'Record ID: ' + recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Period Detail Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
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
    
    //================================================
	// FUNCTION TO GET THE NUMBER OF DAYS IN THE MONTH
	//================================================   
    
    function getDaysInMonth(month, year)
	    {
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
