/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2019     cedricgriffiths
 *
 */

function customizeGlImpact(transactionRecord, standardLines, customLines, book)
{
	try
		{
			//
			//GL plugin that will be deployed against credit notes
			//
			
			//Get the sales return account & the sales account
			//
			var salesAccount			= 323;	
			var salesReturnAccount		= null;
	
			//Get the source record type & id
			//
			var recType 	= transactionRecord.getRecordType();
			var recId   	= transactionRecord.getId();
			
			if(recType == 'creditmemo' || recType == 'cashrefund')
				{
					//Read the subsidiary record to get the sales return account
					//
					var subsidiaryRecord 	= null;
					var subsidiaryId 		= transactionRecord.getFieldValue('subsidiary');
					
					try
						{
							subsidiaryRecord = nlapiLoadRecord('subsidiary', subsidiaryId);
						}
					catch(err)
						{
							subsidiaryRecord = null;
							nlapiLogExecution('ERROR','Error reading subsidiary record', err.message);
						}
					
					if(subsidiaryRecord != null)
						{
							salesReturnAccount = subsidiaryRecord.getFieldValue('custrecord_bbs_sales_return_account');
						}
					
					//Get the count of standard lines
					//
					var linecount = standardLines.getCount();
													
					//Loop round the lines
					//
					if(linecount > 0)
						{								
							//Loop through the standard GL lines
							//			
							for (var i=0; i<linecount; i++) 
								{
									//Get the line object
									//
									var line = standardLines.getLine(i);
																					
									//Ignore the summary line or any non-posting lines
									//
									if(line.isPosting() && line.getId() != 0)
										{
											var account 	= line.getAccountId();
											var debit 		= Number(line.getDebitAmount());
											var entityId 	= line.getEntityId();
												
											//Find the relevant posting line by looking at the account id
											//
											if(account == salesAccount && salesReturnAccount != null && salesReturnAccount != '')
												{
													//Add new posting lines here
													//
													if(debit != 0)
														{
															//Credit the original line
															//
															var newLine = customLines.addNewLine();
															newLine.setAccountId(parseInt(salesAccount));
															newLine.setCreditAmount(debit);
															newLine.setMemo('Custom GL Plugin Posting');
															newLine.setEntityId(entityId);
															
															//Debit the "Sales Return" account
															//
															var newLine = customLines.addNewLine();
															newLine.setAccountId(parseInt(salesReturnAccount));
															newLine.setDebitAmount(debit);
															newLine.setMemo('Custom GL Plugin Posting');
															newLine.setEntityId(entityId);
														}							
												}
										}
								}
						}
				}
		}
	catch(err)
		{
			nlapiLogExecution('ERROR','Unexcepted error in GL plugin', err.message);
		}
}

