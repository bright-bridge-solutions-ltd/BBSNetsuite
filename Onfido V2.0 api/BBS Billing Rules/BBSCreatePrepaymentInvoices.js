/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, search, record) {
   
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
    	
    	var trpAcc = currentScript.getParameter({
    		name: 'custscript_bbs_trp_account'
    	});
    	
    	var ampItem = currentScript.getParameter({
        	name: 'custscript_bbs_amp_item'
        });
    	
    	var qmpItem = currentScript.getParameter({
        	name: 'custscript_bbs_qmp_item'
        });
    	
    	var burItem = currentScript.getParameter({
    		name: 'custscript_bbs_bi_annual_min_prepay_item'
    	});
    	
    	// initialize variables
    	var contractRecord;
    	var customer;
    	var location;
    	var invoiceAmt;
    	var invoiceItem;
    	var invoiceID;
    	
    	// create search to find contracts to process
    	var contractSearch = search.create({
    		type: 'customrecord_bbs_contract',
    		
    		columns: [{
    			name: 'custrecord_bbs_contract_billing_type'
    		},
    				{
    			name: 'custrecord_bbs_contract_customer'
    		},
    				{
    			name: 'custentity_bbs_location',
    			join: 'custrecord_bbs_contract_customer'
    		},
    				{
    			name: 'custrecord_bbs_contract_currency'
    		},
    				{
    			name: 'custrecord_bbs_contract_min_ann_use'
    		},
    				{
    			name: 'custrecord_bbs_contract_qu_min_use'
    		},
    				{
    			name: 'custrecord_bbs_contract_bi_ann_use'
    		}],
    		
    		filters: [{
    			name: 'custrecord_bbs_contract_start_date',
    			operator: 'before',
    			values: ['daysfromnow0', 'daysfromnow30'] // within 30 days from now
    		},
    				{
    			name: 'custrecord_bbs_contract_billing_type',
    			operator: 'anyof',
    			values: ['3', '4', '5', '7'] // 3 = QMP, 4 = AMP, 5 = QUR, 7 = BUR
    		},
    				{
    			name: 'custrecord_bbs_contract_status',
    			operator: 'anyof',
    			values: ['1'] // 1 = Approved
    		},
    			{
    			name: 'custrecord_bbs_contract_initial_invoice',
    			operator: 'is',
    			values: ['F']
    		}],
    	});
    	
    	// run search and process results
    	contractSearch.run().each(function(result) {
    		
    		// get the internal ID of the contract record from the search results
    		contractRecord = result.id;
    		
    		log.audit({
    			title: 'Processing Contract Record',
    			details: contractRecord
    		});
    		
    		// get the ID of the customer from the search results
    		customer = result.getValue({
		    	name: 'custrecord_bbs_contract_customer'
		    });
		    
		    // get the customer's location from the search results
		    location = result.getValue({
		    	name: 'custentity_bbs_location',
		    	join: 'custrecord_bbs_contract_customer'
		    });
		    
		    // get the currency from the search results
		    currency = result.getValue({
		    	name: 'custrecord_bbs_contract_currency'
		    });
		    
		    // get the billing type from the search results
		    billingType = result.getValue({
		    	name: 'custrecord_bbs_contract_billing_type'
		    });
		    
		    // check if the billing type is 3 (QMP) or 5 (QUR)
		    if (billingType == '3' || billingType == '5')
		    	{
		    		// set the invoiceAmt to be the minimum quarterly usage
		    		invoiceAmt = result.getValue({
		    			name: 'custrecord_bbs_contract_qu_min_use'
		    		});
		    		
		    		// set the invoiceItem to be the qmpItem
		    		invoiceItem = qmpItem;
		    	}
		    // if the billing type is 4 (AMP)
		    else if (billingType == '4')
		    	{
		    		// set the invoiceAmt to be the minimum annual usage
		    		invoiceAmt = result.getValue({
		    			name: 'custrecord_bbs_contract_min_ann_use'
		    		});
		    		
		    		// set the invoiceItem to be the ampItem
		    		invoiceItem = ampItem;
		    	}
		    // if the billing type is 7 (BUR)
		    else if (billingType == '7')
		    	{
			    	// set the invoiceAmt to be the minimum biannual usage
		    		invoiceAmt = result.getValue({
		    			name: 'custrecord_bbs_contract_bi_ann_use'
		    		});
		    		
		    		// set the invoiceItem to be the burItem
		    		invoiceItem = burItem;
		    	}
		    	
		    // use parseFloat to convert to floating point number
		    invoiceAmt = parseFloat(invoiceAmt);
		    	
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
	    				value: invoiceItem
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'rate',
	    				value: invoiceAmt
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
	    			
	    			// update fields on the contract record
	    			record.submitFields({
	    				type: 'customrecord_bbs_contract',
	    				id: contractRecord,
	    				values: {
	    					custrecord_bbs_contract_initial_invoice: true,
	    					custrecord_bbs_contract_prepayment_inv: invoiceAmt
	    				}
	    			});
	    			
	    			log.audit({
	    				title: 'Initial Invoice Created',
	    				details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + contractRecord
	    			});
				}
			catch(e)
				{
					log.error({
						title: 'Error Creating Initial Invoice for Contract Record ' + contractRecord,
						details: e
					});
				}
			
			// continue processing search results
			return true;

    	});
    }

    return {
        execute: execute
    };
    
});