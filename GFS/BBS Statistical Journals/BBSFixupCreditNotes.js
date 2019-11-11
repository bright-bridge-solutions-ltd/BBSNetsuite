/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Nov 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var creditmemoSearch = getResults(nlapiCreateSearch("creditmemo",
			[
			   ["type","anyof","CustCred"], 
			   "AND", 
			   [["custcol_bbs_consignments","greaterthan","0"],"OR",["custcol_bbs_parcels","greaterthan","0"]]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP")
			]
			));
	
	if(creditmemoSearch != null && creditmemoSearch.length > 0)
		{
			for (var int = 0; int < creditmemoSearch.length; int++) 
				{
					checkResources();
				
					var tranId = creditmemoSearch[int].getValue("internalid",null,"GROUP");
					
					var creditMemo = null;
					
					try
						{
							creditMemo = nlapiLoadRecord('creditmemo', tranId);
						}
					catch(err)
						{
							creditMemo = null;
						}
					
					if(creditMemo != null)
						{
							var lines = creditMemo.getLineItemCount('item');
							
							for (var int2 = 1; int2 <= lines; int2++) 
								{
									var parcels = Number(creditMemo.getLineItemValue('item', 'custcol_bbs_parcels', int2));
									var consignments = Number(creditMemo.getLineItemValue('item', 'custcol_bbs_consignments', int2));
								
									//Check if the parcels variable is a positive value
									//
									if (parcels > 0)
										{
											//Convert parcels to a negative number
											//
											parcels = Math.abs(parcels) * -1.0;
										}
									
									//Check if the consignments variable is a positive value
									//
									if (consignments > 0)
										{
											//Convert consignments to a negative number
											//
											consignments = Math.abs(consignments) * -1.0;
										}
									
									creditMemo.setLineItemValue('item', 'custcol_bbs_parcels', int2, parcels);
									creditMemo.setLineItemValue('item', 'custcol_bbs_consignments', int2, consignments);
								}
							
							try
								{
									nlapiSubmitRecord(creditMemo, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving credit note id = ' + tranId, err.message);
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
