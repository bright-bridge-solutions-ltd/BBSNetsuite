/**
 * Module Description
 * 
 * 	Version    	Date            	Author           	Remarks
 * 	1.00       	10 Sep 2019     	cedricgriffiths
 * 	1.10		18 Sep 2019			sambatten			added action to call scheduled script if more than 30 lines
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
function purchaseOrderSummaryAS(type)
{
	//Number formatting prototype
	//
	Number.formatFunctions={count:0};
	Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};
	
	//Start of main code
	//
	var summary = {};
	var purchaseOrderId = nlapiGetRecordId();
	var thisRecordType = nlapiGetRecordType();
	var thisCurrency = nlapiGetFieldValue('currency');
	
	nlapiLogExecution('DEBUG', 'PO Id', purchaseOrderId);
	nlapiLogExecution('DEBUG', 'Record Type', thisRecordType);
	nlapiLogExecution('DEBUG', 'Currency', thisCurrency);
	
	
	
	//Only on create or edit of the sales order
	//
	if(type == 'create' || type == 'edit')
		{
			//Get the currency symbol
			//
			var currencyRecord = nlapiLoadRecord('currency', thisCurrency);
			
			var currencySymbol = currencyRecord.getFieldValue('displaysymbol');
			
			//Get the count of item lines
			//
			var lines = nlapiGetLineItemCount('item');
					
			// check if the order contains more than 30 lines		
			if (lines > 30)
				{
					//Submit a scheduled job
					//
					var scheduleParams = {custscript_po_summary_record_id: purchaseOrderId, custscript_po_summary_record_type: thisRecordType, custscript_po_summary_currency: thisCurrency};
					nlapiScheduleScript('customscript_bbs_po_summary_scheduled', null, scheduleParams);
				}
			else
				{
					//Load in the size 1 list
					//
					var size1ListRecord = nlapiLoadRecord('customlist', 101);
					
					//Loop through the item lines
					//
					for (var int = 1; int <= lines; int++) 
						{
							//Get values from the item line
							//
							var lineItem = nlapiGetLineItemValue('item', 'item', int);
							var lineQuantity = nlapiGetLineItemValue('item', 'quantity', int);
							var lineType = nlapiGetLineItemValue('item', 'itemtype', int);
							var lineUnitPrice = nlapiGetLineItemValue('item', 'rate', int);
							var lineAmount = nlapiGetLineItemValue('item', 'amount', int);
							var lineVatAmount = nlapiGetLineItemValue('item', 'tax1amt', int);
							var linevatCode = nlapiGetLineItemValue('item', 'taxrate1', int);
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
					
					//Sort outputSummary
					//
					const sortedSummary = {};
				    Object.keys(summary).sort().forEach(function(key) {
				    	sortedSummary[key] = summary[key];
				    });
				    
					//Loop through the summaries
					//
				    var lastProduct = '';
				    var firstTime = true;
				    var groupQuantity = Number(0);
				    var groupValue = Number(0);
				    
					for ( var key in sortedSummary) 
						{
							if(firstTime)
								{
									lastProduct = sortedSummary[key].itemId;
									firstTime = false;
								}
						
							if(lastProduct != sortedSummary[key].itemId && outputArray.length > 0)
								{
									//If we have changed product, update the last entry in the output array to say we need a page break
									//
									outputArray[outputArray.length -1].pageBreak = 'Y';
									outputArray[outputArray.length -1].groupQuantity = groupQuantity;
									outputArray[outputArray.length -1].groupValue = currencySymbol + groupValue.numberFormat('###,###.00');
								
									lastProduct = sortedSummary[key].itemId;
									groupQuantity = Number(0);
								    groupValue = Number(0);
								}
							
							//Push a new instance of the output summary object onto the output array
							//
							outputArray.push(new outputSummary	(	
																sortedSummary[key].itemId, 
																sortedSummary[key].purchaseDescription, 
																sortedSummary[key].locationText, 
																sortedSummary[key].itemColourText + ' ' + sortedSummary[key].itemSize2Text, 
																sortedSummary[key].getQuantitySizeSummary(), 
																sortedSummary[key].getQuantitySizeTotal(),
																sortedSummary[key].unitPrice,
																sortedSummary[key].getAmountTotal(),
																sortedSummary[key].getVatAmountTotal(),
																sortedSummary[key].vatCode,
																sortedSummary[key].item_specification,
																sortedSummary[key].item_trim,
																sortedSummary[key].item_packaging,
																sortedSummary[key].item_outer_packaging,
																sortedSummary[key].item_purchase_terms,
																'N',
																0,
																0,
																currencySymbol + sortedSummary[key].unitPrice.numberFormat('###,###.00')
																)
											);
							
							totalQuantity += sortedSummary[key].getQuantitySizeTotal();
							totalAmount += sortedSummary[key].getAmountTotal();
							
							groupQuantity += sortedSummary[key].getQuantitySizeTotal();
							groupValue += sortedSummary[key].getAmountTotal();
						}
					
					//Update the last group totals
					//
					outputArray[outputArray.length -1].groupQuantity = groupQuantity;
					outputArray[outputArray.length -1].groupValue = currencySymbol + groupValue.numberFormat('###,###.00');
					
					//Consolidate header & line info into one object
					//
					var output = new poOutput(outputArray, currencySymbol + outputArray[0].unitPrice.numberFormat('###,###.00'), totalQuantity, currencySymbol + totalAmount.numberFormat('###,###.00'));
					
					//Save the output array to the purchase order
					//
					nlapiSubmitField(thisRecordType, purchaseOrderId, ['custbody_po_matrix_item_json','custbody_bbs_item_suumary_created'], [JSON.stringify(output), 'T'], false);
				}
}
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

function outputSummary(_product, _description, _location, _colour, _quantitySize, _total, _unitPrice, _amount, _vatAmount, _vatCode, _item_specification, _item_trim, _item_packaging, _item_outer_packaging, _item_purchase_terms, _pageBreak, _groupQuantity, _groupValue, _groupUnitPrice)
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
	this.item_specification		= _item_specification;
	this.item_trim				= _item_trim;
	this.item_packaging			= _item_packaging;
	this.item_outer_packaging	= _item_outer_packaging;
	this.item_purchase_terms	= _item_purchase_terms;
	this.pageBreak 				= _pageBreak;
	this.groupQuantity			= _groupQuantity;
	this.groupValue				= _groupValue;
	this.groupUnitPrice			= _groupUnitPrice;
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
			//return this.sizeQuantity;
			return this.sizeQuantity.sort(compare);
		
			function compare(a, b)
				{
					var textA = a.sizeText;
					var textB = b.sizeText;
					
					var comparison = 0;
					
					if(textA > textB)
						{
							comparison = 1;
						}
					else
						{
							comparison = -1;
						}
					
					return comparison;
				}
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

