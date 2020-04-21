/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Apr 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function segmentPageInit(type)
{
	//Valid for create or edit mode only
	//
	if(type == 'create' || type == 'edit')
		{
			//Get the current subsidiary
			//
	   		var currentSubsidiary = nlapiGetFieldValue('subsidiary');
	   		
	   		if(currentSubsidiary != '17')
	   			{
	   				nlapiDisableLineItemField('expense', 'cseg1', true);
	   			}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function segmentFieldChanged(type, name, linenum)
{
	if((type == null || type == '') && name == 'subsidiary')
		{
			//Get the current subsidiary
			//
	   		var currentSubsidiary = nlapiGetFieldValue('subsidiary');
	   		
	   		if(currentSubsidiary != '17')
	   			{
	   				nlapiDisableLineItemField('expense', 'cseg1', true);
	   			}
	   		else
	   			{
	   				nlapiDisableLineItemField('expense', 'cseg1', false);
	   			}
		}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function segmentValidateLine(type)
{
	var returnValue = true;
	
	//Get the current subsidiary
	//
	var currentSubsidiary = nlapiGetFieldValue('subsidiary');
	
	if(type == 'expense' && currentSubsidiary == '17')
		{
			var currentSegmentValue = nlapiGetCurrentLineItemValue(type, 'cseg1');
			
			if(currentSegmentValue == null || currentSegmentValue == '')
				{
					returnValue = false;
					Ext.Msg.alert('⛔️️ Line Validateion Error', 'The column "Show" is mandatory for this subsidiary', Ext.emptyFn);
				}
		}
	
    return returnValue;
}
