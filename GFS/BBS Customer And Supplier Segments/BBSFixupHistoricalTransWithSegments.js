/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Aug 2019     cedricgriffiths  Fix up existing transactions with the customer & supplier segments
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
var APPLICABLE_SUBSIDIARY = '16';

function scheduled(type) 
{
	//Turn off mandatory departments
	//
	updateAccPreferences('F');
	
	processSuppliers();
	processCustomers();
	
	//Turn on mandatory departments
	//
	updateAccPreferences('T');
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function updateAccPreferences(_mode)
{
	var accPreferences = nlapiLoadConfiguration('accountingpreferences');
	accPreferences.setFieldValue('deptmandatory', _mode);
	nlapiSubmitConfiguration(accPreferences);
}

function processSuppliers()
{
	var transactionSearch = getResults(nlapiCreateSearch("transaction",
			[
			   ["subsidiary","anyof",APPLICABLE_SUBSIDIARY], 
			   "AND", 
			   ["type","anyof","VendCred","VendBill","Journal"], 
			   "AND", 
			   ["vendor.custentity_bbs_supplier_segment","noneof","@NONE@"], 
			   "AND", 
			   ["mainline","is","T"]
			], 
			[
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("custentity_bbs_supplier_segment","vendor",null)
			]
			));
	
	if(transactionSearch != null && transactionSearch.length > 0)
		{
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					checkResources();
				
					var tranId = transactionSearch[int].getId();
					var tranType = transactionSearch[int].getValue('type');
					var tranSegment = transactionSearch[int].getValue("custentity_bbs_supplier_segment","vendor",null);
				
					//load up the transaction record
					//
					var tranRecord = null;
					
					try
						{
							tranRecord = nlapiLoadRecord(translateType(tranType), tranId);
						}
					catch(err)
						{
							tranRecord = null;
							nlapiLogExecution('ERROR', 'Error loading transaction record ' + tranType + ' ' + tranId, err.message);
						}
					
					if(tranRecord != null)
						{
							//Items
							//
							var itemCount = tranRecord.getLineItemCount('item');
							
							for (var int2 = 1; int2 <= itemCount; int2++) 
								{
									tranRecord.setLineItemValue('item', 'cseg_bbs_supplier', int2, tranSegment);
								}
							
							//Expenses
							//
							var expenseCount = tranRecord.getLineItemCount('expense');
							
							for (var int2 = 1; int2 <= expenseCount; int2++) 
								{
									tranRecord.setLineItemValue('expense', 'cseg_bbs_supplier', int2, tranSegment);
								}
							

							//Lines
							//
							var lineCount = tranRecord.getLineItemCount('line');
							
							for (var int2 = 1; int2 <= lineCount; int2++) 
								{
									tranRecord.setLineItemValue('line', 'cseg_bbs_supplier', int2, tranSegment);
								}
							
							try
								{
									nlapiSubmitRecord(tranRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating transaction record ' + tranType + ' ' + tranId, err.message);
								}
						}
				}
		}
}

function processCustomers()
{
	var transactionSearch = getResults(nlapiCreateSearch("transaction",
			[
			   ["subsidiary","anyof",APPLICABLE_SUBSIDIARY], 
			   "AND", 
			   ["type","anyof","CustCred","CustInvc","Journal"], 
			   "AND", 
			   ["customer.custentity_bbs_customer_segment","noneof","@NONE@"], 
			   "AND", 
			   ["mainline","is","T"]
			], 
			[
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity"), 
			   new nlobjSearchColumn("custentity_bbs_customer_segment","customer",null)
			]
			));
	
	if(transactionSearch != null && transactionSearch.length > 0)
		{
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					checkResources();
				
					var tranId = transactionSearch[int].getId();
					var tranType = transactionSearch[int].getValue('type');
					var tranSegment = transactionSearch[int].getValue("custentity_bbs_customer_segment","customer",null);
				
					//load up the transaction record
					//
					var tranRecord = null;
					
					try
						{
							tranRecord = nlapiLoadRecord(translateType(tranType), tranId);
						}
					catch(err)
						{
							tranRecord = null;
							nlapiLogExecution('ERROR', 'Error loading transaction record ' + tranType + ' ' + tranId, err.message);
						}
					
					if(tranRecord != null)
						{
							//Items
							//
							var itemCount = tranRecord.getLineItemCount('item');
							
							for (var int2 = 1; int2 <= itemCount; int2++) 
								{
									tranRecord.setLineItemValue('item', 'cseg_bbs_customer', int2, tranSegment);
								}
							
							//Expenses
							//
							var expenseCount = tranRecord.getLineItemCount('expense');
							
							for (var int2 = 1; int2 <= expenseCount; int2++) 
								{
									tranRecord.setLineItemValue('expense', 'cseg_bbs_customer', int2, tranSegment);
								}
							

							//Lines
							//
							var lineCount = tranRecord.getLineItemCount('line');
							
							for (var int2 = 1; int2 <= lineCount; int2++) 
								{
									tranRecord.setLineItemValue('line', 'cseg_bbs_customer', int2, tranSegment);
								}
							
							try
								{
									nlapiSubmitRecord(tranRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error updating transaction record ' + tranType + ' ' + tranId, err.message);
								}
						}
				}
		}
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				
				if(moreSearchResultSet == null)
					{
						resultlen = 0;
					}
				else
					{
						resultlen = moreSearchResultSet.length;
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
					}
		}
	
	return searchResultSet;
}

function translateType(_transactionType)
{
	var realTransactionType = null;
	
	switch(_transactionType)
		{
			case 'Journal':
				
				realTransactionType = 'journalentry';
				break;
			
			case 'CustInvc':
				
				realTransactionType = 'invoice';
				break;
				
			case 'VendBill':
				
				realTransactionType = 'vendorbill';
				break;
				
			case 'CustCred':
				
				realTransactionType = 'creditmemo';
				break;
				
			case 'VendCred':
				
				realTransactionType = 'vendorcredit';
				break;	
		}
	
	return realTransactionType;
}