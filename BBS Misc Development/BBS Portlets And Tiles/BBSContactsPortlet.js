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
	
	content = '<iframe src="' + suiteletUrl + '" width="100%" align="center" scrolling="no" height="' + (height + 4) + 'px" style="margin:0px; border:0px; padding:0px"></iframe>';
	
	var htmlField1 = portletObj.addField('custpage_hidden_1', 'inlinehtml', '', null);
	htmlField1.setDefaultValue(content);
	htmlField1.setLayoutType('outsidebelow', 'none');

	var htmlField2 = portletObj.addField('custpage_hidden_2', 'inlinehtml', '', null);
	htmlField2.setDefaultValue(content);
	htmlField2.setLayoutType('outsidebelow', 'none');

}

