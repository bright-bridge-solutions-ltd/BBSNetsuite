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
		var fulfillmentParam = request.getParameter('fulfillment');
		
		if (fulfillmentParam != null && fulfillmentParam != '') 
			{
				// Build the output
				//	
				var file = buildOutput(fulfillmentParam);
		
				// Send back the output in the response message
				//
				if(file != null)
					{
						response.setContentType('PDF', 'Delivery Note.pdf', 'inline');
						response.write(file.getValue());
					}
			}
	}

function buildOutput(_fulfillmentId)
	{
		var fulfillmentRecord 	= null;
		var customerRecord 		= null;
		var pdfFileObject 		= null;
		var xml 				= "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">";
		xml 				   += '<pdfset>';
		
		//Try to load the sales order
		//
		if(_fulfillmentId != null && _fulfillmentId != '')
			{
				try
					{
						fulfillmentRecord = nlapiLoadRecord('itemfulfillment', _fulfillmentId);
					}
				catch(err)
					{
						fulfillmentRecord = null;
					}
				
				//Did the sales order load ok?
				//
				if(fulfillmentRecord != null)
					{
						//Get data fields
						//
						var soShipAddress		= '';
						var soOrderNumber		= '';
						var soShipDate			= '';
						var soAccountNumber		= '';
						var soCustPoNumber		= '';
						var customerNo 			= '';
						var soCustomer 			= fulfillmentRecord.getFieldValue('entity');
						var soLines 			= fulfillmentRecord.getLineItemCount('item');
						var salesOrderId		= fulfillmentRecord.getFieldValue('createdfrom');
						
						soShipAddress 			= nlapiEscapeXML(fulfillmentRecord.getFieldValue('shipaddress'));
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
												soOrderNumber 	= isNull(nlapiEscapeXML(fulfillmentRecord.getFieldValue('otherrefnum')),'').split(' ')[0];
												customerNo 		= isNull(nlapiEscapeXML(customerRecord.getFieldValue('entityid')).split(' ')[0],'');
												soCustPoNumber	= '';
												soShipDate		= isNull(nlapiEscapeXML(fulfillmentRecord.getFieldValue('custbody_exp_ship_date_so')),'');
											}
										else
											{
												soOrderNumber 	= isNull(nlapiEscapeXML(fulfillmentRecord.getFieldValue('tranid')),'');
												customerNo 		= isNull(nlapiEscapeXML(customerRecord.getFieldValue('entityid')).split(' ')[0],'');
												soCustPoNumber	= isNull(nlapiEscapeXML(fulfillmentRecord.getFieldValue('otherrefnum')),'');
												soShipDate		= isNull(nlapiEscapeXML(fulfillmentRecord.getFieldValue('custbody_exp_ship_date_so')),'');
											}
										
										
										for (var int = 1; int <= soLines; int++) 
											{
												var soLineItemId		= fulfillmentRecord.getLineItemValue('item', 'item', int);
												var soLineItem 			= fulfillmentRecord.getLineItemText('item', 'item', int);
												var soLineItemRecType	= fulfillmentRecord.getLineItemValue('item', 'itemtype', int);
												var soLineSupplier		= fulfillmentRecord.getLineItemValue('item', 'custcol_po_vendor', int);
												var soSiteContact 		= '';
												var soNotes				= '';
												
												//Look for the first line that is an inventory item & the supplier is AHS Limited
												//
												if(soLineItem == 'Delivery')
													{
														soSiteContact 	= isNull(nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'custcol7', int)),'');
														soNotes 		= isNull(nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'custcol_dspo_haulier_notes', int)),'');
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
										xml += '					<td align="left"><img src="https://4465021.app.netsuite.com/core/media/media.nl?id=3355802&amp;c=4465021&amp;h=0KolWeuoXm13Z6HRerQIeTQMBJJ4SsY7nJQkpmY6WC6EjuFO" style="width: 155px; height: 58px;" /></td>';
										xml += '					<td align="center" style="font-size: 12pt;">' + (pageCount == 0 ? 'Delivery Note - Haulier Copy' : 'Delivery Note - Customer Copy') + '</td>';
										xml += '					<td align="right"><img src="https://4465021.app.netsuite.com/core/media/media.nl?id=2270&amp;c=4465021&amp;h=2058ba18d0e82bf5543a" style="width: 180px; height: 62px;" /></td>';
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
										xml += '					<td align="left" style="font-size: 10pt;">Delivery Date</td>';
										xml += '					<td align="left" style="font-size: 10pt;">' + soShipDate + '</td>';
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
												xml += '				<tr>';
												xml += '    				<td colspan="3" align="center" style="margin-bottom: 5px;">All goods remain the property of AHS Ltd until full payment is received</td>';
												xml += '				</tr>';
												xml += '            	<tr>';
												xml += '					<td align="left" style="padding-left: 5px; font-size: 10px; border-left: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Received By</td>';
												xml += '					<td align="left" style="padding-left: 5px; font-size: 10px; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Print Name</td>';
												xml += '					<td align="left" style="padding-left: 5px; font-size: 10px; border-top: 1px solid black; border-right: 1px solid black; background-color: #808080; color: #ffffff">Date</td>';
												xml += '              	</tr>';
												xml += '              	<tr>';
												xml += '          			<td align="left" style="font-size: 10px; border-bottom: 1px solid black; border-left: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">&nbsp;</td>';
												xml += '          			<td align="left" style="font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">&nbsp;</td>';
												xml += '          			<td align="left" style="font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black; height: 50px; border-top: 1px solid black; border-bottom: 1px solid black; ">&nbsp;</td>';
												xml += '        		</tr>';
												xml += '          	</table>';
												xml += '<table style="width: 100%; margin-top: 5px;">';
												xml += '	<tr>';
												xml += '    	<td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="left" colspan="2"><img src="https://system.eu2.netsuite.com/core/media/media.nl?id=1511529&amp;c=4465021&amp;h=71b54a3870eeb4ca87a5" style="width: 180px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '		<td style="border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="center" colspan="2"><img src="https://4465021.app.netsuite.com/core/media/media.nl?id=1511532&amp;c=4465021&amp;h=45c5a8c93d87dbccb5b4" style="width: 180px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '    	<td style="border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="center" colspan="1"><img src="https://4465021.app.netsuite.com/core/media/media.nl?id=1511531&amp;c=4465021&amp;h=9c21e4dbddf09cdf5545" style="width: 100px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '    	<td style="border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="center"><img src="https://4465021.app.netsuite.com/core/media/media.nl?id=1511530&amp;c=4465021&amp;h=5fc9ad294f9a0c64d3a9" style="width: 50px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '	</tr>';
												xml += '</table>';
												xml += '            <table class="footer" style="width: 100%;">';
												xml += '               	<tr> ';
												xml += '                  	<td align="right" style="margin-top: 10px;">Page <pagenumber/> of <totalpages/></td>';
												xml += '				</tr>';
												xml += '          	</table>';
											}
										else
											{
												xml += '<table style="width: 100%;">';
												xml += '	<tr>';
												xml += '    	<td colspan="6" align="center" style="margin-bottom: 5px;">All goods remain the property of AHS Ltd until full payment is received</td>';
												xml += '	</tr>';
												xml += '	<tr>';
												xml += '    	<td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="left" colspan="2"><img src="https://system.eu2.netsuite.com/core/media/media.nl?id=1511529&amp;c=4465021&amp;h=71b54a3870eeb4ca87a5" style="width: 180px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '		<td style="border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="center" colspan="2"><img src="https://system.eu2.netsuite.com/core/media/media.nl?id=1511532&amp;c=4465021&amp;h=45c5a8c93d87dbccb5b4" style="width: 180px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '    	<td style="border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="center" colspan="1"><img src="https://system.eu2.netsuite.com/core/media/media.nl?id=1511531&amp;c=4465021&amp;h=9c21e4dbddf09cdf5545" style="width: 100px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '    	<td style="border-right: 1px solid black; border-top: 1px solid black; border-bottom: 1px solid black;" align="center"><img src="https://system.eu2.netsuite.com/core/media/media.nl?id=1511530&amp;c=4465021&amp;h=5fc9ad294f9a0c64d3a9" style="width: 50px; height: 50px; vertical-align: bottom;"/></td>';
												xml += '	</tr>';
												xml += '</table>';
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
										xml += '<body header="nlheader" header-height="270px" footer="nlfooter" footer-height="' + (pageCount == 0 ? '130px' : '70px') + '" padding="0.5in 0.5in 0.5in 0.5in" size="A4">';
												
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
														var soLineItem 			= isNull(nlapiEscapeXML(fulfillmentRecord.getLineItemText('item', 'item', int)),'');
														var soLineDescription 	= isNull(nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'description', int)),'');
														var soLineQuantity 		= Number(fulfillmentRecord.getLineItemValue('item', 'quantity', int));
														var soLineItemRecType	= fulfillmentRecord.getLineItemValue('item', 'itemtype', int);
														var soLineSupplier		= fulfillmentRecord.getLineItemValue('item', 'custcol_po_vendor', int);
														var soLineUom			= nlapiEscapeXML(fulfillmentRecord.getLineItemValue('item', 'unitsdisplay', int));
														
														if(soLineItemRecType != 'NonInvtPart' && soLineItemRecType != 'Group' && soLineSupplier == '16336')
															{
																xml += '       <tr>';
																xml += '          <td align="left"  colspan="7" style="padding-left: 5px; font-size: 10px; border-left: 1px solid black; border-bottom: 1px solid black; border-right: 1px solid black;">' + soLineItem + '<br/>' + soLineDescription + '</td>';
																xml += '          <td align="right" colspan="1" style="padding-right: 5px; font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black;">' + soLineQuantity.numberFormat('0.00') + '</td>';
																xml += '          <td align="right" colspan="1" style="padding-right: 5px; font-size: 10px; border-bottom: 1px solid black; border-right: 1px solid black;">' + soLineUom + '</td>';
																xml += '       </tr>';
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

