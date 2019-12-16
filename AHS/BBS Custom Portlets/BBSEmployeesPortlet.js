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

	portletObj.setScript('customscript_bbs_emp_portlet_client');
	
	//Get the entity id
	//
	var entityId = arguments[2];
	
	//Get the params
	//
	var context = nlapiGetContext();
	var search1 = context.getSetting('SCRIPT', 'custscript_bbs_emp_search_1');
	var search2 = context.getSetting('SCRIPT', 'custscript_bbs_emp_search_2');
	var search3 = context.getSetting('SCRIPT', 'custscript_bbs_emp_search_3');
	var search4 = context.getSetting('SCRIPT', 'custscript_bbs_emp_search_4');
	
	var caption1 = context.getSetting('SCRIPT', 'custscript_bbs_emp_caption_1');
	var caption2 = context.getSetting('SCRIPT', 'custscript_bbs_emp_caption_2');
	var caption3 = context.getSetting('SCRIPT', 'custscript_bbs_emp_caption_3');
	var caption4 = context.getSetting('SCRIPT', 'custscript_bbs_emp_caption_4');
	
	var filter1 = context.getSetting('SCRIPT', 'custscript_bbs_emp_filter_1');
	var filter2 = context.getSetting('SCRIPT', 'custscript_bbs_emp_filter_2');
	var filter3 = context.getSetting('SCRIPT', 'custscript_bbs_emp_filter_3');
	var filter4 = context.getSetting('SCRIPT', 'custscript_bbs_emp_filter_4');
	
	var portletCaption = context.getSetting('SCRIPT', 'custscript_bbs_emp_caption');
	portletCaption = (portletCaption == null ? '' : portletCaption);
	
	var fontSize = context.getSetting('SCRIPT', 'custscript_bbs_emp_font_size');
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
	
	//Add a field to select the employee from
	//
	var employeeField = portletObj.addField('custpage_select_employee', 'select', 'Employee', null);
	employeeField.setLayoutType('normal', 'startcol');
	
	employeeField.addSelectOption(0, '', true);
	
	var employeeSearch = nlapiSearchRecord("employee",null,
			[
			   ["salesrep","is","T"]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false)
			]
			);
	
	if(employeeSearch != null && employeeSearch.length > 0)
		{
			for (var int = 0; int < employeeSearch.length; int++) 
				{
					var empId = employeeSearch[int].getId();
					var empName = employeeSearch[int].getValue('entityid');
					
					employeeField.addSelectOption(empId, empName, false);
				}
		}
	
	//Add a dummy field to hold the parameters
	//
	var entityField = portletObj.addField('custpage_params', 'longtext', 'Entity', null);
	entityField.setDisplayType('hidden');
	entityField.setDefaultValue(JSON.stringify(params));

	//Initialise the search results fields
	//
	defaultHtml = '<table style="height: 200px;"><tr><td>&nbsp;</td></tr></table>';
	
	if(params.search1 != null && params.search1 != '')
		{
			var htmlField1 = portletObj.addField('custpage_results_1', 'inlinehtml', '', null);
			htmlField1.setDefaultValue(defaultHtml);
		}

	if(params.search2 != null && params.search2 != '')
		{
			var htmlField2 = portletObj.addField('custpage_results_2', 'inlinehtml', '', null);
			htmlField2.setDefaultValue(defaultHtml);
		}
	
	if(params.search3 != null && params.search3 != '')
		{
			var htmlField3 = portletObj.addField('custpage_results_3', 'inlinehtml', '', null);
			htmlField3.setDefaultValue(defaultHtml);
		}
	
	if(params.search4 != null && params.search4 != '')
		{
			var htmlField4 = portletObj.addField('custpage_results_4', 'inlinehtml', '', null);
			htmlField4.setDefaultValue(defaultHtml);
		}
}

