/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_select_partner')
		{
			var sessionId = nlapiGetFieldValue('custpage_param_session_id');
			var sessionData = nlapiGetFieldValue(name);
			
			libSetSessionData(sessionId, sessionData);
		}
	
	if(type == 'custpage_sublist_items' && name == 'custpage_sublist_tick')
		{
			var count = nlapiGetLineItemCount('custpage_sublist_items');
			var ticked = Number(0);
			var total = Number(0);
			
			for (var int = 1; int <= count; int++) 
				{
					var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
					
					if(tick == 'T')
						{
							ticked++;
							total += Number(nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_amount', int));
						}
				}
			
			nlapiSetFieldValue('custpage_select_ticked', ticked, false, true);
			nlapiSetFieldValue('custpage_select_value', total.toFixed(2), false, true);
		}
}



function clientSaveRecord()
{
	var stage = nlapiGetFieldValue('custpage_param_stage');
	var returnStatus = false;
	var message = '';
	
	switch (Number(stage))
		{
			case 1:
				returnStatus = true;
				break;
				
			case 2:
				var count = nlapiGetLineItemCount('custpage_sublist_items');
				
				message = 'Please select one or more transactions to continue';
				
				for (var int = 1; int <= count; int++) 
					{
						var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
						
						if(tick == 'T')
							{
								returnStatus = true;
								break;
							}
					}
				
				if(!returnStatus)
				{	
					alert(message);
				}

				break;
				
			case 3:
				var count = nlapiGetLineItemCount('custpage_sublist_items');
				message = 'Please refresh the list until all works orders are allocated before continuing';
				returnStatus = true;
				
				for (var int = 1; int <= count; int++) 
					{
						var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_updated', int);
						
						if(tick == 'F')
							{
								returnStatus = false;
								alert(message);
								break;
							}
					}
				
				break;
		}
	
    return returnStatus;
}















