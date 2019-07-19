/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Jul 2019     sambatten
 *
 */

function updateJournals(type)
	{
		// initialise variables
		var success = 0;
		var failure = 0;
	
		// run search to find records to be updated
		// define search filters
		var searchFilters = new Array();
		searchFilters[0] = new nlobjSearchFilter('type', null, 'anyof', 'Journal');
		searchFilters[1] = new nlobjSearchFilter('trandate', null, 'onorafter', '1/6/2019');
		searchFilters[3] = new nlobjSearchFilter('memorized', null, 'is', 'F');
		
		// define search columns
		var searchColumns = new Array();
		searchColumns[0] = new nlobjSearchColumn('internalid', null, 'GROUP');
		
		// run search
		var searchResults = getResults(nlapiCreateSearch('journalentry', searchFilters, searchColumns));
		
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
								// get the internal ID of the location from the sublist line
								var locationID = journalRecord.getLineItemValue('line', 'location', x);
						
								// check if the locationID variable returns a value
								if (locationID)
									{
										// load the location record
										var locationRecord = nlapiLoadRecord('location', locationID);
								
										// return values from the location record
										var clubRegion = locationRecord.getFieldValue('custrecord_n103_cseg2');
										var spaRegion = locationRecord.getFieldValue('custrecord_n103_cseg1');
										var salesRegion = locationRecord.getFieldValue('custrecord_n103_cseg3');
										var estatesRegion = locationRecord.getFieldValue('custrecord_n103_cseg4');
								
										// set line item fields on journal record
										journalRecord.setLineItemValue('line', 'custcol_cseg2', x, clubRegion);
										journalRecord.setLineItemValue('line', 'custcol_cseg1', x, spaRegion);
										journalRecord.setLineItemValue('line', 'custcol_cseg3', x, salesRegion);
										journalRecord.setLineItemValue('line', 'custcol_cseg4', x, estatesRegion);
										journalRecord.commitLineItem('line');
									}
								else
									{
										nlapiLogExecution('DEBUG', 'Code Check', 'Line ' + x ' could not be updated as the location field was not populated');
									}
							}
						
						// submit the journal record
						var submittedRecord = nlapiSubmitRecord(journalRecord);
						nlapiLogExecution('DEBUG', 'Record Updated', 'Record ' + submittedRecord + ' has been updated. There are ' + (searchResults.length - (i+1)) + ' records still to be updated');
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
		
		nlapiLogExecution('DEBUG', 'Script Complete', searchResults.length + ' records to update | ' + success + ' records updated successfully | ' + error + ' | errors');
	}

function checkResources()
	{
		var remaining = parseInt(nlapiGetContext().getRemainingUsage());
		nlapiLogExecution('DEBUG', 'Remaining Units', remaining + ' units remaining out of 10,000');
		
		if (remaining < 250)
			{
				nlapiYieldScript();
			}
	}

function getResults(search)
	{
		var searchResult = search.runSearch();
		
		//Get the initial set of results
		//
		var start = 0;
		var end = 1000;
		var searchResultSet = searchResult.getResults(start, end);
		var resultlen = searchResultSet.length;
	
		//If there is more than 1000 results, page through them
		//
		while (resultlen == 1000) 
			{
					start += 1000;
					end += 1000;
	
					var moreSearchResultSet = searchResult.getResults(start, end);
					
					if(moreSearchResultSet == null)
						{
							resultlen = 0;
						}
					else
						{
							resultlen = moreSearchResultSet.length;
							searchResultSet = searchResultSet.concat(moreSearchResultSet);
						}
					
					
			}
		
		return searchResultSet;
	}
