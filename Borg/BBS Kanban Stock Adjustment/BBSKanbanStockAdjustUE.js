/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jan 2021     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function bin2binTransferAS(type)
{
	//Function to check for a bin to bin transfer that transfers to a bin that is marked as 'Auto Stock Adjust'
	//If true, then stock adjust the value transfered to that bin back out so that there is no net change
	//
	if(type == 'create')
		{
			//Get the bin to bin transfer record
			//
			var bin2binRecord = nlapiGetNewRecord();
	
			//Get the count of lines, the subsidiary & the location
			//
			var lineCount 		= bin2binRecord.getLineItemCount('inventory');
			var b2bSubsidiary	= bin2binRecord.getFieldValue('subsidiary');
			var b2bLocation		= bin2binRecord.getFieldValue('location');
			
			//Loop through the lines
			//
			for (var lineNo = 1; lineNo <= lineCount; lineNo++) 
				{
					//Get the item & the inventorydetail subrecord
					//
					var lineItem 		= bin2binRecord.getLineItemValue('inventory', 'item', lineNo);
					var lineInvDetail	= bin2binRecord.viewLineItemSubrecord('inventory', 'inventorydetail', lineNo);
					
					//Did we get the inventorydetail subrecord?
					//
					if(lineInvDetail != null)
						{
							//Get the count of lines in the subrecord
							//
							var invDetailLineCount = lineInvDetail.getLineItemCount('inventoryassignment');
							
							//Get the unit from the inventory detail record
							//
							var invDetailUnit = lineInvDetail.getFieldValue('unit');
							
							//Loop through the lines in the inventorydetail subrecord
							//
							for (var detailLineNo = 1; detailLineNo <= invDetailLineCount; detailLineNo++) 
								{
									//Get the from & to bins & the quantity
									//
									var detailToBin		= lineInvDetail.getLineItemValue('inventoryassignment', 'tobinnumber', detailLineNo);		//The bin we are moving to
									var detailQuantity	= lineInvDetail.getLineItemValue('inventoryassignment', 'quantity', detailLineNo);			//The quantity we are moving
									var detailStatus	= lineInvDetail.getLineItemValue('inventoryassignment', 'toinventorystatus', detailLineNo);	//The inventory status that we are moving to
									
									//Lookup the 'to' bin to see if we need to do any work
									//
									var toBinInfo 		= nlapiLookupField('bin', detailToBin, ['custrecord_bbs_auto_stock_adjust','custrecord_bbs_auto_stock_adjust_acc'], false);
									var toBinAutoAdjust	= toBinInfo.custrecord_bbs_auto_stock_adjust;
									var toBinAccount	= toBinInfo.custrecord_bbs_auto_stock_adjust_acc;
									
									//See if we have to do an adjustment (auto adjust is ticked & we have a GL account assigned
									//
									if(toBinAutoAdjust == 'T' && toBinAccount != '' && toBinAccount != null)
										{
											var stockAdjustRecord = null;
										
											//Create a stock adjustment
											//
											try
												{
													stockAdjustRecord = nlapiCreateRecord('inventoryadjustment', {recordmode: 'dynamic'});
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error creating stock adjustment', err.message);
													stockAdjustRecord = null;
												}
											
											//Did we create a new stock adjustment record?
											//
											if(stockAdjustRecord != null)
												{
													//Set the subsidiary & the GL account
													//
													stockAdjustRecord.setFieldValue('subsidiary', b2bSubsidiary);
													stockAdjustRecord.setFieldValue('account', toBinAccount);
													
													try
														{
															var adjustQuantity = Number(detailQuantity) * -1.0;
														
															//Add a line to the inventory sublist on the stock adjustment record
															//
															stockAdjustRecord.selectNewLineItem('inventory');
															
															stockAdjustRecord.setCurrentLineItemValue('inventory', 'item', lineItem);				//Set the item
															stockAdjustRecord.setCurrentLineItemValue('inventory', 'location', b2bLocation);		//Set the location
															stockAdjustRecord.setCurrentLineItemValue('inventory', 'units', invDetailUnit);			//Set the units
															stockAdjustRecord.setCurrentLineItemValue('inventory', 'adjustqtyby', adjustQuantity);	//Set the quantity
															
															//Add the inventorydetail subrecord
															//
															var adjustInvDetailRecord = stockAdjustRecord.createCurrentLineItemSubrecord('inventory', 'inventorydetail');
															
															//Add a line to the inventoryassignment sublist on the inventorydetail subrecord
															//
															adjustInvDetailRecord.selectNewLineItem('inventoryassignment');
															
															//Set values
															//
															adjustInvDetailRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', detailToBin);			//Set the bin number
															adjustInvDetailRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', detailStatus);	//Set the inv status
															adjustInvDetailRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', adjustQuantity);		//Set the quantity
															
															//Save the inventoryassignment line to the inventorydetail subrecord
															//
															adjustInvDetailRecord.commitLineItem('inventoryassignment');
															
															//Commit the inventorydetail subrecord
															//
															adjustInvDetailRecord.commit();
															
															//Save the line to the inventory sublist
															//
															stockAdjustRecord.commitLineItem('inventory');
														}
													catch(err)
														{
															nlapiLogExecution('ERROR', 'Error adding line to stock adjustment', err.message);
														}
													
													//Save the stock adjustment record
													//
													try
														{
															nlapiSubmitRecord(stockAdjustRecord, true, true);
														}
													catch(err)
														{
															nlapiLogExecution('ERROR', 'Error saving stock adjustment', err.message);
														}
												}
										}
								}
						}
				}
		}
}
