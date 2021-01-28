/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 30 Nov 2015 cedric
 * 
 */

// Global variables
var pdfName = "";

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function generate(request, response) 
{
	// See if we have been passed a contract id in the query params of the url,
	// if so this is being run directly from the contract header form
	var contractIdParam = request.getParameter('contractid');

	if (contractIdParam != null && contractIdParam != '') 
		{
			// Build the report
			//
			var file = buildReport(contractIdParam);
	
			// Send back the output in the response message
			//
			response.setContentType('PDF', pdfName, 'inline');
			response.write(file.getValue());
		}
	else 
		{
			// If we have a GET request, the build a form to ask the user to pick a
			// contract to print
			if (request.getMethod() == 'GET') 
				{
					// Create a form
					var form = nlapiCreateForm('Contract Print');
		
					// Set the client side script to be used with this form
					form.setScript('customscript_bbs_suitlet_client');
		
					// Add a field to let the user select which contract to print
					var contractField = form.addField('custpage_f0', 'select', 'Select Contract', 'customrecord_bbs_con_header');
		
					// Add a submit button to generate the report
					var submitButton = form.addSubmitButton('Generate Report');
		
					// Send the form back to the caller
					response.writePage(form);
				}
			else 
				{
					// We must be processing a POST request, so generate the report from
					// the selected contract id
		
					// Get selected contract id from the field on the form via the
					// request
					var selectedContract = request.getParameter('custpage_f0');
		
					if (selectedContract != null && selectedContract != '') 
						{
							var file = buildReport(selectedContract);
			
							// Send back the output in the respnse message
							response.setContentType('PDF', pdfName, 'inline');
							response.write(file.getValue());
						}
				}
		}
}

