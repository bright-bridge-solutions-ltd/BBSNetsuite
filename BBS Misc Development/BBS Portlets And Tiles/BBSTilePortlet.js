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
	var content = '';
	var tileCount = Number(0);
	
	portletObj.setScript('customscript_bbs_tile_portlet_client');
	
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

