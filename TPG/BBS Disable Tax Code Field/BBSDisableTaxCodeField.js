/**
 * Module Description
 * 
 * Version    	Date            	Author           	Remarks
 * 1.00       	09 Sep 2019     	sambatten			Initial Version	
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function pageInit(type) {
	
	// get the user's current role
	var userRole = nlapiGetRole();
	
	// only run below code when the userRole variable returns 1018 (Tour Operator [TNT])
	if (userRole == 1018)
		{
			// disable the taxcode line field
			nlapiDisableLineItemField('item', 'taxcode', true);
		} 
}
