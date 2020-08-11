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
			//Get the parameters
			//
			var context 			= nlapiGetContext();
			var samplesLocation 	= 315;
			var standardCogs 		= 340;
			
			//Get the source record type & id
			//
			var recType 	= transactionRecord.getRecordType();
			var recId   	= transactionRecord.getId();
			
			if(recType == 'itemfulfillment')
				{
					//Get the destination COGS account
					//
					var samplesCogs = transactionRecord.getFieldValue('custbody_bbs_press_cogs');
					
					if(samplesCogs != null && samplesCogs != '')
						{
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
													var location 	= line.getLocationId();
														
													//Find the relevant posting line by looking at the account id
													//
													if(samplesLocation == location && account == standardCogs)
														{
															//Add new posting lines here
															//
															if(debit != 0)
																{
																	//Credit the original line
																	//
																	var newLine = customLines.addNewLine();
																	newLine.setAccountId(parseInt(standardCogs));
																	newLine.setCreditAmount(debit);
																	newLine.setMemo('Custom GL Plugin Samples Posting');
																	newLine.setEntityId(entityId);
																	
																	//Debit the "Samples COGS" account
																	//
																	var newLine = customLines.addNewLine();
																	newLine.setAccountId(parseInt(samplesCogs));
																	newLine.setDebitAmount(debit);
																	newLine.setMemo('Custom GL Plugin Samples Posting');
																	newLine.setEntityId(entityId);
																}							
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

