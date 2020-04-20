
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
function setExternalIdsAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord 		= nlapiGetNewRecord();
			var currentId 		= newRecord.getId();
			var currentType 	= newRecord.getRecordType();
			var currentRecord 	= null;
			
			try
				{
					currentRecord = nlapiLoadRecord(currentType, currentId);
				}
			catch(err)
				{
					currentRecord = null;
				}
			
			if(currentRecord != null)
				{
					var externalId = '';
					
					switch(currentType)
						{
							case 'noninventoryitem':
								
								externalId = isNull(currentRecord.getFieldValue('custitem_cc_external_id_item'),'');
								
								break;
								
							case 'customer':
								
								externalId = isNull(currentRecord.getFieldValue('custentity_cc_external_id'),'');
								
								break;
								
						}
					
					currentRecord.setFieldValue('externalid', externalId);
					
					try
						{
							nlapiSubmitRecord(currentRecord, false, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error saving record after updating externalid (' + currentType + ') (' + currentId + ')', err.message);
						}
				}
		}
}

function isNull(_string, _replacer)
{
	if(_string == null)
		{
			return _replacer;
		}
	else
		{
			return _string;
		}
}

