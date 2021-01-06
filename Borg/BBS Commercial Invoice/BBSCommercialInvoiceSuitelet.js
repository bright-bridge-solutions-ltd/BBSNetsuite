/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Nov 2020     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
	{
		//Number formatting prototype
		//
		Number.formatFunctions={count:0};
		Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};
		
		//=====================================================================
		// Parameters passed to the suitelet
		//=====================================================================
		//
		var itemFulfillmentParam = request.getParameter('fulfillment');
		
		if (itemFulfillmentParam != null && itemFulfillmentParam != '') 
			{
				// Build the output
				//	
				var file = buildOutput(itemFulfillmentParam);
		
				// Send back the output in the response message
				//
				if(file != null)
					{
						response.setContentType('PDF', 'Commercial Invoice.pdf', 'inline');
						response.write(file.getValue());
					}
			}
	}

function buildOutput(_fulfillmentId)
	{
		var fulfillmentRecord 	= null;
		var salesOrderRecord 	= null;
		var customerRecord 		= null;
		var salesOrderId		= null;
		var pdfFileObject 		= null;
		var xml 				= "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">";
		var userName 			= nlapiEscapeXML(nlapiGetContext().getName());
		
		//Load the fulfilment record
		//
		try 
			{
				fulfillmentRecord = nlapiLoadRecord('itemfulfillment', _fulfillmentId);
			} 
		catch (err) 
			{
				fulfillmentRecord 	= null;
			}
	
		//Did we get it ok?
		//
		if(fulfillmentRecord != null)
			{
				//Get the sales order id
				//
				salesOrderId = fulfillmentRecord.getFieldValue('createdfrom');
				
				//Try to load the sales order
				//
				if(salesOrderId != null && salesOrderId != '')
					{
						try
							{
								salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);
							}
						catch(err)
							{
								salesOrderRecord = null;
							}
						
						//Did the sales order load ok?
						//
						if(salesOrderRecord != null)
							{
								//Get data fields
								//
								var ifTranDate 			= nlapiEscapeXML(fulfillmentRecord.getFieldValue('trandate'));
								var ifShipMethod		= isNull(nlapiEscapeXML(fulfillmentRecord.getFieldText('shipmethod')),'');
								var ifTranId 			= nlapiEscapeXML(fulfillmentRecord.getFieldValue('tranid'));
								var ifTranShipAddress 	= nlapiEscapeXML(fulfillmentRecord.getFieldValue('shipaddress'));
								ifTranShipAddress 		= ifTranShipAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
								var ifEORI				= isNull(nlapiEscapeXML(fulfillmentRecord.getFieldValue('custbody_bo_tran_eori_number')),'');
								
								var soBillAddress 		= nlapiEscapeXML(salesOrderRecord.getFieldValue('billaddress'));
								soBillAddress 			= soBillAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
								var soOtherRef 			= isNull(nlapiEscapeXML(salesOrderRecord.getFieldValue('otherrefnum')),'');
								var soTranId 			= nlapiEscapeXML(salesOrderRecord.getFieldValue('tranid'));
								var soCustomer 			= salesOrderRecord.getFieldValue('entity');
								var soShipCost 			= Number(salesOrderRecord.getFieldValue('shippingcost'));
								var soCurrency 			= salesOrderRecord.getFieldValue('currency');
								var soCurrencySymbol	= getCurrencySymbol(soCurrency);
								var soPlacedByEmail 	= isNull(nlapiEscapeXML(salesOrderRecord.getFieldValue('custbody_bbs_order_contact_email')),'');
								var soDeliveryTerms		= isNull(nlapiEscapeXML(salesOrderRecord.getFieldValue('custpage_delivery_terms')),'');
								
								try
									{
										customerRecord = nlapiLoadRecord('customer', soCustomer);
									}
								catch(err)
									{
										customerRecord 	= null;
									}
								
								if(customerRecord != null)
									{
									
										var customerVatNo 	= isNull(nlapiEscapeXML(customerRecord.getFieldValue('vatregnumber')),'');
										var customerNo 		= nlapiEscapeXML(customerRecord.getFieldValue('entityid')).split(' ')[0];
									
										xml += '<pdf>';
										xml += '<head>';
										xml += '	<link type="font" name="Futura" subtype="TrueType" src="https://3976137.app.netsuite.com/core/media/media.nl?id=3399123&amp;c=3976137&amp;h=7917b62431a11b4980e7&amp;_xt=.ttf" src-bold="https://3976137.app.netsuite.com/core/media/media.nl?id=3399122&amp;c=3976137&amp;h=4d2d7c35c4770d83a7b6&amp;_xt=.ttf" />';
										xml += '    <macrolist>';
										xml += '		<macro id="nlheader">';
										xml += '            <table class="header" style="table-layout:fixed; width:100%;">';
										xml += '            	<tr>';
										xml += '					<td style="width: 60%"><img src="https://3976137-sb1.app.netsuite.com/core/media/media.nl?id=1897&amp;c=3976137_SB1&amp;h=a06e41069e3014da9368" style="width:136px; height:63px;" /></td>';
										xml += '					<td style="width: 22%; font-size: 9px;" align="left">Telephone<br/>+44(0) 1362 695 006<br/>Email<br/>sales@borgandoverstrom.com<br/>&nbsp;<br/>&nbsp;<br/>&nbsp;<br/><b>borgandoverstrom.com</b></td>';
										xml += '					<td style="width: 18%; font-size: 9px;" align="left">Synergy House<br/>Fakenham Road<br/>Morton on the Hill<br/>NR9 5SP</td>';
										xml += '				</tr>';
										xml += '			</table>';
										xml += '          ';
										xml += '            <table class="header" style="table-layout:fixed; width:100%; margin-top: 160px;">';
										xml += '            	<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 27%; font-size: 10px;"><b>Invoice To</b></td>';
										xml += '					<td style="width: 12%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '					<td style="width: 41%; font-size: 10px;" align="left">' + ifTranDate + '</td>';
										xml += '				</tr>';
										xml += '				<tr style="margin-top: 5px;">';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 27%; font-size: 10px;">' + soBillAddress + '</td>';
										xml += '					<td style="width: 12%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '					<td style="width: 41%; font-size: 10px;" align="left">' + soTranId + '</td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 27%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 12%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '					<td style="width: 41%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 27%; font-size: 10px;">VAT No.:  ' + customerVatNo + '</td>';
										xml += '					<td style="width: 12%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '					<td style="width: 41%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 27%; font-size: 10px;">EORI No.:  ' + ifEORI + '</td>';
										xml += '					<td style="width: 12%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '					<td style="width: 41%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '			</table>';
										xml += '          ';
										xml += '           	<table class="header" style="table-layout:fixed; width:100%; margin-top: 10px;">';
										xml += '            	<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 40%; font-size: 16px; border-top: 1px solid #bfbfbf; padding-top: 5px;" colspan="2"><b>Commercial Invoice</b></td>';
										xml += '					<td style="width: 40%; font-size: 10px; border-top: 1px solid #bfbfbf; padding-top: 5px;" align="left"><b>Delivery Address</b></td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '					<td style="width: 40%; font-size: 10px;" align="left" rowspan="4">' + ifTranShipAddress + '</td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">Client Order Number</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">' + soOtherRef +'</td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 20%; font-size: 10px; border-bottom: 1px solid #bfbfbf;" align="left">Client Account Ref.</td>';
										xml += '					<td style="width: 20%; font-size: 10px; border-bottom: 1px solid #bfbfbf; margin-right: 5px;" align="left">' + customerNo + '</td>';
										xml += '				</tr>';
										xml += '				<tr style="margin-top: 5px;">';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">Invoice Date</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">' + ifTranDate + '</td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">Our Reference</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">' + ifTranId + '</td>';
										xml += '					<td style="width: 40%; font-size: 10px;" align="left"><b>Contact Email:</b></td>';
										xml += '				</tr>';
										xml += '				<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">SO Reference</td>';
										xml += '					<td style="width: 20%; font-size: 10px;" align="left">' + soTranId + '</td>';
										xml += '					<td style="width: 40%; font-size: 10px;" align="left">' + soPlacedByEmail + '</td>';
										xml += '				</tr>';
										xml += '';
										xml += '			</table>';
										xml += '        </macro>';
										xml += '      ';
										xml += '        <macro id="nlfooter">';
										xml += '            <table class="header" style="table-layout:fixed; width:100%;">';
							
							 			xml += '            	<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 35%; font-size: 10px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Country of Origin: United Kingdom</td>';
										xml += '					<td style="width: 45%; font-size: 10px; border-top: 1px solid #bfbfbf; padding-top: 5px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '            	<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 35%; font-size: 10px;">Certified True and Correct</td>';
										xml += '					<td style="width: 45%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
							
										xml += '            	<tr style="margin-top: 10px;">';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 35%; font-size: 10px;">Print: ' + userName + '</td>';
										xml += '					<td style="width: 45%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '            	<tr style="margin-top: 10px;">';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 35%; font-size: 10px;">VAT No.  GB 788436081</td>';
										xml += '					<td style="width: 45%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '            	<tr>';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 35%; font-size: 10px;">EORI No. GB788436081000</td>';
										xml += '					<td style="width: 45%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '            	<tr style="margin-top: 10px;">';
										xml += '					<td style="width: 20%; font-size: 10px;">&nbsp;</td>';
										xml += '					<td style="width: 35%; font-size: 10px;">Borg &amp; Overstrom - the trading name of Azure Uk</td>';
										xml += '					<td style="width: 45%; font-size: 10px;" align="left">&nbsp;</td>';
										xml += '				</tr>';
										xml += '          	</table>';
										xml += '        </macro>';
										xml += '    </macrolist>';
										xml += '  ';
										xml += '    <style type="text/css">';
										xml += '      * {';
										xml += '			font-family: helvetica;';   //Futura, NotoSans, sans-serif;';
										xml += '		}';
										xml += '	</style>';
										xml += '</head>';
										xml += '<body header="nlheader" header-height="550px" footer="nlfooter" footer-height="120px" padding="0.5cm 0.5cm 0.5cm 0.5cm" size="A4">';
										
									
										var ifLines 	= fulfillmentRecord.getLineItemCount('item');
										var subTotal 	= Number(0);
										
										if(ifLines > 0)
											{
												xml += '  <table class="header" style="width: 100%;">';
												xml += '    <thead>';
												xml += '        <tr>';
												xml += '          <th align="left"  colspan="2" style="font-size: 9px;">&nbsp;</th>';
												xml += '          <th align="left"  colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Serial Number</th>';
												xml += '          <th align="left"  colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Item</th>';
												xml += '          <th align="left"  colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Com. Code</th>';
												xml += '          <th align="left"  colspan="5" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Description</th>';
												xml += '          <th align="left"  colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Type</th>';
												xml += '          <th align="right" colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Qty</th>';
												xml += '          <th align="right" colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Unit Price</th>';
												xml += '          <th align="right" colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Net Price</th>';
												xml += '          <th align="right" colspan="2" style="font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">KG</th>';
												xml += '        </tr>';
												xml += '    </thead>';
												
												for (var int = 1; int <= ifLines; int++) 
													{
														var ifLineSerialNo 		= isNull(nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'custcol_bbs_if_serial_no', int)),'');
														ifLineSerialNo			= ifLineSerialNo.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
														var ifLineItem 			= nlapiEscapeXML(fulfillmentRecord.getLineItemText('item', 'item', int));
														var ifLineItemId		= fulfillmentRecord.getLineItemValue('item', 'item', int);
														var ifLineItemRecType	= fulfillmentRecord.getLineItemValue('item', 'itemtype', int);
														var ifLineItemType 		= nlapiEscapeXML(nlapiLookupField(getItemRecordType(ifLineItemRecType), ifLineItemId, 'custitem_bbs_product_group', true));
														var ifLineCommodity		= isNull(nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'custcol_bbs_commodity_code', int)),'');
														var ifLineDescription 	= isNull(nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'description', int)),'');
														var ifLineQuantity 		= Number(fulfillmentRecord.getLineItemValue('item', 'quantity', int));
														var ifLineWeight 		= Number(fulfillmentRecord.getLineItemValue('item', 'custcol_bbs_item_weight', int));
														var ifLineOrderLine 	= Number(fulfillmentRecord.getLineItemValue('item', 'orderline', int));
														var ifLineUnitPrice		= Number(getSoLineInfo(salesOrderRecord, ifLineOrderLine, 'rate'));
														
														//If no rate then see if we can get the rate from price band 'I' on the item record
														//
														if(ifLineUnitPrice == null || ifLineUnitPrice == '' || ifLineUnitPrice == 0)
															{
																ifLineUnitPrice = getItemPriceBandPricve(ifLineItemId);
															}
														
														var ifNetPrice 			= Number(ifLineUnitPrice * ifLineQuantity);
														subTotal 			   += ifNetPrice;
														
														xml += '       <tr>';
														xml += '          <td align="left"  colspan="2" style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
														xml += '          <td align="left"  colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifLineSerialNo + '</td>';
														xml += '          <td align="left"  colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifLineItem + '</td>';
														xml += '          <td align="left"  colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifLineCommodity + '</td>';
														xml += '          <td align="left"  colspan="5" style="padding-left: 0px; font-size: 9px;">' + ifLineDescription + '</td>';
														xml += '          <td align="left"  colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifLineItemType + '</td>';
														xml += '          <td align="right" colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifLineQuantity.numberFormat('0.00') + '</td>';
														xml += '          <td align="right" colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifLineUnitPrice.numberFormat('0.00') + '</td>';
														xml += '          <td align="right" colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifNetPrice.numberFormat('0.00') + '</td>';
														xml += '          <td align="right" colspan="2" style="padding-left: 0px; font-size: 9px;">' + ifLineWeight.numberFormat('0.00') + '</td>';
														xml += '        </tr>';
													}
											
												xml += '  </table>';
												
												var total = Number(subTotal + soShipCost); 
												
												xml += '  <table class="header" style="width: 100%; page-break-inside: avoid; margin-top: 10px;">';
												xml += '    	<tr>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="15" style="padding-left: 0px; font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Subtotal</td>';
												xml += '          <td align="right" colspan="2"  style="padding-left: 0px; font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">' + subTotal.numberFormat('0.00') + '</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '        </tr>';
												xml += '    	<tr>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="15" style="padding-left: 0px; font-size: 9px;">Shipping Cost (' + ifShipMethod + ')</td>';
												xml += '          <td align="right" colspan="2"  style="padding-left: 0px; font-size: 9px;">' + soShipCost.numberFormat('0.00') + '</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '        </tr>';
												xml += '    	<tr>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="15" style="padding-left: 0px; font-size: 9px;">Total Amount</td>';
												xml += '          <td align="right" colspan="2"  style="padding-left: 0px; font-size: 9px;">' + soCurrencySymbol + total.numberFormat('0.00') + '</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '        </tr>';
												xml += '';
												
												xml += '    	<tr style="margin-top: 10px;">';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="9" style="padding-left: 0px; font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">Watercooler Dispensers for filtered water and related parts.</td>';
												xml += '          <td align="left"  colspan="8"  style="padding-left: 0px; font-size: 9px; border-top: 1px solid #bfbfbf; padding-top: 5px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '        </tr>';
												
												xml += '    	<tr style="margin-top: 10px;">';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="9"  style="padding-left: 0px; font-size: 9px;">Shipping Terms: ' + soDeliveryTerms + '</td>';
												xml += '          <td align="left"  colspan="8"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '          <td align="left"  colspan="2"  style="padding-left: 0px; font-size: 9px;">&nbsp;</td>';
												xml += '        </tr>';
												
												xml += '  </table>';
											}
										else
											{
												xml += '<p>&nbsp;</p>';
											}
										
										
										xml += '</body>';
										xml += '</pdf>';
										
										
										//Convert to pdf using the BFO library
										//
										try
											{
												pdfFileObject = nlapiXMLToPDF(xml);
											}
										catch(err)
											{
												pdfFileObject = null;
												nlapiLogExecution('ERROR', 'Error converting xml to pdf', err.message);
											}
									}
							}
					}
			}

		return pdfFileObject;
	}

