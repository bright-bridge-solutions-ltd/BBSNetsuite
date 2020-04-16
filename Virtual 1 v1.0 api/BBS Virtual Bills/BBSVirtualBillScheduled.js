/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Feb 2020     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
		//Get the virtual bill to process
		//
		var virtualBillId = nlapiGetContext().getSetting('SCRIPT', 'custscript_bbs_vbill_id');			//Virtual bill id to process - passed from UE script
			
		var productGroupsSummary 	= {};
		var billingTypeSummary 		= {};
		var billingTypes 			= {};
		var productGroups 			= {};
			
		//Get the virtual bill lines to be processed
		//
		var billLinesToProcess = getVirtualBillLines(virtualBillId);
			
		if(billLinesToProcess != null && billLinesToProcess.length > 0)
			{
				//Process the billing lines - populates the billing type summary, product group summary, billing types & product groups objects
				//
				processLines(billLinesToProcess, billingTypeSummary, productGroupsSummary, billingTypes, productGroups);
					
				//Update the Virtual Bill header with the totals for each category
				//
				updateVirtualBill(virtualBillId, billingTypeSummary);
					
				//Create a Supplier Bill from the product groups summary (returns -1 if the bill cannot be updated, so a journal must be processed instead)
				//
				var supplierBillId = createSupplierBill(virtualBillId, productGroupsSummary, billingTypes, productGroups)
					
				//Update the virtual bill with the link to the supplier bill if appropriate
				//
				if(supplierBillId != null && supplierBillId != -1)
					{
						updateVirtualBillLinks(virtualBillId, supplierBillId);
					}
					
				//Process as a journal if required, i.e. the bill cannot be updated
				//
				if(supplierBillId == -1)
					{
						var journalId = createJournalRecord(virtualBillId, productGroupsSummary, billingTypes, productGroups);
						
						//Update the virtual bill with the link to the journal if appropriate
						//
						if(journalId != null && journalId != -1)
							{
								updateVirtualBillJournalLink(virtualBillId, journalId);
							}
					}
			}
}

function updateVirtualBillJournalLink(_virtualBillId, _journalId)
{
	checkResources();
	
	try
		{
			//Update the virtual bill
			//
			nlapiSubmitField('customrecord_bbs_virtual_bill', _virtualBillId, 'custrecord_bbs_linked_journal', _journalId, false);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error updating virtual bill with links to journal', err.message);
		}
}


function updateVirtualBillLinks(_virtualBillId, _supplierBillId)
{
	checkResources();
	
	try
		{
			//Get the total from the supplier bill
			//
			var billFields = nlapiLookupField('vendorbill', _supplierBillId, ['total','taxtotal'], false);
			var billTotal = Number(billFields['total']) + Number(billFields['taxtotal']);					//Taxtotal is negative
			
			//Update the virtual bill
			//
			nlapiSubmitField('customrecord_bbs_virtual_bill', _virtualBillId, ['custrecord_bbs_sup_inv','custrecord_bbs_sup_inv_amt'], [_supplierBillId, billTotal], false);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error updating virtual bill with links to supplier bill', err.message);
		}
}


