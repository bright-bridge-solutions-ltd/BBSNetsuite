/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Aug 2017     cedricgriffiths
 *
 */
function libCreateSession()
{
	var uniqueId = Number(Date.now()).toFixed(0).toString();
	
	var paramsRecord = nlapiCreateRecord('customrecord_bbs_internal_params');
	paramsRecord.setFieldValue('custrecord_bbs_params_id', uniqueId);
	var sessionId = nlapiSubmitRecord(paramsRecord, false, true);
	
	return sessionId;
}

function libGetSessionData(sessionId)
{
	var sessionRecord = nlapiLoadRecord('customrecord_bbs_internal_params', sessionId);
	var data = null;
	
	if (sessionRecord)
		{
			data = sessionRecord.getFieldValue('custrecord_bbs_params_data');
		}
	
	return data;
}

function libSetSessionData(sessionId, sessionData)
{
	var sessionRecord = nlapiLoadRecord('customrecord_bbs_internal_params', sessionId);
	
	if (sessionRecord)
		{
			sessionRecord.setFieldValue('custrecord_bbs_params_data', sessionData);
			
			nlapiSubmitRecord(sessionRecord, false, true);
		}
}

function libClearSessionData(sessionId)
{
	nlapiDeleteRecord('customrecord_bbs_internal_params', sessionId);
}

function libEmailFiles(ddBatchId)
{
	
	//Get the email template id from the general preferences
	//
	var ddEmailTemplateId = nlapiGetContext().getPreference('custscript_bbs_dd_email_template');
	var currentUser = nlapiGetContext().getUser();
	var executionContext = nlapiGetContext().getExecutionContext();
	
	//Get the return email address from company setup page
	//
	var companyConfig = null;
	var returnEmail = null;
	
	companyConfig = nlapiLoadConfiguration('companyinformation');
	returnEmail = companyConfig.getFieldValue('email');
	returnEmail = (returnEmail == '' ? null : returnEmail);


	//Have we got an email template set up?
	//
	if(ddEmailTemplateId != null && ddEmailTemplateId != '')
		{
			//Find files attached to the PR record
			//
			var customrecord_bbs_dd_batchSearch = nlapiSearchRecord("customrecord_bbs_dd_batch",null,
					[
					   ["file.internalid","noneof","@NONE@"],
					   "AND",
					   ["internalid","anyof",ddBatchId]
					], 
					[
					   new nlobjSearchColumn("name").setSort(false), 
					   new nlobjSearchColumn("description","file",null), 
					   new nlobjSearchColumn("folder","file",null), 
					   new nlobjSearchColumn("internalid","file",null), 
					   new nlobjSearchColumn("name","file",null), 
					   new nlobjSearchColumn("filetype","file",null),
					   new nlobjSearchColumn("email","CUSTRECORD_BBS_DD_PARTNER",null)
					]
					);
			
			//Have we got any results?
			//
			if(customrecord_bbs_dd_batchSearch != null && customrecord_bbs_dd_batchSearch.length > 0)
				{
					var attachments = [];
					var emailTo = null;
					
					//Loop through the results
					//
					for (var int = 0; int < customrecord_bbs_dd_batchSearch.length; int++) 
						{
							var fileId = customrecord_bbs_dd_batchSearch[int].getValue("internalid","file");
							var attachedFile = nlapiLoadFile(fileId);
							attachments.push(attachedFile);
							
							emailTo = customrecord_bbs_dd_batchSearch[int].getValue("email","CUSTRECORD_BBS_DD_PARTNER");
						}
					
					if(emailTo != null)
						{
							var emailMerger = nlapiCreateEmailMerger(ddEmailTemplateId);
							emailMerger.setCustomRecord('customrecord_bbs_dd_batch', ddBatchId);
							var mergeResult = emailMerger.merge();
							
							if(mergeResult != null)
								{
									var emailSubject = mergeResult.getSubject();
									var emailBody = mergeResult.getBody();
								
									try
										{
											nlapiSendEmail(currentUser, emailTo, emailSubject, emailBody, null, null, null, attachments, true, false, returnEmail);
											
											var prRecord = nlapiLoadRecord('customrecord_bbs_dd_batch', ddBatchId);
											
											//Update the pr status
											//
											prRecord.setFieldValue('custrecord_bbs_dd_internal_status', '4'); //Documents emailed
										
											nlapiSubmitRecord(prRecord, false, true); //2GU's
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Failed to email DD id = ' + ddBatchId, err.message);
										}
								}
						}
				}
		}
}

function libRecalcPresentationRecord(presentationId)
{
	var prTotalAmount = Number(0);
	var prTotalTaxAmount = Number(0);
	var prPaidAmount = Number(0);
	var prPaidAmountRemaining = Number(0);
	var prDisputedAmount = Number(0);
	
	//Search for all transactions linked to the pr
	//
	var transactionSearch = libGetResults(nlapiCreateSearch("transaction",
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
			   new nlobjSearchColumn("type"), 
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
			for (var int = 0; int < transactionSearch.length; int++) 
				{
					var transAmountGross = Math.abs(Number(transactionSearch[int].getValue("grossamount")));
					var transAmountNetTax = Math.abs(Number(transactionSearch[int].getValue("netamountnotax")));
					var transAmountTax = Math.abs(Number(transactionSearch[int].getValue("taxtotal")));
					var transAmountRemaining = Math.abs(Number(transactionSearch[int].getValue("amountremaining")));
					var transDisputed = transactionSearch[int].getValue("custbody_bbs_disputed");
					var transAmountPaid = transAmountGross - transAmountRemaining;
					var transType = transactionSearch[int].getValue("type");
					
					//Calculate totals for the PR record
					//
					prTotalAmount += transAmountGross;
					prTotalTaxAmount += transAmountTax;
					prPaidAmount += transAmountPaid;
					prPaidAmountRemaining += transAmountRemaining;
					
					if(transDisputed == 'T')
						{
							prDisputedAmount += transAmountGross;
						}
					
				}
		}
	
	//Update the pr record
	//
	var fieldArray = [];
	var valuesArray = [];
	
	switch(transType)
		{
			case 'creditmemo':
			case 'CustCred':
				
				fieldArray = ['custrecord_bbs_pr_cn_total','custrecord_bbs_pr_cn_tax_total','custrecord_bbs_pr_cn_applied','custrecord_bbs_pr_cn_unapplied'];
				valuesArray = [prTotalAmount,prTotalTaxAmount,prPaidAmount,prPaidAmountRemaining];
				
				break;
				
			case 'invoice':
			case 'CustInvc':
				
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

function libGetResults(search)
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