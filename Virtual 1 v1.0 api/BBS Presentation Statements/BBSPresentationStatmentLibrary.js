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
	var currentUser = nlapiGetContext().getUser();
	
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
									//Load the pdf template
									//
									var templateFile = nlapiLoadFile(pdfTemplateId);
									var templateContents = templateFile.getValue();
								
									//Create a renderer
									//
									var renderer = nlapiCreateTemplateRenderer();
									renderer.setTemplate(templateContents);
									renderer.addRecord('record', prRecord);
									renderer.addRecord('partner', partnerRecord);
									renderer.addSearchResults('lines', invoiceLines);
									
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
									
									//If we created the PDF, we now need to email it
									//
									if(pdfFile != null)
										{
											//Load up the email template
											//
											var emailMerger = nlapiCreateEmailMerger(statementEmailTemplateId);
											emailMerger.setCustomRecord('customer', partnerRecord);
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