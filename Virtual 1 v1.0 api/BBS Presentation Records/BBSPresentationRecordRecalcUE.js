/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jun 2019     cedricgriffiths
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
function prRecordRecalcUE(type)
{
	if(type == 'edit' || type == 'delete')
		{
			//Get some basic details
			//
			var oldRecord = nlapiGetOldRecord();
			var oldRecordId = oldRecord.getId();
			var oldRecordType = oldRecord.getRecordType();
			var presentationId = oldRecord.getFieldValue('custbody_bbs_pr_id');
			
			var prTotalAmount = Number(0);
			var prTotalTaxAmount = Number(0);
			var prPaidAmount = Number(0);
			var prPaidAmountRemaining = Number(0);
			var prDisputedAmount = Number(0);
			
			//Does this transaction have a pr linked to it?
			//
			if(presentationId != null && presentationId != '')
				{
					//Search for all transactions linked to the pr
					//
					var transactionSearch = getResults(nlapiCreateSearch("transaction",
							[
							   ["type","anyof","CustInvc","CustCred"], 
							   "AND", 
							   ["custbody_bbs_pr_id","anyof",presentationId], 
							   "AND", 
							   ["mainline","is","T"]
							], 
							[
							   new nlobjSearchColumn("trandate"), 
							   new nlobjSearchColumn("tranid").setSort(false), 
							   new nlobjSearchColumn("entity"), 
							   new nlobjSearchColumn("amount"), 
							   new nlobjSearchColumn("grossamount"), 
							   new nlobjSearchColumn("netamountnotax"), 
							   new nlobjSearchColumn("netamount"), 
							   new nlobjSearchColumn("taxtotal"), 
							   new nlobjSearchColumn("amountremaining"), 
							   new nlobjSearchColumn("custbody_bbs_disputed")
							]
							));
					
					//Do we have any results to process?
					//
					if(transactionSearch != null && transactionSearch.length > 0)
						{
							//Sum up all of the transaction values
							//
							for (var int = 0; int < array.length; int++) 
								{
									var transAmountGross = Number(transactionSearch[int].getValue("grossamount"));
									var transAmountNetTax = Number(transactionSearch[int].getValue("netamountnotax"));
									var transAmountTax = Number(transactionSearch[int].getValue("taxtotal"));
									var transAmountRemaining = Number(transactionSearch[int].getValue("amountremaining"));
									var transDisputed = transactionSearch[int].getValue("custbody_bbs_disputed");
									var transAmountPaid = transAmountGross - transAmountRemaining;
									
									//Calculate totals for the PR record
									//
									prTotalAmount += transactionTotal;
									prTotalTaxAmount += transactionTaxTotal;
									prPaidAmount += transAmountPaid;
									prPaidAmountRemaining += transAmountRemaining;
									
									if(transactionDisputed == 'T')
										{
											prDisputedAmount += transactionTotal;
										}
									
								}
						}
					
					//Update the pr record
					//
					var fieldArray = [];
					var valuesArray = [];
					
					switch(oldRecordType)
						{
							case 'creditmemo':
								
								fieldArray = ['custrecord_bbs_pr_cn_total','custrecord_bbs_pr_cn_tax_total','custrecord_bbs_pr_cn_applied','custrecord_bbs_pr_cn_unapplied'];
								valuesArray = [prTotalAmount,prTotalTaxAmount,prPaidAmount,prPaidAmountRemaining];
								
								break;
								
							case 'invoice':
								
								fieldArray = ['custrecord_bbs_pr_inv_total','custrecord_bbs_pr_inv_disputed','custrecord_bbs_pr_inv_tax_total','custrecord_bbs_pr_inv_paid'];
								valuesArray = [prTotalAmount,prDisputedAmount,prTotalTaxAmount,prPaidAmount];
								
								break;
						}
					
					try
						{
							nlapiSubmitField('customrecord_bbs_presentation_record', presentationId, fieldArray, valuesArray, true);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Error updating PR record, ID = ' + presentationId, err.message);
						}
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