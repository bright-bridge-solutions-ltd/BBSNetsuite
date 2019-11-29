/**
 * Module Description
 * 
 * Version    	Date            Author			Remarks
 * 1.00       	28 Nov 2019     sambatten		Initial version
 */

function pageInit(type)
	{
		// disable line item fields
		nlapiDisableLineItemField('item', 'department', true);
		nlapiDisableLineItemField('item', 'class', true);
	}

function lineInit(type)
	{
		// disable line item fields
		nlapiDisableLineItemField('item', 'department', true);
		nlapiDisableLineItemField('item', 'class', true);
	}