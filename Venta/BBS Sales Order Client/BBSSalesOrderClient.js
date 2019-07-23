/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Jul 2019     sambatten
 *
 */

function clientValidateLine ()
	{
		// get the value of the delivery date field
		var delDate = nlapiGetCurrentLineItemValue('item', 'expectedshipdate');
		
		// set the 'BBS Delivery Date' field using the delDate variable
		nlapiSetCurrentLineItemValue('item', 'custcol_bbs_deliverydate', delDate);
    
		// save the line
		return true;
	}