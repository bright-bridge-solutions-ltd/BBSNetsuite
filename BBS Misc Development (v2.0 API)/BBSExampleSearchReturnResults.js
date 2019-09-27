
function getResults(_searchObject)
{
	var results = [];

	var pageData = _searchObject.runPaged({pageSize: 1000});

	for (var int = 0; int < pageData.pageRanges.length; int++) 
		{
			var searchPage = pageData.fetch({index: int});
			var data = searchPage.data;
			
			results = results.concat(data);
		}

	return results;
}