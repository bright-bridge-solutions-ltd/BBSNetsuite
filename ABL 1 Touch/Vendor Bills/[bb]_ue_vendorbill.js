/**
 * Module Description
 * 
 * Version   	Date            Author          Remarks
 * 1.00       	01 May 2018     suceen			Original version
 * 1.10			17 Jun 2021		sambatten		Rewritten to resolve problems with running out of script units
 *
 */


function vendorbillBeforeLoad(type, form, request)
	{
 
	}


function vendorbillBeforeSubmit(type) 
	{
		for (var i = 1; i <= nlapiGetLineItemCount('expense'); i++)
			{
				var accountId = nlapiGetLineItemValue('expense', 'account', i);
				
				if (i >= 2)
					{
						nlapiSetLineItemValue('expense', 'custcol_recharge_account', i, accountId);
					}
			}
	}


function vendorbillAfterSubmit(type)
	{
		if (type == 'create')
			{
				// declare and initialize variables
				var vendorBill 			= null;
				var accountToBeCredited = null;
			
				// get the ID of the current record
				var vendorBillID = nlapiGetRecordId();
				
				try
					{
						// reload the vendor bill
						vendorBill = nlapiLoadRecord('vendorbill', vendorBillID);
					}
				catch(e)
					{
						nlapiLogExecution('ERROR', 'Error Loading Vendor Bill ' + vendorBillID, e.message);
					}
				
				if (vendorBill)
					{
						// get values from the record
						var subsidiary 		= vendorBill.getFieldValue('subsidiary');
						var vatOutLocation 	= vendorBill.getFieldValue('location');
						var documentNo     	= vendorBill.getFieldValue('tranid');
						var postingPeriod  	= vendorBill.getFieldValue('postingperiod');
						var tranDate 		= vendorBill.getFieldValue('trandate');
						
						if (subsidiary)
							{
								try
									{
										accountToBeCredited = nlapiLookupField('subsidiary', subsidiary, 'custrecord_bbs_recharge_journal');
									}
								catch(e)
									{
										nlapiLogExecution('ERROR', 'Error Looking Up Fields for Subsidiary ' + subsidiary, e.message);
									}
							}
						
						if(accountToBeCredited)
							{
								for (var i = 1; i <= nlapiGetLineItemCount('expense'); i++)
									{
										// get values from the line
										var accountId      = vendorBill.getLineItemValue('expense', 'account', i);
										var accountName    = vendorBill.getLineItemValue('expense', 'account_display', i);
										var amt            = vendorBill.getLineItemValue('expense', 'amount', i);
										var grossAmt       = vendorBill.getLineItemValue('expense', 'grossamt', i);
										var location       = vendorBill.getLineItemValue('expense', 'custcol_bbs_recharge_stie', i);
										var debitAccount   = vendorBill.getLineItemValue('expense', 'custcol_recharge_account', i);
										var memo 	       = vendorBill.getLineItemValue('expense', 'memo', i);
										var taxCode 	   = vendorBill.getLineItemValue('expense', 'taxcode', i);
										var taxAmount 	   = vendorBill.getLineItemValue('expense', 'tax1amt', i);
										var isIntercompany = vendorBill.getLineItemValue('expense', 'custcol_bb_is_intercompany', i);
							
										if (accountName)
											{
												// if the accountName contains '3100'
												if (accountName.indexOf('3100') >= 0)
													{
														// declare and initialize variables
														var journalID 		= null;
														var vatJournalID	= null;
													
														var accountRepreSite = nlapiLookupField('account', accountId, 'custrecord_bbs_represents_site');
														
														try
															{
																// create a journal record
																var journal = nlapiCreateRecord('journalentry');
																journal.setFieldValue('customform', 105);
																journal.setFieldValue('trandate', today);
																journal.setFieldValue('subsidiary', accountRepreSite);
																journal.setFieldValue('location', location);
																journal.setFieldValue('custbody_bb_created_from_script', 'T');
																journal.setFieldValue('memo', memo);
							                                    journal.setFieldValue('postingperiod', postingPeriod);
							                                    journal.setFieldValue('custbody_bbs_recharge_invoice', vendorBillID);
							                                    journal.setFieldValue('approvalstatus', 2);
							                                    
							                                    if (isIntercompany == 'T')
							                                    	{
																		journal.selectNewLineItem('line');
																		journal.setCurrentLineItemValue('line', 'account', accountToBeCredited);
																		journal.setCurrentLineItemValue('line', 'credit', grossAmt);
																		journal.setCurrentLineItemValue('line', 'taxcode', 6);
																		journal.setCurrentLineItemValue('line', 'memo', documentNo);
																		journal.commitLineItem('line');
																		journal.selectNewLineItem('line');
																		journal.setCurrentLineItemValue('line', 'account', debitAccount);
																		journal.setCurrentLineItemValue('line', 'debit', amt);
																		journal.setCurrentLineItemValue('line', 'taxcode', 6);
																		journal.setCurrentLineItemValue('line', 'memo', documentNo);
																		journal.commitLineItem('line');
																		journal.selectNewLineItem('line');
																		journal.setCurrentLineItemValue('line', 'account', 110);
																		journal.setCurrentLineItemValue('line', 'debit', taxAmount);
																		journal.setCurrentLineItemValue('line', 'taxcode', 6);
																		journal.setCurrentLineItemValue('line', 'memo', documentNo);
																		journal.commitLineItem('line');
							                                    	}
							                                    else 
							                                    	{
																		journal.selectNewLineItem('line');
																		journal.setCurrentLineItemValue('line', 'account', accountToBeCredited);
																		journal.setCurrentLineItemValue('line', 'credit', amt);
																		journal.setCurrentLineItemValue('line', 'taxcode', 6);
																		journal.commitLineItem('line');
																		journal.selectNewLineItem('line');
																		journal.setCurrentLineItemValue('line', 'account', debitAccount);
																		journal.setCurrentLineItemValue('line', 'debit', amt);
																		journal.setCurrentLineItemValue('line', 'taxcode', 6);
																		journal.commitLineItem('line');	
							                                    	}
							                                    
							                                    journalID = nlapiSubmitRecord(journal, true);
															}
														catch(e)
															{
																nlapiLogExecution('ERROR', 'Error Creating Journal for Vendor Bill ' + vendorBillID, e.message);
															}
							                                    
														if (isIntercompany == 'T')
															{
																try
																	{
																		// create a journal record
																		var vatOutputJournal = nlapiCreateRecord('journalentry');
																		vatOutputJournal.setFieldValue('customform', 105);
																		vatOutputJournal.setFieldValue('trandate', today);
																		vatOutputJournal.setFieldValue('subsidiary', subsidary);
																		vatOutputJournal.setFieldValue('location', vatOutLocation);
																		vatOutputJournal.setFieldValue('custbody_bb_created_from_script', 'T');
																		vatOutputJournal.setFieldValue('memo', memo);
																		vatOutputJournal.setFieldValue('postingperiod', postingPeriod);
																		vatOutputJournal.setFieldValue('custbody_bbs_recharge_invoice', vendorBillID);
																		vatOutputJournal.setFieldValue('approvalstatus', 2);
																		
																		vatOutputJournal.selectNewLineItem('line');
																		vatOutputJournal.setCurrentLineItemValue('line', 'account', 109);
																		vatOutputJournal.setCurrentLineItemValue('line', 'credit', taxAmount);
																		vatOutputJournal.setCurrentLineItemValue('line', 'taxcode', 6);
																		vatOutputJournal.setCurrentLineItemValue('line', 'memo', documentNo);
																		vatOutputJournal.commitLineItem('line');
																		
																		vatOutputJournal.selectNewLineItem('line');
																		vatOutputJournal.setCurrentLineItemValue('line', 'account', account);
																		vatOutputJournal.setCurrentLineItemValue('line', 'debit', taxAmount);
																		vatOutputJournal.setCurrentLineItemValue('line', 'taxcode', 6);
																		vatOutputJournal.setCurrentLineItemValue('line', 'memo', documentNo);
																		vatOutputJournal.commitLineItem('line');
																		
																		var vatJournalID = nlapiSubmitRecord(vatOutputJournal, true);
																	}
																catch(e)
																	{
																		nlapiLogExecution('ERROR', 'Error Creating Output VAT Journal for Vendor Bill ' + vendorBillID, e.message);
																	}
															}
														
														// set the journal fields on the line
														vendorBill.setLineItemValue('expense', 'custcol_created_journal_custom_field', i, journalID);
														vendorBill.setLineItemValue('expense', 'custcol_bb_vatoutput_journal', i, vatJournalID);
													}
											}
									}
								
								try
									{
										// save the changes the vendor bill record
										nlapiSubmitRecord(vendorBill);
										
										nlapiLogExecution('AUDIT', 'Vendor Bill Updated', vendorBillID);
									}
								catch(e)
									{
										nlapiLogExecution('ERROR', 'Error Updating Vendor Bill ' + vendorBillID, e.message);
									}
							}
					}
			}
	}


