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
			//Get old and new versions of the record
			//
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			
			//Get old and new transaction dates
			//
			var oldTranDate = oldRecord.getFieldValue('trandate');
			var newTranDate = newRecord.getFieldValue('trandate');
			
			//If the transaction date has changed, then restore the old version
			//
			if(oldTranDate != newTranDate)
				{
					nlapiSetFieldValue('trandate', oldTranDate, true, true);
				}
			
			//Compare rev rec start and end dates on the lines to make sure these have not changed
			//
			var newLineCount = newRecord.getLineItemCount('item');
			var oldLineCount = oldRecord.getLineItemCount('item');
			
			for (var newLine = 1; newLine <= newLineCount; newLine++) 
				{
					//Get the values from the new line
					//
					var newLineUniqueKey 	= newRecord.getLineItemValue('item', 'lineuniquekey', newLine);
					var newLineRevRecStart 	= newRecord.getLineItemValue('item', 'custcol_bbs_revenue_rec_start_date', newLine);
					var newLineRevRecEnd 	= newRecord.getLineItemValue('item', 'custcol_bbs_revenue_rec_end_date', newLine);
					
					//Now find the matching line in the old record
					//
					for (var oldLine = 1; oldLine <= oldLineCount; oldLine++) 
						{
							var oldLineUniqueKey 	= oldRecord.getLineItemValue('item', 'lineuniquekey', oldLine);
							var oldLineRevRecStart 	= oldRecord.getLineItemValue('item', 'custcol_bbs_revenue_rec_start_date', oldLine);
							var oldLineRevRecEnd 	= oldRecord.getLineItemValue('item', 'custcol_bbs_revenue_rec_end_date', oldLine);
							
							//Found matching line?
							//
							if(newLineUniqueKey == oldLineUniqueKey)
								{
									//Compare the old and new start dates
									//
									if(newLineRevRecStart != oldLineRevRecStart)
										{
											newRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_start_date', newLine, oldLineRevRecStart);
										}
								
									//Compare the old and new end dates
									//
									if(newLineRevRecStart != oldLineRevRecStart)
										{
											newRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_end_date', newLine, oldLineRevRecEnd);
										}
									
									//Break out of the loop if we have found the matching line
									//
									break;
								}
						}
				}
		}
}
