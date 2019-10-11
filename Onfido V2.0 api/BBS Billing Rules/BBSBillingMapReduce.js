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
	
	deferredIncomeUpfront = currentScript.getParameter({
		name: 'custscript_bbs_def_inc_upfront'
	});
	
	deferredIncomeMonthly = currentScript.getParameter({
		name: 'custscript_bbs_def_inc_monthly'
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
			}
		// AMP billing type
		else if (billingType == 4)
			{
				// call the AMP function. Pass in the internal ID of the sales order record
				AMP(recordID);
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
			}
		// QUR billing type
		else if (billingType == 5)
			{
				// call the QUR function. Pass in the internal ID of the sales order record
				QUR(recordID);
			}
		// UIOLI billing type
		else if (billingType == 2)
			{
				// call the UIOLI function. Pass in the internal ID of the sales order record
				UIOLI(recordID);
			}
		
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
		    	columns: ['custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_term', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_end_date']
		    });
		    
		    // return values from the contractRecordLookup
		    var annualMinimum = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
		    annualMinimum = parseFloat(annualMinimum); // use parseFloat to convert to floating point number
		    var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;
		    contractTerm = parseInt(contractTerm); // use parseInt to convert to integer number
		    var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
		    var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
		    
		    // format contractEnd as a date object
		    contractEnd = format.parse({
		    	type: format.Type.DATE,
		    	value: contractEnd
		    });
		    	
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
    		
    		// call function to calculate number of days in the current month
			var daysInMonth = getDaysInMonth(periodStartDate.getMonth(), periodStartDate.getFullYear());
			
			// check if the periodStartDay is NOT equal to 1 (IE starts mid month)
			if (periodStartDay != 1)
				{
					// calculate the days remaining in the month
					var daysRemaining = daysInMonth - periodStartDay;
					
					// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
					var dailyMinimum = monthlyMinimum / daysInMonth;
					
					// multiply the dailyMinimum by daysRemaining to calculate the pro rate minimum usage
					monthlyMinimum = parseFloat(dailyMinimum * daysRemaining);
					monthlyMinimum = monthlyMinimum.toFixed(2);
				}
			// check that the endDay is NOT equal to the end of the month (IE ends mid month)
			else if (endDay != daysInMonth)
				{
					// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
					var dailyMinimum = monthlyMinimum / daysInMonth;
					
					// multiply monthlyMinimum by periodEndDay to calculate the pro rate minimum usage
					monthlyMinimum = parseFloat(dailyMinimum * periodEndDay);
					monthlyMinimum = monthlyMinimum.toFixed(2);
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
    		
    		// check if the invoicedTotal variable is either blank or 0
    		if (invoicedTotal != '' || invoicedTotal == 0)
    			{
    				// call function to create the next monthly invoice. Pass in billingType, contractRecord, customer, monthlyMinimum and currency
					createNextInvoice(billingType, contractRecord, customer, monthlyMinimum, currency);
    			}
    		// check if the invoicedTotal variable is greater than or equal to the soSubtotal variable
    		else if (invoicedTotal >= soSubtotal)
    			{
    				// call function to create the next monthly invoice. Pass in billingType, contractRecord, customer, monthlyMinimum and currency
					createNextInvoice(billingType, contractRecord, customer, monthlyMinimum, currency);    			
    			}
    		else // invoicedTotal variable is less than the soSubtotal variable
    			{
    				// create the next monthly invoice. Amount will be the monthly minimum less the balance of deferred revenue associated to the contract
    			}
    		
    		// check if the invoiceDate is equal to the contractEnd
			if (invoiceDate.getTime() == contractEnd.getTime())
				{
					/*
		    		 * CREATE JOURNAL RECOGNISING ALL REMAINING DEFERRED REVENUE
		    		 */
				}
			else
				{
					// call function to create journal recognising all revenue for the current contract period. Pass in recordID and billingType
	    			createRevRecJournal(recordID, billingType);
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
				    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, recordID, billingType, minimumUsage  and contractRecord
			    			addCreditLine(soRecord, recordID, billingType, minimumUsage, contractRecord);
			    		
			    			// call function to transform the sales order to an invoice. Pass in ID of sales order.
			    			createInvoice(recordID);
			    			
			    			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
							updatePeriodDetail(recordID, soRecord);
				    	}
				    
				    // check if the totalUsage is less than the minimumUsage
	    		    if (totalUsage < minimumUsage)
	    		    	{
	    		    		/*
	    		    		 * CREATE JOURNAL RECOGNISING ALL REMAINING DEFERRED REVENUE
	    		    		 */
	    		    	}
	    		    // if the totalUsage is equal to the minimumUsage
	    		    else if (totalUsage == minimumUsage)
	    		    	{
	    		    		// call function to create journal recognising all revenue for the final contract period. Pass in recordID and billingType
	    		    		createRevRecJournal(recordID, billingType);
	    		    	}
	    		    // if the totalUsage is greater than the minimumUsage
	    		    else if (totalUsage > minimumUsage)
	    		    	{
	    		    		/*
	    		    		 * CREATE JOURNAL RECOGNISING ALL REVENUE FOR THE FINAL CONTRACT PERIOD PLUS UNUSED
	    		    		 */
	    		    	}
		    	}
		    else // this is calendar month end and NOT the end of the contract
		    	{
			    	// call function to create journal recognising all revenue for the current contract period. Pass in recordID and billingType
		    		createRevRecJournal(recordID, billingType);
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
	    		    else // totalUsage is greater than the minimumUsage
	    		    	{
	    		    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, recordID, billingType, minimumUsage and contractRecord
	    		    		addCreditLine(soRecord, recordID, billingType, minimumUsage, contractRecord);
	    		    		
	    		    		// call function to transform the sales order to an invoice. Pass in ID of sales order
	    					createInvoice(recordID);
	    					
	    					// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and soRecord
	    					updatePeriodDetail(recordID, soRecord);
	    		    	}
	    		    
	    		    // check if the totalUsage is less than the minimumUsage
	    		    if (totalUsage < minimumUsage)
	    		    	{
	    		    		/*
	    		    		 * CREATE JOURNAL RECOGNISING ALL REMAINING DEFERRED REVENUE
	    		    		 */
	    		    	}
	    		    // if the totalUsage is equal to the minimumUsage
	    		    else if (totalUsage == minimumUsage)
	    		    	{
	    		    		// call function to create journal recognising all revenue for the final contract period. Pass in recordID and billingType
    		    			createRevRecJournal(recordID, billingType);
	    		    	}
	    		    // if the totalUsage is greater than the minimumUsage
	    		    else if (totalUsage > minimumUsage)
	    		    	{
	    		    		/*
	    		    		 * CREATE JOURNAL RECOGNISING ALL REVENUE FOR THE FINAL CONTRACT PERIOD PLUS UNUSED
	    		    		 */
	    		    	}
	    		    
	    		    // call function to create the next quarterly invoice. Pass in billingType, contractRecord, customer, minimumUsage and currency
					createNextInvoice(billingType, contractRecord, customer, minimumUsage, currency);
				}
			else // this is calendar month end and NOT the end of the quarter
				{
					// call function to create journal recognising all revenue for the current contract period. Pass in recordID and billingType
	    			createRevRecJournal(recordID, billingType);
				}
    	}
    
    function QUR(recordID)
	    {
    		// declare and initiate variables
			var quarterEnd;
			var overage;
	
			// set the billingType variable to QUR
			billingType = 'QUR';
	
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
	    	
			// get the minimum usage, currency and contract end date from the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecord,
				columns: ['custrecord_bbs_contract_qu_min_use', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_end_date']
			});
	    		
			var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
			var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
			
			// format contractEnd as a date object
			contractEnd = format.parse({
				type: format.Type.DATE,
				value: contractEnd
			});
	    		
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
		
			// check if the invoiceDate is equal to the contractEnd
			if (invoiceDate.getTime() == contractEnd.getTime())
				{
					// check if the totalUsage is less than or equal to the minimumUsage
	    		    if (totalUsage <= minimumUsage)
	    			    {
	    		    		// call function to close the sales order. Pass in soRecord object
	    	    			closeSalesOrder(soRecord);
	    			    }
	    		    // if the totalUsage is greater than the minimumUsage
	    		    else if (totalUsage > minimumUsage)
			    		{
	    		    		// create last invoice
			    		}
	    		    
	    		    // check if there is any deferred revenue remaining
	    		    if (deferredRevenue > 0)
	    		    	{
	    		    		/*
	    		    		 * CREATE JOURNAL RECOGNISING REMAINING DEFERRED REVENUE BALANCE
	    		    		 */
	    		    	}
				}
			// if the invoiceDate is equal to the quarterEnd
			else if (invoiceDate.getTime() == quarterEnd.getTime())
				{
	    			// check if the totalUsage is less than or equal to the minimumUsage
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
					
					// call function to create journal recognising all revenue for the current contract period. Pass in recordID and billingType
    				createRevRecJournal(recordID, billingType);
				}
			// if this is calendar month end
			else
				{
					// call function to create journal recognising all revenue for the current contract period. Pass in recordID and billingType
    				createRevRecJournal(recordID, billingType);
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
			
		    	// get the start date from the search results
		    	periodStartDate = result.getValue({
		    		name: 'custrecord_bbs_contract_period_start'
		    	});
		    	
		    	// get the end date from the search results
		    	periodEndDate = result.getValue({
		    		name: 'custrecord_bbs_contract_period_end'
		    	});
    		
		    });
		
		    // format periodStartDate as a date object
			periodStartDate = format.parse({
				type: format.Type.DATE,
				value: periodStartDate
			});
			
			// format periodEndDate as a date object
			periodEndDate = format.parse({
				type: format.Type.DATE,
				value: periodEndDate
			});
		
			// get the day of the month from the periodStartDate object
			var startDay = periodStartDate.getDate();
			
			// get the day of the month from the periodEndDate object
			var endDay = periodEndDate.getDate();
			
			// call function to calculate number of days in the current month
			var daysInMonth = getDaysInMonth(periodStartDate.getMonth(), periodStartDate.getFullYear());
			
			// check if the startDay is NOT equal to 1 (IE starts mid month)
			if (startDay != 1)
				{
					// calculate the pro rata minimum usage
					var dailyMinimum = minimumUsage / daysInMonth;
					
					// calculate the days remaining in the month
					var daysRemaining = daysInMonth - startDay;
					
					// multiply the dailyMinimum by the daysRemaining to calculate the pro rate minimum usage
					minimumUsage = parseFloat(dailyMinimum * daysRemaining);
					minimumUsage = minimumUsage.toFixed(2);
				}
			// check that the endDay is NOT equal to the end of the month (IE ends mid month)
			else if (endDay != daysInMonth)
				{
					// calculate the pro rata minimum usage
					var dailyMinimum = minimumUsage / daysInMonth;
					
					// multiply the dailyMinimum by the endDay to calculate the pro rate minimum usage
					minimumUsage = parseFloat(dailyMinimum * endDay);
					minimumUsage = minimumUsage.toFixed(2);
				}
			
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
		    		
		    		invoiceRecord.setValue({
	    				fieldId: 'custbody_bbs_invoice_type',
	    				value: 5 // 5 = Usage
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
			
		    	// get the start date from the search results
		    	periodStartDate = result.getValue({
		    		name: 'custrecord_bbs_contract_period_start'
		    	});
		    	
		    	// get the end date from the search results
		    	periodEndDate = result.getValue({
		    		name: 'custrecord_bbs_contract_period_end'
		    	});
    		
		    });
		
		    // format periodStartDate as a date object
			periodStartDate = format.parse({
				type: format.Type.DATE,
				value: periodStartDate
			});
			
			// format periodEndDate as a date object
			periodEndDate = format.parse({
				type: format.Type.DATE,
				value: periodEndDate
			});
		
			// get the day of the month from the periodStartDate object
			var startDay = periodStartDate.getDate();
			
			// get the day of the month from the periodEndDate object
			var endDay = periodEndDate.getDate();
			
			// call function to calculate number of days in the current month
			var daysInMonth = getDaysInMonth(periodStartDate.getMonth(), periodStartDate.getFullYear());
			
			// check if the startDay is NOT equal to 1 (IE starts mid month)
			if (startDay != 1)
				{
					// calculate the pro rata management fee amount
					var dailyFee = mgmtFeeAmt / daysInMonth;
					
					// calculate the days remaining in the month
					var daysRemaining = daysInMonth - startDay;
					
					// multiply the dailyFee by the daysRemaining to calculate the pro rate management fee
					mgmtFeeAmt = parseFloat(dailyFee * daysRemaining);
					mgmtFeeAmt = mgmtFeeAmt.toFixed(2);
				}
			// check that the endDay is NOT equal to the end of the month (IE ends mid month)
			else if (endDay != daysInMonth)
				{
					// calculate the pro rata management fee amount
					var dailyFee = mgmtFeeAmt / daysInMonth;
					
					// multiply the dailyFee by the endDay to calculate the pro rate management fee
					mgmtFeeAmt = parseFloat(dailyFee * endDay);
					mgmtFeeAmt = mgmtFeeAmt.toFixed(2);
				}
			
			// lookup fields on the customer record
			var customerLookup = search.lookupFields({
				type: search.Type.CUSTOMER,
				id: customer,
				columns: ['custentity_bbs_location']
			});
			
			// retrieve values from the customerLookup
			var location = customerLookup.custentity_bbs_location[0].value;

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
    					fieldId: 'location',
    					value: location
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
	// FUNCTION TO CREATE THE NEXT MONTHLY/QUARTERLY PREPAYMENT INVOICE
	//=================================================================
    
    function createNextInvoice(billingType, contractRecord, customer, amount, currency, overage)
		{
    		// if the billingType returns 'QMP'
    		if (billingType == 'QMP')
    			{
    				// set the invoice date to be the first of the month
        			invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
    			}
    		// if the billingType is QUR
    		else if (billingType == 'QUR')
    			{
    				// set the invoice date to be the first of the next month
        			invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth()+1, 1);
    			}
    		
    		// lookup fields on the customer record
			var customerLookup = search.lookupFields({
				type: search.Type.CUSTOMER,
				id: customer,
				columns: ['custentity_bbs_location']
			});
			
			// retrieve values from the customerLookup
			var location = customerLookup.custentity_bbs_location[0].value;
    	
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
	    				fieldId: 'location',
	    				value: location
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'currency',
	    				value: currency
	    			});
	    			
	    			invoice.setValue({
						fieldId: 'account',
						value: trpAcc
					});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbody_bbs_invoice_type',
	    				value: 3 // 3 = Prepayment
	    			});
	    			
	    			// add a new line to the invoice
	    			invoice.selectNewLine({
	    				sublistId: 'item'
	    			});
	    			
	    			// if the billingType variable returns 'AMBMA'
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
    		try
    			{
		    		// declare and initialize variables
		    		var itemID;
		    		var lineAmount;
		    		var itemLookup;
		    		var postingAccount;
		    		var total = 0;
		    		
		    		// lookup fields on the sales order
		    		var salesOrderLookup = search.lookupFields({
		    			type: search.Type.SALES_ORDER,
		    			id: recordID,
		    			columns: ['custbody_bbs_contract_record', 'entity']
		    		});
		    		
		    		// retrieve values from the salesOrderLookup
		    		var contractRecord = salesOrderLookup.custbody_bbs_contract_record[0].value;
		    		var customer = salesOrderLookup.entity[0].value;
		    		
		    		// lookup fields on the customer record
				    var customerLookup = search.lookupFields({
				    	type: search.Type.CUSTOMER,
				    	id: customer,
				    	columns: ['subsidiary', 'custentity_bbs_location', 'custentity_bbs_client_tier']
				    });
				    		
				    // get the subsidiary, location and tier from the customerLookup
				    var subsidiary = customerLookup.subsidiary[0].value;
				    var location = customerLookup.custentity_bbs_location[0].value;
				    var tier = customerLookup.custentity_bbs_client_tier[0].value;
				    
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
				    
				    journalRecord.setValue({
				    	fieldId: 'custbody_bbs_related_sales_order',
				    	value: recordID
				    });
				    
				    // format the invoiceDate object to a date (DD/MM/YYYY)
		    		var journalDate = format.format({
		    			type: format.Type.DATE,
		    			value: invoiceDate
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
				    
				    // create search to find sales order lines for the current month
				    var soSearch = search.create({
				    	type: search.Type.SALES_ORDER,
				    	
				    	columns: [{
				    		name: 'incomeaccount',
				    		join: 'item'
				    	},
				    			{
				    		name: 'amount'
				    	}],
				    	
				    	filters: [{
				    		name: 'mainline',
				    		operator: 'is',
				    		values: ['F']
				    	},
				    			{
				    		name: 'internalid',
				    		operator: 'anyof',
				    		values: [recordID]
				    	},
				    			{
				    		name: 'custcol_bbs_so_search_date',
				    		operator: 'within',
				    		values: [startDate, endDate]
				    	}],
		
				    });
		
				    // run search and process search results
				    soSearch.run().each(function(result) {
				    	
				    	// get the line amount from the search results
				    	lineAmount = result.getValue({
				    		name: 'amount'
				    	});
				    	
				    	lineAmount = parseFloat(lineAmount); // use parseFloat to convert to floating point number
				    	
				    	// add the lineAmount to the total variable
				    	total += lineAmount;
				    	
				    	// get the income account for the item from the search results
				    	postingAccount = result.getValue({
				    		name: 'incomeaccount',
				    		join:'item'
				    	});
				        
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
				        	value: lineAmount
				        });
				        		
				        journalRecord.setCurrentSublistValue({
				        	sublistId: 'line',
				        	fieldId: 'entity',
				        	value: customer
				        });
				        
				        journalRecord.setCurrentSublistValue({
				        	sublistId: 'line',
				        	fieldId: 'location',
				        	value: location
				        });
				        
				        journalRecord.setCurrentSublistValue({
				        	sublistId: 'line',
				        	fieldId: 'custcol_bbs_journal_client_tier',
				        	value: tier
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
				        
				        journalRecord.setCurrentSublistValue({
				        	sublistId: 'line',
				        	fieldId: 'custcol_bbs_related_sales_order',
				        	value: recordID
				        });
				        		
				        // commit the line
				        journalRecord.commitLine({
				    		sublistId: 'line'
				    	});
		
					});
				    
				    // ============================================================================================
				    // NOW WE NEED TO ADD A LINE TO SUBTRACT BALANCES FROM THE APPROPRIATE DEFERRED REVENUE ACCOUNT
				    // ============================================================================================
		 
					// select a new line on the journal record
				    journalRecord.selectNewLine({
				    	sublistId: 'line'
				    });
				    		
			    	// if the billingType is 'AMBMA'
			    	if (billingType == 'AMBMA')
			    		{
			    			// set the account on the new line using the deferredIncomeMonthly variable
			    			journalRecord.setCurrentSublistValue({
			    				sublistId: 'line',
			    				fieldId: 'account',
			    				value: deferredIncomeMonthly
			    			});
			    		}
			    	// if the billingType is 'QMP, AMP or QUR'
			    	else
			    		{
				    		// set the account on the new line using the deferredIncomeUpfront variable
			    			journalRecord.setCurrentSublistValue({
			    				sublistId: 'line',
			    				fieldId: 'account',
			    				value: deferredIncomeUpfront
			    			});
			    		}
				    		
				    // set fields on the new line
				    journalRecord.setCurrentSublistValue({
				    	sublistId: 'line',
				    	fieldId: 'entity',
				    	value: customer
				    });
				    
				    journalRecord.setCurrentSublistValue({
				    	sublistId: 'line',
				    	fieldId: 'location',
				    	value: location
				    });
				    
				    journalRecord.setCurrentSublistValue({
				    	sublistId: 'line',
				    	fieldId: 'custcol_bbs_journal_client_tier',
				    	value: tier
				    });
				    		
				    journalRecord.setCurrentSublistValue({
				    	sublistId: 'line',
				    	fieldId: 'custcol_bbs_contract_record',
				    	value: contractRecord
				    });
				    
				    journalRecord.setCurrentSublistValue({
				    	sublistId: 'line',
				    	fieldId: 'custcol_bbs_related_sales_order',
				    	value: recordID
				    });
				    		
				    journalRecord.setCurrentSublistValue({
				    	sublistId: 'line',
				    	fieldId: 'memo',
				    	value: billingType + ' + ' + journalDate
				    });
				    		
				    journalRecord.setCurrentSublistValue({
				    	sublistId: 'line',
				    	fieldId: 'debit',
				    	value: total
				    });
				    		
				    // commit the line
				    journalRecord.commitLine({
						sublistId: 'line'
					});
				    
				    
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
		    catch(error)
			    {
			    	log.error({
						title: 'Error Creating Journal for Sales Order ID: ' + recordID,
						details: error
					});
			    }
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
