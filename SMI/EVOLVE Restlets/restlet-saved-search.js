/**
 * @param {Object} params
 * @param {Number} pageNum
 * @param {Number} pageSize
 * @returns {{success: boolean, message: string, results: {}}}
 */
function getSearchResults(params) 
{
	var result = 	{
			  		success: true,
			  		message: '',
			  		results: {},
			  		params: params
	  				};
	  try 
	  	{
		    var search = nlapiLoadSearch(params.type, params.id);
		    var resultSet = search.runSearch();
		    
		    result.results.columns = resultSet.getColumns();
		    
		    result.results = getTotalPages(resultSet, Number(params.pageSize));
		    
		    result.results.data = getResults(search, params, resultSet);
		    
		    result.message = 'Results for page ' + params.pageNum + '/' + result.results.pages;
	  	} 
	  catch (error) 
	  	{
		    result.success = false;
		    result.message = error;
	  	}
	  
	  return result;
}

/**
 * @param {Number} pageNum
 * @param {Number} pageSize
 * @returns {{pageSize: number, pageNum: number, ...}}
 */
function getSearchOptions(pageNum, pageSize) 
{
	var searchOptions = {
						pageNum: 1,
						pageSize: 1000
						};
	
  if (pageNum) searchOptions.pageNum = pageNum;
  if (pageSize) searchOptions.pageSize = pageSize;
  
  return searchOptions;
}

/**
 * @param {Object} resultSet
 * @param {Number} pageSize
 * @returns {{total: (*|number), pages: number}}
 */
function getTotalPages(resultSet, pageSize) 
{
	var count = Number(0);
	var currentIndex = Number(0);
	var pages = Number(0);
	
	do 
		{
			count = resultSet.getResults(currentIndex, currentIndex + pageSize).length;
			currentIndex += pageSize;
			pages++;
		}
	while (count == pageSize);
	
	return 	{
			total: count,
			pages: pages
			};
}

/**
 * @param {Object} search
 * @param {Object} params
 * @param {Object} resultSet
 */
function getResults(search, params, resultSet) 
{
	var results = [];
	var columns = search.getColumns();
	
	var i = (Number(params.pageNum) * Number(params.pageSize)) - Number(params.pageSize);
	
	var slice = resultSet.getResults(i, i + Number(params.pageSize));
	
	slice.forEach(function(result) 
			{
				var resultObj = {};
				columns.forEach(function(column) 
						{
							resultObj[column.getName()] = result.getValue(column);
						});
				
				results.push(resultObj);
			});
	
	return results;
}
