/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Jun 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var inventoryitemSearch = getResults(nlapiCreateSearch("inventoryitem",
			[
			   ["type","anyof","InvtPart"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("displayname"), 
			   new nlobjSearchColumn("salesdescription"), 
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("baseprice")
			]
			));
	
	if(inventoryitemSearch != null && inventoryitemSearch.length > 0)
		{
			for (var int = 0; int < inventoryitemSearch.length; int++) 
				{
					var inventoryId = inventoryitemSearch[int].getId();
					
					checkResources();
					
					var inventoryRecord = null;
					
					try
						{
							inventoryRecord = nlapiLoadRecord('inventoryitem', inventoryId);
						}
					catch(err)
						{
							inventoryRecord = null;
						}
					
					if(inventoryRecord != null)
						{
							var binCount = inventoryRecord.getLineItemCount('binnumber');
							
							for (var int2 = 1; int2 <= binCount; int2++) 
								{
									inventoryRecord.setLineItemValue('binnumber', 'preferredbin', int2, 'F');
								}
							
							try
								{
									nlapiSubmitRecord(inventoryRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating item record id = ' + inventoryId, err.message);
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