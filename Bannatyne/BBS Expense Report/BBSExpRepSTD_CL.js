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
			var upperMileageExpenseLimit = nlapiGetContext().getPreference('custscript_bbs_upper_mileage_exp_limit');
		
			// get the value of the category field
			var expenseCategory = nlapiGetCurrentLineItemValue('expense', 'category');
			
			// check if the expenseCategory is upperMileageExpenseCategory
			if (expenseCategory == upperMileageExpenseCategory)
				{
					// declare and initialize variables
					var mileageLines = 0;
				
					// get count of expense lines
					var lineCount = nlapiGetLineItemCount('expense');
				
					// check line count is greater than 1
					if (lineCount > 0)
						{
							// loop through line item count
							for (var i = 1; i <= lineCount; i++)
								{
									// get the expense category for the line
									expenseCategory = nlapiGetLineItemValue('expense', 'category', i);
									
									// check the expenseCategory is 1 (Mileage Upper Limit)
									if (expenseCategory == 1)
										{
											// add the quantity for the line to the mileageLines variable
											mileageLines += parseFloat(nlapiGetLineItemValue('expense', 'quantity', i));
										}
								}
						}
				
					// get the value of the current mileage claims this year field
					var mileageClaimsThisYear = nlapiGetFieldValue('custbody_bbs_mileage_claims_this_year');
					
					// if mileageClaimsThisYear returns a value
					if (mileageClaimsThisYear)
						{
							// convert to floating point number
							mileageClaimsThisYear = parseFloat(mileageClaimsThisYear);
						}
					else
						{
							// set mileageClaimsThisYear to 0
							mileageClaimsThisYear = 0;
						}
					
					// check if user has greater than/equal to upperMileageExpenseLimit
					if ((mileageLines + mileageClaimsThisYear >= upperMileageExpenseLimit))
						{
							// show alert
							Ext.Msg.alert('⚠️ Warning', 'You have already claimed for <b>10,000</b> miles at the higher rate in the current tax year, therefore no further mileage claims can be made at the higher rate.<br><br>The expense category for the current line has been changed to the <b>Mileage (Lower Rate)</b> expense category.');
							
							// reset expense category field to null
							nlapiSetCurrentLineItemValue('expense', 'category', lowerMileageExpenseCategory);
						}
				}
			else if (expenseCategory == managerMileageExpenseCategory) // if the manager's mileage expense category has been selected
				{
					// show alert
					Ext.Msg.alert('⚠️ Warning', "The expense category you have selected is not enabled for your role.<br><br>Please go back and select either the <b>Mileage (Higher Rate)</b> or <b>Mileage (Lower Rate)</b> expense category to continue with your mileage claim.");
					
					// reset expense category field to null
					nlapiSetCurrentLineItemValue('expense', 'category', '');
					
				}
		}
	
}

