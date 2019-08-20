/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jul 2019     cedricgriffiths
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
function salesOrderSummaryAS(type)
{
	var summary = {};
	var salesOrderId = nlapiGetRecordId();
	var thisRecordType = nlapiGetRecordType();
	
	//Only on create or edit of the sales order
	//
	if(type == 'create' || type == 'edit')
		{
			//Get the count of item lines
			//
			var lines = nlapiGetLineItemCount('item');
			
			//Loop through the item lines
			//
			for (var int = 1; int <= lines; int++) 
				{
					//Get values from the item line
					//
					var lineItem = nlapiGetLineItemValue('item', 'item', int);
					var lineQuantity = nlapiGetLineItemValue('item', 'quantity', int);
					var lineCommitted = nlapiGetLineItemValue('item', 'quantitycommitted', int);
					var lineFulfilled = nlapiGetLineItemValue('item', 'quantityfulfilled', int);
					var linePicked = nlapiGetLineItemValue('item', 'itempicked', int);
					var lineType = nlapiGetLineItemValue('item', 'itemtype', int);
					var lineUnitPrice = nlapiGetLineItemValue('item', 'rate', int);
					var lineAmount = nlapiGetLineItemValue('item', 'amount', int);
					var lineVatAmount = nlapiGetLineItemValue('item', 'tax1amt', int);
					var linevatCode = nlapiGetLineItemValue('item', 'taxrate1', int);
					linevatCode = parseFloat(linevatCode).toFixed(2) + '%';
					
					//Get the price level for the line
					//
					var priceLevel = nlapiGetLineItemValue('item', 'custcol_bbs_old_price_level', int);
					
					//Check if the priceLevel variable returns a value
					//
					if (priceLevel)
						{
							// check that the priceLevel is not -1 (custom) or 1 (base price)
							if (priceLevel > 1)
								{
									// lookup the discount percentage on the price level record
									var discount = nlapiLookupField('pricelevel', priceLevel, 'discountpct');
									discount = (parseFloat(discount) * -1);
									discount = discount.toFixed(2) + '%';
								}
							else
								{
									// set the discount variable to '0.00%'
									var discount = '0.00%';
								}
						}
					else //custcol_bbs_old_price_level field is empty
						{
							priceLevel = nlapiGetLineItemValue('item', 'price', int);
							
							// check that the priceLevel is not -1 (custom) or 1 (base price)
							if (priceLevel > 1)
								{
									// lookup the discount percentage on the price level record
									var discount = nlapiLookupField('pricelevel', priceLevel, 'discountpct');
									discount = (parseFloat(discount) * -1);
									discount = discount.toFixed(2) + '%';
								}
							else
								{
									// set the discount variable to '0.00%'
									var discount = '0.00%';
								}
						}

					// check that the priceLevel is not -1 (custom) or 1 (base price)
					if (priceLevel > 1)
						{
							// lookup the discount percentage on the price level record
							var discount = nlapiLookupField('pricelevel', priceLevel, 'discountpct');
							discount = (parseFloat(discount) * -1);
							discount = discount.toFixed(2) + '%';
						}
					else
						{
							// set the discount variable to '0.00%'
							var discount = '0.00%';
						}
					
					//Only interested in inventory & non-inventory items
					//
					if(lineType == 'InvtPart' || lineType == 'NonInvtPart' || lineType == 'Discount')
						{
							var recordType = '';	
				  	        
							//Translate the record type so it can be used in the api calls
							//
					        switch (lineType) 
					        	{ 
						            case 'InvtPart':
						            	recordType = 'inventoryitem';
						                break;
						                
						            case 'NonInvtPart':
						            	recordType = 'noninventoryitem';
						                break;
						            
						            case 'Discount':
						            	recordType = 'discountitem';
						                break;
					        	}
						
					        //Get info about current product & parent etc.
					        //
					        var itemInfo = nlapiLookupField(recordType, lineItem, ['parent','custitem_fbi_item_colour','custitem_fbi_item_size1','custitem_fbi_item_size2'], false)
					        var itemInfoText = nlapiLookupField(recordType, lineItem, ['parent','custitem_fbi_item_colour','custitem_fbi_item_size1','custitem_fbi_item_size2'], true)
					        
					        //If we have a parent then proceed
					        //
					        var parentInfo = {};
					        var parentInfoText = {};
					        
					        if(itemInfo.parent != null && itemInfo.parent != '')
					        	{
					        		//Parent info
					        		//
						        	parentInfo = nlapiLookupField(recordType, itemInfo.parent, ['itemid','location','salesdescription'], false);
						        	parentInfoText = nlapiLookupField(recordType, itemInfo.parent, ['location'], true);
					        	}
					        else
					        	{
					        		parentInfo = nlapiLookupField(recordType, lineItem, ['itemid','location','salesdescription'], false);
					        		parentInfoText = nlapiLookupField(recordType, lineItem, ['location'], true);
					        		
					        		parentInfo.salesdescription = parentInfo.itemid;
					        		itemInfo.parent = lineItem;
					        		itemInfo.custitem_fbi_item_colour = '0';
					        		itemInfo.custitem_fbi_item_size1 = '0';
					        		itemInfo.custitem_fbi_item_size2 = '0';
					        		
					        		itemInfoText.parent = parentInfo.itemid;
					        		itemInfoText.custitem_fbi_item_colour = '';
					        		itemInfoText.custitem_fbi_item_size1 = '';
					        		itemInfoText.custitem_fbi_item_size2 = '';
					        	}
					        
					        	//Build up the key for the summary
					        	//Parent id + colour id + size2 id
					        	//
					        	var key = padding_left(itemInfo.parent, '0', 6) + 
					        		padding_left(itemInfo.custitem_fbi_item_colour, '0', 6) + 
					        		padding_left((itemInfo.custitem_fbi_item_size2 == '' ? '0' : itemInfo.custitem_fbi_item_size2), '0', 6);
					        		
					        	//Does the key exist in the summary, if not create a new entry
					        	//
					        	if(!summary[key])
					        		{
					        			summary[key] = new itemSummaryInfo(	parentInfo.itemid, 
					        												itemInfo.custitem_fbi_item_colour, 
					        												itemInfo.custitem_fbi_item_size2, 
					        												parentInfo.location, 
					        												parentInfo.salesdescription,
					        												itemInfoText.custitem_fbi_item_colour,
					        												itemInfoText.custitem_fbi_item_size2,
					        												parentInfoText.location,
					        												lineUnitPrice,
					        												linevatCode,
					        												discount
					        												);
					        		}
					        		
					        	//Update the size & quantity in the summary
					        	//
					        	summary[key].updateSizeQuantity	(
					        									itemInfo.custitem_fbi_item_size1, 
					        									lineQuantity, 
					        									itemInfoText.custitem_fbi_item_size1, 
					        									lineAmount, 
					        									lineVatAmount
					        									);
					        	
						}
				}
			
			//Now we have done all summarising, we need to generate the output format 
			//
			var outputArray = [];
			
			//Loop through the summaries
			//
			for ( var key in summary) 
				{
					//Push a new instance of the output summary object onto the output array
					//
					outputArray.push(new outputSummary	(	
														summary[key].itemId, 
														summary[key].salesDescription, 
														summary[key].locationText, 
														summary[key].itemColourText + ' ' + summary[key].itemSize2Text, 
														summary[key].getQuantitySizeSummary(), 
														summary[key].getQuantitySizeTotal(),
														summary[key].unitPrice,
														summary[key].getAmountTotal(),
														summary[key].getVatAmountTotal(),
														summary[key].vatCode,
														summary[key].discount
														)
									);
				}
			
			//Save the output array to the sales order
			//
			nlapiSubmitField(thisRecordType, salesOrderId, 'custbody_bbs_item_summary_json', JSON.stringify(outputArray), false);
		}
}

