/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Sep 2019     cedricgriffiths
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
function invoiceUpdateContractAS(type)
{
	if(type == 'create')
		{
			var newRecord = nlapiGetNewRecord();
			var recordId = newRecord.getId();
			var contractId = newRecord.getFieldValue('custbody_bbs_contract_header');
			var tranDate = newRecord.getFieldValue('trandate');
			
			if(contractId != null && contractId != '')
				{
					nlapiSubmitField('customrecord_bbs_con_header', contractId, ['custrecord_bbs_contract_last_invoice','custrecord_bbs_contract_inv_date'], [recordId,tranDate], false);
				}
		}
}