function expensePostSourcing(type, name) {	
	
	// check that the field is the category field on the expense sublist
	if (type == 'expense' && name == 'category')
		{
			// retrieve script parameters
			var upperMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_upper_mileage_exp_cat');
			var lowerMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_lower_mileage_exp_cat');
		
			// get the value of the category field
			var expenseCategory = nlapiGetCurrentLineItemValue('expense', 'category');
				
			// check if the expenseCategory is upperMileageExpenseCategory or lowerMileageExpenseCategory
			if (expenseCategory == upperMileageExpenseCategory || expenseCategory == lowerMileageExpenseCategory)
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

function expenseRecalc(type) {
	
	// check we are working with the expense sublist
	if (type == 'expense')
		{
			// retrieve script parameters
			var upperMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_upper_mileage_exp_cat');
			var lowerMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_lower_mileage_exp_cat');
			var upperMileageExpenseLimit = nlapiGetContext().getPreference('custscript_bbs_upper_mileage_exp_limit');
		
			// get the values for the current line
			var expenseCategory = nlapiGetCurrentLineItemValue('expense', 'category');
			var quantity = parseFloat(nlapiGetCurrentLineItemValue('expense', 'quantity'));
			var currency = nlapiGetCurrentLineItemValue('expense', 'currency');
			
			// check if the expenseCategory is upperMileageExpenseCategory
			if (expenseCategory == upperMileageExpenseCategory)
				{
					// declare and initialize variables
					var mileageLines = 0;
				
					// get count of expense lines
					var lineCount = nlapiGetLineItemCount('expense');
				
					// check line count is greater than 1
					if (lineCount > 0)
						{
							// loop through line item count
							for (var i = 1; i <= lineCount; i++)
								{
									// get the expense category for the line
									expenseCategory = nlapiGetLineItemValue('expense', 'category', i);
									
									// check the expenseCategory is 1 (Mileage Upper Limit)
									if (expenseCategory == 1)
										{
											// add the quantity for the line to the mileageLines variable
											mileageLines += parseFloat(nlapiGetLineItemValue('expense', 'quantity', i));
										}
								}
						}
				
					// get the value of the current mileage claims this year field
					var mileageClaimsThisYear = nlapiGetFieldValue('custbody_bbs_mileage_claims_this_year');
					
					// if mileageClaimsThisYear returns a value
					if (mileageClaimsThisYear)
						{
							// convert to floating point number
							mileageClaimsThisYear = parseFloat(mileageClaimsThisYear);
						}
					else
						{
							// set mileageClaimsThisYear to 0
							mileageClaimsThisYear = 0;
						}
					
					// if the total mileage lines is greater than upperMileageExpenseLimit
					if ((mileageClaimsThisYear + mileageLines) > upperMileageExpenseLimit)
						{
							// calculate the overage
							var overage = parseFloat((mileageClaimsThisYear + mileageLines) - upperMileageExpenseLimit);
							
							// calculate the new line quantity
							var newLineQuantity = parseFloat(quantity - overage);
						
							// display an alert to the user
							Ext.Msg.alert('⚠️ Warning', 'You can only claim for <b>' + upperMileageExpenseLimit + '</b> miles at the higher rate in the current tax year.<br><br>The quantity has been amended to <b>' + newLineQuantity + '</b> miles and a new line has been added at the lower rate for the additional <b>' + overage + '</b> miles.');
					
							// call function to lookup fields on the expense category
							var expenseCategoryInfo = getExpenseCatInfo(lowerMileageExpenseCategory);
							
							// amend the quantity on the current line
							nlapiSetCurrentLineItemValue('expense', 'quantity', newLineQuantity);
							nlapiSetCurrentLineItemValue('expense', 'exchangerate', 1);
							nlapiCommitLineItem('expense');
							
							// add a new line at the lower rate
							nlapiSelectNewLineItem('expense');
							nlapiSetCurrentLineItemValue('expense', 'category', lowerMileageExpenseCategory);
							nlapiSetCurrentLineItemValue('expense', 'quantity', overage);
							nlapiSetCurrentLineItemValue('expense', 'rate', expenseCategoryInfo.custrecord_bbs_mileage_claim_rate);
							nlapiSetCurrentLineItemValue('expense', 'taxcode', expenseCategoryInfo.custrecord_bbs_expense_tax_code);
							nlapiSetCurrentLineItemValue('expense', 'exchangerate', 1);							
							nlapiCommitLineItem('expense');
						}
				}
		}	
	
}

function expenseSaveRecord() {
	
	// retrieve script parameters
	var upperMileageExpenseCategory = nlapiGetContext().getPreference('custscript_bbs_upper_mileage_exp_cat');
	
	// declare and initialize variables
	var mileageTotal = 0;
	
	// get line count
	var lineCount = nlapiGetLineItemCount('expense');
	
	// loop through expense lines
	for (var i = 0; i <= lineCount; i++)
		{
			// get the expense category for the line
			var expenseCategory = nlapiGetLineItemValue('expense', 'category', i);
			
			// check if expenseCategory is upperMileageExpenseCategory
			if (expenseCategory == upperMileageExpenseCategory)
				{
					// get the quantity for the line and add it to the mileageTotal variable
					mileageTotal += parseFloat(nlapiGetLineItemValue('expense', 'quantity', i));
				}
		}
		
	// set the 'Mileage Claims This Expense Report' field using the mileageTotal variable
	nlapiSetFieldValue('custbody_bbs_mileage_claims_this_rep', mileageTotal);
	
	// allow the record to be saved
	return true;
	
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
	return mileageClaimSearch[0].getValue('custbody_bbs_mileage_claims_this_rep', null, 'SUM');
	
}