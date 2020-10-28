/**
 * Module Description
 * 
 * Version    	Date            	Author           Remarks
 * 1.00      	06 Sep 2019     	cedricgriffiths
 * 1.10			17 June 2020		sambatten
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
function salesOrderCloseDateAS(type)
{

	if(type == 'edit')
		{
			//Get old & new records
			//
			var newRecord = nlapiGetNewRecord();
			var oldRecord = nlapiGetOldRecord();
			
			//Get old & new versions of the billing end date
			//
			var newBillingEndDate = newRecord.getFieldValue('custbody_bbs_billing_end_date');
			var oldBillingEndDate = oldRecord.getFieldValue('custbody_bbs_billing_end_date');
			var salesOrderId = newRecord.getId();
			
			//Has the date changed?
			//
			if(newBillingEndDate != oldBillingEndDate)
				{
					processBillingEndDate(newRecord, salesOrderId);
				}
		}	
	
	if(type == 'create')
		{
			var newRecord 			= nlapiGetNewRecord();
			var newBillingEndDate 	= newRecord.getFieldValue('custbody_bbs_billing_end_date');
			var salesOrderId 		= newRecord.getId();
			
			//Has the date changed?
			//
			if(newBillingEndDate != null && newBillingEndDate != '')
				{
					processBillingEndDate(newRecord, salesOrderId);
				}
		}	
}		
			
function processBillingEndDate(newRecord, salesOrderId)
	{
					var billingEndDateString = newRecord.getFieldValue('custbody_bbs_billing_end_date');
					
					if(billingEndDateString != null && billingEndDateString != '')
						{
							var billingFrequency = null;
							var billingEndDate = nlapiStringToDate(billingEndDateString);
							var billingOffCycle = newRecord.getFieldValue('custbody_bbs_off_billing_cycle');
							var lineCount = newRecord.getLineItemCount('item');
							
							for (var int = 1; int <= lineCount; int++) 
								{
									var lineFrequency = newRecord.getLineItemValue('item', 'custcol_bbs_billing_frequency', int);
									
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
											closeDate.setDate(27);
											closeDate.setMonth(closeDate.getMonth() - 1);
											
											nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false);
											//nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
											
											//See if we need to set the credit note flag
											//
											var closeDateMonthEnd = new Date(closeDate.getFullYear(), closeDate.getMonth() + 1, 0);
											var originalBillingEndDate = nlapiStringToDate(billingEndDateString);
											
											if(originalBillingEndDate.getTime() <= closeDateMonthEnd.getTime())
												{
													//Update the credit note required checkbox
													//
													nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_cre_not_req', 'T', false);
													//nlapiSetFieldValue('custbody_bbs_cre_not_req', 'T', false, true);
												}
										}
									
									if(billingFrequency == 2)	//Quarterly
										{
											if(billingOffCycle == 'F')
												{
													var today = new Date();
													var closeDate = getCloseDate(today);
													
													nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false);
													//nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
													
													//See if we need to set the credit note flag
													//
													var closeDateMonthEnd = new Date(closeDate.getFullYear(), closeDate.getMonth() + 1, 0);
													var originalBillingEndDate = nlapiStringToDate(billingEndDateString);
													
													if(originalBillingEndDate.getTime() <= closeDateMonthEnd.getTime())
														{
															//Update the credit note required checkbox
															//
															nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_cre_not_req', 'T', false);
															//nlapiSetFieldValue('custbody_bbs_cre_not_req', 'T', false, true);
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
															closeDate.setDate(27);
															
															if(todayMonth == 11)
																{
																	closeDate.setYear(closeDate.getFullYear() + 1);
																}
															
															nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false);
															//nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
														}
													
													if(todayMonth == 2 || todayMonth == 3 || todayMonth == 4)
														{
															var endMonth = 4;
															var closeDate = new Date();
															closeDate.setMonth(endMonth);
															closeDate.setDate(27);
															
															nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false);
															//nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
														}
													
													if(todayMonth == 5 || todayMonth == 6 || todayMonth == 7)
														{
															var endMonth = 7;
															var closeDate = new Date();
															closeDate.setMonth(endMonth);
															closeDate.setDate(27);
															
															nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false);
															//nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
														}
													
													if(todayMonth == 8 || todayMonth == 9 || todayMonth == 10)
														{
															var endMonth = 10;
															var closeDate = new Date();
															closeDate.setMonth(endMonth);
															closeDate.setDate(27);
															
															nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false);
															//nlapiSetFieldValue('custbody_bbs_sales_order_close_date', nlapiDateToString(closeDate), false, true);
														}
													
													//See if we need to set the credit note flag
													//
													var closeDateMonthEnd = new Date(closeDate.getFullYear(), closeDate.getMonth() + 1, 0);
													var originalBillingEndDate = nlapiStringToDate(billingEndDateString);
													
													if(originalBillingEndDate.getTime() <= closeDateMonthEnd.getTime())
														{
															//Update the credit note required checkbox
															//
															nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_cre_not_req', 'T', false);
															//nlapiSetFieldValue('custbody_bbs_cre_not_req', 'T', false, true);
														}
												}
										}
								}
						}
					else
						{
							nlapiSubmitField('salesorder', salesOrderId, 'custbody_bbs_sales_order_close_date', null, false);
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
									endDate.setDate(27);
									
									returnValue = endDate;
								}
						}
				}
		}
	
	return returnValue;
}
