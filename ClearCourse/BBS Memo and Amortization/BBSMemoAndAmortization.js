/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 May 2020     cedricgriffiths
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
function memoAndAmortizationAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			//Get details of the record we are working on
			//
			var newRecord 				= nlapiGetNewRecord();
			var	recordType 				= newRecord.getRecordType();
			var recordId				= newRecord.getId();
			var recordToProcess			= null;
			var amortizationSchedule	= nlapiGetContext().getSetting('SCRIPT', 'custscript_bbs_amort_schedule');
			var updated					= false;
			
			//Try to load the record
			//
			try
				{
					recordToProcess = nlapiLoadRecord(recordType, recordId);
				}
			catch(err)
				{
					recordToProcess	= null;
					nlapiLogExecution('ERROR', 'Error loading record ' + recordType + ' with id ' + recordId, err.message);
				}
			
			//Record loaded ok?
			//
			if(recordToProcess != null)
				{
					//Get the memo from the header
					//
					var memoMain = recordToProcess.getFieldValue('memo');
						
					//Get the number of expense lines to process
					//
					var expenseLines = recordToProcess.getLineItemCount('expense');
						
					//Loop through the expense lines
					//
					for (var expenseCounter = 1; expenseCounter <= expenseLines; expenseCounter++) 
						{
							//Process the memo on to the lines if required
							//
							var memoLine = recordToProcess.getLineItemValue('expense', 'memo', expenseCounter);
								
							if((memoLine == null || memoLine == '') && (memoMain != null && memoMain != ''))
								{
									recordToProcess.setLineItemValue('expense', 'memo', expenseCounter, memoMain);
									updated = true;
								}
							
							//Process the amortization dates
							//
							var amortizationStartDate 	= recordToProcess.getLineItemValue('expense', 'custcol_bbs_amort_start', expenseCounter);
							var amortizationEndDate 	= recordToProcess.getLineItemValue('expense', 'custcol_bbs_amort_end', expenseCounter);
							var customer				= recordToProcess.getLineItemValue('expense', 'custcol_bbs_customer', expenseCounter);
							
							if((amortizationStartDate != null && amortizationStartDate != '') || (amortizationEndDate != null && amortizationEndDate != ''))
								{
									recordToProcess.setLineItemValue('expense', 'amortizationsched', expenseCounter, amortizationSchedule);
									updated = true;
								}
							
							if(amortizationStartDate != null && amortizationStartDate != '')
								{
									recordToProcess.setLineItemValue('expense', 'amortizstartdate', expenseCounter, amortizationStartDate);
									updated = true;
								}
							
							if(amortizationEndDate != null && amortizationEndDate != '')
								{
									recordToProcess.setLineItemValue('expense', 'amortizationenddate', expenseCounter, amortizationEndDate);
									updated = true;
								}
							
							if(customer != null && customer != '')
								{
									recordToProcess.setLineItemValue('expense', 'customer', expenseCounter, customer);
									updated = true;
								}
						}
					
					//Save the record if required
					//
					if(updated)
						{
							try
								{
									nlapiSubmitRecord(recordToProcess, true, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving record ' + recordType + ' with id ' + recordId, err.message);
								}
							
						}
				}
		}
}
