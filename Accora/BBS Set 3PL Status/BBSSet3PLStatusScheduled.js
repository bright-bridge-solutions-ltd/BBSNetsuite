/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Oct 2020     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
	{
		var emailText = '';
		
		
		//Run search to find IF lines that need sending to 3PL
		//
		var itemfulfillmentSearch = getResults(nlapiCreateSearch("itemfulfillment",
				[
				   ["type","anyof","ItemShip"], 					//Transaction type = IF
				   "AND", 	
				   ["taxline","is","F"], 							//Not tax line
				   "AND", 
				   ["shipping","is","F"], 							//Not shipping line
				   "AND", 
				   ["appliedtotransaction","noneof","@NONE@"], 		//Has an applied transaction
				   "AND", 
				   ["location","anyof","14","1"], 					//Location is Europa or Hyperlogistics
				   "AND", 
				   ["custbody_bbs_sent_to_3pl","is","T"], 			//Sent to 3PL is true
				   "AND", 
				   ["custbody1","is","T"], 							//Send to 3PL is true
				   "AND", 
				   ["status","anyof","ItemShip:C"], 				//Status is Shipped
				   "AND", 
				   ["custcol_bbs_3pl_ship_status","anyof","1","3"], //3PL status is Variance or Pending
				   "AND", 
				   ["cogs","is","F"]								//Not COGS line
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("line"), 
				   new nlobjSearchColumn("tranid"), 
				   new nlobjSearchColumn("entityid","customer",null), 
				   new nlobjSearchColumn("altname","customer",null), 
				   new nlobjSearchColumn("itemid","item",null), 
				   new nlobjSearchColumn("item"), 
				   new nlobjSearchColumn("account"), 
				   new nlobjSearchColumn("quantity"), 
				   new nlobjSearchColumn("quantityshiprecv"), 
				   new nlobjSearchColumn("tranid","createdFrom",null), 
				   new nlobjSearchColumn("shipdate","createdFrom",null), 
				   new nlobjSearchColumn("otherrefnum","createdFrom",null), 
				   new nlobjSearchColumn("custcol_bbs_3pl_ship_status"), 
				   new nlobjSearchColumn("mainline")
				]
				));
			
		if(itemfulfillmentSearch != null && itemfulfillmentSearch.length > 0)
			{
				//Log the search results
				//
				nlapiLogExecution('AUDIT', '3PL Search Results', JSON.stringify(itemfulfillmentSearch));
				
				//Process each search result
				//
				for (var int = 0; int < itemfulfillmentSearch.length; int++) 
					{
						var internalId 		= itemfulfillmentSearch[int].getValue('internalid');
						var documentNumber 	= itemfulfillmentSearch[int].getValue('tranid');
						
						try
							{
								//Update the IF status to be packed
								//
								nlapiSubmitField('itemfulfillment', internalId, 'shipstatus', 'B', false);
								
								//Send an email
								//
								emailText = 'A fulfilment shipment from Europa/Hyper has lines that do not fully match to expected values. Please view the link to investigate.\n\n\n' + 
								'https://4810497.app.netsuite.com' + nlapiResolveURL('RECORD', 'itemfulfillment', internalId, 'view');
								
								nlapiSendEmail(3, 'anthony.drake@accora.care,accorainc@brightbridgesolutions.com', '3PL Shipment not Matched', emailText, null, null, null, null, false, false, null);
							}
						catch(err)
							{
								nlapiLogExecution('ERROR', 'Error updating Item fulfilment record id = ' + internalid, err.message);
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