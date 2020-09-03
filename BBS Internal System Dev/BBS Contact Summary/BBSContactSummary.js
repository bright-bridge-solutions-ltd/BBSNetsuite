/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Sep 2020     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	if (request.getMethod() == 'GET') 
		{
			var fileContents = '"internal Id","Company Name","Industry Type","Vendor Interest","Product Interest"\r\n';
			var previousCompany 		= '';
			var previousCompanyId 		= '';
			var industryTypes 			= {};
			var vendorInterests 		= {};
			var productInterests 		= {};
			var bigestIndustyType 		= '';
			var biggestVendorInterest 	= '';
			var biggestProductInterest 	= '';
			var maxValue 				= Number(0);
			
			var contactSearch = getResults(nlapiCreateSearch("contact",
					[
					   ["company","noneof","@NONE@"], 
					   "AND", 
					   ["isinactive","is","F"], 
			//		   "AND", 
			//		   ["company","anyof","1707"]
					], 
					[
					   new nlobjSearchColumn("company"), 
					   new nlobjSearchColumn("entityid"), 
					   new nlobjSearchColumn("custentity_bbs_hs_indtype"), 
					   new nlobjSearchColumn("custentity_bbs_hs_vendor"), 
					   new nlobjSearchColumn("custentity_bbs_hs_product"), 
					   new nlobjSearchColumn("internalid","customer",null), 
					   new nlobjSearchColumn("altname","customer",null).setSort(false)
					]
					));
			
			if(contactSearch != null && contactSearch.length > 0)
				{
					//Loop through companies
					//
					for (var int = 0; int < contactSearch.length; int++) 
						{
							//var companyName = contactSearch[int].getText("company");
							var companyName = contactSearch[int].getValue("altname","customer",null);
							var companyId = contactSearch[int].getValue("internalid","customer",null);
								
							
							if(previousCompany != companyName)
								{
									//Find the biggest values
									//
									
									for ( var key in industryTypes) 
										{
											if(industryTypes[key] > maxValue)
												{
													maxValue 			= industryTypes[key];
													bigestIndustyType	= key;
												}
										}
									
									maxValue = Number(0);
									
									for ( var key in vendorInterests) 
										{
											if(vendorInterests[key] > maxValue)
												{
													maxValue 				= vendorInterests[key];
													biggestVendorInterest	= key;
												}
										}
									
									maxValue = Number(0);
									
									for ( var key in productInterests) 
										{
											if(productInterests[key] > maxValue)
												{
													maxValue 				= productInterests[key];
													biggestProductInterest	= key;
												}
										}
								
									fileContents 				+= '"' + previousCompanyId + '","' + previousCompany + '","' + bigestIndustyType + '","' + biggestVendorInterest + '","' +  biggestProductInterest + '"\r\n';
									previousCompany				= companyName;
									previousCompanyId			= companyId;
									industryTypes 			= {};
									vendorInterests 		= {};
									productInterests 		= {};
									bigestIndustyType 		= '';
									biggestVendorInterest 	= '';
									biggestProductInterest 	= '';
									maxValue 				= Number(0);
								}


											var industryType 	= contactSearch[int].getText("custentity_bbs_hs_indtype");
											var vendorInterest 	= contactSearch[int].getText("custentity_bbs_hs_vendor");
											var productInterest = contactSearch[int].getText("custentity_bbs_hs_product");
											
											if(!industryTypes.hasOwnProperty(industryType) && industryType != '')
												{
													industryTypes[industryType] = Number(0);
												}
											
											if(!vendorInterests.hasOwnProperty(vendorInterest) && vendorInterest != '')
												{
													vendorInterests[vendorInterest] = Number(0);
												}
											
											if(!productInterests.hasOwnProperty(productInterest) && productInterest != '')
												{
													productInterests[productInterest] = Number(0);
												}
											
											if(industryType != '')
												{
													industryTypes[industryType] += 1;
												}
											
											if(vendorInterest != '')
												{
													vendorInterests[vendorInterest] += 1;	
												}
											
											if(productInterest != '')
												{
													productInterests[productInterest] += 1;
												}
						}
				}
			
			//Output the line to the file
			//
			fileContents += '"' + companyId + '","' + companyName + '","' + bigestIndustyType + '","' + biggestVendorInterest + '","' +  biggestProductInterest + '"\r\n';
			
			response.setContentType('CSV', 'ContactAnalysis.csv', 'attachment');
			response.write(fileContents);
			
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
