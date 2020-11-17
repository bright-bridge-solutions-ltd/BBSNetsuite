/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
	// retrieve script parameters. Script parameters are global parameters so can be accessed throughout the script
	var currentScript = runtime.getCurrentScript();
	
	trcsAcc = currentScript.getParameter({
		name: 'custscript_bbs_trcs_account'
	});
	
	trpAcc = currentScript.getParameter({
		name: 'custscript_bbs_trp_account'
	});
	
	setupFeeItem = currentScript.getParameter({
    	name: 'custscript_bbs_setup_fee_item'
    });
	
	upfrontMgmtFeeItem = currentScript.getParameter({
		name: 'custscript_bbs_upfront_mgmt_fee_item'
	});
	
	invoiceForm = currentScript.getParameter({
		name: 'custscript_bbs_onfido_invoice_form'
	});
	
	contractRecord = currentScript.getParameter({
		name: 'custscript_bbs_contract_record'
	});
	
	prepaymentInvoiceItem = currentScript.getParameter({
		name: 'custscript_bbs_prepay_item'
	});
	
	prepaymentInvoiceAmount = currentScript.getParameter({
		name: 'custscript_bbs_prepay_amt'
	});
	
	// use parseFoat to convert prepaymentInvoiceAmount to a floating point number
	prepaymentInvoiceAmount = parseFloat(prepaymentInvoiceAmount);
	
	setupFeeInvoice = currentScript.getParameter({
		name: 'custscript_bbs_setup_fee_inv'
	});
	
	mgmtFeeInvoice = currentScript.getParameter({
		name: 'custscript_bbs_mgmt_fee_inv'
	});
	
	prepaymentInvoice = currentScript.getParameter({
		name: 'custscript_bbs_prepay_inv'
	});
	
	/**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// lookup fields on the contract record
    	var contractRecordLookup = search.lookupFields({
    		type: 'customrecord_bbs_contract',
    		id: contractRecord,
    		columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_subsidiary', 'custrecord_bbs_contract_location', 'custrecord_bbs_contract_setup_fee_amount', 'custrecord_bbs_contract_mgmt_fee_amt', 'custrecord_bbs_contract_term']
    	});
    	
    	// get the customer from the contractRecordLookup object
	    var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
	    var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
	    var subsidiary = contractRecordLookup.custrecord_bbs_contract_subsidiary[0].value;
	    var location = contractRecordLookup.custrecord_bbs_contract_location[0].value;
    	var setupFeeAmount = contractRecordLookup.custrecord_bbs_contract_setup_fee_amount;
    	var mgmtFeeAmount = contractRecordLookup.custrecord_bbs_contract_mgmt_fee_amt;
    	var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;
		
    	// use parseFoat to convert setupFeeAmount to a floating point number
    	setupFeeAmount = parseFloat(setupFeeAmount);
    	
    	// multiply mgmtFeeAmount by the contract term to calculate the total upfront management fee invoice
    	mgmtFeeAmount = parseFloat(mgmtFeeAmount * contractTerm);
    	
    	// check if the setupFeeInvoice variable returns true
    	if (setupFeeInvoice == true)
    		{
    			// call function to create setup fee invoice. Pass customer, contractRecord, location, currency, subsidiary and setupFeeAmount
    			createSetupFeeInvoice(customer, contractRecord, location, currency, subsidiary, setupFeeAmount);
    		}
    	
    	// check if the mgmtFeeInvoice variable returns true
    	if (mgmtFeeInvoice == true)
    		{
    			// call function to create management fee invoice. Pass customer, contractRecord, location, currency, subsidiary and mgmtFeeAmount
    			createMgmtFeeInvoice(customer, contractRecord, location, currency, subsidiary, mgmtFeeAmount);
    		}
    	
    	// check if the prepaumentInvoice variable returns true
    	if (prepaymentInvoice == true)
    		{
    			// call function to create a prepayment invoice. Pass customer, contractRecord, location, currency and subsidiary
    			createPrepaymentInvoice(customer, contractRecord, location, currency, subsidiary);
    		}

    }
    
    // ======================================
    // FUNCTION TO CREATE A SETUP FEE INVOICE
    // ======================================
    
    function createSetupFeeInvoice(customer, contractRecord, location, currency, subsidiary, setupFeeAmount)
	    {
	    	try
				{
					// create a new invoice record
					var invoice = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
				
					// set header fields on the invoice
					invoice.setValue({
						fieldId: 'subsidiary',
						value: subsidiary
					});
					
					invoice.setValue({
						fieldId: 'account',
						value: trcsAcc
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
					
					invoice.setValue({
						fieldId: 'custbody_bbs_invoice_type',
						value: 1 // 1 = Setup Fee
					});
					
					// add a new line to the invoice
					invoice.selectNewLine({
						sublistId: 'item'
					});
					
					// set fields on the new line
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						value: setupFeeItem
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: setupFeeAmount
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
					var invoiceID = invoice.save({
						enableSourcing: false,
			    		ignoreMandatoryFields: true
		    		});
					
					log.audit({
						title: 'Setup Fee Invoice Created',
						details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + contractRecord
					});
					
					// update the 'Setup Fee Billed' checkbox on the contract record
					record.submitFields({
						type: 'customrecord_bbs_contract',
						id: contractRecord,
						values: {
							custrecord_bbs_contract_setup_fee_billed: true
						}
					});
				}
			catch(e)
				{
					log.error({
						title: 'Error creating Setup Fee Invoice for Contract Record ' + contractRecord,
						details: e
					});
				}	
	    }
    
    // ===========================================
    // FUNCTION TO CREATE A MANAGEMENT FEE INVOICE
    // ===========================================
    
    function createMgmtFeeInvoice(customer, contractRecord, location, currency, subsidiary, mgmtFeeAmount)
	    {
	    	try
				{
					// create a new invoice record
					var invoice = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
				
					// set header fields on the invoice
					invoice.setValue({
						fieldId: 'subsidiary',
						value: subsidiary
					});
					
					invoice.setValue({
						fieldId: 'account',
						value: trpAcc
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
					
					invoice.setValue({
						fieldId: 'custbody_bbs_invoice_type',
						value: 2 // 2 = Management Fee
					});
					
					// add a new line to the invoice
					invoice.selectNewLine({
						sublistId: 'item'
					});
					
					// set fields on the new line
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						value: upfrontMgmtFeeItem
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: mgmtFeeAmount
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
					var invoiceID = invoice.save({
						enableSourcing: false,
			    		ignoreMandatoryFields: true
		    		});
					
					log.audit({
						title: 'Management Fee Invoice Created',
						details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + contractRecord
					});
					
					// update the 'Management Fee Billed' checkbox on the contract record
					record.submitFields({
						type: 'customrecord_bbs_contract',
						id: contractRecord,
						values: {
							custrecord_bbs_contract_mgmt_fee_billed: true
						}
					});
				}
			catch(e)
				{
					log.error({
						title: 'Error creating Management Fee Invoice for Contract Record ' + contractRecord,
						details: e
					});
				}	
	    }
    
    // =============================================
    // FUNCTION TO CREATE INITIAL PREPAYMENT INVOICE
    // =============================================
    
    function createPrepaymentInvoice(customer, contractRecord, location, currency, subsidiary)
    	{
	    	try
				{
					// create a new invoice record
					var invoice = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
				
					// set header fields on the invoice record
					invoice.setValue({
						fieldId: 'subsidiary',
						value: subsidiary
					});
					
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
						value: prepaymentInvoiceItem
					});
		
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: prepaymentInvoiceAmount
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
					var invoiceID = invoice.save({
						enableSourcing: false,
			    		ignoreMandatoryFields: true
		    		});
					
					log.audit({
						title: 'Initial Prepayment Invoice Created',
						details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + contractRecord
					});
					
					// update fields on the contract record
					record.submitFields({
						type: 'customrecord_bbs_contract',
						id: contractRecord,
						values: {
							custrecord_bbs_contract_initial_invoice: true,
							custrecord_bbs_contract_prepayment_inv: prepaymentInvoiceAmount
						}
					});
				}
	    	catch(e)
				{
					log.error({
						title: 'Error creating initial prepayment invoice for Contract Record ' + contractRecord,
						details: e
					});
				}
    	}

    return {
        execute: execute
    };
    
});
