/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Aug 2016     cedric		   Function to run when the customer is changed on a sales order
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function bankAccountAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord = nlapiGetNewRecord();
			var newRecordId = newRecord.getId();
			var newRecordType = newRecord.getRecordType();
		
			var subsidiary = newRecord.getFieldValue('subsidiary');
			var currency = newRecord.getFieldValue('currency');
			
			var defaultAcc = getDefaultAccount(currency, subsidiary);
			
			if(defaultAcc != null && defaultAcc != '')
				{
					try
						{
							nlapiSubmitField(newRecordType, newRecordId, 'custbody_bbs_bank_account', defaultAcc, true);
						}
					catch(err)
						{
						
						}
				}
		}
	
}

function getDefaultAccount(searchCurrency, searchSubsidiary) 
{

	var foundBankId = '';

	//Build a search to find a bank account
	//
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('custrecord_bbs_bank_currency');
	cols[1] = new nlobjSearchColumn('custrecord_bbs_ar_bank');
	cols[2] = new nlobjSearchColumn('custrecord_bbs_default_ar');
	cols[3] = new nlobjSearchColumn('custrecord_bbs_bank_subsidiary');

	//Filter the search by the currency from the customer, a/r bank acc = y & default a/c = y
	//
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('custrecord_bbs_bank_currency', null, 'is', searchCurrency);
	filters[1] = new nlobjSearchFilter('custrecord_bbs_ar_bank', null, 'is', 'T');
	filters[2] = new nlobjSearchFilter('custrecord_bbs_default_ar', null, 'is', 'T');
	
	if (searchSubsidiary)
		{
			filters[3] = new nlobjSearchFilter('custrecord_bbs_bank_subsidiary', null, 'is', searchSubsidiary);
		}

	//Create the search, run it & get the result set 
	//
	var bankSearches = nlapiCreateSearch('customrecord_bbs_bank_list', filters, cols);
	var bankResults = bankSearches.runSearch();
	var bankResultset = bankResults.getResults(0, 100);

	//Did we get any results?
	//
	if (bankResultset != null && bankResultset.length > 0) 
		{
			//Loop through the results (there should only be one anyway)
			//
			for (var int = 0; int < bankResultset.length; int++) 
				{
					//Get the id of the record found
					//
					var foundBankId = bankResultset[int].getId();
				}
		}
	
		return foundBankId;
}