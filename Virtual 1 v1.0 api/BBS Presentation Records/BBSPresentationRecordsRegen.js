/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jun 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function prRegen(type) 
{
	var context = nlapiGetContext();
	var prKey = context.getSetting('SCRIPT', 'custscript_pr_id_to_regen');
	var PR_DOC_TEMPLATE_ID = nlapiGetContext().getPreference('custscript_bbs_pr_doc_template');
	var PR_DOC_FOLDER_ID = nlapiGetContext().getPreference('custscript_bbs_pr_doc_folder');

	nlapiLogExecution('DEBUG', 'PR to regenerate = ' + prKey, '');
	
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
