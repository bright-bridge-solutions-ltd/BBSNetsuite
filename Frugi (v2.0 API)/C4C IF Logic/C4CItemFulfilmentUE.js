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
    	
    	// check the the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// declare and initialize variables
				var itemSummary = {};
    		
    			// get the current record
    			var itemFulfilment = scriptContext.newRecord;
    			
    			// load the related sales order
    			var salesOrder = record.load({
    				type: record.Type.SALES_ORDER,
    				id: itemFulfilment.getValue({
        				fieldId: 'createdfrom'
        			}),
        			isDynamic: true
    			});
    			
    			// get count of item fulfilment lines
    			var lineCount = itemFulfilment.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// get count of sales order lines
    			var soLineCount = salesOrder.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through item fulfilment lines
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the order line number
    					var orderLine = itemFulfilment.getSublistValue({
    						sublistId: 'item',
    						fieldId: 'orderline',
    						line: i
    					});
    					
    					// loop through the sales order lines
    					for (var x = 0; x < soLineCount; x++)
    						{
    							// get the line number
    							var line = salesOrder.getSublistValue({
    								sublistId: 'item',
    								fieldId: 'line',
    								line: x
    							});
    							
    							if (orderLine == line)
    								{
    									// get line values from the item fulfilment
    									var item = itemFulfilment.getSublistValue({
    										sublistId: 'item',
    										fieldId: 'itemname',
    										line: i
    									});
    									
    									var description = itemFulfilment.getSublistValue({
    										sublistId: 'item',
    										fieldId: 'itemdescription',
    										line: i
    									});
    								
    									var quantity = itemFulfilment.getSublistValue({
    										sublistId: 'item',
    										fieldId: 'quantity',
    										line: i
    									});
    									
    									// get line values from the sales order
    									var rate = salesOrder.getSublistValue({
    	    								sublistId: 'item',
    	    								fieldId: 'rate',
    	    								line: x
    	    							});
    									
    									var soLineQuantity = salesOrder.getSublistValue({
    	    								sublistId: 'item',
    	    								fieldId: 'quantity',
    	    								line: x
    	    							});
    									
    									var taxAmount = ((salesOrder.getSublistValue({
    	    								sublistId: 'item',
    	    								fieldId: 'tax1amt',
    	    								line: x
    	    							}) / soLineQuantity) * quantity);
    									
    									// build up the key for the summary
    									var key = padding_left(item, '0', 6)
    										
    									// create a new itemSummary object
    									itemSummary[key] = new itemSummaryObj(item, description, quantity, rate, taxAmount);
    									
    									// now we have done all summarising, we need to generate the output format
    									var outputArray = null;
    									outputArray = [];
    		
    									// sort outputSummary
    									var sortedSummary = {};
    							                  
    									for (key in sortedSummary)
    										{
    											delete sortedSummary[key]
    										}
    										      
    									Object.keys(itemSummary).sort().forEach(function(key) {
    										sortedSummary[key] = itemSummary[key];
    									});
    										      
    									// loop through the summaries
    									for (var key in sortedSummary)
    										{
    											// push a new instance of the output summary object onto the output array
    											outputArray.push(new outputSummary(
    																					itemSummary[key].item,
    																					itemSummary[key].description,
    																					itemSummary[key].quantity,
    																					itemSummary[key].rate,
    																					itemSummary[key].netAmount,
    																					itemSummary[key].taxAmount,
    																					itemSummary[key].grossAmount
    																			)
    															);
    										}
    								
    									// break the loop
    									break;
    								}
    						}
    				}
    			
    			// set the item JSON field
				record.submitFields({
					type: record.Type.ITEM_FULFILLMENT,
					id: itemFulfilment.id,
					values: {
						custbody_c4c_item_json: JSON.stringify(outputArray)
					}
				});

    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function itemSummaryObj(item, description, quantity, rate, taxAmount) {
    	
    	this.item 			= 	item;
    	this.description	=	description;
    	this.quantity		=	quantity;
    	this.rate			= 	rate;
    	this.netAmount		=	quantity * rate;
    	this.taxAmount		=	taxAmount;
    	this.grossAmount	=	(quantity * rate) + taxAmount;
	
    }
	
    function outputSummary(item, description, quantity, rate, netAmount, taxAmount, grossAmount) {
    	
    	this.item 			= 	item;
    	this.description	=	description;
    	this.quantity		=	quantity;
    	this.rate			= 	rate;
    	this.netAmount		=	netAmount;
    	this.taxAmount		=	taxAmount;
    	this.grossAmount	=	grossAmount;
	
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
        afterSubmit: afterSubmit
    };
    
});
