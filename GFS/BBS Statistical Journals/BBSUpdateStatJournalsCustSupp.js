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
	//Update the statistical journals with the customer & supplier details if the originating transaction was a journal
	//
	
	
	//Find stat journals to process
	//
	var journalentrySearch = getResults(nlapiCreateSearch("journalentry",
			[
			   ["type","anyof","Journal"], 
			   "AND", 
			   ["accounttype","anyof","Stat"], 
			   "AND", 
			   ["custbody_bbs_originating_transaction.type","anyof","Journal"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["cogs","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP").setSort(false)
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
									//Get the id of the originating journal transaction
									//
									var originatingTransactionId = statJournalRecord.getFieldValue('custbody_bbs_originating_transaction');
									
									if(originatingTransactionId != null && originatingTransactionId != '')
										{
											//Try and load the originating transaction record
											//
											var originalJournalRecord = null;
											
											try
												{
													originalJournalRecord = nlapiLoadRecord('journalentry', originatingTransactionId);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error loading originating journal with id = ' + originatingTransactionId, err.message);
													originalJournalRecord = null;
												}
											
											//Did we load the originating journal record ok
											//
											if(originalJournalRecord != null)
												{
													//Get the customer & supplier values from the lines
													//
													var lineCount 	= originalJournalRecord.getLineItemCount('line');
													
													for (var int2 = 1; int2 <= lineCount; int2++) 
														{
															checkResources();
														
															var lineCustomer = originalJournalRecord.getLineItemValue('line', 'custcol_bbs_gfs_customer', int2);
															var lineSupplier = originalJournalRecord.getLineItemValue('line', 'custcol_bbs_gfs_supplier', int2);
														
															//Get the customer/supplier segment
															//
															if(lineCustomer != null && lineCustomer != '')
																{
																	var customerSegment = nlapiLookupField('customer', lineCustomer, 'cseg_bbs_customer', false);
																	
																	if(customerSegment != null && customerSegment != '')
																		{
																			originalJournalRecord.setLineItemValue('line', 'cseg_bbs_customer', int2, customerSegment);
																		}
																}
															
															if(lineSupplier != null && lineSupplier != '')
																{
																	var supplierSegment = nlapiLookupField('vendor', lineSupplier, 'cseg_bbs_supplier', false);
																	
																	if(supplierSegment != null && supplierSegment != '')
																		{
																			originalJournalRecord.setLineItemValue('line', 'cseg_bbs_supplier', int2, supplierSegment);
																		}
																}
														}
													
													//Save the original transaction
													//
													nlapiSubmitRecord(originalJournalRecord, false, true);
												
													checkResources();
													
													//Work out the summary info that would have been written to the stat journal
													//
													var summaryValues = {};
												
													getSummaryValues(originalJournalRecord, 'N', summaryValues, 'line');

													//Update the lines on the stat journal
													//
													var lineCount = statJournalRecord.getLineItemCount('line');
													
													for (var int2 = 1; int2 <= lineCount; int2++) 
														{
															checkResources();
														
															//Build up the key to lookup the summary value entry
															//
															var carrier = isNull(statJournalRecord.getLineItemValue('line', 'class', int2), '');
															var contract = isNull(statJournalRecord.getLineItemValue('line', 'location', int2), '');
															var group = isNull(statJournalRecord.getLineItemValue('line', 'custcol_cseg_bbs_prodgrp', int2), '');
															var service = isNull(statJournalRecord.getLineItemValue('line', 'custcol_cseg_bbs_service', int2), '');
															var charge = isNull(statJournalRecord.getLineItemValue('line', 'custcol_cseg_bbs_chrgetype', int2), '');
															var operations = isNull(statJournalRecord.getLineItemValue('line', 'cseg_bbs_ops_method', int2), '');
															var department = isNull(statJournalRecord.getLineItemValue('line', 'department', int2), '');
															var debit = Number(statJournalRecord.getLineItemValue('line', 'debit', int2));
															var credit = Number(statJournalRecord.getLineItemValue('line', 'credit', int2));
															var account = statJournalRecord.getLineItemValue('line', 'account', int2); //1121 = parcels, 1122 = consignments
															
															var amount = (credit != 0 ? credit : debit);
															
															var partialSummaryKey = carrier + '|' + contract + '|' + group + '|' + service + '|' + charge + '|' + operations + '|' + department + '|';
															
															//Loop through the summary values to see if we can find a partial match on the key value
															//
															for ( var summaryKey in summaryValues) 
																{
																	if(summaryKey.indexOf(partialSummaryKey) != -1)
																		{
																			//If we think we have found a match, then we need to make sure the values match as well
																			//
																			if(account == '1121' && summaryValues[summaryKey][0] == amount) //parcels
																				{
																					//We have a match
																					//
																					statJournalRecord.setLineItemValue('line', 'cseg_bbs_customer', int2, summaryKey.split('|')[8]);
																					statJournalRecord.setLineItemValue('line', 'cseg_bbs_supplier', int2, summaryKey.split('|')[7]);
																				}
																			
																			if(account == '1122' && summaryValues[summaryKey][1] == amount) //consignments
																				{
																					//We have a match
																					//
																					statJournalRecord.setLineItemValue('line', 'cseg_bbs_customer', int2, summaryKey.split('|')[8]);
																					statJournalRecord.setLineItemValue('line', 'cseg_bbs_supplier', int2, summaryKey.split('|')[7]);
																				}
																		}
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

function getSummaryValues(_record, _type, _summaryValues, _sublistName)
{
	var lines = _record.getLineItemCount(_sublistName);
	var multiplier = Number(1);
	
	for (var int3 = 1; int3 <= lines; int3++) 
		{
			var carrier = isNull(_record.getLineItemValue(_sublistName, 'class', int3), '');
			var contract = isNull(_record.getLineItemValue(_sublistName, 'location', int3), '');
			var group = isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_prodgrp', int3), '');
			var service = isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_service', int3), '');
			var charge = isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_chrgetype', int3), '');
			var operations = isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_ops_method', int3), '');
			var department = isNull(_record.getLineItemValue(_sublistName, 'department', int3), '');
			var supplier = isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_supplier', int3), '');
			var customer = isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_customer', int3), '');
			
			var summaryKey = carrier + '|' + contract + '|' + group + '|' + service + '|' + charge + '|' + operations + '|' + department + '|' + supplier + '|' + customer;
			
			var parcels = Number(_record.getLineItemValue(_sublistName, 'custcol_bbs_parcels', int3));
			var consignments = Number(_record.getLineItemValue(_sublistName, 'custcol_bbs_consignments', int3));
			
			switch(_type)
				{
					case 'O':
						multiplier = Number(-1);
						break;
						
					case 'N':
						multiplier = Number(1);
						break;	
				}
			
			parcels = parcels * multiplier;
			consignments = consignments * multiplier;
			
			if(!_summaryValues[summaryKey])
				{
					_summaryValues[summaryKey] = [parcels, consignments];
				}
			else
				{
					_summaryValues[summaryKey][0] += parcels;
					_summaryValues[summaryKey][1] += consignments;
				}
		}
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
