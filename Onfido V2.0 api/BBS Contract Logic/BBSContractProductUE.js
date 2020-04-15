/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search', 'N/format'],
/**
 * @param {record} record
 */
function(record, search, format) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function contractProductBL(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function contractProductBS(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function contractProductAS(scriptContext) {
    	
    	// declare and initiate variables
    	var quarter = 0;
    	var half = 0;
    	var monthlyMinimum;
    	var thisMonthlyMinimum;
    	var quarterStart = false;
    	var halfStart = false;
    	
    	// get the ID of the submitted record
    	var currentRecordID = scriptContext.newRecord.id;
    	
    	// load the current record
    	var currentRecord = record.load({
    		type: 'customrecord_bbs_contract_product',
    		id: currentRecordID
    	})
    	
    	// get the value of the parent record field
    	var contractRecordID = currentRecord.getValue({
    		fieldId: 'custrecord_contract_product_parent'
    	});
    	
    	// lookup fields on the parent record
    	var contractRecordLookup = search.lookupFields({
    		type: 'customrecord_bbs_contract',
			id: contractRecordID,
			columns: ['custrecord_bbs_contract_term', 'custrecord_bbs_contract_start_date', 'custrecord_bbs_contract_billing_type', 'custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_mon_min_use', 'custrecord_bbs_contract_qu_min_use', 'custrecord_bbs_contract_bi_ann_use']
		});
    	
    	// get the billing type from the parent record
    	var billingType = contractRecordLookup.custrecord_bbs_contract_billing_type[0].value;
    	
    	// check if the billing type is 4 (AMP) or 6 (AMBMA)
    	if (billingType == '4' || billingType == '6')
    		{
    			// get the annual minimum from the parent record
    			var annualMinimum = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
    			
    			// divide annualMinimum by 12 to calculate monthlyMinimum
    			monthlyMinimum = parseFloat(annualMinimum / 12).toFixed(2);
    		}
    	// check if the billing type is 3 (QMP) or 5 (QUR)
    	else if (billingType == '3' || billingType == '5')
    		{
	    		// get the quarterly minimum from the parent record
				var qtrMinimum = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
				
				// divide qtrMinimum by 3 to calculate monthlyMinimum
    			monthlyMinimum = parseFloat(qtrMinimum / 3).toFixed(2);
    		}
    	// check if the billing type is 2 (UIOLI)
    	else if (billingType == '2')
    		{
    			// get the monthly minimum from the parent record and set the monthlyMinimum variable with this value
    			monthlyMinimum = contractRecordLookup.custrecord_bbs_contract_mon_min_use;
    		}
    	// check if the billing type is 7 (BUR)
    	else if (billingType == '7')
    		{
    			// get the minimum bi-annual usage from the contract
    			var biAnnualMinimum = contractRecordLookup.custrecord_bbs_contract_bi_ann_use;
    			
    			// divide biAnnualMinimum by 6 to calculate monthlyMinimum
    			monthlyMinimum = parseFloat(biAnnualMinimum / 6).toFixed(2);
    		}
		
		// get the contract start date from the parent record
    	var periodStartDate = contractRecordLookup.custrecord_bbs_contract_start_date;
    	
    	// format periodStartDate as a date object
    	periodStartDate = format.parse({
    		type: format.Type.DATE,
    		value: periodStartDate
    	});

    	// get the date of the period start date
    	var day = periodStartDate.getDate();
    	
    	// set periodEndDate
    	var periodEndDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), 1);
    	
    	// set quarterEndDate
    	var quarterEndDate = new Date(periodEndDate.getFullYear(), periodEndDate.getMonth()-1, 1);
    	
    	// set halfEndDate
    	var halfEndDate = new Date(periodEndDate.getFullYear(), periodEndDate.getMonth()-1, 1);
    	
    	// get the contract term from the parent record
    	var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;   	
    	contractTerm = parseInt(contractTerm); // convert to integer number
    	
    	// check if the day of the start date is greater than the 1st of the month
    	if (day > 1)
    		{
    			// increase the contractTerm variable by 1
    			contractTerm++;
    		}
 
    	// loop through contract term
    	for (var ct = 1; ct <= contractTerm; ct++)
    		{
    			// reset the thisMonthlyMinimum variable's value using the monthlyMinimum variable
    			thisMonthlyMinimum = monthlyMinimum;
    			
    			// reset the quarterStart variable to false
    			quarterStart = false;
    			
    			// reset the halfStart variable to false
    			halfStart = false;
    		
    			// create a new BBS Contract Period Detail record
    			var newRecord = record.create({
    				type: 'customrecord_bbs_contract_period'
    			});
    					
    			// set fields on the new record
    			newRecord.setValue({
    				fieldId: 'custrecord_bbs_contract_period_contract',
    				value: contractRecordID
    			});
    			
    			newRecord.setValue({
    				fieldId: 'custrecord_bbs_contract_period_parent',
    				value: currentRecordID
    			});
    					
    			newRecord.setValue({
    				fieldId: 'custrecord_bbs_contract_period_period',
    				value: ct
    			});
    			
    			// if statement to check if this is not the first contract term
    			if (ct != 1)
    				{
    					// set period start date
    					periodStartDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth()+1, 1); // 1st of the month   					
    				}
    			
    			// if this is the last contract period and and the start day is not 1
    	    	if (ct == contractTerm && day != 1)
    				{
	    				// decrease the day variable by 1
    					day--;
    							
    					// set period end date
    					periodEndDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), day);
    				}
    			else
    				{
    		    		// set period end date
    					periodEndDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth()+1, 0);
    				}
    	    	
    	    	// call function to calculate number of days in the periodStartDate month
    			var daysInMonth = getDaysInMonth(periodStartDate.getMonth(), periodStartDate.getFullYear());
    			
    			// get the day of the periodStartDate object
    	    	var periodStartDay = periodStartDate.getDate();
    	    	
    	    	// get the day of the periodEndDate object
    	    	var periodEndDay = periodEndDate.getDate();
    			
    			// check if the periodStartDay variable is not equal to 1
    	    	if (periodStartDay != 1)
    	    		{
	    	    		// calculate the days remaining in the month
						var daysRemaining = daysInMonth - (periodStartDay-1);
						
						// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
						var dailyMinimum = thisMonthlyMinimum / daysInMonth;
						
						// multiply the dailyMinimum by daysRemaining to calculate the pro rata minimum usage
						thisMonthlyMinimum = parseFloat(dailyMinimum * daysRemaining);
						thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
    	    		}
    	    	// check if the periodEndDay variable is not equal to daysInMonth variable
    	    	else if (periodEndDay != daysInMonth)
    	    		{
	    	    		// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
						var dailyMinimum = thisMonthlyMinimum / daysInMonth;
						
						// multiply thisMonthlyMinimum by periodEndDay to calculate the pro rata minimum usage
						thisMonthlyMinimum = parseFloat(dailyMinimum * periodEndDay);
						thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
    	    		}
    	    	
    	    	// set the minimum monthly usage field on the new record
    	    	newRecord.setValue({
    	    		fieldId: 'custrecord_bbs_contract_period_min_mon',
    	    		value: thisMonthlyMinimum
    	    	}); 	    	
	    				
	    		// set the start and end dates on the new record
    			newRecord.setValue({
    				fieldId: 'custrecord_bbs_contract_period_start',
    				value: periodStartDate
    			});
    					
    			newRecord.setValue({
    				fieldId: 'custrecord_bbs_contract_period_end',
    				value: periodEndDate
    			});
    			
    			// if statement to check this is the 3rd contract period and not the last contract period
    			if (ct % 3 === 1 && ct != contractTerm)
    				{	
	        			// check this is NOT the first month
    					if (ct != 1)
    						{
    							// set the value of the quarterStart variable to true
    							quarterStart = true;
    						}
    				
    					// increase quarter variable by 1
		    			quarter++;
	        			
		    			// if the quarter variable is 5
	        			if (quarter == 5)
	        				{
		        				// reset quarter variable to 1
		    					quarter = 1;
	        				}
    					
    					// increase the quarterEndDate by 3 months
	        			quarterEndDate = new Date(quarterEndDate.getFullYear(), quarterEndDate.getMonth()+4, 0); // last day of the month
    				}
    			
    			// if statement to check this is the 6th contract period and not the last contract period
    			if (ct % 6 === 1 && ct != contractTerm)
    				{
	    				// check this is NOT the first month
						if (ct != 1)
							{
								// set the value of the halfStart variable to true
								halfStart = true;
							}
					
						// increase half variable by 1
		    			half++;
	        			
		    			// if the half variable is 5
	        			if (half == 5)
	        				{
		        				// reset half variable to 1
		    					half = 1;
	        				}
						
						// increase the halfEndDate by 6 months
	        			halfEndDate = new Date(halfEndDate.getFullYear(), halfEndDate.getMonth()+7, 0); // last day of the month
    				}
	        			
	        	// set the contract quarter field on the new record
	    		newRecord.setValue({
	    			fieldId: 'custrecord_bbs_contract_period_quarter',
	    			value: quarter
	    		});
	    				
	    		// set quarter end date field on the new record using the quarter end date object
	    		newRecord.setValue({
	    			fieldId: 'custrecord_bbs_contract_period_qu_end',
	    			value: quarterEndDate
	    		});
	    		
	    		// set the contract half field on the new record
	    		newRecord.setValue({
	    			fieldId: 'custrecord_bbs_contract_period_half',
	    			value: half
	    		});
	    		
	    		// set the contract half end date field on the new record using the half end date object
	    		newRecord.setValue({
	    			fieldId: 'custrecord_bbs_contract_period_half_end',
	    			value: halfEndDate
	    		});

	    		// check if quarterStart = true
	    		if (quarterStart == true)
	    			{
	    				// tick the 'Start of New Quarter' checkbox on the new record
	    				newRecord.setValue({
	    					fieldId: 'custrecord_bbs_contract_period_qtr_start',
	    					value: true
	    				});
	    			}
	    		
	    		// check if halfStart = true
	    		if (halfStart == true)
	    			{
		    			// tick the 'Start of New Half' checkbox on the new record
	    				newRecord.setValue({
	    					fieldId: 'custrecord_bbs_contract_period_halfstart',
	    					value: true
	    				});
	    			}
    					
    			// submit the new record
    			var newRecordID = newRecord.save();
    		}
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
        beforeLoad: contractProductBL,
        beforeSubmit: contractProductBS,
        afterSubmit: contractProductAS
    };
    
});
