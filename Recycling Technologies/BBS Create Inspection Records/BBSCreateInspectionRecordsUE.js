/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 May 2019     cedricgriffiths
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
function itemReceiptAS(type)
{
	if(type == 'create')
		{
			var currentRecord = nlapiGetNewRecord();
			var recordId = currentRecord.getId();
			var recordType = currentRecord.getRecordType();
			var itemReceiptRecord = null;
			
			try 
				{
					itemReceiptRecord = nlapiLoadRecord(recordType, recordId);
				} 
			catch (error) 
				{
					itemReceiptRecord = null;
				}
			
			if(itemReceiptRecord != null)
				{
					var lines = itemReceiptRecord.getLineItemCount('item');
					var supplierGRN = itemReceiptRecord.getFieldValue('custbody_bbs_purchase_supplier_grn');
					var inspectionArray = {};
					
					for (var int = 1; int <= lines; int++) 
						{
							var itemId = itemReceiptRecord.getLineItemValue('item', 'item', int);
							var itemInspect = itemReceiptRecord.getLineItemValue('item', 'custcol_bbs_po_item_inspection_yn', int);
							var itemLine = itemReceiptRecord.getLineItemValue('item', 'line', int);
							var itemQuantity = itemReceiptRecord.getLineItemValue('item', 'quantity', int);
							var itemRevision = itemReceiptRecord.getLineItemValue('item', 'custcol_bbs_po_required_revision', int);
							
							if(itemInspect == 'T')
								{
									var inspectionRecord = null;
									
									try
										{
											inspectionRecord = nlapiCreateRecord('customrecord_bbs_po_receipt_inspection');
										}
									catch(err)
										{
											inspectionRecord = null;
										}
									
									if(inspectionRecord != null)
										{
											inspectionRecord.setFieldValue('custrecord_bbs_po_inspect_receipt_id', recordId);
											inspectionRecord.setFieldValue('custrecord_bbs_po_inspect_item', itemId);
											inspectionRecord.setFieldValue('custrecord_bbs_po_inspect_receipt', supplierGRN);
											inspectionRecord.setFieldValue('custrecord_bbs_po_inspect_receipt_line', itemLine);
											inspectionRecord.setFieldValue('custrecord_bbs_po_inspect_item_revision', itemRevision);
											inspectionRecord.setFieldValue('custrecord_bbs_po_inspect_received_qty', itemQuantity);
											
											var inspectionId = null;
											
											try
												{
													inspectionId = nlapiSubmitRecord(inspectionRecord, true, true);
												}
											catch(err)
												{
													inspectionId = null;
												}
											
											if(inspectionId != null)
												{
													inspectionArray[itemLine] = inspectionId;
												}
										}
								}
						}
				
					//Update the item receipt with the inspection records
					//
					if(Object.keys(inspectionArray).length > 0)
						{
							var receiptLines = itemReceiptRecord.getLineItemCount('item');
								
							for (var int2 = 1; int2 <= receiptLines; int2++) 
								{
									var receiptLine = itemReceiptRecord.getLineItemValue('item', 'line', int2);
									var inspectId = inspectionArray[receiptLine];
											
									if(inspectId != null && inspectId != '' && inspectId != 'undefined')
										{
											itemReceiptRecord.setLineItemValue('item', 'custcol1', int2, inspectId);
										}
								}
									
							nlapiSubmitRecord(itemReceiptRecord, false, true);
						}
				}
		}
}
