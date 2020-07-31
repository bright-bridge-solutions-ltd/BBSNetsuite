/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Apr 2020     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Get the parameters
	//
	var context 			= nlapiGetContext();
	var carrierId 			= context.getSetting('SCRIPT', 'custscript_bbs_carrier_id');
	var supplierId 			= context.getSetting('SCRIPT', 'custscript_bbs_supplier_id');
	var supplierSegment 	= nlapiLookupField('vendor', supplierId, 'cseg_bbs_supplier', false);
	
	//Find stat journals to process
	//
	var journalentrySearch = getResults(nlapiCreateSearch("journalentry",
			[
			   ["type","anyof","Journal"], 
			   "AND", 
			   ["statistical","is","T"], 
			   "AND", 
			   ["account","anyof","1121"], 
			   "AND", 
			   ["custbody_bbs_originating_transaction","noneof","@NONE@"], 
			   "AND", 
			   ["line.cseg_bbs_supplier","anyof","@NONE@"], 
			   "AND", 
			   ["custbody_bbs_originating_transaction.class","anyof",carrierId], 
			   "AND", 
			   ["class","anyof",carrierId]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP")
			]
			));
		
	//Do we have any results to process
	//
	if(journalentrySearch != null && journalentrySearch.length > 0)
		{
			nlapiLogExecution('DEBUG', 'Number of journals to propcess = ' + journalentrySearch.length, '');
		
			//Loop through the results
			//
			for (var int = 0; int < journalentrySearch.length; int++) 
				{
					checkResources();
					
					//Get the stat journal id
					//
					var statJournalId = journalentrySearch[int].getValue("internalid",null,"GROUP");
					nlapiLogExecution('DEBUG', 'Processing stat journal id = ' + statJournalId, '');
					
					if(statJournalId != null && statJournalId != '')
						{
							//Try to load the stat journal record
							//
							var statJournalRecord = null;
							
							try
								{
									statJournalRecord = nlapiLoadRecord('statisticaljournalentry', statJournalId);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error loading stat journal with id = ' + statJournalId, err.message);
									statJournalRecord = null;
								}
							
							//Did we load the stat journal record ok
							//
							if(statJournalRecord != null)
								{							
									var lineCount 	= statJournalRecord.getLineItemCount('line');
													
									for (var int2 = 1; int2 <= lineCount; int2++) 
										{
											checkResources();
														
											var lineCarrier = statJournalRecord.getLineItemValue('line', 'class', int2);
	
											if(lineCarrier == carrierId)
												{
													statJournalRecord.setLineItemValue('line', 'cseg_bbs_supplier', int2, supplierSegment);
												}
										}
									
									//Save the stat journal
									//
									try
										{
											nlapiSubmitRecord(statJournalRecord, false, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error saving stat journal with id = ' + statJournalId, err.message);
										}
								}
						}
				}
		}
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

function isNull(_string, _replacer)
{
	if(_string == null)
		{
			return _replacer;
		}
	else
		{
			return _string;
		}
}
