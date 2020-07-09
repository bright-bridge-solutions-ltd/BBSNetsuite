/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jan 2020     sambatten
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type)
	{
		// get the current user's role
		var userRole = nlapiGetRole();
		
		// check that the user's role is not 3 (Administrator) or 1028 (TBG - Procurement team)
		if (userRole != 3 && userRole != 1028)
			{
				// disable line level fields
				nlapiDisableLineItemField('item', 'item', true);
				nlapiDisableLineItemField('item', 'custcol1', true);
			}
	}
