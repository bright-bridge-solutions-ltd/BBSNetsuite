/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2019     sambatten
 *
 */

function pageInit(type)
	{
		// disable the rate column
		nlapiDisableLineItemField('item', 'rate', true);
	}
