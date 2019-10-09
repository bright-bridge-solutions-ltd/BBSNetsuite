/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Mar 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function myCatalogueFieldChanged(type, name, linenum)
{
	//If any of the colour, size1, size2 filters are changed, then get the data from all of those filters for 
	//all of the parent/children & store the data in the session data
	//
	if(name.startsWith('custpage_filter_'))
		{
			var filters = {};
			
			var filterBrand = nlapiGetFieldValue('custpage_filter_brand');
			var filterDescription = nlapiGetFieldValue('custpage_filter_desc');
			var filterPrioduct = nlapiGetFieldValue('custpage_filter_product');
			
			filters['brand'] = filterBrand;
			filters['description'] = filterDescription;
			filters['product'] = filterPrioduct;
			
			var filtersString = JSON.stringify(filters);
			
			var session = nlapiGetFieldValue('custpage_param_session');
			
			libSetSessionData(session, filtersString);
		}
}


