/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Aug 2019     cedricgriffiths
 * 1.01		  01 Oct 2019	  markanderson
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function createCaseFromQuoteAS(type)
{
	if(type == 'create')
		{
			var quoteRecord = null;
			
			try
				{
					quoteRecord = nlapiLoadRecord('estimate', nlapiGetRecordId());
				}
			catch(err)
				{
					quoteRecord = null;
				}
			
			if(quoteRecord != null)
				{
					//Get who created the record & the subsidiary
					//
					var createdBy = quoteRecord.getFieldValue('recordcreatedby');
					//var createdByText = quoteRecord.getFieldText('recordcreatedby');
					var createdByText = nlapiLookupField('employee',createdBy, 'entityid');
					var subsidiary = quoteRecord.getFieldValue('subsidiary');
					
					//make sure we have a created by & that the subsidiary is Accora Limited or Accora IE
					//
					if(createdBy != null && createdBy != '' & (subsidiary == '5' || subsidiary == '7'))
						{
							//See if they are a sales rep
							//
							var isSalesRep = nlapiLookupField('employee', createdBy, 'issalesrep', false);
							
							if(isSalesRep == 'T')
								{
									//Create a case
									//
									var caseRecord = nlapiCreateRecord('supportcase'); 
									
									//Get the customer from the quote
									//
									var customerId = quoteRecord.getFieldValue('entity');
									var customerName = quoteRecord.getFieldText('entity');
									var quoteNo = quoteRecord.getFieldValue('tranid');
									var quoteId = quoteRecord.getId();
									var contactId = quoteRecord.getFieldValue('custbody_acc_tran_contact');
									
									//Update the case record
									//
									caseRecord.setFieldValue('company', customerId);
									
									var caseProfile = null;
									
									switch(subsidiary)
										{
											case '5':				//Accora Limited
												caseProfile = '6';
												break;
												
											case '7':				//Accora IE
												caseProfile = '7';
												break;
										}
									
									caseRecord.setFieldValue('profile', caseProfile);
									caseRecord.setFieldValue('customform', 56);
									caseRecord.setFieldValue('category', 21);
									caseRecord.setFieldValue('title', 'Sales Rep Quote Created ' + quoteNo);
									caseRecord.setFieldValue('contact', contactId);
									
									//Create the case record
									//
									var caseId = null;
									
									try
										{
											caseId = nlapiSubmitRecord(caseRecord, true, true);
										}
									catch(err)
										{
											caseId = null;
											nlapiLogExecution('ERROR', 'error creating case record from quote ' + quoteNo, err.message);
										}
									
									if(caseId != null)
										{
											//Add a message to the case
											//
											var newMessage = nlapiCreateRecord('message');
											
											newMessage.setFieldValue('activity', caseId);
											newMessage.setFieldValue('author', customerId);
											newMessage.setFieldValue('incoming', 'T');
											newMessage.setFieldValue('emailed', 'F');
											newMessage.setFieldValue('message', createdByText + ' has created ' + quoteNo + '. Please double check, process and send onto the Customer. Thank you');
											newMessage.setFieldValue('subject', 'Case created from quotation');
										
											try
												{
													nlapiSubmitRecord(newMessage, true, false);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error creating message for case id ' + caseId, err.message);
												}
											
											//Attach the quote to the case
											//
											//try
											//	{
											//		nlapiAttachRecord('estimate', quoteId, 'supportcase', caseId);
											//	}
											//catch(err)
											//	{
											//		nlapiLogExecution('ERROR', 'Error attaching quote to case id ' + caseId, err.message);
											//	}
										}
								}
						}
				}
		}
}

