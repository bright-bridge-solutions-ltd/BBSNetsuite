/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2019     sambatten
 *
 */

function itemReceiptAfterSubmit(type)
	{
		// check if record is being created, edited or deleted
		if (type == 'create' || type == 'edit' || type == 'delete')
			{
				// get the value of the created from field
				var po = nlapiGetFieldValue('createdfrom');
		
				// load the PO record
				var poRec = nlapiLoadRecord('purchaseorder', po);
		
				// get line item count
				var lineCount = nlapiGetLineItemCount('item');
		
				// loop through items
				for (var i = 1; i <= lineCount; i++)
					{
						// get the value of the receive checkbox
						var receive = nlapiGetLineItemValue('item', 'itemreceive', i);
					
						// get the value of the quantity column
						var quantity = nlapiGetLineItemValue('item', 'quantity', i);
					
						// get the value of the rate column
						var rate = nlapiGetLineItemValue('item', 'rate', i);
					
						// get the order line number
						var receiptLineNo = nlapiGetLineItemValue('item', 'orderline', i);
						
						// get count of lines on the purchase order
						var poLineCount = poRec.getLineItemCount('item');
						
						// loop through PO items
						for (var x = 1; x <= poLineCount; x++)
							{
								// get the PO line number
								var poLineNo = poRec.getLineItemValue('item', 'line', x);
								
								// check if poLineNo is the same as receiptLineNo
								if (poLineNo == receiptLineNo)
									{
										// get the received rate from the PO record
										var rcvdTotal = poRec.getLineItemValue('item', 'custcol_rcvd_rate', x);
										
										// do we have a received total
										if (rcvdTotal)
											{
												rcvdTotal = parseFloat(rcvdTotal); // convert to floating point number
											}
										else
											{
												rcvdTotal = 0; // set rcvdTotal to 0
											}
										
										// multiply the quantity by the rate to calculate received rate total
										var rcvdRate = parseFloat(quantity * rate);
										
										if (type == 'delete') // if record is being deleted
											{
												// check that the receive checkbox is ticked
												if (receive == 'T')
													{
														// subtract the rcvdRate variable from the rcvdTotal variable
														rcvdTotal = parseFloat(rcvdTotal - rcvdRate);
														
														// populate the rcvd rate field on the PO record using the rcvdTotal variable
														poRec.setLineItemValue('item', 'custcol_rcvd_rate', x, rcvdTotal);
													}
											}
										else if (type == 'create') // if the record is being created
											{
												// check that the receive checkbox is ticked
												if (receive == 'T')
													{
														// add the rcvdRate variable to the rcvdTotal variable
														rcvdTotal = parseFloat(rcvdTotal + rcvdRate);
															
														// populate the rcvd rate field on the PO record using the rcvdTotal variable
														poRec.setLineItemValue('item', 'custcol_rcvd_rate', x, rcvdTotal);
													}
											}
										else if (type == 'edit') // if record is being edited
											{
												// get the old record object
												var oldRecord = nlapiGetOldRecord();
													
												// get the new record object
												var newRecord = nlapiGetNewRecord();
													
												// get line item fields from the old record
												var oldRecReceive = oldRecord.getLineItemValue('item', 'itemreceive', i);
												var oldRecQuantity = oldRecord.getLineItemValue('item', 'quantity', i);
												var oldRecRate = oldRecord.getLineItemValue('item', 'rate', i);
													
												// get line item fields from the new record
												var newRecReceive = newRecord.getLineItemValue('item', 'itemreceive', i);
												var newRecQuantity = newRecord.getLineItemValue('item', 'quantity', i);
												var newRecRate = newRecord.getLineItemValue('item', 'rate', i);
													
												// check for differences between old and new values
												if (oldRecReceive == 'T' && newRecReceive == 'F') // if the oldRecReceive variable returns T and the newRecReceive variable returns F
													{
														// multiply the quantity by the rate to calculate received rate total
														var rcvdRate = parseFloat(newRecQuantity * newRecRate);
															
														// subtract the rcvdRate variable from the rcvdTotal variable
														rcvdTotal = parseFloat(rcvdTotal - rcvdRate);
															
														// populate the rcvd rate field on the PO record using the rcvdTotal variable
														poRec.setLineItemValue('item', 'custcol_rcvd_rate', x, rcvdTotal);
													}
												else if (oldRecReceive == 'F' && newRecReceive == 'T') // if the oldRecReceive variable returns F and the newRecReceive variable returns T
													{
														// multiply the quantity by the rate to calculate received rate total
														var rcvdRate = parseFloat(newRecQuantity * newRecRate);
															
														// add the rcvdRate variable to the rcvdTotal variable
														rcvdTotal = parseFloat(rcvdTotal + rcvdRate);
															
														// populate the rcvd rate field on the PO record using the rcvdTotal variable
														poRec.setLineItemValue('item', 'custcol_rcvd_rate', x, rcvdTotal);
													}
												else if (oldRecQuantity != newRecQuantity || oldRecRate != newRecRate) // if the quantity or rate values are different
													{
														// multiply the quantity by the rate to calculate the old rcvd rate
														var oldRcvdRate = parseFloat(oldRecQuantity * oldRecRate);
															
														// multiply the quantity by the rate to calculate received rate total
														var newRcvdRate = parseFloat(newRecQuantity * newRecRate);
															
														// subtract the newRcvdRate variable from the oldRcvdRate variable
														var rateDiff = parseFloat(newRcvdRate - oldRcvdRate);
															
														// add the rateDiff variable to the rcvdTotal variable
														rcvdTotal = parseFloat(rcvdTotal + rateDiff);
															
														// populate the rcvd rate field on the PO record using the rcvdTotal variable
														poRec.setLineItemValue('item', 'custcol_rcvd_rate', x, rcvdTotal);
													}
											}
									}
							}
					}
			}
		
		// submit the PO record
		nlapiSubmitRecord(poRec);
	
	}