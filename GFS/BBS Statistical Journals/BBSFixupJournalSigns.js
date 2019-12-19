/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Dec 2019     cedricgriffiths
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
			   ["accounttype","noneof","Stat"], 
			   "AND", 
			   [["custcol_bbs_consignments","greaterthan","0"],"OR",["custcol_bbs_parcels","greaterthan","0"],"OR",["custcol_bbs_consignments","lessthan","0"],"OR",["custcol_bbs_parcels","lessthan","0"]]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP")
			]
			));
	
	if(journalentrySearch != null && journalentrySearch.length > 0)
		{
			nlapiLogExecution('DEBUG', 'Number of records = ' + journalentrySearch.length, null);
			
			for (var int2 = 0; int2 < journalentrySearch.length; int2++) 
				{
					checkResources();
				
					var journalId = journalentrySearch[int2].getValue("internalid",null,"GROUP");
					var journalRecord = null;
					
					//try to load up the journal
					//
					try
						{
							journalRecord = nlapiLoadRecord('journalentry', journalId);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error loading journal id = ' + journalId, err.message);
							journalRecord = null;
						}
					
					if(journalRecord != null)
						{
							nlapiLogExecution('DEBUG', 'Processing Journal Id ' + journalId, null);
						
							var itemLineCount = journalRecord.getLineItemCount('line');
							var reversingJournal = journalRecord.getFieldValue('isreversal');
							
							for (var int = 1; int <= itemLineCount; int++) 
								{
									var parcels = Number(journalRecord.getLineItemValue('line', 'custcol_bbs_parcels', int));
									var consignments = Number(journalRecord.getLineItemValue('line', 'custcol_bbs_consignments', int));
									var accountType = journalRecord.getLineItemValue('line', 'accounttype', int);
									var debitValue = journalRecord.getLineItemValue('line', 'debit', int);
									var creditValue = journalRecord.getLineItemValue('line', 'credit', int);
									
									//Make the parcels & consigments -ve if we are on an income account & the value on the line is a debit
									//or if the journal is a reversal, we are on an income account & the value is a credit
									//
									if(	(accountType = 'Income' && reversingJournal != 'T' && debitValue != null && debitValue != '')
										|| 
										(accountType = 'Income' && reversingJournal != 'F' && creditValue != null && creditValue != '')
										)
										{
											//Check if the parcels variable is a positive value
											//
											if (parcels > 0)
												{
													//Convert parcels to a negative number
													//
													parcels = Math.abs(parcels) * -1.0;
												}
											
											//Check if the consignments variable is a positive value
											//
											if (consignments > 0)
												{
													//Convert consignments to a positive number
													//
													consignments = Math.abs(consignments) * -1.0;
												}
											
											journalRecord.setLineItemValue('line', 'custcol_bbs_parcels', int, parcels);
											journalRecord.setLineItemValue('line', 'custcol_bbs_consignments', int, consignments);
										}
									
									//Make the parcels & consigments +ve if we are on an income account & the value on the line is a credit
									//or if the journal is a reversal, we are on an income account & the value is a debit
									//
									if(	(accountType = 'Income' && reversingJournal != 'T' && creditValue != null && creditValue != '')
										|| 
										(accountType = 'Income' && reversingJournal != 'F' && debitValue != null && debitValue != '')
										)
										{
											//Check if the parcels variable is a positive value
											//
											if (parcels < 0)
												{
													//Convert parcels to a negative number
													//
													parcels = Math.abs(parcels);
												}
											
											//Check if the consignments variable is a positive value
											//
											if (consignments < 0)
												{
													//Convert consignments to a positive number
													//
													consignments = Math.abs(consignments);
												}
											
											journalRecord.setLineItemValue('line', 'custcol_bbs_parcels', int, parcels);
											journalRecord.setLineItemValue('line', 'custcol_bbs_consignments', int, consignments);
										}
								}
						
							try
								{
									nlapiSubmitRecord(journalRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving journal record id = ' + journalId, err.message);
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

