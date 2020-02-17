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
	var context = nlapiGetContext();
	var virtualBillId = context.getSetting('SCRIPT', 'custscript_bbs_vbill_id');
	
	//Get the virtual bill lines to be processed
	//
	var billLinesToProcess = getVirtualBillLines(virtualBillId);
	
	if(billLinesToProcess != null && billLinesToProcess.length > 0)
		{
			//Process the billing lines
			//
			processLines(billLinesToProcess);
		}
}

function processLines(_billLinesToProcess)
{
	var productGroupsSummary = {};
	var billingTypeSummary = {};
	
	//Init the object that is used to summarise by billing type
	//
	initBillingTypeSummary(billingTypeSummary);
	
	//Init the object that is used to summarise by status(recon or unrecon) / billing type / custom segment
	//
	initProductGroupsSummary(productGroupsSummary);
	
	//Loop through the result lines
	//
	for (var int = 0; int < _billLinesToProcess.length; int++) 
		{
			checkResources();
			
			processResultLine(_billLinesToProcess[int], billingTypeSummary, productGroupsSummary);
		}

	
}

function processResultLine(_billLineToProcess, _billingTypeSummary, _productGroupsSummary)
{
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
	
	
	
	
}

function findMatchingPo(_billLineSupplier, _billLineRef, _billLineAmount, _billLineMonth)
{
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

function initProductGroupsSummary(_productGroupsSummary)
{
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
					
					//Loop through the product groups
					//
					for (var int2 = 0; int2 < productGroupSearch.length; int2++) 
						{
							var productGroupId = productGroupSearch[int2].getId();
							var productGroupName = productGroupSearch[int2].getValue('name');
							
							var key = status + '|' + billingTypeName + '|' + productGroupName;
							
							_productGroupsSummary[key] = Number(0);
						}
				}
		}
}



function initBillingTypeSummary(_billingTypeSummary)
{
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
					
					_billingTypeSummary[billingTypeId] = new billingTypeObject(billingTypeId, billingTypeName);
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