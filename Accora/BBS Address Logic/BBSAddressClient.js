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
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function addressPageInit(type)
{

	nlapiDisableField('override', true);

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
function addressFieldChanged(type, name, linenum)
{
	nlapiSetFieldValue('override', 'F', true, true);

}
