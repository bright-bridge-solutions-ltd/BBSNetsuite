/**
 * Module Description
 * 
 * Version    	Date            	Author           	Remarks
 * 1.00			18 Sep 2019			sambatten			
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
	var purchaseOrderId = context.getSetting('SCRIPT', 'custscript_po_summary_record_id');
	var thisRecordType = context.getSetting('SCRIPT', 'custscript_po_summary_record_type');
	var thisCurrency = context.getSetting('SCRIPT', 'custscript_po_summary_currency');

	var thisRecord = nlapiLoadRecord(thisRecordType, purchaseOrderId);
	
	var lines = thisRecord.getLineItemCount('item');
	
	//Load in the size 1 list
	//
	var size1ListRecord = nlapiLoadRecord('customlist', 101);
	
	//Loop through the item lines
	//
	for (var int = 1; int <= lines; int++) 
		{
			//Get values from the item line
			//
			var lineItem = thisRecord.getLineItemValue('item', 'item', int);
			var lineQuantity = thisRecord.getLineItemValue('item', 'quantity', int);
			var lineType = thisRecord.getLineItemValue('item', 'itemtype', int);
			var lineUnitPrice = thisRecord.getLineItemValue('item', 'rate', int);
			var lineAmount = thisRecord.getLineItemValue('item', 'amount', int);
			var lineVatAmount = thisRecord.getLineItemValue('item', 'tax1amt', int);
			var linevatCode = thisRecord.getLineItemValue('item', 'taxrate1', int);
			linevatCode = parseFloat(linevatCode).toFixed(2) + '%';				
			
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
				        	parentInfo = nlapiLookupField(recordType, itemInfo.parent, ['itemid','location','purchasedescription','custitem_bbs_item_specification','custitem_bbs_item_trim','custitem_bbs_item_packaging','custitem_bbs_item_outer_packaging','custitem_bbs_item_purchase_terms','custitem_fbi_item_size1'], false);
				        	parentInfoText = nlapiLookupField(recordType, itemInfo.parent, ['location','custitem_fbi_item_size1'], true);
				        	
				        	parentInfoText.custitem_fbi_item_size1 =  getSize1Text(size1ListRecord, parentInfo.custitem_fbi_item_size1)
			        	}
			        else
			        	{
			        		parentInfo = nlapiLookupField(recordType, lineItem, ['itemid','location','purchasedescription'], false);
			        		parentInfo.custitem_bbs_item_specification = '';
			        		parentInfo.custitem_bbs_item_trim = '';
			        		parentInfo.custitem_bbs_item_packaging = '';
			        		parentInfo.custitem_bbs_item_outer_packaging = '';
			        		parentInfo.custitem_bbs_item_purchase_terms = '';
			        		parentInfo.purchasedescription = parentInfo.itemid;
			        		parentInfo.custitem_fbi_item_size1 = [];
			        		
			        		parentInfoText.location = nlapiLookupField(recordType, lineItem, ['location'], true);
			        		parentInfoText.custitem_fbi_item_size1 = [];
			        		
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
			        												parentInfo.purchasedescription,
			        												itemInfoText.custitem_fbi_item_colour,
			        												itemInfoText.custitem_fbi_item_size2,
			        												parentInfoText.location,
			        												lineUnitPrice,
			        												linevatCode,
			        												parentInfo.custitem_bbs_item_specification,
			        												parentInfo.custitem_bbs_item_trim,
			        												parentInfo.custitem_bbs_item_packaging,
			        												parentInfo.custitem_bbs_item_outer_packaging,
			        												parentInfo.custitem_bbs_item_purchase_terms,
			        												parentInfo.custitem_fbi_item_size1.split(','),
			        												parentInfoText.custitem_fbi_item_size1.split(',')
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
	var totalQuantity = Number(0);
	var totalAmount = Number(0);
	
	//Loop through the summaries
	//
	for ( var key in summary) 
		{
			//Push a new instance of the output summary object onto the output array
			//
			outputArray.push(new outputSummary	(	
												summary[key].itemId, 
												summary[key].purchaseDescription, 
												summary[key].locationText, 
												summary[key].itemColourText + ' ' + summary[key].itemSize2Text, 
												summary[key].getQuantitySizeSummary(), 
												summary[key].getQuantitySizeTotal(),
												summary[key].unitPrice,
												summary[key].getAmountTotal(),
												summary[key].getVatAmountTotal(),
												summary[key].vatCode,
												summary[key].item_specification,
												summary[key].item_trim,
												summary[key].item_packaging,
												summary[key].item_outer_packaging,
												summary[key].item_purchase_terms
												)
							);
			
			totalQuantity += summary[key].getQuantitySizeTotal();
			totalAmount += summary[key].getAmountTotal();
			
		}
	
	//Get the currency symbol
	//
	var currencyRecord = nlapiLoadRecord('currency', thisCurrency);
	
	var currencySymbol = currencyRecord.getFieldValue('displaysymbol');
	
	//Consolidate header & line info into one object
	//
	var output = new poOutput(outputArray, currencySymbol + outputArray[0].unitPrice.numberFormat('###,###.00'), totalQuantity, currencySymbol + totalAmount.numberFormat('###,###.00'));
	
	//Save the output array to the purchase order
	//
	nlapiSubmitField(thisRecordType, purchaseOrderId, 'custbody_po_matrix_item_json', JSON.stringify(output), false);
}

//=============================================================================
//Objects
//=============================================================================
//
function poOutput(_outputArray, _unitPrice, _totalQuantity, _totalAmount)
{
this.outputArray 	= _outputArray;
this.unitPrice 		= _unitPrice;
this.totalQuantity	= _totalQuantity;
this.totalAmount	= _totalAmount;
}

function outputSummary(_product, _description, _location, _colour, _quantitySize, _total, _unitPrice, _amount, _vatAmount, _vatCode, _item_specification, _item_trim, _item_packaging, _item_outer_packaging, _item_purchase_terms)
{
//Properties
//
this.product 				= _product;
this.description 			= _description;
this.location 				= _location;
this.colour 				= _colour;
this.quantitysize 			= _quantitySize;
this.total 					= Number(_total);
this.amount 				= Number(_amount);
this.unitPrice 				= Number(_unitPrice);
this.vatAmount 				= Number(_vatAmount);
this.vatCode 				= _vatCode;
this.item_specification		= _item_specification
this.item_trim				= _item_trim
this.item_packaging			= _item_packaging
this.item_outer_packaging	= _item_outer_packaging
this.item_purchase_terms	= _item_purchase_terms

}

function itemSummaryInfo(_itemid, _itemColour, _itemSize2, _location, _purchasedescription, _itemColourText, _itemSize2Text, _locationText, _unitPrice, _vatCode, _item_specification, _item_trim, _item_packaging, _item_outer_packaging, _item_purchase_terms, _sizeList, _sizeListText)
{
//Properties
//
this.itemId 				= _itemid;
this.itemColourId 			= _itemColour;
this.itemSize2Id 			= _itemSize2;
this.locationId 			= _location;
this.purchaseDescription 		= _purchasedescription;
this.itemColourText 		= _itemColourText;
this.itemSize2Text 			= _itemSize2Text;
this.locationText 			= _locationText;
this.unitPrice 				= Number(_unitPrice);
this.vatCode 				= _vatCode;
this.item_specification		= _item_specification
this.item_trim				= _item_trim
this.item_packaging			= _item_packaging
this.item_outer_packaging	= _item_outer_packaging
this.item_purchase_terms	= _item_purchase_terms
this.sizeQuantity 			= [];

for (var int2 = 0; int2 < _sizeList.length; int2++) 
{
this.sizeQuantity.push(new sizeQuantityCell(_sizeList[int2], Number(0), _sizeListText[int2], Number(0), Number(0)));
}

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
return this.sizeQuantity;
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

//Get the size1 text from internal id
//
function getSize1Text(_listRecord, idString)
{
	var size1Values = _listRecord.getLineItemCount('customvalue');
	var returnedString = '';
	var idArray = idString.split(',');
	
	for (var int5 = 0; int5 < idArray.length; int5++) 
		{
			for (var int4 = 1; int4 <= size1Values; int4++) 
				{
					var ValueId = _listRecord.getLineItemValue('customvalue', 'valueid', int4);
					var ValueText = _listRecord.getLineItemValue('customvalue', 'value', int4);
					
					if(ValueId == idArray[int5])
						{
							returnedString += ValueText + ',';
							break;
						}
				}
		}
	
	returnedString = returnedString.replace(/,\s*$/, "");
	
	return returnedString;
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