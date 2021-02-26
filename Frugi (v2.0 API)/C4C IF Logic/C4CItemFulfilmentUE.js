/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) {
   
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
    			// declare and initialize variables
    			var backorderSummary = {};
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the ID of the related sales order
    			var salesOrderID = currentRecord.getValue({
    				fieldId: 'createdfrom'
    			});
    			
    			// load the sales order
    			var salesOrder = record.load({
    				type: record.Type.SALES_ORDER,
    				id: salesOrderID
    			});
    			
    			// get count of sales order lines
    			var lineCount = salesOrder.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through lines
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get values from the line
    					var itemName = salesOrder.getSublistText({
    						sublistId: 'item',
    						fieldId: 'item',
    						line: i
    					}).split(" : ").pop(); // just keep the child part no
    					
    					var itemDescription = salesOrder.getSublistValue({
    						sublistId: 'item',
    						fieldId: 'description',
    						line: i
    					});
    				
    					// get the backorder quantity for the line
    					var backorderQty = parseInt(salesOrder.getSublistValue({
    						sublistId: 'item',
    						fieldId: 'backordered',
    						line: i
    					}));
    					
    					// if we have a backorder quantity
    					if (backorderQty > 0)
    						{
	    						// build up the key for the summary
								var key = padding_left(itemName, '0', 6)
									
								// does the itemName exist in the backorder summary, if not create a new entry
								if (!backorderSummary[key])
									{
										backorderSummary[key] = new backorderSummaryObj(itemName, itemDescription);
									}
										
								// update the backorder quantity in the summary
								backorderSummary[key].backorderQty += backorderQty;
										
								// now we have done all summarising, we need to generate the output format
								var outputArray = null;
								outputArray = [];
	
								// sort outputSummary
								var sortedSummary = {};
						                  
								for (key in sortedSummary)
									{
										delete sortedSummary[key]
									}
									      
								Object.keys(backorderSummary).sort().forEach(function(key) {
									sortedSummary[key] = backorderSummary[key];
								});
									      
								// loop through the summaries
								for (var key in sortedSummary)
									{
										// push a new instance of the output summary object onto the output array
										outputArray.push(new outputSummary(
																				backorderSummary[key].itemName,
																				backorderSummary[key].description,
																				backorderSummary[key].backorderQty
																		)
														);
									}
    						}
    				    					
    				}
    			
    			// set the Items to Follow JSON field
				currentRecord.setValue({
					fieldId: 'custbody_c4c_items_to_follow',
					value: JSON.stringify(outputArray)
				});
				
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
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function backorderSummaryObj(itemName, itemDescription) {
		
    	this.itemName 		= 	itemName;
    	this.description	=	itemDescription;
		this.backorderQty	= 	0;
	}
	
    function outputSummary(itemName, itemDescription, backorderQty) {
		
    	this.itemName 		= 	itemName;
    	this.description	=	itemDescription;
		this.backorderQty	= 	backorderQty;
	}
    
    function padding_left(s, c, n)  {
		
    	if (! s || ! c || s.length >= n) 
			{
				return s;
			}
		
		var max = (n - s.length)/c.length;
		
		for (var i = 0; i < max; i++) 
			{
				s = c + s;
			}
		
		return s;
	}

    return {
        beforeSubmit: beforeSubmit
    };
    
});
