/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Oct 2020     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Run a search to find all IF's that are not shipped
	//
	var itemfulfillmentSearch = getResults(nlapiCreateSearch("itemfulfillment",
			[
			   ["type","anyof","ItemShip"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["createdfrom.type","anyof","TrnfrOrd"],
			   "AND", 
			   ["externalid","anyof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("internalid")
			]
			));
	
	if(itemfulfillmentSearch != null && itemfulfillmentSearch.length > 0)
		{
			for (var int = 0; int < itemfulfillmentSearch.length; int++) 
				{
					checkResources();
					
					var recordId = itemfulfillmentSearch[int].getValue("internalid");
					var tranId = itemfulfillmentSearch[int].getValue("tranid");
					
					try
						{
							nlapiSubmitField('itemfulfillment', recordId, 'externalid', tranId, false);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating external id on IF ' + recordId, err.message);
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
				resultlen = moreSearchResultSet.length;

				searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;
}