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
		var salesOrderParam = request.getParameter('salesorder');
		
		if (salesOrderParam != null && salesOrderParam != '') 
			{
				// Build the output
				//	
				var file = buildOutput(salesOrderParam);
		
				// Send back the output in the response message
				//
				if(file != null)
					{
						response.setContentType('PDF', 'Picking Ticket.pdf', 'inline');
						response.write(file.getValue());
					}
			}
	}

function buildOutput(_salesOrderId)
	{
		var salesOrderRecord 	= null;
		var customerRecord 		= null;
		var salesOrderId		= null;
		var pdfFileObject 		= null;
		var xml 				= "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">";
		xml 				   += '<pdfset>';
		
		//Try to load the sales order
		//
		if(_salesOrderId != null && _salesOrderId != '')
			{
				try
					{
						salesOrderRecord = nlapiLoadRecord('salesorder', _salesOrderId);
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
						var soShipAddress		= '';
						var soOrderNumber		= '';
						var soShipDate			= '';
						var soAccountNumber		= '';
						var soCustPoNumber		= '';
						var customerNo 			= '';
						var soCustomer 			= salesOrderRecord.getFieldValue('entity');
						var soLines 			= salesOrderRecord.getLineItemCount('item');
						
						soShipAddress 			= nlapiEscapeXML(salesOrderRecord.getFieldValue('shipaddress'));
						soShipAddress 			= soShipAddress.replace(/\r\n/g,'<br />').replace(/\n/g,'<br />');
						
						
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
								for (var pageCount = 0; pageCount < 2; pageCount++) 
									{
										//Process based on customer
										//
										if(soCustomer == 19416)		//Gardoo Sales
											{
												soOrderNumber 	= isNull(nlapiEscapeXML(salesOrderRecord.getFieldValue('otherrefnum')),'').split(' ')[0];
												customerNo 		= isNull(nlapiEscapeXML(customerRecord.getFieldValue('entityid')).split(' ')[0],'');
												soCustPoNumber	= '';
											}
										else
											{
												soOrderNumber 	= isNull(nlapiEscapeXML(salesOrderRecord.getFieldValue('tranid')),'');
												customerNo 		= isNull(nlapiEscapeXML(customerRecord.getFieldValue('entityid')).split(' ')[0],'');
												soCustPoNumber	= isNull(nlapiEscapeXML(salesOrderRecord.getFieldValue('otherrefnum')),'');
											}
										
										
										for (var int = 1; int <= soLines; int++) 
											{
												var soLineItemId		= salesOrderRecord.getLineItemValue('item', 'item', int);
												var soLineItemRecType	= salesOrderRecord.getLineItemValue('item', 'itemtype', int);
												var soLineSupplier		= salesOrderRecord.getLineItemValue('item', 'custcol_po_vendor', int);
												var soSiteContact 		= '';
												var soNotes				= '';
												
												//Look for the first line that is an inventory item & the supplier is AHS Limited
												//
												if(soLineItemRecType != 'NonInvtPart'  && soLineItemRecType != 'Group' && soLineSupplier == '16336')
													{
														soSiteContact 	= isNull(nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'custcol7', int)),'');
														soNotes 		= isNull(nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'custcol_dspo_haulier_notes', int)),'');
														break;
													}
											}
										
										//Generate the xml
										//
										xml += '<pdf>';
										xml += '<head>';
										xml += '	<macrolist>';
										xml += '		<macro id="nlheader">';
										xml += '            <table class="header" style="width: 100%;">';
										xml += '            	<tr>';
										xml += '					<td align="center" style="font-size: 18pt;">' + (pageCount == 0 ? 'Picking Ticket' : 'Distribution Ticket') + '</td>';
										xml += '				</tr>';
										xml += '			</table>';
										xml += '            <table class="header" style="width: 100%; margin-top: 20px;">';
										xml += '            	<tr>';
										xml += '					<td align="left" rowspan="6" style="font-size: 10pt;"><b>Ship To:</b><br/>' + soShipAddress + '</td>';
										xml += '					<td align="left" style="font-size: 12pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 12pt;"><b>Sales Order</b></td>';
										xml += '					<td align="left" style="font-size: 12pt;"><b>' + soOrderNumber + '</b></td>';
										xml += '				</tr>';
										xml += '           		<tr>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">Acc No</td>';
										xml += '					<td align="left" style="font-size: 10pt;"><b>' + customerNo + '</b></td>';
										xml += '				</tr>';
										xml += '           		<tr>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">Cust PO</td>';
										xml += '					<td align="left" style="font-size: 10pt;"><b>' + soCustPoNumber + '</b></td>';
										xml += '				</tr>';
										xml += '           		<tr>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '				</tr>';
										xml += '           		<tr>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '				</tr>';
										xml += '           		<tr>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '					<td align="left" style="font-size: 10pt;">&nbsp;</td>';
										xml += '				</tr>';
										xml += '          </table>';
										xml += '          <table class="header" style="width: 100%; margin-top: 10px;">';
										xml += '            <tr>';
										xml += '              	<td style="padding-left: 5px; font-size: 10px; border-left: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Site Contact</td>';
										xml += '              	<td style="padding-left: 5px; font-size: 10px; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Notes</td>';
										xml += '            </tr>';
										xml += '            <tr>';
										xml += '          			<td align="left" style="padding-left: 5px; font-size: 10px; border-bottom: 1px solid black; border-left: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">' + soSiteContact + '</td>';
										xml += '          			<td align="left" style="padding-left: 5px; font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">' + soNotes + '</td>';
										xml += '        		</tr>';
										xml += '          </table>';
										xml += '        </macro>';
										xml += '        <macro id="nlfooter">';
										
										if(pageCount == 0)
											{
												xml += '            <table class="footer" style="width: 100%;">';
												xml += '            	<tr>';
												xml += '					<td align="left" style="padding-left: 5px; font-size: 10px; border-left: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Picked By</td>';
												xml += '					<td align="left" style="padding-left: 5px; font-size: 10px; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Packed By</td>';
												xml += '					<td align="left" style="padding-left: 5px; font-size: 10px; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Packed Date</td>';
												xml += '              	</tr>';
												xml += '              	<tr>';
												xml += '          			<td align="left" style="font-size: 10px; border-bottom: 1px solid black; border-left: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">&nbsp;</td>';
												xml += '          			<td align="left" style="font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">&nbsp;</td>';
												xml += '          			<td align="left" style="font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">&nbsp;</td>';
												xml += '        		</tr>';
												xml += '               	<tr> ';
												xml += '                  	<td colspan="3" align="right" style="margin-top: 10px;">Page <pagenumber/> of <totalpages/></td>';
												xml += '				</tr>';
												xml += '          	</table>';
											}
										else
											{
												xml += '            <table class="footer" style="width: 100%;">';
												xml += '               	<tr> ';
												xml += '                  	<td align="right" style="margin-top: 10px;">Page <pagenumber/> of <totalpages/></td>';
												xml += '				</tr>';
												xml += '          	</table>';
											}
										
										xml += '        </macro>';
										xml += '    </macrolist>';
										xml += '    <style type="text/css">* ';
										xml += '      	{';
										xml += '			font-family: sans-serif;';
										xml += '		}';
										xml += '		table {';
										xml += '			font-size: 9pt;';
										xml += '			table-layout: fixed;';
										xml += '		}';
										xml += '		th {';
										xml += '			font-weight: bold;';
										xml += '			font-size: 8pt;';
										xml += '			vertical-align: middle;';
										xml += '            padding: 5px 6px 3px;';
										xml += '            background-color: #e3e3e3;';
										xml += '			color: #333333;';
										xml += '		}';
										xml += '		td {';
										xml += '            padding: 4px 6px;';
										xml += '        }';
										xml += '		td p { align:left }';
										xml += '		b {';
										xml += '			font-weight: bold;';
										xml += '			color: #333333;';
										xml += '		}';
										xml += '		table.header td {';
										xml += '			padding: 0;';
										xml += '			font-size: 10pt;';
										xml += '		}';
										xml += '		table.footer td {';
										xml += '			padding: 0;';
										xml += '			font-size: 8pt;';
										xml += '		}';
										xml += '		table.itemtable th {';
										xml += '			padding-bottom: 10px;';
										xml += '			padding-top: 10px;';
										xml += '		}';
										xml += '		table.body td {';
										xml += '			padding-top: 2px;';
										xml += '		}';
										xml += '		td.addressheader {';
										xml += '			font-size: 8pt;';
										xml += '			padding-top: 6px;';
										xml += '			padding-bottom: 2px;';
										xml += '		}';
										xml += '		td.address {';
										xml += '			padding-top: 0;';
										xml += '		}';
										xml += '		span.title {';
										xml += '			font-size: 28pt;';
										xml += '		}';
										xml += '		span.number {';
										xml += '			font-size: 16pt;';
										xml += '		}';
										xml += '		span.itemname {';
										xml += '			font-weight: bold;';
										xml += '			line-height: 150%;';
										xml += '		}';
										xml += '		hr {';
										xml += '			width: 100%;';
										xml += '			color: #d3d3d3;';
										xml += '			background-color: #d3d3d3;';
										xml += '			height: 1px;';
										xml += '		}';
										xml += '</style>';
										xml += '</head>';
										xml += '<body header="nlheader" header-height="250px" footer="nlfooter" footer-height="' + (pageCount == 0 ? '60px' : '10px') + '" padding="0.5in 0.5in 0.5in 0.5in" size="A4">';
												
										if(soLines > 0)
											{
												xml += '  <table class="header" style="width: 100%;">';
												xml += '    <thead>';
												xml += '        <tr>';
												xml += '          <th align="left"  colspan="7" style="padding-left: 5px; font-size: 10px; border-left: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Item Description</th>';
												xml += '          <th align="right" colspan="1" style="padding-left: 5px; font-size: 10px; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Qty</th>';
												xml += '          <th align="right"  colspan="1" style="padding-left: 5px; font-size: 10px; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">UOM</th>';
												xml += '        </tr>';
												xml += '    </thead>';
												
												for (var int = 1; int <= soLines; int++) 
													{
														var soLineItem 			= isNull(nlapiEscapeXML(salesOrderRecord.getLineItemText('item', 'item', int)),'');
														var soLineDescription 	= isNull(nlapiEscapeXML(salesOrderRecord.getLineItemValue('item', 'description', int)),'');
														var soLineQuantity 		= Number(salesOrderRecord.getLineItemValue('item', 'quantity', int));
														var soLineItemRecType	= salesOrderRecord.getLineItemValue('item', 'itemtype', int);
														var soLineSupplier		= salesOrderRecord.getLineItemValue('item', 'custcol_po_vendor', int);
														var soLineUom			= nlapiEscapeXML(salesOrderRecord.getLineItemText('item', 'units', int));
														
														if(soLineItemRecType != 'NonInvtPart' && soLineItemRecType != 'Group' && soLineSupplier == '16336')
															{
																xml += '       <tr>';
																xml += '          <td align="left"  colspan="7" style="padding-left: 5px; font-size: 10px; border-left: 1px solid black; border-bottom: 1px solid black; border-right: 1px solid black;">' + soLineItem + '<br/>' + soLineDescription + '</td>';
																xml += '          <td align="right" colspan="1" style="padding-right: 5px; font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black;">' + soLineQuantity.numberFormat('0.00') + '</td>';
																xml += '          <td align="right" colspan="1" style="padding-right: 5px; font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black;">' + soLineUom + '</td>';
																xml += '        </tr>';
															}
													}
											}
										else
											{
												xml += '<p>&nbsp;</p>';
											}
										
										xml += '</table>';
										xml += '</body>';
										xml += '</pdf>';
									
									}
								
								xml += '</pdfset>';
								
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
