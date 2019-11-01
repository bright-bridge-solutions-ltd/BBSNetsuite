/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Oct 2019     cedricgriffiths
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
function dripTrayPostSourcing(type, name) 
{
	if(type == 'item' && name == 'item')
		{
			var itemId = nlapiGetCurrentLineItemValue('item', 'item');
			var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			var itemClass = null;
			
			try
				{
					itemClass = nlapiLookupField(getItemRecordType(itemType), itemId, 'class', false);
				}
			catch(err)
				{
					itemClass = null;
				}
			
			if(itemClass == 19) //Machines - Undercounter Systems
				{
                  //alert('Please check the drip tray required for this system.');
                  Ext.Msg.minWidth = 400;
				  Ext.Msg.alert('❗Alert', 'Please check the drip tray required for this system.<br/><br/>If the system code is 601142 add 1 x 192271 to the order.<br/>If the system code is 601162 add 1 x 192260 to the order.', Ext.emptyFn);

				}
		}
}

function getItemRecordType(_itemType)
{
	var _itemRecordType = '';
	
	switch(_itemType)
	{
		case 'InvtPart':
			_itemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			_itemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			_itemRecordType = 'assemblyitem';
			break;
			
		case 'Kit':
			_itemRecordType = 'kititem';
			break;
			
		case 'Service':
			_itemRecordType = 'serviceitem';
			break;
			
		case 'Discount':
			_itemRecordType = 'discountitem';
			break;
		
		case 'Group':
			_itemRecordType = 'itemgroup';
			break;
		
		default:
			_itemRecordType = _itemType;
			break;
	}

	return _itemRecordType;
}
