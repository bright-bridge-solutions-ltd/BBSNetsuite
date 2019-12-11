/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/format'],
function(runtime, search, format) {

    function beforeSubmit(scriptContext) {
    	
    	// initialize variables
		var days;
		
		// get the current script so parameters can be retrieved
		var currentScript = runtime.getCurrentScript();
		    	
		// load the current record so it can be manipulated
		var currentRecord = scriptContext.newRecord;
		
		// get the value of the customform field
		var customForm = currentRecord.getValue({
			fieldId: 'customform'
		});
		    	
		// get the customer from the record
		var customerId = currentRecord.getValue({
			fieldId: 'entity'
		});
		
		// get the transaction date from the record
		var shippingDate = currentRecord.getValue({
			fieldId: 'trandate'
		});
		
		// format shippingDate as a date object
		shippingDate = format.parse({
			type: format.Type.DATE,
			value: shippingDate
		});
		
		// lookup fields on the customer record
		var customerLookup = search.lookupFields({
			type: search.Type.CUSTOMER,
			id: customerId,
			columns: ['custentity_bbs_override_ship_date_logic', 'custentity_bbs_override_ship_standard', 'custentity_bbs_override_ship_manpack']
		});
		
		// retrieve values from the customerLookup object
		var overrideShipDateLogic = customerLookup.custentity_bbs_override_ship_date_logic;
		var overrideStandard = customerLookup.custentity_bbs_override_ship_standard;
		var overrideManpack = customerLookup.custentity_bbs_override_ship_manpack;
		
		// if the overrideShipDateLogic variable returns true
		if (overrideShipDateLogic == true)
			{
				// check if the customForm variable returns 103 (SMI Standard Sales Order)
				if (customForm == 103)
					{
						// set the value of the days variable using the overrideStandard variable
						days = overrideStandard;
					}
				// if the customForm variable returns 123 (SMI Manpack Sales Order)
				else if (customForm == 123)
					{
						// set the value of the days variable using the overrideManpack variable
						days = overrideManpack;
					}
			}
		else // overrideShipDateLogic variable returns false
			{
				// check if the customForm variable returns 103 (SMI Standard Sales Order)
				if (customForm == 103)
					{
				    	// set value of days variable. This is a script parameter
				    	days = currentScript.getParameter({
				    		name: 'custscript_bbs_smi_std_so_ship_date'
				    	});
					}
				// if the customForm variable returns 123 (SMI Manpack Sales Order)
				else if (customForm == 123)
					{
					    // set value of days variable. This is a script parameter
				        days = currentScript.getParameter({
				        	name: 'custscript_bbs_smi_manpack_so_ship_date'
				        });
					}
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