function createJournalRecord(_virtualBillId, _productGroupsSummary, _billingTypes, _productGroups)
{
	checkResources();
	
	var context = nlapiGetContext();
	var reconciledOneOffAccountId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_oneoff_acc_id');		//Account - company preferences
	var reconciledRentalAccountId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_rental_acc_id');		//Account - company preferences
	var reconciledUsageAccountId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_usage_acc_id');		//Account - company preferences
	var unreconciledOneOffAccountId 	= context.getSetting('SCRIPT', 'custscript_bbs_unrec_oneoff_acc_id');	//Account - company preferences
	var unreconciledRentalAccountId 	= context.getSetting('SCRIPT', 'custscript_bbs_unrec_rental_acc_id');	//Account - company preferences
	var unreconciledUsageAccountId 		= context.getSetting('SCRIPT', 'custscript_bbs_unrec_usage_acc_id');	//Account - company preferences
	//var customFormId 					= context.getSetting('SCRIPT', 'custscript_bbs_form_id');				//Form to use for the supplier bill - company preferences
	var currentUser 					= context.getUser();
	var emailFromUser			 		= context.getSetting('SCRIPT', 'custscript_bbs_email_from');		//Employee - company preferences
	
	var journalId = null;
	var journalIsOkToProcess = true;
	
	var supplierFields 			= nlapiLookupField('customrecord_bbs_virtual_bill', _virtualBillId, ['custrecord_bbs_linked_journal','custrecord_bbs_sup_inv'], false);
	var existingSupplierBillId 	= supplierFields['custrecord_bbs_sup_inv'];
	var existingJournalId 		= supplierFields['custrecord_bbs_linked_journal'];
	
	try
		{
			var journalRecord = null;
		
			if(existingJournalId != null && existingJournalId != '')
				{
					//Get the existing journal
					//
					journalRecord = nlapiLoadRecord('journalentry', existingJournalId, {recordmode: 'dynamic'});
				
					//Get the status of the journal
					//
					var journalStatus = journalRecord.getFieldValue('status');
					
					//Get the posting period of the journal
					//
					var journalPostingPeriod = journalRecord.getFieldValue('postingperiod');
					
					//See if the posting period of the journal is still open
					//
					var isPeriodOpen = checkAccountingPeriod(journalPostingPeriod);
					
					//Ok to modify the journal if the journal is still open & the period is still open
					//
					if((journalStatus == 'Approved for Posting' || journalStatus == 'Pending Approval') && isPeriodOpen == true)
						{
							//Remove all of the existing lines
							//
							var itemLineCount = journalRecord.getLineItemCount('line');
							
							for(var int = itemLineCount; int > 0; int--)
								{
									journalRecord.removeLineItem('line', int);
								}
							
							journalIsOkToProcess = true;
						}
					else
						{
							journalIsOkToProcess = false;
						}
				}
			else
				{
					//Create the basic journal record
					//
					journalRecord = nlapiCreateRecord('journalentry', {recordmode: 'dynamic'});
					
					//Set some header fields
					//
					//journalRecord.setFieldValue('customform', customFormId);	
					journalRecord.setFieldValue('approvalstatus', 2);									//Approved
					journalRecord.setFieldValue('custbody_linked_virtual_bill', _virtualBillId);
					
					journalIsOkToProcess = true;
				}
			
			//Process the lines if we are ok to process
			//
			if(journalIsOkToProcess)
				{
					//_productGroupsSummary object will hold all of the summary info based on the contents of the virtual bill
					//We need to compare this with a summary based on the contents of the supplier bill
					//
				
					//Get the product group summary based on the supplier bill
					//
					var supplierBillProductGroupsSummary = generateSupplierBillProductGroupSummary(existingSupplierBillId);

					//Loop through the product group summary from the virtual bill & then compare to the product group summary from the 
					//existing supplier bill to get the difference
					//
					for ( var productGroupsSummaryKey in _productGroupsSummary) 
						{
							checkResources();
							
							var virtualBillValue = _productGroupsSummary[productGroupsSummaryKey];
							var supplierBillValue = supplierBillProductGroupsSummary[productGroupsSummaryKey];
							var differenceValue = virtualBillValue - supplierBillValue;
							
							var keyElements = productGroupsSummaryKey.split('|'); 	//[0] = Unreconciled/Reconciled, [1] = Billing Type (One Off, Rental, Usage), [2] = Product Group
							var productGroupSummaryValue = _productGroupsSummary[productGroupsSummaryKey];
							
							//Only bother to process items where the value is > 0
							//
							if(differenceValue != 0)
								{
									//Work out what account to use
									//
									var accountId = null;
									
									switch(keyElements[0] + keyElements[1])
										{
											case 'UnreconciledOne Off':
												accountId = unreconciledOneOffAccountId;
												break;
												
											case 'UnreconciledRental':
												accountId = unreconciledRentalAccountId;
												break;
												
											case 'UnreconciledUsage':
												accountId = unreconciledUsageAccountId;
												break;
												
											case 'ReconciledOne Off':
												accountId = reconciledOneOffAccountId;
												break;
												
											case 'ReconciledRental':
												accountId = reconciledRentalAccountId;
												break;
												
											case 'ReconciledUsage':
												accountId = reconciledUsageAccountId;
												break;
										}
									
									if(accountId != null)
										{
											journalRecord.selectNewLineItem('line');
											
											journalRecord.setCurrentLineItemValue('line', 'account', accountId);
											journalRecord.setCurrentLineItemValue('line', 'credit', differenceValue);
											journalRecord.setCurrentLineItemValue('line', 'class', _billingTypes[keyElements[1]]);
											
											//Conditionally set the product group
											//
											if(keyElements[2] != 'NONE')
												{
													journalRecord.setCurrentLineItemValue('line', 'cseg_bbs_product_gr', _productGroups[keyElements[2]]);
												}
											
											journalRecord.commitLineItem('line');
										}
								}
						}
					
					checkResources();
					
					//Save the record
					//
					journalId = nlapiSubmitRecord(journalRecord, true, true);
				}
			else
				{
					//The journal is not ok to process as it is either in the wrong state or the posting period is closed
					//At this point there is nothing else we can do apart from notify the user by email
					//
					
					if(currentUser != null && currentUser != '' && emailFromUser != null && emailFromUser != '')
						{
							var body = 'Unable to update the Journal record (id = ' + existingJournalId + ') for Virtual Bill (id = ' + _virtualBillId + ') as journal is in incorrect state, or posting period is closed';
							
							try
								{
									nlapiSendEmail(emailFromUser, currentUser, 'Failure to create/update journal for Virtual Bill', body, null, null, null, null, false, false, null);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Unable to send email to user', err.message);
								}
						}
				
					journalId = -1;
				}
		}
	catch(err)
		{
			journalId = null;
			nlapiLogExecution('ERROR', 'Error creating journal record', err.message);
		}
	
	return journalId;	
}

