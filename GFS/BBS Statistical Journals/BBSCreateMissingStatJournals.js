/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2020     cedricgriffiths
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
	var context = nlapiGetContext();
	var accountParcels = context.getSetting('SCRIPT', 'custscript_bbs_acc_parcel');
	var accountConsignments = context.getSetting('SCRIPT', 'custscript_bbs_acc_cons');
	
	
	var journalArray = [
						'JN10002753',
						'JN10003914',
						'JN10003915',
						'JN10004351',
						'JN10004352',
						'JN10005335',
						'JN10005345',
						'JN10005350',
						'JN10005352',
						'JN10005353',
						'JN10006998',
						'JN10006999',
						'JN10007026',
						'JN10007027',
						'JN10007028',
						'JN10007029',
						'JN10007091',
						'JN10007092',
						'JN10007799',
						'JN10007800',
						'JN10009228',
						'JN10009229',
						'JN10009296',
						'JN10009297',
						'JN10009429',
						'JN10009430',
						'JN10009835',
						'JN10009836',
						'JN10009922',
						'JN10009923',
						'JN10009940',
						'JN10009941',
						'JN10009983',
						'JN10009984',
						'JN10010061',
						'JN10010062',
						'JN10010068',
						'JN10010069',
						'JN10012803',
						'JN10012804',
						'JN10012980',
						'JN10012981',
						'JN10013436',
						'JN10013437',
						'JN10013440',
						'JN10013441',
						'JN10013443',
						'JN10013444',
						'JN10015014',
						'JN10015015',
						'JN10015111',
						'JN10015112',
						'JN10016026',
						'JN10016027',
						'JN10016187',
						'JN10016188',
						'JN10016269',
						'JN10016270',
						'JN10016581',
						'JN10016582',
						'JN10016762',
						'JN10016763',
						'JN10019350',
						'JN10019351',
						'JN10019461',
						'JN10019462',
						'JN10019529',
						'JN10019530',
						'JN10019582',
						'JN10019583',
						'JN10019622',
						'JN10019623',
						'JN10019673',
						'JN10019674',
						'JN10020051',
						'JN10020052',
						'JN10022418',
						'JN10022419',
						'JN10022427',
						'JN10022428',
						'JN10022475',
						'JN10022476',
						'JN10022571',
						'JN10022572',
						'JN10022966',
						'JN10022967',
						'JN10025303',
						'JN10025545',
						'JN10026081',
						'JN10026157',
						'JN10026163'
						];
	
	for (var int = 0; int < journalArray.length; int++) 
		{
			checkResources();
		
			var journalentrySearch = nlapiSearchRecord("journalentry",null,
					[
					   ["type","anyof","Journal"], 
					   "AND", 
					   ["line","equalto","0"], 
					   "AND", 
					   ["numbertext","is",journalArray[int]]
					], 
					[
					   new nlobjSearchColumn("internalid")
					]
					);
			
			if(journalentrySearch != null && journalentrySearch.length == 1)
				{
					//Pre-processing of journals to make the parcel & consignment values -ve
					//
					var journalRecord = null;
				
					try
						{
							journalRecord = nlapiLoadRecord('journalentry', journalentrySearch[0].getId());
					
						}
					catch(err)
						{
							journalRecord = null;
							nlapiLogExecution('ERROR', 'Error loading financial journal id = ' + journalentrySearch[0].getId(), err.message);
						}
					
					if(journalRecord != null)
						{
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
									nlapiSubmitRecord(journalRecord, true, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving financial journal id = ' + journalentrySearch[0].getId(), err.message);
									journalRecord = null;
								}
							
							
							
							
							if(journalRecord != null)
								{
									checkResources();
									
									//Init variables
									//
									var oldRecord = null;
									var newRecord = null;
									var recordType = null;
									var recordId = null;
									var summaryValues = {};
									var subsidiaryId = null;
									var entityId = null;
									var recordType = null;
									var sublistName = null;
									var originatingTransaction = null;
									var transactionDate = null;
									var postingPeriod = null;
									var supplierSegment = null;
									var customerSegment = null;
									
									newRecord = journalRecord;

									
									//Get info on the new version of the record
									//
									recordType = newRecord.getRecordType();
									recordId = newRecord.getId();

									subsidiaryId = newRecord.getFieldValue('subsidiary');
									originatingTransaction = newRecord.getFieldValue('tranid');
									transactionDate = newRecord.getFieldValue('trandate');
									postingPeriod = newRecord.getFieldValue('postingperiod');
									sublistName = 'line';
									
									
									//Get the summary values from the new version of the record
									//
									getSummaryValues(newRecord, 'N', summaryValues, sublistName);
									
									
									//See if we need to create a statistical journal
									//
									var createJournal = false;
									
									for ( var summaryValue in summaryValues) 
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
											statisticalJournal.setFieldValue('custbody_bbs_originating_transaction',recordId);
											
											//Loop through the summary values
											//
											for ( var summaryValue in summaryValues) 
												{
													var summaryParts = summaryValue.split('|');
													var carrierId = summaryParts[0];
													var contractId = summaryParts[1];
													var groupId = summaryParts[2];
													var serviceId = summaryParts[3];
													var chargeId = summaryParts[4];
													var operationsId = summaryParts[5];
													var departmentId = summaryParts[6];
													var supplierId = summaryParts[7];
													var customerId = summaryParts[8];
													
													//See if we need to create a parcels line
													//
													if(summaryValues[summaryValue][0] != 0)
														{
															var postingValue = summaryValues[summaryValue][0];
															
														//	if(recordType == 'creditmemo')
														//		{
														//			postingValue = postingValue * Number(-1.0);
														//		}
	
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
															
														//	if(recordType == 'creditmemo')
														//		{
														//			postingValue = postingValue * Number(-1.0);
														//		}
	
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
													nlapiSubmitRecord(statisticalJournal, true, true);
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
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}