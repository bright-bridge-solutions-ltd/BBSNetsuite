/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jan 2021     cedricgriffiths
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
function soDirectDelSmpAS(type)
{
	//
	//Function to set the SMP Order flag if any item starts with "SMP", or set the Direct Del Order flag if any item starts with DIRECTDEL
	//
	
	//Only work on create or edit mode
	//
	if(type == 'create' || type == 'edit')
		{
			var flagSmp 		= 'F';
			var flagDirect		= 'F';
			var currentRecord 	= null;
			var currentId		= null; 
			
			//Get the current record
			//
			try
				{
					currentRecord = nlapiGetNewRecord();
				}
			catch(err)
				{
					currentRecord 	= null;
					nlapiLogExecution('ERROR', 'error getting new record', err.message);
				}
			
			if(currentRecord != null)
				{
					currentId = currentRecord.getId();
					
					//Get the current values of the flags
					//
					var currentFlagSmp 		= currentRecord.getFieldValue('custbody_acc_smp_order');
					var currentFlagDirect 	= currentRecord.getFieldValue('custbody_acc_direct_del_order');
				
					//Get the count of the number of item lines
					//
					var itemLineCount = currentRecord.getLineItemCount('item');
					
					//Loop through the item lines
					//
					for (var lineCounter = 1; lineCounter <= itemLineCount; lineCounter++) 
						{
							//Get the item from the line
							//
							var lineItem = currentRecord.getLineItemText('item', 'item', lineCounter);
							
							//Does the item begin with 'SMP'
							//
							if(lineItem.indexOf('SMP') == 0)
								{
									flagSmp 	= 'T';
								}
							
							//Does the item begin with 'DIRECTDEL'
							//
							if(lineItem.indexOf('DIRECTDEL') == 0)
								{
									flagDirect 	= 'T';
								}
						}
					
					//Update the sales order record with the flags (if they have changed)
					//
					if(flagSmp != currentFlagSmp || flagDirect != currentFlagDirect)
						{
							try
								{
									nlapiSubmitField('salesorder', currentId, ['custbody_acc_smp_order','custbody_acc_direct_del_order'], [flagSmp, flagDirect], false);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'error updating new record', err.message);
								}
						}
				}
		}
}
