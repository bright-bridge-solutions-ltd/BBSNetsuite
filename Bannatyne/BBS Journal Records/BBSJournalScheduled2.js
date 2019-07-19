/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Jul 2019     sambatten
 *
 */

function updateJournals(type)
	{
		// initialise variables
		var success = 0;
		var error = 0;
	
		// run search to find records to be updated
		// define search filters
		var searchFilters = new Array();
		searchFilters[0] = new nlobjSearchFilter('type', null, 'anyof', 'Journal');
		searchFilters[1] = new nlobjSearchFilter('memo', null, 'contains', 'ARC');
		searchFilters[2] = new nlobjSearchFilter('account', null, 'anyof', 937); // account is 41400 Sales:Membership income:Brightlime income:Other monthly subscriptions
		
		// define search columns
		var searchColumns = new Array();
		searchColumns[0] = new nlobjSearchColumn('internalid', null, 'GROUP');
		
		// run search
		var searchResults = nlapiSearchRecord('journalentry', null, searchFilters, searchColumns);
		
		nlapiLogExecution('DEBUG', 'Records to be updated', searchResults.length);
		
		// loop through search results
		for (var i = 0; i < searchResults.length; i++)
			{
				// retrieve the internal ID of the journal record
				var recordID = searchResults[i].getValue('internalid', null, 'GROUP');
				
				try
					{
						// load the journal record
						var journalRecord = nlapiLoadRecord('journalentry', recordID);
						
						// get count of sublist lines on the journal record
						var lineCount = journalRecord.getLineItemCount('line');
						
						// loop through line count
						for (var x = 1; x <= lineCount; x++)
							{
								// get the value of the account and memo fields
								var account = journalRecord.getLineItemValue('line', 'account', x);
								var memo = journalRecord.getLineItemValue('line', 'memo', x);
	
								// check that the account variable returns 937 (41400 Sales:Membership income:Brightlime income:Other monthly subscriptions) AND the memo variable contains ARC
								if (account == 937 && memo.indexOf('ARC') >= 0)
									{
										// set the account field to 942 (41900 Sales:Membership income:Brightlime income:Bad debt provision)
										journalRecord.setLineItemValue('line', 'account', x, 942);
										journalRecord.commitLineItem('line');
									}
							}
						
						// submit the journal record
						var submittedRecord = nlapiSubmitRecord(journalRecord);
						nlapiLogExecution('DEBUG', 'Record Updated', 'Record ' + submittedRecord + ' has been updated. There are ' + (searchResults.length - (i+1)) + ' still to be updated');
						success++; // increase success variable
					}
				catch(e)
					{
						nlapiLogExecution('DEBUG', 'An Error has occured updating record ' + recordID, e);
						error++; // increase error variable
					}
						
						
				// get count of remaining usage limits
				checkResources();
			}
		
		nlapiLogExecution('DEBUG', 'Script Complete', searchResults.length + ' records to update | ' + success + ' records updated successfully | ' + error + ' errors');
	}

function checkResources()
	{
		var remaining = parseInt(nlapiGetContext().getRemainingUsage());
		nlapiLogExecution('DEBUG', 'Remaining Units', remaining + ' units remaining out of 10,000');
		
		if (remaining < 50)
			{
				nlapiYieldScript();
			}
	}