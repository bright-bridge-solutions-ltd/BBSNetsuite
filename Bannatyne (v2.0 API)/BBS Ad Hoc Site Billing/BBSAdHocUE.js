/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/config', 'N/runtime', 'N/record', 'N/format', 'N/search', 'N/url'],
function(config, runtime, record, format, search) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	depositItem = currentScript.getParameter({
    	name: 'custscript_bbs_deposit_item'
    });
	
	invoiceForm = currentScript.getParameter({
		name: 'custscript_bbs_ad_hoc_invoice_form'
	});
	
	paymentTerms = currentScript.getParameter({
		name: 'custscript_bbs_ad_hoc_site_payment_terms'
	});
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
		
		// check the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the internal ID of the current record
    			var currentRecordID = currentRecord.id;
    			
    			// get the value of the approval status field
    			var approvalStatus = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_ad_hoc_site_app_status'
    			});
    			
    			// check the approval status is 2 (Pending Approval)
    			if (approvalStatus == 2)
    				{
    					// get the ID of the record
    					var recordID = currentRecord.id;
    				
    					// set client script to run on the form
    					scriptContext.form.clientScriptFileId = 406811;
    					
    					// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Rejected',
			    			functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID
			    		});
    				}
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    	// check if the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{   	
	    		// get the oldrecord and newrecord objects
    			var oldRecord = scriptContext.oldRecord;
    			var newRecord = scriptContext.newRecord;
    			
    			// get the ID of the current record
        		var currentRecordID = scriptContext.newRecord.id;
        		
        		// get the value of the approval status field from the oldRecord object
    			var oldApprovalStatus = oldRecord.getValue({
    				fieldId: 'custrecord_bbs_ad_hoc_site_app_status'
    			});
    			
    			// get the value of the approval status field from the newRecord object
    			var newApprovalStatus = newRecord.getValue({
    				fieldId: 'custrecord_bbs_ad_hoc_site_app_status'
    			});
    			
    			// get the value of the contract terminated checkbox field from the oldRecord object
    			var oldContractTerminated = oldRecord.getValue({
    				fieldId: 'custrecord_bbs_ad_hoc_site_con_terminate'
    			});
    			
    			// get the value of the contract terminated checkbox field from the newRecord object
    			var newContractTerminated = newRecord.getValue({
    				fieldId: 'custrecord_bbs_ad_hoc_site_con_terminate'
    			});			
    			
    			// check if the oldStatus variable returns 2 (Pending Approval) and the newStatus variable returns 1 (Approved)
    			if (oldApprovalStatus == 2 && newApprovalStatus == 1)
    				{
    					// get the value of the customer field from the newRecord object
    					var customerID = newRecord.getValue({
    						fieldId: 'custrecord_bbs_ad_hoc_site_customer'
    					});
    				
    					// if we do not have a customer
    					if (!customerID)
    						{
    							// call function to check if we have an existing customer. Pass newRecord object
								customerID = findCustomer(newRecord);
								
								// if we have not found an existing customer
								if (!customerID)
									{
										// call function to create a customer record. Pass newRecord object and currentRecordID. ID of created customer will be returned
        								customerID = createCustomer(newRecord, currentRecordID);	
									}
    						}
						
						// check that we have a customerID
						if (customerID)
							{
		    					// get the value of the agreement date field from the newRecord object
				    			var agreementDate = newRecord.getValue({
				    				fieldId: 'custrecord_bbs_ad_hoc_site_agree_date'
				    			});
				    			
				    			// format agreementDate as a date object
				    			agreementDate = format.parse({
				    				type: format.Type.DATE,
				    				value: agreementDate
				    			});
				    			
				    			// get today's date
				    			var today = new Date();
		    				
		    					// check that the agreement date is this month and the agreement date is this year
		    					if (agreementDate.getMonth()+1 == today.getMonth()+1 && agreementDate.getFullYear() == today.getFullYear())
		    						{
			    						// get the value of the 'Do Not Issue Deposit Invoice' checkbox from the newRecord object
			        					var noDepositInvoice = newRecord.getValue({
			        						fieldId: 'custrecord_bbs_ad_hoc_site_no_dep_inv'
			        					});
			        					
			        					// get the value of the 'Do Not Issue Pro Forma Invoice' checkbox from the newRecord object
			        					var noProFormaInvoice = newRecord.getValue({
			        						fieldId: 'custrecord_bbs_ad_hoc_site_no_pro_forma'
			        					});
			        					
			        					// check that the noDepositInvoice variable returns false
			        					if (noDepositInvoice == false)
			        						{
				        						// set invoiceType
			        							var invoiceType = 1; // 1 = Deposit
			        						
			        							// call function to create a deposit invoice. Pass newRecord, currentRecordID, customerID and invoiceType
					    	        			createDepositInvoice(newRecord, currentRecordID, customerID, invoiceType);
			        						}
			        					
			        					// check if the noProFormaInvoice variable returns false
			        					if (noProFormaInvoice == false)
			        						{
				        						// get the value of the stepped rent field from the newRecord object
					    						var steppedRent = newRecord.getValue({
					    							fieldId: 'custrecord_bbs_ad_hoc_site_stepped_rent'
					    						});
					    						
					    						// check if the steppedRent variable returns 1 (Rent is Stepped)
					    						if (steppedRent == '1')
					    							{
					    								// get the value of the '1st Step Amount' field
					    								var monthlyAmount = newRecord.getValue({
					    									fieldId: 'custrecord_bbs_ad_hoc_site_step_1_amt'
					    								});
					    							}
					    						else // rent is NOT stepped
					    							{
					    								// get the value of the monthly amount field
					    					    		var monthlyAmount = newRecord.getValue({
					    					    			fieldId: 'custrecord_bbs_ad_hoc_site_monthly_amt'
					    					    		});
					    							}
					    						
					    						// get the start date of the contract
					    			    		var startDate = newRecord.getValue({
					    			    			fieldId: 'custrecord_bbs_ad_hoc_site_start_date'
					    			    		});
					    			    		
					    			    		// format startDate as a date object
					    			    		startDate = format.parse({
					    							type: format.Type.DATE,
					    							value: startDate
					    						});
					    			    		
					    			    		// get the day of the month from the startDate object
					    						var startDay = startDate.getDate();
					    						
					    						// call function to calculate number of days in the current month
							    				var daysInMonth = getDaysInMonth(startDate.getMonth(), startDate.getFullYear());
							    						
							    				// divide monthlyAmount by daysInMonth to calculate dailyAmount
							    				var dailyAmount = (monthlyAmount / daysInMonth);
							    						
							    				// calculate the days remaining in the month by subtracting startDay from daysInMonth
							    				var daysRemaining = ((daysInMonth - startDay) + 1);
							    						
							    				// multiply dailyAmount by daysRemaining to calculate the pro rata invoice amount
							    				var invoiceAmount = parseFloat(dailyAmount * daysRemaining);
							    				invoiceAmount = invoiceAmount.toFixed(2);
			        						
					    						// set invoice type
					    						var invoiceType = 3; // 3 = Pro-Rata
					    						
					    						// call function to create a pro rata invoice. Pass newRecord, currentRecordID, customerID, invoiceAmount, invoiceType
					        					createProRataInvoice(newRecord, currentRecordID, customerID, invoiceAmount, invoiceType);
			        						}
		    						}
		
								// call function to update the ad hoc site record with the customer. Pass currentRecordID and customerID variables
								updateAdHocSiteRecord(currentRecordID, customerID);
							}
    				}
    			// check if the oldContractTerminated variable returns false and the newContractTerminated variable returns true
    			else if (oldContractTerminated == false && newContractTerminated == true)
    				{
    					// declare and initiate variables
    					var monthlyAmount;
    				
    					// get today's date
    					var today = new Date();
    					today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    					
    					// get the value of the customer field from the newRecord object
    					var customerID = newRecord.getValue({
    						fieldId: 'custrecord_bbs_ad_hoc_site_customer'
    					});
    				
    					// get the value of the 'Contract Termination Date' field from the newRecord object
    					var terminationDate = newRecord.getValue({
    						fieldId: 'custrecord_bbs_ad_hoc_site_con_term_date'
    					});
    					
    					// check that we have the terminationDate variable returns a value
    					if (terminationDate)
    						{
	    						// get the value of the stepped rent field from the newRecord object
	    						var steppedRent = newRecord.getValue({
	    							fieldId: 'custrecord_bbs_ad_hoc_site_stepped_rent'
	    						});
	    						
	    						// check if the steppedRent variable returns 1 (Rent is Stepped)
	    						if (steppedRent == '1')
	    							{
	    								// get the value of the step dates from the newRecord object
	    								var step1Date = newRecord.getValue({
	    									fieldId: 'custrecord_bbs_ad_hoc_site_step_1_date'
	    								});
	    								
	    								var step2Date = newRecord.getValue({
	    									fieldId: 'custrecord_bbs_ad_hoc_site_step_2_date'
	    								});
	    								
	    								var step3Date = newRecord.getValue({
	    									fieldId: 'custrecord_bbs_ad_hoc_site_step_3_date'
	    								});
	    								
	    								var step4Date = newRecord.getValue({
	    									fieldId: 'custrecord_bbs_ad_hoc_site_step_4_date'
	    								});
	    								
	    								var step5Date = newRecord.getValue({
	    									fieldId: 'custrecord_bbs_ad_hoc_site_step_5_date'
	    								});
	    								
	    								// get the step1Amount from the newRecord object and set the monthlyAmount variable using this value
	    								monthlyAmount = newRecord.getValue({
	    									fieldId: 'custrecord_bbs_ad_hoc_site_step_1_amt'
	    								});
					
										// check if the step1Date variable returns a value
	    								if (step1Date)
	    									{
	    										// format step1Date as a date object
	    										step1Date = format.parse({
	    											type: format.Type.DATE,
	    											value: step1Date
	    										});
	    									
	    										// check if today is after the step 1 date
	    										if (today.getTime() > step1Date.getTime())
	    											{
	    												// get the step2Amount from the newRecord object and set the monthlyAmount variable using this value
	    												monthlyAmount = newRecord.getValue({
	    			    									fieldId: 'custrecord_bbs_ad_hoc_site_step_2_amt'
	    			    								});
									
														// check if the step2Date variable returns a value
	    												if (step2Date)
	    													{
	    														// format step2Date as a date object
	    														step2Date = format.parse({
	    															type: format.Type.DATE,
	    															value: step2Date
	    														});
	    													
	    														// check if today is after the step 2 date
	    														if (today.getTime() > step2Date.getTime())
	    															{
	    																// get the step3Amount from the newRecord object and set the monthlyAmount variable using this value
	    																monthlyAmount = newRecord.getValue({
	    							    									fieldId: 'custrecord_bbs_ad_hoc_site_step_3_amt'
	    							    								});
													
																		// check if the step3Date variable returns a value
	    																if (step3Date)
	    																	{
	    																		// format step3Date as a date object
	    																		step3Date = format.parse({
	    																			type: format.Type.DATE,
	    																			value: step3Date
	    																		});
	    																	
	    																		// check if today is after the step 3 date
	    																		if (today.getTime() > step3Date.getTime())
	    																			{
	    																				// get the step4Amount from the newRecord object and set the monthlyAmount variable using this value
	    																				monthlyAmount = newRecord.getValue({
	    											    									fieldId: 'custrecord_bbs_ad_hoc_site_step_4_amt'
	    											    								});
																	
																						// check if the step4Date variable returns a value
	    																				if (step4Date)
	    																					{
	    																						// format step4Date as a date object
	    																						step4Date = format.parse({
	    																							type: format.Type.DATE,
	    																							value: step4Date
	    																						});
	    																					
	    																						// check if today is after the step 4 date
	    																						if (today.getTime() > step4Date.getTime())
	    																							{
	    																								// get the step5Amount from the newRecord object and set the monthlyAmount variable using this value
	    																								monthlyAmount = newRecord.getValue({
	    															    									fieldId: 'custrecord_bbs_ad_hoc_site_step_5_amt'
	    															    								});
	    																							}
	    																					}
	    																			}
	    																	}
	    															}
	    													}
	    											}
	    									}
	    							}
	    						else // stepped rent is 2 (No)
	    							{
	    								// get the value of the monthly amount field from the newRecord object and set the monthlyAmount variable using this value
	    								monthlyAmount = newRecord.getValue({
	    									fieldId: 'custrecord_bbs_ad_hoc_site_monthly_amt'
	    								});	    								
	    							}
	    						
	    						// format terminationDate as a date object
	    						terminationDate = format.parse({
	    							type: format.Type.DATE,
	    							value: terminationDate
	    						});
	    						
	    						// get the day from the terminationDate object
	    						var endDay = terminationDate.getDate();
	    						
	    						// call function to calculate number of days in the termination date's month
			    				var daysInMonth = getDaysInMonth(terminationDate.getMonth(), terminationDate.getFullYear());
			    						
			    				// divide monthlyAmount by daysInMonth to calculate dailyAmount
			    				var dailyAmount = (monthlyAmount / daysInMonth);
			    						
			    				// calculate the days remaining in the month by subtracting endDay from daysInMonth
			    				var daysRemaining = (daysInMonth - (endDay+1));
			    						
			    				// multiply dailyAmount by daysRemaining to calculate the pro rata invoice amount
			    				var invoiceAmount = parseFloat(dailyAmount * daysRemaining);
			    				invoiceAmount = invoiceAmount.toFixed(2);
	    						
	    						// declare invoiceType
	    						var invoiceType = 4; // 4 = Termination
	    						
	    						// call function to create a pro rata invoice. Pass newRecord, currentRecordID, customerID, invoiceAmount and invoiceType
	        					createProRataInvoice(newRecord, currentRecordID, customerID, invoiceAmount, invoiceType);
    						}
    				}
    		}

    }
    
    /*
	* ==================================================
	* FUNCTION TO SEARCH FOR AN EXISTING CUSTOMER RECORD
	* ==================================================
	*/
	
	function findCustomer(adHocSiteRecord)
		{
			// declare and initialize variables
			var customerRecord = null;
			
			// get field values from the adHocSiteRecord object
			var email = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_email'
    		});
    		
    		var phone = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_phone'
    		});

			// run search to find customers for this email address or phone number
			search.create({
				type: search.Type.CUSTOMER,
				
				filters: [
    		            ['isinactive', 'is', 'F'],
    		            	'AND',
    		            [
    		              	['email', 'is', email],
    		              	'OR',
    		              	['phone', 'contains', phone]
    		          	]
    		             
    		          ],
			
				columns: [{
					name: 'internalid'
				}],
				
			}).run().each(function(result){
				
				// get the internal ID of the customer from the search
				customerRecord = result.getValue({
					name: 'internalid'
				});
				
			});
			
			// return customerRecord variable
			return customerRecord;
		
		}


	/*
     * ========================================
     * FUNCTION TO CREATE A NEW CUSTOMER RECORD
     * ========================================
     */
    
    function createCustomer(adHocSiteRecord, adHocSiteID)
	    {
	    	// declare and initialize variables
    		var customerID = null;
    	
    		// get field values from the adHocSiteRecord object
    		var adHocReference = adHocSiteRecord.getValue({
    			fieldId: 'name'
    		});
    	
    		var subsidiary = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_subsidiary'
    		});
    		
    		var firstName = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_first_name'
    		});
    		
    		var lastName = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_surname'
    		});
    	
    		var companyName = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_company_name'
    		});
    		
    		var companyNo = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_company_no'
    		});
    		
    		var email = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_email'
    		});
    		
    		var phone = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_phone'
    		});
    		
    		var address1 = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_address_1'
    		});
    		
    		var address2 = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_address_2'
    		});
    		
    		var addressCity = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_city'
    		});
    		
    		var addressCounty = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_county'
    		});
    		
    		var addressPostcode = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_postcode'
    		});
    		
    		var bankAccountName = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_bank_acc_name'
    		});
    			
    		var bankAccountNo = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_bank_acc_no'
    		});
    			
    		var bankAccountSortCode = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_bank_acc_sort'
    		});
    	
    		try
	    		{
	    			// create a new customer record
    				var customerRecord = record.create({
    					type: record.Type.CUSTOMER,
    					isDynamic: true
    				});
    				
    				// set fields on the new customer record
    				customerRecord.setValue({
    					fieldId: 'isperson',
    					value: 'T'
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'emailtransactions',
    					value: true
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'subsidiary',
    					value: subsidiary
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'firstname',
    					value: firstName
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'lastname',
    					value: lastName
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'companyname',
    					value: companyName
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'custentity6',
    					value: companyNo
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'email',
    					value: email
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'phone',
    					value: phone
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'category',
    					value: 1 // 1 = Ad Hoc
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'custentity_2663_direct_debit',
    					value: true
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'terms',
    					value: paymentTerms
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'accountnumber',
    					value: adHocReference
    				});
    				
    				// add a new line to the address sublist
    				customerRecord.selectNewLine({
    					sublistId: 'addressbook'
    				});
    				
    				// select the address subrecord
    				var addressSubrecord = customerRecord.getCurrentSublistSubrecord({
    				    sublistId: 'addressbook',
    				    fieldId: 'addressbookaddress'
    				});
    				
    				// set fields on the sublist record
    				addressSubrecord.setValue({
    					fieldId: 'defaultbilling',
    					value: true
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'defaultshipping',
    					value: true
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'attention',
    					value: firstName + ' ' + lastName
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'addressee',
    					value: companyName
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'addr1',
    					value: address1
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'addr2',
    					value: address2
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'city',
    					value: addressCity
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'state',
    					value: addressCounty
    				});
    				
    				addressSubrecord.setValue({
    					fieldId: 'zip',
    					value: addressPostcode
    				});
    				
    				// commit the new address line
    				customerRecord.commitLine({
						sublistId: 'addressbook'
					});
    				
    				// submit the new customer record
	    			customerID = customerRecord.save({
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			// create a new 'Entity Bank Details' record
	    			var bankDetailsRecord = record.create({
	    				type: 'customrecord_2663_entity_bank_details'
	    			});
	    			
	    			// set fields on the new bank details record
	    			bankDetailsRecord.setValue({
	    				fieldId: 'custrecord_2663_parent_customer',
	    				value: customerID
	    			});
	    			
	    			bankDetailsRecord.setValue({
	    				fieldId: 'name',
	    				value: companyName
	    			});
	    			
	    			bankDetailsRecord.setValue({
	    				fieldId: 'custrecord_2663_entity_file_format',
	    				value: 42 // 42 = BACS DD
	    			});
	    			
	    			bankDetailsRecord.setValue({
	    				fieldId: 'custrecord_2663_entity_bank_type',
	    				value: 1 // 1 = Primary
	    			});
	    			
	    			bankDetailsRecord.setValue({
	    				fieldId: 'custrecord_2663_entity_acct_no',
	    				value: bankAccountNo
	    			});
	    			
	    			bankDetailsRecord.setValue({
	    				fieldId: 'custrecord_2663_entity_acct_name',
	    				value: bankAccountName
	    			});
	    			
	    			bankDetailsRecord.setValue({
	    				fieldId: 'custrecord_2663_entity_branch_no',
	    				value: bankAccountSortCode
	    			});
	    			
	    			bankDetailsRecord.setValue({
	    				fieldId: 'custrecord_2663_entity_payment_desc',
	    				value: 'Bannatyne ' + adHocReference
	    			});
	    			
	    			// submit the bankDetailsRecord
	    			bankDetailsRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'New Customer Record Created',
	    				details: 'Ad Hoc Site: ' + adHocSiteID + ' | Customer ID: ' + customerID
	    			});			
	    		}
    		catch(error)
    			{
    				log.error({
    					title: 'Unable to Create Customer Record',
    					details: 'Ad Hoc Site: ' + adHocSiteID + ' | Error: ' + error
    				});
    			}
    		
    		// return the customerID to the main script function
			return customerID;
	    }

	/*
	* ==============================================================
	* FUNCTION TO UPDATE THE AD HOC SITE RECORD WITH THE CUSTOMER ID
	* ==============================================================
	*/
	
	function updateAdHocSiteRecord(adHocSiteID, customerID)
		{
			try
				{
					// update the customer field on the ad hoc site record
	    			record.submitFields({
	    				type: 'customrecord_bbs_ad_hoc_site',
	    				id: adHocSiteID,
	    				values: {
	    					custrecord_bbs_ad_hoc_site_customer: customerID
	    				}
	    			});
				}
			catch(e)
				{
					log.error({
						title: 'Error Adding Customer To Ad Hoc Site Record',
						details: 'Ad Hoc Site ID: ' + adHocSiteID + '<br>Customer ID: ' + customerID + '<br>Error: ' + e
					});
				}
		}
    
    /*
     * ====================================
     * FUNCTION TO CREATE A DEPOSIT INVOICE
     * ====================================
     */
    
    function createDepositInvoice(adHocSiteRecord, adHocSiteID, customer, invoiceType)
    	{
    		// get the deposit amount from the adHocSiteRecord object
			var depositAmount = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_deposit'
			});
			
			// get the description of services from the adHocSiteRecord object
			var description = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_serv_desc'
			});
			
			// get the line of business from the adHocSiteRecord object
			var lineOfBusiness = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_line_business'
			});
			
			// get the location from the adHocSiteRecord object
			var location = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_location'
			});
			
			// get the agreement date
    		var agreementDate = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_agree_date'
    		});
    		
    		// format agreementDate as a date object
    		agreementDate = format.parse({
				type: format.Type.DATE,
				value: agreementDate
			});
    	
    		try
    			{
    				// create a new invoice record
					var invoiceRecord = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
    			
					// set header fields on the invoiceRecord
					invoiceRecord.setValue({
    					fieldId: 'approvalstatus',
    					value: 2 // 2 = Approved
    				});
					
					invoiceRecord.setValue({
    					fieldId: 'trandate',
    					value: agreementDate
    				});
    				
    				invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_site',
    					value: adHocSiteID
    				});
    				
    				invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_inv_desc',
    					value: 'Deposit Invoice'
    				});
    				
    				invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_invoice_type',
    					value: invoiceType
    				});
    				
    				/*
    				 * =======================================================================
    				 * ADD A LINE TO THE ITEMS SUBLIST FOR THE ITEM ASSOCIATED TO THE CONTRACT
    				 * =======================================================================
    				 */
    				
    				// select a new line on the invoiceRecord
    				invoiceRecord.selectNewLine({
    					sublistId: 'item'
    				});
    				
    				// set fields on the new line
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'item',
    					value: depositItem	
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'description',
    					value: description
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'class',
    					value: lineOfBusiness
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'location',
    					value: location
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'price',
    					value: '-1' // -1 = Custom
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'rate',
    					value: depositAmount
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'quantity',
    					value: 1
    				});
    				
    				// commit the line
    				invoiceRecord.commitLine({
						sublistId: 'item'
					});
	    			
	    			// submit the invoice record
	    			var invoiceID = invoiceRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'Deposit Invoice Created',
	    				details: 'Ad Hoc Site: ' + adHocSiteID + ' | Invoice ID: ' + invoiceID
	    			});
    			}
    		catch(error)
    			{
	    			log.error({
						title: 'An Error Occured Creating Deposit Invoice',
						details: 'Ad Hoc Site: ' + adHocSiteID + ' | Error: ' + error
					});
    			}
    	}
    
    /*
     * =====================================
     * FUNCTION TO CREATE A PRO RATA INVOICE
     * =====================================
     */
    
    function createProRataInvoice(adHocSiteRecord, adHocSiteID, customer, invoiceAmount, invoiceType)
    	{
	    	// get the description of services from the adHocSiteRecord object
			var description = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_serv_desc'
			});
			
			// get the line of business from the adHocSiteRecord object
			var lineOfBusiness = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_line_business'
			});
			
			// get the location from the adHocSiteRecord object
			var location = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_location'
			});
			
			// get the item from the adHocSiteRecord object
			var item = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_item'
			});
			
			// get the vat rate from the adHocSiteRecord object
			var vatRate = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_vat_rate'
			});
			
			// get the agreement date
    		var agreementDate = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_agree_date'
    		});
    		
    		// format agreementDate as a date object
    		agreementDate = format.parse({
				type: format.Type.DATE,
				value: agreementDate
			});
			
			try
				{
					// create a new invoice record
					var invoiceRecord = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
				
					// set header fields on the invoiceRecord
					invoiceRecord.setValue({
    					fieldId: 'approvalstatus',
    					value: 2 // 2 = Approved
    				});
					
					invoiceRecord.setValue({
    					fieldId: 'trandate',
    					value: agreementDate
    				});
					
					invoiceRecord.setValue({
						fieldId: 'custbody_bbs_ad_hoc_site',
						value: adHocSiteID
					});
					
					invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_inv_desc',
    					value: 'Pro Rata Invoice'
    				});
					
					invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_invoice_type',
    					value: invoiceType
    				});
					
					/*
    				 * =======================================================================
    				 * ADD A LINE TO THE ITEMS SUBLIST FOR THE ITEM ASSOCIATED TO THE CONTRACT
    				 * =======================================================================
    				 */
					
					// select a new line on the invoiceRecord
					invoiceRecord.selectNewLine({
						sublistId: 'item'
					});
					
					// set fields on the new line
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						value: item	
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'description',
						value: description
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'class',
						value: lineOfBusiness
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'location',
						value: location
					});
					
					invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'price',
    					value: '-1' // -1 = Custom
    				});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: invoiceAmount
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'vatcode',
						value: vatRate
					});
					
					// commit the line
					invoiceRecord.commitLine({
						sublistId: 'item'
					});
	    			
	    			// submit the invoice record
	    			var invoiceID = invoiceRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'Pro Rata Invoice Created',
	    				details: 'Ad Hoc Site: ' + adHocSiteID + ' | Invoice ID: ' + invoiceID
	    			});
			}
		catch(error)
			{
    			log.error({
					title: 'An Error Occured Creating Pro Rata Invoice',
					details: 'Ad Hoc Site: ' + adHocSiteID + ' | Error: ' + error
				});
			}
    	}
    
    /*
     * ===============================================
     * FUNCTION TO GET THE NUMBER OF DAYS IN THE MONTH
     * ===============================================
     */  
    
    function getDaysInMonth(month, year)
	    {
    		// day 0 is the last day in the current month
    	 	return new Date(year, month+1, 0).getDate(); // return the last day of the month
	    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});
