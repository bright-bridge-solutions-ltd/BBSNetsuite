/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 May 2019     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function presentationRecordsSuitelet(request, response)
{

	
	
	
	var customSearch = nlapiLoadSearch(null, 'customsearch910');

	var searchColumns = customSearch.getColumns();

	for(var int = 0; int < searchColumns.length; int++)
	{
	  var c = searchColumns[int].getLabel();
	  var d = searchColumns[int].getName();
	}

	var e = customSearch.runSearch();
	var f = e.getResults(0,100);

	for(var results=0; results<f.length; results++)
	{
	  for(var columns=0; columns<searchColumns.length; columns++)
	   {
	      var resultCol = [results].getValue(searchColumns[columns]);
	   }
	}


	var z = '';



	
	
	
	
}
