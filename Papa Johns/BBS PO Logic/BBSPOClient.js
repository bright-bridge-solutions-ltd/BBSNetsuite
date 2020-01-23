/**
 * Module Description
 * 
 * Version    	Date            	Author          Remarks
 * 1.00       	20 Jan 2020     	sambatten		Initial Version
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function pageInit(type)
	{	
		// disable line item fields
		nlapiDisableLineItemField('item', 'department', true);
		nlapiDisableLineItemField('item', 'taxcode', true);
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
function fieldChanged(type, name, linenum)
	{
		// check if the 'custcol_bbs_expense_tax_code' field has been changed
		if (type == 'item' && name == 'custcol_bbs_expense_tax_code')
			{
				// get the value of the 'custcol_bbs_expense_tax_code' field for the current line
				var taxCode = nlapiGetCurrentLineItemValue('item', 'custcol_bbs_expense_tax_code');
				
				// set the 'taxcode' field on the current line using the taxCode variable
				nlapiSetCurrentLineItemValue('item', 'taxcode', taxCode);
			}
		// check if the 'custcol_bbs_po_cost_centre' field has been changed
		else if (type == 'item' && name == 'custcol_bbs_po_cost_centre')
			{
				// get the value of the 'custcol_bbs_po_cost_centre' field for the current line
				var costCentre = nlapiGetCurrentLineItemValue('item', 'custcol_bbs_po_cost_centre');
				
				// set the 'department' field on the current line using the costCentre variable
				nlapiSetCurrentLineItemValue('item', 'department', costCentre);
			}
	}
