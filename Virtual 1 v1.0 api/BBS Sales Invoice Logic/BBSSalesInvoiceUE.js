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
				}
			
			//Do we have an invoice record to process
			//
			if(invoiceRecord != null)
				{
					//Get the billing type
					//
					var invoiceBillingType = invoiceRecord.getFieldValue('class');
					
					//Get the invoice date
					//
					var invoiceDate = invoiceRecord.getFieldValue('class');
					
					//Only need to process Rental invoices
					//
					if(invoiceBillingType == 1)
						{
							//Get the count of lines on the invoice
							//
							var invoiceLines = invoiceRecord.getLineItemCount('item');
						
							//Loop through the lines
							//
							for (var int = 0; int < array.length; int++) 
								{
									var invoiceLineFrequency = invoiceRecord.getLineItemValue('item', 'custcol_bbs_billing_frequency', int);
									
									switch(invoiceLineFrequency)
										{
											case 1:	//Monthly
												
												
												break;
												
											case 2:	//Quarterly
												
												
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
