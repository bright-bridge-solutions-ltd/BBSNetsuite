/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Sep 2019     cedricgriffiths
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
function salesOrderFieldChanged(type, name, linenum)
{
	//If the billing end date is changed, we need to calculate the close date
	//
	if(name = 'custbody_bbs_billing_end_date')
		{
			var billingEndDateString = nlapiGetFieldValue('custbody_bbs_billing_end_date');
			
			if(billingEndDateString != null && billingEndDateString != '')
				{
					var billingFrequency = null;
					var billingEndDate = nlapiStringToDate(billingEndDateString);
					var billingOffCycle = nlapiGetFieldValue('custbody_bbs_off_billing_cycle');
					var lineCount = nlapiGetLineItemCount('item');
					
					for (var int = 1; int <= lineCount; int++) 
						{
							var lineFrequency = nlapiGetLineItemValue('item', 'custcol_bbs_billing_frequency', int);
							
							if(lineFrequency != null && lineFrequency != '')
								{
									billingFrequency = lineFrequency;
									break;
								}
						}
					
					if(billingFrequency != null)
						{
							if(billingFrequency == 1)	//Monthly
								{
									var closeDate = billingEndDate;
									closeDate.setDate(15);
									closeDate.setMonth(closeDate.getMonth() - 1);
									
									nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
									
									//See if we need to set the credit note flag
									//
									var closeDateMonthEnd = new Date(closeDate.getFullYear(), closeDate.getMonth() + 1, 0);
									var originalBillingEndDate = nlapiStringToDate(billingEndDateString);
									
									if(originalBillingEndDate.getTime() <= closeDateMonthEnd.getTime())
										{
											//Update the credit note required checkbox
											//
											nlapiSetFieldValue('custbody_bbs_cre_not_req', 'T', false, true);
										}
								}
							
							if(billingFrequency == 2)	//Quarterly
								{
									if(billingOffCycle == 'F')
										{
											var today = new Date();
											var closeDate = getCloseDate(today);
											
											nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
											
											//See if we need to set the credit note flag
											//
											var closeDateMonthEnd = new Date(closeDate.getFullYear(), closeDate.getMonth() + 1, 0);
											var originalBillingEndDate = nlapiStringToDate(billingEndDateString);
											
											if(originalBillingEndDate.getTime() <= closeDateMonthEnd.getTime())
												{
													//Update the credit note required checkbox
													//
													nlapiSetFieldValue('custbody_bbs_cre_not_req', 'T', false, true);
												}
										}
									else
										{
											var today = new Date();
											var todayMonth = today.getMonth();
												
											if(todayMonth == 11 || todayMonth == 0 || todayMonth == 1)
												{
													var endMonth = 1;
													var closeDate = new Date();
													closeDate.setMonth(endMonth);
													closeDate.setDate(15);
													
													if(todayMonth == 11)
														{
															closeDate.setYear(closeDate.getFullYear() + 1);
														}
													
													nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
												}
											
											if(todayMonth == 2 || todayMonth == 3 || todayMonth == 4)
												{
													var endMonth = 4;
													var closeDate = new Date();
													closeDate.setMonth(endMonth);
													closeDate.setDate(15);
													
													nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
												}
											
											if(todayMonth == 5 || todayMonth == 6 || todayMonth == 7)
												{
													var endMonth = 7;
													var closeDate = new Date();
													closeDate.setMonth(endMonth);
													closeDate.setDate(15);
													
													nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
												}
											
											if(todayMonth == 8 || todayMonth == 9 || todayMonth == 10)
												{
													var endMonth = 10;
													var closeDate = new Date();
													closeDate.setMonth(endMonth);
													closeDate.setDate(15);
													
													nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
												}
											
											//See if we need to set the credit note flag
											//
											var closeDateMonthEnd = new Date(closeDate.getFullYear(), closeDate.getMonth() + 1, 0);
											var originalBillingEndDate = nlapiStringToDate(billingEndDateString);
											
											if(originalBillingEndDate.getTime() <= closeDateMonthEnd.getTime())
												{
													//Update the credit note required checkbox
													//
													nlapiSetFieldValue('custbody_bbs_cre_not_req', 'T', false, true);
												}
										}
								}
						}
				}
			else
				{
					nlapiSetFieldValue('custbody_bbs_sales_order_close_date', null, false, true);
				}
		}
}

function getCloseDate(periodDate)
{
	
	var returnValue = '';
	var currentQuarter = null;
	
	var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
			[
			   ["isquarter","is","T"], 
			   "AND", 
			   ["isinactive","is","F"], 
			   "AND", 
			   ["enddate","onorafter",periodDate], 
			   "AND", 
			   ["startdate","onorbefore",periodDate]
			], 
			[
			   new nlobjSearchColumn("periodname").setSort(false)
			]
			);
	
	if(accountingperiodSearch && accountingperiodSearch.length > 0)
		{
			currentQuarter = accountingperiodSearch[0].getId();
			
			if(currentQuarter != null && currentQuarter != '')
				{
					var endDateString = null;
					
					var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
							[
							   ["isquarter","is","F"], 
							   "AND", 
							   ["isinactive","is","F"], 
							   "AND", 
							   ["isyear","is","F"], 
							   "AND", 
							   ["isadjust","is","F"],
							   "AND",
							   ["parent","anyof",currentQuarter]
							], 
							[
							   new nlobjSearchColumn("parent"), 
							   new nlobjSearchColumn("periodname"), 
							   new nlobjSearchColumn("startdate"), 
							   new nlobjSearchColumn("enddate").setSort(true)
							]
							);

					if(accountingperiodSearch && accountingperiodSearch.length > 0)
						{
							endDateString = accountingperiodSearch[0].getValue('enddate');
							
							if(endDateString != null && endDateString != '')
								{
									var endDate = nlapiStringToDate(endDateString);
									endDate.setDate(15);
									
									returnValue = endDate;
								}
						}
				}
		}
	
	return returnValue;
}