function generateSupplierBillProductGroupSummary(_existingSupplierBillId)
{
	var context = nlapiGetContext();
	var reconciledOneOffProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_oneoff_id');		//Item - company preferences
	var reconciledRentalProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_rental_id');		//Item - company preferences
	var reconciledUsageProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_usage_id');		//Item - company preferences
	var unreconciledOneOffProductId 	= context.getSetting('SCRIPT', 'custscript_bbs_unrec_oneoff_id');	//Item - company preferences
	var unreconciledRentalProductId 	= context.getSetting('SCRIPT', 'custscript_bbs_unrec_rental_id');	//Item - company preferences
	var unreconciledUsageProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_unrec_usage_id');	//Item - company preferences

	var supplierBillProductGroupsSummary 	= {};
	var dummyBillingTypes 					= {};
	var dummyProductGroups 					= {};
	
	//Set up the product group summary with all possible combinations
	//
	initProductGroupsSummary(supplierBillProductGroupsSummary, dummyBillingTypes, dummyProductGroups);
	
	//Get the supplier bill & process to update the product group summary
	//
	var existingBillRecord = null;
	
	try 
		{
			existingBillRecord = nlapiLoadRecord('vendorbill', _existingSupplierBillId);
		} 
	catch(err) 
		{
			existingBillRecord = null;
		}
	
	if(existingBillRecord != null)
		{
			var billLines 			= existingBillRecord.getLineItemCount('item');
			var reconciledItems 	= [reconciledOneOffProductId, reconciledRentalProductId, reconciledUsageProductId];
			var unreconciledItems 	= [unreconciledOneOffProductId, unreconciledRentalProductId, unreconciledUsageProductId];
			
			for(var billLine = 1; billLine <= billLines; billLine++)
				{
					//Get data from the line
					//
					var lineItem 			= existingBillRecord.getLineItemValue('item', 'item', billLine);
					var lineAmount 			= Number(existingBillRecord.getLineItemValue('item', 'amount', billLine));
					var lineProductGroup 	= existingBillRecord.getLineItemText('item', 'cseg_bbs_product_gr', billLine);
					var lineBillingType 	= existingBillRecord.getLineItemText('item', 'class', billLine);
					
					//Work out whether the item is reconciled or unreconciled
					//
					var lineReconStatus = (reconciledItems.indexOf(lineItem) != -1 ? 'Reconciled' : 'Unreconciled');
					
					//Construct the summary key
					//
					var lineKey = lineReconStatus + '|' + lineBillingType + '|' + lineProductGroup;
					
					supplierBillProductGroupsSummary[lineKey] += lineAmount;
				}
		}

	return supplierBillProductGroupsSummary;
}


