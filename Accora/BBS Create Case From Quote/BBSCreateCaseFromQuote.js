/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Aug 2019     cedricgriffiths
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
	if(type == 'create')
		{
			//Get who created the record
			//
			var createdBy = nlapiGetFieldValue('recordcreatedby');
			
			//See if they are a sales rep
			//
			var isSalesRep = nlapiLookupField('employee', createdBy, 'issalesrep', false);
			
			if(isSalesRep == 'T')
				{
					//Create a case
					//
					var caseRecord = nlapiCreateRecord('supportcase', {recordmode: 'dynamic'});
					
				}
		
		}
}
