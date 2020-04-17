/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Mar 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function soSaveRecord()
{
	var formId 			= nlapiGetFieldValue('customform');
	var customerId 		= nlapiGetFieldValue('entity');
	var custDivision 	= nlapiLookupField('customer', customerId, 'cseg_bbs_division', false);
	var cashSaleFormId	= nlapiGetContext().getSetting('SCRIPT', 'custscript_bbs_cash_sale_form');
	var cometDivisionId	= nlapiGetContext().getSetting('SCRIPT', 'custscript_bbs_comet_division');
	
	//If the form being used is the cash sale one, then set the division to be 'Comet'
	//
	if(formId == cashSaleFormId)
		{
			nlapiSetFieldValue('cseg_bbs_division', cometDivisionId, true, true);
		}
	else
		{
			if(custDivision != null && custDivision != '')
				{
					nlapiSetFieldValue('cseg_bbs_division', custDivision, true, true);
				}
		}
	
	//Set payment method to be cash
	//
	nlapiSetFieldValue('paymentmethod', '1', true, true);	
	
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function supplierPostSourcing(type, name) 
{
	//Have we changed the supplier on the item line?
	//
	if(type == 'item' && name == 'povendor')
		{
			try
				{
			   		//Get the item from the current line
			   		//
					var itemId = nlapiGetCurrentLineItemValue('item','item');
					var itemType = nlapiGetCurrentLineItemValue('item','itemtype');
		   		
			   		//See if the item is a drop ship item
			   		//
			   		var isDropShip = nlapiLookupField(getItemRecordType(itemType), itemId, 'isdropshipitem', false);
			   		
			   		if(isDropShip == 'T')
			   			{
			   				nlapiSetCurrentLineItemValue('item','createpo','DropShip', true, true);
			   			}
				}
			catch(err)
				{
				}
		}
}

function getItemRecordType(girtItemType)
{
	var girtItemRecordType = '';
	
	switch(girtItemType)
	{
		case 'InvtPart':
			girtItemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			girtItemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			girtItemRecordType = 'assemblyitem';
			break;
			
		case 'Kit':
			girtItemRecordType = 'kititem';
			break;
	}

	return girtItemRecordType;
}