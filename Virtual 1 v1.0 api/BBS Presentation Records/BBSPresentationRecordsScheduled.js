/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Feb 2018     cedricgriffiths
 *
 */

//=============================================================================================
//Configuration
//=============================================================================================
//	
var PR_AUTO_SEND_DOCS = (nlapiGetContext().getPreference('custscript_bbs_pr_auto_send') == 'T' ? true : false);
var PR_DOC_TEMPLATE_ID = nlapiGetContext().getPreference('custscript_bbs_pr_doc_template');
var PR_DOC_FOLDER_ID = nlapiGetContext().getPreference('custscript_bbs_pr_doc_folder');
var PR_INVOICE_FORM_ID = nlapiGetContext().getPreference('custscript_bbs_pr_inv_form_id');
var PR_CREDIT_FORM_ID = nlapiGetContext().getPreference('custscript_bbs_pr_cn_form_id');

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function prUpdate(type) 
{
	//Read in the parameter(s)
	//
	var context = nlapiGetContext();
	var prArrayString = context.getSetting('SCRIPT', 'custscript_pr_array');
	var prRecordType = context.getSetting('SCRIPT', 'custscript_pr_type');
	var prBillingDate = context.getSetting('SCRIPT', 'custscript_pr_date');
	var prBillingGroup = context.getSetting('SCRIPT', 'custscript_pr_billing_group');
	
	var transactionRecordType = '';
	var today = new Date();
	var prArray = {};
	
	
	nlapiLogExecution('DEBUG', 'PR JSON String', prArrayString);
	nlapiLogExecution('DEBUG', 'Type', prRecordType);
	nlapiLogExecution('DEBUG', 'Date', prBillingDate);
	nlapiLogExecution('DEBUG', 'Group', prBillingGroup);
	
	//Work out what type of transactions we are processing
	//
	switch(prRecordType)
		{
			case 'Invoice':
				transactionRecordType = 'invoice';
				break;
				
			case 'Credit Memo':
				transactionRecordType = 'creditmemo';
				break;		
		}
	
	//Process the passed in array & create the PR records
	//
	var woArray = JSON.parse(prArrayString);
	
	//Loop round the batch keys to create the batches
	//
	for (var woKey in woArray) 
		{
			checkResources();
			
			prPrefix = '';
			
			//Create the PR record
			//
			var prodBatchRecord = nlapiCreateRecord('customrecord_bbs_presentation_record');   // 2GU's
			
			//Update the basic fields on the PR record
			//
			var keyElements = woKey.split(':');
			
			if(keyElements[0] == 'Invoice')
				{
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_type', '2');
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner', keyElements[1]);
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_pay_term', keyElements[3]);
					//prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_due_date', calculateDueDate(todaysDate, keyElements[3]));
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_due_date', calculateDueDate(nlapiStringToDate(prBillingDate), keyElements[3]));
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner_contact', keyElements[4]);
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_billing_type', keyElements[2]);
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_inv_proc_by_dd','0');
					prodBatchRecord.setFieldValue('customform', PR_INVOICE_FORM_ID);
					prPrefix = 'SINV';
				}
			else
				{
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_type', '1');
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner', keyElements[1]);
					prodBatchRecord.setFieldValue('custrecord_bbs_pr_partner_contact', keyElements[2]);
					prodBatchRecord.setFieldValue('customform', PR_CREDIT_FORM_ID);
					prPrefix = 'SCRE';
				}
			
			prodBatchRecord.setFieldValue('custrecord_bbs_pr_status', '1'); //Status = 1 (Open)
			prodBatchRecord.setFieldValue('custrecord_bbs_pr_internal_status', '1'); //Status = 1 (Awaiting Transaction Allocation)
			prodBatchRecord.setFieldValue('custrecord_bbs_presentation_record_date', prBillingDate); //Transaction date
			
			
			//Save the batch record & get the id
			//
			prodBatchId = nlapiSubmitRecord(prodBatchRecord, true, true);  // 4GU's
			//batchesCreated.push(prodBatchId);
			
			//Fixup the PR name
			//
			var prName = prPrefix + nlapiLookupField('customrecord_bbs_presentation_record', prodBatchId, 'name', false);
			nlapiSubmitField('customrecord_bbs_presentation_record', prodBatchId, 'name', prName, false);
			
			//Loop round the w/o id's associated with this batch
			//
			woIds = woArray[woKey];
					
			//Save the id of the created batch along with the works orders that go with it
			//
			prArray[prodBatchId] = woIds;
				
		}

	checkResources();
	
	//var prArray = JSON.parse(prArrayString);

	//Loop through the array of PR records to allocate transactions
	//
	for (var prKey in prArray) 
		{
			var prTotalAmount = Number(0);
			var prTotalTaxAmount = Number(0);
			var prRemainingAmount = Number(0);
			var prDisputedAmount = Number(0);
			var transactionIds = prArray[prKey];
			var prRecord = null;
			
			checkResources();
			
			//Try to load the PR record
			//
			try
				{
					prRecord = nlapiLoadRecord('customrecord_bbs_presentation_record', prKey); //2GU;s
				}
			catch(err)
				{
					prRecord = null;
					nlapiLogExecution('ERROR', 'Error loading PR record id = ' + prKey, err.message);
				}
			
			//Did the PR record load ok?
			//
			if(prRecord)
				{
					//Loop through all the transactions assigned to this PR record
					//
					for (var int2 = 0; int2 < transactionIds.length; int2++) 
						{
							checkResources();
							
							var transactionRecord = null;
							
							//Try and load the transaction record
							//
							try
								{
									transactionRecord = nlapiLoadRecord(transactionRecordType, transactionIds[int2]); //10GU's
								}
							catch(err)
								{
									transactionRecord = null;
								}
							
							//Did we load it ok?
							//
							if(transactionRecord != null)
								{
									//Get field values from the PR record
									//
									var prName = prRecord.getFieldValue('name');
									var prNameForFilter = prName;
									
									prName = prName + '-' + padding_left((int2 + 1).toString(), '0', 4);
									
									//Set the new field values on the transaction record
									//
									transactionRecord.setFieldValue('custbody_bbs_pr_id', prKey); 				//link to the pr record
									transactionRecord.setFieldValue('approvalstatus', '2'); 					//status is now approved
									transactionRecord.setFieldValue('tranid', prName);							//new document number
									transactionRecord.setFieldValue('trandate', prBillingDate); 				//new transaction date
									//transactionRecord.setFieldValue('trandate', nlapiDateToString(today)); 	//new transaction date
									
									transactionRecord.setFieldValue('custbody_bbs_pre_rec_filter', prNameForFilter);

									
									
									//Get field values from the transaction record
									//
									var transactionDisputed = transactionRecord.getFieldValue('custbody_bbs_disputed');
									var transactionTotal = Number(transactionRecord.getFieldValue('total'));
									var transactionTaxTotal = Number(transactionRecord.getFieldValue('taxtotal'));
									var transactionRemaining = Number(transactionRecord.getFieldValue('amountremaining'));
									
									
									//Calculate totals for the PR record
									//
									prTotalAmount += transactionTotal;
									prTotalTaxAmount += transactionTaxTotal;
									
									if(transactionDisputed == 'T')
										{
											prDisputedAmount += transactionTotal;
										}
									
									//Update the transaction record
									//
									try
										{
											nlapiSubmitRecord(transactionRecord, false, true); //20GU's
										}
									catch(err)
										{
											nlapiLogExecution('DEBUG', 'Error updating transaction record - ' + err.message, transactionIds[int2]);
										}
								}
						}
					
					//Reload the PR record
					//
					try
						{
							prRecord = nlapiLoadRecord('customrecord_bbs_presentation_record', prKey); //2GU;s
						}
					catch(err)
						{
							prRecord = null;
							nlapiLogExecution('ERROR', 'Error loading PR record id = ' + prKey, err.message);
						}
					
					if(prRecord != null)
						{
							//Now we have to update the PR record with the results
							//		
							prRecord.setFieldValue('custrecord_bbs_pr_internal_status', '2'); //Transactions allocated
							
							/*
							 * Not needed as the UE script on invoices & credit notes updates the vaklues on the PR record
							switch(prRecordType)
								{
									case 'Invoice':
										prRecord.setFieldValue('custrecord_bbs_pr_inv_total', prTotalAmount);
										prRecord.setFieldValue('custrecord_bbs_pr_inv_disputed', prDisputedAmount);
										prRecord.setFieldValue('custrecord_bbs_pr_inv_tax_total', prTotalTaxAmount);
												
										break;
										
									case 'Credit Memo':
										prRecord.setFieldValue('custrecord_bbs_pr_cn_total', prTotalAmount);
										prRecord.setFieldValue('custrecord_bbs_pr_cn_tax_total', prTotalTaxAmount);
										
										break;		
								}
							*/
							try
								{
									nlapiSubmitRecord(prRecord, false, true); //2GU's
								}
							catch(err)
								{
									nlapiLogExecution('DEBUG', 'Error updating presentation record - ' + err.message, prKey);
								}
						}
				}
		}
	
	//Unlock the billing group
	//
	if(prBillingGroup != null && prBillingGroup != '')
		{
			nlapiSubmitField('customrecord_billing_group_list', prBillingGroup, 'custrecord_bbs_billing_group_locked', 'F', false);
		}
//	else
//		{
//			var customrecord_billing_group_listSearch = nlapiSearchRecord("customrecord_billing_group_list",null,
//					[
//					], 
//					[
//					   new nlobjSearchColumn("name").setSort(false)
//					]
//					);
//			
//			if(customrecord_billing_group_listSearch != null && customrecord_billing_group_listSearch.length > 0)
//				{
//					for (var int2 = 0; int2 < customrecord_billing_group_listSearch.length; int2++) 
//						{
//							var billingGroupId = customrecord_billing_group_listSearch[int2].getId();
//							
//							nlapiSubmitField('customrecord_billing_group_list', billingGroupId, 'custrecord_bbs_billing_group_locked', 'F', false);
//						}
//				}
//		}
	
	//=============================================================================================
	//=============================================================================================
	//Loop through the array of PR records to generate documents
	//=============================================================================================
	//=============================================================================================
	//
	

	//Get the company config info
	//
	var companyInformationRecord = nlapiLoadConfiguration('companyinformation');
	
	//Loop through each of the PR records
	//
	for (var prKey in prArray) 
		{
		
			checkResources();
		
			//Try to load the PR record
			//
			try
				{
					prRecord = nlapiLoadRecord('customrecord_bbs_presentation_record', prKey); //2GU;s
				}
			catch(err)
				{
					prRecord = null;
					nlapiLogExecution('ERROR', 'Error loading PR record id = ' + prKey, err.message);
				}
			
			//Did the PR record load ok?
			//
			if(prRecord)
				{
					var partnerRecord = null;
					
					//Load the partner record from the pr record
					//
					try
						{
							partnerRecord = nlapiLoadRecord('customer', prRecord.getFieldValue('custrecord_bbs_pr_partner'));
						}
					catch(err)
						{
						partnerRecord = null;
						}

					//Get the line data from a search
					//
					var invoiceLines = getResults(nlapiCreateSearch("transaction",
							[
							   ["type","anyof","CustInvc","CustCred"], 
							   "AND", 
							   ["custbody_bbs_pr_id","anyof",prKey], 
							   "AND", 
							   ["mainline","is","F"], 
							   "AND", 
							   ["shipping","is","F"], 
							   "AND", 
							   ["taxline","is","F"], 
							   "AND", 
							   ["cogs","is","F"],
							   "AND",
							   ["customgl","is","F"]
							], 
							[
							   new nlobjSearchColumn("trandate"), 
							   new nlobjSearchColumn("tranid").setSort(false), 
							   new nlobjSearchColumn("entity"), 
							   new nlobjSearchColumn("quantity"), 
							   new nlobjSearchColumn("rate"), 
							   new nlobjSearchColumn("item"), 
							   new nlobjSearchColumn("custcol_bbs_end_cust_name"), 
							   new nlobjSearchColumn("custcol_bbs_accessid_v1c"), 
							   new nlobjSearchColumn("custcol_bbs_site_name"), 
							   new nlobjSearchColumn("custbody_bbs_partner_po_number"), 
							   new nlobjSearchColumn("memo"),
							   new nlobjSearchColumn("amount"),
							   new nlobjSearchColumn("custcol_bbs_site_post_code"),
							   new nlobjSearchColumn("custcol_bbs_billing_frequency"), 
							   new nlobjSearchColumn("custcol_bbs_pe_reference"),
							   new nlobjSearchColumn("custcol_bbs_revenue_rec_start_date"),
							   new nlobjSearchColumn("custcol_bbs_revenue_rec_end_date")
							]
							));
					
					
					//Generate the csv detail file & save to the PR record
					//
					if(invoiceLines != null && invoiceLines.length > 0)
						{
							var csvText = '"Site ID","Service ID","From Date","To Date","Frequency","Amount","Description","Partner PO Ref","PE Ref"\n';
							
							for (var int = 0; int < invoiceLines.length; int++) 
								{
									var lineTranDate = invoiceLines[int].getValue('trandate');
									var lineTranId = invoiceLines[int].getValue('tranid');
									var lineTranEntity = invoiceLines[int].getText('entity');
									var lineTranQuantity = invoiceLines[int].getValue('quantity');
									var lineTranRate = invoiceLines[int].getValue('rate');
									var lineTranItem = invoiceLines[int].getText('item');
									var lineTranEndUserName = invoiceLines[int].getValue('custcol_bbs_end_cust_name');
									var lineTranV1c = invoiceLines[int].getValue('custcol_bbs_accessid_v1c');
									var lineTranSiteName = invoiceLines[int].getValue('custcol_bbs_site_name');
									var lineTranPartnerPo = invoiceLines[int].getValue('custbody_bbs_partner_po_number');
									var lineTranDecscription = invoiceLines[int].getValue('memo');
									var lineTranAmount = invoiceLines[int].getValue('amount');
									var lineTranPostCode = invoiceLines[int].getValue('custcol_bbs_site_post_code');
									var lineTranCustFrequency = invoiceLines[int].getText("custcol_bbs_billing_frequency");
									var lineTranPeReference = invoiceLines[int].getValue("custcol_bbs_pe_reference");
									var lineTranRevRecStart = invoiceLines[int].getValue("custcol_bbs_revenue_rec_start_date");
									var lineTranRevRecEnd = invoiceLines[int].getValue("custcol_bbs_revenue_rec_end_date");
									
									csvText += 
										'"' + lineTranEndUserName 		+ ' - ' + lineTranPostCode + '",' + 
										'"' + lineTranV1c 				+ '",' +
										'"' + lineTranRevRecStart 		+ '",' +
										'"' + lineTranRevRecEnd 		+ '",' +
										'"' + lineTranCustFrequency 	+ '",' +
										'"' + lineTranAmount 			+ '",' + 
										'"' + lineTranDecscription 		+ '",'  + 
										'"' + lineTranPartnerPo 		+ '",' + 
										'"' + lineTranPeReference 		+ '"\n';
								}
						}
					
					//Create a file to hold the csv
					//
					var csvFileName = 'Presentation ' + prRecord.getFieldText('custrecord_bbs_pr_type') + ' ' + prRecord.getFieldValue('name') + '.csv';
					var csvFile = nlapiCreateFile(csvFileName, 'CSV', csvText);
					csvFile.setFolder(PR_DOC_FOLDER_ID);
					
					//Upload the file to the file cabinet.
					//
				    var csvFileId = nlapiSubmitFile(csvFile);
				 
				    //Attach the file to the PR record
				    //
				    nlapiAttachRecord("file", csvFileId, "customrecord_bbs_presentation_record", prKey); // 10GU's
			
					//Render the PDF template & save to the PR record
					//
					if(PR_DOC_TEMPLATE_ID != null && PR_DOC_TEMPLATE_ID != '')
						{
							var templateFile = nlapiLoadFile(PR_DOC_TEMPLATE_ID);
							var templateContents = templateFile.getValue();
						
							var renderer = nlapiCreateTemplateRenderer();
							renderer.setTemplate(templateContents);
							renderer.addRecord('record', prRecord);
							renderer.addRecord('partner', partnerRecord);
							renderer.addSearchResults('lines', invoiceLines);
							
							var xml = renderer.renderToString();
							var pdfFile = null;
							
							try
								{
									pdfFile = nlapiXMLToPDF(xml);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error rendering PDF, PR record id = ' + prKey, err.message);
								}
							
							if(pdfFile != null)
								{
									var pdfFileName = 'Presentation ' + prRecord.getFieldText('custrecord_bbs_pr_type') + ' ' + prRecord.getFieldValue('name') + '.pdf';
									
									pdfFile.setName(pdfFileName);
									pdfFile.setFolder(PR_DOC_FOLDER_ID);
				
								    //Upload the file to the file cabinet.
									//
								    var fileId = nlapiSubmitFile(pdfFile);
								 
								    //Attach the file to the PR record
								    //
								    nlapiAttachRecord("file", fileId, "customrecord_bbs_presentation_record", prKey); // 10GU's
								}
							
							//Update the pr status
							//
							prRecord.setFieldValue('custrecord_bbs_pr_internal_status', '3'); //Documents generated
						
							try
								{
									nlapiSubmitRecord(prRecord, false, true); //2GU's
								}
							catch(err)
								{
									nlapiLogExecution('DEBUG', 'Error updating presentation record - ' + err.message, prKey);
								}
						}
				}
		}
	
	
	//=============================================================================================
	//=============================================================================================
	//Loop through the array of PR records to email documents
	//=============================================================================================
	//=============================================================================================
	//
	if(PR_AUTO_SEND_DOCS)
		{
			for (var prKey in prArray) 
				{
					checkResources();
					
					libEmailFiles(prKey);
				}
		}
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function calculateDueDate(_startDate, _payTerms)
{
	var payTermsRecord = null;
	var dueDate = _startDate;
	
	try
		{
			payTermsRecord = nlapiLoadRecord('term', _payTerms);
		}
	catch(err)
		{
			payTermsRecord = null;
		}
	
	if(payTermsRecord != null)
		{
			var days = Number(payTermsRecord.getFieldValue('daysuntilnetdue'));
			
			try
				{
					dueDate = nlapiAddDays(_startDate, days);
				}
			catch(err)
				{
					dueDate = _startDate;
				}
		}
	
	return(nlapiDateToString(dueDate));
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 400)
		{
			nlapiYieldScript();
		}
}

//left padding s with c to a total of n chars
//
function padding_left(s, c, n) 
{
	if (! s || ! c || s.length >= n) 
	{
		return s;
	}
	
	var max = (n - s.length)/c.length;
	
	for (var i = 0; i < max; i++) 
	{
		s = c + s;
	}
	
	return s;
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
