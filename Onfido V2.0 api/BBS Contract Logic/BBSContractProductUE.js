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
			columns: ['custrecord_bbs_contract_term', 'custrecord_bbs_contract_start_date']
		});
    	
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
	        			
		    			// if the half variable is 3
	        			if (half == 3)
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

    return {
        beforeLoad: contractProductBL,
        beforeSubmit: contractProductBS,
        afterSubmit: contractProductAS
    };
    
});
