/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Jun 2020     sambatten
 *
 */

function expensePageInit() {
	
	// get the internal ID of the employee
	var employeeID = nlapiGetFieldValue('entity');
	
	// do we have an employee?
	if (employeeID)
		{
			// call function to return the number of mileage claims for the employee for the current tax year
			var mileageClaimTotal = getMileageClaimTotal(employeeID);
			
			// set the 'Current Mileage Claims This Year' field
			nlapiSetFieldValue('custbody_bbs_mileage_claims_this_year', mileageClaimTotal);
		}
	
}

function expenseFieldChanged(type, name) {
	
	// check if the entity field has been changed
	if (name == 'entity')
		{
			// get the internal ID of the employee
			var employeeID = nlapiGetFieldValue('entity');
		
			// call function to return the number of mileage claims for the employee for the current tax year
			var mileageClaimTotal = getMileageClaimTotal(employeeID);
			
			// set the 'Current Mileage Claims This Year' field
			nlapiSetFieldValue('custbody_bbs_mileage_claims_this_year', mileageClaimTotal);
		}
	else if (type == 'expense' && name == 'category') // if the category field on the expense sublist has been changed
		{
			// retrieve script parameters
			var upperMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_upper_mileage_exp_cat');
			var lowerMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_lower_mileage_exp_cat');
			var managerMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_manager_mileage_exp_cat');
		
			// get the value of the category field
			var expenseCategory = nlapiGetCurrentLineItemValue('expense', 'category');
			
			// if the upper/lower mileage expense category have been selected
			if (expenseCategory == upperMileageExpenseCategory || expenseCategory == lowerMileageExpenseCategory)
				{
					// show alert
					Ext.Msg.alert('⚠️ Warning', "The expense category you have selected is not enabled for your role<br><br>The expense category has been changed to the <b>Mileage (Manager Rate)</b> expense category<br><br>You may now continue with your mileage claim.");
					
					// reset expense category field to null
					nlapiSetCurrentLineItemValue('expense', 'category', managerMileageExpenseCategory);
					
				}
		}
	else if (type == 'expense' && name == 'quantity') // if the quantity field on the expense sublist has been changed
		{
			// retrieve script parameters
			var managerMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_manager_mileage_exp_cat');

			// get the value of the category field
			var expenseCategory = nlapiGetCurrentLineItemValue('expense', 'category');
			
			// check if the expenseCategory is managerMileageExpenseCategory
			if (expenseCategory == managerMileageExpenseCategory)
				{
					// get the quantity for the line
					var quantity = nlapiGetCurrentLineItemValue('expense', 'quantity');
					
					// update the expense line quantity field
					nlapiSetCurrentLineItemValue('expense', 'custcol_bbs_exp_line_quantity', quantity);
				}
		}
	
}

function expensePostSourcing(type, name) {	
	
	// check that the field is the category field on the expense sublist
	if (type == 'expense' && name == 'category')
		{
			// retrieve script parameters
			var managerMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_manager_mileage_exp_cat');
		
			// get the value of the category field
			var expenseCategory = nlapiGetCurrentLineItemValue('expense', 'category');
				
			// check if the expenseCategory is managerMileageExpenseCategory
			if (expenseCategory == managerMileageExpenseCategory)
				{
					// lookup fields on the expense category
					var expenseCategoryInfo = getExpenseCatInfo(expenseCategory);
					
					// disable the rate and amount fields
					nlapiDisableLineItemField('expense', 'rate', true);
					nlapiDisableLineItemField('expense', 'amount', true);
						
					// set the rate and tax code fields on the current line
					nlapiSetCurrentLineItemValue('expense', 'rate', expenseCategoryInfo.custrecord_bbs_mileage_claim_rate);
					nlapiSetCurrentLineItemValue('expense', 'taxcode', expenseCategoryInfo.custrecord_bbs_expense_tax_code);
				}
		}
}

// ================
// HELPER FUNCTIONS
// ================

function getExpenseCatInfo(expenseCategory) {
	
	return nlapiLookupField('expensecategory', expenseCategory, ['custrecord_bbs_mileage_claim_rate', 'custrecord_bbs_expense_tax_code']);
	
}

function getMileageClaimTotal(employeeID) {
	
	// retrieve script parameters
	var savedSearchID = nlapiGetContext().getPreference('custscript_bbs_emp_mil_curr_tax_year');
	
	// search expense reports to find mileage claim total for this employee
	var mileageClaimSearch = nlapiSearchRecord('expensereport', savedSearchID, new nlobjSearchFilter('entity', null, 'anyof', employeeID), null);
	
	// return the first search result to the main script function
	return mileageClaimSearch[0].getValue('custcol_bbs_exp_line_quantity', null, 'SUM');
	
}