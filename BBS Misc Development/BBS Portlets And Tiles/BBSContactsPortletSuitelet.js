
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function portletSuitelet(request, response)
{
	if (request.getMethod() == 'GET') 
		{
			//Get parameters
			//
			var searchId = request.getParameter('searchid');		
			var contactId = request.getParameter('contactid');	
	
			//Load up the custom saved search
			//
			var recordSearch = nlapiLoadSearch(null, searchId);
			var recordColumns = recordSearch.getColumns();
			
			// Create a form
			//
			var form = nlapiCreateForm('', true);
			//form.setTitle('Dummy');
			
			var subList = form.addSubList('custpage_sublist_items', 'list', '', null);
						
						
			//Now add all of the columns from the saved search
			//
						for(var int = 0; int < recordColumns.length; int++)
							{
								var columnLabel = recordColumns[int].getLabel();
								var columnType = recordColumns[int]['type'];
								var columnSearchType = recordColumns[int]['searchtype'];
								var columnName = recordColumns[int]['name'];
								
								//If the column type is 'select' then we would want to display it as a text field
								//
								if(columnType == 'select' && columnSearchType == null)
									{
										columnType = 'text';
									}
								
								var columnId = 'custpage_sublist_' + columnName; 
								
								var sublistField = subList.addField(columnId, columnType, columnLabel, columnSearchType);
								sublistField.setDisplayType('disabled');
							}

						//Get the search results
						//
						var recordSearchResults = getResults(recordSearch);
						
						//Do we have any results to process
						//
						if(recordSearchResults != null && recordSearchResults.length > 0)
							{
								var lineNo = Number(0);
							
								//Loop through the results
								//
								for (var int2 = 0; int2 < recordSearchResults.length; int2++) 
									{
										lineNo++;
									
										//Loop through the columns
										//
										for (var int3 = 0; int3 < recordColumns.length; int3++) 
											{
												var rowColumnData = '';
												
												//See if the column has a text equivalent
												//
												rowColumnData = recordSearchResults[int2].getText(recordColumns[int3]);
												
												//If no text is returned, i.e. the column is not a lookup or list
												//
												if(rowColumnData == null)
													{
														rowColumnData = recordSearchResults[int2].getValue(recordColumns[int3]);
													}
												
												
												//Get the column name in the sublist
												//
												var columnId = 'custpage_sublist_' + recordColumns[int3]['name']; 
												
												//Assign the value to the column
												//
												subList.setLineItemValue(columnId, lineNo, rowColumnData);
												
											}
									}
							}

			//Write the response
			//
			response.writePage(form);
	
		}
}

//=====================================================================
//Functions
//=====================================================================
//

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



