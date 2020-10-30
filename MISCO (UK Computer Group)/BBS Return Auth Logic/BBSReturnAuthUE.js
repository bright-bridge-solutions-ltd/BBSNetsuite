/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) 
	    {
    		//Only needs to work on create of a customer return
    		//
    		if(scriptContext.type == scriptContext.UserEventType.CREATE)
    			{
    				var returnRecord = scriptContext.newRecord;
    				
    				//Find the created from id
    				//
    				var returnCreatedFromId = returnRecord.getValue({fieldId: 'createdfrom'});
    				
    				//Did we get a created from?
    				//
    				if(returnCreatedFromId != null && returnCreatedFromId != '')
    					{
    						//Attempt to load the sales order
    						//
    						var salesOrderRecord = null;
    					
    						try
    							{
    								salesOrderRecord = record.load({
    																type:	record.Type.SALES_ORDER,
    																id:		returnCreatedFromId,
    																});
    							}
    						catch(err)	
    							{
    								salesOrderRecord = null;
    								
    								log.error({
												title: 		'Error loading sales order with id = ' + returnCreatedFromId,
												details: 	err
												});
    							}
    						
    						//Did we load the sales order ok?
    						//
    						if(salesOrderRecord != null)
    							{
	    							//Loop round the items in the customer return
									//
									var crLines = returnRecord.getLineCount({sublistId: 'item'});
									
									for (var int = 0; int < crLines; int++) 
	    								{
											//Get the item id & the quantity from the CR
											//
											var crLineItemId	= returnRecord.getSublistValue({
		    																					sublistId:		'item',
		    																					fieldId:		'item',
		    																					line:			int
		    																					});
											
											var crLineItemQty	= returnRecord.getSublistValue({
																								sublistId:		'item',
																								fieldId:		'quantity',
																								line:			int
																								});
	
											//Now try to find the item on the related SO
											//
											var soLineNo = salesOrderRecord.findSublistLineWithValue({
																									sublistId:	'item',
																									fieldId:	'item',
																									value:		crLineItemId
																									});

											//Did we find a match?
											//
											if(soLineNo != -1)
												{
													//If we found a match then we need to get the PO from the SO line that was matched
													//
													var soLineItemPoId	= salesOrderRecord.getSublistValue({
																										sublistId:		'item',
																										fieldId:		'poid',
																										line:			soLineNo
																										});
													
													//Make sure that we have a PO on the SO line
													//
													if(soLineItemPoId != null && soLineItemPoId != '')
														{
															//Transform the PO into a supplier return
															//
															var supplierReturnRecord = null;
															
															try
																{
																	supplierReturnRecord = record.transform({
																											fromType:		record.Type.PURCHASE_ORDER,
																											fromId:			soLineItemPoId,
																											toType:			record.Type.VENDOR_RETURN_AUTHORIZATION,
																											isDynamic:		true
																											});
																}
															catch(err)
																{
																	supplierReturnRecord = null;
																	
																	log.error({
																				title: 		'Error transforming purchase order with id = ' + soLineItemPoId,
																				details: 	err
																				});
																}
															
															//Check that we have a supplier return record to work with
															//
															if(supplierReturnRecord != null)
																{
																	var srLines = supplierReturnRecord.getLineCount({sublistId: 'item'});
																			
																	for (var int2 = srLines - 1; int2 >= 0; int2--) 
																		{
																			var srItemId = supplierReturnRecord.getSublistValue({
																																sublistId:		'item',
																																fieldId:		'item',
																																line:			int2
																																});
																			
																			//If the line item is not the one we want then delete it
																			//
																			if(srItemId != crLineItemId)
																				{
																					supplierReturnRecord.removeLine({
																													sublistId:		'item',
																													line:			int2,
																													ignoreRecalc:	false
																													});
																				}
																			else
																				{
																					//If it is the line we want, then set the quantity
																					//
																				
																					//Select the matched line
						    														//
																					supplierReturnRecord.selectLine({
								    																				sublistId:	'item',
								    																				line:		int2
								    																				});
						    													
							    													//Update the estimated extended cost
							    													//
																					supplierReturnRecord.setCurrentSublistValue({
								    																							sublistId:	'item',
								    																							fieldId:	'quantity',
								    																							value:		crLineItemQty
								    																							});
							    													
							    													//Commit the line
							    													//
																					supplierReturnRecord.commitLine({
							    																				sublistId:		'item',
							    																				ignoreRecalc:	false
							    																				});
																				}
																		}
																	
																	try
							    										{
																			supplierReturnRecord.save({
										    															enableSourcing:			true,
										    															ignoreMandatoryFields:	true
										    															});
							    										}
						    										catch(err)
						    											{
							    											log.error({
																						title: 		'Error saving supplier return',
																						details: 	err
																						});
						    											}
																}
														}
												}
	    								}
    							}
    					}
    			}
	    }

    return 	{
        	afterSubmit: afterSubmit
    		};
    
});
