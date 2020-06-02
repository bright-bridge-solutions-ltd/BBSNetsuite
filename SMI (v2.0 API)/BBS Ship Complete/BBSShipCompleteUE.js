/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search'],
function(runtime, search) {

    function beforeSubmit(scriptContext) {
    	
    	// check the record is being edited using inline edit
    	if (scriptContext.type != 'xedit')
    		{
		    	var currentRecord = scriptContext.newRecord;
		    	var currentScript = runtime.getCurrentScript();
		    	
		    	// validation against mapreduce scripts
		      	var executionContext = runtime.executionContext;
				
				// if executionContext returns 'MAPREDUCE'
		      	if (executionContext == 'MAPREDUCE')
		      		{
		      			return;
		      		}
		    	
		    	// retrieve script parameters
			    var priceLevel = currentScript.getParameter({
			    	name: 'custscript_ship_complete_level'
			    });
			    
			    var priceLevel2 = currentScript.getParameter({
			    	name: 'custscript_ship_complete_level_2'
			    });
			    
			    // get the sales order subtotal from the current record
				var subtotal = currentRecord.getValue({
					fieldId: 'subtotal'
				});
				
				// get the internal ID of the customer from the current record
				var customerID = currentRecord.getValue({
					fieldId: 'entity'
				});
				
				// get the order type from the current record
				var orderType = currentRecord.getValue({
					fieldId: 'custbody_bbs_salesorder_type'
				});
				
				// lookup the custentity_all_orders_part_shipped checkbox on the customer record
				var customerLookup = search.lookupFields({
					type: search.Type.CUSTOMER,
					id: customerID,
					columns: ['custentity_all_orders_part_shipped']
				});
				
				var allPartShipped = customerLookup.custentity_all_orders_part_shipped;
		
				/*
				 * if the subtotal variable is less than the priceLevel variable AND the allPartShipped variable returns false
				 * OR
				 * if the subtotal variable is greater than or equal to the priceLevel2 variable AND the orderType variable is 2 (STANDARD ORDER)
				 */
				if ((subtotal < priceLevel && allPartShipped == false) || (subtotal >= priceLevel2 && orderType == '2'))
					{
						// set the ship complete checkbox to true
						currentRecord.setValue({
							fieldId: 'shipcomplete',
							value: true
						});
					}
    		}
    }

    return {
        beforeSubmit: beforeSubmit
    };
    
});