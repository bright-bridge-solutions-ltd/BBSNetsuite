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
									var transactionRemaining = Number(transactionRecord.getFieldValue('amountremaining'));
									
									
									//Calculate totals for the PR record
									//
									prTotalAmount += transactionTotal;
									
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
										
								break;
								
							case 'Credit Note':
								prRecord.setFieldValue('custrecord_bbs_pr_cn_total', prTotalAmount);
								
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
	
	//
	//Loop through the array of PR records to generate documents
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
					//TODO - generate the documents
					//
				
				
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
	
	
	//
	//Loop through the array of PR records to email documents
	//
	if(PR_AUTO_SEND_DOCS == 'T')
		{
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