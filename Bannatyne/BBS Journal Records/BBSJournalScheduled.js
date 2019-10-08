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
		var error = 0;
		var errors = new Array();
		var lines = 0;
	
		// run search to find region data from location records
		// define search filters
		var locationSearchFilters = new Array();
		locationSearchFilters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F'); // exclude inactive locations
		
		// define search columns
		var locationSearchColumns = new Array();
		locationSearchColumns[0] = new nlobjSearchColumn('internalid');
		locationSearchColumns[1] = new nlobjSearchColumn('custrecord_n103_cseg2'); // club region
		locationSearchColumns[2] = new nlobjSearchColumn('custrecord_n103_cseg1'); // spa region
		locationSearchColumns[3] = new nlobjSearchColumn('custrecord_n103_cseg3'); // sales region
		locationSearchColumns[4] = new nlobjSearchColumn('custrecord_n103_cseg4'); // estates region
		
		// run search
		var locationSearch = nlapiSearchRecord('location', null, locationSearchFilters, locationSearchColumns);
		nlapiLogExecution('AUDIT', 'Locations Found', 'There were ' + locationSearch.length + ' found');
		
		// run search to find records to be updated
		var transactionSearch = getResults(nlapiLoadSearch('transaction', 'customsearch_bbs_journals_for_update'));
		nlapiLogExecution('AUDIT', 'Records to be updated', 'There are ' + transactionSearch.length + ' records to be updated');
		
		// loop through search results
		for (var i = 0; i < transactionSearch.length; i++)
			{
				// reset lines variable to 0
				lines = 0;
			
				// retrieve the internal ID of the transaction record
				var recordID = transactionSearch[i].getValue('internalid', null, 'GROUP');
				
				try
					{
						// load the transaction record
						var transactionRecord = nlapiLoadRecord('cashrefund', recordID);
						
						// get the location from the 
						
						// get count of sublist lines on the transaction record
						var lineCount = transactionRecord.getLineItemCount('item');
						
						// loop through line count
						for (var x = 1; x <= lineCount; x++)
							{
								// get the internal ID of the location from the sublist line
								var recLocID = transactionRecord.getLineItemValue('item', 'location', x);
						
								// check if the recLocID variable returns a value
								if (recLocID)
									{
										lines++;
									
										// loop through the search results
										for (var z = 0; z < locationSearch.length; z++)
											{
												// get the internal ID of the location from the search
												var searchLocID = locationSearch[z].getValue('internalid');
												
												// check that the recLocID and searchLocID variables are the same
												if (recLocID == searchLocID)
													{
														// retrieve region data from the search
														var clubRegion = locationSearch[z].getValue('custrecord_n103_cseg2');
														var spaRegion = locationSearch[z].getValue('custrecord_n103_cseg1');
														var salesRegion = locationSearch[z].getValue('custrecord_n103_cseg3');
														var estatesRegion = locationSearch[z].getValue('custrecord_n103_cseg4');
														
														// escape the loop
														break;
													}
											}
								
										// set line item fields on transaction record
										transactionRecord.setLineItemValue('item', 'custcol_cseg2', x, clubRegion);
										transactionRecord.setLineItemValue('item', 'custcol_cseg1', x, spaRegion);
										transactionRecord.setLineItemValue('item', 'custcol_cseg3', x, salesRegion);
										transactionRecord.setLineItemValue('item', 'custcol_cseg4', x, estatesRegion);
										transactionRecord.commitLineItem('item');
									}
								else
									{
										nlapiLogExecution('AUDIT', 'Code Check', 'Line ' + x + ' could not be updated as the location field was not populated');
									}
							}
						
						// submit the invoice record
						var submittedRecord = nlapiSubmitRecord(transactionRecord, false, true); // record, doSourcing, ignoreMandatoryFields
						nlapiLogExecution('AUDIT', 'Record Updated', 'Record ' + submittedRecord + ' has been updated. There are ' + (transactionSearch.length - (i+1)) + ' records still to be updated');
						success++; // increase success variable
					}
				catch(e)
					{
						nlapiLogExecution('ERROR', 'An Error has occured updating record ' + recordID, e);
						errors.push(recordID);
						error++; // increase error variable
					}
				
				// get count of remaining usage limits
				checkResources();
			}
		
		nlapiLogExecution('AUDIT', 'Script Complete', transactionSearch.length + ' records to update | ' + success + ' records updated successfully | ' + error + ' errors');
		nlapiLogExecution('AUDIT', 'Errors', 'There were errors updating the following records: ' + errors);
	}

function checkResources()
	{
		var remaining = parseInt(nlapiGetContext().getRemainingUsage());
		nlapiLogExecution('AUDIT', 'Remaining Units', remaining + ' units remaining out of 10,000');
		
		if (remaining < 50)
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