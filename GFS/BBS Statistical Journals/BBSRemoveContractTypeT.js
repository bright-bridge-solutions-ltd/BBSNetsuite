/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jul 2020     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var summaryValues 			= {};
	var statJournalRecord		= null;

	//Find any statistical journals that have a contract type of "T"
	//
	var journalentrySearch = getResults(nlapiCreateSearch("journalentry",
			[
			   ["type","anyof","Journal"], 
			   "AND", 
			   ["cogs","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["accounttype","anyof","Stat"], 
			   "AND", 
			   ["location","anyof","3"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP")
			]
			));
					
	//For any statistical journal that is found, we will need to load then record
	//
	if(journalentrySearch!= null && journalentrySearch.length > 0)
		{
			for (var int2 = 0; int2 < journalentrySearch.length; int2++) 
				{
					statJournalRecord = null;
				
					checkResources();
				
					var statJournalId = journalentrySearch[int2].getValue("internalid",null,"GROUP");
				
					try
						{
							statJournalRecord = nlapiLoadRecord('statisticaljournalentry', statJournalId);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error loading stat journal with id = ' + statJournalId, err.message);
							statJournalRecord = null;
						}
					
					if(statJournalRecord != null)
						{
							var lines = statJournalRecord.getLineItemCount('line');
							
							for (var int = lines; int > 0; int--) 
								{
									var lineContractType = statJournalRecord.getLineItemValue('line', 'location', int);
									
									if(lineContractType == 3)
										{
											statJournalRecord.removeLineItem('line', int);
										}
								}
							
							var remainingLines = statJournalRecord.getLineItemCount('line');
							
							if(remainingLines == 0)
								{
									try
										{
											nlapiDeleteRecord('statisticaljournalentry', statJournalId);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error deleting stat journal with id = ' + statJournalId, err.message);
										}
								}
							else
								{
									try
										{
											nlapiSubmitRecord(statJournalRecord, true, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error saving stat journal with id = ' + statJournalId, err.message);
										}
								}
						}
				}
		}		
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
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
