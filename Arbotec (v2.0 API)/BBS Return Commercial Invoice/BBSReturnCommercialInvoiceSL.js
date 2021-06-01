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
    	
    	// declare and initialize variables
    	var salesOrder		 = '';
    	var salesRepInitials = '';
    	
    	// retrieve parameters that were passed from the client script
		var returnAuthID = parseInt(context.request.parameters.return);
		
		// load the RA record
		var returnAuthorization = record.load({
			type: record.Type.RETURN_AUTHORIZATION,
			id: returnAuthID
		});
		
		// retrieve details from the RA record
		var salesOrderID = returnAuthorization.getValue({
			fieldId: 'createdfrom'
		});
		
		var subsidiaryID = returnAuthorization.getValue({
			fieldId: 'subsidiary'
		});
		
		var customerID = returnAuthorization.getValue({
			fieldId: 'entity'
		});
		
		if (salesOrderID)
			{
				// load the sales order record
				salesOrder = record.load({
					type: record.Type.SALES_ORDER,
					id: salesOrderID
				});
				
				// retrieve details from the sales order record
				var salesRepID = salesOrder.getValue({
					fieldId: 'salesrep'
				});
						
				// call function to get the sales rep's initials
				salesRepInitials = getSalesRepInitials(salesRepID);
			}
		
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
		
		// set the sales rep initials field on the RA record
		returnAuthorization.setValue({
			fieldId: 'sales_rep_initials',
			value: salesRepInitials
		});
		
		// call function to generate the item JSON
		var itemJSON = generateItemJSON(returnAuthorization);
		
		// set the item JSON field on the RA record
		returnAuthorization.setValue({
			fieldId: 'item_json',
			value: JSON.stringify(itemJSON)
		});
		
		// render the transaction file
		var renderer = render.create();
		renderer.setTemplateById(120);
		renderer.addRecord({templateName: 'record', record: returnAuthorization});
		renderer.addRecord({templateName: 'subsidiary', record: subsidiary});
		renderer.addRecord({templateName: 'customer', record: customer});
		
		if (salesOrder)
			{
				renderer.addRecord({templateName: 'salesorder', record: salesOrder});
			}
		
		// create the PDF file
		var commercialInvoice = renderer.renderAsPdf();
		commercialInvoice.name = "Return Commercial Invoice " + returnAuthID + ".pdf";
		
		// return the file to the browser
		context.response.writeFile({
			file: commercialInvoice,
			isInline: true
		});

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function generateItemJSON(returnAuthorization) {
    	
    	// declare and initialize variables
    	var itemSummary 	= new Array();
	
		// get count of items on the RA
    	var itemCount = returnAuthorization.getLineCount({
			sublistId: 'item'
		});

		// loop through items
		for (var i = 0; i < itemCount; i++)
			{
				// retrieve values from the line
				var itemID = returnAuthorization.getSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: i
				});
				
				var itemName = returnAuthorization.getSublistText({
					sublistId: 'item',
					fieldId: 'item',
					line: i
				});
				
				var quantity = returnAuthorization.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: i
				});
				
				var unitPrice = returnAuthorization.getSublistValue({
					sublistId: 'item',
					fieldId: 'rate',
					line: i
				});
				
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
