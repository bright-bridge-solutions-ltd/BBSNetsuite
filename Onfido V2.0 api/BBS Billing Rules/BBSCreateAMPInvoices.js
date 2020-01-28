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
    	
    	// initialize variables
    	var contractRecord;
    	var customer;
    	var location;
    	var ampAmt;
    	var invoiceID;
    	
    	// create search to find contracts to process
    	var contractSearch = search.create({
    		type: 'customrecord_bbs_contract',
    		
    		columns: [{
    			name: 'internalid'
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
    		}],
    		
    		filters: [{
    			name: 'custrecord_bbs_contract_start_date',
    			operator: 'before',
    			values: ['daysfromnow0', 'daysfromnow30'] // within 30 days from now
    		},
    				{
    			name: 'custrecord_bbs_contract_billing_type',
    			operator: 'anyof',
    			values: ['4'] // 4 = AMP
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
    		contractRecord = result.getValue({
    			name: 'internalid'
    		});
    		
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
		    
		    // get the minimum annual usage from the search results
		    ampAmt = result.getValue({
		    	name: 'custrecord_bbs_contract_min_ann_use'
		    });
		    
		    // use parseFloat to convert to decimal number
		    ampAmt = parseFloat(ampAmt);
		    	
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
	    				value: ampItem
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'rate',
	    				value: ampAmt
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
	    			invoiceID = invoice.save();
	    			
	    			// update fields on the contract record
	    			record.submitFields({
	    				type: 'customrecord_bbs_contract',
	    				id: contractRecord,
	    				values: {
	    					custrecord_bbs_contract_initial_invoice: true,
	    					custrecord_bbs_contract_prepayment_inv: ampAmt
	    				}
	    			});
	    			
	    			log.audit({
	    				title: 'AMP Invoice Created',
	    				details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + contractRecord
	    			});
				}
			catch(e)
				{
					log.error({
						title: 'Error creating AMP Invoice for Contract Record ' + contractRecord,
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