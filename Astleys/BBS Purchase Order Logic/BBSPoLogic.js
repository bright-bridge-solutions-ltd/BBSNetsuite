/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jul 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function purchaseOrderPostSourcing(type, name) 
{
	if(type == 'item' && name == 'item')
		{
			var itemRecord 	= null;
			var itemId 		= nlapiGetCurrentLineItemValue('item', 'item');
			var itemType	= nlapiGetCurrentLineItemValue('item', 'itemtype');
			var supplierSku	= null;
			
			try
				{
					itemRecord = nlapiLoadRecord(getItemRecordType(itemType), itemId);
				}
			catch(err)
				{
					itemRecord 	= null;
				}
			
			if(itemRecord != null)
				{
					var supplierLines = itemRecord.getLineItemCount('itemvendor');
					
					for (var supplierLine = 1; supplierLine <= supplierLines; supplierLine++) 
						{
							var preferredVendor = itemRecord.getLineItemValue('itemvendor', 'preferredvendor', supplierLine);
							
							if(preferredVendor == 'T')
								{
									supplierSku = itemRecord.getLineItemValue('itemvendor', 'vendorcode', supplierLine);
									
									break;
								}
						}
					
					nlapiSetCurrentLineItemValue('item', 'custcol_bbs_supplier_sku', supplierSku, false, true);
				}
		}
}

function getItemRecordType(_itemType)
{
	var itemRecordType = '';
	
	switch(_itemType)
	{
		case 'InvtPart':
			itemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			itemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			itemRecordType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemRecordType = 'noninventoryitem';
			break;
	}

	return itemRecordType;
}