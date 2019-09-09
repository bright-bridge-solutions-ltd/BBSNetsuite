/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Mar 2019     cedricgriffiths
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
function statisticalJournalsAS(type)
{
	
	if(type == 'create' || type == 'edit')
		{
			var processedRecord = nlapiGetNewRecord();
			var processedRecordType = processedRecord.getRecordType();
			
			//Pre-processing of credit notes to make the parcel & consignment values -ve
			//
			if(processedRecordType == 'creditmemo')
				{
					var itemLineCount = processedRecord.getLineItemCount('item');
					
					for (var int = 1; int <= itemLineCount; int++) 
						{
							var parcels = Number(processedRecord.getLineItemValue('item', 'custcol_bbs_parcels', int));
							var consignments = Number(processedRecord.getLineItemValue('item', 'custcol_bbs_consignments', int));
						
							parcels = Math.abs(parcels) * -1.0;
							consignments = Math.abs(consignments) * -1.0;
							
							processedRecord.setLineItemValue('item', custcol_bbs_parcels, int, parcels);
							processedRecord.setLineItemValue('item', custcol_bbs_consignments, int, parcels);
						}
					
					nlapiSubmitRecord(processedRecord, false, true);
				}

			//Pre-processing of journals to make the parcel & consignment values -ve
			//
			if(processedRecordType == 'journalentry')
				{
					var itemLineCount = processedRecord.getLineItemCount('line');
					var reversingJournal = processedRecord.getFieldValue('isreversal');
					
					var updated = false;
					
					for (var int = 1; int <= itemLineCount; int++) 
						{
							var parcels = Number(processedRecord.getLineItemValue('line', 'custcol_bbs_parcels', int));
							var consignments = Number(processedRecord.getLineItemValue('line', 'custcol_bbs_consignments', int));
							var accountType = processedRecord.getLineItemValue('line', 'accounttype', int);
							var debitValue = processedRecord.getLineItemValue('line', 'debit', int);
							var creditValue = processedRecord.getLineItemValue('line', 'credit', int);
							
							//Make the parcels & consigments -ve if we are on an income account & the value on the line is a debit
							//or if the journal is a reversal, we are on an income account & the value is a credit
							//
							if(	(accountType = 'Income' && reversingJournal != 'T' && debitValue != null && debitValue != '')
								|| 
								(accountType = 'Income' && reversingJournal != 'F' && creditValue != null && creditValue != '')
								)
								{
									updated = true;
									
									parcels = Math.abs(parcels) * -1.0;
									consignments = Math.abs(consignments) * -1.0;
									
									processedRecord.setLineItemValue('line', custcol_bbs_parcels, int, parcels);
									processedRecord.setLineItemValue('line', custcol_bbs_consignments, int, parcels);
								}
						}
					
					if(updated)
						{
							nlapiSubmitRecord(processedRecord, false, true);
						}
				}
		}
	
	
	
	//Only interested in create, edit or delete mode
	//
	if(type == 'create' || type == 'edit' || type == 'delete')
		{
			//Get the parameters
			//
			var context = nlapiGetContext();
			var accountParcels = context.getSetting('SCRIPT', 'custscript_bbs_acc_parcel');
			var accountConsignments = context.getSetting('SCRIPT', 'custscript_bbs_acc_cons');
			
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
			
			if(type == 'edit' || type == 'delete')
				{
					oldRecord = nlapiGetOldRecord();
				}
			
			if(type == 'create' || type == 'edit')
				{
					newRecord = nlapiGetNewRecord();
				}
			
			//Get info on the new version of the record
			//
			if(type == 'delete')
				{
					recordType = oldRecord.getRecordType();
					recordId = oldRecord.getId();
				}
			else
				{
					recordType = newRecord.getRecordType();
					recordId = newRecord.getId();
				}
			
			//Get the subsidiary, originating transaction id etc
			//
			if(type == 'delete')
				{
					subsidiaryId = oldRecord.getFieldValue('subsidiary');
					originatingTransaction = oldRecord.getFieldValue('tranid');
					transactionDate = oldRecord.getFieldValue('trandate');
					postingPeriod = oldRecord.getFieldValue('postingperiod');

					
				}
			else
				{
					subsidiaryId = newRecord.getFieldValue('subsidiary');
					originatingTransaction = newRecord.getFieldValue('tranid');
					transactionDate = newRecord.getFieldValue('trandate');
					postingPeriod = newRecord.getFieldValue('postingperiod');

				}
			
			//Journal record type
			//
			if(recordType == 'journalentry')
				{
					sublistName = 'line';
				}
			else
				{
					if(type == 'delete')
						{
							entityId = oldRecord.getFieldValue('entity');
						}
					else
						{
							entityId = newRecord.getFieldValue('entity');
						}
					
					sublistName = 'item';
				}
			
			//Get the summary values from the new version of the record
			//
			if(type != 'delete')
				{
					getSummaryValues(newRecord, 'N', summaryValues, sublistName);
				}
			
			//If in edit or delete mode we need to get the old version of the record
			//
			if(type == 'edit' || type == 'delete')
				{
					getSummaryValues(oldRecord, 'O', summaryValues, sublistName);
				}
		
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
							
							// Not needed now as credit memos will have -ve values 
							//
							//		if(recordType == 'creditmemo')
							//			{
							//				postingValue = postingValue * Number(-1.0);
							//			}

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
									
							// Not needed now as credit memos will have -ve values 
							//
							//		if(recordType == 'creditmemo')
							//			{
							//				postingValue = postingValue * Number(-1.0);
							//			}

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


function getSummaryValues(_record, _type, _summaryValues, _sublistName)
{
	var lines = _record.getLineItemCount(_sublistName);
	var multiplier = Number(1);
	
	for (var int = 1; int <= lines; int++) 
		{
			var carrier = isNull(_record.getLineItemValue(_sublistName, 'class', int), '');
			var contract = isNull(_record.getLineItemValue(_sublistName, 'location', int), '');
			var group = isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_prodgrp', int), '');
			var service = isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_service', int), '');
			var charge = isNull(_record.getLineItemValue(_sublistName, 'custcol_cseg_bbs_chrgetype', int), '');
			var operations = isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_ops_method', int), '');
			var department = isNull(_record.getLineItemValue(_sublistName, 'department', int), '');
			var supplier = isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_supplier', int), '');
			var customer = isNull(_record.getLineItemValue(_sublistName, 'cseg_bbs_customer', int), '');
			
			var summaryKey = carrier + '|' + contract + '|' + group + '|' + service + '|' + charge + '|' + operations + '|' + department + '|' + supplier + '|' + customer;
			
			var parcels = Number(_record.getLineItemValue(_sublistName, 'custcol_bbs_parcels', int));
			var consignments = Number(_record.getLineItemValue(_sublistName, 'custcol_bbs_consignments', int));
			
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