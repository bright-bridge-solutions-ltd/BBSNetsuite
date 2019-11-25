/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Dec 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function priceIncreaseScheduled(type) 
{
	
	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var paramsString = context.getSetting('SCRIPT', 'custscript_bbs_ip_update_params');
	
	nlapiLogExecution('DEBUG', 'Parameters', paramsString);
	
	var paramsObject = JSON.parse(paramsString);
	
	//Initialise local variables
	//
	var usersEmail = context.getUser();
	var emailText = 'The selected customer item pricing records have now been updated.\n\nSee below for any additional information.\n\n';
	
	//Process based on mode
	//
	switch(paramsObject.mode)
		{
			case 'T':	//Tier
				
				emailText += 'Updating by customer tier ' + nlapiLookupField('customlist_bbs_cust_tier_list', paramsObject.tier, 'name', false) + '\n';
				emailText += 'Changing prices by ' + paramsObject.increase + '%\n\n';
				
				//Find all customers belonging to the selected tier
				//
				var customerSearch = getResults(nlapiCreateSearch("customer",
						[
						   ["custentity_bbs_tier","anyof",paramsObject.tier]
						], 
						[
						   new nlobjSearchColumn("entityid").setSort(false)
						]
						));
				
				if(customerSearch != null && customerSearch.length > 0)
					{
						for (var int = 0; int < customerSearch.length; int++) 
							{
								var customerId = customerSearch[int].getId();
								var customerName = customerSearch[int].getValue('entityid');
							
								var message = processCustomer(customerId, paramsObject.increase, null);	//Customer Id, Percentage Increase, Item List
								
								emailText += 'Processed Customer : ' + customerName + ' ' + message + '\n';
							}
					}
				
				break;
				
			case 'C': 	//Customer
				
				emailText += 'Updating by customer \n';
				emailText += 'Changing prices by ' + paramsObject.increase + '%\n\n';
				
				var message = processCustomer(paramsObject.customer, paramsObject.increase, paramsObject.items);	//Customer Id, Percentage Increase, Item List
				
				emailText += 'Processed Customer : ' + nlapiLookupField('customer', paramsObject.customer, 'entityid', false) + ' ' + message + '\n';
				
				break;
		}	
	
	
	//Send the email to the user to say that we have finished
	//
	nlapiSendEmail(usersEmail, usersEmail, 'Item Pricing Mass Update', emailText);
}


//=====================================================================
//Functions
//=====================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var pageSize = 1000;
	var start = 0;
	var end = pageSize;
	var searchResultSet = searchResult.getResults(start, end);
	
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == pageSize) 
				{
						start += pageSize;
						end += pageSize;
		
						var moreSearchResultSet = searchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
		
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
		}
		
	
	return searchResultSet;
}

function processCustomer(_customerId, _increase, _items)
{
	var customerRecord = null;
	var returnedMessage = '';
	
	try
		{
			customerRecord = nlapiLoadRecord('customer', _customerId);
		}
	catch(err)
		{
			customerRecord = null;
			nlapiLogExecution('ERROR', 'Error loading customer record with id = ' + _customerId, err.message);
			returnedMessage += 'Error loading customer record with id = ' + _customerId + ' ' + err.message;
		}
	
	//Process the customer record
	//
	if(customerRecord != null)
		{
			var itemPricingLines = customerRecord.getLineItemCount('itempricing');
			var linesUpdated = Number(0);
			
			for (var int2 = 1; int2 <= itemPricingLines; int2++) 
				{
					var itemPricingItem = customerRecord.getLineItemValue('itempricing', 'item', int2);
					var itemPricingLevel = customerRecord.getLineItemValue('itempricing', 'level', int2);
					var itemPricingPrice = Number(customerRecord.getLineItemValue('itempricing', 'price', int2));
					
					//See if we need to process this line
					//
					if(itemPricingLevel == '-1' && (_items == null || _items.length == 0 || _items.indexOf(itemPricingItem) != -1))	//Pricing level must be 'Custom' & the list of items to process is either empty of the item price line exists in that array
						{
							var newItemPricingPrice = itemPricingPrice + ((itemPricingPrice / 100.0) * Number(_increase));
							customerRecord.setLineItemValue('itempricing', 'price', int2, newItemPricingPrice);
							linesUpdated++;
						}
				}
			
			returnedMessage += '# Items updated = ' + linesUpdated + ' ';
			
			//Update the customer record
			//
			try
				{
					nlapiSubmitRecord(customerRecord, false, true);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error updating customer record with id = ' + _customerId, err.message);
					returnedMessage += 'Error saving customer record with id = ' + _customerId + ' ' + err.message;
				}
		}
	
	return returnedMessage;
}
