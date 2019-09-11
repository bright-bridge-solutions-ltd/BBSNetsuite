/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
function() {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

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
    function beforeSubmit(scriptContext) {
    
    	// initialize variables
    	var taxCode;
    	
    	// get the new record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the value of the currency field from the record
    	var currency = currentRecord.getValue({
    		fieldId: 'currency'
    	});
    	
    	// if statement to check the currency variable does not return 1 (GBP)
    	if (currency != 1)
    		{
	    		// get a count of item lines on the record
	        	var lineCount = currentRecord.getLineCount({
	        		sublistId: 'item'
	        	});
	        	
	        	// if the currency is 2 (USD)
	        	if (currency == 2)
	        		{
	        			// set the taxCode variable to 8 (T0 Zero rate)
	        			taxCode = 8;
	        		}
	        	// if the currency is 4 (EUR) or 5 (PLN)
	        	else if (currency == 4 || currency == 5)
	        		{
	        			// set the taxCode variable to 14 (T8 EU Purchases)
	        			taxCode = 14;
	        		}
	        	
	        	// loop through line count
	        	for (var x = 0; x < lineCount; x++)
	        		{
		        		// set the tax code line field using the taxCode variable
		    			currentRecord.setSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'taxcode',
		    				value: taxCode,
		    				line: x
		    			});
	        		}
    		}
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
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
