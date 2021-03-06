/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 May 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var tranTypes = {};
	
	var transactionSearch = getResults(nlapiCreateSearch("transaction",
			[
			   ["trandate","after","30/9/2019"], 
			   "AND", 
			   ["mainline","is","T"]
			], 
			[
			   new nlobjSearchColumn("trandate"), 
			   new nlobjSearchColumn("type")
			]
			));
	
	if(transactionSearch != null && transactionSearch.length > 0)
		{
			nlapiLogExecution('DEBUG', 'Total Trans Count ', transactionSearch.length);
		
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					var recordId = transactionSearch[int].getId();
					var recordType = transactionSearch[int].getValue('type');
					var recordDate = transactionSearch[int].getValue('trandate');
					
					if(!tranTypes[recordType])
						{
							tranTypes[recordType] = Number(1);
						}
					else
						{
							tranTypes[recordType]++;
						}
					
					checkResources();
					
					
					try
						{
							nlapiSubmitField(translateType(recordType), recordId, ['trandate','custbody_bbs_original_trans_date'], ['30/09/2019',recordDate], true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating record ' + recordType + ' ' + recordId, err.message);
						}
				}
		}

	nlapiLogExecution('DEBUG', 'Tran Types', JSON.stringify(tranTypes));
}


function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	
	if(searchResultSet != null)
		{
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
		}
	return searchResultSet;
}

function translateType(_transactionType)
{
	var realTransactionType = null;
	
	switch(_transactionType)
		{
			case "ExpRept"  :
				realTransactionType = 'expensereport';
				break;
				
			case "SalesOrd":
				realTransactionType = 'salesorder';
				break;
				
			case "VendPymt":
				realTransactionType = 'vendorpayment';
				break;
				
			case "ItemShip":
				realTransactionType = 'itemfulfillment';
				break;
				
			case "CustPymt":
				realTransactionType = 'customerpayment';
				break;
				
			case "PurchOrd":
				realTransactionType = 'purchaseorder';
				break;
				
			case "ItemRcpt":
				realTransactionType = 'itemreceipt';
				break;
				
			case "CustInvc":
				realTransactionType = 'invoice';
				break;
				
			case "Check":
				realTransactionType = 'check';
				break;
				
			case "VendCred":
				realTransactionType = 'vendorcredit';
				break;	
				
			case "Estimate":
				realTransactionType = 'estimate';
				break;
				
			case "VendBill":
				realTransactionType = 'vendorbill';
				break;
				
			case "CustCred":
				realTransactionType = 'creditmemo';
				break;
				
			case "CustRfnd":
				realTransactionType = 'customerrefund';
				break;
				
			case "Journal":
				realTransactionType = 'journalentry';
				break;
			
			case "Transfer":
				realTransactionType = 'transfer';
				break;
				
			case "FxReval":
				realTransactionType = 'fxreval';
				break;
				
			case "Deposit":
				realTransactionType = 'deposit';
				break;
			
			case "VendAuth":
				realTransactionType = 'vendorreturnauthorization';
				break;
				
				
		}
	
	return realTransactionType;
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}