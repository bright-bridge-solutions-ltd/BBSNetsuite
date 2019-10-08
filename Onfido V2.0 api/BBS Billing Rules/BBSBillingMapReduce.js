/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format'],
function(runtime, search, record, format) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	adjustmentItem = currentScript.getParameter({
    	name: 'custscript_bbs_min_usage_adj_item'
    });
	
	mgmtFeeItem = currentScript.getParameter({
		name: 'custscript_bbs_monthly_mgtmt_fee_item'
	});
	
	qmpCreditItem = currentScript.getParameter({
		name: 'custscript_bbs_credit_qmp_item'
	});
	
	ampCreditItem = currentScript.getParameter({
		name: 'custscript_bbs_credit_amp_item'
	});
	
	qmpItem = currentScript.getParameter({
		name: 'custscript_bbs_quarterly_min_prepay_item'
	});
	
	ambmaItem = currentScript.getParameter({
		name: 'custscript_bbs_ambma_prepayment_item'
	});
	
	trpAcc = currentScript.getParameter({
		name: 'custscript_bbs_trp_account'
	});
	
	trcsAcc = currentScript.getParameter({
		name: 'custscript_bbs_trcs_account'
	});

	// declare new date object. Global variable so can be accessed throughout the script
	invoiceDate = new Date();
	invoiceDate.setDate(0); // set date to be the last day of the previous month
	
	invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate());
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// run search to find sales orders to be billed
    	return search.create({
    		type: search.Type.SALES_ORDER,
			
			columns: [{
				name: 'entity',
			},
					{
				name: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_billing_type',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_mgmt_fee',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_mgmt_fee_amt',
				join: 'custbody_bbs_contract_record'
			},
				{
				name: 'custrecord_bbs_contract_currency',
				join: 'custbody_bbs_contract_record'
			}],
			
			filters: [{
				name: 'mainline',
				operator: 'is',
				values: ['T']
			},
					{
				name: 'status',
				operator: 'anyof',
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
					{
				name: 'custbody_bbs_contract_record',
				operator: 'noneof',
				values: ['@NONE@']
    		},
    				{
    			name: 'custrecord_bbs_contract_status',
    			join: 'custbody_bbs_contract_record',
    			operator: 'anyof',
    			values: ['1'] // 1 = Approved
    		},
    				{
    			name: 'custrecord_bbs_contract_exc_auto_bill',
    			join: 'custbody_bbs_contract_record',
    			operator: 'is',
    			values: ['F']
    		}],
		});
    	
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// initiate variables
    	var recordID;
    	var billingType;
    	var contractRecord;
    	var mgmtFee;
    	var customer;
    	var mgmtFeeAmt;
    	var currency;
    	var netAmt;
    	var monthlyMinimum;
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the internal ID of the record from the search results
		recordID = searchResult.id;
		
		log.audit({
			title: 'Processing Sales Order',
			details: recordID
		});
		
		// get the internal ID of the contract record from the search results
		contractRecord = searchResult.values["custbody_bbs_contract_record"].value;
		
		// get the billing type from the search results
		billingType = searchResult.values["custrecord_bbs_contract_billing_type.custbody_bbs_contract_record"].value;
		
		//============================================================================================
		// CHECK THE BILLING TYPE AND CALL THE RELEVANT FUNCTION FOR PRE-PROCESSING OF THE SALES ORDER
		//============================================================================================
		
		// AMBMA billing type
		if (billingType == 6)
			{
				// call the AMBMA function. Pass in the internal ID of the sales order record
				AMBMA(recordID);
				
				// get the value of the management fee checkbox from the search results
				mgmtFee = searchResult.values["custrecord_bbs_contract_mgmt_fee.custbody_bbs_contract_record"].value;
				
				// if the mgmtFee variable returns 1 (Mgmt Fee is Yes)
				if (mgmtFee == 1)
					{
						// get the customer from the search results
						customer = searchResult.values["entity"].value;
						
						// get the management fee amount from the search results
						mgmtFeeAmt = searchResult.values["custrecord_bbs_contract_mgmt_fee_amt.custbody_bbs_contract_record"];
						
						// get the currency from the search results
						currency = searchResult.values["custrecord_bbs_contract_currency.custbody_bbs_contract_record"].value;
					
						// call function to create invoice for monthly management fee. Pass in ID of contract record, customer, mgmtFeeAmt, currency
						createMgmtFeeInvoice(contractRecord, customer, mgmtFeeAmt, currency);
					}
			}
		// AMP billing type
		else if (billingType == 4)
			{
				// call the AMP function. Pass in the internal ID of the sales order record
				AMP(recordID);
				
				// get the value of the management fee checkbox from the search results
				mgmtFee = searchResult.values["custrecord_bbs_contract_mgmt_fee.custbody_bbs_contract_record"].value;
				
				// if the mgmtFee variable returns 1 (Mgmt Fee is Yes)
				if (mgmtFee == 1)
					{
						// get the customer from the search results
						customer = searchResult.values["entity"].value;
						
						// get the management fee amount from the search results
						mgmtFeeAmt = searchResult.values["custrecord_bbs_contract_mgmt_fee_amt.custbody_bbs_contract_record"];
						
						// get the currency from the search results
						currency = searchResult.values["custrecord_bbs_contract_currency.custbody_bbs_contract_record"].value;
					
						// call function to create invoice for monthly management fee. Pass in ID of contract record, customer, mgmtFeeAmt, currency
						createMgmtFeeInvoice(contractRecord, customer, mgmtFeeAmt, currency);
					}
			}
		// PAYG billing type
		else if (billingType == 1)
			{
				// call the PAYG function. Pass in the internal ID of the sales order record
				PAYG(recordID);
			}
		// QMP billing type
		else if (billingType == 3)
			{
				// call the QMP function. Pass in the internal ID of the sales order record
				QMP(recordID);
				
				// get the value of the management fee checkbox from the search results
				mgmtFee = searchResult.values["custrecord_bbs_contract_mgmt_fee.custbody_bbs_contract_record"].value;
				
				// if the mgmtFee variable returns 1 (Mgmt Fee is Yes)
				if (mgmtFee == 1)
					{
						// get the customer from the search results
						customer = searchResult.values["entity"].value;
						
						// get the management fee amount from the search results
						mgmtFeeAmt = searchResult.values["custrecord_bbs_contract_mgmt_fee_amt.custbody_bbs_contract_record"];
						
						// get the currency from the search results
						currency = searchResult.values["custrecord_bbs_contract_currency.custbody_bbs_contract_record"].value;
					
						// call function to create invoice for monthly management fee. Pass in ID of contract record, customer, mgmtFeeAmt, currency
						createMgmtFeeInvoice(contractRecord, customer, mgmtFeeAmt, currency);
					}
			}
		// QUR billing type
		else if (billingType == 5)
			{
				// call the QUR function. Pass in the internal ID of the sales order record
				QUR(recordID);
				
				// get the value of the management fee checkbox from the search results
				mgmtFee = searchResult.values["custrecord_bbs_contract_mgmt_fee.custbody_bbs_contract_record"].value;
				
				// if the mgmtFee variable returns 1 (Mgmt Fee is Yes)
				if (mgmtFee == 1)
					{
						// get the customer from the search results
						customer = searchResult.values["entity"].value;
						
						// get the management fee amount from the search results
						mgmtFeeAmt = searchResult.values["custrecord_bbs_contract_mgmt_fee_amt.custbody_bbs_contract_record"];
						
						// get the currency from the search results
						currency = searchResult.values["custrecord_bbs_contract_currency.custbody_bbs_contract_record"].value;
					
						// call function to create invoice for monthly management fee. Pass in ID of contract record, customer, mgmtFeeAmt, currency
						createMgmtFeeInvoice(contractRecord, customer, mgmtFeeAmt, currency);
					}
			}
		// UIOLI billing type
		else if (billingType == 2)
			{
				// call the UIOLI function. Pass in the internal ID of the sales order record
				UIOLI(recordID);
			}
    }
    
    //=========================================
	// SEPARATE FUNCTIONS FOR EACH BILLING TYPE
	//=========================================
    
    function AMBMA(recordID)
	    {
    		// set the billingType variable to AMBMA
    		billingType = 'AMBMA';
    		
    		// declare and initialize variables
    		var periodStart;
    		var periodEnd;
    		var invoicedTotal;
    		
    		// load the sales order record
    		var soRecord = record.load({
		    	type: record.Type.SALES_ORDER,
		    	id: recordID,
		    	isDynamic: true
		    });
    		
    		// get the customer from the sales order record
    		var customer = soRecord.getValue({
    			fieldId: 'entity'
    		});
    		
    		// get the ID of the contract record from the sales order record
		    var contractRecord = soRecord.getValue({
		    	fieldId: 'custbody_bbs_contract_record'
		    });
    	
		    // lookup fields on the contract record
		    var contractRecordLookup = search.lookupFields({
		    	type: 'customrecord_bbs_contract',
		    	id: contractRecord,
		    	columns: ['custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_term', 'custrecord_bbs_contract_currency']
		    });
		    
		    // return values from the contractRecordLookup
		    var annualMinimum = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
		    annualMinimum = parseFloat(annualMinimum); // use parseFloat to convert to floating point number
		    var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;
		    contractTerm = parseInt(contractTerm); // use parseInt to convert to integer number
		    var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
		    	
		    // divide annualMinimum by the contractTerm to calculate the monthly minimum
		    var monthlyMinimum = (annualMinimum / contractTerm);
		    
		    // create a new date object and set it's value to be the start of the invoiceDate month
		    var startDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
		    
		    // create a new date object and set it's value to be the end of the startDate month
		    var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
		    
		    // format startDate so it can be used as a search filter
		    startDate = format.format({
		    	type: format.Type.DATE,
		    	value: startDate
		    });
		    
		    // format endDate so it can be used as a search filter
		    endDate = format.format({
		    	type: format.Type.DATE,
		    	value: endDate
		    });
		    
		    // run search to find period detail records for this billing month
		    var periodDetailSearch = search.create({
		    	type: 'customrecord_bbs_contract_period',
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_contract_period_start'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_end'
		    	}],
		    	
		    	filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_start',
    				operator: 'onorafter',
    				values: [startDate]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'onorbefore',
    				values: [endDate]
        		}],
        		
		    });
		    	
		    // process search results
    		periodDetailSearch.run().each(function(result) {
    			
    			// get the period start and end dates from the search results
	    		periodStart = result.getValue({
	    			name: 'custrecord_bbs_contract_period_start'
	    		});
	    		
	    		periodEnd = result.getValue({
	    			name: 'custrecord_bbs_contract_period_end'
	    		});

    		});
    		
    		// format periodStart as a date object
    		periodStart = format.parse({
    			type: format.Type.DATE,
    			value: periodStart
    		});
    		
    		// format periodEnd as a date object
    		periodEnd = format.parse({
    			type: format.Type.DATE,
    			value: periodEnd
    		});
    		
    		// get the day of the month from the periodStart and periodEnd objects
    		var periodStartDay = periodStart.getDate();
    		var periodEndDay = periodEnd.getDate();
    		
    		// create a new date object. Set date to be the end of the periodEnd's month
    		var testDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth()+1, 0);
    		
    		// get the day of the month from the testDate object
    		var testDateDay = testDate.getDate();
    		
    		// check if the periodStartDay variable is not equal to 1 OR periodEndDay variable is not equal to the testDateDay variable (IE contract period starts or ends mid month)
    		if (periodStartDay != 1 || periodEndDay != testDateDay)
    			{
    				// divide the monthlyMinimum by 2
    				monthlyMinimum = (monthlyMinimum / 2);
    			}
    		
    		// run search to find monthly minimum invoices for this contract record
    		var invoiceSearch = search.create({
    			   type: search.Type.INVOICE,
    			   
    			   columns: [{
    				   name: 'netamount',
    				   summary: 'SUM'
    			   }],
    			   
    			   filters: [{
    				   name: 'mainline',
    				   operator: 'is',
    				   values: ['F']
    			   },
    			   			{
    				   name: 'custbody_bbs_contract_record',
    				   operator: 'anyof',
    				   values: [contractRecord]
    			   	},
    			   			{
    			   		name: 'item',
    			   		operator: 'anyof',
    			   		values: [ambmaItem]
    			   	}],

    			});
    		
    		// process search results
    		invoiceSearch.run().each(function(result) {
    			
    			// get the total net amount
	    		invoicedTotal = result.getValue({
	    			name: 'netamount',
	    			summary: 'SUM'
	    		});

    		});
    		
    		// check if the invoicedTotal variable returns a value
    		if (invoicedTotal)
    			{
    				// use parseFloat to convert invoicedTotal to a floating point number
	    			invoicedTotal = parseFloat(invoicedTotal);
    			}
    		
    		// get the subtotal from the soRecord object
    		var soSubtotal = soRecord.getValue({
    			fieldId: 'subtotal'
    		});
    		
    		// check if the invoicedTotal variable is greater than or equal to the soSubtotal variable
    		if (invoicedTotal >= soSubtotal)
    			{
    				// call function to create the next monthly invoice. Pass in billingType, contractRecord, customer, monthlyMinimum and currency
					createNextInvoice(billingType, contractRecord, customer, monthlyMinimum, currency);    			
    			}
    		else // invoicedTotal variable is less than the soSubtotal variable
    			{
    				// create the next monthly invoice. Amount will be the monthly minimum less the balance of deferred revenue associated to the contract
    			}

	    }
    
    function AMP(recordID)
    	{
    		// set the billingType variable to AMP
			billingType = 'AMP';
    	
    		// load the sales order record
    		var soRecord = record.load({
		    	type: record.Type.SALES_ORDER,
		    	id: recordID,
		    	isDynamic: true
		    });
    		
    		// get the ID of the contract record from the sales order record
		    var contractRecord = soRecord.getValue({
		    	fieldId: 'custbody_bbs_contract_record'
		    });
    	
		    // lookup fields on the contract record
		    var contractRecordLookup = search.lookupFields({
		    	type: 'customrecord_bbs_contract',
		    	id: contractRecord,
		    	columns: ['custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_end_date']
		    });
    		
		    // return values from the contractRecordLookup
		    var minimumUsage = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
		    var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
		    
		    // get the total usage from the soRecord
		    var totalUsage = soRecord.getValue({
		    	fieldId: 'subtotal'
		    });

		    // format contractEnd as a date object
		    contractEnd = format.parse({
		    	type: format.Type.DATE,
		    	value: contractEnd
		    });
		    
		    // create a new date object and set it's value to be the start of the invoiceDate month
		    var startDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
		    
		    // create a new date object and set it's value to be the end of the startDate month
		    var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
		    
		    // if statement to check that the contractEnd is on or after the start Date and on or before the endDate
		    if (contractEnd >= startDate && contractEnd <= endDate)
		    	{
			    	// check if the totalUsage is less than the minimumUsage
				    if (totalUsage <= minimumUsage)
					    {
				    		// call function to close the sales order. Pass in soRecord object
				    		closeSalesOrder(soRecord);
					    }
				    // if the totalUsage is greater than the minimumUsage
				    else
				    	{
				    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage  and contractRecord
			    			addCreditLine(soRecord, billingType, minimumUsage, contractRecord);
			    		
			    			// call function to transform the sales order to an invoice. Pass in ID of sales order.
			    			createInvoice(recordID);
			    			
			    			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
							updatePeriodDetail(recordID, soRecord);
				    	}
		    	}		    
		    // check if the totalUsage is greater than the minimumUsage
		    else if (totalUsage > minimumUsage)
			    {
		    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage  and contractRecord
    				addCreditLine(soRecord, billingType, minimumUsage, contractRecord);
		    	
		    		// call function to transform the sales order to an invoice. Pass in ID of sales order
	    			createInvoice(recordID);
	    			
	    			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
					updatePeriodDetail(recordID, soRecord);
			    }
    	}
    
    function PAYG(recordID)
	    {
    		// call function to transform the sales order to an invoice. Pass in ID of sales order
			createInvoice(recordID);
			
			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in ID of sales order
			updatePeriodDetail(recordID);
	    }
    
    function QMP(recordID)
    	{
    		// declare and initiate variables
    		var quarterEnd;
    	
    		// set the billingType variable to QMP
			billingType = 'QMP';
    	
    		// load the sales order record
		    var soRecord = record.load({
		    	type: record.Type.SALES_ORDER,
		    	id: recordID,
		    	isDynamic: true
		    });
		    		
		    // get the ID of the customer from the sales order record
		    var customer = soRecord.getValue({
		    	fieldId: 'entity'
		    });
		    
		    // get the ID of the contract record from the sales order record
		    var contractRecord = soRecord.getValue({
		    	fieldId: 'custbody_bbs_contract_record'
		    });
		    	
		    // get the minimum usage and currency from the contract record
		    var contractRecordLookup = search.lookupFields({
		    	type: 'customrecord_bbs_contract',
		    	id: contractRecord,
		    	columns: ['custrecord_bbs_contract_qu_min_use', 'custrecord_bbs_contract_currency']
		    });
		    		
		    var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
		    var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
		    		
		    // get the total usage from the soRecord
		    var totalUsage = soRecord.getValue({
		    	fieldId: 'subtotal'
		    });
		    
		    // create a new date object and set it's value to be the start of the invoiceDate month
		    var startDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);

		    // create a new date object and set it's value to be the end of the startDate month
		    var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
		    
		    // format startDate so it can be used as a search filter
		    startDate = format.format({
		    	type: format.Type.DATE,
		    	value: startDate
		    });
		    
		    // format endDate so it can be used as a search filter
		    endDate = format.format({
		    	type: format.Type.DATE,
		    	value: endDate
		    });
		    
		    // run search to find period detail records for this billing month
		    var periodDetailSearch = search.create({
		    	type: 'customrecord_bbs_contract_period',
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_contract_period_qu_end'
		    	}],
		    	
		    	filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_start',
    				operator: 'onorafter',
    				values: [startDate]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'onorbefore',
    				values: [endDate]
        		}],
        		
		    });
		    	
		    // process search results
    		periodDetailSearch.run().each(function(result) {
    			
    			// get the quarter end date from the search results
	    		quarterEnd = result.getValue({
	    			name: 'custrecord_bbs_contract_period_qu_end'
	    		});
	    		
    		});
    		
    		// format quarterEnd as a date object
    		quarterEnd = format.parse({
    			type: format.Type.DATE,
    			value: quarterEnd
    		});
    		
    		// check if the invoiceDate is equal to the quarterEnd
			if (invoiceDate.getTime() == quarterEnd.getTime())
				{
	    			// check if the totalUsage is less than the minimumUsage
	    		    if (totalUsage <= minimumUsage)
	    			    {
	    		    		// call function to close the sales order. Pass in soRecord object
	    	    			closeSalesOrder(soRecord);
	    			    }
	    		    // if the totalUsage is greater than the minimumUsage
	    		    else
	    		    	{
	    		    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, recordID, billingType, minimumUsage and contractRecord
	    		    		addCreditLine(soRecord, recordID, billingType, minimumUsage, contractRecord);
	    		    		
	    		    		// call function to transform the sales order to an invoice. Pass in ID of sales order
	    					createInvoice(recordID);
	    					
	    					// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
	    					updatePeriodDetail(recordID, soRecord);
	    		    	}
	    		    
	    		    // call function to create the next quarterly invoice. Pass in billingType, contractRecord, customer, minimumUsage and currency
					createNextInvoice(billingType, contractRecord, customer, minimumUsage, currency);
				}
    		// check if the totalUsage is greater than the minimumUsage
    		else if (totalUsage > minimumUsage)
			    {
		    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
    				addCreditLine(soRecord, billingType, minimumUsage, contractRecord);
		    	
		    		// call function to transform the sales order to an invoice. Pass in ID of sales order
	    			createInvoice(recordID);
	    			
	    			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
					updatePeriodDetail(recordID, soRecord);
			    }
    	}
    
    function QUR(recordID)
	    {
    		// declare and initiate variables
			var quarterEnd;
			var overage;
	
			// set the billingType variable to QMP
			billingType = 'QMP';
	
			// load the sales order record
			var soRecord = record.load({
				type: record.Type.SALES_ORDER,
				id: recordID,
				isDynamic: true
			});
			
			// get the ID of the customer from the sales order record
		    var customer = soRecord.getValue({
		    	fieldId: 'entity'
		    });
	    		
			// get the ID of the contract record from the sales order record
			var contractRecord = soRecord.getValue({
				fieldId: 'custbody_bbs_contract_record'
			});
	    	
			// get the minimum usage and currency from the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecord,
				columns: ['custrecord_bbs_contract_qu_min_use', 'custrecord_bbs_contract_currency']
			});
	    		
			var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
	    		
			// get the total usage from the soRecord
			var totalUsage = soRecord.getValue({
				fieldId: 'subtotal'
			});
	    
			// create a new date object and set it's value to be the start of the invoiceDate month
			var startDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);

			// create a new date object and set it's value to be the end of the startDate month
			var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
	    
			// format startDate so it can be used as a search filter
			startDate = format.format({
				type: format.Type.DATE,
				value: startDate
			});
	    
			// format endDate so it can be used as a search filter
			endDate = format.format({
				type: format.Type.DATE,
				value: endDate
			});
	    
			// run search to find period detail records for this billing month
			var periodDetailSearch = search.create({
				type: 'customrecord_bbs_contract_period',
	    	
				columns: [{
	    		name: 'custrecord_bbs_contract_period_qu_end'
				}],
	    	
				filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecord]
				},
						{
					name: 'custrecord_bbs_contract_period_start',
					operator: 'onorafter',
					values: [startDate]
				},
						{
					name: 'custrecord_bbs_contract_period_end',
					operator: 'onorbefore',
					values: [endDate]
				}],
    		
			});
	    	
			// process search results
			periodDetailSearch.run().each(function(result) {
			
				// get the quarter end date from the search results
				quarterEnd = result.getValue({
					name: 'custrecord_bbs_contract_period_qu_end'
    			});
    		
			});
		
			// format quarterEnd as a date object
			quarterEnd = format.parse({
				type: format.Type.DATE,
				value: quarterEnd
			});
		
			// check if the invoiceDate is equal to the quarterEnd
			if (invoiceDate.getTime() == quarterEnd.getTime())
				{
	    			// check if the totalUsage is less than the minimumUsage
	    		    if (totalUsage <= minimumUsage)
	    			    {
	    		    		// call function to close the sales order. Pass in soRecord object
	    	    			closeSalesOrder(soRecord);
	    			    }
	    		    // if the totalUsage is greater than the minimumUsage
	    		    else
	    		    	{
	    		    		// calculate the overage by subtracting the minimumUsage from the totalUsage
	    		    		overage = parseFloat(totalUsage - minimumUsage);
	    		    		
	    		    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, recordID, billingType, minimumUsage and contractRecord
	    		    		addCreditLine(soRecord, recordID, billingType, minimumUsage, contractRecord);
	    		    		
	    		    		// call function to transform the sales order to an invoice. Pass in ID of sales order
	    					createInvoice(recordID);

	    					// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
	    					updatePeriodDetail(recordID, soRecord);
	    		    	}
	    		    
	    		    // call function to create the next quarterly invoice. Pass in billingType, contractRecord, customer, minimumUsage, currency and overage
					createNextInvoice(billingType, contractRecord, customer, minimumUsage, currency, overage);
				}
			// check if the totalUsage is greater than the minimumUsage
			else if (totalUsage > minimumUsage)
	    		{
					// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
					addCreditLine(soRecord, billingType, minimumUsage, contractRecord);
		    	
		    		// call function to transform the sales order to an invoice. Pass in ID of sales order
	    			createInvoice(recordID);
	    			
	    			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
					updatePeriodDetail(recordID, soRecord);
			    }    	
	    }
    
    function UIOLI(recordID)
    	{
    		// set the billingType variable to UIOLI
			billingType = 'UIOLI';
			
			// load the sales order record
    		var soRecord = record.load({
		    	type: record.Type.SALES_ORDER,
		    	id: recordID,
		    	isDynamic: true
		    });
    		
    		// get the ID of the contract record from the sales order record
			var contractRecord = soRecord.getValue({
				fieldId: 'custbody_bbs_contract_record'
			});
		
			// get the minimum usage from the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecord,
				columns: ['custrecord_bbs_contract_mon_min_use']
			});
			
			var minimumUsage = contractRecordLookup.custrecord_bbs_contract_mon_min_use;
			
			// get the total usage from the soRecord
			var totalUsage = soRecord.getValue({
				fieldId: 'subtotal'
			});
			
			// check if the totalUsage is less than the minimumUsage
			if (totalUsage < minimumUsage)
	    		{
					// calculate the difference by subtracting the totalUsage from the minimumUsage
					var difference = minimumUsage - totalUsage;
					
					// call function to add an adjustment item to the sales order prior to billing. Pass in soRecord, ID of sales order, difference and contractRecord
					addAdjustmentItem(soRecord, recordID, difference, contractRecord);
	    		}
    		
    		// call function to transform the sales order to an invoice. Pass in ID of sales order
			createInvoice(recordID);
			
			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
			updatePeriodDetail(recordID, soRecord);
    	}
    
    //====================================================
	// FUNCTION TO TRANSFORM THE SALES ORDER TO AN INVOICE
	//====================================================
    		
    function createInvoice(recordID)
    	{
    		try
    			{
		    		// transform the sales order to an invoice
		    		var invoiceRecord = record.transform({ 
		    			   fromType: record.Type.SALES_ORDER, 
		    			   fromId: recordID, 
		    			   toType: record.Type.INVOICE,
		    			   isDynamic: true
		    		});
		    		
		    		// set the tranDate on the invoiceRecord using the invoiceDate variable
		    		invoiceRecord.setValue({
		    			fieldId: 'trandate',
		    			value: invoiceDate
		    		});
		    		
		    		// set the posting account on the invoiceRecord
		    		invoiceRecord.setValue({
		    			fieldId: 'account',
		    			value: trcsAcc
		    		});
		
		    		// save the new invoice record
		    		var invoiceID = invoiceRecord.save({
		    			enableSourcing: false,
			    		ignoreMandatoryFields: true
		    		});
    		
		    		log.audit({
						title: 'Invoice Created',
						details: 'Invoice ID: ' + invoiceID + ' | Sales Order ID: ' + recordID
					});
    			}
    		catch(error)
	    		{
	    			log.error({
	    				title: 'Error creating invoice for sales order ' + recordID,
	    				details: error
	    			});
	    		}
    	}
    
    //===================================================================
	// FUNCTION TO CREATE A STANDALONE INVOICE FOR MONTHLY MANAGEMENT FEE
	//===================================================================
    
    function createMgmtFeeInvoice(contractRecord, customer, mgmtFeeAmt, currency)
    	{
    		// create a new date object and set it's value to be the start of the invoiceDate month
		    var startDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
	
		    // create a new date object and set it's value to be the end of the startDate month
		    var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
		    
		    // format startDate so it can be used as a search filter
		    startDate = format.format({
		    	type: format.Type.DATE,
		    	value: startDate
		    });
		    
		    // format endDate so it can be used as a search filter
		    endDate = format.format({
		    	type: format.Type.DATE,
		    	value: endDate
		    });
		    
		    // run search to find period detail records for this billing month
		    var periodDetailSearch = search.create({
		    	type: 'customrecord_bbs_contract_period',
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_contract_period_start'
		    	}],
		    	
		    	filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecord]
				},
						{
					name: 'custrecord_bbs_contract_period_start',
					operator: 'onorafter',
					values: [startDate]
				},
						{
					name: 'custrecord_bbs_contract_period_end',
					operator: 'onorbefore',
					values: [endDate]
	    		}],
		    });
		    
		    // process search results
		    periodDetailSearch.run().each(function(result) {
			
		    	// get the start date from the search results
		    	periodStartDate = result.getValue({
		    		name: 'custrecord_bbs_contract_period_start'
		    	});
    		
		    });
		
		    // format periodStartDate as a date object
			periodStartDate = format.parse({
				type: format.Type.DATE,
				value: periodStartDate
			});
		
			// get the day of the month from the periodStartDate object
			var dayOfMonth = periodStartDate.getDate();
			
			// check if the dayOfMonth is NOT equal to 1 (IE starts mid month)
			if (dayOfMonth != 1)
				{
					// call function to calculate how many days are in the month
					var daysInMonth = getDaysInMonth(periodStartDate.getMonth(), periodStartDate.getFullYear());
					
					// calculate the pro rata management fee amount
					var dailyFee = mgmtFeeAmt / daysInMonth;
					
					// multiply the dailyFee by the dayOfMonth to calculate the pro rata management fee amount
					mgmtFeeAmt = parseFloat(dailyFee * dayOfMonth);
				}    	

	    	try
	    		{
	    			// create a new invoice record
	    			var invoice = record.create({
	    				type: record.Type.INVOICE,
	    				isDynamic: true
	    			});
    				
    				// set header fields on the invoice record
		    		invoice.setValue({
		    			fieldId: 'trandate',
		    			value: invoiceDate
		    		});
    				
    				invoice.setValue({
	    				fieldId: 'entity',
	    				value: customer
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbodybbs_monthly_mgmt_fee_invoice',
	    				value: true
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbody_bbs_contract_record',
	    				value: contractRecord
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'currency',
	    				value: currency
	    			});
	    			
	    			invoice.setValue({
		    			fieldId: 'account',
		    			value: trcsAcc
		    		});
	    			
	    			// add a new line to the invoice
	    			invoice.selectNewLine({
	    				sublistId: 'item'
	    			});
	    			
	    			// set fields on the new line
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'item',
	    				value: mgmtFeeItem
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'rate',
	    				value: mgmtFeeAmt
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_contract_record',
	    				value: contractRecord
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
	    				details: 'Invoice ID: ' + invoiceID + ' | Contract ID: ' + contractRecord
	    			});   				
    			}
    		catch(error)
    			{
    				log.error({
    					title: 'Error Creating Mgmt Fee Invoice for Contract ID: ' + contractRecord,
    					details: error
    				});
    			}
    	}
    
    //=================================================================
	// FUNCTION TO CREATE A STANDALONE INVOICE FOR NEXT MONTHLY/QUARTERLY INVOICE
	//=================================================================
    
    function createNextInvoice(billingType, contractRecord, customer, amount, currency, overage)
		{
    		// set the invoice date to be the first of the month
    		invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth()+1, 1);
    	
    		try
				{
					// create a new invoice record
					var invoice = record.create({
						type: record.Type.INVOICE,
						isDynamic: true
					});
					
					// set header fields on the invoice record
					invoice.setValue({
		    			fieldId: 'trandate',
		    			value: invoiceDate
		    		});
					
	    			invoice.setValue({
	    				fieldId: 'entity',
	    				value: customer
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbody_bbs_contract_record',
	    				value: contractRecord
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'currency',
	    				value: currency
	    			});
	    			
	    			invoice.setValue({
						fieldId: 'account',
						value: trpAcc
					});
	    			
	    			// add a new line to the invoice
	    			invoice.selectNewLine({
	    				sublistId: 'item'
	    			});
	    			
	    			// check if the billingType variable returns 'AMBMA'
	    			if (billingType == 'AMBMA')
	    				{
	    					// set the item on the new line using the ambmaItem
		    				invoice.setCurrentSublistValue({
			    				sublistId: 'item',
			    				fieldId: 'item',
			    				value: ambmaItem
			    			});
	    				}
	    			else // billingType is QMP or QUR
	    				{
	    					// set the item on the new line using the qmpItem
		    				invoice.setCurrentSublistValue({
			    				sublistId: 'item',
			    				fieldId: 'item',
			    				value: qmpItem
			    			});
	    				}
	    			
	    			// set fields on the new line
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
	    			// check if the overage parameter returns a value
	    			if (overage)
	    				{
	    					// subtract the overage from the amount
		    				invoice.setCurrentSublistValue({
			    				sublistId: 'item',
			    				fieldId: 'rate',
			    				value: (amount - overage)
			    			});
	    				}
	    			else
	    				{
	    					// set the rate to be the amount
		    				invoice.setCurrentSublistValue({
			    				sublistId: 'item',
			    				fieldId: 'rate',
			    				value: amount
			    			});
	    				}
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_contract_record',
	    				value: contractRecord
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
	    				title: 'Next Prepayment Invoice Created',
	    				details: 'Invoice ID: ' + invoiceID + ' | Contract ID: ' + contractRecord
	    			});   				
				}
			catch(error)
				{
					log.error({
						title: 'Error Creating Next Prepayment Invoice for Contract ID: ' + contractRecord,
						details: error
					});
				}
		}
    
    //================================
	// FUNCTION TO CLOSE A SALES ORDER
	//================================
    
    function closeSalesOrder(soRecord)
	    {
    		try
    			{
		    		// get count of item lines
					var lineCount = soRecord.getLineCount({
						sublistId: 'item'
					});
			
					// loop through line count
					for (var x = 0; x < lineCount; x++)
						{
							// select the line
							soRecord.selectLine({
								sublistId: 'item',
								line: x
							});
							
							// set the 'isclosed' flag to true
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'isclosed',
								value: true
							});
							
							// commit the new line
							soRecord.commitLine({
								sublistId: 'item'
							});
						}
					
					// submit the sales order record
					var recordID = soRecord.save({
						enableSourcing: false,
			    		ignoreMandatoryFields: true
					});
					
					log.audit({
						title: 'Sales Order Closed',
						details: recordID
					});
    			}
    		catch(error)
	    		{
	    			log.error({
			    		title: 'Error Upating Sales Order ' + recordID,
			    		details: error
			    	});
	    		}
	    }
    
    //=================================================
	// FUNCTION TO ADD A CREDIT LINE TO THE SALES ORDER
	//=================================================
    
    function addCreditLine(soRecord, recordID, billingType, minimumUsage, contractRecord)
    	{
	    	try
	    		{
		    		// select a new line on the sales order record
			    	soRecord.selectNewLine({
			    		sublistId: 'item'
			    	});
			    	
			    	// check if the billingType returns QMP OR QUR
			    	if (billingType == 'QMP' || billingType == 'QUR')
			    		{
				    		// set the item on the new line
					    	soRecord.setCurrentSublistValue({
					            sublistId: 'item',
					            fieldId: 'item',
					            value: qmpCreditItem
					    	});
			    		}
			    	// check if the billingType returns AMP
			    	else if (billingType == 'AMP')
			    		{
			    			// set the item on the new line
					    	soRecord.setCurrentSublistValue({
					            sublistId: 'item',
					            fieldId: 'item',
					            value: ampCreditItem
					    	});
			    		}
			
			    	// set fields on the new line	
			    	soRecord.setCurrentSublistValue({
			    		sublistId: 'item',
			    		fieldId: 'quantity',
			    		value: 1
			    	});
			
			    	soRecord.setCurrentSublistValue({
			    		sublistId: 'item',
			    		fieldId: 'rate',
			    		value: (minimumUsage * -1) // multiply the minimumUsage by -1 to convert to a negative number
			    	});
			    	
			    	soRecord.setCurrentSublistValue({
			    		sublistId: 'item',
			    		fieldId: 'custcol_bbs_contract_record',
			    		value: contractRecord
			    	});
			    	
			    	// commit the new line
			    	soRecord.commitLine({
			    		sublistId: 'item'
			    	});
			    	
			    	// submit the sales order record
			    	soRecord.save({
			    		enableSourcing: false,
			    		ignoreMandatoryFields: true
			    	});
			    	
			    	log.audit({
			    		title: 'New line added to sales order record',
			    		details: recordID
			    	});
	    		}
	    	catch(error)
		    	{
		    		log.error({
			    		title: 'Error Updating Sales Order ' + recordID,
			    		details: error
			    	});
		    	}
    	}
    
    //======================================================
	// FUNCTION TO ADD AN ADJUSTMENT ITEM TO THE SALES ORDER
	//======================================================
    
    function addAdjustmentItem(soRecord, recordID, difference, contractRecord)
	    {
	    	try
	    		{
		    		// select a new line on the sales order record
					soRecord.selectNewLine({
						sublistId: 'item'
					});
							
					// set fields on the new line
					soRecord.setCurrentSublistValue({
						sublistId: 'item',
					    fieldId: 'item',
					    value: adjustmentItem
					});
							
					soRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
							
					soRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: difference
					});
							
					soRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_bbs_contract_record',
						value: contractRecord
					});
							
					// commit the new line
					soRecord.commitLine({
						sublistId: 'item'
					});
							
					// submit the sales order record
					var recordID = soRecord.save({
			    		enableSourcing: false,
			    		ignoreMandatoryFields: true
			    	});
							
					log.audit({
						title: 'New line added to sales order record',
						details: recordID
					});
	    		}
	    	catch(error)
		    	{
		    		log.error({
			    		title: 'Error Upating Sales Order ' + recordID,
			    		details: error
			    	});
		    	}
	    }
    
    
    //=================================================
	// FUNCTION TO CREATE A REVENUE RECOGNITION JOURNAL
	//=================================================
    
    function createRevRecJournal(recordID, billingType)
	    {
    		// declare and initialize variables
    		var itemID;
    		var itemLookup;
    		var postingAccount;
    		var rate;
    		var quantity;
    		var lineTotal;
    		
    		// format the invoiceDate object to a date (DD/MM/YYYY)
    		var journalDate = format.format({
    			type: format.Type.DATE,
    			value: invoiceDate
    		});
    		
    		// load the sales order record
		    var soRecord = record.load({
		    	type: record.Type.SALES_ORDER,
		    	id: recordID
		    });
		    		
		    // get field values from the soRecord
		    var customer = soRecord.getValue({
		    	fieldId: 'entity'
		    });
		    		
		    var contractRecord = soRecord.getValue({
		    	fieldId: 'custbody_bbs_contract_record'
		    });
		    		
		    var subtotal = soRecord.getValue({
		    	fieldId: 'subtotal'
		    });
		    		
		    // get line count from the soRecord
		    var lineCount = soRecord.getLineCount({
		    	sublistId: 'item'
		    });
		    		
		    // lookup fields on the customer record
		    var customerLookup = search.lookupFields({
		    	type: search.Type.CUSTOMER,
		    	id: customer,
		    	columns: ['subsidiary', 'custentity_bbs_location']
		    });
		    		
		    // get the subsidiary and location from the customerLookup
		    var subsidiary = customerLookup.subsidiary[0].value;
		    var location = customerLookup.custentity_bbs_location[0].value;
		    		
		    // lookup fields on the subsidiary record
		    var subsidiaryLookup = search.lookupFields({
		    	type: search.Type.SUBSIDIARY,
		    	id: subsidiary,
		    	columns: ['currency']
		    });
		    		
		    // get the currency from the subsidiaryLookup
		    var currency = subsidiaryLookup.currency[0].value;
		    	
		    // create a new journal record
		   var journalRecord = record.create({
		    	type: record.Type.JOURNAL_ENTRY,
		    	isDynamic: true
		    });
		    		
		    // set header fields on the journal record
		    journalRecord.setValue({
		    	fieldId: 'trandate',
		    	value: invoiceDate
		    });
		    		
		    journalRecord.setValue({
		    	fieldId: 'memo',
		    	value: billingType + ' + ' + journalDate
		    });
		    		
		    journalRecord.setValue({
		    	fieldId: 'custbody_bbs_contract_record',
		    	value: contractRecord
		    });
		    		
		    journalRecord.setValue({
		    	fieldId: 'custbody_bbs_rev_rec_journal',
		    	value: true
		    });
		    		
		    journalRecord.setValue({
		    	fieldId: 'subsidiary',
		    	value: subsidiary
		    });
		    		
		    journalRecord.setValue({
		    	fieldId: 'location',
		    	value: location
		    });
		    		
		    journalRecord.setValue({
		    	fieldId: 'currency',
		    	value: currency
		    });
		    		
		    // select a new line on the journal record
		    journalRecord.selectNewLine({
		    	sublistId: 'line'
		    });
		    		
		    // set fields on the new line
		    journalRecord.setCurrentSublistValue({
		    	sublistId: 'line',
		    	fieldId: 'account',
		    	value: 538 // 538 = 1210010	Deferred Income (Upfront)
		    });
		    		
		    journalRecord.setCurrentSublistValue({
		    	sublistId: 'line',
		    	fieldId: 'custcol_bbs_journal_customer',
		    	value: customer
		    });
		    		
		    journalRecord.setCurrentSublistValue({
		    	sublistId: 'line',
		    	fieldId: 'custcol_bbs_contract_record',
		    	value: contractRecord
		    });
		    		
		    journalRecord.setCurrentSublistValue({
		    	sublistId: 'line',
		    	fieldId: 'memo',
		    	value: billingType + ' + ' + journalDate
		    });
		    		
		    journalRecord.setCurrentSublistValue({
		    	sublistId: 'line',
		    	fieldId: 'debit',
		    	value: subtotal // SO subtotal
		    });
		    		
		    // commit the line
		    journalRecord.commitLine({
				sublistId: 'line'
			});
		    		
		    // loop through soRecord lineCount
		    for (var x = 0; x < lineCount; x++)
		    	{	        		
			        // get the internal ID of the item from the so line
			        itemID = soRecord.getSublistValue({
			        	sublistId: 'item',
			        	fieldId: 'item',
			        	line: x
			        });
			        		
			        // lookup the posting account on the item record
			        itemLookup = search.lookupFields({
			        	type: search.Type.ITEM,
			        	id: itemID,
			        	columns: ['incomeaccount']
			        });
			        		
			        postingAccount = itemLookup.incomeaccount[0].value;
			        		
			        // get the quantity and rate for the line
			        quantity = soRecord.getSublistValue({
			        	sublistId: 'item',
			        	fieldId: 'quantity',
			        	line: x
			        });
			        		
			        rate = soRecord.getSublistValue({
			        	sublistId: 'item',
			        	fieldId: 'rate',
			        	line: x
			        });
			        		
			        // multiply the quantity by the rate to calculate the lineTotal
			        lineTotal = parseFloat(quantity * rate);
			        		
			        // select a new line on the journal record
			        journalRecord.selectNewLine({
			        	sublistId: 'line'
			        });
			        		
			        // set fields on the new journal line
			        journalRecord.setCurrentSublistValue({
			        	sublistId: 'line',
			        	fieldId: 'account',
			        	value: postingAccount
			        });
			        		
			        journalRecord.setCurrentSublistValue({
			        	sublistId: 'line',
			        	fieldId: 'credit',
			        	value: lineTotal
			        });
			        		
			        journalRecord.setCurrentSublistValue({
			        	sublistId: 'line',
			        	fieldId: 'custcol_bbs_journal_customer',
			        	value: customer
			        });
			        		
			        journalRecord.setCurrentSublistValue({
			        	sublistId: 'line',
			        	fieldId: 'memo',
			        	value: billingType + ' + ' + journalDate
			        });
			        		
			        journalRecord.setCurrentSublistValue({
			        	sublistId: 'line',
			        	fieldId: 'custcol_bbs_contract_record',
			        	value: contractRecord
			        });
			        		
			        // commit the line
			        journalRecord.commitLine({
			    		sublistId: 'line'
			    	});	
		    	}
		    		
		    // submit the journal record record
			var journalID = journalRecord.save({
				enableSourcing: false,
	    		ignoreMandatoryFields: true
			});
					
			log.audit({
				title: 'Journal Created',
				details: 'Journal ID: ' + journalID + ' | Sales Order ID: ' + recordID
			});
	    }
    
    //===============================================================
	// FUNCTION TO UPDATE FIELDS ON THE RELEVANT PERIOD DETAIL RECORD	
	//===============================================================
    
    function updatePeriodDetail(recordID, soRecord)
	    {
    		// declare variables
	    	var itemID;
	    	var searchItem;
	    	var searchDate;
	    	var startDate = new Date();
	    	var endDate = new Date();
	    	var periodDetailSearch;
	    	var contractRecord;

	    	// check if the soRecord variable is blank
	    	if (soRecord != '')
	    		{
	    		 	// load the sales order record using the recordID variable
	    			soRecord = record.load({
	    				type: record.Type.SALES_ORDER,
	    				id: recordID,
	    				isDynamic: true
	    			});
	    		}
	    	
	    	// get count of item lines
        	var lineCount = soRecord.getLineCount({
        		sublistId: 'item'
        	});
        	
        	// loop through line count
	    	for (var i = 0; i < lineCount; i++)
	    		{
		    		// get the internal ID of the item for the line
	    			itemID = soRecord.getSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'item',
	    				line: i
	    			});
	    			
	    			// get the internal ID of the contract record for the line
	    			contractRecord = soRecord.getSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_contract_record',
	    				line: i
	    			});
	    			
	    			// get the search date for the line
	    			searchDate = soRecord.getSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_so_search_date',
	    				line: i
	    			});
	    			
	    			// only process lines where the searchDate variable returns a value
	    			if (searchDate)
	    				{
			    			// format searchDate as a date object
			            	searchDate = format.parse({
			        				value: searchDate,
			        				type: format.Type.DATE
			        		});
			            	
			            	// set the startDate to be the first day of the searchDate month
			    			startDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), 1);
			    			
			    			// set the endDate to be the last day of the startDate month
			    			endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
			    			
			    			// format startDate so it can be used as a search filter
			    			startDate = format.format({
			    				value: startDate,
			    				type: format.Type.DATE
			    			});
			    			
			    			// format endDate so it can be used as a search filter
			    			endDate = format.format({
			    				value: endDate,
			    				type: format.Type.DATE
			    			});
			    			
			    			// run search to find period detail records to be updated
			    			periodDetailSearch = search.create({
			        			type: 'customrecord_bbs_contract_period',
			        			
			        			columns: [{
			        				name: 'internalid'
			        			}],
			        			
			        			filters: [{
			        				name: 'custrecord_bbs_contract_period_contract',
			        				operator: 'anyof',
			        				values: [contractRecord]
			        			},
			        					{
			        				name: 'custrecord_bbs_contract_period_product',
			        				operator: 'anyof',
			        				values: [itemID]
			        			},
			        					{
			        				name: 'custrecord_bbs_contract_period_start',
			        				operator: 'onorafter',
			        				values: [startDate]
			        			},
			        					{
			        				name: 'custrecord_bbs_contract_period_end',
			        				operator: 'onorbefore',
			        				values: [endDate]
			            		}],
			        		});
			    			
			    			// process search results
			        		periodDetailSearch.run().each(function(result) {
			        			
			        			// get the record ID from the search results
			    	    		recordID = result.getValue({
			    	    			name: 'internalid'
			    	    		});
			    	    		
			    	    		try
									{
			    						// update fields on the period detail record
					        			record.submitFields({
					        				type: 'customrecord_bbs_contract_period',
					        				id: recordID,
					        				values: {
					        					custrecord_bbs_contract_period_usage_inv: true
					        				}
					        			});
					        			
					        			log.audit({
					        				title: 'Period Detail Record Updated',
					        				details: recordID
					        			});
									}
							
			    	    		catch(e)
			    					{
			    						log.error({
			    							title: 'An error occured updating Period Detail record ' + recordID,
			    							details: 'Error: ' + e
			    						});
			    					}
			        		});
			        		
			    		}
	    		}
	    }
    
    //================================================
	// FUNCTION TO GET THE NUMBER OF DAYS IN THE MONTH
	//================================================   
    
    function getDaysInMonth(month, year)
	    {
    		// day 0 is the last day in the current month
    	 	return new Date(year, month+1, 0).getDate(); // return the last day of the month
	    }
    
    function summarize(context)
	    {
	    	log.audit({
	    		title: 'Units Used',
	    		details: context.usage
	    	});
	    	
	    	log.audit({
	    		title: 'Number of Yields',
	    		details: context.yields
	    	});
	    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
