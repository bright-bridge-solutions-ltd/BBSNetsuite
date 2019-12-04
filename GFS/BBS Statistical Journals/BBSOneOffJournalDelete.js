/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Dec 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var journalentrySearch = getResults(nlapiCreateSearch("journalentry",
			[
			   ["type","anyof","Journal"], 
			   "AND", 
			   ["statistical","is","T"], 
			   "AND", 
			   ["datecreated","onorafter","28-Nov-2019 12:00 am"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["line","equalto","0"]
			], 
			[
			   new nlobjSearchColumn("trandate"), 
			   new nlobjSearchColumn("postingperiod"), 
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("memo")
			]
			));
	
	if(journalentrySearch != null && journalentrySearch.length > 0)
		{
			for (var int = 0; int < journalentrySearch.length; int++) 
				{
					checkResources();
					
					var journalId = journalentrySearch[int].getId();
					
					try
						{
							nlapiDeleteRecord('statisticaljournalentry', journalId);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error deleting journal with id = ' + journalId, err.message);
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