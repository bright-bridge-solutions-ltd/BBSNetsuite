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
 * @returns {Boolean} True to continue save, false to abort save
 */
function businessSegmentSave()
{
	var subsidiary 		= nlapiGetFieldValue('subsidiary');
	var returnStatus 	= true;
	
	if(subsidiary != null && subsidiary != '')
		{
			var novaSub = nlapiLookupField('subsidiary', subsidiary, 'custrecord_cc_nova_sub', false);
			
			//If the subsidiary is marked as being Nova Sub, then the business segment has to be mandatory
			//
			if(novaSub == 'T')
				{
					var lines = nlapiGetLineItemCount('line');
					
					for (var lineCount = 1; lineCount <= lines; lineCount++) 
						{
							var businessSegment = nlapiGetLineItemValue('line', 'cseg_cc_bus', lineCount);
							
							if(businessSegment == null || businessSegment == '')
								{
									returnStatus = false;
								}
						}
				}
		}
	
	if(!returnStatus)
		{
			alert('Business Segment is mandatory - please enter a value');
		}
	
    return returnStatus;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function businessSegmentValidateLine(type)
{
	var returnStatus = true;
	
	if( type == 'line')
		{
			var subsidiary = nlapiGetFieldValue('subsidiary');
			
			if(subsidiary != null && subsidiary != '')
				{
					var novaSub = nlapiLookupField('subsidiary', subsidiary, 'custrecord_cc_nova_sub', false);
					
					//If the subsidiary is marked as being Nova Sub, then the business segment has to be mandatory
					//
					if(novaSub == 'T')
						{
							var businessSegment = nlapiGetCurrentLineItemValue('line', 'cseg_cc_bus');
							
							if(businessSegment == null || businessSegment == '')
								{
									returnStatus = false;
									
									alert('Business Segment is mandatory - please enter a value');
								}
						}
				}
		}
	
    return returnStatus;
}
