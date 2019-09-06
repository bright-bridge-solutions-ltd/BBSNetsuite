/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Sep 2019     cedricgriffiths
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
function salesInvoiceAS(type)
{	
	//Only needs to work on create of an invoice
	//
	if(type == 'create')
		{
			var invoiceId = nlapiGetRecordId();
			var invoiceRecord = null;
			
			//Try to load the invoice record
			//
			try
				{
					invoiceRecord = nlapiLoadRecord('invoice', invoiceId);
				}
			catch(err)
				{
					invoiceRecord = null;
					nlapiLogExecution('ERROR', 'Error reading sales invoice id = ' + invoiceId, err.message);
				}
			
			//Do we have an invoice record to process
			//
			if(invoiceRecord != null)
				{
					//Get the billing type
					//
					var invoiceBillingType = invoiceRecord.getFieldValue('class');
					
					//Get the off billing cycle indicator
					//
					var invoiceOffBillingCycle = invoiceRecord.getFieldValue('custbody_bbs_off_billing_cycle');
					
					//Get the created from field
					//
					var createdFrom = invoiceRecord.getFieldValue('createdfrom');
					
					//Get the invoice date & day, month, year, also the q1-q4 dates
					//
					var invoiceDate = nlapiStringToDate(invoiceRecord.getFieldValue('trandate'));
					var invoiceDay = invoiceDate.getDate();
					var invoiceMonth = invoiceDate.getMonth();
					var invoiceYear = invoiceDate.getFullYear();
					
					var q1Start = new Date(invoiceYear, 0, 1);	//1st Jan
					var q1End = new Date(invoiceYear, 2, 31);	//31st Mar
					
					var q2Start = new Date(invoiceYear, 3, 1);	//1st Apr
					var q2End = new Date(invoiceYear, 5, 30);	//30th Jun
					
					var q3Start = new Date(invoiceYear, 6, 1);	//1st Jul
					var q3End = new Date(invoiceYear, 8, 31);	//31st Sep
					
					var q4Start = new Date(invoiceYear, 9, 1);	//1st Oct
					var q4End = new Date(invoiceYear, 11, 31);	//31st Dec
					
					var offBillingQ1Start = new Date(invoiceYear, 11, 1);	//1st Dec
					var offBillingQ1End = new Date(invoiceYear, 1, 28);		//28th Feb
					
					var offBillingQ2Start = new Date(invoiceYear, 2, 1);	//1st Mar
					var offBillingQ2End = new Date(invoiceYear, 4, 31);		//31st May
					
					var offBillingQ3Start = new Date(invoiceYear, 5, 1);	//1st Jun
					var offBillingQ3End = new Date(invoiceYear, 7, 31);		//31st Aug
					
					var offBillingQ4Start = new Date(invoiceYear, 8, 1);	//1st Sep
					var offBillingQ4End = new Date(invoiceYear, 10, 30);	//30th Nov
					
				
					//Only need to process Rental invoices that are craeted from a sales order
					//
					if(invoiceBillingType == 1 && createdFrom != null && createdFrom != '')
						{
							//Get the count of lines on the invoice
							//
							var invoiceLines = invoiceRecord.getLineItemCount('item');
						
							//Loop through the lines
							//
							for (var int = 1; int <= invoiceLines; int++) 
								{
									var invoiceLineFrequency = invoiceRecord.getLineItemValue('item', 'custcol_bbs_billing_frequency', int);
									
									switch(invoiceLineFrequency)
										{
											case '1':	//Monthly
												
												//Rev rec dates are just the start & end dates of the invoice month
												//
												var revRecStart = new Date(invoiceYear, invoiceMonth, 1);
												var revRecEnd = getLastDayOfMonth(invoiceDate);
												
												//Set the rev rec dates on the line
												//
												invoiceRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_start_date', int, nlapiDateToString(revRecStart));
												invoiceRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_end_date', int, nlapiDateToString(revRecEnd));
												
												break;
												
											case '2':	//Quarterly
												
												if(invoiceOffBillingCycle == 'T')
													{
														//Specific processing for the off billing cycle customer
														//
														var revRecStart = null;
														var revRecEnd = null;
														
														if(invoiceDate.getTime() >= offBillingQ1Start)
															{
																revRecStart = offBillingQ1Start;				//1st Dec this year
																revRecEnd = new Date(invoiceYear + 1, 1, 28);	//28th Feb next year
															}
														
														if(invoiceDate.getTime() <= offBillingQ1End)
															{
																revRecStart = new Date(invoiceYear - 1, 11, 01);	//1st Dec last year
																revRecEnd = offBillingQ1End; 						//28th Feb this year
															}
											
														if(invoiceDate.getTime() >= offBillingQ2Start && invoiceDate.getTime() <= offBillingQ2End)
															{
																revRecStart = offBillingQ2Start;
																revRecEnd = offBillingQ2End;
															}
													
														if(invoiceDate.getTime() >= offBillingQ3Start && invoiceDate.getTime() <= offBillingQ3End)
															{
																revRecStart = offBillingQ3Start;
																revRecEnd = offBillingQ3End;
															}
													
														if(invoiceDate.getTime() >= offBillingQ4Start && invoiceDate.getTime() <= offBillingQ4End)
															{
																revRecStart = offBillingQ4Start;
																revRecEnd = offBillingQ4End;
															}
												
													
														//Set the rev rec dates on the line
														//
														invoiceRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_start_date', int, nlapiDateToString(revRecStart));
														invoiceRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_end_date', int, nlapiDateToString(revRecEnd));
													}
												else
													{
														//Compare the invoice date with the quarterly dates & set the rev rec start & end dates
														//
														var revRecStart = null;
														var revRecEnd = null;
														
														if(invoiceDate.getTime() >= q1Start && invoiceDate.getTime() <= q1End)
															{
																revRecStart = q1Start;
																revRecEnd = q1End;
															}
													
														if(invoiceDate.getTime() >= q2Start && invoiceDate.getTime() <= q2End)
															{
																revRecStart = q2Start;
																revRecEnd = q2End;
															}
													
														if(invoiceDate.getTime() >= q3Start && invoiceDate.getTime() <= q3End)
															{
																revRecStart = q3Start;
																revRecEnd = q3End;
															}
													
														if(invoiceDate.getTime() >= q4Start && invoiceDate.getTime() <= q4End)
															{
																revRecStart = q4Start;
																revRecEnd = q4End;
															}
													
														//Set the rev rec dates on the line
														//
														invoiceRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_start_date', int, nlapiDateToString(revRecStart));
														invoiceRecord.setLineItemValue('item', 'custcol_bbs_revenue_rec_end_date', int, nlapiDateToString(revRecEnd));
													}
												
												break;
										}
								}
							
							//Update the invoice record
							//
							try
								{
									nlapiSubmitRecord(invoiceRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating sales invoice id = ' + invoiceId, err.message);
								}
						}
				}
		}
}

function getLastDayOfMonth(_inputDate)
{
	var returnedDate = null;
	
	returnedDate = new Date(_inputDate.getFullYear(), _inputDate.getMonth() + 1, 0);
	
	return returnedDate;
}
