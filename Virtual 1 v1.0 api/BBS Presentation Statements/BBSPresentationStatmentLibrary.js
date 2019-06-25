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
									var customrecord_bbs_presentation_recordSearch = getResults(nlapiCreateSearch("customrecord_bbs_presentation_record",
											[
											   ["custrecord_bbs_pr_partner","anyof",partnerId], 
											   "AND", 
											   ["custrecord_bbs_pr_status","anyof","1"]
											], 
											[
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
											   new nlobjSearchColumn("custrecord_bbs_pr_cn_unapplied")
											]
											));
								
									//Load the pdf template
									//
									var templateFile = nlapiLoadFile(pdfTemplateId);
									var templateContents = templateFile.getValue();
								
									//Create a renderer
									//
									var renderer = nlapiCreateTemplateRenderer();
									renderer.setTemplate(templateContents);
									renderer.addRecord('partner', partnerRecord);
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
											var pdfFileName = 'Statement ' + partnerRecord.getFieldValue('entityid') + ' ' + today.toUTCString();
											
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
											emailMerger.setEntity('customer', partnerRecord);
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