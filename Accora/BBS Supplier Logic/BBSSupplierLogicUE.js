/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jun 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function supplierLogicBS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var validated = true;
	
			var lines = Number(nlapiGetLineItemCount('submachine'));
				 	
			if(lines != 0)
				 {
				 	for (var int = 1; int <= lines; int++) 
					 	{
				 			var taxCode = nlapiGetLineItemValue('submachine', 'taxitem', int)
									
				 			if(taxCode == null || taxCode == '')
				 				{
				 					validated = false;
				 					break;
				 				}
						}
	
				 }
			else
				{
					validated = false;
				}
			if(!validated)
				{
					var err = nlapiCreateError('BBS_MISSING_TAX_CODE', 'All subsidiary entries must have a tax code', true);
					throw(err);
				}
		}
}