function isNullOrEmpty(strVal)
	{
		return(strVal == undefined || strVal == null || strVal === "");
	}

//Function to replace a null value with a specific value
//
function isNull(_string, _replacer)
	{
		if(_string == null)
			{
				return _replacer;
			}
		else
			{
				return _string;
			}
	}

function getSoLineInfo(_salesOrderRec, _orderLine, _column)
	{
		var returnedValue = '';
		var soLines = _salesOrderRec.getLineItemCount('item');
		
		for (var int2 = 1; int2 <= soLines; int2++) 
			{
				var soLine = _salesOrderRec.getLineItemValue('item','line', int2);
				
				if(soLine == _orderLine)
					{
						returnedValue = _salesOrderRec.getLineItemValue('item', _column, int2);
						break;
					}
			}
		
		return returnedValue;
	}

function getCurrencySymbol(_currencyId)
	{
		var currencySymbol = '';
		var currencyRecord = null;
		
		try
			{
				currencyRecord = nlapiLoadRecord('currency', _currencyId);
			}
		catch(err)
			{
				currencyRecord = null;
			}
		
		if(currencyRecord != null)
			{
				currencySymbol = currencyRecord.getFieldValue('displaysymbol');
			}
		
		return currencySymbol;
	}

function getItemRecordType(_itemType)
{
	var _itemRecordType = '';
	
	switch(_itemType)
	{
		case 'InvtPart':
			_itemRecordType = 'inventoryitem';
			break;
		
		case 'NonInvtPart':
			_itemRecordType = 'noninventoryitem';
			break;
		
		case 'Assembly':
			_itemRecordType = 'assemblyitem';
			break;
			
		case 'Kit':
			_itemRecordType = 'kititem';
			break;
			
		case 'Service':
			_itemRecordType = 'serviceitem';
			break;
			
		case 'Discount':
			_itemRecordType = 'discountitem';
			break;
		
		case 'Group':
			_itemRecordType = 'itemgroup';
			break;
		
		default:
			_itemRecordType = _itemType;
			break;
	}

	return _itemRecordType;
}

function getItemPriceBandPricve(_itemId)
	{
		var priceBandPrice = Number(0);
		
		var itemSearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof",_itemId], 
				   "AND", 
				   ["pricing.pricelevel","anyof","21"]
				], 
				[
				   new nlobjSearchColumn("itemid").setSort(false), 
				   new nlobjSearchColumn("pricelevel","pricing",null), 
				   new nlobjSearchColumn("unitprice","pricing",null)
				]
				);
		if(itemSearch != null && itemSearch.length > 0)
			{
				priceBandPrice = Number(itemSearch[0].getValue("unitprice","pricing"));
			}
		
		return priceBandPrice;
	}