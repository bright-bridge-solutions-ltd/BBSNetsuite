/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Feb 2020     cedricgriffiths
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
function virtualBillAS(type)
{
	//Determine if we need to trigger the reconciliation of the virtual bill record
	//
	var newRecord = nlapiGetNewRecord();
	var triggerRecon = false;
	var allLinesAddedNew = '';
	var allLinesAddedOld = '';
	var newRecordId = newRecord.getId();
	
	switch(type)
		{
			case 'create':
				
				allLinesAddedNew = newRecord.getFieldValue('custrecord_all_lines_added');
				
				//Record has been created with the all lines added flag set to true
				//
				if(allLinesAddedNew == 'T')
					{
						triggerRecon = true;
					}
				
				break;
				
			case 'edit':
				
				var oldRecord = nlapiGetOldRecord();
				
				allLinesAddedOld = oldRecord.getFieldValue('custrecord_all_lines_added');
				allLinesAddedNew = newRecord.getFieldValue('custrecord_all_lines_added');
				
				//Record has been edited and the all lines added flag has been changed from false to true
				//
				if(allLinesAddedNew == 'T' && allLinesAddedOld != 'T')
					{
						triggerRecon = true;
					}
			
				break;
		}
	
	//Call a scheduled script to reconcile the virtual bill
	//
	if(triggerRecon)
		{
			nlapiScheduleScript('customscvript_bbs_vbill_recon', null, {custscript_bbs_vbill_id: newRecordId})
		}
}
