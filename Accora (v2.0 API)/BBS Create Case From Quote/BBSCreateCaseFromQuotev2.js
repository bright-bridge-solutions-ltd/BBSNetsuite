/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/log','N/search'],
/**
 * @param {record} record
 */
function(record,log,search) {
   
  

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) 
    {
    	if(scriptContext.type == scriptContext.UserEventType.CREATE)
		{
			var quoteRecord = null;
			
			try
				{
					var newRecord = scriptContext.newRecord;
					
					quoteRecord = record.load({type: 'estimate', id: newRecord.id});
					
				}
			catch(err)
				{
					quoteRecord = null;
				}
			
			if(quoteRecord != null)
				{
					//Get who created the record & the subsidiary
					//
					var createdBy = quoteRecord.getValue({fieldId: 'recordcreatedby'});	//quoteRecord.getFieldValue('recordcreatedby');
					var subsidiary = quoteRecord.getValue({fieldId: 'subsidiary'}); 	//quoteRecord.getFieldValue('subsidiary');
					
					//make sure we have a created by & that the subsidiary is Accora Limited or Accora IE
					//
					if(createdBy != null && createdBy != '' & (subsidiary == '5' || subsidiary == '7'))
						{
							//See if they are a sales rep
							//
							var isSalesRep = search.lookupFields({type: search.Type.EMPLOYEE, id: createdBy, columns: ['issalesrep']})['issalesrep'];  //nlapiLookupField('employee', createdBy, 'issalesrep', false);
							
							if(isSalesRep)
								{
									//Create a case
									//
									var caseRecord = record.create({type: record.Type.SUPPORT_CASE}); //nlapiCreateRecord('supportcase'); 
									
									//Get the customer from the quote
									//
									var customerId = quoteRecord.getValue({fieldId: 'entity'}); //quoteRecord.getFieldValue('entity');
									var customerName = quoteRecord.getText({fieldId: 'entity'}); //quoteRecord.getFieldText('entity');
									var quoteNo = quoteRecord.getValue({fieldId: 'tranid'}); //quoteRecord.getFieldValue('tranid');
									var quoteId = quoteRecord.id;
									
									//Update the case record
									//
									caseRecord.setValue({fieldId: 'company', value: customerId});    //caseRecord.setFieldValue('company', customerId);
									
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
									
									caseRecord.setValue({fieldId: 'profile', value: caseProfile}); //caseRecord.setFieldValue('profile', caseProfile);
									caseRecord.setValue({fieldId: 'customform', value: 56}); //caseRecord.setFieldValue('customform', 56);
									caseRecord.setValue({fieldId: 'category', value: 21}); //caseRecord.setFieldValue('category', 21);
									caseRecord.setValue({fieldId: 'title', value: 'CPQ Quote ' + quoteNo}); //caseRecord.setFieldValue('title', 'CPQ Quote ' + quoteNo);
									
									//Create the case record
									//
									var caseId = null;
									
									try
										{
											caseId =  caseRecord.save({enableSourcing: true, ignoreMandatoryFields: true}); //nlapiSubmitRecord(caseRecord, true, true);
										}
									catch(err)
										{
											caseId = null;
											//nlapiLogExecution('ERROR', 'error creating case record from quote ' + quoteNo, err.message);
										}
									
									if(caseId != null)
										{
											//Add a message to the case
											//
										/*
											var newMessage = nlapiCreateRecord('message');
											
											newMessage.setFieldValue('activity', caseId);
											newMessage.setFieldValue('author', customerId);
											newMessage.setFieldValue('incoming', 'T');
											newMessage.setFieldValue('emailed', 'F');
											newMessage.setFieldValue('message', 'CPQ Quote ' + quoteNo);
											newMessage.setFieldValue('subject', 'Case created from quotation');
										
											try
												{
													nlapiSubmitRecord(newMessage, true, false);
												}
											catch(err)
												{
													//nlapiLogExecution('ERROR', 'Error creating message for case id ' + caseId, err.message);
												}
											*/
										
											//Attach the quote to the case
											//
											try
												{
													record.attach({record: {type: record.Type.ESTIMATE, id: quoteId}, to: {type: record.Type.SUPPORT_CASE, id: caseId}});  //nlapiAttachRecord('estimate', quoteId, 'supportcase', caseId);
												}
											catch(err)
												{
													 log.error({title: 'Error attaching quote to case id ' + caseId, details: err.message}); //nlapiLogExecution('ERROR', 'Error attaching quote to case id ' + caseId, err.message);
												}
										}
								}
						}
				}
		}
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
