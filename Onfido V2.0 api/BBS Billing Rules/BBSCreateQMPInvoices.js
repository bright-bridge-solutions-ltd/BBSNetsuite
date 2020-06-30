/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/config', 'N/search', 'N/record'],
/**
 * @param {search} search
 */
function(runtime, config, search, record) {
   
	/**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	trpAcc = currentScript.getParameter({
    		name: 'custscript_bbs_trp_account'
    	});
    	
    	qmpItem = currentScript.getParameter({
        	name: 'custscript_bbs_qmp_item'
        });
    	
    	// initialize variables
    	var contractRecord;
    	var customer;
    	var customerLookup;
    	var currency;
    	var location;
    	var qmpAmt;
    	var contractQuarter;
    	var qtr2InvBilled;
    	var qtr3InvBilled;
    	var qtr4InvBilled;
    	var invoiceID;
    	
    	// create search to find contracts to process
    	var contractSearch = search.create({
    		type: 'customrecord_bbs_contract',
    		
    		filters: [{
    			name: 'custrecord_bbs_contract_billing_type',
    			operator: 'anyof',
    			values: ['3'] // 3 = QMP
    		},
    				{
    			name: 'custrecord_bbs_contract_status',
    			operator: 'anyof',
    			values: ['1'] // 1 = Approved
    		},
    				{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_contract_period_qu_end',
    			join: 'custrecord_bbs_contract_period_contract',
    			operator: 'within',
    			values: ['thismonth']
    		}],
    		
    		columns: [{
    			name: 'internalid',
    			summary: 'GROUP'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_contract_customer',
    			summary: 'MAX'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_contract_currency',
    			summary: 'MAX'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_contract_location',
    			summary: 'MAX'
    		},
    				{
    			name: 'custrecord_bbs_contract_qu_min_use',
    			summary: 'MAX'
    		},
    				{
    			name: 'custrecord_bbs_contract_period_quarter',
    			join: 'custrecord_bbs_contract_period_contract',
    			summary: 'MAX'
    		},
    				{
    			name: 'custrecord_bbs_contract_qtr_2_inv_billed',
    			summary: 'MAX'
    		},
    				{
    			name: 'custrecord_bbs_contract_qtr_3_inv_billed',
    			summary: 'MAX'
    		},
    				{
    			name: 'custrecord_bbs_contract_qtr_4_inv_billed',
    			summary: 'MAX'
    		}],

    	});
    	
    	// run search and process results
    	contractSearch.run().each(function(result) {
    		
    		// get the internal ID of the contract record from the search results
    		contractRecord = result.getValue({
    			name: 'internalid',
    			summary: 'GROUP'
    		});
    		
    		log.audit({
    			title: 'Processing Contract Record',
    			details: contractRecord
    		});
    		
    		// get the ID of the customer from the search results
    		customer = result.getValue({
    			name: 'internalid',
    			join: 'custrecord_bbs_contract_customer',
    			summary: 'MAX'
    		});
    		
    		// get the location from the search results
    		location = result.getValue({
    			name: 'internalid',
    			join: 'custrecord_bbs_contract_location',
    			summary: 'MAX'
    		})
    		
    		// get the currency from the search results
		    currency = result.getValue({
    			name: 'internalid',
    			join: 'custrecord_bbs_contract_currency',
    			summary: 'MAX'
    		});
		    
		    // get the minimum quarterly usage from the search results
		    qmpAmt = result.getValue({
    			name: 'custrecord_bbs_contract_qu_min_use',
    			summary: 'MAX'
    		});
		    
		    // use parseFloat to convert to floating point number
		    qmpAmt = parseFloat(qmpAmt);
		   
		    contractQuarter = result.getValue({
		    	name: 'custrecord_bbs_contract_period_quarter',
		    	join: 'custrecord_bbs_contract_period_contract',
		    	summary: 'MAX'
		    });
		    
		    qtr2InvBilled = result.getValue({
		    	name: 'custrecord_bbs_contract_qtr_2_inv_billed',
		    	summary: 'MAX'
		    });
		    
		    qtr3InvBilled = result.getValue({
		    	name: 'custrecord_bbs_contract_qtr_3_inv_billed',
		    	summary: 'MAX'
		    });
		    
		    qtr4InvBilled = result.getValue({
		    	name: 'custrecord_bbs_contract_qtr_4_inv_billed',
		    	summary: 'MAX'
		    });
		    
		    // if contractQuarter variable is 1
		    if (contractQuarter == 1)
		    	{
		    		// check if qtr2InvBilled returns false
		    		if (qtr2InvBilled == false)
		    			{
		    				// call function to create QMP invoice. Pass contractRecord, customer, location, currency and qmpAmt
		    				createInvoice(contractRecord, customer, location, currency, qmpAmt);
		    			}
		    		else if (qtr2InvBilled == true) // if qtr2InvBilled returns true
		    			{
		    				log.audit({
		    					title: 'Unable to Create Qtr 2 Invoice',
		    					details: 'Unable to create Qtr 2 invoice for contract ' + contractRecord + ' as it has already been billed'
		    				});
		    			}
		    	}
		    // if contractQuarter variable is 2
		    else if (contractQuarter == 2)
		    	{
			    	// check if qtr3InvBilled returns false
		    		if (qtr3InvBilled == false)
		    			{
		    				// call function to create QMP invoice. Pass contractRecord, customer, location, currency and qmpAmt
		    				createInvoice(contractRecord, customer, location, currency, qmpAmt);
		    			}
		    		else if (qtr3InvBilled == true) // if qtr3InvBilled returns true
		    			{
		    				log.audit({
		    					title: 'Unable to Create Qtr 3 Invoice',
		    					details: 'Unable to create Qtr 3 invoice for contract ' + contractRecord + ' as it has already been billed'
		    				});
		    			}
		    	}
		    // if contractQuarter variable is 3
		    else if (contractQuarter == 3)
		    	{
			    	// check if qtr4InvBilled returns false
		    		if (qtr4InvBilled == false)
		    			{
		    				// call function to create QMP invoice. Pass contractRecord, customer, location, currency and qmpAmt
		    				createInvoice(contractRecord, customer, location, currency, qmpAmt);
		    			}
		    		else if (qtr4InvBilled == true) // if qtr4InvBilled returns true
		    			{
		    				log.audit({
		    					title: 'Unable to Create Qtr 4 Invoice',
		    					details: 'Unable to create Qtr 4 invoice for contract ' + contractRecord + ' as it has already been billed'
		    				});
		    			}
		    	}
		    
		    // continue processing additional results
		    return true;
		    
    	});
    	
    	// call updateCompanyPreferences function
    	updateCompanyPreferences();

    }
    
    // ==================================
    // FUNCTION TO CREATE THE QMP INVOICE
    // ==================================
    
    function createInvoice(contractRecord, customer, location, currency, amount)
    	{
	    	try
				{
					// create a new invoice record
					var invoice = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true
					});
					
					// set header fields on the invoice record
					invoice.setValue({
						fieldId: 'account',
						value: trpAcc
					});
					
					invoice.setValue({
						fieldId: 'custbody_bbs_invoice_type',
						value: 3 // 3 = Prepayment
					});
					
					invoice.setValue({
						fieldId: 'custbody_bbs_contract_record',
						value: contractRecord
					});
					
					invoice.setValue({
						fieldId: 'location',
						value: location
					});
					
					invoice.setValue({
						fieldId: 'currency',
						value: currency
					});
					
					// add a new line to the invoice
					invoice.selectNewLine({
						sublistId: 'item'
					});
					
					// set fields on the new line
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						value: qmpItem
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: amount
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_bbs_contract_record',
						value: contractRecord
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'location',
						value: location
					});
					
					// commit the line
					invoice.commitLine({
						sublistId: 'item'
					});
					
					// submit the invoice record
					invoiceID = invoice.save({
						enableSourcing: false,
			    		ignoreMandatoryFields: true
		    		});
					
					log.audit({
						title: 'QMP Invoice Created',
						details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + contractRecord
					});
					
					// update fields on the contract record
					record.submitFields({
						type: 'customrecord_bbs_contract',
						id: contractRecord,
						values: {
							custrecord_bbs_contract_prepayment_inv: amount
						}
					});
				}
	    	catch(e)
			    {
			    	log.error({
						title: 'Error creating AMP Invoice for Contract Record ' + contractRecord,
						details: e
					});
			    }
    	}
    
    //=======================================
	// FUNCTION TO UPDATE COMPANY PREFERENCES
	//=======================================
    
    function updateCompanyPreferences()
	    {
	    	// load the company preferences
	    	var companyPreferences = config.load({
	            type: config.Type.COMPANY_PREFERENCES,
	            isDynamic: true
	        });
	    	
	    	// unset the 'Billing Process Complete' checkbox
	    	companyPreferences.setValue({
	    		fieldId: 'custscript_bbs_billing_process_complete',
	    		value: false
	    	});
	    	
	    	// save the company preferences
	    	companyPreferences.save();
	    	
	    	log.debug({
	    		title: 'Company Preferences Updated',
	    		details: 'Billing Process Checkbox has been UNTICKED'
	    	});
	    }

    return {
        execute: execute
    };
    
});
