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
    	var product;
    	var newRecord;
    	var newRecordID;
    	var contractStartDate = new Date();
    	var contractEndDate = new Date();
    	var quarterEndDate = new Date();
    	var quarter = 0;
    	var nextMonth = 0;
      	var month = 0;
      	var year = 0;
    	
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
			columns: ['custrecord_bbs_contract_term','custrecord_bbs_contract_start_date']
		});
		
		// get the start date from the parent record
    	var startDate = contractRecordLookup.custrecord_bbs_contract_start_date;
    	
    	// format startDate as a date object
    	startDate = format.parse({
    		type: format.Type.DATE,
    		value: startDate
    	});
    	
    	log.debug({
    		title: 'Start Date',
    		details: startDate
    	});
    	
    	// split the start date into date parts which can later be used to construct dates
		var dd = startDate.getDate();
		var mm = startDate.getMonth();
		month = mm; // set value of month variable
		var yy = startDate.getFullYear();
    	
    	// get the contract term from the parent record
    	var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;   	
    	contractTerm = parseInt(contractTerm); // convert to integer number
    	
    	// check if the day of the start date is greater than the 1st of the month
    	if (dd > 1)
    		{
    			// increase the contractTerm variable by 1
    			contractTerm++;
    		}
 
    	// loop through contract term
    	for (var ct = 1; ct <= contractTerm; ct++)
    		{
    			// create a new BBS Contract Period Detail record
    			newRecord = record.create({
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
    			
    			// if statement to check if this is the first contract term
    			if (ct == 1)
    				{
    					// set contract start date
    					contractStartDate.setMonth(mm);
    					contractStartDate.setDate(dd);
    					contractStartDate.setFullYear(yy);
    					
    					// add one to the month variable to make it the following month
	    				nextMonth = mm+1;
	    				
	    				// set contract end date
	    				contractEndDate.setMonth(nextMonth);
	    				contractEndDate.setDate(0); // last day of month
	    				contractEndDate.setFullYear(yy);
    				
	    				// set the start and end dates on the new record
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_start',
    						value: contractStartDate
    					});
    					
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_end',
    						value: contractEndDate
    					});
    				}
    			else
    				{
    					// increase the mm variable by 1
    					mm++;
    					
    					// set contact start date
    					contractStartDate.setMonth(mm);
    					contractStartDate.setDate(1); // 1st of the month
    					contractStartDate.setFullYear(yy);
    					
    					// if this is the last contract period and and the start day is not 1
    	    			if (ct == contractTerm && dd != 1)
    						{
	    						// decrease the dd variable by 1
    							dd--;
    							
    							// calculate the contract end date
	    	    				contractEndDate.setMonth(nextMonth);
	    	    				contractEndDate.setDate(dd);
	    	    				contractEndDate.setFullYear(yy);
    						}
    					else
    						{
	    						// set end date
	    	    				nextMonth = mm+1; // add one to the mm variable to make it the following month
	    	    				
	    	    				// calculate the contract end date
	    	    				contractEndDate.setMonth(nextMonth);
	    	    				contractEndDate.setDate(0); // last day of month
	    	    				contractEndDate.setFullYear(yy);
    						}
	    				
	    				// set the start and end dates on the new record
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_start',
    						value: contractStartDate
    					});
    					
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_end',
    						value: contractEndDate
    					});
	    				
    				}
    			
    			// if statement to check this is the 3rd contract period and not the last contract period
    			if (ct % 3 === 1 && ct != contractTerm)
    				{	
	        			// increase quarter variable by 1
		    			quarter++;
	        			
		    			// if the quarter variable is 5
	        			if (quarter == 5)
	        				{
		        				// reset quarter variable to 1
		    					quarter = 1;
	        				}
    					
    					// add 3 months to the month variable
    					month = month+3;
    				}
    			
    			// calculate the quarter end date
	    		quarterEndDate.setMonth(month);
	    		quarterEndDate.setDate(0); // last day of month
	    		quarterEndDate.setFullYear(yy);
	        			
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
    					
    			// submit the new record
    			newRecordID = newRecord.save();
    		}
    }

    return {
        beforeLoad: contractProductBL,
        beforeSubmit: contractProductBS,
        afterSubmit: contractProductAS
    };
    
});
