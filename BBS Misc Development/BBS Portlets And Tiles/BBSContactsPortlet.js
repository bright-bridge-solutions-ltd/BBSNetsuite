/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Nov 2019     cedricgriffiths
 *
 */
var CUSTOM_SCRIPT = 'customscript_bbs_contact_portlet_sl';
var CUSTOM_DEPLOY = 'customdeploy_bbs_contact_portlet_sl';
	
/**
 * @param {nlobjPortlet} portletObj Current portlet object
 * @param {Number} column Column position index: 1 = left, 2 = middle, 3 = right
 * @returns {Void}
 */
function portletName(portletObj, column) 
{
	//resize based on available column space
	var height = 250; //column != 2 ? 225 : 350;
	
	//portletObj.setScript('customscript_bbs_tile_portlet_client');
	
	//Get the entity id
	//
	var entityId = arguments[2];
	
	//Get the config id from the params
	//
	var context = nlapiGetContext();
	//var configId = context.getSetting('SCRIPT', 'custscript_bbs_portlet_config_id');
	
	//Set the portlet title
	//
	portletObj.setTitle('BBS Contact Portlet');
	
	//Add a field to select the contact from
	//
	var contactField = portletObj.addField('custpage_select_contact', 'select', 'Contact', null);
	contactField.setLayoutType('normal', 'startcol');

	//Load up the custom saved search
	//
	var searchId = 67;
	var recordSearch = nlapiLoadSearch(null, searchId);
	var recordColumns = recordSearch.getColumns();
	
	var content = '';
	content += '<style type="text/css">';
	content += 'html {';
	content += '  /*width: 100%;*/ /*required if using % width*/';
	content += '  /*height: 100%;*/ /*required if using % height*/';
	content += '}';
	content += 'body {';
	content += '  /*width: 100%;*/ /*required if using % width*/';
	content += '  /*height: 100%;*/ /*required if using % height*/';
	content += '  /*margin: 0;*/ /*required if using % width or height*/';
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
	content += '  /*min-width: 100%;*/ /*set table width here if using %*/';
	content += '  height: 188px; /*set table height here; can be fixed value or %*/';
	content += '  /*min-height: 104px;*/ /*if using % height, make this at least large enough to fit scrollbar arrows + captions + thead*/';
	content += '  font-family: Verdana, Tahoma, sans-serif;';
	content += '  font-size: 15px;';
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
	content += '  overflow: scroll; /*set to auto if using fixed or % width; else scroll*/';
	content += '  overflow-x: hidden;';
	content += '  border: 1px solid black; /*border around table body*/';
	content += '}';
	content += '.scrollingtable > div > div:after {background: white;} /*match page background color*/';
	content += '.scrollingtable > div > div > table {';
	content += '  width: 100%;';
	content += '  border-spacing: 0;';
	content += '  margin-top: -20px; /*inverse of column header height*/';
	content += '  /*margin-right: 17px;*/ /*uncomment if using % width*/';
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

	/*
	content += '#table-wrapper {position:relative;}';
	content += '#table-scroll {height:70px; overflow:auto;  margin-top:20px;}';
	content += '#table-wrapper table {width:100%;}';
	content += '#table-wrapper table * {color:black;}';
	content += '#table-wrapper table thead th .text {position:absolute; top:-20px; z-index:2; height:20px;}';
	*/
	content += '</style>';
	
	/*
	content += '<div id="table-wrapper">';
	content += '<div id="table-scroll">';
	content += '<table style="width: 100%; margin-top: 10px;">';
	content += '<thead>';
	*/
	content += '<div class="scrollingtable">';
	content += '<div>';
	content += '	<div>';
	content += '		<table>';
	content += '			<caption>Top Caption</caption>';
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
			
			//content += '<th align="center" style="font-size: 7pt; background-color: #e6e6e6; "><span class="text" style="font-size: 7pt; background-color: #e6e6e6; ">' +  nlapiEscapeXML(columnLabel) + '</span></th>';
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
			for (var int2 = 0; int2 < recordSearchResults.length; int2++) 
				{
					content += '<tr>';
				
					//Loop through the columns
					//
					for (var int3 = 0; int3 < recordColumns.length; int3++) 
						{
							var rowColumnData = '';
							
							//See if the column has a text equivalent
							//
							rowColumnData = recordSearchResults[int2].getText(recordColumns[int3]);
							
							//If no text is returned, i.e. the column is not a lookup or list
							//
							if(rowColumnData == null)
								{
									rowColumnData = recordSearchResults[int2].getValue(recordColumns[int3]);
								}

							//Assign the value to the column
							//
							content += '<td>' + nlapiEscapeXML(rowColumnData) + '</td>';
						}
					
					content += '</tr>';
				}
		}
	
	content += '</tbody>';
	content += '</table>';
	content += '</div>';
	content += '</div>';
	content += '</div>';
	
	
	/*
	var suiteletUrl = nlapiResolveURL('SUITELET', CUSTOM_SCRIPT, CUSTOM_DEPLOY);
	suiteletUrl += '&searchid=67';
	var content = '';
	content += '<table style="width: 100%;">';
	content += '<tr>';
	content += '<td><iframe src="' + suiteletUrl + '" width="100%" align="center"  height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe></td>';
	content += '<td><iframe src="' + suiteletUrl + '" width="100%" align="center"  height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe></td>';
	content += '</tr>';
	content += '<tr>';
	content += '<td><iframe src="' + suiteletUrl + '" width="100%" align="center"  height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe></td>';
	content += '<td><iframe src="' + suiteletUrl + '" width="100%" align="center"  height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe></td>';
	content += '</tr>';
	content += '</table>';
	
	content = '<iframe src="' + suiteletUrl + '" width="100%" align="center" style="border: 2px solid red;" scrolling="yes" height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe>';
		*/
	
	var htmlField1 = portletObj.addField('custpage_hidden_1', 'inlinehtml', '', null);
	htmlField1.setDefaultValue(content);
	htmlField1.setLayoutType('outsidebelow', 'none');

	
	var htmlField2 = portletObj.addField('custpage_hidden_2', 'inlinehtml', '', null);
	htmlField2.setDefaultValue(content);
	htmlField2.setLayoutType('outsidebelow', 'none');

}

	//=====================================================================
	//Functions
	//=====================================================================
	//

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
