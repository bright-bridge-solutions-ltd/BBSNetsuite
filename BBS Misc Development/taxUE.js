/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 May 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type)
{
	var newRecord = nlapiGetNewRecord();
	var newId = newRecord.getId();
	
	var taxValue = Number(newRecord.getFieldValue('taxtotal'));
	var subtotalValue = Number(newRecord.getFieldValue('subtotal'));
	var shipValue = Number(newRecord.getFieldValue('altshippingcost'));
	
	var newTax = taxValue + Number(10.00);
	var newTotal = subtotalValue + newTax + shipValue;
	
	var a = nlapiLoadRecord('salesorder', newId);
	a.setFieldValue('taxtotal', newTax);
	a.setFieldValue('total', newTotal);
	
	nlapiSubmitRecord(a, true, true);
	
	

	var z = '';

}
