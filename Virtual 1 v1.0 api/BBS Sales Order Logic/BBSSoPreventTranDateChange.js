/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Apr 2020     cedricgriffiths
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
function soPreventTrandateBS(type)
{
	if(type == 'edit')
		{
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			
			var oldTranDate = oldRecord.getFieldValue('trandate');
			var newTranDate = newRecord.getFieldValue('trandate');
			
			if(oldTranDate != newTranDate)
				{
					nlapiSetFieldValue('trandate', oldTranDate, true, true);
				}
		}
}
