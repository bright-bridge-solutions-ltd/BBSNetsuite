/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jul 2019     sambatten
 *
 */

function pageInit(type)
	{
	   	// disable the department (cost centre) and category line item fields
		nlapiDisableLineItemField('expense', 'department', true);
		nlapiDisableLineItemField('expense', 'category', true);
	}

function fieldChanged(type, name)
	{
		// determine if the expense department field has been changed
		if (type == 'expense' && name == 'custcol_bbs_expense_department')
			{
				// get the value of the expense department field for the current line
				var expDept = nlapiGetCurrentLineItemValue('expense', 'custcol_bbs_expense_department');
				
				// use the expDept variable to set the value of the department (cost centre) field for the current line
				nlapiSetCurrentLineItemValue('expense', 'department', expDept);
			}
		
		// determine if the expense category field has been changed
		if (type == 'expense' && name == 'custcol_bbs_expense_category')
			{
				// get the value of the expense category field for the current line
				var expCat = nlapiGetCurrentLineItemValue('expense', 'custcol_bbs_expense_category');
				
				// use the expCat variable to set the value of the category field for the current line
				nlapiSetCurrentLineItemValue('expense', 'category', expCat);
				
				// get the value of the expense department field for the current line
				var expDept = nlapiGetCurrentLineItemValue('expense', 'custcol_bbs_expense_department');
				
				// use the expDept variable to set the value of the department (cost centre) field for the current line
				nlapiSetCurrentLineItemValue('expense', 'department', expDept);
			}
	}