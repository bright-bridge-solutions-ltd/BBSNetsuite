/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/format'],
function(record, search, format) {
   
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
				var itemSummary 			= new Array();
				var purchaseOrderSummary	= new Array();
				var purchaseOrder			= null;
				var entityType				= null;
    		
    			// get the related transaction type
				var relatedTransactionType = scriptContext.newRecord.getText({
					fieldId: 'createdfrom'
				}).split(' #').shift();
				
				// if the related transaction type is a sales order
				if (relatedTransactionType == 'Sales Order')
					{
						// set the entityType to customer
						entityType = 'customer';
					}
				else if (relatedTransactionType == 'Transfer Order') // if the related transaction type is a transfer order
					{
						// set the entityType to vendor
						entityType = 'vendor';
						
						// get the ID of the transfer order
		    			var transferOrderID = scriptContext.newRecord.getValue({
		    				fieldId: 'createdfrom'
		    			});
		    			
		    			// get the ID of the related purchase order
		    			var purchaseOrderLookup = search.lookupFields({
		    				type: record.Type.TRANSFER_ORDER,
		    				id: transferOrderID,
		    				columns: ['custbody_bbs_related_po']
		    			});
		    			
		    			// if we have a purchase order linked to the transfer order
		    			if (purchaseOrderLookup.custbody_bbs_related_po.length > 0)
		    				{
		    					// get the ID of the related purchase order
		    					var purchaseOrderID = purchaseOrderLookup.custbody_bbs_related_po[0].value;
		    					
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
				    				}
				    			
				    			// if we have been able to load the purchase order
				    			if (purchaseOrder)
				    				{
				    					// get field values from the purchase order
				    					var orderDate = purchaseOrder.getValue({
				    						fieldId: 'trandate'
				    					});
				    					
				    					if (orderDate)
				    						{
				    							// convert to a date string
				    							orderDate = format.format({
				    								type: format.Type.DATE,
				    								value: orderDate
				    							});
				    						}
				    					
				    					var poNumber = purchaseOrder.getValue({
				    						fieldId: 'tranid'
				    					});
				    					
				    					var despatchDate = purchaseOrder.getValue({
				    						fieldId: 'custbody_bbs_etd'
				    					});
				    					
				    					if (despatchDate)
				    						{
				    							// convert to a date string
				    							despatchDate = format.format({
				    								type: format.Type.DATE,
				    								value: despatchDate
				    							});
				    						}
				    					
				    					var dueDate = purchaseOrder.getValue({
				    						fieldId: 'duedate'
				    					});
				    					
				    					if (dueDate)
				    						{
				    							// convert to a date string
				    							dueDate = format.format({
				    								type: format.Type.DATE,
				    								value: dueDate
				    							});
				    						}
				    					
				    					var raisedBy = purchaseOrder.getText({
				    						fieldId: 'employee'
				    					});
				    					
				    					var supplierID = purchaseOrder.getValue({
				    						fieldId: 'entity'
				    					});
				    					
				    					// call function to return supplier info
				    					var supplierInfo = getSupplierInfo(supplierID);
				    					
				    					// push a new instance of the purchase order info object into the output array
    									purchaseOrderSummary.push(new purchaseOrderInfo(
    																			orderDate,
    																			poNumber,
    																			despatchDate,
    																			dueDate,
    																			raisedBy,
    																			supplierInfo.supplierName,
    																			supplierInfo.supplierAddress,
    																			supplierInfo.supplierContact,
    																			supplierInfo.supplierPhone
    																		)
    													);
				    				
				    				
				    					// get count of item lines on the purchase order
				    					var lineCount = purchaseOrder.getLineCount({
				    						sublistId: 'item'
				    					});
				    					
				    					// loop through line count
				    					for (var i = 0; i < lineCount; i++)
				    						{
				    							// declare and initialize variables
				    							var itemType			= 'Assembly';
				    							var assemblyQuantity 	= '';
				    							var itemCode 			= '';
				    							var itemDescription 	= '';
				    							var workDescription 	= '';
				    							var finishingDrawing 	= '';
				    							var codeToBeMade 		= '';
				    							var price 				= '';
				    						
				    							// get values from the line
				    							assemblyQuantity = purchaseOrder.getSublistValue({
				    								sublistId: 'item',
				    								fieldId: 'quantity',
				    								line: i
				    							});
					    						
					    						itemCode = purchaseOrder.getSublistText({
				    								sublistId: 'item',
				    								fieldId: 'item',
				    								line: i
				    							});
					    						
					    						itemDescription = purchaseOrder.getSublistValue({
				    								sublistId: 'item',
				    								fieldId: 'description',
				    								line: i
				    							});
					    						
					    						finishingDrawing = purchaseOrder.getSublistValue({
				    								sublistId: 'item',
				    								fieldId: 'custcol_bbs_drawing_number',
				    								line: i
				    							});
					    						
					    						price = purchaseOrder.getSublistValue({
				    								sublistId: 'item',
				    								fieldId: 'rate',
				    								line: i
				    							});
				    							
				    							// push a new instance of the output summary object into the output array
		    									itemSummary.push(new outputSummary(
		    																			itemType,
		    																			assemblyQuantity,
		    																			itemCode,
		    																			itemDescription,
		    																			workDescription,
		    																			finishingDrawing,
		    																			codeToBeMade,
		    																			price
		    																		)
		    													);
		    									
		    									// get the BOM revision from the line
		    									var bomRevisionID = purchaseOrder.getSublistValue({
		    										sublistId: 'item',
		    										fieldId: 'billofmaterialsrevision',
		    										line: i
		    									});
		    									
		    									// if we have a BOM revision number
		    									if (bomRevisionID)
		    										{
		    											// declare and initialize variables
		    											var bomRevision = null;
		    											
		    											try
		    												{
		    													// load the BOM revision record
		    													bomRevision = record.load({
		    														type: record.Type.BOM_REVISION,
		    														id: bomRevisionID
		    													});
		    												}
		    											catch(e)
		    												{
		    													log.error({
		    														title: 'Error Loading BOM Revision Record ' + bomRevisionID,
		    														details: e.message
		    													});
		    												}
		    											
		    											// if we have been able to load the BOM revision record
		    											if (bomRevision)
		    												{
		    													// get count of components
		    													var components = bomRevision.getLineCount({
		    														sublistId: 'component'
		    													});
		    													
		    													// loop through components
		    													for (var x = 0; x < components; x++)
		    														{
		    															// get the item ID from the line
		    															var componentItemID = bomRevision.getSublistValue({
		    																sublistId: 'component',
		    																fieldId: 'item',
		    																line: x
		    															});
		    															
		    															// call function to get the item type
		    															var componentItemType = getItemType(componentItemID);
		    															
		    															if (componentItemType != 'OthCharge')
		    																{
			    																// declare and initialize variables
			    								    							var itemType			= 'Component';
			    								    							var componentQuantity 	= '';
			    								    							var itemCode 			= '';
			    								    							var itemDescription 	= '';
			    								    							var workDescription 	= '';
			    								    							var finishingDrawing 	= '';
			    								    							var codeToBeMade 		= '';
			    								    							var price 				= '';
			    								    							
			    								    							// get details about the component item
			    								    							workDescription = bomRevision.getSublistValue({
				    																sublistId: 'component',
				    																fieldId: 'description',
				    																line: x
				    															});
			    								    							
			    								    							codeToBeMade = bomRevision.getSublistText({
				    																sublistId: 'component',
				    																fieldId: 'item',
				    																line: x
				    															});
			    								    							
			    								    							componentQuantity = bomRevision.getSublistValue({
					    															sublistId: 'component',
					    															fieldId: 'quantity',
					    															line: x
					    														});
			    								    							
			    								    							// push a new instance of the output summary object into the output array
			    						    									itemSummary.push(new outputSummary(
			    						    																			itemType,
			    						    																			(componentQuantity * assemblyQuantity),
			    						    																			itemCode,
			    						    																			itemDescription,
			    						    																			workDescription,
			    						    																			finishingDrawing,
			    						    																			codeToBeMade,
			    						    																			price
			    						    																		)
			    						    													);
		    																}
		    														}
		    												}
		    										}
				    						}
				    				}
		    				}
					}
		    			
				// get the entity ID
				var entityID = scriptContext.newRecord.getValue({
    				fieldId: 'entity'
    			});
				
				// call function to return the account number for the vendor
				var accountNumber = getAccountNumber(entityID, entityType);
				
				// update the JSON fields on the item fulfilment
		    	record.submitFields({
					type: record.Type.ITEM_FULFILLMENT,
					id: scriptContext.newRecord.id,
					values: {
						custbody_bbs_item_json: 				JSON.stringify(itemSummary),
						custbody_bbs_related_po_info:			JSON.stringify(purchaseOrderSummary),
						custbody_bbs_customer_account_number:	accountNumber
					}
				});
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getAccountNumber(entityID, entityType) {
    	
    	// declare and initialize variables
    	var entityRecord 	= null;
    	var accountNumber	= null;
    	
    	try
    		{
    			// load the entity record
    			entityRecord = record.load({
    				type: entityType,
    				id: entityID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Loading ' + entityType + ' ' + entityID,
    				details: e.message
    			});
    		}
    	
    	// if we have been able to load the entity record
    	if (entityRecord)
    		{
    			// get the account number
    			accountNumber = entityRecord.getValue({
    				fieldId: 'accountnumber'
    			});
    		}
    	
    	// return values to the main script function
    	return accountNumber;
    	
    }
    
    function getItemType(itemID) {
    	
    	// lookup fields on the item record
    	return search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['type']
    	}).type[0].value;
    	
    }
    
    function getSupplierInfo(supplierID) {
    	
    	// declare and initialize variables
    	var supplierRecord 	= null;
    	var supplierName	= '';
    	var supplierAddress	= '';
    	var supplierContact	= '';
    	var supplierPhone	= '';
    	
    	try
    		{
    			// load the supplier record
    			supplierRecord = record.load({
    				type: record.Type.VENDOR,
    				id: supplierID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Loading Supplier ' + supplierID,
    				details: e.message
    			});
    		}
    	
    	// if we have been able to load the supplier
    	if (supplierRecord)
    		{
    			// get values from the supplier record
    			supplierName = supplierRecord.getValue({
    				fieldId: 'companyname'
    			});
    			
    			supplierAddress = supplierRecord.getValue({
    				fieldId: 'defaultaddress'
    			});
    			
    			supplierContact = supplierRecord.getText({
    				fieldId: 'contact'
    			}).split(': ').pop();
    			
    			supplierPhone = supplierRecord.getValue({
    				fieldId: 'phone'
    			});
    			
    		}
    	
    	// return values to the main script function
    	return {
    		supplierName:		supplierName,
    		supplierAddress:	supplierAddress,
    		supplierContact:	supplierContact,
    		supplierPhone:		supplierPhone
    	}
    	
    }
    
    function outputSummary(itemType, quantity, itemCode, itemDescription, workDescription, finishingDrawing, codeToBeMade, price) {
    	
    	this.itemType			=	itemType;
    	this.quantity 			= 	quantity;
    	this.itemCode			=	itemCode;
    	this.itemDescription	=	itemDescription;
    	this.workDescription	= 	workDescription;
    	this.finishingDrawing	=	finishingDrawing;
    	this.codeToBeMade		=	codeToBeMade;
    	this.price				=	price;
    	this.totalPrice			=	(quantity * price);
	
    }
    
    function purchaseOrderInfo(orderDate, poNumber, despatchDate, dueDate, raisedBy, supplier, supplierAddress, supplierContact, supplierPhone) {
    	
    	this.orderDate			= orderDate;
    	this.poNumber			= poNumber;
    	this.despatchDate		= despatchDate;
    	this.dueDate			= dueDate;
    	this.raisedBy			= raisedBy;
    	this.supplier			= supplier;
    	this.supplierAddress	= supplierAddress;
    	this.supplierContact	= supplierContact;
    	this.supplierPhone		= supplierPhone;
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