function createSupplierBill(_virtualBillId, _productGroupsSummary, _billingTypes, _productGroups)
{
	checkResources();
	
	var context = nlapiGetContext();
	var reconciledOneOffProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_oneoff_id');		//Item - company preferences
	var reconciledRentalProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_rental_id');		//Item - company preferences
	var reconciledUsageProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_rec_usage_id');		//Item - company preferences
	var unreconciledOneOffProductId 	= context.getSetting('SCRIPT', 'custscript_bbs_unrec_oneoff_id');	//Item - company preferences
	var unreconciledRentalProductId 	= context.getSetting('SCRIPT', 'custscript_bbs_unrec_rental_id');	//Item - company preferences
	var unreconciledUsageProductId 		= context.getSetting('SCRIPT', 'custscript_bbs_unrec_usage_id');	//Item - company preferences
	var customFormId 					= context.getSetting('SCRIPT', 'custscript_bbs_form_id');			//Form to use for the supplier bill - company preferences
	
	var billId 					= null;
	var supplierFields 			= nlapiLookupField('customrecord_bbs_virtual_bill', _virtualBillId, ['custrecord_bbs_supplier','custrecord_bbs_sup_inv'], false);
	var supplierId 				= supplierFields['custrecord_bbs_supplier'];
	var existingSupplierBillId 	= supplierFields['custrecord_bbs_sup_inv'];
	var billIsOkToProcess 		= true;
	
	try
		{
			var supplierBillRecord = null;
		
			if(existingSupplierBillId != null && existingSupplierBillId != '')
				{
					//Get the existing supplier bill
					//
					supplierBillRecord = nlapiLoadRecord('vendorbill', existingSupplierBillId, {recordmode: 'dynamic'});
				
					//Get the status of the bill
					//
					var billStatus = supplierBillRecord.getFieldValue('status');
					
					//Get the posting period of the bill
					//
					var billPostingPeriod = supplierBillRecord.getFieldValue('postingperiod');
					
					//See if the posting period of the bill is still open
					//
					var isPeriodOpen = checkAccountingPeriod(billPostingPeriod);
					
					//Ok to modify the bill if the bill is still open & the period is still open
					//
					if(billStatus == 'Open' && isPeriodOpen == true)
						{
							//Remove all of the existing lines
							//
							var itemLineCount = supplierBillRecord.getLineItemCount('item');
							
							for(var int = itemLineCount; int > 0; int--)
								{
									supplierBillRecord.removeLineItem('item', int);
								}
							
							billIsOkToProcess = true;
						}
					else
						{
							billIsOkToProcess = false;
						}
				}
			else
				{
					//Create the basic supplier bill record
					//
					supplierBillRecord = nlapiCreateRecord('vendorbill', {recordmode: 'dynamic', entity: supplierId});
					
					//Set some header fields
					//
					supplierBillRecord.setFieldValue('customform', customFormId);	
					supplierBillRecord.setFieldValue('approvalstatus', 2);									//Approved
					supplierBillRecord.setFieldValue('tranid', 'From Virtual Bill #' + _virtualBillId);
					supplierBillRecord.setFieldValue('department', 1);										//Board
					supplierBillRecord.setFieldValue('custbody_linked_virtual_bill', _virtualBillId);
					
					billIsOkToProcess = true;
				}
			
			//Process the lines if we are ok to process
			//
			if(billIsOkToProcess)
				{
					for ( var productGroupsSummaryKey in _productGroupsSummary) 
						{
							checkResources();
							
							var keyElements = productGroupsSummaryKey.split('|'); 	//[0] = Unreconciled/Reconciled, [1] = Billing Type (One Off, Rental, Usage), [2] = Product Group
							var productGroupSummaryValue = _productGroupsSummary[productGroupsSummaryKey];
							
							//Only bother to process items where the value is > 0
							//
							if(productGroupSummaryValue > 0)
								{
									//Work out what product to use
									//
									var productId = null;
									
									switch(keyElements[0] + keyElements[1])
										{
											case 'UnreconciledOne Off':
												productId = unreconciledOneOffProductId;
												break;
												
											case 'UnreconciledRental':
												productId = unreconciledRentalProductId;
												break;
												
											case 'UnreconciledUsage':
												productId = unreconciledUsageProductId;
												break;
												
											case 'ReconciledOne Off':
												productId = reconciledOneOffProductId;
												break;
												
											case 'ReconciledRental':
												productId = reconciledRentalProductId;
												break;
												
											case 'ReconciledUsage':
												productId = reconciledUsageProductId;
												break;
										}
									
									if(productId != null)
										{
											supplierBillRecord.selectNewLineItem('item');
											
											supplierBillRecord.setCurrentLineItemValue('item', 'item', productId);
											supplierBillRecord.setCurrentLineItemValue('item', 'quantity', 1);
											supplierBillRecord.setCurrentLineItemValue('item', 'rate', _productGroupsSummary[productGroupsSummaryKey]);
											supplierBillRecord.setCurrentLineItemValue('item', 'class', _billingTypes[keyElements[1]]);
											
											//Conditionally set the product group
											//
											if(keyElements[2] != 'NONE')
												{
													supplierBillRecord.setCurrentLineItemValue('item', 'cseg_bbs_product_gr', _productGroups[keyElements[2]]);
												}
											
											supplierBillRecord.commitLineItem('item');
										}
								}
						}
					
					checkResources();
					
					//Save the record
					//
					billId = nlapiSubmitRecord(supplierBillRecord, true, true);
				}
			else
				{
					//Bill is not ok to process as it is either paid or the posting period is closed
					//Therefore we must create a journal
					//
					billId = -1;
				}
		}
	catch(err)
		{
			billId = null;
			nlapiLogExecution('ERROR', 'Error creating supplier bill', err.message);
		}
	
	return billId;
}


