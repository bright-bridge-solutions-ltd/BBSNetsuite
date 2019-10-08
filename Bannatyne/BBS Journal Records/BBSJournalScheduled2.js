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
						var transactionRecord = nlapiLoadRecord('inventoryadjustment', recordID);
						
						// get the location from the transaction record
						var location = transactionRecord.getFieldValue('adjlocation');
						
						// define fields to be looked-up
						var fields = ['custrecord_n103_cseg2', 'custrecord_n103_cseg1', 'custrecord_n103_cseg3', 'custrecord_n103_cseg4'];
						
						// lookup fields on the location record
						var locationLookup = nlapiLookupField('location', location, fields);
						
						// return values from the locationLookup
						var clubRegion = locationLookup.custrecord_n103_cseg2;
						var spaRegion = locationLookup.custrecord_n103_cseg1;
						var salesRegion = locationLookup.custrecord_n103_cseg3;
						var estatesRegion = locationLookup.custrecord_n103_cseg4;
						
						// set region fields on the record
						transactionRecord.setFieldValue('custbody_cseg2', clubRegion);
						transactionRecord.setFieldValue('custbody_cseg1', spaRegion);
						transactionRecord.setFieldValue('custbody_cseg3', salesRegion);
						transactionRecord.setFieldValue('custbody_cseg4', estatesRegion);
						
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