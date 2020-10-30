/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search'],
function(runtime, record, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	log.audit({
    		title: '*** BEGINNING OF SCRIPT ***'
    	});
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var refundRequests = currentScript.getParameter({
    		name: 'custscript_bbs_refund_requests_array'
    	});
    	
    	var refundType = parseInt(
    			currentScript.getParameter({
    				name: 'custscript_bbs_refund_type'
    			})
    	);
    	
    	var subsidiary = currentScript.getParameter({
    		name: 'custscript_bbs_subsidiary'
    	});
    	
    	var vatAccount = currentScript.getParameter({
    		name: 'custscript_bbs_vat_account'
    	});
    	
    	var vatCode = currentScript.getParameter({
    		name: 'custscript_bbs_vat_code'
    	});
    	
    	var customForm = currentScript.getParameter({
    		name: 'custscript_bbs_refund_journal_form_id'
    	});
    	
    	var loylapAccount = currentScript.getParameter({
    		name: 'custscript_bbs_loylap_deferred_account'
    	});
    	
    	// call function to return the refund requests to be processed
    	refundRequests = getRefundRequests(refundRequests);
    	
    	// loop through refund requests
    	for (var i = 0; i < refundRequests.length; i++)
    		{
    			// get the refund request ID
    			var refundRequestID = refundRequests[i];
    			
    			log.audit({
    				title: 'Processing Refund Request',
    				details: refundRequestID
    			});
    			
    			try
    				{
	    				// mark the refund request as processed
	        			record.submitFields({
	        				type: 'customrecord_refund_request',
	        				id: refundRequestID,
	        				values: {
	        					custrecord_refund_processed: true
	        				}
	        			});
	        			
	        			log.audit({
	        				title: 'Refund Request Marked as Processed',
	        				details: refundRequestID
	        			});
    				}
    			catch(e)
    				{
	    				log.error({
	        				title: 'Error Marking Refund Request as Processed',
	        				details: 'Record ID: ' + refundRequestID + '<br>Error: ' + e.message
	        			});
    				}
    		}
    	
    	// lookup fields on the subsidiary record
		var subsidiaryInfo = getSubsidiaryInfo(subsidiary);
    	
    	// declare and initialize variables
    	var creditGLAccount = null;
    	
    	// if the refund type is NOT 3 (SagePay)
    	if (refundType != 3)
    		{
    			// switch the refund type
    			switch(refundType) {
    				
    				case 1:
    					refundType = 'Bank payment';
    					creditGLAccount = subsidiaryInfo.bankaccount;
    					break;
    				
    				case 2:
    					refundType = 'Giftcard (Loylap)';
    					creditGLAccount = loylapAccount;
    					break;
    				
    			}
    		
    			/*
    			 * now we have marked the records as processed, we need to create a journal
    			 */
    		
    			try
    				{
    					// create a new journal record
    					var journalRec = record.create({
    						type: record.Type.JOURNAL_ENTRY,
    						isDynamic: true,
    						defaultValues: {
    							customform: customForm
    						}
    					});
    					
    					// set header fields on the journal
    					journalRec.setValue({
    						fieldId: 'subsidiary',
    						value: subsidiary
    					});
    					
    					journalRec.setValue({
    						fieldId: 'memo',
    						value: 'Refund - ' + refundType
    					});
    					
    					journalRec.setValue({
    						fieldId: 'approvalstatus',
    						value: 2 // 2 = Approved
    					});
    					
    					// declare and initialize variables
    					var creditTotal = 0;
    					
    					// call function to return amounts for the selected refund requests
    					searchRefundRequests(refundRequests).run().each(function(result) {
    						
    						// get the amount from the search result
    						var amount = parseFloat(result.getValue({
    							name: 'custrecord_refund_amount'
    						}));
    						
    						var customerName = result.getValue({
    							name: 'custrecord_refund_customer_name'
    						});
    						
    						var location = result.getValue({
    							name: 'custrecord_refund_location'
    						});
    						
    						var businessArea = result.getValue({
    							name: 'custrecord_refund_business_area'
    						});
    						
    						var annualMembership = convertToNonBoolean(result.getValue({
    							name: 'custrecord_refund_annual_mem'
    						}));
    						
    						// call function to return the GL mapping
    						var glMapping = getGLMapping(businessArea, annualMembership);
    						
    						// set fields on the new journal
    						journalRec.selectNewLine({
    							sublistId: 'line'
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'account',
    							value: glMapping.glAccount
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'debit',
    							value: amount
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'taxcode',
    							value: vatCode
    						});

    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'tax1acct',
    							value: vatAccount
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'grossamt',
    							value: amount
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'memo',
    							value: customerName
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'department',
    							value: glMapping.department
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'class',
    							value: glMapping.lineOfBusiness
    						});
    						
    						journalRec.setCurrentSublistValue({
    							sublistId: 'line',
    							fieldId: 'location',
    							value: location
    						});
    						
    						journalRec.commitLine({
    							sublistId: 'line'
    						});
    						
    						// add the amount to the creditTotal variable
    						creditTotal += amount;
    						
    						// continue processing search results
    						return true;
    						
    					});
    					
    					// add a line to credit balances from the relevant account
    					journalRec.selectNewLine({
							sublistId: 'line'
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: creditGLAccount
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'credit',
							value: creditTotal
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'memo',
							value: 'Refund - ' + refundType
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'department',
							value: subsidiaryInfo.department
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'class',
							value: subsidiaryInfo.lineofbusiness
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'location',
							value: subsidiaryInfo.location
						});
						
						journalRec.commitLine({
							sublistId: 'line'
						});
						
						// save the journal record
						var journalID = journalRec.save();
						
						log.audit({
							title: 'Journal Record Created',
							details: journalID
						});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Creating Journal Record',
    						details: e.message
    					});
    				}
    				
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getRefundRequests(refundRequests) {
    	
    	// replace characters in the string
    	refundRequests = refundRequests.replace('[', '');
    	refundRequests = refundRequests.replace(/"/g, ''); // replace ALL instances
    	refundRequests = refundRequests.replace(']', '');
    	
    	// split refundRequests string into an array and return to the main script function
    	return refundRequests.split(',');
    	
    }
    
    function searchRefundRequests(refundRequests) {
    	
    	return search.create({
    		type: 'customrecord_refund_request',
    		
    		filters: [{
    			name: 'internalid',
    			operator: search.Operator.ANYOF,
    			values: refundRequests
    		}],
    		
    		columns: [{
    			name: 'custrecord_refund_amount'
    		},
    				{
    			name: 'custrecord_refund_customer_name'
    		},
    				{
    			name: 'custrecord_refund_location'
    		},
    				{
    			name: 'custrecord_refund_business_area'
    		},
    				{
    			name: 'custrecord_refund_annual_mem'
    		}],
    		
    	});
    	
    }
    
    function getGLMapping(businessArea, annualMembership) {
    	
    	// declare and initialize variables
    	var glAccount		= null;
    	var lineOfBusiness	= null;
    	var department		= null;
    	
    	// run search to retrieve the GL mapping
    	search.create({
    		type: 'customrecord_bbs_refund_jnl_gl_map',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_refund_jnl_gl_map_busarea',
    			operator: search.Operator.ANYOF,
    			values: [businessArea]
    		},
    				{
    			name: 'custrecord_bbs_ref_jnl_gl_map_pro_rata',
    			operator: search.Operator.IS,
    			values: [annualMembership]
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_refund_jnl_gl_map_gl_acc'
    		},
    				{
    			name: 'custrecord_bbs_refund_jnl_gl_map_lob'
    		},
    				{
    			name: 'custrecord_bbs_refund_jnl_gl_map_dept'
    		}],
    		
    	}).run().each(function(result) {
    		
    		// retrieve search results
    		glAccount = result.getValue({
    			name: 'custrecord_bbs_refund_jnl_gl_map_gl_acc'
    		});
    		
    		lineOfBusiness = result.getValue({
    			name: 'custrecord_bbs_refund_jnl_gl_map_lob'
    		});
    		
    		department = result.getValue({
    			name: 'custrecord_bbs_refund_jnl_gl_map_dept'
    		});
    		
    	});
    	
    	// return values to the main script function
    	return {
    		glAccount: 		glAccount,
    		lineOfBusiness:	lineOfBusiness,
    		department:		department  		
    	}	
    	
    }
    
    function getSubsidiaryInfo(subsidiaryID) {
    	
    	// declare and initialize variables
    	var bankAccount 	= null;
    	var department		= null;
    	var lineOfBusiness	= null;
    	var location		= null;
    	
    	// lookup fields on the subsidiary record
    	var subsidiaryLookup = search.lookupFields({
    		type: search.Type.SUBSIDIARY,
    		id: subsidiaryID,
    		columns: ['custrecord_bbs_bank_gl_account', 'custrecord_bbs_intercompany_gl_account', 'custrecord_bbs_default_department', 'custrecord_bbs_default_line_of_business', 'custrecord_bbs_default_location']
    	});
    	
    	
    	// if we have an intercompany GL account selected on the subsidiary
    	if (subsidiaryLookup.custrecord_bbs_intercompany_gl_account.length > 0)
    		{
    			// get the internal ID of the intercompany GL account
    			bankAccount = subsidiaryLookup.custrecord_bbs_intercompany_gl_account[0].value;
    		}
    	else
    		{
    			// get the internal ID of the GL bank account
    			bankAccount = subsidiaryLookup.custrecord_bbs_bank_gl_account[0].value;
    		}
    	
    	// if we have a department selected on the subsidiary
    	if (subsidiaryLookup.custrecord_bbs_default_department.length > 0)
    		{
    			// get the internal ID of the department
    			department = subsidiaryLookup.custrecord_bbs_default_department[0].value;
    		}
    	
    	// if we have a line of business selected on the subsidiary
    	if (subsidiaryLookup.custrecord_bbs_default_line_of_business.length > 0)
    		{
    			// get the internal ID of the line of business
    			lineOfBusiness = subsidiaryLookup.custrecord_bbs_default_line_of_business[0].value;
    		}
    	
    	// if we have a location selected on the subsidiary
    	if (subsidiaryLookup.custrecord_bbs_default_location.length > 0)
    		{
    			// get the internal ID of the location
    			location = subsidiaryLookup.custrecord_bbs_default_location[0].value;
    		}
    	
    	return {
    		bankaccount:	bankAccount,
    		department:		department,
    		lineofbusiness:	lineOfBusiness,
    		location:		location
    	}
    	
    }
    
    function convertToNonBoolean(inputValue) {
    	
    	if (inputValue == true)
    		{
    			return 'T';
    		}
    	else if (inputValue == false)
    		{
    			return 'F';
    		}
    	
    }

    return {
        execute: execute
    };
    
});
