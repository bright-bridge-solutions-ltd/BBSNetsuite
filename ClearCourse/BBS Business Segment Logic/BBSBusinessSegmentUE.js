/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jan 2021     cedricgriffiths
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
function businessSegmentAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord 		= nlapiGetNewRecord();
			var currentId 		= newRecord.getId();
			var currentType 	= newRecord.getRecordType();
			var currentRecord 	= null;
			var recordUpdated	= false;
			
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
					//Get the business segment
					//
					var businessSegment = currentRecord.getFieldValue('cseg_cc_bus');
					
					//Get the count of lines
					//
					var lines = currentRecord.getLineItemCount('line');
					
					//Update the lines with the business segment from the header
					//
					if(businessSegment != null && businessSegment != '')
						{
							for (var lineCount = 1; lineCount <= lines; lineCount++) 
								{
									currentRecord.setLineItemValue('line', 'cseg_cc_bus', lineCount, businessSegment);
									recordUpdated = true;
								}
						}
					
					//See if there are any lines that have an entity assigned to them
					//
					for (var lineCount = 1; lineCount <= lines; lineCount++) 
						{
							var lineEntity = currentRecord.getLineItemValue('line', 'entity', lineCount);
							
							if(lineEntity != null && lineEntity != '')
								{
									//See if the entity has a business segment
									//
									var entitySegment = nlapiLookupField('entity', lineEntity, 'cseg_cc_bus', false);
									
									if(entitySegment != null && entitySegment != '')
										{
											//Update the line with the entity's business segment
											//
											currentRecord.setLineItemValue('line', 'cseg_cc_bus', lineCount, entitySegment);
											recordUpdated = true;
										}
								}
						}
					
					//Update the record if required
					//
					if(recordUpdated)
						{
							try
								{
									nlapiSubmitRecord(currentRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving record after updating business segment (' + currentType + ') (' + currentId + ')', err.message);
								}
						}
				}
		}
}
