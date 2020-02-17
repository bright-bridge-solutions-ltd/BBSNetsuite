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
	
	var productGroupsSummary = {};
	var billingTypeSummary = {};
	var billingTypes = {};
	var productGroups = {};
	
	//Get the virtual bill lines to be processed
	//
	var billLinesToProcess = getVirtualBillLines(virtualBillId);
	
	if(billLinesToProcess != null && billLinesToProcess.length > 0)
		{
			//Process the billing lines
			//
			processLines(billLinesToProcess, billingTypeSummary, productGroupsSummary, billingTypes, productGroups);
			
			//Update the Virtual Bill header with the totals for each category
			//
			updateVirtualBill(virtualBillId, billingTypeSummary);
			
			//Create a Supplier Bill from the product groups summary
			//
			var supplierBillId = createSupplierBill(virtualBillId, productGroupsSummary, billingTypes, productGroups)
			
			//Update the virtual bill with the link to the supplier bill
			//
			if(supplierBillId != null)
				{
					updateVirtualBillLinks(virtualBillId, supplierBillId);
				}
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
	
	var billId = null;
	var supplierFields = nlapiLookupField('customrecord_bbs_virtual_bill', _virtualBillId, ['custrecord_bbs_supplier','custrecord_bbs_sup_inv'], false);
	var supplierId = supplierFields['custrecord_bbs_supplier'];
	var existingSupplierBillId = supplierFields['custrecord_bbs_sup_inv'];
	var billIsOkToProcess = true;
	
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
											supplierBillRecord.setCurrentLineItemValue('item', 'cseg_bbs_product_gr', _productGroups[keyElements[2]]);
											supplierBillRecord.setCurrentLineItemValue('item', 'class', _billingTypes[keyElements[1]]);
											
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
				
				
					//TODO
				
				
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
					 _billingTypeSummary['Usage'].unreconciled, _billingTypeSummary['One Off'].unreconciled, _billingTypeSummary['Rental'].unreconciled,
					 _billingTypeSummary['Usage'].unreconciled + _billingTypeSummary['One Off'].unreconciled + _billingTypeSummary['Rental'].unreconciled,
					 _billingTypeSummary['Usage'].reconciled, _billingTypeSummary['One Off'].reconciled, _billingTypeSummary['Rental'].reconciled,
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
			
			processResultLine(_billLinesToProcess[int], _billingTypeSummary, _productGroupsSummary);
		}

	
}

function processResultLine(_billLineToProcess, _billingTypeSummary, _productGroupsSummary)
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
	
	//Process the results of searching for a PO
	//
	
	//Update the virtual bill line with the status of the search & also the matching po & amount
	//
	try
		{
			nlapiSubmitField(
							'customrecord_bbs_vb_line', 
							billLineId, 
							['custrecord_bbs_vbl_status','custrecord_bbs_po_amt','custrecord_bbs_rel_po'], 
							[poFindResult.status, poFindResult.poAmount, poFindResult.poId], 
							false
							);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error updating Virtual Bill Line id = ' + billLineId, err.message);
		}
	
	//Update the product group summary info object
	//
	var productGroupSummaryKey = (poFindResult.status == 1 ? 'Reconciled' : 'Unreconciled') + '|' + billLineType + '|' + billLineProdGrp;
	
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

	var resultPoId = null;
	var resultPoLineId = null;
	var resultStatus = null;
	var resultProdGrp = null;
	var poLineAmount = Number(0);
	
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
	
	return new poFindResultObj(resultPoId, resultPoLineId, resultStatus, poLineAmount);
}

function poFindResultObj(_poId, _poLineId, _status, _poLineAmount)
{
	this.poId = _poId;
	this.poLineId = _poLineId;
	this.status = _status;
	this.poAmount = _poLineAmount;
}

function initProductGroupsSummary(_productGroupsSummary, _billingTypes, _productGroups)
{
	checkResources();
	
	var billStatus = ['Unreconciled', 'Reconciled'];
	
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
					for (var int2 = 0; int2 < productGroupSearch.length; int2++) 
						{
							var productGroupId = productGroupSearch[int2].getId();
							var productGroupName = productGroupSearch[int2].getValue('name');
							_productGroups[productGroupName] = productGroupId;
							
							var key = status + '|' + billingTypeName + '|' + productGroupName;
							
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
	this.reconciled = Number(0);
	this.unreconciled = Number(0);
	this.name = _name;
	this.id = _id;
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
			   new nlobjSearchColumn("custrecord_bbs_supplier","CUSTRECORD_BBS_VB",null)
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