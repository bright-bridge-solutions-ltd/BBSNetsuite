/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 May 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var searchesAndFields = {};
	
	searchesAndFields['customsearch_bbs_actual_forecastq1'] = 'custentity_bbs_act_fore_sales_q1';
	searchesAndFields['customsearch_bbs_actual_forecastq2'] = 'custentity_bbs_act_fore_sales_q2';
	searchesAndFields['customsearch_bbs_actual_forecastq3'] = 'custentity_bbs_act_fore_sales_q3';
	searchesAndFields['customsearch_bbs_actual_forecastq4'] = 'custentity_bbs_act_fore_sales_q4';
	
	for ( var searcheAndField in searchesAndFields) 
		{
			var searchName = searcheAndField;
			var fieldName = searchesAndFields[searcheAndField];
			
			var results = getResults(nlapiLoadSearch(null, searchName));
			
			if(results != null && results.length > 0)
				{
					var columns = results[0].getAllColumns();
					
					for (var int = 0; int < results.length; int++) 
						{
							var salesrepId = results[int].getValue(columns[0]);
							var amount = Number(results[int].getValue(columns[1]));
						
							if(salesrepId != null && salesrepId != '')
								{
									try
										{
											nlapiSubmitField('employee', salesrepId, fieldName, amount, false);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error updating employee id = ' + salesrepId, err.message);
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
