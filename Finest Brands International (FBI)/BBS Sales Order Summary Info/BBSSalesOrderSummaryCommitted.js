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
	var thisRecordType = 'salesorder';
	var orderIds = {};
	
	//Run a saved search to find all orders that have a committed quantity on them
	//
	var salesorderSearch = nlapiSearchRecord("salesorder",null,
			[
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["quantitycommitted","greaterthan","0"]
			], 
			[
			   new nlobjSearchColumn("tranid",null,"GROUP"), 
			   new nlobjSearchColumn("internalid",null,"GROUP")
			]
			);
	
	//Process the results into an object
	//
	if(salesorderSearch != null && salesorderSearch.length > 0)
		{
			for (var searchCount = 0; searchCount < salesorderSearch.length; searchCount++) 
				{
					var orderId = salesorderSearch[searchCount].getValue("internalid",null,"GROUP");
					orderIds[orderId] = orderId;
				}
		}
	
	//Look for all orders that are partially fulfilled
	//
	var salesorderSearch = nlapiSearchRecord("salesorder",null,
			[
			   ["type","anyof","SalesOrd"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["status","anyof","SalesOrd:D","SalesOrd:E"]
			], 
			[
			   new nlobjSearchColumn("tranid")
			]
			);
	
	//Process the results into an object
	//
	if(salesorderSearch != null && salesorderSearch.length > 0)
		{
			for (var searchCount = 0; searchCount < salesorderSearch.length; searchCount++) 
				{
					var orderId = salesorderSearch[searchCount].getId();
					orderIds[orderId] = orderId;
				}
		}
	
	//Process all of the relevant sales orders
	//
	for ( var salesOrderId in orderIds) 
		{
					checkResources();
					
					var summary = {};
                  
					for(key in summary)
	                    {
	                      delete summary[key]
	                    }
                  
					
					//Run a search to find the picked values
					//
					var salesorderLineSearch = nlapiSearchRecord("salesorder",null,
							[
							   ["type","anyof","SalesOrd"], 
							   "AND", 
							   ["mainline","is","F"], 
							   "AND", 
							   ["taxline","is","F"], 
							   "AND", 
							   ["cogs","is","F"], 
							   "AND", 
							   ["shipping","is","F"], 
							   "AND", 
							   ["internalid","anyof",salesOrderId]
							], 
							[
							   new nlobjSearchColumn("item"), 
							   new nlobjSearchColumn("lineuniquekey"), 
							   new nlobjSearchColumn("line"), 
							   new nlobjSearchColumn("linesequencenumber"), 
							   new nlobjSearchColumn("quantitypicked"), 
							   new nlobjSearchColumn("quantitypacked")
							]
							);
					
					var thisRecord = nlapiLoadRecord(thisRecordType, salesOrderId);
					var lines = thisRecord.getLineItemCount('item');
					
					//Loop through the item lines
					//
					for (var int = 1; int <= lines; int++) 
						{
							checkResources();
						
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
							var lineUniqueKey = thisRecord.getLineItemValue('item', 'lineuniquekey', int);
							var linePicked = getPickedQty(salesorderLineSearch, lineUniqueKey);
							
							var tempQty = Number(lineCommitted) - Number(linePicked) + Number(lineFulfilled);
							lineCommitted = (tempQty > Number(lineCommitted) ? Number(lineCommitted) : tempQty);
							
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
											
											// check if the discount variable returns a value
											if (discount)
												{
													discount = (parseFloat(discount) * -1);
													discount = discount.toFixed(2) + '%';
												}
											else
												{
													// set the discount variable to '0.00%'
													var discount = '0.00%';
												}
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
											
											// check if the discount variable returns a value
											if (discount)
												{
													discount = (parseFloat(discount) * -1);
													discount = discount.toFixed(2) + '%';
												}
											else
												{
													// set the discount variable to '0.00%'
													var discount = '0.00%';
												}
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
									
									// check if the discount variable returns a value
									if (discount)
										{
											discount = (parseFloat(discount) * -1);
											discount = discount.toFixed(2) + '%';
										}
									else
										{
											// set the discount variable to '0.00%'
											var discount = '0.00%';
										}
								}
							else
								{
									// set the discount variable to '0.00%'
									var discount = '0.00%';
								}
							
							//Check that the discount variable is not equal to 0.00%
							//
							if (discount != '0.00%')
								{
									//Remove % from discount variable
									//
									var discountSubstring = discount.slice(0, -1);
									
									//Divide the discountSubstring by 100 to get a decimal number
									//
									discountSubstring = (discountSubstring / 100);
								
									//Calculate the lineUnitPrice
									//
									lineUnitPrice = (lineUnitPrice / (1 - discountSubstring));
									
									//Round to two decimal places
									//
									lineUnitPrice = Math.floor(lineUnitPrice * 100) / 100;
								}
							
							//Only interested in inventory & non-inventory items
							//
							if(lineType == 'InvtPart' || lineType == 'NonInvtPart')
								{
									checkResources();
								
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
							        
							        nlapiLogExecution('DEBUG', 'Record Type', recordType);
								
							        //Get info about current product & parent etc.
							        //
							        var itemInfo = nlapiLookupField(recordType, lineItem, ['parent','custitem_fbi_item_colour','custitem_fbi_item_size1','custitem_fbi_item_size2'], false);
							        var itemInfoText = nlapiLookupField(recordType, lineItem, ['parent','custitem_fbi_item_colour','custitem_fbi_item_size1','custitem_fbi_item_size2'], true);
							        
							        nlapiLogExecution('DEBUG', 'Item Info', itemInfo);
							        nlapiLogExecution('DEBUG', 'Item Info Text', itemInfoText);
							        
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
							        		padding_left((itemInfo.custitem_fbi_item_size2 == '' ? '0' : itemInfo.custitem_fbi_item_size2), '0', 6) + 
							        		padding_left(lineUnitPrice, '0', 6);
							        		
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
					var outputArray = null;
					outputArray = [];
					
					//Sort outputSummary
					//
					const sortedSummary = {};
                  
					for(key in sortedSummary)
	                    {
	                      delete sortedSummary[key]
	                    }
                  
				    Object.keys(summary).sort().forEach(function(key) {
				    	sortedSummary[key] = summary[key];
				    });
					
					//Loop through the summaries
					//
					for ( var key in sortedSummary) 
						{
							//Push a new instance of the output summary object onto the output array
							//
							outputArray.push(new outputSummary	(	
																sortedSummary[key].itemId, 
																sortedSummary[key].salesDescription, 
																sortedSummary[key].locationText, 
																sortedSummary[key].itemColourText + ' ' + sortedSummary[key].itemSize2Text, 
																sortedSummary[key].getQuantitySizeSummary(), 
																sortedSummary[key].getQuantitySizeTotal(),
																sortedSummary[key].unitPrice,
																sortedSummary[key].getAmountTotal(),
																sortedSummary[key].getVatAmountTotal(),
																sortedSummary[key].vatCode,
																sortedSummary[key].discount,
																sortedSummary[key].getQuantitySizeSummaryCommitted(),
																sortedSummary[key].getQuantitySizeCommittedTotal()
																)
											);
						}
					
					//Save the output array to the sales order
					//
					nlapiSubmitField(thisRecordType, salesOrderId, ['custbody_bbs_item_summary_json','custbody_bbs_item_suumary_created'], [JSON.stringify(outputArray),'T'], false);
		}
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
function getPickedQty(_salesorderLineSearch, _lineUniqueKey)
{
	var pickedQty = Number(0);
	
	if(_salesorderLineSearch != null && _salesorderLineSearch.length > 0)
		{
			for (var int2 = 0; int2 < _salesorderLineSearch.length; int2++) 
				{
					var lineKey = _salesorderLineSearch[int2].getValue("lineuniquekey");
					
					if(lineKey == _lineUniqueKey)
						{
							pickedQty = Number(_salesorderLineSearch[int2].getValue("quantitypicked"));
							break;
						}
				}
		}
	
	return pickedQty;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}

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
