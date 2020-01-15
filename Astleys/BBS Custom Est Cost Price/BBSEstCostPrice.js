/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Jan 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function estCostPricePostSourcing(type, name) 
{
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function estCostPriceValidateLine(type)
{
	if(type == 'item')
		{
			var item = nlapiGetCurrentLineItemValue('item', 'item');
			var customer = nlapiGetFieldValue('entity');
			
			if(customer != null && customer != '' && item != null && item != '')
				{
					var customrecord_bbs_cust_item_costsSearch = nlapiSearchRecord("customrecord_bbs_cust_item_costs",null,
							[
							   ["custrecord_bbs_cust_item_cost_cust","anyof",customer], 
							   "AND", 
							   ["custrecord_bbs_cust_item_cost_item","anyof",item]
							], 
							[
							   new nlobjSearchColumn("custrecord_bbs_cust_item_cost_cost")
							]
							);
				
					if(customrecord_bbs_cust_item_costsSearch != null && customrecord_bbs_cust_item_costsSearch.length == 1)
						{
							var estCostPrice = Number(customrecord_bbs_cust_item_costsSearch[0].getValue("custrecord_bbs_cust_item_cost_cost"));
							var quantity = Number(nlapiGetCurrentLineItemValue('item', 'quantity'));
							var totalEstCost = estCostPrice * quantity;
							
							nlapiSetCurrentLineItemValue('item', 'costestimatetype', 'CUSTOM', true, true);
							nlapiSetCurrentLineItemValue('item', 'costestimate', totalEstCost, true, true);
							
						
						}
				}
		}
	
    return true;
}
