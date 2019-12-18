/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Dec 2019     cedricgriffiths
 *
 */

//Get saved seraches from custom preferences
//
var SS_SALES_YTD_ID = nlapiGetContext().getPreference('custscript_bbs_ss_sales_ytd');
var SS_LAST_QUOTE_ID = nlapiGetContext().getPreference('custscript_bbs_ss_last_quote');
var SS_LAST_CALL_ID = nlapiGetContext().getPreference('custscript_bbs_ss_last_call');

	
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var resultsObject = getCustomers();
	processSales(resultsObject);
	processQuotes(resultsObject);
	processCalls(resultsObject);
	updateCustomer(resultsObject)
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function metricsObject(_salesValue, _lastQuote, _lastCall)
{
	this.salesYtd = _salesValue;
	this.lastQuote = _lastQuote;
	this.lastCall = _lastCall;
}

function getCustomers()
{
	var results = {};
	
	var customerSearch = getResults(nlapiCreateSearch("customer", 
			[
			], 
			[
			   new nlobjSearchColumn("altname")
			]
			));
	
	if(customerSearch != null && customerSearch.length > 0)
		{
			for (var int = 0; int < customerSearch.length; int++) 
				{
					var id = customerSearch[int].getId();
					
					results[id] = new metricsObject(Number(0), null, null);
				}
		
		}
	return results;
}

function processSales(_resultsObject)
{
	runSearch(SS_SALES_YTD_ID, _resultsObject);
}

function processQuotes(_resultsObject)
{
	runSearch(SS_LAST_QUOTE_ID, _resultsObject);
}

function processCalls(_resultsObject)
{
	runSearch(SS_LAST_CALL_ID, _resultsObject);
}

function updateCustomer(_resultsObject)
{
	for ( var id in _resultsObject) 
		{
			checkResources();
			
			if(_resultsObject[id].salesYtd != 0 || _resultsObject[id].lastQuote != null || _resultsObject[id].lastCall != null)
				{
					var fields = ['custentity_bbs_ytd_sales', 'custentity_bbs_last_quote', 'custentity_bbs_last_call'];
					var values = [_resultsObject[id].salesYtd, _resultsObject[id].lastQuote, _resultsObject[id].lastCall];
					
					try
						{
							nlapiSubmitField('customer', id, fields, values, false);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating customer id = ' + id, err.message);
						}
				}
		}
}

function runSearch(_searchId, _resultsObject)
{
	var savedSearch = nlapiLoadSearch(null, _searchId);
	var searchColumns = savedSearch.getColumns();
	var searchResults = getResults(savedSearch);
	
	if(searchResults != null && searchResults.length > 0)
		{
			for (var int = 0; int < searchResults.length; int++) 
				{
					var id = searchResults[int].getValue(searchColumns[0]);
					var value = searchResults[int].getValue(searchColumns[1]);
					
					try
						{
							switch (_searchId)
								{
									case SS_SALES_YTD_ID:
										_resultsObject[id].salesYtd = value;
										break;
								
									case SS_LAST_QUOTE_ID:
										_resultsObject[id].lastQuote = value;
										break;
								
									case SS_LAST_CALL_ID:
										_resultsObject[id].lastCall = value;
										break;
								}
						}
					catch(err)
						{
						
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
