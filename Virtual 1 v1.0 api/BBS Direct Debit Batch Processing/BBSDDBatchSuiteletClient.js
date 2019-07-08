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

	if (name == 'custpage_filter_due_date')
		{
			var sessionId = nlapiGetFieldValue('custpage_param_session_id');
			var sessionData = nlapiGetFieldValue(name);
			
			libSetSessionData(sessionId, sessionData);
		}
	
	if(type == 'custpage_sublist_items' && name == 'custpage_amount_to_pay')
		{
			var amountToPay = Number(nlapiGetCurrentLineItemValue(type, name));
			var amountOutstanding = Number(nlapiGetLineItemValue(type, 'custpage_sublist_custrecord_bbs_pr_inv_outstanding', linenum));
		
			if(amountToPay > amountOutstanding)
				{
					Ext.Msg.alert('⛔️️ Amount To Pay Error', 'Amount to pay cannot be greater that the outstanding amount', Ext.emptyFn);
				
					nlapiSetCurrentLineItemValue(type, name, '', false, true);
				}
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