function checkAccountingPeriod(_billPostingPeriod)
{
	var isOpen = false;
	
	var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
			[
			   ["internalid","anyof",_billPostingPeriod], 
			   "AND", 
			   ["aplocked","is","F"], 
			   "AND", 
			   ["alllocked","is","F"], 
			   "AND", 
			   ["closed","is","F"]
			], 
			[
			   new nlobjSearchColumn("periodname").setSort(false)
			]
			);
	
	if(accountingperiodSearch != null && accountingperiodSearch.length == 1)
		{
			isOpen = true;
		}
	
	return isOpen;
}


function updateVirtualBill(_virtualBillId, _billingTypeSummary)
{
	checkResources();
	
	nlapiSubmitField(
					'customrecord_bbs_virtual_bill', 
					_virtualBillId, 
					[
					 'custrecord_bbs_unrec_usage','custrecord_bbs_unrec_oneoff','custrecord_bbs_unrec_rental','custrecord_bbs_unrec_amt_total',
					 'custrecord_bbs_rec_usage','custrecord_bbs_rec_oneoff','custrecord_bbs_rec_rental','custrecord_bbs_rec_amt_total'], 
					[
					 _billingTypeSummary['Usage'].unreconciled, 
					 _billingTypeSummary['One Off'].unreconciled, 
					 _billingTypeSummary['Rental'].unreconciled,
					 _billingTypeSummary['Usage'].unreconciled + _billingTypeSummary['One Off'].unreconciled + _billingTypeSummary['Rental'].unreconciled,
					 _billingTypeSummary['Usage'].reconciled, 
					 _billingTypeSummary['One Off'].reconciled, 
					 _billingTypeSummary['Rental'].reconciled,
					 _billingTypeSummary['Usage'].reconciled + _billingTypeSummary['One Off'].reconciled + _billingTypeSummary['Rental'].reconciled
					 ], 
					false
					);
}


function processLines(_billLinesToProcess, _billingTypeSummary, _productGroupsSummary, _billingTypes, _productGroups)
{
	//Init the object that is used to summarise by billing type
	//
	initBillingTypeSummary(_billingTypeSummary);
	
	//Init the object that is used to summarise by status(recon or unrecon) / billing type / custom segment
	//
	initProductGroupsSummary(_productGroupsSummary, _billingTypes, _productGroups);
	
	//Loop through the result lines
	//
	for (var int = 0; int < _billLinesToProcess.length; int++) 
		{
			checkResources();
			
			processResultLine(_billLinesToProcess[int], _billingTypeSummary, _productGroupsSummary, _productGroups);
		}

	
}


