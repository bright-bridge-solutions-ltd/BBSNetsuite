/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Apr 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var cashsaleSearch = getResults(nlapiCreateSearch("cashsale",
			[
			   ["type","anyof","CashSale"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["customform","anyof","128"], 
			   "AND", 
			   ["datecreated","within","29/7/2019 12:00 am","1/8/2019 11:00 pm"]
			], 
			[
			   new nlobjSearchColumn("entity")
			]
			));
	
	if(cashsaleSearch != null && cashsaleSearch.length > 0)
		{
			for (var int = 0; int < cashsaleSearch.length; int++) 
				{
					checkResources();
					
					var recordId = cashsaleSearch[int].getId();
					
					try
						{
							nlapiDeleteRecord('cashsale', recordId);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Cannnot delete record with id = ' + recordId, err.message);
						}
				}
			
			
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
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == 1000) 
				{
						start += 1000;
						end += 1000;
						
						var moreSearchResultSet = searchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
		
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
		}
	return searchResultSet;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			var yieldState = nlapiYieldScript();
			nlapiLogExecution('DEBUG', 'Yield Status', yieldState.status + ' ' + yieldState.size + ' ' +  yieldState.reason + ' ' + yieldState.information);
		}
}