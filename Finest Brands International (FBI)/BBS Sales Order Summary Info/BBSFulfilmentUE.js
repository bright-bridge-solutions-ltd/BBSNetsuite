/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Oct 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function fulfimentAS(type)
{
	if(type == 'create')
		{
			var createdFrom = nlapiGetFieldValue('createdfrom');
			
			if(createdFrom != null && createdFrom != '')
				{
					try
						{
							nlapiSubmitField('salesorder', createdFrom, 'custbody_bbs_item_suumary_created', 'F', false);
						}
					catch(err)
						{
						
						}
				}
		}
	
	if(type == 'create' || type == 'edit' || type == 'delete')
		{
			//Get the created from 
			//
			var createdFrom = nlapiGetFieldValue('createdfrom');
			
			//Search for any item fulfilments created from the sales order
			//
			var itemfulfillmentSearch = getResults(nlapiCreateSearch("itemfulfillment",
					[
					   ["type","anyof","ItemShip"], 
					   "AND", 
					   ["createdfrom","anyof",createdFrom], 
					   "AND", 
					   ["taxline","is","F"], 
					   "AND", 
					   ["shipping","is","F"], 
					   "AND", 
					   ["cogs","is","F"]
					], 
					[
					   new nlobjSearchColumn("item",null,"GROUP"), 
					   new nlobjSearchColumn("quantity",null,"SUM"), 
					   new nlobjSearchColumn("quantitycommitted",null,"SUM"), 
					   new nlobjSearchColumn("quantityshiprecv",null,"SUM")
					]
					));
		
			var itemsObject = {};
			
			if(itemfulfillmentSearch != null && itemfulfillmentSearch.length > 0)
				{
					for (var int = 0; int < itemfulfillmentSearch.length; int++) 
						{
							var itemId = itemfulfillmentSearch[int].getValue("item",null,"GROUP");
							var itemQuantity = Number(itemfulfillmentSearch[int].getValue("quantity",null,"SUM"));
							
							itemsObject[itemId] = itemQuantity;
						}
				}

			//Load the sales order
			//
			var soRecord = null;
			
			try
				{
					soRecord = nlapiLoadRecord('salesorder', createdFrom);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error loading SO record id = ' + createdFrom, err.message);
					soRecord = null;
				}
			
			//Was the sales order loaded ok
			//
			if(soRecord != null)
				{
					//Get the so lines
					//
					var soLines = soRecord.getLineItemCount('item');
					
					//Loop through the so lines
					//
					for (var int2 = 1; int2 <= soLines; int2++) 
						{
							//Get the so item
							//
							soItem = soRecord.getLineItemValue('item','item', int2);
							
							//Have we got an entry in the itemsObject
							//
							if(itemsObject[soItem] || Object.keys(itemsObject).length == 0)
								{
									var committedQty = Number(soRecord.getLineItemValue('item','quantitycommitted', int2));
									
									var pickedQty = (Object.keys(itemsObject).length == 0 ? Number(0) : itemsObject[soItem]);
									
									soRecord.setLineItemValue('item','custcol_bbs_pick_quantity', int2, committedQty - pickedQty);
								}
						}
				
					//Submit the sales order
					//
					nlapiSubmitRecord(soRecord, true, true);
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
				resultlen = moreSearchResultSet.length;

				searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}
	
	return searchResultSet;
}

