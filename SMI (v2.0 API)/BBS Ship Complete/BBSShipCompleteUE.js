/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime'],
function(runtime) {

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

		// check if the subtotal variable is less than the priceLevel variable
		if (subtotal < priceLevel)
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