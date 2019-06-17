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
	var transactionRecordType = '';
	var today = new Date();
	
	nlapiLogExecution('DEBUG', 'PR JSON String', prArrayString);
	
	//Work out what type of transactions we are processing
	//
	switch(prRecordType)
		{
			case 'Invoice':
				transactionRecordType = 'invoice';
				break;
				
			case 'Credit Note':
				transactionRecordType = 'creditmemo';
				break;		
		}
	
	var prArray = JSON.parse(prArrayString);

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
									transactionRecord = nlapiLoadRecord(prRecordType, transactionIds[int2]); //10GU's
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
								
									prName = prName + '-' + padding_left((int2 + 1).toString(), '0', 4);
									
									//Set the new field values on the transaction record
									//
									transactionRecord.setFieldValue('custbody_bbs_pr_id', prKey); 			//link to the pr record
									transactionRecord.setFieldValue('approvalstatus', '2'); 				//status is now approved
									transactionRecord.setFieldValue('tranid', prName);						//new document number
									transactionRecord.setFieldValue('trandate', nlapiDateToString(today)); 	//new transaction date
									
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
					
					//Now we have to update the PR record with the results
					//		
					prRecord.setFieldValue('custrecord_bbs_pr_internal_status', '2'); //Transactions allocated
					
					switch(prRecordType)
						{
							case 'Invoice':
								prRecord.setFieldValue('custrecord_bbs_pr_inv_total', prTotalAmount);
								prRecord.setFieldValue('custrecord_bbs_pr_inv_disputed', prDisputedAmount);
								prRecord.setFieldValue('custrecord_bbs_pr_inv_tax_total', prTotalTaxAmount);
										
								break;
								
							case 'Credit Note':
								prRecord.setFieldValue('custrecord_bbs_pr_cn_total', prTotalAmount);
								prRecord.setFieldValue('custrecord_bbs_pr_cn_tax_total', prTotalTaxAmount);
								
								break;		
						}
					
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
							   ["cogs","is","F"]
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
							   new nlobjSearchColumn("amount")
							]
							));
					
					
					//Generate the csv detail file & save to the PR record
					//
					if(invoiceLines != null && invoiceLines.length > 0)
						{
							var csvText = '"Site","Quantity","Unit Amount","Total Amount","Description","Site ID","Partner PO Ref","Service ID"\n';
							
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
									var lineTranAmount= invoiceLines[int].getValue('amount');
									
									csvText += lineTranEndUserName + ',' + lineTranQuantity  + ',' + lineTranRate + ',' + lineTranAmount + ',' + lineTranDecscription + ','  + lineTranSiteName + ',' + lineTranPartnerPo + ',' + lineTranV1c + '\n';
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
									var pdfFileName = 'Presentation ' + prRecord.getFieldText('custrecord_bbs_pr_type') + ' ' + prRecord.getFieldValue('name');
									
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
	if(PR_AUTO_SEND_DOCS == 'T')
		{
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
							//TODO - email the documents
							//
						
						
							//Update the pr status
							//
							prRecord.setFieldValue('custrecord_bbs_pr_internal_status', '4'); //Documents emailed
						
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
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
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
