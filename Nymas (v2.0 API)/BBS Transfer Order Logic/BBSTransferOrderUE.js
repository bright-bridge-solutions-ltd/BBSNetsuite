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
				var transferOrder	= null;
				var purchaseOrder	= null;
    		
    			// get the ID of the current record
    			var transferOrderID = scriptContext.newRecord.id;
    			
    			try
    				{
    					// reload the transfer order
    					transferOrder = record.load({
    						type: record.Type.TRANSFER_ORDER,
    						id: transferOrderID
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Reloading Transfer Order ' + transferOrderID,
    						details: e.message
    					});
    					
    					transferOrder	= null;
    				}
    			
    			// if we have been able to reload the transfer order
    			if (transferOrder != null)
    				{
		    			// get the ID of the related purchase order
		    			var purchaseOrderID = transferOrder.getValue({
		    				fieldId: 'custbody_bbs_related_po'
		    			});
    			
		    			try
		    				{
		    					// load the purchase order
		    					purchaseOrder = record.load({
		    						type: record.Type.PURCHASE_ORDER,
		    						id: purchaseOrderID
		    					});
		    				}
		    			catch(e)
		    				{
			    				log.error({
		    						title: 'Error Loading Purchase Order ' + purchaseOrderID,
		    						details: e.message
		    					});
			    				
			    				purchaseOrder	= null;
		    				}
		    			
		    			// if we have been able to load the purchase order
		    			if (purchaseOrder != null)
		    				{
		    					// get count of items on the transfer order
		    					var tfrOrdLineCount = transferOrder.getLineCount({
		    						sublistId: 'item'
		    					});
		    					
		    					// get count of items on the purchase order
		    					var purOrdLineCount = purchaseOrder.getLineCount({
		    						sublistId: 'item'
		    					});
		    					
		    					// loop through transfer order lines
		    					for (var i = 0; i < tfrOrdLineCount; i++)
		    						{
		    							try
		    								{
		    							// get values from the line on the transfer order
		    							var tfrOrdItem = transferOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'item',
		    								line: i
		    							});
		    						
		    							var quantity = transferOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'quantity',
		    								line: i
		    							});
		    							
		    							var workDescription = transferOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'description',
		    								line: i
		    							});
		    							
		    							// get values from the line on the purchase order
		    							var itemID = purchaseOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'item',
		    								line: i
		    							});
		    							
		    							var itemCode = purchaseOrder.getSublistText({
		    								sublistId: 'item',
		    								fieldId: 'item',
		    								line: i
		    							});
		    							
		    							var finishingDrawing = purchaseOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'custcol_bbs_drawing_number',
		    								line: i
		    							});
		    							
		    							var codeToBeMade = purchaseOrder.getSublistText({
		    								sublistId: 'item',
		    								fieldId: 'assembly',
		    								line: i
		    							});
		    							
		    							var price = purchaseOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'rate',
		    								line: i
		    							});
		    							
		    							// call function to return the item description
		    							var itemDescription = getItemDescription(itemID);
		    							
		    							// push a new instance of the output summary object into the output array
    									itemSummary.push(new outputSummary(
    																			quantity,
    																			itemCode,
    																			itemDescription,
    																			workDescription,
    																			finishingDrawing,
    																			codeToBeMade,
    																			price
    																		)
    													);
		    								}
		    							catch(e)
		    								{
			    								log.error({
				    								title: 'Error getting item detail for transfer order id = ' + transferOrderID,
				    								details: e.message
				    							});
		    								}
		    							
		    						}
		    					
		    					try
		    						{
			    						// set the item JSON field on the transfer order and resave the record
			    						transferOrder.setValue({
				    						fieldId: 'custbody_bbs_item_json',
				    						value: JSON.stringify(itemSummary)
			    						});
			    						
			    						transferOrder.save({
			    							ignoreMandatoryFields: true
			    						});
		    						}
		    					catch(e)
		    						{
		    							log.error({
		    								title: 'Error Updating Transfer Order ' + transferOrderID,
		    								details: e.message
		    							});
		    						}
		    				}
    				}    			
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getItemDescription(itemID) {
    	
    	// lookup fields on the item record
    	return search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['purchasedescription']
    	}).purchasedescription;
    	
    }
    
    function outputSummary(quantity, itemCode, itemDescription, workDescription, finishingDrawing, codeToBeMade, price) {
    	
    	this.quantity 			= 	quantity;
    	this.itemCode			=	itemCode;
    	this.itemDescription	=	itemDescription;
    	this.workDescription	= 	workDescription;
    	this.finishingDrawing	=	finishingDrawing;
    	this.codeToBeMade		=	codeToBeMade;
    	this.price				=	price;
    	this.totalPrice			=	(quantity * price);
	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
