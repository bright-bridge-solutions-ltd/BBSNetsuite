/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 May 2019     cedricgriffiths
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
function salesOrderPricingFieldChanged(type, name, linenum)
{
	//See if we are changing the ship date or the FEDP flag
	//
	if(name == 'custbody_bbs_fedp' || name == 'shipdate')
		{
			var shipDateText = nlapiGetFieldValue('shipdate');
			var shipDate = nlapiStringToDate(shipDateText);
			var applyFedp = nlapiGetFieldValue('custbody_bbs_fedp');
			var today = new Date();
			
			//If we are applying FEDP then check the date
			//
			if(applyFedp == 'T')
				{
					//If there is no date entered or the date is in the past, then error & clear the FEDP flag
					//
					if(shipDate == null || shipDate.getTime() < today.getTime())
						{
							Ext.Msg.alert('⛔️️ FEDP Error', 'If Future Effective Date Pricing is enabled, the ship date cannot be blank, in the past, or today\'s date.', Ext.emptyFn);
							
							nlapiSetFieldValue('custbody_bbs_fedp', null, false, true);
						}
				}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function salesOrderPricingValidateLine(type)
{
	//See if FEDP is enabled
	//
	var applyFedp = nlapiGetFieldValue('custbody_bbs_fedp');
	
	if(applyFedp == 'T')
		{
			//Get the ship date
			//
			var shipDateText = nlapiGetFieldValue('shipdate');
		
			//Get the customer's pricing level
			//
			var customerId = nlapiGetFieldValue('entity');
			var priceLevel = nlapiLookupField('customer', customerId, 'pricelevel', false)
			
			if(priceLevel != null && priceLevel != '')
				{
					//Get the item on the current line
					//
					var itemId = nlapiGetCurrentLineItemValue('item', 'item');
					
					//Search the pricing records
					//
					var customrecord_nsts_ep_pricingupdatepricesSearch = nlapiSearchRecord("customrecord_nsts_ep_pricingupdateprices",null,
							[
							   ["custrecord_nsts_ep_priceupdatetype","anyof","1"], 
							   "AND", 
							   ["custrecord_nsts_ep_priceupdatestatus","anyof","1"], 
							   "AND", 
							   ["custrecord_nsts_ep_pricingupdatelevel","anyof",priceLevel], 
							   "AND", 
							   ["custrecord_nsts_ep_pricingupdate.custrecord_nsts_ep_pricingupdatestatus","anyof","1"], 
							   "AND", 
							   ["custrecord_nsts_ep_pricingupdate.custrecord_nsts_ep_updatetype","anyof","1"], 
							   "AND", 
							   ["custrecord_nsts_ep_pricingupdate.custrecord_nsts_ep_pricingupdateitem","anyof",itemId], 
							   "AND", 
							   ["custrecord_nsts_ep_pricingupdate.custrecord_nsts_ep_pricingupdatestartdt","onorbefore",shipDateText], 
							   "AND", 
							   [["custrecord_nsts_ep_pricingupdate.custrecord_nsts_ep_pricingupdateenddate","onorafter",shipDateText],"OR",["custrecord_nsts_ep_pricingupdate.custrecord_nsts_ep_pricingupdateenddate","isempty",""]]
							], 
							[
							   new nlobjSearchColumn("custrecord_nsts_ep_pricingupdatelevel"), 
							   new nlobjSearchColumn("custrecord_nsts_ep_pricingupdatenewprice"), 
							   new nlobjSearchColumn("custrecord_nsts_ep_pricingupdatestartdt","CUSTRECORD_NSTS_EP_PRICINGUPDATE",null).setSort(true), 
							   new nlobjSearchColumn("custrecord_nsts_ep_pricingupdateenddate","CUSTRECORD_NSTS_EP_PRICINGUPDATE",null)
							]
							);
					
					//See if we have any results
					//
					if(customrecord_nsts_ep_pricingupdatepricesSearch != null && customrecord_nsts_ep_pricingupdatepricesSearch.length > 0)
						{
							//Get the new price
							//
							var newPrice = Number(customrecord_nsts_ep_pricingupdatepricesSearch[0].getValue("custrecord_nsts_ep_pricingupdatenewprice"));
							
							//Set the current line pricing
							//
							nlapiSetCurrentLineItemValue('item', 'price', '-1', true, true);	//Custom price level
							nlapiSetCurrentLineItemValue('item', 'rate', newPrice, true, true);	//New price
						}
				}
		}
	
    return true;
}
