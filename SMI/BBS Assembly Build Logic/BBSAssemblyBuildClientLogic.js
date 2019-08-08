/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Aug 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum)
{
	if((type == null || type == '') && name =='quantity')
		{
			var enteredQuantity = nlapiGetFieldValue('quantity');
			
			if(parseInt(enteredQuantity) != parseFloat(enteredQuantity))
				{
					alert("Only whole numbers are allowed for quantity");
					nlapiSetFieldValue('quantity', '', false, true);
				}
			
		}
}
