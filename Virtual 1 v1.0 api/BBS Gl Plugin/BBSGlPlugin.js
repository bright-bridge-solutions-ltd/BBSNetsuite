/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2019     cedricgriffiths
 *
 */

function customizeGlImpact(transactionRecord, standardLines, customLines, book)
{
	//
	//GL plugin that will be deployed against credit notes
	//
	var accountMapping = {};
	
	//Get the accounts to map from/to
	//
	accountMapping = getMapping();

	//Get the source record type & id
	//
	var rectype = transactionRecord.getRecordType();
	var recid   = transactionRecord.getId();
	var billingType = transactionRecord.getFieldValue('class');
	
	//Based on the billing type, see what mapping we will use & only procede if we have found the billing type in the mapping
	//
	if(Object.keys(accountMapping).indexOf(billingType) != -1)
		{
			var fromAccount = accountMapping[billingType].fromAccount;
			var toAccount = accountMapping[billingType].toAccount;
		
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
									var account = line.getAccountId();
									var debit = Number(line.getDebitAmount());
									var location = line.getLocationId();
									var classId = line.getClassId();
									var departmentId = line.getDepartmentId();
									var customSegId = line.getSegmentValueId('cseg_bbs_product_gr');
									var entityId = line.getEntityId();
									
									//Find the relevant posting line by looking at the account id
									//
									if(account == fromAccount)
										{
											//Add new posting lines here
											//
											if(debit != 0)
												{
													//Credit the original line
													//
													var newLine = customLines.addNewLine();
													newLine.setAccountId(parseInt(fromAccount));
													newLine.setCreditAmount(debit);
													newLine.setMemo('Custom GL Plugin Posting');
													newLine.setLocationId(location);
													newLine.setClassId(classId);
													newLine.setDepartmentId(departmentId);
													newLine.setSegmentValueId('cseg_bbs_product_gr', customSegId);
													newLine.setEntityId(entityId);
													
													//Debit the "Sales Credits" account
													//
													var newLine = customLines.addNewLine();
													newLine.setAccountId(parseInt(toAccount));
													newLine.setDebitAmount(debit);
													newLine.setMemo('Custom GL Plugin Posting');
													newLine.setLocationId(location);
													newLine.setClassId(classId);
													newLine.setDepartmentId(departmentId);
													newLine.setSegmentValueId('cseg_bbs_product_gr', customSegId);
													newLine.setEntityId(entityId);
												}							
										}
								}
						}
				}
		}
}

function glMapping(_fromAccount, _toAccount)
{
	this.fromAccount = _fromAccount;
	this.toAccount = _toAccount;
}

function getMapping()
{
	var returnedMapping = {};
	
	var customrecord_bbs_gl_plugin_mappingSearch = nlapiSearchRecord("customrecord_bbs_gl_plugin_mapping",null,
			[
			], 
			[
			   new nlobjSearchColumn("custrecord_bbs_gl_billing_type"), 
			   new nlobjSearchColumn("custrecord_bbs_gl_from_account"), 
			   new nlobjSearchColumn("custrecord_bbs_gl_to_account")
			]
			);
	
	if(customrecord_bbs_gl_plugin_mappingSearch != null && customrecord_bbs_gl_plugin_mappingSearch.length > 0)
		{
			for (var int = 0; int < customrecord_bbs_gl_plugin_mappingSearch.length; int++) 
				{
					var billingType = customrecord_bbs_gl_plugin_mappingSearch[int].getValue("custrecord_bbs_gl_billing_type");
					var fromAccount = customrecord_bbs_gl_plugin_mappingSearch[int].getValue("custrecord_bbs_gl_from_account");
					var toAccount = customrecord_bbs_gl_plugin_mappingSearch[int].getValue("custrecord_bbs_gl_to_account");
				
					var mapping = new glMapping(fromAccount, toAccount);
					
					returnedMapping[billingType] = mapping;
				}
		
		}
	
	return returnedMapping;
}