function buildReport(selectedContract) 
{
	//Number formatting prototype
	//
	Number.formatFunctions={count:0};
	Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};

	// Get the configuration record
	// Won't work as this required privs to access the company config
	//
	var companyConfig = nlapiLoadConfiguration("companyinformation");
	var CompanyName = companyConfig.getFieldValue("companyname");
	var CompanyLogo = companyConfig.getFieldValue("pagelogo");
	var FormLogo = companyConfig.getFieldValue("formlogo");
	var LogoFile = nlapiLoadFile(FormLogo);
	var LogoURL = nlapiEscapeXML(LogoFile.getURL());
	var currencySymbol = companyConfig.getFieldValue("displaysymbol");

    if(currencySymbol == null || currencySymbol == '')
	    {
	      	currencySymbol = '£';
	    }
    
    
	// Load the contract header record
	//
	var contractHeader 		= nlapiLoadRecord('customrecord_bbs_con_header', selectedContract);
	var contractReference 	= nlapiEscapeXML(contractHeader.getFieldValue("name"));
	var customerId 			= contractHeader.getFieldValue("custrecord_bbs_con_customer");
	var contractTotal		= Number(contractHeader.getFieldValue("custrecord_bbs_con_total_sales_value"));
	var contractAnnualised	= Number(contractHeader.getFieldValue("custrecord_bbs_con_annualised_value"));
	
	// Load the customer record found on the contract header
	//
	var customerRecord 	= nlapiLoadRecord("customer", customerId);

	// Get the account manager & the customer name
	var accountManager 	= nlapiEscapeXML(isNull(customerRecord.getFieldValue("salesrep"),''));
	var customerName 	= nlapiEscapeXML(isNull(customerRecord.getFieldValue("companyname"),''));
	var customerVatNo 	= nlapiEscapeXML(isNull(customerRecord.getFieldValue("vatregnumber"),''));

	// Get the customer address
	//
	var addressLines 	= customerRecord.getLineItemCount('addressbook');
	var customerAddress = '';
	
	for (var addressLine = 1; addressLine <= addressLines; addressLine++) 
		{
			var defBilling = customerRecord.getLineItemValue('addressbook', 'defaultbilling', addressLine);
			
			if(defBilling == 'T')
				{
					customerAddress 	= nlapiEscapeXML(customerRecord.getLineItemValue("addressbook", "addrtext", addressLine));
					customerAddress 	= customerAddress.replace(new RegExp("\r\n", 'g'), "<br/>");
					break;
				}
		}
	
	// Load the employee record to get the name of the account manager
	//
	var employeeRecord 		= nlapiLoadRecord("employee", accountManager);
	var accountManagerName 	= nlapiEscapeXML(employeeRecord.getFieldValue("firstname") + " " + employeeRecord.getFieldValue("lastname"));

	// Get the contract header start & end dates
	//
	var contractHeaderStartDate = contractHeader.getFieldValue("custrecord_bbs_con_start_date");
	var contractHeaderEndDate 	= contractHeader.getFieldValue("custrecord_bbs_con_end_date");

	var xml = '';
	
	xml += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
	xml += '<pdf>';
	xml += '<head>';
	xml += '  <link name="NotoSans"   type="font" subtype="truetype"';
	xml += '          src="${nsfont.NotoSans_Regular}"';
	xml += '          src-bold="${nsfont.NotoSans_Bold}"';
	xml += '          src-italic="${nsfont.NotoSans_Italic}"';
	xml += '          src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2"/>';
	xml += '  <link name="HKGrotesk"  type="font" subtype="truetype"';
	xml += '          src="https://4136219.app.netsuite.com/core/media/media.nl?id=2632448&amp;c=4136219&amp;h=juJJ11EWtswAmEqcMajpZKzCFECdMPokwMs9F_olYBpMw4pg&amp;_xt=.ttf"';
	xml += '          src-bold="https://4136219.app.netsuite.com/core/media/media.nl?id=2632452&amp;c=4136219&amp;h=IUy9bPCpV8jHPGfp2DGAPfkOddgIO3pkZnREppPTm0ltIu4p&amp;_xt=.ttf"';
	xml += '          src-italic="https://4136219.app.netsuite.com/core/media/media.nl?id=2632447&amp;c=4136219&amp;h=RAmkXJ1UpGUdZ2Y1h7E3pFFaF1Ji1N_dKSTa2w6uU67UxrzW&amp;_xt=.ttf"';
	xml += '          src-bolditalic="https://4136219.app.netsuite.com/core/media/media.nl?id=2632445&amp;c=4136219&amp;h=xTJrg8aNah9HGFUSz2fFJ7-pdWlOrEH2uar5rMIk1GAT7Zhf&amp;_xt=.ttf" bytes="2"/>';
	xml += ' ';
	xml += ' ';
	xml += '    <macrolist>';
	xml += '    <macro id="nlheader">';
	xml += '      <table class="header" style="width: 100%;">';
	xml += '        <tr>';
	xml += '                    <td align="left" colspan="12" style="font-size: 28pt; margin-top: 20px;">Support Contract</td>';
	xml += '          <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" ><img src="' + LogoURL + '" style="float: right; width: 175px; height: 72px;" /></td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '        </tr>';
	xml += '      </table>';
	xml += '';
	xml += '            <table class="header" style="width: 100%; margin-top: 10px;">';
	xml += '              <tr>';
	xml += '                  <td align="left" colspan="3" style="font-size: 12px; padding-left: 6px;"><b>Contract To</b></td>';
	xml += '                    <td align="left" colspan="9" style="font-size: 12px;">&nbsp;</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">BrightBridge Solutions Limited</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '                <tr>';
	xml += '                    <td class="address" colspan="12" rowspan="8" style="font-size: 12px; padding-left: 5px; padding-top: 5px; padding-bottom: 5px; border: 1px solid #6EBBFF;">' + customerAddress + '<br/><br/>VAT No: ' + customerVatNo + '</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px; padding-top: 2px;">Fosseway Suite</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '        </tr>';
	xml += '                <tr>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">Highcross Business Park</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">Coventry Road</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">Sharnford</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">LE10 3PG</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">United Kingdom</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '                <tr>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">&nbsp;</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '                <tr>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;">VAT No. 213 9382 13</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '            </table>';
	xml += '';
	xml += '            <table class="header" style="width: 100%; margin-top: 10px;">';
	xml += '              <tr>';
	xml += '                    <td class="address" colspan="12" style="font-size: 12px; padding-left: 6px;"><b>Contract Details</b></td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px; ">&nbsp;</td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '                <tr>';
	xml += '                    <td align="left" colspan="3" style="padding: 1px; padding-left: 5px; font-size: 12px; border-left: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;"><b>Customer</b></td>';
	xml += '                    <td align="left" colspan="9" style="padding: 1px; padding-left: 5px; font-size: 12px; border-top: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF;">' + nlapiEscapeXML(contractHeader.getFieldText("custrecord_bbs_con_customer")) + '</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px; "><b>Contact Us</b></td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="3" style="padding: 1px; padding-left: 5px; font-size: 12px; border-left: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;"><b>Contract Name</b></td>';
	xml += '                    <td align="left" colspan="9" style="padding: 1px; padding-left: 5px; font-size: 12px; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;">' + nlapiEscapeXML(contractHeader.getFieldValue("name")) + '</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;"><a href="tel:+443301335000">0330 133 5000</a></td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="3" style="padding: 1px; padding-left: 5px; font-size: 12px; border-left: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;"><b>Contract No</b></td>';
	xml += '                    <td align="left" colspan="9" style="padding: 1px; padding-left: 5px; font-size: 12px; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;">' + nlapiEscapeXML(contractHeader.getFieldValue("custrecord_bbs_con_reference")) + '</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;"><a href="mailto:accounts@brightbridgesolutions.com">accounts@brightbridgesolutions.com</a></td>';
	xml += '                  <td align="left" colspan="1">&nbsp;</td>';
	xml += '                </tr>';
	
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="3" style="padding: 1px; padding-left: 5px; font-size: 12px; border-left: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;"><b>Start Date</b></td>';
	xml += '                    <td align="left" colspan="9" style="padding: 1px; padding-left: 5px; font-size: 12px; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;">' + contractHeaderStartDate + ' (' + contractHeader.getFieldText("custrecord_bbs_con_start_month") + ')</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="right" colspan="7" style="font-size: 12px;"><a href="www.brightbridgesolutions.com">brightbridgesolutions.com</a></td>';
	xml += '                    <td align="left" colspan="1" style="font-size: 12px;">&nbsp;</td>';
	xml += '                </tr>';
	
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="3" style="padding: 1px; padding-left: 5px; font-size: 12px; border-left: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;"><b>End Date</b></td>';
	xml += '                    <td align="left" colspan="9" style="padding: 1px; padding-left: 5px; font-size: 12px; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;">' + contractHeaderEndDate + ' (' + contractHeader.getFieldText("custrecord_bbs_con_end_month") + ')</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="left" colspan="8" style="font-size: 12px;">&nbsp;</td>';
	xml += '                </tr>';
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="3" style="padding: 1px; padding-left: 5px; font-size: 12px; border-left: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;"><b>Acc Manager</b></td>';
	xml += '                    <td align="left" colspan="9" style="padding: 1px; padding-left: 5px; font-size: 12px; border-right: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">' + accountManagerName + '</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="left" colspan="8" style="font-size: 12px;">&nbsp;</td>';
	xml += '                </tr>';
	
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="3">&nbsp;</td>';
	xml += '                    <td align="left" colspan="9">&nbsp;</td>';
	xml += '                    <td align="left" colspan="1">&nbsp;</td>';
	xml += '                    <td align="left" colspan="8">&nbsp;</td>';
	xml += '   ';
	xml += '                </tr>';
	xml += '              ';
	xml += '            </table>';

	xml += '        </macro>';
	xml += '';
	xml += '        <macro id="nlfooter">';
	xml += '            <table class="footer" style="width: 100%;">';
	xml += '              <tr>';
	xml += '                    <td align="left" colspan="12">BrightBridge Solutions Limited. Registered in England, Number 09552788</td>';
	xml += '                    <td align="right" colspan="6">Page <pagenumber/> of <totalpages/></td>';
	xml += '        	</tr>';
	xml += '            </table>';
	xml += '        </macro>';
	xml += '    </macrolist>';
	xml += '';
	xml += '    <style type="text/css">* {';
	xml += '      font-family: HKGrotesk, NotoSans, sans-serif;';
	xml += '    }';
	xml += '    table {';
	xml += '      font-size:      9pt;';
	xml += '      table-layout:     fixed;';
	xml += '          padding:      5px 6px 3px;';
	xml += '    }';
	xml += ' ';
	xml += '        td {';
	xml += '            padding: 4px 6px;';
	xml += '        }';
	xml += '    td p { align:left }';
	xml += '        b {';
	xml += '            font-weight: bold;';
	xml += '            color: #333333;';
	xml += '        }';
	xml += '        table.header td {';
	xml += '            padding: 0px;';
	xml += '            font-size: 10pt;';
	xml += '        }';
	xml += '        table.footer td {';
	xml += '            padding: 0px;';
	xml += '            font-size: 8pt;';
	xml += '        }';
	xml += '        table.itemtable th {';
	xml += '            padding-bottom: 10px;';
	xml += '            padding-top: 10px;';
	xml += '        }';
	xml += '        table.body td {';
	xml += '            padding-top: 2px;';
	xml += '        }';
	xml += '        table.total {';
	xml += '            page-break-inside: avoid;';
	xml += '        }';
	xml += '        tr.totalrow {';
	xml += '            background-color: #e3e3e3;';
	xml += '            line-height: 200%;';
	xml += '        }';
	xml += '        td.totalboxtop {';
	xml += '            font-size: 12pt;';
	xml += '            background-color: #e3e3e3;';
	xml += '        }';
	xml += '        td.addressheader {';
	xml += '            font-size: 8pt;';
	xml += '            padding-top: 6px;';
	xml += '            padding-bottom: 2px;';
	xml += '        }';
	xml += '        td.address {';
	xml += '            padding-top: 0px;';
	xml += '        }';
	xml += '        td.totalboxmid {';
	xml += '            font-size: 28pt;';
	xml += '            padding-top: 20px;';
	xml += '            background-color: #e3e3e3;';
	xml += '        }';
	xml += '        td.totalboxbot {';
	xml += '            background-color: #e3e3e3;';
	xml += '            font-weight: bold;';
	xml += '        }';
	xml += '        span.title {';
	xml += '            font-size: 28pt;';
	xml += '        }';
	xml += '        span.number {';
	xml += '            font-size: 16pt;';
	xml += '        }';
	xml += '        span.itemname {';
	xml += '            font-weight: bold;';
	xml += '            line-height: 150%;';
	xml += '        }';
	xml += '        hr {';
	xml += '            width: 100%;';
	xml += '            height: 1px;';
	xml += '        }';
	xml += '</style>';
	xml += '</head>';
	xml += '';
	xml += '';
	xml += '<body header="nlheader" header-height="380px" footer="nlfooter" footer-height="20px" padding="0.25in 0.25in 0.25in 0.25in" size="A4">';

	
	//Find the contract details
	//
	var customrecord_bbs_con_detailSearch = getResults(nlapiCreateSearch("customrecord_bbs_con_detail",
			[
			   ["custrecord_bbs_con_detail_contract","anyof",selectedContract]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_con_detail_contract").setSort(false), 
			   new nlobjSearchColumn("custrecord_bbs_con_detail_description").setSort(false), 
			   new nlobjSearchColumn("custrecord_bbs_con_detail_annual_value"), 
			   new nlobjSearchColumn("custrecord_bbs_con_detail_prorata_value"), 
			   new nlobjSearchColumn("custrecord_bbs_con_detail_supplier_cost"), 
			   new nlobjSearchColumn("custrecord_bbs_con_detail_start_date"), 
			   new nlobjSearchColumn("custrecord_bbs_con_detail_end_date"), 
			   new nlobjSearchColumn("custrecord_bbs_con_detail_supp_prorata")
			]
			));
	
	if(customrecord_bbs_con_detailSearch != null && customrecord_bbs_con_detailSearch.length > 0)
		{
			xml += '         <table style="width: 100%;">';
			xml += '                <thead>';
			xml += '                    <tr>';
			xml += '                        <th align="left"  colspan="9"  style="padding: 5px 5px 5px 5px; background-color: #ECF1F8; border-left: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;"><b>Contract Item</b></th>';
			xml += '                        <th align="left"  colspan="3"  style="padding: 5px 5px 5px 5px; background-color: #ECF1F8; border-left: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;"><b>Start</b></th>';
			xml += '                        <th align="left"  colspan="3"  style="padding: 5px 5px 5px 5px; background-color: #ECF1F8; border-left: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;"><b>End</b></th>';
			xml += '                        <th align="right" colspan="3"  style="padding: 5px 5px 5px 5px; background-color: #ECF1F8; border-left: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;"><b>Value</b></th>';
			xml += '                        <th align="right" colspan="3"  style="padding: 5px 5px 5px 5px; background-color: #ECF1F8; border-left: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF;"><b>Annualised</b></th>';
			xml += '                    </tr>';
			xml += '        </thead>';
			xml += '';
		
			for (var contractLine = 0; contractLine < customrecord_bbs_con_detailSearch.length; contractLine++) 
				{
					var lineDescription 	= nlapiEscapeXML(customrecord_bbs_con_detailSearch[contractLine].getValue("custrecord_bbs_con_detail_description"));
					var lineAnnualValue 	= Number(customrecord_bbs_con_detailSearch[contractLine].getValue("custrecord_bbs_con_detail_annual_value"));
					var lineProrataValue 	= Number(customrecord_bbs_con_detailSearch[contractLine].getValue("custrecord_bbs_con_detail_prorata_value"));
					var lineStartDate 		= customrecord_bbs_con_detailSearch[contractLine].getValue("custrecord_bbs_con_detail_start_date");
					var lineEndDate 		= customrecord_bbs_con_detailSearch[contractLine].getValue("custrecord_bbs_con_detail_end_date");
					var detailId 			= customrecord_bbs_con_detailSearch[contractLine].getId();
					lineProrataValue 		= (lineProrataValue != 0 ? lineProrataValue : lineAnnualValue);
					
					if (lineStartDate != contractHeaderStartDate || lineEndDate != contractHeaderEndDate) 
						{
						}
					else 
						{
							lineStartDate 	= "";
							lineEndDate 	= "";
						}
					
					xml += '                    <tr>';
					xml += '                        <td align="left"  colspan="9"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">' + lineDescription + '</td>';
					xml += '                        <td align="left"  colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">' + lineStartDate + '</td>';
					xml += '                        <td align="left"  colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">' + lineEndDate + '</td>';
					xml += '                        <td align="right" colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">' + currencySymbol + lineAnnualValue.numberFormat('#,##0.00') + '</td>';
					xml += '                        <td align="right" colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF;">' + currencySymbol + lineProrataValue.numberFormat('#,##0.00') + '</td>';
					xml += '                    </tr>';

					//Search for line detail items
					//
					var customrecord_bbs_con_detail_itemsSearch = getResults(nlapiCreateSearch("customrecord_bbs_con_detail_items",
							[
							   ["custrecord_bbs_con_detail_item_detail_id","anyof",detailId]
							], 
							[
							   new nlobjSearchColumn("custrecord_bbs_con_detail_item_detail_id"), 
							   new nlobjSearchColumn("custrecord_bbs_con_detail_item_desc").setSort(false)
							]
							));
					
					if(customrecord_bbs_con_detail_itemsSearch != null && customrecord_bbs_con_detail_itemsSearch.length > 0)
						{
							for (var detailItemLine = 0; detailItemLine < customrecord_bbs_con_detail_itemsSearch.length; detailItemLine++) 
								{
									var detailItemDesc = nlapiEscapeXML(customrecord_bbs_con_detail_itemsSearch[detailItemLine].getValue("custrecord_bbs_con_detail_item_desc"));
									
									xml += '                    <tr>';
									xml += '                        <td align="left"  colspan="9"  style="padding: 5px 5px 5px 20px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">' + detailItemDesc + '</td>';
									xml += '                        <td align="left"  colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">&nbsp;</td>';
									xml += '                        <td align="left"  colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">&nbsp;</td>';
									xml += '                        <td align="right" colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF;">&nbsp;</td>';
									xml += '                        <td align="right" colspan="3"  style="padding: 5px 5px 5px 5px; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF; border-right: 1px solid #6EBBFF;">&nbsp;</td>';
									xml += '                    </tr>';

								}
						}
				}
			
			xml += '            </table>';
			xml += '';
			xml += '';
		}
	
	xml += '<!-- Totals -->';
	xml += '<table style="width: 100%; margin-top: 10px; page-break-inside: avoid;">';
	xml += '	<tr>';
	xml += '		<td align="left" 	colspan="12">&nbsp;</td>';
	xml += '		<td align="left" 	colspan="3" style="padding: 5px 5px 5px 5px; background-color: #F6F9FC; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;"><b>Total</b></td>';
	xml += '		<td align="right" 	colspan="3" style="padding: 5px 5px 5px 5px; background-color: #F6F9FC; border-left: 1px solid #6EBBFF; border-bottom: 1px solid #6EBBFF; border-top: 1px solid #6EBBFF;"><b>' + contractTotal.numberFormat('#,##0.00') + '</b></td>';
	xml += '		<td align="right" 	colspan="3" style="padding: 5px 5px 5px 5px; background-color: #F6F9FC; border: 1px solid #6EBBFF;"><b>' + contractAnnualised.numberFormat('#,##0.00') + '</b></td>';
	xml += '	</tr>';
	xml += '</table>';
	xml += ''; 
	
	xml += '</body>';
	xml += '</pdf>';
	
	// Convert to pdf using the BFO library
	//
	var file = nlapiXMLToPDF(xml);

	// Set the global variable with the name of the pdf file
	//
	if (customerName && contractReference) 
		{
			pdfName = [ customerName, contractReference ].join("-") + ".pdf";
		}
	else 
		{
			pdfName = "SupportContract.pdf";
		}

	return file;

}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start 			= 0;
	var end 			= 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen 		= searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				
				if(moreSearchResultSet == null)
					{
						resultlen = 0;
					}
				else
					{
						resultlen 		= moreSearchResultSet.length;
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
					}
		}
	
	return searchResultSet;
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
