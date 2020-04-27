/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, record) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// create search to find records to be processed
    	return search.create({
    		type: search.Type.SALES_ORDER,
    		
    		columns: [{
    			name: 'tranid',
    			summary: 'GROUP'
    		},
    				{
    			name: 'internalid',
    			summary: 'MAX'
    		}],
    		
    		filters: [
    		          	[["mainline","is","F"],
    		          	"AND",
    		          	["cogs","is","F"],
    		          	"AND",
    		          	["shipping","is","F"],
    		          	"AND",
    		          	["taxline","is","F"],
    		          	"AND",
    		          	["quantitycommitted","greaterthan","0"],
    		          	"AND",
    		          	["status", "noneof", "SalesOrd:A"]], // SalesOrd:A = Sales Order:Pending Approval
    		          	"OR",
    		          	[["mainline","is","T"],
    		          	"AND",
    		          	["status","anyof","SalesOrd:D","SalesOrd:E"]], // SalesOrd:D = Sales Order:Partially Fulfilled, SalesOrd:E = Sales Order:Pending Billing/Partially Fulfilled
    		        ],
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the internal ID of the record from the search results
		var recordID = searchResult.values['MAX(internalid)'];
		
		var summary = {};
        
		for (key in summary)
            {
              delete summary[key]
            }
		
		log.audit({
			title: 'Processing Sales Order',
			details: recordID
		});
		
		// load the sales order record
		var soRecord = record.load({
			type: record.Type.SALES_ORDER,
			id: recordID,
			isDynamic: true
		});
		
		// get count of lines on the record
		var lineCount = soRecord.getLineCount({
			sublistId: 'item'
		});
		
		// loop through lineCount
		for (var i = 0; i < lineCount; i++)
			{
				// get values from the item line
				var lineItem = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'item',
					line: i
				});
				
				var lineQuantity = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: i
				});
				
				var lineCommitted = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantitycommitted',
					line: i
				});
				
				var lineFulfilled = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantityfulfilled',
					line: i
				});
				
				var linePicked = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'itempicked',
					line: i
				});
				
				var lineType = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'itemtype',
					line: i
				});
				
				var lineUnitPrice = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'rate',
					line: i
				});
				
				var lineAmount = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'amount',
					line: i
				});
				
				var lineVatAmount = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'tax1amt',
					line: i
				});
				
				var lineVatCode = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'taxrate1',
					line: i
				});
				
				var lineUniqueKey = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'lineuniquekey',
					line: i
				});
				
				var linePicked = getPickedQty(recordID, lineUniqueKey);
				
				var tempQty = Number(lineCommitted) - Number(linePicked) + Number(lineFulfilled);
				lineCommitted = (tempQty > Number(lineCommitted) ? Number(lineCommitted) : tempQty);
				
				linevatCode = parseFloat(lineVatCode).toFixed(2) + '%';
				
				// get the price level for the line
				var priceLevel = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_bbs_old_price_level',
					line: i
				});
				
				// check if the priceLevel variable returns a value
				if (priceLevel)
					{
						// check that the priceLevel variable is not -1 (Custom) or 1 (Base Price)
						if (priceLevel > 1)
							{
								// lookup fields on the price level record
								var priceLevelLookup = search.lookupFields({
									type: search.Type.PRICE_LEVEL,
									id: priceLevel,
									columns: ['discountpct']
								});
								
								// get the discount percentage from the priceLevelLookup object
								var discount = priceLevelLookup.discountpct;
								
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
				else // custcol_bbs_old_price_level field is empty
					{
						// get the price level for the line
						priceLevel = soRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'price',
							line: i
						});
						
						// check that the priceLevel variable is not -1 (Custom) or 1 (Base Price)
						if (priceLevel > 1)
							{
								// lookup fields on the price level record
								var priceLevelLookup = search.lookupFields({
									type: search.Type.PRICE_LEVEL,
									id: priceLevel,
									columns: ['discountpct']
								});
								
								// get the discount percentage from the priceLevelLookup object
								var discount = priceLevelLookup.discountpct;
								
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
				
				// check that the discount variable is not equal to 0.00%
				if (discount != '0.00%')
					{
						// remove % from discount variable
						var discountSubstring = discount.slice(0, -1);
						
						// divide the discountSubstring variable by 100 to get a decimal number
						discountSubstring = (discountSubstring / 100);
						
						// calculate the lineUnitPrice
						lineUnitPrice = (lineUnitPrice / (1 - discountSubstring));
						
						// round to two decimal places
						lineUnitPrice = Math.floor(lineUnitPrice * 100) / 100;
					}
				
				// only interested in inventory & non-inventory items
				if (lineType == 'InvtPart' || lineType == 'NonInvtPart')
					{
						// declare and initalize variables
						var searchType = '';
						
						// if the lineType is 'InvtPart'
						if (lineType == 'InvtPart')
							{
								// lookup fields on the item record
								var itemInfo = search.lookupFields({
									type: search.Type.INVENTORY_ITEM,
									id: lineItem,
									columns: ['parent','custitem_fbi_item_colour','custitem_fbi_item_size1','custitem_fbi_item_size2']	
								});
								
								// check if there is a parent on the item record
						        if (itemInfo.parent != '')
						        	{
						        		// lookup fields on the parent record
						        		var parentInfo = search.lookupFields({
						        			type: search.Type.INVENTORY_ITEM,
						        			id: itemInfo.parent[0].value,
						        			columns: ['itemid','location','salesdescription']
						        		});
						        	}
						        else // item does not have a parent
						        	{
						        		var parentInfo = search.lookupFields({
						        			type: search.Type.INVENTORY_ITEM,
						        			id: lineItem,
						        			columns: ['itemid','location','salesdescription']
						        		});
						        		
						        		parentInfo.salesDescription = parentInfo.itemid;
						        		itemInfo.parent = lineItem;
						        		itemInfo.custitem_fbi_item_colour = '0';
						        		itemInfo.custitem_fbi_item_size1 = '0';
						        		itemInfo.custitem_fbi_item_size2 = '0';
						        		
						        		itemInfo.parent = parentInfo.itemid;
						        		itemInfo.custitem_fbi_item_colour = '';
						        		itemInfo.custitem_fbi_item_size1 = '';
						        		itemInfo.custitem_fbi_item_size2 = '';
						        	} 
	
							}
						// if the lineType is 'NonInvtPart'
						else if (lineType == 'NonInvtPart')
							{
								// lookup fields on the item record
								var itemInfo = search.lookupFields({
									type: search.Type.INVENTORY_ITEM,
									id: lineItem,
									columns: ['parent','custitem_fbi_item_colour','custitem_fbi_item_size1','custitem_fbi_item_size2']	
								});
								
								// check if there is a parent on the item record
						        if (itemInfo.parent != '')
						        	{
						        		// lookup fields on the parent record
						        		var parentInfo = search.lookupFields({
						        			type: search.Type.NON_INVENTORY_ITEM,
						        			id: itemInfo.parent[0].value,
						        			columns: ['itemid','location','salesdescription']
						        		});
						        	}
						        else // item does not have a parent
						        	{
						        		var parentInfo = search.lookupFields({
						        			type: search.Type.NON_INVENTORY_ITEM,
						        			id: lineItem,
						        			columns: ['itemid','location','salesdescription']
						        		});
						        		
						        		parentInfo.salesDescription = parentInfo.itemid;
						        		itemInfo.parent = lineItem;
						        		itemInfo.custitem_fbi_item_colour = '0';
						        		itemInfo.custitem_fbi_item_size1 = '0';
						        		itemInfo.custitem_fbi_item_size2 = '0';
						        		
						        		itemInfo.parent = parentInfo.itemid;
						        		itemInfo.custitem_fbi_item_colour = '';
						        		itemInfo.custitem_fbi_item_size1 = '';
						        		itemInfo.custitem_fbi_item_size2 = '';
						        	}
							}
						
						// build up the key for the summary
						// parent id + colour id + size2 id
						var key = padding_left(itemInfo.parent[0].value, '0', 6) + 
			        	padding_left(itemInfo.custitem_fbi_item_colour[0].value, '0', 6) + 
			        	padding_left((itemInfo.custitem_fbi_item_size2 == '' ? '0' : itemInfo.custitem_fbi_item_size2[0].value), '0', 6) + 
			        	padding_left(lineUnitPrice, '0', 6);
						
						// does the key exist in the summary, if not create a new entry
				        if (!summary[key])
			        		{
			        			// check if custitem_fbi_item_size2 exists in the itemInfo object
				        		if (itemInfo.custitem_fbi_item_size2 != '')
				        			{
				        				summary[key] = new itemSummaryInfo	(	parentInfo.itemid, 
												itemInfo.custitem_fbi_item_colour[0].value,
												itemInfo.custitem_fbi_item_size2[0].value,
												parentInfo.location[0].value, 
												parentInfo.salesdescription,
												itemInfo.custitem_fbi_item_colour[0].text,
												itemInfo.custitem_fbi_item_size2[0].text,
												parentInfo.location[0].text,
												lineUnitPrice,
												linevatCode,
												discount
											);
				        			}
				        		else
				        			{
					        			summary[key] = new itemSummaryInfo	(	parentInfo.itemid, 
												itemInfo.custitem_fbi_item_colour[0].value,
												'',
												parentInfo.location[0].value, 
												parentInfo.salesdescription,
												itemInfo.custitem_fbi_item_colour[0].text,
												'',
												parentInfo.location[0].text,
												lineUnitPrice,
												linevatCode,
												discount
											);
				        			}
			        		}
				        
				        // update the size & quantity in the summary
				        summary[key].updateSizeQuantity	(
				        									itemInfo.custitem_fbi_item_size1[0].value,
				        									lineQuantity,
				        									itemInfo.custitem_fbi_item_size1[0].text,
				        									lineAmount,
				        									lineVatAmount
				        								);
				        
				        summary[key].updateSizeQuantityCommitted (
				        											itemInfo.custitem_fbi_item_size1[0].value,
				        											lineCommitted,
				        											itemInfo.custitem_fbi_item_size1[0].text,
				        											lineAmount,
				        											lineVatAmount
				        										);
				        
				        // now we have done all summarising, we need to generate the output format
				        var outputArray = null;
				        outputArray = [];
				      
				        // sort outputSummary
				        const sortedSummary = {};
	                  
				        for (key in sortedSummary)
				      		{
				    	  		delete sortedSummary[key]
				      		}
				      
				        Object.keys(summary).sort().forEach(function(key) {
					    	sortedSummary[key] = summary[key];
				        });
				      
				        // loop through the summaries
				        for (var key in sortedSummary)
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

					}			
				
			}
		
		// save the output array to the sales order
        record.submitFields({
        	type: record.Type.SALES_ORDER,
        	id: recordID,
        	values: {
        		custbody_bbs_item_summary_json: JSON.stringify(outputArray),
        		custbody_bbs_item_suumary_created: true
        	}
        });
      
        log.audit({
    	 	title: 'Sales Order Updated',
    	 	details: recordID
        });

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
    
function getPickedQty(salesOrder, lineUniqueKey)
	{
		// create search to find the picked values
		var soLineSearch = search.create({
		type: search.Type.SALES_ORDER,
				
			columns: [{
				name: 'item'
			},
					{
				name: 'lineuniquekey'
			},
					{
				name: 'line'
			},
					{
				name: 'linesequencenumber'
			},
					{
				name: 'quantitypicked'
			},
					{
				name: 'quantitypacked'
			}],
					
			filters: [{
				name: 'mainline',
				operator: 'is',
				values: ['F']	
			},
					{
				name: 'cogs',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'shipping',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'taxline',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'internalid',
				operator: 'anyof',
				values: [salesOrder]
			},
					{
				name: 'lineuniquekey',
				operator: 'equalto',
				values: [lineUniqueKey]
			}],
			
		});
			
		// run search and process results
		soLineSearch.run().each(function(result) {
				
			// get the picked quantity from the search results
			pickedQty = result.getValue({
				name: 'quantitypicked'
			});
				
		});
			
		// return pickedQty to the map() function
		return pickedQty;
			
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

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	
    	log.audit({
    		title: 'Units Used',
    		details: summary.usage
    	});
    	
    	log.audit({
    		title: 'Number of Yields',
    		details: summary.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
