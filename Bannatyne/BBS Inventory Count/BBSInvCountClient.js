/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2019     sambatten
 *
 */

function pageInit(type)
	{
		// get the ID of the current user's role
		var userRole = nlapiGetRole();
		
		// if statement to check the the user's role is not Administrator (ID 3) or TBG - Procurement team (ID 1028) or TBG - Stock Controller (ID 1029)
		if (userRole != 3 && userRole != 1028 && userRole != 1029)
			{
				// disable the rate column
				nlapiDisableLineItemField('item', 'rate', true);
			}
	}