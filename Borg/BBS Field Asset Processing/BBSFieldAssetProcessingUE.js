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
function assemblyBuildAS(type)
{
	//Only work for create on assembly build
	//
	if(type == 'create')
		{
			//Get the assembly build record
			//
			var assemblyBuildRecord = nlapiGetNewRecord();
			
			//Make sure we are only working with the FreshGround subsidiary
			//
			var subsidiary = assemblyBuildRecord.getFieldValue('subsidiary');
			
			if(subsidiary == FRESHGROUND_SUBSIDIARY)
				{
					//Get the works order that the assembly build is created from
					//
					var worksOrderRecord = getWo(assemblyBuildRecord);
					
					//Continue if we have a works order
					//
					if(worksOrderRecord != null)
						{
							//Get the sales order that the works order is created from 
							//
							var salesOrderRecord = getSo(worksOrderRecord);
							
							//Continue if we have a sales order
							//
							if(salesOrderRecord != null)
								{
									//See if the assembly is included in the field asset processing
									//
									var fieldAssetProcessing = checkFieldAssetProcessing(assemblyBuildRecord);
									
									//Continue if the assembly is to use field asset processing
									//
									if(fieldAssetProcessing)
										{
											//Get the serial number from the assembly build record
											//
											var serialNumber = getSerialNumber(assemblyBuildRecord);
										
											//Continue if we have a serial number
											//
											if(serialNumber != null)
												{
													//Create or find the field asset
													//
													var fieldAssetId = createOrUpdateFieldAsset(assemblyBuildRecord, serialNumber, salesOrderRecord);
													
													if(fieldAssetId != null)
														{
															//Update the sales order with the field asset
															//
															updateSalesOrder(fieldAssetId, salesOrderRecord, worksOrderRecord);
														}
												}
										}
								}
						}
				}
		}
}

function updateSalesOrder(_fieldAssetId, _salesOrderRecord, _worksOrderRecord)
{
	var soLines = _salesOrderRecord.getLineItemCount('item');
	var updated = false;
	
	for (var int = 1; int <= soLines; int++) 
		{
			var woId = _salesOrderRecord.getLineItemValue('item', 'woid', int);
			
			if(woId == _worksOrderRecord.getId())
				{
					_salesOrderRecord.setLineItemValue('item','custcol_fajob_field_asset', int, _fieldAssetId);
					updated = true;
					break;
				}
		}
	
	if(updated)
		{
			try
				{
					nlapiSubmitRecord(_salesOrderRecord, false, true);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error updating sales order id = ' + _salesOrderRecord.getId(), err.message);
				}
		}
}

function createOrUpdateFieldAsset(_assemblyBuildRecord, _serialNumber, _salesOrderRecord)
{
	var assetId = null;
	
	//Get the item code from the assembly build header
	//
	var asssemblyItemDescription = _assemblyBuildRecord.getFieldText('item');
	
	//Construct the serial number
	//
	var serialNumberToSearch = asssemblyItemDescription + ' ' + _serialNumber;
	
	//Search the field assets for the serial number
	//
	var customrecord_faassetSearch = nlapiSearchRecord("customrecord_faasset",null,
			[
			   ["name","is",serialNumberToSearch]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
	
	if(customrecord_faassetSearch != null && customrecord_faassetSearch.length == 1)
		{
			//Found exactly one match, the use the id of that field asset
			//
			assetId = customrecord_faassetSearch[0].getId();
			
			//Update the field asset record with the new customer & location
			//
			var fields = ['custrecord_faasset_customer', 'custrecord_faasset_billingcustomer', 'custrecord_faasset_falocation'];
			var values = [_salesOrderRecord.getFieldValue('custbody_fapi_customer'), _salesOrderRecord.getFieldValue('custbody_fapi_customer'), _salesOrderRecord.getFieldValue('custbody_fapi_falocation')];
			
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
			//No match found, so create a new field asset
			//
			var fieldAssetRecord = nlapiCreateRecord('customrecord_faasset', {recordmode: 'dynamic'});
			
			//Populate fields
			//
			//Item
			fieldAssetRecord.setFieldValue('custrecord_faasset_item', _assemblyBuildRecord.getFieldValue('item'));	
			
			//Serial number
			fieldAssetRecord.setFieldValue('custrecord_faasset_serial', _serialNumber);			
			
			//Name
			fieldAssetRecord.setFieldValue('name', serialNumberToSearch);
			
			//Created from 
			fieldAssetRecord.setFieldValue('custrecord_faasset_createtransaction', _salesOrderRecord.getId());			
			
			//Description
			fieldAssetRecord.setFieldValue('custrecord_faasset_description', nlapiLookupField('assemblyitem', _assemblyBuildRecord.getFieldValue('item'), 'description', false));
			
			//Field customer
			fieldAssetRecord.setFieldValue('custrecord_faasset_customer', _salesOrderRecord.getFieldValue('custbody_fapi_customer'));
			
			//Billing customer
			fieldAssetRecord.setFieldValue('custrecord_faasset_billingcustomer', _salesOrderRecord.getFieldValue('custbody_fapi_customer'));
			
			//Asset location
			fieldAssetRecord.setFieldValue('custrecord_faasset_falocation', _salesOrderRecord.getFieldValue('custbody_fapi_falocation'));
			
			//Save record
			//
			try
				{
					assetId = nlapiSubmitRecord(fieldAssetRecord, true, true);
				}
			catch(err)
				{
					assetId = null;
					nlapiLogExecution('ERROR', 'Error creating new field asset', err.message);
				}
		}
	
	return assetId;
}

function getSerialNumber(_assemblyBuildRecord)
{
	var serialNumber = null;
	
	var inventoryDetail = _assemblyBuildRecord.viewSubrecord('inventorydetail');
	
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

function checkFieldAssetProcessing(_assemblyBuildRecord)
{
	var status = false;
	var asssemblyItem = _assemblyBuildRecord.getFieldValue('item');
	
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

function getWo(_assemblyBuildRecord)
{
	var woRecord = null;
	
	var createdFrom = _assemblyBuildRecord.getFieldValue('createdfrom');
	
	if(createdFrom != null && createdFrom != '')
		{
			try
				{
					woRecord = nlapiLoadRecord('workorder', createdFrom);
				}
			catch(err)
				{
					woRecord = null;
				}
		}
	
	return woRecord;
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