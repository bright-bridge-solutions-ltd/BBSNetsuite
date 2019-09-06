/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search'],
function(runtime, search) {

    function beforeSubmit(scriptContext) {
    	
    	var currentRecord = scriptContext.newRecord;
    	var currentScript = runtime.getCurrentScript();
    	
    	// retrieve script parameters
	    var priceLevel = currentScript.getParameter({
	    	name: 'custscript_ship_complete_level'
	    });
	    
	    // get the sales order subtotal from the current record
		var subtotal = currentRecord.getValue({
			fieldId: 'subtotal'
		});
		
		// get the internal ID of the customer from the current record
		var customerID = currentRecord.getValue({
			fieldId: 'entity'
		});
		
		// lookup the custentity_all_orders_part_shipped checkbox on the customer record
		var customerLookup = search.lookupFields({
			type: search.Type.CUSTOMER,
			id: customerID,
			columns: ['custentity_all_orders_part_shipped']
		});
		
		var allPartShipped = customerLookup.custentity_all_orders_part_shipped;

		// check if the subtotal variable is less than the priceLevel variable AND the allPartShipped variable returns false
		if (subtotal < priceLevel && allPartShipped == false)
			{
				// set the ship complete checkbox to true
				currentRecord.setValue({
					fieldId: 'shipcomplete',
					value: true
				});
			}
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});