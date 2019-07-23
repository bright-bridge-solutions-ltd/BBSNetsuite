/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jul 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var customrecord_bbs_customer_web_productSearch = getResults(nlapiCreateSearch("customrecord_bbs_customer_web_product",
			[
			   ["sum(formulanumeric: 1)","greaterthan","1"]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_web_product_customer",null,"GROUP"), 
			   new nlobjSearchColumn("custrecord_bbs_web_product_item",null,"GROUP"), 
			   new nlobjSearchColumn("formulanumeric",null,"SUM").setFormula("1")
			]
			));
	if(customrecord_bbs_customer_web_productSearch != null && customrecord_bbs_customer_web_productSearch.length > 0)
		{
			for (var int = 0; int < customrecord_bbs_customer_web_productSearch.length; int++) 
				{
					checkResources();
					
					var customer = customrecord_bbs_customer_web_productSearch[int].getValue("custrecord_bbs_web_product_customer",null,"GROUP");
					var product = customrecord_bbs_customer_web_productSearch[int].getValue("custrecord_bbs_web_product_item",null,"GROUP");
					
					if(customer != null && customer != '' && product != null && product != '')
						{
							var customrecord_bbs_customer_web_productSearch2 = nlapiSearchRecord("customrecord_bbs_customer_web_product",null,
									[
									   ["custrecord_bbs_web_product_customer","anyof",customer], 
									   "AND", 
									   ["custrecord_bbs_web_product_item","anyof",product]
									], 
									[
									   new nlobjSearchColumn("custrecord_bbs_web_product_customer"), 
									   new nlobjSearchColumn("custrecord_bbs_web_product_item")
									]
									);
							
							if(customrecord_bbs_customer_web_productSearch2 != null && customrecord_bbs_customer_web_productSearch2.length > 1)
								{
									for (var int2 = 1; int2 < customrecord_bbs_customer_web_productSearch2.length; int2++) 
										{
											checkResources();
											
											var catalogueId = customrecord_bbs_customer_web_productSearch2[int2].getId();
											
											nlapiDeleteRecord("customrecord_bbs_customer_web_product", catalogueId);
										}
								}
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
	
	if(remaining < 100)
		{
			var yieldState = nlapiYieldScript();
			//nlapiLogExecution('DEBUG', 'Yield Status', yieldState.status + ' ' + yieldState.size + ' ' +  yieldState.reason + ' ' + yieldState.information);
		}
}
