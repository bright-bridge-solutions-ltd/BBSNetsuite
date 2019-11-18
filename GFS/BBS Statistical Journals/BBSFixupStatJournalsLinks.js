/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var journalentrySearch = getResults(nlapiCreateSearch("journalentry",
			[
			   ["type","anyof","Journal"], 
			   "AND", 
			   ["accounttype","anyof","Stat"], 
			   "AND", 
			   ["custbody_bbs_originating_transaction","anyof","@NONE@"], 
			   "AND", 
			   ["memomain","isnotempty",""]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP"), 
			   new nlobjSearchColumn("tranid",null,"GROUP"), 
			   new nlobjSearchColumn("memomain",null,"GROUP")
			]
			));
	
	if(journalentrySearch != null && journalentrySearch.length > 0)
		{
			for (var int = 0; int < journalentrySearch.length; int++) 
				{
					checkResources();
				
					var journalId = journalentrySearch[int].getValue("internalid",null,"GROUP");
					var memo = journalentrySearch[int].getValue("memomain",null,"GROUP");
					
					//Find original transaction
					//
					var originalTransaction = findTransaction(memo);
					
					if(originalTransaction != null)
						{
							var statJournalRecord = null;
							
							//try to load up the stat journal
							//
							try
								{
									statJournalRecord = nlapiLoadRecord('statisticaljournalentry', journalId);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error loading journal id = ' + journalId, err.message);
									statJournalRecord = null;
								}
							
							if(statJournalRecord != null)
								{
									//Set the original transaction id on the header of the stat journal
									//
									statJournalRecord.setFieldValue('custbody_bbs_originating_transaction', originalTransaction.id);
								
									//Find the lines on the stat journal
									//
									var journalLines = statJournalRecord.getLineItemCount('line');
									
									for (var int2 = 1; int2 <= journalLines; int2++) 
										{
											statJournalRecord.setLineItemValue('line', 'cseg_bbs_customer', int2, originalTransaction.custSegment);
											statJournalRecord.setLineItemValue('line', 'cseg_bbs_supplier', int2, originalTransaction.suppSegment);
										}
									
									try
										{
											nlapiSubmitRecord(statJournalRecord, false, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error saving journal id = ' + journalId, err.message);
										}
								}
						}
				}
		}
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function findTransaction(_memo)
{
	var originalTrans = {};
	
	var transactionSearch = nlapiSearchRecord("transaction",null,
			[
			   ["mainline","is","T"], 
			   "AND", 
			   ["numbertext","is",_memo], 
			   "AND", 
			   ["type","anyof","Journal","CustCred","CustInvc"]
			], 
			[
			   new nlobjSearchColumn("type"), 
			   new nlobjSearchColumn("tranid"), 
			   new nlobjSearchColumn("entity")
			]
			);
	
	if(transactionSearch != null && transactionSearch.length == 1)
		{
			//get the original transaction id & type
			//
			originalTrans.id  	= transactionSearch[0].getId();
			originalTrans.type 	= transactionSearch[0].getValue("type");

			//get the cust & supp segments from the original transaction
			//
			var originalRecord = null;
			
			try
				{
					originalRecord = nlapiLoadRecord(translateType(originalTrans.type), originalTrans.id);
				}
			catch(err)
				{
					originalRecord = null;
				}
			
			if(originalRecord != null)
				{
					//Items
					//
					var itemCount = originalRecord.getLineItemCount('item');
					
					for (var int2 = 1; int2 <= itemCount; int2++) 
						{
							originalTrans.suppSegment = originalRecord.getLineItemValue('item', 'cseg_bbs_supplier', int2);
							originalTrans.custSegment = originalRecord.getLineItemValue('item', 'cseg_bbs_customer', int2);
						}
					
					//Expenses
					//
					var expenseCount = originalRecord.getLineItemCount('expense');
					
					for (var int2 = 1; int2 <= expenseCount; int2++) 
						{
							originalTrans.suppSegment = originalRecord.getLineItemValue('expense', 'cseg_bbs_supplier', int2);
							originalTrans.custSegment = originalRecord.getLineItemValue('expense', 'cseg_bbs_customer', int2);
						}
					
	
					//Lines
					//
					var lineCount = originalRecord.getLineItemCount('line');
					
					for (var int2 = 1; int2 <= lineCount; int2++) 
						{
							originalTrans.suppSegment = originalRecord.getLineItemValue('line', 'cseg_bbs_supplier', int2);
							originalTrans.custSegment = originalRecord.getLineItemValue('line', 'cseg_bbs_customer', int2);
						}
				}
		}
	else
		{
			originalTrans = null;
		}
	
	
	return originalTrans;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
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