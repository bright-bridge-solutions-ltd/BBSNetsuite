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
var DD_DOC_TEMPLATE_ID = nlapiGetContext().getPreference('custscript_bbs_dd_doc_template');
var DD_DOC_FOLDER_ID = nlapiGetContext().getPreference('custscript_bbs_pr_doc_folder');

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function ddUpdate(type) 
{
	//Read in the parameter(s)
	//
	var context = nlapiGetContext();
	var ddArrayString = context.getSetting('SCRIPT', 'custscript_dd_array');
	var today = new Date();
	
	nlapiLogExecution('DEBUG', 'PR JSON String', ddArrayString);
	
	var ddArray = JSON.parse(ddArrayString);

	//Loop through the array of DD records to allocate transactions
	//
	for (var ddKey in ddArray) 
		{
			var prDetailArray = ddArray[ddKey];
			var ddRecord = null;
			
			checkResources();
			
			
			//Loop through all the transactions assigned to this DD record
			//
			for (var int2 = 0; int2 < prDetailArray.length; int2++) 
				{
					checkResources();
							
					//Extract out the PR details 
					//
					var prDetail = prDetailArray[int2];
					var prId = prDetail.prId;
					var prAmountToPay = prDetail.prAmountToPay;
							
					//Create a dd batch detail record
					//
					var ddBatchDetailRecord = nlapiCreateRecord('customrecordbbs_dd_batch_det');
					ddBatchDetailRecord.setFieldValue('custrecord_bbs_dd_det_batch', ddKey);
					ddBatchDetailRecord.setFieldValue('custrecord_bbs_dd_det_pr', prId);
					ddBatchDetailRecord.setFieldValue('custrecord_bbs_dd_det_amount', prAmountToPay);
							
					//Create the dd batch detail record
					//
					try
						{
							nlapiSubmitRecord(ddBatchDetailRecord, false, true); //20GU's
						}
					catch(err)
						{
							nlapiLogExecution('DEBUG', 'Error creating dd batch detail record - ' + err.message, null);
						}
				}
					
			//Now we have to update the DD record with the change in status
			//	
			nlapiSubmitField('customrecord_bbs_dd_batch', ddKey, 'custrecord_bbs_dd_internal_status', '2', false);//Transactions allocated
		}
	
	//=============================================================================================
	//=============================================================================================
	//Loop through the array of DD records to generate documents
	//=============================================================================================
	//=============================================================================================
	//

	//Get the company config info
	//
	var companyInformationRecord = nlapiLoadConfiguration('companyinformation');
	
	//Loop through each of the PR records
	//
	for (var ddKey in ddArray) 
		{
			//Try to load the DD record
			//
			try
				{
					ddRecord = nlapiLoadRecord('customrecord_bbs_dd_batch', ddKey); //2GU;s
				}
			catch(err)
				{
					ddRecord = null;
					nlapiLogExecution('ERROR', 'Error loading DD record id = ' + ddKey, err.message);
				}
			
			//Did the DD record load ok?
			//
			if(ddRecord)
				{
					var partnerRecord = null;
					
					//Load the partner record from the dd record
					//
					try
						{
							partnerRecord = nlapiLoadRecord('customer', ddRecord.getFieldValue('custrecord_bbs_dd_partner'));
						}
					catch(err)
						{
							partnerRecord = null;
						}

					//Get the line data from a search
					//
					var customrecordbbs_dd_batch_detSearch = nlapiSearchRecord("customrecordbbs_dd_batch_det",null,
							[
							   ["custrecord_bbs_dd_det_batch","anyof",ddKey]
							], 
							[
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_due_date","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_disputed","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_outstanding","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_paid","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_sub_total","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_tax_total","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_total","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_pr_inv_proc_by_dd","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_presentation_record_date","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("name","CUSTRECORD_BBS_DD_DET_PR",null), 
							   new nlobjSearchColumn("custrecord_bbs_dd_det_amount")
							]
							);

					//Render the PDF template & save to the DD record
					//
					if(DD_DOC_TEMPLATE_ID != null && DD_DOC_TEMPLATE_ID != '')
						{
							var templateFile = nlapiLoadFile(DD_DOC_TEMPLATE_ID);
							var templateContents = templateFile.getValue();
						
							var renderer = nlapiCreateTemplateRenderer();
							renderer.setTemplate(templateContents);
							renderer.addRecord('record', ddRecord);
							renderer.addRecord('partner', partnerRecord);
							renderer.addSearchResults('lines', customrecordbbs_dd_batch_detSearch);
							
							var xml = renderer.renderToString();
							var pdfFile = null;
							
							try
								{
									pdfFile = nlapiXMLToPDF(xml);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error rendering PDF, DD record id = ' + ddKey, err.message);
								}
							
							if(pdfFile != null)
								{
									var pdfFileName = 'Direct Debit Claim ' + ddRecord.getFieldValue('name') + '.pdf';
									
									pdfFile.setName(pdfFileName);
									pdfFile.setFolder(DD_DOC_FOLDER_ID);
				
								    //Upload the file to the file cabinet.
									//
								    var fileId = nlapiSubmitFile(pdfFile);
								 
								    //Attach the file to the PR record
								    //
								    nlapiAttachRecord("file", fileId, "customrecord_bbs_dd_batch", ddKey); // 10GU's
								}
							
							//Update the dd status
							//
							ddRecord.setFieldValue('custrecord_bbs_dd_internal_status', '3'); //Documents generated
						
							try
								{
									nlapiSubmitRecord(ddRecord, false, true); //2GU's
								}
							catch(err)
								{
									nlapiLogExecution('DEBUG', 'Error updating DD record - ' + err.message, ddKey);
								}
						}
				}
		}
	
	
	//=============================================================================================
	//=============================================================================================
	//Loop through the array of DD records to email documents
	//=============================================================================================
	//=============================================================================================
	//
	for (var ddKey in ddArray) 
		{
			checkResources();
					
			libEmailFiles(ddKey);
		}
	
}

//=============================================================================================
//=============================================================================================
//Functions
//=============================================================================================
//=============================================================================================
//
function prDetails(_prId, _prAmountToPay)
{
	this.prId = _prId;
	this.prAmountToPay = _prAmountToPay;
}

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
