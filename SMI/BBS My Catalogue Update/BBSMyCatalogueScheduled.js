/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jan 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function myCatalogueScheduled(type) 
{
	//Read in the parameters
	//
	var context = nlapiGetContext();
	var myCatalogueString = context.getSetting('SCRIPT', 'custscript_bbs_my_cat_string');
	var itemPricingString = context.getSetting('SCRIPT', 'custscript_bbs_item_string');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_item_customer_id');
	
	var myCatalogueArray = JSON.parse(myCatalogueString);
	var itemPricingArray = JSON.parse(itemPricingString);
	
	var existingMyCatalogue = {};
	
	//Delete from my catalogue
	//
	for ( var myCatalogueKey in myCatalogueArray) 
		{
			checkResources();
			
			try
				{
					nlapiDeleteRecord('customrecord_bbs_customer_web_product', myCatalogueArray[myCatalogueKey]);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error deleting from My Catalogue', err.message);
				}
		}
	
	//Get an array of all the items that are in the my catalogue for the customer
	//
	var customrecord_bbs_customer_web_productSearch = getResults(nlapiCreateSearch("customrecord_bbs_customer_web_product",
			[
			   ["custrecord_bbs_web_product_customer","anyof",customerId]
			], 
			[
			   new nlobjSearchColumn("id").setSort(false), 
			   new nlobjSearchColumn("custrecord_bbs_web_product_item")
			]
			));
	
	if(customrecord_bbs_customer_web_productSearch != null && customrecord_bbs_customer_web_productSearch.length > 0)
		{
			for (var int2 = 0; int2 < customrecord_bbs_customer_web_productSearch.length; int2++) 
				{
					var myCatalogueItemId = customrecord_bbs_customer_web_productSearch[int2].getValue("custrecord_bbs_web_product_item");
					
					existingMyCatalogue[myCatalogueItemId] = myCatalogueItemId;
				}
		}
	
	//Insert into my catalogue
	//
	for ( var itemPricingKey in itemPricingArray) 
		{
			checkResources();
			
			//Only add the item if it does not already exist in the my catalogue
			//
			if(Object.keys(existingMyCatalogue).indexOf(itemPricingKey) == -1)
				{
					var myCatalogueRecord = nlapiCreateRecord('customrecord_bbs_customer_web_product');
					myCatalogueRecord.setFieldValue('custrecord_bbs_web_product_customer', customerId);
					myCatalogueRecord.setFieldValue('custrecord_bbs_web_product_item', itemPricingKey);
					
					try
						{
							nlapiSubmitRecord(myCatalogueRecord, true, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error inserting into My Catalogue', err.message);
						}
				}
		}
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