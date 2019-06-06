/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Jun 2019     cedricgriffiths
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
function setItemSuppliersBS(type)
{
	var vendorArray = [];
	
	//Only works on create or edit
	//
	if(type == 'create' || type == 'edit')
		{
			//Get the number of vendor lines
			//
			var vendorCount = nlapiGetLineItemCount('itemvendor');
			
			//Loop through the vendor lines to build up a list of vendor id's
			//
			for (var int = 1; int <= vendorCount; int++) 
				{
					var vendorId = nlapiGetLineItemValue('itemvendor', 'vendor', int);
					vendorArray.push(vendorId);
				}
			
			//Set the multi-select field with the list of vendors
			//
			nlapiSetFieldValues('custitem_bbs_available_suppliers', vendorArray, false, true);
		}
}
