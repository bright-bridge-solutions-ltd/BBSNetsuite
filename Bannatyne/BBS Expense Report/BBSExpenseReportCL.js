/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Feb 2020     sambatten
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
		// check if the quantity field on the expense sublist has been changed
		if (type == 'expense' && name == 'quantity')
			{
				// get the value of the quantity field for the current expense line
				var quantity = nlapiGetCurrentLineItemValue('expense', 'quantity');
				
				// set the 'BBS Expense Line Quantity' field on the current expense line
				nlapiSetCurrentLineItemValue('expense', 'custcol_bbs_exp_line_quantity', quantity);
			}
	}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name)
	{	
		// check that the field is the category field on the expense sublist
		if (type == 'expense' && name == 'category')
			{
				// disable the rate field
				nlapiDisableLineItemField('expense', 'rate', true);
			}
	}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type)
	{
		// check that we are working with the expense sublist
		if (type == 'expense')
			{
				// get fields from the current line
				var lineCategory = nlapiGetCurrentLineItemValue(type, 'category');
				var lineQuantity = nlapiGetCurrentLineItemValue(type, 'quantity');
				var lineCurrency = nlapiGetCurrentLineItemValue(type, 'currency');
				
				// set memo field on the current line
				//nlapiSetCurrentLineItemValue(type, 'memo', 'testing... testing... 1... 2... 3', true, true);
				
				// commit the line
				//nlapiCommitLineItem(type);
				
				// select a new line
				nlapiSelectNewLineItem(type);
				
				// set fields on the new line
				nlapiSetCurrentLineItemValue(type, 'category', lineCategory);
				nlapiSetCurrentLineItemValue(type, 'quantity', lineQuantity);
				nlapiSetCurrentLineItemValue(type, 'currency', lineCurrency);
				nlapiSetCurrentLineItemValue(type, 'amount', (0.45 * lineQuantity));
				
				// submit the new line
				nlapiCommitLineItem(type);
				
				// submit the new line
				nlapiCommitLineItem(type);
			}
	}
