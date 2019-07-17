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

	var currentUser = nlapiGetContext().getUser();
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
							var partnerStatementEmailAddress = partnerRecord.getFieldValue('custentity_bbs_statement_email');
						
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
											   new nlobjSearchColumn("created"),
											   new nlobjSearchColumn("name"),
											   new nlobjSearchColumn("custrecord_bbs_pr_type"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_billing_type"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_pay_term"), 
											   new nlobjSearchColumn("custrecord_bbs_pr_inv_due_date"), 
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
											   new nlobjSearchColumn("formulacurrency").setFormula("NVL({custrecord_bbs_pr_inv_total},0) - NVL({custrecord_bbs_pr_inv_paid},0)")
											   ]
											));
								
									//Load the pdf template
									//
									var templateFile = nlapiLoadFile(pdfTemplateId);
									var templateContents = templateFile.getValue();
								
									//Calculate the aging & the totals
									//
									var aging1 = Number(0);
									var aging2 = Number(0);
									var aging3 = Number(0);
									var aging4 = Number(0);
									var aging5 = Number(0);
									var totalAmount = Number(0);
									var totalDisputed = Number(0);
									var totalPayment = Number(0);
									var statementRecord = nlapiCreateRecord('customrecord_bbs_pr_statement');
									
									if(customrecord_bbs_presentation_recordSearch !=  null && customrecord_bbs_presentation_recordSearch.length > 0)
										{
											for (var int = 0; int < customrecord_bbs_presentation_recordSearch.length; int++) 
												{
													var resultsAge = Number(customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_inv_age"));
													var resultsOutstandingDebt = Number(customrecord_bbs_presentation_recordSearch[int].getValue("formulacurrency"));
													var resultsDisputed = Number(customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_inv_disputed"));
													var resultsTranType = customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_type");
													var resultsToBePaid = Number(0);
													
													if(resultsTranType == 2) // Invoices
														{
															resultsToBePaid = Number(customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_inv_outstanding"));
														}
													else					//Credit Notes
														{
															resultsToBePaid = (Number(customrecord_bbs_presentation_recordSearch[int].getValue("custrecord_bbs_pr_cn_unapplied")) * Number(-1.0));
														}
													
													//Do aging for invoice type pr records
													//
													if(resultsTranType == 2)
														{
															aging1 += (resultsAge <= 0 ? resultsOutstandingDebt : Number(0));
															aging2 += (resultsAge >= 1  && resultsAge <= 30 ? resultsOutstandingDebt : Number(0));
															aging3 += (resultsAge >= 31  && resultsAge <= 60 ? resultsOutstandingDebt : Number(0));
															aging4 += (resultsAge >= 61  && resultsAge <= 90 ? resultsOutstandingDebt : Number(0));
															aging5 += (resultsAge > 90 ? resultsOutstandingDebt : Number(0));
														}
													else
														{
															//Credit notes
															//
															aging1 += resultsToBePaid;
														}
													
													//Add up the totals as well
													//
													totalDisputed += resultsDisputed;
												}
										}
									
									totalAmount = aging2 + aging3 + aging4 + aging5;
									totalPayment = totalAmount + totalDisputed;
									
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_age_1', aging1);
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_age_2', aging2);
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_age_3', aging3);
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_age_4', aging4);
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_age_5', aging5);
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_total_amount', totalAmount);
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_query_amount', totalDisputed);
									statementRecord.setFieldValue('custrecord_bbs_pr_stat_payment_amount', totalPayment);
									
									
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
															nlapiSendEmail(currentUser, partnerStatementEmailAddress, emailSubject, emailBody, null, null, null, pdfFile, true, false, returnEmail);
														}
													catch(err)
														{
															nlapiLogExecution('ERROR', 'Failed to email statement, partner id = ' + presentationId, err.message);
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



