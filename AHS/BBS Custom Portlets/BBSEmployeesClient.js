/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Nov 2019     cedricgriffiths
 *
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum)
	{
		//=============================================================================================
		//Prototypes
		//=============================================================================================
		//
		
		//Date & time formatting prototype 
		//
		(function() {
	
			Date.shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
			Date.longMonths = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
			Date.shortDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
			Date.longDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
	
			// defining patterns
			var replaceChars = {
			// Day
			d : function() {
				return (this.getDate() < 10 ? '0' : '') + this.getDate();
			},
			D : function() {
				return Date.shortDays[this.getDay()];
			},
			j : function() {
				return this.getDate();
			},
			l : function() {
				return Date.longDays[this.getDay()];
			},
			N : function() {
				return (this.getDay() == 0 ? 7 : this.getDay());
			},
			S : function() {
				return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
			},
			w : function() {
				return this.getDay();
			},
			z : function() {
				var d = new Date(this.getFullYear(), 0, 1);
				return Math.ceil((this - d) / 86400000);
			}, // Fixed now
			// Week
			W : function() {
				var target = new Date(this.valueOf());
				var dayNr = (this.getDay() + 6) % 7;
				target.setDate(target.getDate() - dayNr + 3);
				var firstThursday = target.valueOf();
				target.setMonth(0, 1);
				if (target.getDay() !== 4) {
					target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
				}
				var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);
	
				return (retVal < 10 ? '0' + retVal : retVal);
			},
			// Month
			F : function() {
				return Date.longMonths[this.getMonth()];
			},
			m : function() {
				return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
			},
			M : function() {
				return Date.shortMonths[this.getMonth()];
			},
			n : function() {
				return this.getMonth() + 1;
			},
			t : function() {
				var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
				if (nextMonth === 12) {
					year = year++;
					nextMonth = 0;
				}
				return new Date(year, nextMonth, 0).getDate();
			},
			// Year
			L : function() {
				var year = this.getFullYear();
				return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
			}, // Fixed now
			o : function() {
				var d = new Date(this.valueOf());
				d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
				return d.getFullYear();
			}, //Fixed now
			Y : function() {
				return this.getFullYear();
			},
			y : function() {
				return ('' + this.getFullYear()).substr(2);
			},
			// Time
			a : function() {
				return this.getHours() < 12 ? 'am' : 'pm';
			},
			A : function() {
				return this.getHours() < 12 ? 'AM' : 'PM';
			},
			B : function() {
				return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
			}, // Fixed now
			g : function() {
				return this.getHours() % 12 || 12;
			},
			G : function() {
				return this.getHours();
			},
			h : function() {
				return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
			},
			H : function() {
				return (this.getHours() < 10 ? '0' : '') + this.getHours();
			},
			i : function() {
				return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
			},
			s : function() {
				return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
			},
			u : function() {
				var m = this.getMilliseconds();
				return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
			},
			// Timezone
			e : function() {
				return /\((.*)\)/.exec(new Date().toString())[1];
			},
			I : function() {
				var DST = null;
				for (var i = 0; i < 12; ++i) {
					var d = new Date(this.getFullYear(), i, 1);
					var offset = d.getTimezoneOffset();
	
					if (DST === null)
						DST = offset;
					else
						if (offset < DST) {
							DST = offset;
							break;
						}
						else
							if (offset > DST)
								break;
				}
				return (this.getTimezoneOffset() == DST) | 0;
			},
			O : function() {
				return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
						.abs(this.getTimezoneOffset() % 60)));
			},
			P : function() {
				return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
						.abs(this.getTimezoneOffset() % 60)));
			}, // Fixed now
			T : function() {
				return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
			},
			Z : function() {
				return -this.getTimezoneOffset() * 60;
			},
			// Full Date/Time
			c : function() {
				return this.format("Y-m-d\\TH:i:sP");
			}, // Fixed now
			r : function() {
				return this.toString();
			},
			U : function() {
				return this.getTime() / 1000;
			}
			};
	
			// Simulates PHP's date function
			Date.prototype.format = function(format) {
				var date = this;
				return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
					return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
				});
			};
	
		}).call(this);
		
	
		//Number formatting prototype
		//
		Number.formatFunctions={count:0};
		Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};
		
		if(name == 'custpage_select_employee')
			{
				//Get the portlet parameters
				//
				var params = JSON.parse(nlapiGetFieldValue('custpage_params'));
				var entityId = params.entityId;
				
				//Get the selected contact
				//
				var employeeId = nlapiGetFieldValue('custpage_select_employee');
				
				if(employeeId != null && employeeId != '')
					{
						var leftCell1 	= '';
						var rightCell1 	= '';
						var leftCell2 	= '';
						var rightCell2 	= '';
						
						if(params.search1 != null && params.search1 != '')
							leftCell1  = buildContent(params.search1, params.caption1, employeeId, params.filter1, params.fontSize);
						
						if(params.search2 != null && params.search2 != '')
							rightCell1 = buildContent(params.search2, params.caption2, employeeId, params.filter2, params.fontSize);
						
						if(params.search3 != null && params.search3 != '')
							leftCell2  = buildContent(params.search3, params.caption3, employeeId, params.filter3, params.fontSize);
						
						if(params.search4 != null && params.search4 != '')
							rightCell2 = buildContent(params.search4, params.caption4, employeeId, params.filter4, params.fontSize);
											
						nlapiSetFieldValue('custpage_results_1', '<table style="width: 100%;"><tr><td>' + leftCell1 + '</td><td style="width: 10px;">&nbsp;</td><td>' + rightCell1 + '</td></tr></table>', false, true);
						nlapiSetFieldValue('custpage_results_2', '<table style="width: 100%;"><tr><td>' + leftCell2 + '</td><td style="width: 10px;">&nbsp;</td><td>' + rightCell2 + '</td></tr></table>', false, true);
						
					}
				else
					{
						if(params.search1 != null && params.search1 != '')
							nlapiSetFieldValue('custpage_results_1', '', false, true);
						
						if(params.search2 != null && params.search2 != '')
							nlapiSetFieldValue('custpage_results_2', '', false, true);
					}
			}
	}

