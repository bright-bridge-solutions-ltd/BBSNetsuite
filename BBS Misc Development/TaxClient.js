/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Jun 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function taxClientSaveRecord()
{
	var subtotal = Number(nlapiGetFieldValue('subtotal'));
	
	nlapiSetFieldValue('taxamountoverride', Number(10), true);
	nlapiSetFieldValue('total', subtotal + Number(10), true);
	
	
	
    return true;
}
