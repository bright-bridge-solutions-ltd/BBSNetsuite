/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param {serverWidget} serverWidget
 */
function(search) {
   
	/**
     * Function definition to be triggered before record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// check if the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the current record
				var currentRecord = scriptContext.newRecord;
				
				// get the transaction date
				var transactionDate = currentRecord.getValue({
					fieldId: 'trandate'
				});
				
				// get the internal ID of the location
				var locationID = currentRecord.getValue({
					fieldId: 'location'
				});
				
				// get count of item lines
				var itemCount = currentRecord.getLineCount({
					sublistId: 'item'
				});
				
				// loop through item lines
				for (var i = 0; i < itemCount; i++)
					{
						// get the value of the estimated ship date field for the line
						var estimatedShipDate = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_acc_est_ship_date',
							line: i
						});
						
						// if this line does NOT already have an estimated ship date
						if (!estimatedShipDate)
							{
								// get the internal ID of the item
								var itemID = currentRecord.getSublistValue({
									sublistId: 'item',
									fieldId: 'item',
									line: i
								});
						
								// call function to return the lead time/shipping time from the item location configuration record
								var itemLocationConfiguration = getItemLocationConfiguration(itemID, locationID);
								var leadTime = itemLocationConfiguration.leadtime;
								var shippingTime = itemLocationConfiguration.shippingtime;
								
								// calculate the estimated shipping date
								estimatedShipDate = new Date();
								estimatedShipDate.setDate(transactionDate.getDate() + leadTime);
								
								if (shippingTime > 0)
									{
										// subtract the shippingTime from the estimateShipDate
										estimatedShipDate.setDate(estimatedShipDate.getDate() - shippingTime);
									}
								
								// set the estimated shipping date field
								currentRecord.setSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_acc_est_ship_date',
									value: estimatedShipDate,
									line: i
								});
							}		
					}
    		}
    	
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================

    function getItemLocationConfiguration(itemID, locationID) {
    	
    	// declare and initialize variables
    	var leadTime = null;
    	var shippingTime = null;
    	
    	// run search to retrieve details from the item location configuration
    	search.create({
    		type: search.Type.ITEM_LOCATION_CONFIGURATION,
    		
    		filters: [{
    			name: 'item',
    			operator: search.Operator.ANYOF,
    			values: [itemID]
    		},
    				{
    			name: 'location',
    			operator: search.Operator.ANYOF,
    			values: [locationID]
    		}],
    		
    		columns: [{
    			name: 'leadtime'
    		},
    				{
    			name: 'custrecord_acc_shipping_time'
    		}],   		
    		
    	}).run().each(function(result){
    		
    		// get the lead time/shipping time from the search results
    		leadTime = result.getValue({
    			name: 'leadtime'
    		});
    		
    		shippingTime = result.getValue({
    			name: 'custrecord_acc_shipping_time'
    		});
    		
    	});
    	
    	// if we have got a lead time
    	if (leadTime)
    		{
    			// set leadTime to an integer number
    			leadTime = parseInt(leadTime);
    		}
    	else
    		{
    			// set leadTime to 0
    			leadTime = 0;
    		}
    	
    	// if we have got a shipping time
    	if (shippingTime)
    		{
    			// set shippingTime to an integer number
    			shippingTime = parseInt(shippingTime);
    		}
    	else
    		{
    			// set shippingTime to 0
    			shippingTime = 0;
    		}
    	
    	// return values to the main script function
    	return {
    		leadtime: leadTime,
    		shippingtime: shippingTime
    	}
    	
    }

    return {
    	beforeSubmit: beforeSubmit
    };
    
});