//=============================================================================
//Objects
//=============================================================================
//
function outputSummary(_product, _description, _location, _colour, _quantitySize, _total, _unitPrice, _amount, _vatAmount, _vatCode, _discount)
{
	//Properties
	//
	this.product 		= _product;
	this.description 	= _description;
	this.location 		= _location;
	this.colour 		= _colour;
	this.quantitysize 	= _quantitySize;
	this.total 			= Number(_total);
	this.amount 		= Number(_amount);
	this.unitPrice 		= Number(_unitPrice);
	this.vatAmount 		= Number(_vatAmount);
	this.vatCode 		= _vatCode;
	this.discount		= _discount;
}

function itemSummaryInfo(_itemid, _itemColour, _itemSize2, _location, _salesdescription, _itemColourText, _itemSize2Text, _locationText, _unitPrice, _vatCode, _discount)
{
	//Properties
	//
	this.itemId 			= _itemid;
	this.itemColourId 		= _itemColour;
	this.itemSize2Id 		= _itemSize2;
	this.locationId 		= _location;
	this.salesDescription 	= _salesdescription;
	this.itemColourText 	= _itemColourText;
	this.itemSize2Text 		= _itemSize2Text;
	this.locationText 		= _locationText;
	this.unitPrice 			= Number(_unitPrice);
	this.vatCode 			= _vatCode;
	this.discount			= _discount;
	this.sizeQuantity 		= [];
	
	//Methods
	//
	this.updateSizeQuantity = function(_size, _quantity, _sizeText, _amount, _vatAmount)
		{
			if(this.sizeQuantity.length == 0) 
				{
					//If no elements in the array then this is the first, so just push it on
					//
					this.sizeQuantity.push(new sizeQuantityCell(_size, _quantity, _sizeText, _amount, _vatAmount));
				}
			else
				{
					//See if we can find the size in the array of sizes
					//
					var updated = false;
					
					for (var int2 = 0; int2 < this.sizeQuantity.length; int2++) 
						{
							if(this.sizeQuantity[int2].sizeId == _size)
								{
									this.sizeQuantity[int2].quantity  += Number(_quantity);
									this.sizeQuantity[int2].amount    += Number(_amount);
									this.sizeQuantity[int2].vatAmount += Number(_vatAmount);
									
									updated = true;
									break;
								}
						}
					
					//If we couldn't find the size in the array, then add a new one
					//
					if(!updated)
						{
							this.sizeQuantity.push(new sizeQuantityCell(_size, _quantity, _sizeText, _amount, _vatAmount));
						}
				}
		}
	
	this.getQuantitySizeTotal = function()
		{
			var totalQuantity = Number(0);
			
			for (var int2 = 0; int2 < this.sizeQuantity.length; int2++) 
				{
					totalQuantity += Number(this.sizeQuantity[int2].quantity);
				}
			
			return totalQuantity;
		}
	
	this.getAmountTotal = function()
		{
			var totalAmount = Number(0);
			
			for (var int2 = 0; int2 < this.sizeQuantity.length; int2++) 
				{
					totalAmount += Number(this.sizeQuantity[int2].amount);
				}
			
			return totalAmount;
		}

	this.getVatAmountTotal = function()
		{
			var totalVatAmount = Number(0);
			
			for (var int2 = 0; int2 < this.sizeQuantity.length; int2++) 
				{
					totalVatAmount += Number(this.sizeQuantity[int2].vatAmount);
				}
			
			return totalVatAmount;
		}

	this.getQuantitySizeSummary = function()
		{
			var summaryText = '';
			
			for (var int2 = 0; int2 < this.sizeQuantity.length; int2++) 
				{
					if(this.sizeQuantity[int2].sizeText != '')
						{
							// check if this is the last item in the array
							if (int2 == (this.sizeQuantity.length-1))
								{
									summaryText += this.sizeQuantity[int2].quantity.toString() + ' x ' + this.sizeQuantity[int2].sizeText;
								}
							else
								{
									summaryText += this.sizeQuantity[int2].quantity.toString() + ' x ' + this.sizeQuantity[int2].sizeText + ', ';
								}
						}
					else
						{
							summaryText += this.sizeQuantity[int2].quantity.toString() + ' ';
						}
				}
			
			return summaryText;
		}
}

function sizeQuantityCell(_size, _quantity, _sizeText, _amount, _vatAmount)
{
	//Properties
	//
	this.sizeId 	= _size;
	this.quantity 	= Number(_quantity);
	this.amount 	= Number(_amount);
	this.vatAmount 	= Number(_vatAmount);
	this.sizeText 	= _sizeText;	
}


//=============================================================================
//Functions
//=============================================================================
//

//Left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
		{
			return s;
		}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
		{
			s = c + s;
		}
	
	return s;
}

