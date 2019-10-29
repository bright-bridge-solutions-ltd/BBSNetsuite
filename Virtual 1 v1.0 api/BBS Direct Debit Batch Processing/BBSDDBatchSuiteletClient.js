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

	if (name == 'custpage_select_proc_date')
	{
		var dateFieldValue = nlapiGetFieldValue(name);
		
		if(dateFieldValue != null && dateFieldValue != '')
			{
				var dueDate = nlapiStringToDate(dateFieldValue);
				var today = new Date();
				var minClearingDate = nlapiAddDays(today, 3);
				
				if(dueDate.getTime() < minClearingDate.getTime())
					{
						Ext.Msg.alert('⛔️️ Clearing Date Error', 'The bank clearing date cannot be less that 3 days in the future', Ext.emptyFn);
						nlapiSetFieldValue('custpage_select_proc_date', null, false, true);
					}
			}
	}
	
	if (name == 'custpage_filter_due_date' || name == 'custpage_filter_partner')
		{
			var sessionId = nlapiGetFieldValue('custpage_param_session_id');
			var filterDueDate = nlapiGetFieldValue('custpage_filter_due_date');
			var filterCustomer = nlapiGetFieldValue('custpage_filter_partner');
			
			var sessionData = {};
			sessionData['date'] = filterDueDate;
			sessionData['customer'] = filterCustomer;
			
			libSetSessionData(sessionId, JSON.stringify(sessionData));
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
	var paymentMissing = false;
	
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
						var totalToPay = Number(nlapiGetLineItemValue('custpage_sublist_items', 'custpage_amount_to_pay', int));

						if(tick == 'T')
							{
								returnStatus = true;
								
								if(totalToPay == 0)
									{
										paymentMissing = true;
									}
							}
					}
				
				if(paymentMissing)
					{
						returnStatus = false;
						message = 'Please make sure that all selected lines have an amount to pay';
					}
				
				if(!returnStatus)
					{	
						alert(message);
					}

				break;
		}
	
    return returnStatus;
}















