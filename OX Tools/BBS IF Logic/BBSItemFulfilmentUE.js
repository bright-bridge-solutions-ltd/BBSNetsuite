/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    	
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the subsidiary ID
    			var subsidiaryID = currentRecord.getValue({
    				fieldId: 'subsidiary'
    			});
    			
    			// if the subsidiary is 12 (Ox Tools UK)
    			if (subsidiaryID == 12)
    				{
    					// get the created from record type
    					var createdFromType = currentRecord.getText({
    						fieldId: 'createdfrom'
    					}).split(' #').shift(); // keep characters before the # symbol
    					
    					// if the fulfilment is related to a sales order
    					if (createdFromType == 'Sales Order')
    						{
    							// get the internal ID of the customer
    							var customerID = currentRecord.getValue({
    								fieldId: 'entity'
    							});
    							
    							// call function to return the customer's backorder requirement
    	    					var backOrderRequirement = getBackorderRequirement(customerID);
    	    					
    	    					// if the customer is set to Ox Policy
    	    					if (backOrderRequirement == 1)
    	    						{
	    	    						// get the internal ID of the related sales order
		    							var salesOrderID = currentRecord.getValue({
		    								fieldId: 'createdfrom'
		    							});
		    							
		    							// set the 'Ship Complete' flag on the sales order
		    							record.submitFields({
		    								type: record.Type.SALES_ORDER,
		    								id: salesOrderID,
		    								values: {
		    									shipcomplete: true
		    								}
		    							});
    	    						}
    						}
    				}
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getBackorderRequirement(customerID) {
    	
    	// declare and intialize variables
    	var backOrderRequirement = null;
    	
    	// lookup fields on the customer record
    	var customerLookup = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['custentity_bbs_cust_backorder_req']
    	});
    	
    	// if we have a backorder requirement on the customer
    	if (customerLookup.custentity_bbs_cust_backorder_req.length > 0)
    		{
    			// get the value of the backorder requirement
    			backOrderRequirement = customerLookup.custentity_bbs_cust_backorder_req[0].value;
    		}
    	
    	// return values to main script function
    	return backOrderRequirement;
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
