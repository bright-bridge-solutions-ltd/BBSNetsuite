/**
 * Module Description
 * 
 * Version    	Date            Author			Remarks
 * 1.00       	24 Jul 2019     sambatten		Initial version
 * 1.10			09 Aug 2019		sambatten		Added lineInit and saveRecord functions and added additional actions to pageInit and fieldChanged functions
 * 1.20			22 Aug 2019		sambatten		Added action to disable grossamt line field instead of amount field
 */

function pageInit(type)
	{
		// disable line item fields
		nlapiDisableLineItemField('expense', 'department', true);
		nlapiDisableLineItemField('expense', 'category', true);
		nlapiDisableLineItemField('expense', 'taxcode', true);
		nlapiDisableLineItemField('expense', 'foreignamount', true);
		nlapiDisableLineItemField('expense', 'grossamt', true);
		
		// get the value of the custbody_bbs_exp_default_cost_centre field
		var defaultCostCentre = nlapiGetFieldValue('custbody_bbs_exp_default_cost_centre');
				
		// set the value of the custcol_bbs_expense_department field for the current line using the defaultCostCentre variable
		nlapiSetCurrentLineItemValue('expense', 'custcol_bbs_expense_department', defaultCostCentre, false, true); // type, fldnam, value, firefieldchanged, synchronous
				
		// set the value of the currency field to GBP (internal ID 1)
		nlapiSetFieldValue('expensereportcurrency', 1);
				
		// set the value of the currency field for the current line to GBP (internal ID 1)
		nlapiSetCurrentLineItemValue('expense', 'currency', 1, false, true); // type, fldnam, value, firefieldchanged, synchronous
	}

function lineInit(type)
	{
		// set the value of the currency field for the current line to GBP (internal ID 1)
		nlapiSetCurrentLineItemValue('expense', 'currency', 1, false, true); // type, fldnam, value, firefieldchanged, synchronous
		
		// disable line item fields
		nlapiDisableLineItemField('expense', 'foreignamount', true);
		nlapiDisableLineItemField('expense', 'grossamt', true);
		
		// get the value of the custbody_bbs_exp_default_cost_centre field
		var defaultCostCentre = nlapiGetFieldValue('custbody_bbs_exp_default_cost_centre');
		
		// set the value of the custcol_bbs_expense_department field for the current line using the defaultCostCentre variable
		nlapiSetCurrentLineItemValue('expense', 'custcol_bbs_expense_department', defaultCostCentre, false, true); // type, fldnam, value, firefieldchanged, synchronous
	}

function fieldChanged(type, name)
	{
		// determine if the expense department field has been changed
		if (type == 'expense' && name == 'custcol_bbs_expense_department')
			{
				// get the value of the currency field
				var currency = nlapiGetCurrentLineItemValue('expense', 'currency');
				
				// check if the currency variable returns GBP (internal ID 1)
				if (currency == 1)
					{
						// disable the foreignamount line item field
						nlapiDisableLineItemField('expense', 'foreignamount', true);
					}
				else // currency variable does NOT return GBP
					{
						// enable the foreignamount line item field
						nlapiDisableLineItemField('expense', 'foreignamount', false);
					}
				
				// disable the gross amount field
				nlapiDisableLineItemField('expense', 'grossamt', true);
			}
		
		// determine if the expense category field has been changed
		else if (type == 'expense' && name == 'custcol_bbs_expense_category')
			{
				// get the value of the expense category field for the current line
				var expCat = nlapiGetCurrentLineItemValue('expense', 'custcol_bbs_expense_category');
				
				// only proceed if expCat variable returns a value
				if (expCat)
					{
						// use the expCat variable to set the value of the category field for the current line
						nlapiSetCurrentLineItemValue('expense', 'category', expCat, false, true); // type, fldnam, value, firefieldchanged, synchronous
						
						// get the value of the expense department field for the current line
						var expDept = nlapiGetCurrentLineItemValue('expense', 'custcol_bbs_expense_department');
						
						// use the expDept variable to set the value of the department (cost centre) field for the current line
						nlapiSetCurrentLineItemValue('expense', 'department', expDept, false, true); // type, fldnam, value, firefieldchanged, synchronous
					}
						
				// get the value of the currency field
				var currency = nlapiGetCurrentLineItemValue('expense', 'currency');
						
				// check if the currency variable returns GBP (internal ID 1)
				if (currency == 1)
					{
						// disable the foreignamount line item field
						nlapiDisableLineItemField('expense', 'foreignamount', true);
					}
				else // currency variable does NOT return GBP
					{
						// enable the foreignamount line item field
						nlapiDisableLineItemField('expense', 'foreignamount', false);
					}
						
				// disable the gross amount field
				nlapiDisableLineItemField('expense', 'grossamt', true);
			}
		
		// determine if the expense tax code field has been changed
		else if (type == 'expense' && name == 'custcol_bbs_expense_tax_code')
			{
				// get the value of the expense tax code field for the current line
				var expTaxCode = nlapiGetCurrentLineItemValue('expense', 'custcol_bbs_expense_tax_code');
				
				// use the expTaxCode variable to set the value of the taxcode field for the current line
				nlapiSetCurrentLineItemValue('expense', 'taxcode', expTaxCode, false, true); // type, fldnam, value, firefieldchanged, synchronous
			}
		
		// determine if the currency field has been changed
		else if (type == 'expense' && name == 'currency')
			{
				// get the value of the currency field
				var currency = nlapiGetCurrentLineItemValue('expense', 'currency');
				
				// check if the currency variable returns GBP (internal ID 1)
				if (currency == 1)
					{
						// disable the foreignamount line item field
						nlapiDisableLineItemField('expense', 'foreignamount', true);
					}
				else // currency variable does NOT return GBP
					{
						// enable the foreignamount line item field
						nlapiDisableLineItemField('expense', 'foreignamount', false);
					}
			}
		
	}

function saveRecord(type)
	{
		// set value of line item fields to null
		nlapiSetCurrentLineItemValue('expense', 'currency', '', false, true); // type, fldnam, value, firefieldchanged, synchronous
		nlapiSetCurrentLineItemValue('expense', 'custcol_bbs_expense_department', '', false, true); // type, fldnam, value, firefieldchanged, synchronous
		
		// save the record
		return true;
	}