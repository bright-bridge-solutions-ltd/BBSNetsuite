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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// declare and initialize variables
		    	var itemSummary 	= new Array();
		    	var salesOrder		= null;
		    	
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the related transaction type
				var relatedTransactionType = scriptContext.newRecord.getText({
					fieldId: 'createdfrom'
				}).split(' #').shift();
				
				// if the related transaction type is a transfer order
				if (relatedTransactionType == 'Sales Order')
					{
						// get the ID of the sales order
		    			var salesOrderID = currentRecord.getValue({
		    				fieldId: 'createdfrom'
		    			});
		    			
		    			try
		    				{
		    					// load the sales order
		    					salesOrder = record.load({
		    						type: record.Type.SALES_ORDER,
		    						id: salesOrderID
		    					});
		    					
		    				}
		    			catch(e)
		    				{
		    					log.error({
		    						title: 'Error Loading Sales Order ' + salesOrderID,
		    						details: e.message
		    					});
		    					
		    				}
		    			
		    			// if we have been able to load the sales order
		    			if (salesOrder)
		    				{
			    				// get count of items on the sales order
						    	var soItemCount = salesOrder.getLineCount({
									sublistId: 'item'
								});
		    				
		    					// get count of items on the fulfilment
						    	var itemCount = currentRecord.getLineCount({
									sublistId: 'item'
								});
				
								// loop through items
								for (var i = 0; i < itemCount; i++)
									{
										// declare and initialize variables
										var unitPrice = '';
									
										// retrieve values from the line
										var itemID = currentRecord.getSublistValue({
											sublistId: 'item',
											fieldId: 'item',
											line: i
										});
										
										var itemName = currentRecord.getSublistValue({
											sublistId: 'item',
											fieldId: 'itemname',
											line: i
										});
										
										var quantity = currentRecord.getSublistValue({
											sublistId: 'item',
											fieldId: 'quantity',
											line: i
										});
										
										var orderLine = currentRecord.getSublistValue({
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
																				itemInfo.altCode,
																				itemInfo.description,
																				itemInfo.commodityCode,
																				itemInfo.origin,
																				quantity,
																				unitPrice
																			)
														);
										
									}
		    				}
		    			
		    			// get the internal ID of the customer
    					var customerID = currentRecord.getValue({
    						fieldId: 'entity'
    					});
    					
    					// call function to return the account number for the customer
    					var accountNumber = getAccountNumber(customerID);
		    			
		    			// update fields on the item fulfilment record
		    			record.submitFields({
							type: record.Type.ITEM_FULFILLMENT,
							id: currentRecord.id,
							values: {
								custbody_bbs_item_json:			JSON.stringify(itemSummary),
								custbody_bbs_account_number:	accountNumber
							}
						});
		    			
					}
    		}
    }

    return {
        afterSubmit: afterSubmit
    };
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getAccountNumber(customerID) {
    	
    	// declare and initialize variables
    	var customerRecord 	= null;
    	var accountNumber	= null;
    	
    	try
    		{
    			// load the customer record
    			customerRecord = record.load({
    				type: record.Type.CUSTOMER,
    				id: customerID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Loading Customer ' + customerID,
    				details: e.message
    			});
    		}
    	
    	// if we have been able to load the customer record
    	if (customerRecord)
    		{
    			// get the account number
    			accountNumber = customerRecord.getValue({
    				fieldId: 'accountnumber'
    			});
    		}
    	
    	// return values to the main script function
    	return accountNumber;
    	
    }
    
    function getItemInfo(itemID) {
    	
    	// lookup fields on the item record
    	var itemLookup = search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['displayname', 'vendorname', 'custitem_commodity_code', 'countryofmanufacture']
    	});
    	
    	var description		= itemLookup.displayname;
    	var altCode			= itemLookup.vendorname;
    	var commodityCode 	= itemLookup.custitem_commodity_code;
    	var origin			= itemLookup.countryofmanufacture;
    	
    	// return values to the main script function
    	return {
    		description:	description,
    		altCode:		altCode,
    		commodityCode:	commodityCode,
    		origin:			origin
    	}
    	
    	
    }
    
    function outputSummary(stockCode, altCode, description, commodityCode, origin, quantity, unitPrice, lineValue) {
    	
    	this.stockCode			=	stockCode;
    	this.altCode 			= 	altCode;
    	this.description		=	description;
    	this.commodityCode		=	commodityCode;
    	this.origin				= 	origin;
    	this.quantity			=	quantity;
    	this.unitPrice			=	unitPrice;
    	this.lineValue			=	(quantity * unitPrice);
	
    }
    
});
