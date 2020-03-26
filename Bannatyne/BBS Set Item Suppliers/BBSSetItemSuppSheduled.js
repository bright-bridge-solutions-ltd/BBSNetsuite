/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Jun 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{

	var itemSearch = getResults(nlapiCreateSearch("item",
			[
			   ["type","anyof","InvtPart","NonInvtPart"]
			], 
			[
			   new nlobjSearchColumn("itemid").setSort(false), 
			   new nlobjSearchColumn("type")
			]
			));
	
	if(itemSearch != null && itemSearch.length > 0)
		{
			for (var int = 0; int < itemSearch.length; int++) 
				{
					checkResources();
					
					var itemId = itemSearch[int].getId();
					var itemType = itemSearch[int].getValue('type');
					
					var itemRecord = null;
					
					try
						{
							itemRecord = nlapiLoadRecord(getItemRecType(itemType), itemId);
						}
					catch(err)
						{
							itemRecord = null;
							nlapiLogExecution('ERROR', 'Error loading item record with id = ' + itemId, err.message);
						}
					
					if(itemRecord != null)
						{
							var vendorArray = [];
							var vendorCount = itemRecord.getLineItemCount('itemvendor');
							
							//Loop through the vendor lines to build up a list of vendor id's
							//
							for (var int2 = 1; int2 <= vendorCount; int2++) 
								{
									var vendorId = itemRecord.getLineItemValue('itemvendor', 'vendor', int2);
									vendorArray.push(vendorId);
								}
							
							//Set the multi-select field with the list of vendors
							//
							itemRecord.setFieldValues('custitem_bbs_available_suppliers', vendorArray);
							
							try
								{
									nlapiSubmitRecord(itemRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving item record with id = ' + itemId, err.message);
								}
						}
				}
		}
}

function getItemRecType(ItemType)
{
	var itemType = '';
	
	switch(ItemType)
	{
		case 'InvtPart':
			itemType = 'inventoryitem';
			break;
			
		case 'Assembly':
			itemType = 'assemblyitem';
			break;
			
		case 'NonInvtPart':
			itemType = 'noninventoryitem';
			break;
			
		case 'OthCharge':
			itemType = 'otherchargeitem';
			break;
	}

	return itemType;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
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