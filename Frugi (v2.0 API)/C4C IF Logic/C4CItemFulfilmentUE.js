/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
function(record, search) {
   
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
				var itemSummary = new Array();
				var total = 0;
    		
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
	    								var itemID = itemFulfilment.getSublistValue({
											sublistId: 'item',
											fieldId: 'item',
											line: i
										});
    								
    									var item = itemFulfilment.getSublistValue({
    										sublistId: 'item',
    										fieldId: 'itemname',
    										line: i
    									});
    									
    									// call function to get the size from the item record
    									var size = getItemSize(itemID);
    									
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
    									
    									// add the gross amount to the total variable
    									total += (rate * quantity) + taxAmount;
    									
    									// push a new instance of the output summary object onto the output array
    									itemSummary.push(new outputSummary(
    																			item,
    																			description,
    																			size,
    																			quantity,
    																			rate,
    																			taxAmount
    																		)
    													);
    								
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
						custbody_c4c_item_json: JSON.stringify(itemSummary),
						custbody_c4c_if_total: total
					}
				});

    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getItemSize(itemID) {
    	
    	var itemSize = '';
    	
    	var itemLookup = search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['custitem_c4c_size']
    	});
    	
    	if (itemLookup.custitem_c4c_size.length > 0)
    		{
    			itemSize = itemLookup.custitem_c4c_size[0].text;
    		}
    	
    	return itemSize;
    	
    }
    
    function outputSummary(item, description,size, quantity, rate, taxAmount) {
    	
    	this.item 			= 	item;
    	this.description	=	description;
    	this.size			=	size;
    	this.quantity		=	quantity;
    	this.rate			= 	rate;
    	this.netAmount		=	(rate * quantity);
    	this.taxAmount		=	taxAmount;
    	this.grossAmount	=	(rate * quantity) + taxAmount;
	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
