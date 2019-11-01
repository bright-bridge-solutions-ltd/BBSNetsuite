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
    
	//Get the entity id
	//
	var entityId = arguments[2];
	
	//Get the config id from the params
	//
	var context = nlapiGetContext();
	var configId = context.getSetting('SCRIPT', 'custscript_bbs_portlet_config_id');
	
	//Set the portlet title
	//
	portletObj.setTitle('BBS Tiles (Entity Id = ' + entityId + ')' );
	
	
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
			   new nlobjSearchColumn("custrecord_bbs_tile_text_colour")
			]
			);
	
	if(customrecord_bbs_tile_recordSearch != null && customrecord_bbs_tile_recordSearch.length > 0)
		{
			//Loop through the results
			//
			content = '<table>';
			
			for (var int = 0; int < customrecord_bbs_tile_recordSearch.length; int++) 
				{
					var savedSearch = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_saved_search");
					var tileColour = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_colour");
					var textColour = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_text_colour");
					var tileIcon = customrecord_bbs_tile_recordSearch[int].getValue("custrecord_bbs_tile_icon");
					
					//Load the saved search
					//
					
					//Add filter based on entity
					//
					
					//Run the saved search & get value
					//
					
					//Build the html
					//
					
				}
			
			content += '</table>';
		}
	
	content += '<tr style="height: 100px;"><td  style="width: 300px; background-color: #ff0000; color: #ffffff;">This is some data</td><td style="width: 300px; background-color: #33cc33; color: #ffffff;">This is other data</td></tr>';
    content += '<tr style="height: 100px;"><td  style="width: 300px; background-color: #ffff00; color: #ffffff;">This is some data</td><td style="width: 300px; background-color: #0066ff; color: #ffffff;">This is other data</td></tr>';
    
    portletObj.setHtml(content);
    
}
