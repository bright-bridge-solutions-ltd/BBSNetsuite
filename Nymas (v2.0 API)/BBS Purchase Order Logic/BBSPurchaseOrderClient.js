/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2020     sambatten
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   
}



/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	
	// if the 'New Item' field has been changed
	if (type == 'item' && name == 'custcol_bbs_new_purchase_item')
		{
			// set the item field on the current line using the value in the 'New Item' field
			nlapiSetCurrentLineItemValue('item', 'item', nlapiGetCurrentLineItemValue('item', 'custcol_bbs_new_purchase_item'));
		}
 
}
