/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jun 2019     cedricgriffiths
 *
 */
function libGenerateStatement(partnerId)
{
	var pdfTemplateId = nlapiGetContext().getPreference('custscript_bbs_statement_pdf_id');
	var statementEmailTemplateId = nlapiGetContext().getPreference('custscript_bbs_statement_email_id');
	var documentFolderId = nlapiGetContext().getPreference('custscript_bbs_pr_doc_folder');
	var emailSendFromId = nlapiGetContext().getPreference('custscript_bbs_pr_email_from');

	var currentUser = nlapiGetContext().getUser();
	currentUser = (emailSendFromId != null && emailSendFromId != '' ? emailSendFromId : currentUser);
	var today = new Date();
	
	//Get the return email address from company setup page
	//
	var companyConfig = null;
	var returnEmail = null;
	
	companyConfig = nlapiLoadConfiguration('companyinformation');
	returnEmail = companyConfig.getFieldValue('email');
	returnEmail = (returnEmail == '' ? null : returnEmail);

	//Have we got a PDF template to work with?
	//
	if(pdfTemplateId != null && pdfTemplateId != '')
		{
			//Have we got a partner id?
			//
			if(partnerId != null && partnerId != '')
				{
					var partnerRecord = null;
					
					//Try to load the partner record
					//
					try
						{
							partnerRecord = nlapiLoadRecord('customer', partnerId);
						}
					catch(err)
						{
							partnerRecord = null;
							nlapiLogExecution('ERROR', 'Filed to load partner record with id = ' + partnerId, err.message);
						}
					
					if(partnerRecord)
						{
							var partnerStatementEmailAddress = partnerRecord.getFieldValue('custentity_bbs_bill_add_list');
							
							if(partnerStatementEmailAddress != null && partnerStatementEmailAddress != '')
								{
									//Run a search to get the line data for the statement
									//
									var customrecord_bbs_presentation_recordSearch = libGetResults(nlapiCreateSearch("customrecord_bbs_presentation_record",
											[
											   ["custrecord_bbs_pr_partner","anyof",partnerId], 
											   "AND", 
											   ["custrecord_bbs_pr_status","anyof","1"]
											], 
											[
											   new nlobjSearchColumn("custrecord_bbs_pr_type").setSort(true), 	//sort by record type 
											   new nlobjSearchColumn("created"),
											   new nlobjSearchColumn("name"),
											   new nlobjSearchColumn("custrecord_bbs_pr_billing_type"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_pay_term"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_due_date"), 
											   new nlobjSearchColumn("formulanumeric").setFormula("CASE WHEN FLOOR({custrecord_bbs_pr_inv_age}) <= 0 THEN null ELSE FLOOR({custrecord_bbs_pr_inv_age}) END"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_age"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_sub_total"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_tax_total"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_total"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_disputed"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_paid"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_outstanding"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_cn_sub_total"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_cn_tax_total"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_cn_total"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_cn_applied"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_cn_unapplied"),
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_age"),
											   new nlobjSearchColumn("formulacurrency").setFormula("NVL({custrecord_bbs_pr_inv_total},0) - NVL({custrecord_bbs_pr_inv_paid},0)"),
											   new nlobjSearchColumn("custrecord_bbs_sage_date"),
											   new nlobjSearchColumn("custrecord_bbs_sage_ref")
											   ]
											));
								
									//Run a search to get the un-applied payments for the statement
									//
									var totalUnallocatedPayments = Number(0);
									
									var customerpaymentSearch = libGetResults(nlapiCreateSearch("customerpayment",
											[
											   ["type","anyof","CustPymt"], 
											   "AND", 
											   ["name","anyof",partnerId]
											], 
											[
											   new nlobjSearchColumn("tranid",null,"GROUP"), 
											   new nlobjSearchColumn("trandate",null,"GROUP"), 
											   new nlobjSearchColumn("formulacurrency",null,"MAX").setFormula("ABS({amount})"), 
											   new nlobjSearchColumn("appliedtolinkamount",null,"SUM")
											]
											));
									
									var paymentsArray = [];
									
									if(customerpaymentSearch != null && customerpaymentSearch.length > 0)
										{
											for (var payCounter = 0; payCounter < customerpaymentSearch.length; payCounter++) 
												{
													var docDate = customerpaymentSearch[payCounter].getValue("trandate",null,"GROUP");
													var docNumber = customerpaymentSearch[payCounter].getValue("tranid",null,"GROUP");
													var docAmount = Number(customerpaymentSearch[payCounter].getValue("formulacurrency",null,"MAX"));
													var docApplied = Number(customerpaymentSearch[payCounter].getValue("appliedtolinkamount",null,"SUM"));
													
													if(docAmount - docApplied != 0)
														{
															paymentsArray.push(new paymentsObj(docNumber, docDate, docAmount, docApplied));
															totalUnallocatedPayments -= (docAmount - docApplied);
														}
												}
										}
									
									
									//Load the pdf template
									//
									var templateFile = nlapiLoadFile(pdfTemplateId);
									var templateContents = templateFile.getValue();
								
									//Calculate the aging totals
									//
									var totalOpenBalance = Number(0);
									var totalOverdueAmount = Number(0);
									var statementRecord = nlapiCreateRecord('customrecord_bbs_pr_statement');
									var hasItemsToPrint = false;
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_payments', JSON.stringify(paymentsArray));
									
									//Do we have any results to process
									//
									if(customrecord_bbs_presentation_recordSearch !=  null && customrecord_bbs_presentation_recordSearch.length > 0)
										{
											//Do we have anything to print
											//
											hasItemsToPrint = true;
										
											//Loop through the results
											//
											for (var int = 0; int < customrecord_bbs_presentation_recordSearch.length; int++) 
												{
													var resultsTranType = customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_type");
													var openBalance = Number(0);
													var overdueAmount = Number(0);
													
													if(resultsTranType == 2) // Invoices
														{
															openBalance = Number(customrecord_bbs_presentation_recordSearch[int].getValue("formulacurrency"));
															
															//Only calculate overdue if age > 0 days
															//
															if(Number(customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_inv_age")) > 0)
																{
																	overdueAmount = Number(customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_inv_outstanding"));
																}
															else 	
																{
																	overdueAmount = Number(0);
																}
														}
													else //Credit Notes
														{
															overdueAmount = (Number(customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_cn_unapplied")) * Number(-1.0));
														}
													
													// add to totals
													totalOpenBalance += openBalance;
													totalOverdueAmount += overdueAmount;
												}
										}
									
									//Subtract the value of unallocated payments
									//
									totalOpenBalance += totalUnallocatedPayments;
									
									//Only generate the pdf if we have something to show
									//
									if(hasItemsToPrint)
										{
											statementRecord.setFieldValue('custrecord_bbs_pr_statement_open', totalOpenBalance);
											statementRecord.setFieldValue('custrecord_bbs_pr_statement_overdue', totalOverdueAmount);
											
											//Create a renderer
											//
											var renderer = nlapiCreateTemplateRenderer();
											renderer.setTemplate(templateContents);
											renderer.addRecord('partner', partnerRecord);
											renderer.addRecord('statement', statementRecord);
											renderer.addSearchResults('lines', customrecord_bbs_presentation_recordSearch);
											
											//Render the result
											//
											var xml = renderer.renderToString();
											var pdfFile = null;
											
											try
												{
													pdfFile = nlapiXMLToPDF(xml);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error rendering PDF statement', err.message);
												}
		
											//If we created the PDF, we now need to save it & email it
											//
											if(pdfFile != null)
												{
													//Set the file name & folder
													//
													var pdfFileName = 'Statement ' + partnerRecord.getFieldValue('entityid') + ' ' + today.toUTCString() + '.pdf';
													
													pdfFile.setName(pdfFileName);
													pdfFile.setFolder(documentFolderId);
													
												    //Upload the file to the file cabinet.
													//
												    var fileId = nlapiSubmitFile(pdfFile);
												 
												    //Attach the file to the partner record
												    //
												    nlapiAttachRecord("file", fileId, "customer", partnerId); // 10GU's
													
													//Load up the email template & merge
													//
													var emailMerger = nlapiCreateEmailMerger(statementEmailTemplateId);
													emailMerger.setEntity('customer', partnerId);
													var mergeResult = emailMerger.merge();
													
													if(mergeResult != null)
														{
															var emailSubject = mergeResult.getSubject();
															var emailBody = mergeResult.getBody();
				
															try
																{
																	nlapiSendEmail(currentUser, partnerStatementEmailAddress, emailSubject, emailBody, null, null, null, pdfFile, true, false, null);
																}
															catch(err)
																{
																	nlapiLogExecution('ERROR', 'Failed to email statement, partner id = ' + presentationId, err.message);
																}
														}
												}
										}
								}
							else
								{
									nlapiLogExecution('ERROR', 'No statement email address on partner ID = ' + partnerId, null);
								}
						}
				}
		}
	else
		{
			nlapiLogExecution('ERROR', 'No statement PDF template specified in Setup => Company => General Preferences', null);
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

function paymentsObj(_name, _date, _amount, _applied)
{
	this.documentName = _name;
	this.documentDate = _date;
	this.documentAmount = '(£' + formatMoney(Number(_amount), 2, '.', ",") + ')';
	this.documentApplied = '(£' + formatMoney(Number(_applied), 2, '.', ",") + ')';
	this.documentBalance = '(£' + formatMoney((Number(_amount) - Number(_applied)), 2, '.', ",") + ')';
}

function formatMoney(number, decPlaces, decSep, thouSep) {
	decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
	decSep = typeof decSep === "undefined" ? "." : decSep;
	thouSep = typeof thouSep === "undefined" ? "," : thouSep;
	var sign = number < 0 ? "-" : "";
	var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
	var j = (j = i.length) > 3 ? j % 3 : 0;

	return sign +
		(j ? i.substr(0, j) + thouSep : "") +
		i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
		(decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
	}

	
