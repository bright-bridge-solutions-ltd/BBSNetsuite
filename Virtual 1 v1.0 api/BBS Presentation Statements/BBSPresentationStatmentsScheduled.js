/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jun 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Start by seeing what partners have PR outstanding
	//
	var customrecord_bbs_presentation_recordSearch = getResults(nlapiCreateSearch("customrecord_bbs_presentation_record",
			[
			   ["custrecord_bbs_pr_status","anyof","1"]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_pr_partner",null,"GROUP")
			]
			));
	
	if(customrecord_bbs_presentation_recordSearch != null && customrecord_bbs_presentation_recordSearch.length > 0)
		{
			for (var int = 0; int < customrecord_bbs_presentation_recordSearch.length; int++) 
				{
					var partnerId = customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_partner",null,"GROUP");
					
					checkResources();
					
					libGenerateStatement(partnerId);
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

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}