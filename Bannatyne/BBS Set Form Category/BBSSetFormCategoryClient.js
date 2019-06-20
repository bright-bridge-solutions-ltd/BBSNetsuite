/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jun 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function formCategoryPageInit(type)
{
   if(type == 'create' || type == 'edit')
	   {
	   		nlapiSetFieldValue('custbody_bbs_form_category', null, true, true);
	   		
	   		var formId = nlapiGetFieldValue('customform');
	   		
	   		if(formId == '140') //TBG Site (Capex)
	   			{
	   				nlapiSetFieldValue('custbody_bbs_form_category', '1', true, true);
	   			}
	   		
	   		if(formId == '130') //TBG Site (Non Capex)
	   			{
	   				nlapiSetFieldValue('custbody_bbs_form_category', '2', true, true);
	   			}
	   }
}
