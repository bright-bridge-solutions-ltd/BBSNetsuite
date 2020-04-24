/**
 * Module Description
 * 
 * Version    Date            Author           	Remarks
 * 1.00       23 Apr 2020     cedricgriffiths	
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	//Creates a statistical journal for any financial journal that has been reversed in the past - this is a one off script
	//
	
	//Get the parameters
	//
	var context 				= nlapiGetContext();
	var accountParcels 			= context.getSetting('SCRIPT', 'custscript_bbs_old_rev_acc_parcel');
	var accountConsignments 	= context.getSetting('SCRIPT', 'custscript_bbs_old_rev_acc_cons');
	var summaryValues 			= {};
	var originatingTransaction 	= null;
	var transactionDate 		= null;
	var postingPeriod 			= null;
	var supplierSegment 		= null;
	var customerSegment 		= null;
	var reversingJournal		= null;
	
	//Find the journals to process
	//
	var journalentrySearch = getResults(nlapiCreateSearch("journalentry",
			[
			   ["type","anyof","Journal"], 
			   "AND", 
			   ["accounttype","noneof","Stat"], 
			   "AND", 
			   ["reversaldate","isnotempty",""], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["cogs","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["taxline","is","F"]
			], 
			[
			   new nlobjSearchColumn("internalid",null,"GROUP").setSort(false)
			]
			));
	
	if(journalentrySearch != null && journalentrySearch.length > 0)
		{
			for (var searchCounter = 0; searchCounter < journalentrySearch.length; searchCounter++) 
				{
					checkResources();
					
					var originalJournalId = journalentrySearch[searchCounter].getValue("internalid",null,"GROUP");
					
					//Load the original journal record
					//
					var originalJournalRecord = null;
					
					try
						{
							originalJournalRecord = nlapiLoadRecord('journalentry', originalJournalId);
						}
					catch(err)
						{
							originalJournalRecord = null;
							nlapiLogExecution('ERROR', 'Error loading original journal record', err.message);
						}
					
					//Did the record load ok?
					//
					if(originalJournalRecord != null)
						{
							//Get the subsidiary, originating transaction id etc
							//
							subsidiaryId 			= originalJournalRecord.getFieldValue('subsidiary');
							originatingTransaction 	= originalJournalRecord.getFieldValue('tranid');
							transactionDate 		= originalJournalRecord.getFieldValue('trandate');
							postingPeriod 			= originalJournalRecord.getFieldValue('postingperiod');
							entityId 				= originalJournalRecord.getFieldValue('entity');
							
							//Empty the summary values first" +
							//
							for (var summaryKey in summaryValues) 
								{
									delete summaryValues[summaryKey];
								}
							
							getSummaryValues(originalJournalRecord, summaryValues, 'line');
							
							//See if we need to create a statistical journal
							//
							var createJournal = false;
							
							for (var summaryValue in summaryValues) 
								{
									if(summaryValues[summaryValue][0] != 0 || summaryValues[summaryValue][1] != 0)
										{
											createJournal = true;
											break;
										}
								}
							
							if(createJournal)
								{
									var lineNo = Number(0);
									
									//Create the statistical journal entry
									//
									var statisticalJournal = nlapiCreateRecord('statisticaljournalentry'); 
									statisticalJournal.setFieldValue('subsidiary', subsidiaryId);
									statisticalJournal.setFieldValue('unitstype', '1');
									statisticalJournal.setFieldValue('memo', originatingTransaction);
									statisticalJournal.setFieldValue('trandate', transactionDate);
									statisticalJournal.setFieldValue('postingperiod', postingPeriod);
									statisticalJournal.setFieldValue('custbody_bbs_originating_transaction',originalJournalId);	
									
									//Loop through the summary values
									//
									for (var summaryValue in summaryValues) 
										{
											var summaryParts 	= summaryValue.split('|');
											var carrierId 		= summaryParts[0];
											var contractId 		= summaryParts[1];
											var groupId 		= summaryParts[2];
											var serviceId 		= summaryParts[3];
											var chargeId 		= summaryParts[4];
											var operationsId 	= summaryParts[5];
											var departmentId 	= summaryParts[6];
											var supplierId 		= summaryParts[7];
											var customerId 		= summaryParts[8];
											
											//See if we need to create a parcels line
											//
											if(summaryValues[summaryValue][0] != 0)
												{
													var postingValue = summaryValues[summaryValue][0];
	
													lineNo++;
													statisticalJournal.setLineItemValue('line', 'account', lineNo, accountParcels);
													statisticalJournal.setLineItemValue('line', 'debit', lineNo, postingValue); // field "debit" has label "Amount" in UI
													statisticalJournal.setLineItemValue('line', 'lineunit', lineNo, '1');       
													statisticalJournal.setLineItemValue('line', 'class', lineNo, carrierId);
													statisticalJournal.setLineItemValue('line', 'location', lineNo, contractId);
													statisticalJournal.setLineItemValue('line', 'custcol_cseg_bbs_prodgrp', lineNo, groupId);
													statisticalJournal.setLineItemValue('line', 'custcol_cseg_bbs_service', lineNo, serviceId);
													statisticalJournal.setLineItemValue('line', 'custcol_cseg_bbs_chrgetype', lineNo, chargeId);
													statisticalJournal.setLineItemValue('line', 'cseg_bbs_ops_method', lineNo, operationsId);
													statisticalJournal.setLineItemValue('line', 'entity', lineNo, entityId);
													statisticalJournal.setLineItemValue('line', 'department', lineNo, departmentId);
													statisticalJournal.setLineItemValue('line', 'cseg_bbs_supplier', lineNo, supplierId);
													statisticalJournal.setLineItemValue('line', 'cseg_bbs_customer', lineNo, customerId);
												}
											
											//See if we need to create a consignments line
											//
											if(summaryValues[summaryValue][1] != 0)
												{
													var postingValue = summaryValues[summaryValue][1];
	
													lineNo++;
													statisticalJournal.setLineItemValue('line', 'account', lineNo, accountConsignments);
													statisticalJournal.setLineItemValue('line', 'debit', lineNo, postingValue); // field "debit" has label "Amount" in UI
													statisticalJournal.setLineItemValue('line', 'lineunit', lineNo, '2');       
													statisticalJournal.setLineItemValue('line', 'class', lineNo, carrierId);
													statisticalJournal.setLineItemValue('line', 'location', lineNo, contractId);
													statisticalJournal.setLineItemValue('line', 'custcol_cseg_bbs_prodgrp', lineNo, groupId);
													statisticalJournal.setLineItemValue('line', 'custcol_cseg_bbs_service', lineNo, serviceId);
													statisticalJournal.setLineItemValue('line', 'custcol_cseg_bbs_chrgetype', lineNo, chargeId);
													statisticalJournal.setLineItemValue('line', 'cseg_bbs_ops_method', lineNo, operationsId);
													statisticalJournal.setLineItemValue('line', 'entity', lineNo, entityId);
													statisticalJournal.setLineItemValue('line', 'department', lineNo, departmentId);
													statisticalJournal.setLineItemValue('line', 'cseg_bbs_supplier', lineNo, supplierId);
													statisticalJournal.setLineItemValue('line', 'cseg_bbs_customer', lineNo, customerId);
												}
										}
									
									try
										{
											var statJournalId = nlapiSubmitRecord(statisticalJournal, true, true);
											
											nlapiLogExecution('DEBUG', 'Stat Journal Created Ok For Reversing Journal ' + originatingTransaction, '');
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error creating statistical journal', err.message);
										}
								}
						}
				}
		}
}

function getSummaryValues(_record, _summaryValues, _sublistName)
{
	var lines 		= _record.getLineItemCount(_sublistName);
	var multiplier 	= Number(-1);
	
	for (var int = 1; int <= lines; int++) 
		{
			var carrier 	= isNull(_record.getLineItemValue(_sublistName, 'class', int), '');
			var contract 	= isNull(_record.getLineItemValue(_sublistName, 'location', int), '');
			var group 		= isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_prodgrp', int), '');
			var service 	= isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_service', int), '');
			var charge 		= isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_chrgetype', int), '');
			var operations 	= isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_ops_method', int), '');
			var department 	= isNull(_record.getLineItemValue(_sublistName, 'department', int), '');
			var supplier 	= isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_supplier', int), '');
			var customer 	= isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_customer', int), '');
			
			var summaryKey = carrier + '|' + contract + '|' + group + '|' + service + '|' + charge + '|' + operations + '|' + department + '|' + supplier + '|' + customer;
			
			var parcels 		= Number(_record.getLineItemValue(_sublistName, 'custcol_bbs_parcels', int));
			var consignments 	= Number(_record.getLineItemValue(_sublistName, 'custcol_bbs_consignments', int));
			
			parcels 		= parcels * multiplier;
			consignments 	= consignments * multiplier;
			
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

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}
