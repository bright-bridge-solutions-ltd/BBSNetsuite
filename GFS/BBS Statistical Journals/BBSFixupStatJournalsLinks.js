/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2019     cedricgriffiths
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
			   ["accounttype","anyof","Stat"], 
			   "AND", 
			   ["custbody_bbs_originating_transaction","anyof","@NONE@"], 
			   "AND", 
			   ["memomain","isnotempty",""]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP"), 
			   new nlobjSearchColumn("tranid",null,"GROUP"), 
			   new nlobjSearchColumn("memomain",null,"GROUP")
			]
			));
	
	if(journalentrySearch != null && journalentrySearch.length > 0)
		{
			for (var int = 0; int < journalentrySearch.length; int++) 
				{
					checkResources();
				
					var journalId = journalentrySearch[int].getValue("internalid",null,"GROUP");
					var memo = journalentrySearch[int].getValue("memomain",null,"GROUP");
					
					var originalTransactionId = findTransaction(memo);
					
					if(originalTransactionId != null)
						{
							try
								{
									nlapiSubmitField('statisticaljournalentry', journalId, 'custbody_bbs_originating_transaction', originalTransactionId, false);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating journal id = ' + journalId, err.message);
								}
						}
				}
		}
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function findTransaction(_memo)
{
	var originalTrans = null;
	
	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["mainline","is","T"], 
			   "AND", 
			   ["numbertext","is",_memo], 
			   "AND", 
			   ["type","anyof","Journal","CustCred","CustInvc"]
			], 
			[
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity")
			]
			);
	
	if(transactionSearch != null && transactionSearch.length == 1)
		{
			originalTrans = transactionSearch[0].getId();
		}
	
	return originalTrans;
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
