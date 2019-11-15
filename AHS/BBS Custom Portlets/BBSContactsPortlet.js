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
	//var height = 250; //column != 2 ? 225 : 350;
	
	portletObj.setScript('customscript_bbs_cont_portlet_client');
	
	//Get the entity id
	//
	var entityId = arguments[2];
	
	//Get the params
	//
	var context = nlapiGetContext();
	var search1 = context.getSetting('SCRIPT', 'custscript_bbs_cont_search_1');
	var search2 = context.getSetting('SCRIPT', 'custscript_bbs_cont_search_2');
	var search3 = context.getSetting('SCRIPT', 'custscript_bbs_cont_search_3');
	var search4 = context.getSetting('SCRIPT', 'custscript_bbs_cont_search_4');
	
	var caption1 = context.getSetting('SCRIPT', 'custscript_bbs_cont_caption_1');
	var caption2 = context.getSetting('SCRIPT', 'custscript_bbs_cont_caption_2');
	var caption3 = context.getSetting('SCRIPT', 'custscript_bbs_cont_caption_3');
	var caption4 = context.getSetting('SCRIPT', 'custscript_bbs_cont_caption_4');
	
	var filter1 = context.getSetting('SCRIPT', 'custscript_bbs_cont_filter_1');
	var filter2 = context.getSetting('SCRIPT', 'custscript_bbs_cont_filter_2');
	var filter3 = context.getSetting('SCRIPT', 'custscript_bbs_cont_filter_3');
	var filter4 = context.getSetting('SCRIPT', 'custscript_bbs_cont_filter_4');
	
	var portletCaption = context.getSetting('SCRIPT', 'custscript_bbs_cont_caption');
	portletCaption = (portletCaption == null ? '' : portletCaption);
	
	var fontSize = context.getSetting('SCRIPT', 'custscript_bbs_cont_font_size');
	fontSize = (fontSize == null ? '14' : fontSize);
	
	var params 		= {};
	params.search1 	= search1;
	params.search2 	= search2;
	params.search3 	= search3;
	params.search4 	= search4;
	params.caption1 = caption1;
	params.caption2 = caption2;
	params.caption3 = caption3;
	params.caption4 = caption4;
	params.filter1 	= filter1;
	params.filter2 	= filter2;
	params.filter3 	= filter3;
	params.filter4 	= filter4;
	params.entityId = entityId;
	params.fontSize = fontSize;
	
	//Set the portlet title
	//
	portletObj.setTitle(portletCaption);
	
	//Add a field to select the contact from
	//
	var contactField = portletObj.addField('custpage_select_contact', 'select', 'Contact', null);
	contactField.setLayoutType('normal', 'startcol');

	contactField.addSelectOption('', '', true);
	
	//Find contacts
	//
	var contactSearch = nlapiSearchRecord("contact",null,
			[
			   ["company","anyof",entityId]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false)
			]
			);
	
	if(contactSearch != null && contactSearch.length > 0)
		{
			for (var int = 0; int < contactSearch.length; int++) 
				{
					var contactId = contactSearch[int].getId();
					var contactName = contactSearch[int].getValue("entityid");
					contactField.addSelectOption(contactId, contactName, false);
				}
		}
	
	//Add a dummy field to hold the parameters
	//
	var entityField = portletObj.addField('custpage_params', 'text', 'Entity', null);
	entityField.setDisplayType('hidden');
	entityField.setDefaultValue(JSON.stringify(params));

	//Initialise the search results fields
	//
	defaultHtml = '<table style="height: 200px;"><tr><td>&nbsp;</td></tr></table>';
	
	if(params.search1 != null && params.search1 != '')
		{
			var htmlField1 = portletObj.addField('custpage_results_1', 'inlinehtml', '', null);
			htmlField1.setDefaultValue(defaultHtml);
//			htmlField1.setLayoutType('outsidebelow', 'none');
		}

	if(params.search2 != null && params.search2 != '')
		{
			var htmlField2 = portletObj.addField('custpage_results_2', 'inlinehtml', '', null);
			htmlField2.setDefaultValue(defaultHtml);
//			htmlField2.setLayoutType('outsidebelow', 'none');
		}
	
//	if(params.search3 != null && params.search3 != '')
//		{
//			var htmlField3 = portletObj.addField('custpage_results_3', 'inlinehtml', '', null);
//			htmlField3.setDefaultValue(defaultHtml);
//			htmlField3.setLayoutType('outsidebelow', 'none');
//		}
	
//	if(params.search4 != null && params.search4 != '')
//		{
//			var htmlField4 = portletObj.addField('custpage_results_4', 'inlinehtml', '', null);
//			htmlField4.setDefaultValue(defaultHtml);
//			htmlField4.setLayoutType('outsidebelow', 'none');
//		}
}

