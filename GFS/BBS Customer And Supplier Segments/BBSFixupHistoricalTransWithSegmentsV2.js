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
	nlapiLogExecution('DEBUG', 'Turning off mandatory departments','');
	updateAccPreferences('F');
	
	processTransactions();
	
	//Turn on mandatory departments
	//
	nlapiLogExecution('DEBUG', 'Turning on mandatory departments','');
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
	try
		{
			var accPreferences = nlapiLoadConfiguration('accountingpreferences');
			accPreferences.setFieldValue('deptmandatory', _mode);
			nlapiSubmitConfiguration(accPreferences);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error changing preferences', err.message);
		}
}

function processTransactions()
{
	var transactionSearch = getResults(nlapiCreateSearch("transaction",
			[
			   ["subsidiary","anyof",APPLICABLE_SUBSIDIARY], 
			   "AND", 
			   ["type","anyof","CustCred","CustInvc","VendCred","VendBill"], 
			   "AND", 
			   ["cogs","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["taxline","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP"), 
			   new nlobjSearchColumn("type",null,"GROUP"), 
			   new nlobjSearchColumn("tranid",null,"GROUP")
			]
			));
	
	if(transactionSearch != null && transactionSearch.length > 0)
		{
			nlapiLogExecution('DEBUG', 'Record to process = ' + transactionSearch.length,'');
		
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					checkResources();
				
					var tranId = transactionSearch[int].getValue('internalid',null,'GROUP');
					var tranType = transactionSearch[int].getValue('type',null,'GROUP');
					
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
									checkResources();
								
									var supplier = tranRecord.getLineItemValue('item', 'custcol_bbs_gfs_supplier', int2);
									var customer = tranRecord.getLineItemValue('item', 'custcol_bbs_gfs_customer', int2);
									
									var customerSegment = null;
									var supplierSegment = null;
									
									try
										{
											if(customer != null && customer != '')
												{
													customerSegment = nlapiLookupField('customer', customer, 'cseg_bbs_customer', false);
												}
											
											if(supplier != null && supplier != '')
												{
													supplierSegment = nlapiLookupField('vendor', supplier, 'cseg_bbs_supplier', false);
												}
										
									
											tranRecord.setLineItemValue('item', 'cseg_bbs_supplier', int2, supplierSegment);
											tranRecord.setLineItemValue('item', 'cseg_bbs_customer', int2, customerSegment);	
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error updating items sublist', err.message);
										}
								}
							
							//Expenses
							//
							var expenseCount = tranRecord.getLineItemCount('expense');
							
							for (var int2 = 1; int2 <= expenseCount; int2++) 
								{
									checkResources();
								
									var supplier = tranRecord.getLineItemValue('expense', 'custcol_bbs_gfs_supplier', int2);
									var customer = tranRecord.getLineItemValue('expense', 'custcol_bbs_gfs_customer', int2);
									
									var customerSegment = null;
									var supplierSegment = null;
									
									try
										{
											if(customer != null && customer != '')
												{
													customerSegment = nlapiLookupField('customer', customer, 'cseg_bbs_customer', false);
												}
											
											if(supplier != null && supplier != '')
												{
													supplierSegment = nlapiLookupField('vendor', supplier, 'cseg_bbs_supplier', false);
												}
											
											tranRecord.setLineItemValue('expense', 'cseg_bbs_supplier', int2, supplierSegment);
											tranRecord.setLineItemValue('expense', 'cseg_bbs_customer', int2, customerSegment);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error updating expenses sublist', err.message);
										}
									
								}
							

							//Lines
							//
							var lineCount = tranRecord.getLineItemCount('line');
							
							for (var int2 = 1; int2 <= lineCount; int2++) 
								{
									checkResources();
								
									var supplier = tranRecord.getLineItemValue('line', 'custcol_bbs_gfs_supplier', int2);
									var customer = tranRecord.getLineItemValue('line', 'custcol_bbs_gfs_customer', int2);
									
									var customerSegment = null;
									var supplierSegment = null;
									
									try
										{
											if(customer != null && customer != '')
												{
													customerSegment = nlapiLookupField('customer', customer, 'cseg_bbs_customer', false);
												}
											
											if(supplier != null && supplier != '')
												{
													supplierSegment = nlapiLookupField('vendor', supplier, 'cseg_bbs_supplier', false);
												}
											
											tranRecord.setLineItemValue('line', 'cseg_bbs_supplier', int2, supplierSegment);
											tranRecord.setLineItemValue('line', 'cseg_bbs_customer', int2, customerSegment);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error updating expenses sublist', err.message);
										}
								}
							
							//Save the record
							//
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