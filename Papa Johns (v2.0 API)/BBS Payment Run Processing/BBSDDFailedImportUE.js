/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime','N/record', 'N/transaction', 'N/search'],
function(runtime, record, transaction, search) 
{
   
    
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
	    	//Get the current record
			//
	    	var currentRecord 		= scriptContext.newRecord;
	    	var currentRecordType	= currentRecord.type;
	    	var currentRecordId		= currentRecord.id;
	    	var ddImportRecord		= null;
	    	
	    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
				{
	    			//Load the record
	    			//
	    			try
	    				{
		    				ddImportRecord = record.load({
		    											type:		currentRecordType,
		    											id:			currentRecordId,
		    											isDynamic:	true
		    											});			
	    				}
	    			catch(err)
	    				{
	    					log.error({title: 'Error loading failed dd import record', details: err});
	    					ddImportRecord = null;
	    				}
	    			
	    			//Did the record load ok
	    			//
	    			if(ddImportRecord != null)
	    				{
	    					//Get the main values from the import record
	    					//
		    				var originatingSortCode		= ddImportRecord.getValue({fieldId: 'custrecord_bbs_failed_dd_orig_sort'});
		    				var originatingAccountNo	= ddImportRecord.getValue({fieldId: 'custrecord_bbs_failed_dd_orig_acc'});
		    				var amount					= Number(ddImportRecord.getValue({fieldId: 'custrecord_bbs_failed_dd_amount'})) / 100.00;
		    				var reason					= ddImportRecord.getValue({fieldId: 'custrecord_bbs_failed_dd_reason'});
		    				var paymentReference		= ddImportRecord.getValue({fieldId: 'custrecord_bbs_failed_dd_pay_ref'});
		    				var claimDate				= ddImportRecord.getValue({fieldId: 'custrecord_bbs_failed_dd_claim_date'});
		    				var submissionDate			= ddImportRecord.getValue({fieldId: 'custrecord_bbs_failed_dd_sub_date'});
		    				
		    				//Find the matching customer based on sort code, account code & payment reference
		    				//
		    				var customerSearchObj = getResults(search.create({
		    					  											type: 		"customer",
		    					  											filters:
		    					  														[
															    					      ["custentity_2663_direct_debit","is","T"], 
															    					      "AND", 
															    					      ["custrecord_2663_parent_customer.custrecord_2663_entity_branch_no","is",originatingSortCode], 
															    					      "AND", 
															    					      ["custrecord_2663_parent_customer.custrecord_2663_entity_acct_no","is",originatingAccountNo], 
															    					      "AND", 
															    					      ["custrecord_2663_parent_customer.custrecord_2663_entity_payment_desc","is",paymentReference]
															    					     ],
															    			columns:
																    					   [
																    					      search.createColumn({name: "internalid", label: "Internalid"}),
																    					      search.createColumn({name: "entityid", label: "ID"}),
																    					      search.createColumn({name: "altname",sort: search.Sort.ASC,label: "Name"}),
																    					      search.createColumn({name: "custentity_pj_storename", label: "Store Name"}),
																    					      search.createColumn({name: "custentity_pj_storeid", label: "Store ID"}),
																    					      search.createColumn({name: "custentity_bbs_franchise_owner", label: "Franchise Owner"}),
																    					      search.createColumn({name: "custrecord_2663_entity_acct_name",join: "CUSTRECORD_2663_PARENT_CUSTOMER",label: "Bank Account Name"}),
																    					      search.createColumn({name: "custrecord_2663_entity_branch_no",join: "CUSTRECORD_2663_PARENT_CUSTOMER",label: "Branch Number"}),
																    					      search.createColumn({name: "custrecord_2663_entity_acct_no",join: "CUSTRECORD_2663_PARENT_CUSTOMER",label: "Bank Account Number"}),
																    					      search.createColumn({name: "custrecord_2663_entity_payment_desc",join: "CUSTRECORD_2663_PARENT_CUSTOMER",label: "Bank Account Payment Description"})
																    					   ]
		    																}));
		    				
		    				//Did we find any results
		    				//
		    				if(customerSearchObj != null && customerSearchObj.length > 0)
		    					{
		    						//Get the customer id's
		    						//
		    						var customersObj 	= {};
		    						var customerArray	= [];
		    						
		    						for (var int = 0; int < customerSearchObj.length; int++) 
			    						{
		    								var customerId 				= customerSearchObj[int].getValue({name: "internalid"});
		    								customersObj[customerId] 	= customerId;
										}
		    						
		    						for ( var customer in customersObj) 
			    						{
		    								customerArray.push(customer);
										}
		    						
		    						
		    						//See if we can find a payment transaction 
		    						//
		    						var customerpaymentSearchObj = getResults(search.create({
														    							   type: "customerpayment",
														    							   filters:
														    							   [
														    							      ["type","anyof","CustPymt"], 
														    							      "AND", 
														    							      ["mainline","is","T"], 
														    							      "AND", 
														    							      ["name","anyof",customerArray], 
														    							      "AND", 
														    							      ["memo","isnot","VOID"], 
														    							      "AND", 
														    							      ["amount","equalto",amount], 
														    							      "AND", 
														    							      ["trandate","within",submissionDate,claimDate]
														    							   ],
														    							   columns:
														    							   [
														    							      search.createColumn({name: "trandate",sort: search.Sort.DESC,label: "Date"}),
														    							      search.createColumn({name: "tranid", label: "Document Number"}),
														    							      search.createColumn({name: "amount", label: "Amount"}),
														    							      search.createColumn({name: "internalid", label: "Internal ID"})
														    							   ]
														    							}));
		    						
		    						//Did we find a transaction
		    						//
		    						if(customerpaymentSearchObj != null && customerpaymentSearchObj.length == 1)
		    							{
		    								//Get the payment id
		    								//
		    								var paymentId = customerpaymentSearchObj[0].getValue({name: "internalid"});
		    								
		    								//Void the payment
		    								//
		    								var voidedId = null;
		    								
		    								try
		    									{
		    										voidedId = transaction.void({
		    																	type:	transaction.Type.CUSTOMER_PAYMENT,
		    																	id:		paymentId
		    																	});
		    									}
		    								catch(err)
		    									{
		    										voidedId = null;
		    										log.error({title: 'Error voiding payment record id = ' + paymentId, details: err});
		    									}
		    								
		    								//Did the payment void ok?
		    								//
		    								if(voidedId != null)
		    									{
		    										//Update the voided payment with the bounced DD amount
		    										//
		    										try
		    											{
				    										record.submitFields({
				    															type:		record.Type.CUSTOMER_PAYMENT,
				    															id:			voidedId,
				    															values:		{
				    																		custbody_pj_bo:	amount
				    																		},
				    															options:	{
				    																		ignoreMandatoryFields:	true
				    																		}
				    															});
		    											}
		    										catch(err)
		    											{
		    												log.error({title: 'Error updating voided payment record id = ' + voidedId, details: err});
		    											}
		    										
		    										//Update the failed dd import record with the link to the voided payment transaction
		    										//
		    										try
		    											{
				    										record.submitFields({
				    															type:		currentRecordType,
				    															id:			currentRecordId,
				    															values:		{
				    																		custrecord_bbs_failed_dd_pay_trans:		voidedId,
				    																		custrecord_bbs_failed_dd_pay_message:	''
				    																		},
				    															options:	{
				    																		ignoreMandatoryFields:	true
				    																		}
				    															});
		    											}
		    										catch(err)
		    											{
		    												log.error({title: 'Error updating failed dd import record with payment transaction id = ' + currentRecordId, details: err});
		    											}
		    									}
		    							}
		    						else
		    							{
			    							//None or multiple payment matches 
				    						//
				    						var message = '';
				    						
				    						if(customerpaymentSearchObj == null || customerpaymentSearchObj.length == 0)
				    							{
				    								//No match
				    								//
				    								message = 'No matching payments found';
				    							}
				    						
				    						if(customerpaymentSearchObj != null && customerpaymentSearchObj.length > 1)
				    							{
				    								//Multiple matches
				    								//
				    								message = 'Multiple matching payments found, payments (';
				    								
				    								for (var int = 0; int < customerpaymentSearchObj.length; int++) 
					    								{
															var entity = customerpaymentSearchObj[int].getValue({name: "tranid"});
															message += entity + ', ';
														}
				    								
				    								message += ')';
				    							}
				    						
				    						//Update the failed dd import record with the failure message
											//
											try
												{
		    										record.submitFields({
		    															type:		currentRecordType,
		    															id:			currentRecordId,
		    															values:		{
		    																		custrecord_bbs_failed_dd_pay_message:	message,
		    																		custrecord_bbs_failed_dd_pay_trans:		null
		    																		},
		    															options:	{
		    																		ignoreMandatoryFields:	true
		    																		}
		    															});
												}
											catch(err)
												{
													log.error({title: 'Error updating failed dd import record with message id = ' + currentRecordId, details: err});
												}
		    							}
		    					}
		    				else
		    					{
		    						//None or multiple customer matches on bank details
		    						//
		    						var message = '';
		    						
		    						if(customerSearchObj == null || customerSearchObj.length == 0)
		    							{
		    								//No match
		    								//
		    								message = 'No matching customer bank details found';
		    							}
		    						
		    						if(customerSearchObj != null && customerSearchObj.length > 1)
		    							{
		    								//Multiple matches
		    								//
		    								message = 'Multiple matching customer bank details found, customers (';
		    								
		    								for (var int = 0; int < customerSearchObj.length; int++) 
			    								{
													var entity = customerSearchObj[int].getValue({name: "entityid"});
													message += entity + ', ';
												}
		    								
		    								message += ')';
		    							}
		    						
		    						//Update the failed dd import record with the failure message
									//
									try
										{
    										record.submitFields({
    															type:		currentRecordType,
    															id:			currentRecordId,
    															values:		{
    																		custrecord_bbs_failed_dd_pay_message:	message,
    																		custrecord_bbs_failed_dd_pay_trans:		null
    																		},
    															options:	{
    																		ignoreMandatoryFields:	true
    																		}
    															});
										}
									catch(err)
										{
											log.error({title: 'Error updating failed dd import record with message id = ' + currentRecordId, details: err});
										}
		    					}
	    				}
				}
	    }

    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }

    return 	{
	        afterSubmit: 	afterSubmit
    		};
    
});
