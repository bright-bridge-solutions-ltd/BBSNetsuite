/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/record', 'N/search'],
function(render, record, search) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// retrieve parameters that were passed from the client script
		var fulfilmentID = parseInt(context.request.parameters.fulfilment);
		
		// load the item fulfilment record
		var itemFulfilment = record.load({
			type: record.Type.ITEM_FULFILLMENT,
			id: fulfilmentID
		});
		
		// retrieve details from the fulfilment record
		var salesOrderID = itemFulfilment.getValue({
			fieldId: 'createdfrom'
		});
		
		var subsidiaryID = itemFulfilment.getValue({
			fieldId: 'subsidiary'
		});
		
		var customerID = itemFulfilment.getValue({
			fieldId: 'entity'
		});
		
		// load the sales order record
		var salesOrder = record.load({
			type: record.Type.SALES_ORDER,
			id: salesOrderID
		});
		
		// retrieve details from the fulfilment record
		var salesRepID = salesOrder.getValue({
			fieldId: 'salesrep'
		});
		
		// load the subsidiary record
		var subsidiary = record.load({
			type: record.Type.SUBSIDIARY,
			id: subsidiaryID
		});
		
		// load the customer record
		var customer = record.load({
			type: record.Type.CUSTOMER,
			id: customerID
		});
		
		// call function to get the sales rep's initials
		var salesRepInitials = getSalesRepInitials(salesRepID);
		
		// set the sales rep initials field on the IF record
		itemFulfilment.setValue({
			fieldId: 'sales_rep_initials',
			value: salesRepInitials
		});
		
		// call function to generate the item JSON
		var itemJSON = generateItemJSON(itemFulfilment, salesOrder);
		
		// set the item JSON field on the IF record
		itemFulfilment.setValue({
			fieldId: 'item_json',
			value: JSON.stringify(itemJSON)
		});
		
		// render the transaction file
		var renderer = render.create();
		renderer.setTemplateById(110);
		renderer.addRecord({templateName: 'record', record: itemFulfilment});
		renderer.addRecord({templateName: 'salesorder', record: salesOrder});
		renderer.addRecord({templateName: 'subsidiary', record: subsidiary});
		renderer.addRecord({templateName: 'customer', record: customer});
		
		// create the PDF file
		var commercialInvoice = renderer.renderAsPdf();
		commercialInvoice.name = "Commercial Invoice " + fulfilmentID + ".pdf";
		
		// return the file to the browser
		context.response.writeFile({
			file: commercialInvoice,
			isInline: true
		});

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function generateItemJSON(itemFulfilment, salesOrder) {
    	
    	// declare and initialize variables
    	var itemSummary 	= new Array();
    	
    	// get count of items on the sales order
    	var soItemCount = salesOrder.getLineCount({
			sublistId: 'item'
		});
	
		// get count of items on the fulfilment
    	var itemCount = itemFulfilment.getLineCount({
			sublistId: 'item'
		});

		// loop through items
		for (var i = 0; i < itemCount; i++)
			{
				// declare and initialize variables
				var unitPrice = '';
			
				// retrieve values from the line
				var itemID = itemFulfilment.getSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: i
				});
				
				var itemName = itemFulfilment.getSublistValue({
					sublistId: 'item',
					fieldId: 'itemname',
					line: i
				});
				
				var quantity = itemFulfilment.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: i
				});
				
				var orderLine = itemFulfilment.getSublistValue({
					sublistId: 'item',
					fieldId: 'orderline',
					line: i
				});
				
				// loop through sales order items
				for (var x = 0; x < soItemCount; x++)
					{
						// get the line number
						var line = salesOrder.getSublistValue({
							sublistId: 'item',
							fieldId: 'line',
							line: x
						});
						
						if (line == orderLine)
							{
								// get the unit price from the sales order line
								unitPrice = salesOrder.getSublistValue({
									sublistId: 'item',
									fieldId: 'rate',
									line: x
								});
								
								break;
							}
					}
				
				// call function to lookup fields on the item record
				var itemInfo = getItemInfo(itemID);
				
				// push a new instance of the output summary object into the output array
				itemSummary.push(new outputSummary(
														itemName,
														itemInfo.description,
														itemInfo.commodityCode,
														itemInfo.origin,
														itemInfo.category,
														quantity,
														unitPrice
													)
								);
				
			}
		
		// return values to the main script function
		return itemSummary;
    	
    }
    
    function getSalesRepInitials(employeeID) {
    	
    	// declare and initialize variables
    	var employeeInitials 	= null;
    	var employeeRecord		= null;
    	
    	if (employeeID)
			{
		    	try
		    		{
		    			// load the employee record
		    			employeeRecord = record.load({
		    				type: record.Type.EMPLOYEE,
		    				id: employeeID
		    			});
		    			
		    			// if we have been able to load the employee record
		    			if (employeeRecord)
		    				{
		    					// get the employee's initials
		    					employeeInitials = employeeRecord.getValue({
		    						fieldId: 'initials'
		    					});
		    				}
		    		}
		    	catch(e)
		    		{
		    			log.error({
		    				title: 'Error Loading Employee ' + employeeID,
		    				details: e.message
		    			});
		    		}
			}
    	
    	// return values to main script function
    	return employeeInitials;
    	
    }
    
    function getItemInfo(itemID) {
    	
    	// declare and initialize variables
    	var category = '';
    	
    	// lookup fields on the item record
    	var itemLookup = search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['displayname', 'custitem_commodity_code', 'countryofmanufacture', 'class']
    	});
    	
    	var description		= itemLookup.displayname;
    	var commodityCode 	= itemLookup.custitem_commodity_code;
    	var origin			= itemLookup.countryofmanufacture;
    	
    	if (itemLookup.class.length > 0)
    		{
    			category = itemLookup.class[0].text;
    		}
    	
    	// return values to the main script function
    	return {
    		description:	description,
    		commodityCode:	commodityCode,
    		category:		category,
    		origin:			origin
    	}
    	
    }
    
    function outputSummary(stockCode, description, commodityCode, origin, category, quantity, unitPrice, lineValue) {
    	
    	this.stockCode			=	stockCode;
    	this.description		=	description;
    	this.commodityCode		=	commodityCode;
    	this.origin				= 	origin;
    	this.category			=	category;
    	this.quantity			=	quantity;
    	this.unitPrice			=	unitPrice;
    	this.lineValue			=	(quantity * unitPrice);
	
    }

    return {
        onRequest: onRequest
    };
    
});