function processResultLine(_billLineToProcess, _billingTypeSummary, _productGroupsSummary, _productGroups)
{
	checkResources();
	
	//Get data from search results
	//
	var billLineAmount 		= Number(_billLineToProcess.getValue("custrecord_bbs_amount")); 
	var billLineAcc 		= _billLineToProcess.getValue("custrecord_bbs_acc_to_debit"); 
	var billLineMonth 		= _billLineToProcess.getValue("custrecord_bbs_months"); 
	var billLineProdGrp 	= _billLineToProcess.getText("custrecord_bbs_prod_group"); 
	var billLineRef 		= _billLineToProcess.getValue("custrecord_bbs_unique_ref"); 
	var billLineType 		= _billLineToProcess.getText("custrecord_bbs_vbl_type"); 
	var billLineSupplier	= _billLineToProcess.getValue("custrecord_bbs_supplier","CUSTRECORD_BBS_VB");
	var billLineId 			= _billLineToProcess.getId();
	
	//See if we can find a matching PO & line
	//
	var poFindResult = findMatchingPo(billLineSupplier, billLineRef, billLineAmount, billLineMonth);
	
	//
	//Process the results of searching for a PO
	//
	
	//If the bill line does not have a product group & there is one from the po line, then copy it into the billLineProdGrp variable
	//
	if((billLineProdGrp == null || billLineProdGrp == '') && poFindResult.poProductGroup != null && poFindResult.poProductGroup != '')
		{
			billLineProdGrp = poFindResult.poProductGroup;
		}
	
	//Update the virtual bill line with the status of the search & also the matching po & amount
	//
	try
		{
			nlapiSubmitField(
							'customrecord_bbs_vb_line', 
							billLineId, 
							['custrecord_bbs_vbl_status','custrecord_bbs_po_amt','custrecord_bbs_rel_po','custrecord_bbs_prod_group'], 
							[poFindResult.status, poFindResult.poAmount, poFindResult.poId, _productGroups[poFindResult.poProductGroup]], 
							false
							);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error updating Virtual Bill Line id = ' + billLineId, err.message);
		}
	
	//Update the product group summary info object
	//
	var productGroupSummaryKey = '';
	
	if(poFindResult.status == 1 ) //Reconciled
		{
			productGroupSummaryKey = 'Reconciled' + '|' + billLineType + '|' + billLineProdGrp;
		}
	else
		{
			productGroupSummaryKey = 'Unreconciled' + '|' + billLineType + '|' + 'NONE';
		}
	
	_productGroupsSummary[productGroupSummaryKey] += billLineAmount;
	
	//Update the billing type summary object
	//
	if(poFindResult.status == 1)	//Reconciled
		{
			_billingTypeSummary[billLineType].reconciled += billLineAmount;
		}
	else
		{
			_billingTypeSummary[billLineType].unreconciled += billLineAmount;
		}
}


function findMatchingPo(_billLineSupplier, _billLineRef, _billLineAmount, _billLineMonth)
{
	checkResources();
	
	//Run a search to find matching po line
	//
	var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
			[
			   ["type","anyof","PurchOrd"], 
			   "AND", 
			   ["mainline","is","F"], 
			   "AND", 
			   ["cogs","is","F"], 
			   "AND", 
			   ["shipping","is","F"], 
			   "AND", 
			   ["taxline","is","F"], 
			   "AND", 
			   ["vendor.internalid","anyof",_billLineSupplier], 
			    "AND", 
			   ["custbody_bbs_rec_unique_id","is",_billLineRef], 
			   "AND", 
			   ["custcol_po_month","anyof",_billLineMonth]
			], 
			[
			   new nlobjSearchColumn("custcol_po_month"), 
			   new nlobjSearchColumn("amount"), 
			   new nlobjSearchColumn("custbody_bbs_rec_unique_id"), 
			   new nlobjSearchColumn("item"), 
			   new nlobjSearchColumn("line.cseg_bbs_product_gr"), 
			   new nlobjSearchColumn("line"), 
			   new nlobjSearchColumn("lineuniquekey")
			]
			);

	var resultPoId 	= null;
	var resultPoLineId 	= null;
	var resultStatus 	= null;
	var resultProdGrp 	= null;
	var poLineAmount 	= Number(0);
	
	if(purchaseorderSearch != null && purchaseorderSearch.length > 0)
		{
			poLineAmount 		= Number(purchaseorderSearch[0].getValue('amount'));
			resultProdGrp 		= purchaseorderSearch[0].getText('line.cseg_bbs_product_gr');
			resultPoId			= purchaseorderSearch[0].getId();
			resultPoLineId		= purchaseorderSearch[0].getValue('lineuniquekey');
			
			if(poLineAmount == _billLineAmount)
				{
					resultStatus = 1;	//Reconciled - Bill Updated
				}
			else
				{
					resultStatus = 5;	//Unreconciled - Amount Mismatch
				}
		}
	else
		{
			resultStatus = 4;	//Unreconciled - No PO Found
		}
	
	return new poFindResultObj(resultPoId, resultPoLineId, resultStatus, poLineAmount, resultProdGrp);
}


