/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/format'],
function(format) {

    function beforeSubmit(scriptContext) {

    	// initialize variables
    	var days;
    	var shippingDate = new Date();
    	
    	// load the current record so it can be manipulated
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the internal ID of the customform field
        var customForm = currentRecord.getValue({
        	fieldId: 'customform'
        });
        		
        // check if the customForm variable returns 103 (SMI Standard Sales Order)
        if (customForm == 103)
        	{
        		// set value of days variable
        		days = 4;				
        	}
        		
        // check if the customForm variable returns 123 (SMI Manpack Sales Order)
        else if (customForm == 123)
        	{
        		// set value of days variable
    			days = 5;	
        	}
        		
        // call addWorkDays function and pass shippingDate object and days variable to the function
		shippingDate = addWorkDays(shippingDate, days);
        		
        // set the shipdate field on the record
        currentRecord.setValue({
        	fieldId: 'shipdate',
        	value: shippingDate
        });
    }
    
    function addWorkDays(shippingDate, days) 
    	{
    		// modifies date by adding days, excluding sat and sun
    		for (days; days; days--)
    			{
    				// add a day
    				shippingDate.setDate(shippingDate.getDate() + 1);

    				// if a weekend, keep adding until not
    				while(!(shippingDate.getDay()%6)) 
    					{
    						shippingDate.setDate(shippingDate.getDate() + 1);
    					}
    			}
    	  
			return shippingDate;
    	}


    return {
        beforeSubmit: beforeSubmit
    };
    
});