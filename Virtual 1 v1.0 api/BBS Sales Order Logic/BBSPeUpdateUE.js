/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Nov 2019     cedricgriffiths
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
function peUpdateAS(type)
{
	if(type == 'edit')
		{
			var oldRecord 		= nlapiGetOldRecord();
			var newRecord 		= nlapiGetNewRecord();
			
			var oldPeNumber 	= oldRecord.getFieldValue('custbody_bbs_pe_reference');
			var newPeNumber 	= newRecord.getFieldValue('custbody_bbs_pe_reference');
			var soStatus 		= newRecord.getFieldValue('status');
			var salesOrderId 	= newRecord.getId();
			
			if(oldPeNumber != newPeNumber)
				{
					if(soStatus != 'Billed' && soStatus != 'Closed')
						{
							nlapiSubmitField('salesorder', salesOrderId, 'externalid', 'so_' + newPeNumber, false);
						
						}
				}
		}
}
