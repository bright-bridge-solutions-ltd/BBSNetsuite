/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
	
	function invoiceBeforeSubmit(scriptContext) {
			
		// check the record is being created or edited
		if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
			{
				// get the current record
				var currentRecord = scriptContext.newRecord;
				
				// get the currency and subsidiary from the record
				var currency = currentRecord.getValue({
					fieldId: 'currency'
				});
				
				var subsidiary = currentRecord.getValue({
					fieldId: 'subsidiary'
				});
				
				// call function to return bank details for the transaction's currency
				var bankDetails = findBankDetails(currency, subsidiary);
				
				// set the bank details fields on the record
				currentRecord.setValue({
					fieldId: 'custbody_bbs_bank_account_name',
					value: bankDetails.accountName
				});
				
				currentRecord.setValue({
					fieldId: 'custbody_bbs_bank_account_number',
					value: bankDetails.accountNumber
				});
				
				currentRecord.setValue({
					fieldId: 'custbody_bbs_bank_sort_code',
					value: bankDetails.sortCode
				});
				
				currentRecord.setValue({
					fieldId: 'custbody_bbs_bank_iban',
					value: bankDetails.iban
				});
				
				currentRecord.setValue({
					fieldId: 'custbody_bbs_bank_bic',
					value: bankDetails.bic
				});
				
				currentRecord.setValue({
					fieldId: 'custbody_bbs_bank_swift',
					value: bankDetails.swift
				});
			}

	}

	// =================================================================
	// FUNCTION TO RETURN THE BANK DETAILS FOR THE TRANSACTIONS CURRENCY
	// =================================================================
	
	function findBankDetails(currency, subsidiary) {
		
		// declare and initialize variables
		var accountName 	= null;
		var accountNumber	= null;
		var sortCode		= null;
		var iban			= null;
		var bic				= null;
		var swift			= null;
		
		// run search to find bank details for the selected currency
		search.create({
			type: 'customrecord_bbs_bank_details',
			
			filters: [{
				name: 'isinactive',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'custrecord_bbs_bank_details_currency',
				operator: search.Operator.ANYOF,
				values: [currency]
			},
					{
				name: 'custrecord_bbs_bank_details_subsidiary',
				operator: search.Operator.ANYOF,
				values: [subsidiary]
			}],
			
			columns: [{
				name: 'custrecord_bbs_bank_details_account_name'
			},
					{
				name: 'custrecord_bbs_bank_details_account_num'
			},
					{
				name: 'custrecord_bbs_bank_details_sort_code'
			},
					{
				name: 'custrecord_bbs_bank_details_iban'
			},
					{
				name: 'custrecord_bbs_bank_details_bic'
			},
					{
				name: 'custrecord_bbs_bank_details_swift'
			}],
	
		}).run().each(function(result){
			
			// retrieve bank details from the search results
			accountName = result.getValue({
				name: 'custrecord_bbs_bank_details_account_name'
			});
			
			accountNumber = result.getValue({
				name: 'custrecord_bbs_bank_details_account_num'
			});
			
			sortCode = result.getValue({
				name: 'custrecord_bbs_bank_details_sort_code'
			});
			
			iban = result.getValue({
				name: 'custrecord_bbs_bank_details_iban'
			});
			
			bic = result.getValue({
				name: 'custrecord_bbs_bank_details_bic'
			});
			
			swift = result.getValue({
				name: 'custrecord_bbs_bank_details_swift'
			});
			
		});
		
		return {
			accountName:	accountName,
			accountNumber:	accountNumber,
			sortCode:		sortCode,
			iban:			iban,
			bic:			bic,
			swift:			swift
		}
		
	}
	
	return 	{
    	beforeSubmit: invoiceBeforeSubmit
    };
    
});
