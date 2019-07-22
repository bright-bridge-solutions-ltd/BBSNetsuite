/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jul 2019     sambatten
 *
 */

function userEventBeforeSubmit(type) 
	{
		// check if the record is being edited
		if (type == 'edit')
			{
				// get old record object
				var oldRec = nlapiGetOldRecord();
				
				// get new record object
				var newRec = nlapiGetNewRecord();
				
				// get total field from old record
				var oldTotal = oldRec.getFieldValue('total');
				
				// get total field from new record
				var newTotal = newRec.getFieldValue('total');
				
				// check that the oldTotal and newTotal variables are different
				if (oldTotal != newTotal)
					{
						// update the current version field on the record
						var curVer = parseInt(nlapiGetFieldValue('custbody_cle_pro_version'))+1;
						nlapiSetFieldValue('custbody_cle_pro_version', curVer);
					}
			}
	}