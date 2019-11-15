/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Nov 2019     cedricgriffiths
 *
 */

/**
 * @param {nlobjPortlet} portletObj Current portlet object
 * @param {Number} column Column position index: 1 = left, 2 = middle, 3 = right
 * @returns {Void}
 */
function portletName(portletObj, column) 
{
	//Number formatting prototype
	//
	Number.formatFunctions={count:0};
	Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};
	
	var content = '';
	var tileCount = Number(0);
	
	//portletObj.setScript('customscript_bbs_tile_portlet_client');
	
	//Get the entity id
	//
	var entityId = arguments[2];
	
	//var a = document.getElementById('dashboard-column-2');

	//Get the config id from the params
	//
	var context = nlapiGetContext();
	var configId = context.getSetting('SCRIPT', 'custscript_bbs_portlet_config_id');
	
	//Set the portlet title
	//
	portletObj.setTitle('BBS Dashboard Tiles');
	
	var htmlField = portletObj.addField('custpage_hidden', 'inlinehtml', '', null);
	
	//Find the list of tiles to process
	//
	var customrecord_bbs_tile_recordSearch = nlapiSearchRecord("customrecord_bbs_tile_record",null,
			[
			   ["custrecord_bbs_tile_config_id","equalto",configId], 
			   "AND", 
			   ["isinactive","is","F"]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_tile_display_order").setSort(false), 
			   new nlobjSearchColumn("custrecord_bbs_tile_saved_search"), 
			   new nlobjSearchColumn("custrecord_bbs_tile_colour"), 
			   new nlobjSearchColumn("custrecord_bbs_tile_icon"), 
			   new nlobjSearchColumn("custrecord_bbs_tile_text_colour"),
			   new nlobjSearchColumn("custrecord_bbs_tile_title"),
			   new nlobjSearchColumn("custrecord_bbs_tile_prefix"),
			   new nlobjSearchColumn("custrecord_bbs_tile_suffix"),
			   new nlobjSearchColumn("custrecord_bbs_tile_link_url"),
			]
			);
	
	if(customrecord_bbs_tile_recordSearch != null && customrecord_bbs_tile_recordSearch.length > 0)
		{
			//Loop through the results
			//
			content = '<table>';
			content += '<tr style="height: 100px;">';
			
			for (var int = 0; int < customrecord_bbs_tile_recordSearch.length; int++) 
				{
					var savedSearch = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_saved_search");
					var tileColour = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_colour");
					var textColour = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_text_colour");
					var tileIcon = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_icon");
					var tileTitle = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_title");
					var tilePrefix = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_prefix");
					var tileSuffix = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_suffix");
					var tileLink = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_link_url");
					
					tilePrefix = (tilePrefix == null ? '' : tilePrefix);
					tileSuffix = (tileSuffix == null ? '' : tileSuffix);
					
					//Load the saved search
					//
					var tileSavedSearch = nlapiLoadSearch(null, savedSearch);
					var tileSearchColumns = tileSavedSearch.getColumns();
					var tileSearchSelectedColumn = null;
					
					//Loop through the columns of the search to find the first numeric one
					//
					for (var int2 = 0; int2 < tileSearchColumns.length; int2++) 
						{
							var columnType = tileSearchColumns[int2].type;
							
							if(['currency', 'float', 'integer'].indexOf(columnType) != -1)
								{
									tileSearchSelectedColumn = tileSearchColumns[int2];
									break;
								}
						}
					
					//Add filter based on entity
					//
					tileSavedSearch.addFilter(new nlobjSearchFilter('name', null, 'anyof', entityId, null));
					
					//Run the saved search & get value
					//
					var results = getResults(tileSavedSearch);
					
					//Process the results
					//
					if(results != null && results.length > 0)
						{
							var resultValue = Number(0);
							
							for (var int3 = 0; int3 < results.length; int3++) 
								{
									resultValue += Number(results[int3].getValue(tileSearchSelectedColumn));
								}

							resultValue = Number(resultValue).numberFormat('###,###.00');
							
							//Increment the tile counter
							//
							tileCount++;
							
							var resultLabel = tileSearchSelectedColumn.label;
							var resultDataType = tileSearchSelectedColumn.type;
							var tileIconHtml = '';
							var tileDescriptionHtml = '';
									
							if(tileIcon != null && tileIcon != '')
								{
									var file = nlapiLoadFile(tileIcon);
											
									tileIconHtml = '<img src="' + nlapiEscapeXML(file.getURL()) + '" style="float: left; width:50px; height:50px;" />';
								}
							else
								{
									tileIconHtml = '&nbsp;';
								}
									
							if(tileLink != null && tileLink != '')
								{
									tileDescriptionHtml = '<td align="right" style="padding-right: 10px; font-size: 12pt;"><a align="right" style="padding-right: 10px; font-size: 12pt;"href="' + tileLink + entityId + '" target="_blank">' + nlapiEscapeXML(tileTitle) + '</a></td>';
								}
							else
								{
									tileDescriptionHtml = '<td align="right" style="padding-right: 10px; font-size: 12pt;">' + nlapiEscapeXML(tileTitle) + '</td>';
								}
									
							//Build the html
							//
							content += '<td style="width: 400px; background-color: ' + tileColour + '; color: ' + textColour + ';">';
									
							content += '<table width="100%">';
									
							content += '<tr style="height: 25px;">';
							content += '<td>&nbsp</td>';
							content += '<td align="right" style="padding-right: 10px; font-size: 12pt;">' + nlapiEscapeXML(tilePrefix) + nlapiEscapeXML(resultValue) + nlapiEscapeXML(tileSuffix) + '</td>';
							content += '</tr>';
									
							content += '<tr style="height: 25px;">';
							content += '<td rowspan="2" style="padding-left: 10px;">' + tileIconHtml + '</td>';
							//content += '<td align="right" style="padding-right: 10px; font-size: 12pt;">' + nlapiEscapeXML(tileDescriptionHtml) + '</td>';
							content += tileDescriptionHtml;
							content += '</tr>';
									
							content += '<tr style="height: 25px;">';
							content += '<td align="right" style="padding-right: 10px;">&nbsp</td>';
							content += '</tr>';
									
							content += '</table> ';
									
							content += '</td>';	
							
							//Every fourth tile, we need to start a new row
							//
							if(tileCount%4 == 0)
								{
									content += '</tr>';
									content += '<tr style="height: 100px;">';
								}
						}
				}
			
			content += '</tr>';
			content += '</table>';
		}
	
	htmlField.setDefaultValue(content);
    //portletObj.setHtml(content);
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

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
						resultlen = moreSearchResultSet.length;
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
					}
				
				
		}
	
	return searchResultSet;
}