//=====================================================================
//Functions
//=====================================================================
//
function buildContent(searchId, caption, contactId, filter, fontSize)
	{
		caption = (caption == null ? '' : caption);
		fontSize = (fontSize == null || fontSize == '' ? '14' : fontSize);
		
		//Load up the custom saved search
		//
		var recordSearch = nlapiLoadSearch(null, searchId);
		var recordColumns = recordSearch.getColumns();
		
		//Add filter on contact
		//
		if(filter != null && filter != '')
			{
				var filters = filter.split('.');
				var filterColumn = (filters[0] === undefined ? '' : filters[0]);
				var filterJoin = (filters[1] === undefined ? null : filters[1]);
				
				recordSearch.addFilter(new nlobjSearchFilter(filterColumn, filterJoin, 'anyof', contactId, null));
			}
		
		
		var content = '';
		content += '<style type="text/css">';
		content += 'html {';
		content += '  width: 100%;  /*required if using % width*/';
		content += '  /*height: 100%;*/ /*required if using % height*/';
		content += '}';
		content += 'body {';
		content += '  width: 100%; /*required if using % width*/';
		content += '  /*height: 100%;*/ /*required if using % height*/';
		content += '  margin: 0; /*required if using % width or height*/';
		content += '  /*padding: 0 20px 0 20px;*/ /*purely aesthetic, not required*/';
		content += '  /*box-sizing: border-box;*/ /*required if using above declaration*/';
		content += '  background: white;';
		//content += '  text-align: center; /*delete if using % width, or you dont want table centered*/';
		content += '}';
		content += '.scrollingtable {';
		content += '  box-sizing: border-box;';
		content += '  display: inline-block;';
		content += '  vertical-align: middle;';
		content += '  overflow: hidden;';
		content += '  width: auto; /*set table width here if using fixed value*/';
		content += '  min-width: 100%; /*set table width here if using %*/';
		content += '  height: 188px; /*set table height here; can be fixed value or %*/';
		content += '  /*min-height: 104px;*/ /*if using % height, make this at least large enough to fit scrollbar arrows + captions + thead*/';
		content += '  font-family: Verdana, Tahoma, sans-serif;';
		content += '  font-size: ' + fontSize + 'px;';
		content += '  line-height: 20px;';
		content += '  padding-top: 20px; /*this determines top caption height*/';
		content += '  padding-bottom: 20px; /*this determines bottom caption height*/';
		content += '  text-align: left;';
		content += '}';
		content += '.scrollingtable * {box-sizing: border-box;}';
		content += '.scrollingtable > div {';
		content += '  position: relative;';
		content += '  border-top: 1px solid black; /*top table border*/';
		content += '  height: 100%;';
		content += '  padding-top: 20px; /*this determines column header height*/';
		content += '}';
		content += '.scrollingtable > div:before {';
		content += '  top: 0;';
		content += '  background: cornflowerblue; /*column header background color*/';
		content += '}';
		content += '.scrollingtable > div:before,';
		content += '.scrollingtable > div > div:after {';
		content += '  content: "";';
		content += '  position: absolute;';
		content += '  z-index: -1;';
		content += '  width: 100%;';
		content += '  height: 50%;';
		content += '  left: 0;';
		content += '}';
		content += '.scrollingtable > div > div {';
		content += '  /*min-height: 43px;*/ /*if using % height, make this at least large enough to fit scrollbar arrows*/';
		content += '  max-height: 100%;';
		content += '  overflow: auto; /*set to auto if using fixed or % width; else scroll*/';
		content += '  overflow-x: hidden;';
		content += '  border: 1px solid black; /*border around table body*/';
		content += '}';
		content += '.scrollingtable > div > div:after {background: white;} /*match page background color*/';
		content += '.scrollingtable > div > div > table {';
		content += '  width: 100%;';
		content += '  border-spacing: 0;';
		content += '  margin-top: -20px; /*inverse of column header height*/';
		content += '  margin-right: 17px; /*uncomment if using % width*/';
		content += '}';
		content += '.scrollingtable > div > div > table > caption {';
		content += '  position: absolute;';
		content += '  top: -20px; /*inverse of caption height*/';
		content += '  margin-top: -1px; /*inverse of border-width*/';
		content += '  width: 100%;';
		content += '  font-weight: bold;';
		content += '  text-align: center;';
		content += '}';
		content += '.scrollingtable > div > div > table > * > tr > * {padding: 0;}';
		content += '.scrollingtable > div > div > table > thead {';
		content += '  vertical-align: bottom;';
		content += '  white-space: nowrap;';
		content += '  text-align: center;';
		content += '}';
		content += '.scrollingtable > div > div > table > thead > tr > * > div {';
		content += '  display: inline-block;';
		content += '  padding: 0 6px 0 6px; /*header cell padding*/';
		content += '}';
		content += '.scrollingtable > div > div > table > thead > tr > :first-child:before {';
		content += '  content: "";';
		content += '  position: absolute;';
		content += '  top: 0;';
		content += '  left: 0;';
		content += '  height: 20px; /*match column header height*/';
		content += '  border-left: 1px solid black; /*leftmost header border*/';
		content += '}';
		content += '.scrollingtable > div > div > table > thead > tr > * > div[label]:before,';
		content += '.scrollingtable > div > div > table > thead > tr > * > div > div:first-child,';
		content += '.scrollingtable > div > div > table > thead > tr > * + :before {';
		content += '  position: absolute;';
		content += '  top: 0;';
		content += '  white-space: pre-wrap;';
		content += '  color: white; /*header row font color*/';
		content += '}';
		content += '.scrollingtable > div > div > table > thead > tr > * > div[label]:before,';
		content += '.scrollingtable > div > div > table > thead > tr > * > div[label]:after {content: attr(label);}';
		content += '.scrollingtable > div > div > table > thead > tr > * + :before {';
		content += '  content: "";';
		content += '  display: block;';
		content += '  min-height: 20px; /*match column header height*/';
		content += '  padding-top: 1px;';
		content += '  border-left: 1px solid black; /*borders between header cells*/';
		content += '}';
		content += '.scrollingtable .scrollbarhead {float: right;}';
		content += '.scrollingtable .scrollbarhead:before {';
		content += '  position: absolute;';
		content += '  width: 100px;';
		content += '  top: -1px; /*inverse border-width*/';
		content += '  background: white; /*match page background color*/';
		content += '}';
		content += '.scrollingtable > div > div > table > tbody > tr:after {';
		content += '  content: "";';
		content += '  display: table-cell;';
		content += '  position: relative;';
		content += '  padding: 0;';
		content += '  border-top: 1px solid black;';
		content += '  top: -1px; /*inverse of border width*/';
		content += '}';
		content += '.scrollingtable > div > div > table > tbody {vertical-align: top;}';
		content += '.scrollingtable > div > div > table > tbody > tr {background: white;}';
		content += '.scrollingtable > div > div > table > tbody > tr > * {';
		content += '  border-bottom: 1px solid black;';
		content += '  padding: 0 6px 0 6px;';
		content += '  height: 20px; /*match column header height*/';
		content += '}';
		content += '.scrollingtable > div > div > table > tbody:last-of-type > tr:last-child > * {border-bottom: none;}';
		content += '.scrollingtable > div > div > table > tbody > tr:nth-child(even) {background: gainsboro;} /*alternate row color*/';
		content += '.scrollingtable > div > div > table > tbody > tr > * + * {border-left: 1px solid black;} /*borders between body cells*/';
		content += '</style>';

		content += '<div class="scrollingtable">';
		content += '<div>';
		content += '	<div>';
		content += '		<table>';
		content += '			<caption>' + caption + '</caption>';
		content += '			<thead>';
							
		for(var int = 0; int < recordColumns.length; int++)
			{
				var columnLabel = recordColumns[int].getLabel();
				var columnType = recordColumns[int]['type'];
				var columnSearchType = recordColumns[int]['searchtype'];
				var columnName = recordColumns[int]['name'];
				
				content += '<th>';
				content += '<div><div>' +  nlapiEscapeXML(columnLabel) + '</div><div>' +  nlapiEscapeXML(columnLabel) + '</div></div>';
				content += '</th>';			
			}
		
		content += '<th class="scrollbarhead"></th>';
		content += '</tr>';
		content += '</thead>';
		content += '<tbody>';
		
		//Get the search results
		//
		var recordSearchResults = getResults(recordSearch);
		
		//Do we have any results to process
		//
		if(recordSearchResults != null && recordSearchResults.length > 0)
			{
				//Loop through the results
				//
				for (var int2 = 0; int2 < Math.max(recordSearchResults.length,6) ; int2++) 
					{
						content += '<tr>';
					
						//Loop through the columns
						//
						for (var int3 = 0; int3 < recordColumns.length; int3++) 
							{
								var rowColumnData = '-';
								
								//See if the column has a text equivalent
								//
								try
									{
										rowColumnData = recordSearchResults[int2].getText(recordColumns[int3]);
									}
								catch(err)
									{
									
									}
								
								//If no text is returned, i.e. the column is not a lookup or list
								//
								if(rowColumnData == null)
									{
										try
											{
												rowColumnData = recordSearchResults[int2].getValue(recordColumns[int3]);
											}
										catch(err)
											{
											
											}
										
									}
	
								//Format based on column type
								//
								var alignment = 'left';
								
								switch (recordColumns[int3]['type'])
									{
										case 'float':
										case 'currency':
											
											try
												{
													rowColumnData = Number(rowColumnData).numberFormat('###,###.00');
													rowColumnData = (rowColumnData == 'NaN' ? '-' : rowColumnData);
												}
											catch(err)
												{
												
												}
											
											alignment = 'right';
											break;
										
										case 'integer':
											
											try
												{
													rowColumnData = Number(rowColumnData).numberFormat('###,###');
													rowColumnData = (rowColumnData == 'NaN' ? '-' : rowColumnData);
												}
											catch(err)
												{
												
												}
											
											alignment = 'right';
											break;
										
										case 'date':
											
											try
												{
													rowColumnData = nlapiStringToDate(rowColumnData).format('d/m/Y');
												}
											catch(err)
												{
												
												}
											
											alignment = 'right';
											break;
										
										default:
											break;
									}
								
								//Assign the value to the column
								//
								content += '<td align="' + alignment +'">' + nlapiEscapeXML(rowColumnData) + '</td>';
							}
						
						content += '</tr>';
					}
			}
		else
			{
				for (var int2 = 0; int2 < 6 ; int2++) 
					{
						content += '<tr>';
					
						//Loop through the columns
						//
						for (var int3 = 0; int3 < recordColumns.length; int3++) 
							{
								var rowColumnData = '-';
								
								//Assign the value to the column
								//
								content += '<td>' + rowColumnData + '</td>';
							}
						
						content += '</tr>';
					}		
			}
		
		content += '</tbody>';
		content += '</table>';
		content += '</div>';
		content += '</div>';
		content += '</div>';

		return content;
	}

function getResults(search)
	{
		var searchResult = search.runSearch();
		
		//Get the initial set of results
		//
		var start = 0;
		var end = 50;
		var searchResultSet = searchResult.getResults(start, end);
		
		var resultlen = (searchResultSet != null ? searchResultSet.length : 0);
	
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
