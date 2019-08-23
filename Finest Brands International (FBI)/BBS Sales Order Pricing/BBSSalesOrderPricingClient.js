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
		
			//Get the item on the current line
			//
			var itemId = nlapiGetCurrentLineItemValue('item', 'item');
			var itemType = nlapiGetCurrentLineItemValue('item', 'itemtype');
			
			//Get the customer's pricing level
			//
			var customerId = nlapiGetFieldValue('entity');
			var customerRecord = null;
			
			try
				{
					customerRecord = nlapiLoadRecord('customer', customerId);
				}
			catch(err)
				{
					customerRecord = null;
				}
			
			if(customerRecord != null)
				{
					var priceLevel = null;
					var customerPriceLevel = null;
					var itemPriceLevel = null;
					var groupPriceLevel = null;
					
					//Get the main price level for the customer
					//
					var customerPriceLevel = customerRecord.getFieldValue('pricelevel');
					
					//See if the item exists on the customer's item pricing sublist
					//
					var itemPricingLines = customerRecord.getLineItemCount('itempricing');
					
					for (var int = 1; int <= itemPricingLines; int++) 
						{
							var lineItem = customerRecord.getLineItemValue('itempricing', 'item', int);
							
							if(lineItem == itemId)
								{
									itemPriceLevel = customerRecord.getLineItemValue('itempricing', 'level', int);
									break;
								}
						}
					
					//See if the item exists on the customer's group pricing sublist
					//
					var itemPricingGroup = nlapiLookupField(getItemRecType(itemType), itemId, 'pricinggroup', false);
					var groupPricingLines = customerRecord.getLineItemCount('grouppricing');
					
					if(itemPricingGroup != null && itemPricingGroup != '')
						{
							for (var int = 1; int <= groupPricingLines; int++) 
								{
									var lineItemGroup = customerRecord.getLineItemValue('grouppricing', 'group', int);
									
									if(lineItemGroup == itemPricingGroup)
										{
											groupPriceLevel = customerRecord.getLineItemValue('grouppricing', 'level', int);
											break;
										}
								}
						}
					
					//Work out what pricing group to use
					//
					priceLevel = customerPriceLevel;										//Start off with the customer's price level
					priceLevel = (groupPriceLevel != null ? groupPriceLevel : priceLevel);	//Use a group pricing level if available
					priceLevel = (itemPriceLevel != null ? itemPriceLevel : priceLevel);	//Use an item pricing level if available
					
					//Do we have a valid price level?
					//
					if(priceLevel != null && priceLevel != '')
						{
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
									
									//Get the current price level
									//
									var currPriceLvl = nlapiGetCurrentLineItemValue('item', 'price');
									
									//Set the current line pricing
									//
									nlapiSetCurrentLineItemValue('item', 'price', '-1', true, true);	//Custom price level
									nlapiSetCurrentLineItemValue('item', 'rate', newPrice, true, true);	//New price
									nlapiSetCurrentLineItemValue('item', 'custcol_bbs_old_price_level', currPriceLvl, true, true); //Previous price level
								}
						}
				}
		}
	
    return true;
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
	}

	return itemType;
}