function poFindResultObj(_poId, _poLineId, _status, _poLineAmount, _poProductGroup)
{
	this.poId 			= _poId;
	this.poLineId 		= _poLineId;
	this.status 		= _status;
	this.poAmount 		= _poLineAmount;
	this.poProductGroup	= _poProductGroup;
}


function initProductGroupsSummary(_productGroupsSummary, _billingTypes, _productGroups)
{
	checkResources();
	
	var billStatus = ['Reconciled','Unreconciled'];
	
	//Find all the billing types
	//
	var classificationSearch = nlapiSearchRecord("classification",null,
			[
			], 
			[
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
	
	//Find all product groups
	//
	var productGroupSearch = nlapiSearchRecord("customrecord_cseg_bbs_product_gr",null,
			[
			], 
			[
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
	
	//Main loop through the statuses
	//
	for (var int = 0; int < billStatus.length; int++) 
		{
			var status = billStatus[int];

			//Loop through the billing types
			//
			for (var int1 = 0; int1 < classificationSearch.length; int1++) 
				{
					var billingTypeId = classificationSearch[int1].getId();
					var billingTypeName = classificationSearch[int1].getValue('name');
					_billingTypes[billingTypeName] = billingTypeId;
					
					//Loop through the product groups
					//
					if(status == 'Reconciled')
						{
							for (var int2 = 0; int2 < productGroupSearch.length; int2++) 
								{
									var productGroupId = productGroupSearch[int2].getId();
									var productGroupName = productGroupSearch[int2].getValue('name');
									_productGroups[productGroupName] = productGroupId;
									
									var key = status + '|' + billingTypeName + '|' + productGroupName;
									
									_productGroupsSummary[key] = Number(0);
								}
						}
					else
						{
							var key = status + '|' + billingTypeName + '|' + 'NONE';
						
							_productGroupsSummary[key] = Number(0);
						}
				}
		}
}


function initBillingTypeSummary(_billingTypeSummary)
{
	checkResources();
	
	//Find all the billing types
	//
	var classificationSearch = nlapiSearchRecord("classification",null,
			[
			], 
			[
			   new nlobjSearchColumn("name").setSort(false)
			]
			);
	
	//For each billing type create an entry in the billing summary object
	//
	if(classificationSearch != null && classificationSearch.length > 0)
		{
			for (var int = 0; int < classificationSearch.length; int++) 
				{
					var billingTypeId = classificationSearch[int].getId();
					var billingTypeName = classificationSearch[int].getValue('name');
					
					_billingTypeSummary[billingTypeName] = new billingTypeObject(billingTypeId, billingTypeName);
				}
		}
}


function billingTypeObject(_id, _name)
{
	this.reconciled 	= Number(0);
	this.unreconciled 	= Number(0);
	this.name 			= _name;
	this.id 			= _id;
}


function getVirtualBillLines(_id)
{
	checkResources();
	
	var customrecord_bbs_vb_lineSearch = nlapiSearchRecord("customrecord_bbs_vb_line",null,
			[
			   ["custrecord_bbs_vb","anyof",_id]
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_amount"), 
			   new nlobjSearchColumn("custrecord_bbs_acc_to_debit"), 
			   new nlobjSearchColumn("custrecord_bbs_months"), 
			   new nlobjSearchColumn("custrecord_bbs_po_amt"), 
			   new nlobjSearchColumn("custrecord_bbs_prod_group"), 
			   new nlobjSearchColumn("custrecord_bbs_rel_bill"), 
			   new nlobjSearchColumn("custrecord_bbs_rel_po"), 
			   new nlobjSearchColumn("custrecord_bbs_vbl_status"), 
			   new nlobjSearchColumn("custrecord_bbs_vbl_type"), 
			   new nlobjSearchColumn("custrecord_bbs_unique_ref"), 
			   new nlobjSearchColumn("custrecord_bbs_vb"),
			   new nlobjSearchColumn("custrecord_bbs_supplier","CUSTRECORD_BBS_VB",null),
			   new nlobjSearchColumn("internalid").setSort(false)
			]
			);

	return customrecord_bbs_vb_lineSearch;
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


function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}