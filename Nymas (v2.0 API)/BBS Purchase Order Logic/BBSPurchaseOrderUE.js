/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/record', 'N/search', 'N/format'],
function(format, record, search, format) {
   
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
    	
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.COPY)
			{
				// set revision number field to 1
				scriptContext.newRecord.setValue({
					fieldId: 'custbody_bbs_revision_number',
					value: 1
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
    function beforeSubmit(scriptContext) {
    	
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the value of the revision number field
    			var revisionNumber = scriptContext.newRecord.getValue({
    				fieldId: 'custbody_bbs_revision_number'
    			});
    			
    			// if we have a revision number
    			if (revisionNumber)
    				{
    					// increment the revisionNumber by 1 and set the revision number field
    					scriptContext.newRecord.setValue({
    	    				fieldId: 'custbody_bbs_revision_number',
    	    				value: ++revisionNumber
    	    			});
    				}
    			else
    				{
	    				// set revision number field to 1
	        			scriptContext.newRecord.setValue({
	        				fieldId: 'custbody_bbs_revision_number',
	        				value: 1
	        			});
    				}
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
    	try
    		{
    		

    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
			{
    			// get the form number
    			var customForm = scriptContext.newRecord.getValue({
    				fieldId: 'customform'
    			});
    			
    			// if the form in use is 111 (Nymas - Outsourced Purchase Order)
    			if (customForm == 111)
    				{
    					try
    						{
    							// reload the purchase order record
    							var purchaseOrder = record.load({
    								type: record.Type.PURCHASE_ORDER,
    								id: scriptContext.newRecord.id
    							});
    				
		    					// declare and initialize variables
		    					var itemSummary 			= new Array();
		    					var purchaseOrderSummary	= new Array();
		    					
		    					// get field values from the current record
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
								
		    					// get count of item lines on the current record
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
		    							var dueDate				= '';
		    							var finishingDrawing 	= '';
		    							var codeToBeMade 		= '';
		    							var price 				= '';
		    						
		    							// get values from the line
		    							assemblyQuantity = purchaseOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'quantity',
		    								line: i
		    							});
			    						
			    						codeToBeMade = purchaseOrder.getSublistText({
		    								sublistId: 'item',
		    								fieldId: 'assembly',
		    								line: i
		    							});
			    						
			    						workDescription = purchaseOrder.getSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'description',
		    								line: i
		    							});
			    						
			    						dueDate = purchaseOrder.getSublistValue({
			    							sublistId: 'item',
			    							fieldId: 'productionenddate',
			    							line: i
			    						});
			    						
				    					if (dueDate)
				    						{
				    							// convert to a date string
				    							dueDate = format.format({
				    								type: format.Type.DATE,
				    								value: dueDate
				    							});
				    						}
			    						
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
																				dueDate,
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
										    							var dueDate				= '';
										    							var finishingDrawing	= '';
										    							var codeToBeMade 		= '';
										    							var price 				= '';
										    							
										    							// get details about the component item
										    							itemDescription = bomRevision.getSublistValue({
		    																sublistId: 'component',
		    																fieldId: 'description',
		    																line: x
		    															});
										    							
										    							itemCode = bomRevision.getSublistText({
		    																sublistId: 'component',
		    																fieldId: 'item',
		    																line: x
		    															});
										    							
										    							componentQuantity = bomRevision.getSublistValue({
			    															sublistId: 'component',
			    															fieldId: 'quantity',
			    															line: x
			    														});
										    							
										    							// call function to get the finishing drawing
										    							finishingDrawing = getFinishingDrawing(componentItemID);
										    							
										    							// push a new instance of the output summary object into the output array
								    									itemSummary.push(new outputSummary(
								    																			itemType,
								    																			(componentQuantity * assemblyQuantity),
								    																			itemCode,
								    																			itemDescription,
								    																			workDescription,
								    																			dueDate,
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
    						
		    					// update the JSON fields on the purchase order
			    				purchaseOrder.setValue({
	    							fieldId: 'custbody_bbs_item_json',
	    							value: JSON.stringify(itemSummary)
	    						});
	    						
	    						purchaseOrder.setValue({
	    							fieldId: 'custbody_bbs_related_po_info',
	    							value: JSON.stringify(purchaseOrderSummary)
	    						});
	    						
	    						// save the changes to the purchase order
	    						purchaseOrder.save();
    						}
    					catch(e)
    						{
    							log.error({
    								title: 'Error Updating Purchase Order ' + scriptContext.newRecord.id,
    								details: e.message
    							});
    						}
    				}
			}
    		}
    	catch(e)
    		{
    		log.error({
				title: 'Unexpected error in script',
				details: e
			});
    		}
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getItemType(itemID) {
    	
    	// lookup fields on the item record
    	return search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['type']
    	}).type[0].value;
    	
    }
    
    function getFinishingDrawing(itemID) {
    	
    	// lookup fields on the item record
    	return search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['custitem_ny_drawing_number']
    	}).custitem_ny_drawing_number;
    	
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
    
    function outputSummary(itemType, quantity, itemCode, itemDescription, workDescription, dueDate, finishingDrawing, codeToBeMade, price) {
    	
    	this.itemType			=	itemType;
    	this.quantity 			= 	quantity;
    	this.itemCode			=	itemCode;
    	this.itemDescription	=	itemDescription;
    	this.workDescription	= 	workDescription;
    	this.dueDate			=	dueDate;
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
    	beforeLoad:		beforeLoad,
    	beforeSubmit: 	beforeSubmit,
    	afterSubmit:	afterSubmit
    };
    
});
