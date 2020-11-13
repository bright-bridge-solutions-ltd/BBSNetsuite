/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search'],
function(runtime, search) {
   
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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the current script
		    	var currentScript = runtime.getCurrentScript();
		    	
		    	// retrieve script parameters
			    var orderValue = currentScript.getParameter({
			    	name: 'custscript_free_items_ue_order_value'
			    });
			    
			    // get the internal ID of the customer from the current record
			    var customerID = currentRecord.getValue({
			    	fieldId: 'entity'
			    });
			    
			    // lookup fields on the customer record
			    var customerLookup = search.lookupFields({
			    	type: search.Type.CUSTOMER,
					id: customerID,
					columns: ['custentity_bb_want_fudge']
				});
			    
			    // get value of 'wants free gift' checkbox from the customer lookup
			    var freeGift = customerLookup.custentity_bb_want_fudge;
			    
			    log.debug({
			    	title: 'Free Gift',
			    	details: freeGift
			    });
			    
			    // get the sales order total from the current record
				var total = currentRecord.getValue({
					fieldId: 'total'
				});
				
				log.debug({
					title: 'SO Total',
					details: total
				});
				
				// check if the freeGift variable returns true and the total variable is greater than 250
				if (freeGift == true && total >= 250)
					{
						// tick the 'Wants Free Gift' checkbox
						currentRecord.setValue({
							fieldId: 'custbody_bb_want_fudge',
							value: true
						});
					}
				else if (total < 250) // if the total variable is less than 250
					{
						// untick the 'Wants Free Gift' checkbox
						currentRecord.setValue({
							fieldId: 'custbody_bb_want_fudge',
							value: false
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
