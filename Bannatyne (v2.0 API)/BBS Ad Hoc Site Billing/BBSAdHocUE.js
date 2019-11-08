/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/format'],
function(runtime, record, format) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	depositItem = currentScript.getParameter({
    	name: 'custscript_bbs_deposit_item'
    });
	
	// script parameters are global variables so can be access throughout the script
	descriptionItem = currentScript.getParameter({
		name: 'custscript_bbs_description_item'
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
    			
    			// get the value of the signed DD mandate field from the newRecord object
    			var ddMandate = newRecord.getValue({
    				fieldId: 'custrecord_bbs_ad_hoc_site_dd_man_rcvd'
    			});
    			
    			// get the value of the signed contract field from the newRecord object
    			var contractRcvd = newRecord.getValue({
    				fieldId: 'custrecord_bbs_ad_hoc_site_contract_rcvd'
    			});
    			
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
    			
    			/*
    			 * Check the following criteria:
    			 * 
    			 * oldStatus variable returns 2 (Pending Approval) and the newStatus variable returns 1 (Approved)
    			 * ddMandate variable returns true
    			 * contractRcvd variable returns true
    			 * 
    			 */
    			
    			if ((oldApprovalStatus != 1 && newApprovalStatus == 1) && ddMandate == true && contractRcvd == true)
    				{
    					// get the value of the customer field from the newRecord object
    					var customer = newRecord.getValue({
    						fieldId: 'custrecord_bbs_ad_hoc_site_customer'
    					});
    					
    					// check if the customer variable is null
    					if (customer == '')
    						{
    							// call function to create a customer record. Pass newRecord object and currentRecordID. ID of created customer will be returned
        						customer = createCustomer(newRecord, currentRecordID);
    						}
    				
    					// check that the agreement date is this month and the agreement date is this year
    					if (agreementDate.getMonth()+1 == today.getMonth()+1 && agreementDate.getFullYear() == today.getFullYear())
    						{
	    						// call function to create a deposit invoice. Pass newRecord, currentRecordID and customer
	    	        			createDepositInvoice(newRecord, currentRecordID, customer);
	        				
	    	        			// call function to create a pro rata invoice. Pass newRecord, currentRecordID and customer
	        					createProRataInvoice(newRecord, currentRecordID, customer);
    						}
    				}
    		}

    }
    
    /*
     * ========================================
     * FUNCTION TO CREATE A NEW CUSTOMER RECORD
     * ========================================
     */
    
    function createCustomer(adHocSiteRecord, adHocSiteID)
	    {
	    	// get field values from the adHocSiteRecord object
    		var subsidiary = adHocSiteRecord.getValue({
    			fieldId: 'custrecord_bbs_ad_hoc_site_subsidiary'
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
    					fieldId: 'subsidiary',
    					value: subsidiary
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'companyname',
    					value: companyName
    				});
    				
    				customerRecord.setValue({
    					fieldId: 'vatregnumber',
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
    					fieldId: 'custentity_2663_direct_debit',
    					value: true
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
	    			var customerID = customerRecord.save({
	    				enableSourcing: false,
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
	    				fieldId: 'custpage_2663_entity_file_format',
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
	    			
	    			// submit the bankDetailsRecord
	    			bankDetailsRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'New Customer Record Created',
	    				details: 'Ad Hoc Site: ' + adHocSiteID + ' | Customer ID: ' + customerID
	    			});
	    			
	    			// submit the customer field on the ad hoc site record
	    			record.submitFields({
	    				type: 'customrecord_bbs_ad_hoc_site',
	    				id: adHocSiteID,
	    				values: {
	    					custrecord_bbs_ad_hoc_site_customer: customerID
	    				}
	    			});
	    			
	    			// return the customerID to the main script function
	    			return customerID;				
	    		}
    		catch(error)
    			{
    				log.error({
    					title: 'Unable to Create Customer Record',
    					details: 'Ad Hoc Site: ' + adHocSiteID + ' | Error: ' + error
    				});
    			}    		
	    }
    
    /*
     * ====================================
     * FUNCTION TO CREATE A DEPOSIT INVOICE
     * ====================================
     */
    
    function createDepositInvoice(adHocSiteRecord, adHocSiteID, customer)
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
				fieldId: 'custrecord_bbs_ad_hoc_site_gym_spa'
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
					    isDynamic: true
					});
    			
					// set header fields on the invoiceRecord
    				invoiceRecord.setValue({
    					fieldId: 'trandate',
    					value: agreementDate
    				});
    				
    				invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_site',
    					value: adHocSiteID
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
    				
    				/*
    				 * ===========================================
    				 * ADD A DESCRIPTION LINE TO THE ITEMS SUBLIST
    				 * ===========================================
    				 */
    				
    				// select a new sublist line
    				invoiceRecord.selectNewLine({
    					sublistId: 'item'
    				});
    				
    				// set fields on the new line
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'item',
    					value: descriptionItem
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'description',
    					value: 'Deposit Invoice'
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
    
    function createProRataInvoice(adHocSiteRecord, adHocSiteID, customer)
    	{
	    	// get the description of services from the adHocSiteRecord object
			var description = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_serv_desc'
			});
			
			// get the line of business from the adHocSiteRecord object
			var lineOfBusiness = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_gym_spa'
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
			
			// get the value of the stepped rent field from the adHocSiteRecord object
			var steppedRent = adHocSiteRecord.getValue({
				fieldId: 'custrecord_bbs_ad_hoc_site_stepped_rent'
			});
			
			// check if the steppedRent variable returns 1 (Rent is Stepped)
			if (steppedRent == '1')
				{
					// get the value of the '1st Step Amount' field
					var monthlyAmount = adHocSiteRecord.getValue({
						fieldId: 'custrecord_bbs_ad_hoc_site_step_1_amt'
					});
				}
			else // rent is NOT stepped
				{
					// get the value of the monthly amount field
		    		var monthlyAmount = adHocSiteRecord.getValue({
		    			fieldId: 'custrecord_bbs_ad_hoc_site_monthly_amt'
		    		});
				}
			
			// get the start date of the contract
    		var startDate = adHocSiteRecord.getValue({
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
			var daysRemaining = (daysInMonth - startDay);
			
			// multiply dailyAmount by daysRemaining to calculate the pro rata invoice amount
			var invoiceAmount = parseFloat(dailyAmount * daysRemaining);
			invoiceAmount = invoiceAmount.toFixed(2);
			
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
					    isDynamic: true
					});
				
					// set header fields on the invoiceRecord
					invoiceRecord.setValue({
    					fieldId: 'trandate',
    					value: agreementDate
    				});
					
					invoiceRecord.setValue({
						fieldId: 'custbody_bbs_ad_hoc_site',
						value: adHocSiteID
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
					
					/*
    				 * ===========================================
    				 * ADD A DESCRIPTION LINE TO THE ITEMS SUBLIST
    				 * ===========================================
    				 */
    				
    				// select a new sublist line
    				invoiceRecord.selectNewLine({
    					sublistId: 'item'
    				});
    				
    				// set fields on the new line
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'item',
    					value: descriptionItem
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'description',
    					value: 'Pro Rata Invoice'
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
