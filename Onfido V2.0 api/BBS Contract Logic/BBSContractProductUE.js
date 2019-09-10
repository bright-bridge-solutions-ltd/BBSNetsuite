/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search'],
/**
 * @param {record} record
 */
function(record,search) {
   
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
    	var nextMonth = 0;
      	var month = 0;
      	var year = 0;
    	
    	// get the ID of the submitted record
    	var currentRecordID = scriptContext.newRecord.id;
    	
    	log.debug({
    		title: 'Current Record ID',
    		details: currentRecordID
    	});
    	
    	// load the current record
    	var currentRecord = record.load({
    		type: 'customrecord_bbs_contract_product',
    		id: currentRecordID
    	})
    	
    	// get the value of the parent record field
    	var contractRecordID = currentRecord.getValue({
    		fieldId: 'custrecord_contract_product_parent'
    	});
    	
    	log.debug({
    		title: 'Contract Record ID',
    		details: contractRecordID
    	});
    	
    	// lookup fields on the parent record
    	var contractRecordLookup = search.lookupFields({
    		type: 'customrecord_bbs_contract',
			id: contractRecordID,
			columns: ['custrecord_bbs_contract_term','custrecord_bbs_contract_start_date']
		});
		
		// get the start date from the parent record
    	var startDate = contractRecordLookup.custrecord_bbs_contract_start_date;
    	
    	// split the start date into date parts which can later be used to construct dates
		var dateSplit = startDate.split('/');
		var dd = dateSplit[0];
		dd = parseInt(dd); // convert to integer number
		var mm = dateSplit[1];
		mm = parseInt(mm); // convert to integer number
		month = parseInt(mm); // set value of month variable
		var yy = dateSplit[2];
		yy = parseInt(yy); // convert to integer number
    	
    	// get the contract term from the parent record
    	var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;   	
    	contractTerm = parseInt(contractTerm); // convert to integer number
    	
    	log.debug({
    		title: 'Contract Term',
    		details: contractTerm
    	});
    	
    	// check if the day of the start day is greater than the 1st of the month
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
    					// set startDate and endDate variables
	    				contractStartDate = new Date(mm + '/' + dd + '/' + yy);
	    				
	    				nextMonth = mm+1; // add one to the month variable to make it the following month
	    				contractEndDate = new Date(nextMonth + '/' + 0 + '/' + yy); // last day of month
    				
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
    					// increase the mm variable
    					mm++;
    					
    					log.debug({
    						title: 'Line ' + ct,
    						details: mm
    					});
    					
    					// set startDate and endDate variables
    					contractStartDate = new Date(mm + '/' + dd + '/' + yy);
	    				
	    				nextMonth = mm+1; // add one to the month variable to make it the following month
	    				contractEndDate = new Date(nextMonth + '/' + 0 + '/' + yy); // last day of month
	    				
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
    			
    			// if statement to check if the contract term is between 1 and 3
    			if (ct >=1 && ct <= 3)
    				{
    					// set the contract quarter field on the new record to quarter 1
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_quarter',
    						value: 1
    					});

    					// calculate the quarter end date
    					quarterEndDate = new Date(month+3 + '/' + 0 + '/' + yy);
    					
    					// set quarter end date field on the new record using the quarter end date object
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_qu_end',
    						value: quarterEndDate
    					});  					
    				}
    			else if (ct >=4 && ct <= 6) // else if the contract term is between 4 and 6
    				{
	    				// set the contract quarter field on the new record to quarter 2
						newRecord.setValue({
							fieldId: 'custrecord_bbs_contract_period_quarter',
							value: 2
						});
		
    					quarterEndDate = new Date(month+6 + '/' + 0 + '/' + yy);
    					
    					// set quarter end date field on the new record using the quarter end date object
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_qu_end',
    						value: quarterEndDate
    					});
    				}
    			else if (ct >=7 && ct <= 9) // else if the contract term is between 7 and 9
    				{
	    				// set the contract quarter field on the new record to quarter 3
						newRecord.setValue({
							fieldId: 'custrecord_bbs_contract_period_quarter',
							value: 3
						});

    					quarterEndDate = new Date(month+9 + '/' + 0 + '/' + yy);
    					
    					// set quarter end date field on the new record using the quarter end date object
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_qu_end',
    						value: quarterEndDate
    					});
    				}
    			else if (ct >=10 && ct <= 12) // else if the contract term is between 10 and 12
    				{
	    				// set the contract quarter field on the new record to quarter 4
						newRecord.setValue({
							fieldId: 'custrecord_bbs_contract_period_quarter',
							value: 4
						});

    					quarterEndDate = new Date(month+12 + '/' + 0 + '/' + yy);
    					
    					// set quarter end date field on the new record using the quarter end date object
    					newRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_period_qu_end',
    						value: quarterEndDate
    					});
    				}
    					
    			// submit the new record
    			newRecordID = newRecord.save();
    					
    			log.debug({
    				title: 'New Record Saved',
    				details: newRecordID
    			});
    		}
    }

    return {
        beforeLoad: contractProductBL,
        beforeSubmit: contractProductBS,
        afterSubmit: contractProductAS
    };
    
});
