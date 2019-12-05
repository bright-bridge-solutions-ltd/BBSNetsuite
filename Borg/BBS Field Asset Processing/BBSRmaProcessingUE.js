/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Dec 2019     cedricgriffiths
 *
 */

var FRESHGROUND_SUBSIDIARY = 7;

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
	//Only work for create on item receipt
	//
	if(type == 'create')
		{
			var freshGroundCustomer = context.getSetting('SCRIPT', 'custscript_bbs_fg_customer');
			var freshGroundLocation = context.getSetting('SCRIPT', 'custscript_bbs_fg_location');
			
			//Get the receipt record
			//
			var itemReceiptRecord = nlapiGetNewRecord();
			
			//Make sure we are only working with the FreshGround subsidiary
			//
			var subsidiary = itemReceiptRecord.getFieldValue('subsidiary');
			
			if(subsidiary == FRESHGROUND_SUBSIDIARY)
				{
					//Get the returns authorisation that the item receipt is created from
					//
					var returnsAuthorisationRecord = getRma(itemReceiptRecord);
					
					//Continue if we have a rma
					//
					if(returnsAuthorisationRecord != null)
						{
							//Loop through the lines on the item receipt
							//
							var irLines = itemReceiptRecord.getLineItemCount('item');
							
							for (var irLine = 1; irLine <= irLines; irLine++) 
								{
									var irItem = itemReceiptRecord.getLineItemValue('item', 'item', irLine);
									var irItemType = itemReceiptRecord.getLineItemValue('item', 'itemtype', irLine);
								
									//Only process assembly items
									//
									if(irItemType == "Assembly")
										{
											//See if this item is enabled for the field asset logic
											//
											var fieldAssetProcessing = checkFieldAssetProcessing(irItem);
											
											if(fieldAssetProcessing)
												{
													//Now find the serial number from the item receipt line
													//
													var serialNumber = getSerialNumber(itemReceiptRecord, irLine);
													
													//Continue if we have a serial number
													//
													if(serialNumber != null)
														{
															//Update the field asset
															//
															updateFieldAsset(serialNumber, irItem, freshGroundCustomer, freshGroundLocation);
														}
												}
										}
								}
						}
				}
		}
}



function updateFieldAsset(_serialNumber, _irItem, _freshGroundCustomer, _freshGroundLocation)
{
	//Search the field assets for the serial number
	//
	var customrecord_faassetSearch = nlapiSearchRecord("customrecord_faasset",null,
			[
			   ["custrecord_faasset_serial","is",_serialNumber],
			   "AND",
			   ["custrecord_faasset_item","anyof",_irItem]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
	
	if(customrecord_faassetSearch != null && customrecord_faassetSearch.length == 1)
		{
			//Found exactly one match, the use the id of that field asset
			//
			var assetId = customrecord_faassetSearch[0].getId();
			
			//Update the field asset record with the new customer & location
			//
			var fields = ['custrecord_faasset_customer', 'custrecord_faasset_billingcustomer', 'custrecord_faasset_falocation'];
			var values = [_freshGroundCustomer, _freshGroundCustomer, _freshGroundLocation];
			
			try
				{
					nlapiSubmitField('customrecord_faasset', assetId, fields, values, false);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error updating field asset id = ' + assetId, err.message);
				}
		}
	else
		{
				nlapiLogExecution('ERROR', 'Cannot find asset with serial number = ' + _serialNumber, '');
		}
}

function getSerialNumber(_itemReceiptRecord, _irLine)
{
	var serialNumber = null;
	
	var inventoryDetail = _itemReceiptRecord.viewLineItemSubrecord('item', 'inventorydetail', _irLine);
	
	if(inventoryDetail != null && inventoryDetail != '')
		{
			var invAssignmentLines =  inventoryDetail.getLineItemCount('inventoryassignment');
			
			for (var int = 1; int <= invAssignmentLines; int++) 
				{
					serialNumber = inventoryDetail.getLineItemValue('inventoryassignment', 'receiptinventorynumber', int);
				}
		}
	
	return serialNumber;
}

function checkFieldAssetProcessing(_irItem)
{
	var status = false;
	var asssemblyItem = _irItem
	
	try
		{
			status = (nlapiLookupField('assemblyitem', asssemblyItem, 'custitem_bbs_use_field_asset_proc', false) == 'T' ? true : false);
		}
	catch(err)
		{
			status = false;
		}
	
	
	return status;
}

function getRma(_itemReceiptRecord)
{
	var rmaRecord = null;
	
	var createdFrom = _itemReceiptRecord.getFieldValue('createdfrom');
	
	if(createdFrom != null && createdFrom != '')
		{
			try
				{
					rmaRecord = nlapiLoadRecord('returnauthorization', createdFrom);
				}
			catch(err)
				{
					rmaRecord = null;
				}
		}
	
	return rmaRecord;
}

function getSo(_worksOrderRecord)
{
	var soRecord = null;
	
	var createdFrom = _worksOrderRecord.getFieldValue('createdfrom');
	
	if(createdFrom != null && createdFrom != '')
		{
			try
				{
					soRecord = nlapiLoadRecord('salesorder', createdFrom);
				}
			catch(err)
				{
					soRecord = null;
				}
		}
	
	return soRecord;
}