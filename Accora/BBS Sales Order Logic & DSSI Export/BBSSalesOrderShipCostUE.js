/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Dec 2020     cedricgriffiths
 * 2.00		  18 Dec 2020	  markanderson
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
function salesOrderShipCostAS(type) {
	if (type == 'edit') {
		var oldRecord = nlapiGetOldRecord();
		var newRecord = nlapiGetNewRecord();
		var recordId = nlapiGetRecordId();

		var oldshipcost = oldRecord.getFieldValue('shippingcost');
		var newshipcost = newRecord.getFieldValue('shippingcost');
		var oldshipmethod = oldRecord.getFieldValue('shipmethod');
		var newshipmethod = newRecord.getFieldValue('shipmethod');

		//If shipmethod or cost are different then run the following
		if (oldshipcost != newshipcost || oldshipmethod != newshipmethod) {
			var itemfulfillmentSearch = getResults(nlapiCreateSearch("itemfulfillment",
				[
					["type", "anyof", "ItemShip"],
					"AND",
					["mainline", "is", "T"],
					"AND",
					["createdfrom", "anyof", recordId]
				],
				[
					new nlobjSearchColumn("trandate").setSort(true),
                    new nlobjSearchColumn("internalid").setSort(true),
                    new nlobjSearchColumn("tranid"),
					new nlobjSearchColumn("shippingcost"),
					new nlobjSearchColumn("shipmethod")
				]
			));

			if (itemfulfillmentSearch != null && itemfulfillmentSearch.length > 0) {
				
					var ifInternalId = itemfulfillmentSearch[0].getValue('internalid');

					try {
						//Shipmethod must set before shipcost, as this sets cost to 0
						nlapiSubmitField('itemfulfillment', ifInternalId, 'shipmethod', newshipmethod, true);
						nlapiSubmitField('itemfulfillment', ifInternalId, 'shippingcost', newshipcost, true);
					}
					catch (err) {
						nlapiLogExecution('ERROR', 'Error updating shipping on IF with id = ' + ifInternalId, '');
					}

			}
		}
	}
}

function getResults(search) {
	var searchResult = search.runSearch();

	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) {
		start += 1000;
		end += 1000;

		var moreSearchResultSet = searchResult.getResults(start, end);

		if (moreSearchResultSet == null) {
			resultlen = 0;
		}
		else {
			resultlen = moreSearchResultSet.length;
			searchResultSet = searchResultSet.concat(moreSearchResultSet);
		}


	}

	return searchResultSet;
}
