/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Sep 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var summary = {};
	
	//Read in the parameter(s)
	//
	var context = nlapiGetContext();
	var salesOrderId = context.getSetting('SCRIPT', 'custscript_record_id');
	var thisRecordType = context.getSetting('SCRIPT', 'custscript_record_type');

	var thisRecord = nlapiLoadRecord(thisRecordType, salesOrderId);
	
	var lines = thisRecord.getLineItemCount('item');
	
	//Loop through the item lines
	//
	for (var int = 1; int <= lines; int++) 
		{
			//Get values from the item line
			//
			var lineItem = thisRecord.getLineItemValue('item', 'item', int);
			var lineQuantity = thisRecord.getLineItemValue('item', 'quantity', int);
			var lineCommitted = thisRecord.getLineItemValue('item', 'quantitycommitted', int);
			var lineFulfilled = thisRecord.getLineItemValue('item', 'quantityfulfilled', int);
			var linePicked = thisRecord.getLineItemValue('item', 'itempicked', int);
			var lineType = thisRecord.getLineItemValue('item', 'itemtype', int);
			var lineUnitPrice = thisRecord.getLineItemValue('item', 'rate', int);
			var lineAmount = thisRecord.getLineItemValue('item', 'amount', int);
			var lineVatAmount = thisRecord.getLineItemValue('item', 'tax1amt', int);
			var linevatCode = thisRecord.getLineItemValue('item', 'taxrate1', int);
			linevatCode = parseFloat(linevatCode).toFixed(2) + '%';
			
			//Get the price level for the line
			//
			var priceLevel = thisRecord.getLineItemValue('item', 'custcol_bbs_old_price_level', int);
			
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
					priceLevel = thisRecord.getLineItemValue('item', 'price', int);
					
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
			        	
			        	summary[key].updateSizeQuantityCommitted	(
								        							itemInfo.custitem_fbi_item_size1, 
								        							lineCommitted, 
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
												summary[key].discount,
												summary[key].getQuantitySizeSummaryCommitted(),
												summary[key].getQuantitySizeCommittedTotal()
												)
							);
		}
	
	//Save the output array to the sales order
	//
	nlapiSubmitField(thisRecordType, salesOrderId, ['custbody_bbs_item_summary_json','custbody_bbs_item_suumary_created'], [JSON.stringify(outputArray),'T'], false);
}



//=============================================================================
//Objects
//=============================================================================
//
function outputSummary(_product, _description, _location, _colour, _quantitySize, _total, _unitPrice, _amount, _vatAmount, _vatCode, _discount, _quantitySizeCommitted, _totalCommitted)
{
	//Properties
	//
	this.product 				= _product;
	this.description 			= _description;
	this.location 				= _location;
	this.colour 				= _colour;
	this.quantitysize 			= _quantitySize;
	this.quantitysizeCommitted 	= _quantitySizeCommitted;
	this.total 					= Number(_total);
	this.totalCommitted			= Number(_totalCommitted);
	this.amount 				= Number(_amount);
	this.unitPrice 				= Number(_unitPrice);
	this.vatAmount 				= Number(_vatAmount);
	this.vatCode 				= _vatCode;
	this.discount				= _discount;
}

function itemSummaryInfo(_itemid, _itemColour, _itemSize2, _location, _salesdescription, _itemColourText, _itemSize2Text, _locationText, _unitPrice, _vatCode, _discount)
{
	//Properties
	//
	this.itemId 				= _itemid;
	this.itemColourId 			= _itemColour;
	this.itemSize2Id 			= _itemSize2;
	this.locationId 			= _location;
	this.salesDescription 		= _salesdescription;
	this.itemColourText 		= _itemColourText;
	this.itemSize2Text 			= _itemSize2Text;
	this.locationText 			= _locationText;
	this.unitPrice 				= Number(_unitPrice);
	this.vatCode 				= _vatCode;
	this.discount				= _discount;
	this.sizeQuantity 			= [];
	this.sizeQuantityCommitted 	= [];
	
	//Methods
	//
	this.updateSizeQuantityCommitted = function(_size, _quantity, _sizeText, _amount, _vatAmount)
	{
		if(this.sizeQuantityCommitted.length == 0) 
			{
				//If no elements in the array then this is the first, so just push it on
				//
				this.sizeQuantityCommitted.push(new sizeQuantityCell(_size, _quantity, _sizeText, _amount, _vatAmount));
			}
		else
			{
				//See if we can find the size in the array of sizes
				//
				var updated = false;
				
				for (var int2 = 0; int2 < this.sizeQuantityCommitted.length; int2++) 
					{
						if(this.sizeQuantityCommitted[int2].sizeId == _size)
							{
								this.sizeQuantityCommitted[int2].quantity  += Number(_quantity);
								this.sizeQuantityCommitted[int2].amount    += Number(_amount);
								this.sizeQuantityCommitted[int2].vatAmount += Number(_vatAmount);
								
								updated = true;
								break;
							}
					}
				
				//If we couldn't find the size in the array, then add a new one
				//
				if(!updated)
					{
						this.sizeQuantityCommitted.push(new sizeQuantityCell(_size, _quantity, _sizeText, _amount, _vatAmount));
					}
			}
	}
	
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
	
	this.getQuantitySizeCommittedTotal = function()
		{
			var totalQuantity = Number(0);
			
			for (var int2 = 0; int2 < this.sizeQuantityCommitted.length; int2++) 
				{
					totalQuantity += Number(this.sizeQuantityCommitted[int2].quantity);
				}
			
			return totalQuantity;
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
					if(this.sizeQuantity[int2].quantity != 0)
						{
							if(this.sizeQuantity[int2].sizeText != '')
								{
									summaryText += this.sizeQuantity[int2].quantity.toString() + ' x ' + this.sizeQuantity[int2].sizeText + ', ';
								}
							else
								{
									summaryText += this.sizeQuantity[int2].quantity.toString() + ' ';
								}
						}
				}
			
			//return the string minus any trailing comma & space
			//
			return summaryText.replace(new RegExp(', $'), '');
		}
	
	this.getQuantitySizeSummaryCommitted = function()
	{
		var summaryText = '';
		
		for (var int2 = 0; int2 < this.sizeQuantityCommitted.length; int2++) 
			{
				if(this.sizeQuantityCommitted[int2].quantity != 0)
					{
						if(this.sizeQuantityCommitted[int2].sizeText != '')
							{
								summaryText += this.sizeQuantityCommitted[int2].quantity.toString() + ' x ' + this.sizeQuantityCommitted[int2].sizeText + ', ';
							}
						else
							{
								summaryText += this.sizeQuantityCommitted[int2].quantity.toString() + ' ';
							}
					}
			}
		
		//return the string minus any trailing comma & space
		//
		return summaryText.replace(new RegExp(', $'), '');
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
