

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
function externalIdAfterSubmit(type)
{
	if(type == 'create')
		{
			var newRecord 	= nlapiGetNewRecord();
			var currentId 	= newRecord.getId();
			var currentType = newRecord.getRecordType();
			var externalId 	= '';
			var itemId 		= '';
			var itemName 	= '';
					
			switch(currentType)
				{
					case 'kititem':
					case 'inventoryitem':
					case 'noninventoryitem':
								
						externalId = isNull(nlapiLookupField(currentType, currentId, 'itemid', false),'');
								
						break;
								
					case 'itemfulfillment':
								
						externalId = isNull(nlapiLookupField(currentType, currentId, 'tranid', false),'');
								
						break;
				}

			try
				{
					nlapiSubmitField(currentType, currentId, 'externalid', externalId, false);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error updating external id on record ' + currentType + ' ' + currentId, err.message);
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

