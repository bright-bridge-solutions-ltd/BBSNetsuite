/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format', 'N/task'],
function(runtime, search, record, format, task) {
	
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
	
	burCreditItem = currentScript.getParameter({
		name: 'custscript_bbs_credit_bi_annual_item'
	});
	
	burItem = currentScript.getParameter({
		name: 'custscript_bbs_bi_annual_min_prepay_item'
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
	
	deferredIncomeMgmtFee = currentScript.getParameter({
		name: 'custscript_bbs_def_inc_mgmt_fee'
	});
	
	unusedIncomeAccount = currentScript.getParameter({
		name: 'custscript_bbs_unused_income_account'
	});
	
	checksCompleteAccount = currentScript.getParameter({
		name: 'custscript_bbs_checks_complete_gl_acc'
	});
	
	mgmtFeeAccount = currentScript.getParameter({
		name: 'custscript_bbs_account_management_acc'
	});
	
	invoiceForm = currentScript.getParameter({
		name: 'custscript_bbs_onfido_invoice_form'
	});
	
	billingType = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select'
	});
	
	billingTypeText = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select_text'
	});
	
	subsidiary = currentScript.getParameter({
		name: 'custscript_bbs_subsidiary_select'
	});
	
	subsidiaryText = currentScript.getParameter({
		name: 'custscript_bbs_subsidiary_select_text'
	});
	
	initiatingUser = currentScript.getParameter({
		name: 'custscript_bbs_billing_email_emp_alert'
	});
   
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
    	
    	log.audit({
    		title: '*** BEGINNING OF BILLING RUN ***',
    		details: 'Billing Type: ' + billingTypeText + '<br>Subsidiary: ' + subsidiaryText
    	});
    	
    	// create search to find sales orders to be billed
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
				name: 'custrecord_bbs_contract_mgmt_fee_type',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'formulacurrency',
				formula: "ROUND(CASE WHEN TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custbody_bbs_contract_record.custrecord_bbs_contract_mgmt_fee_amt} / TO_CHAR(LAST_DAY({custbody_bbs_contract_record.custrecord_bbs_contract_start_date}),'DD')) * (TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_end_date},'DD') - TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'DD') +1) ELSE CASE WHEN TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_early_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_early_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custbody_bbs_contract_record.custrecord_bbs_contract_mgmt_fee_amt} / TO_CHAR(LAST_DAY({custbody_bbs_contract_record.custrecord_bbs_contract_start_date}),'DD')) * (TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_early_end_date},'DD') - TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'DD') +1) ELSE CASE WHEN TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custbody_bbs_contract_record.custrecord_bbs_contract_mgmt_fee_amt} / TO_CHAR(LAST_DAY({custbody_bbs_contract_record.custrecord_bbs_contract_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custbody_bbs_contract_record.custrecord_bbs_contract_start_date}),'DD') - TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_start_date},'DD') +1) ELSE CASE WHEN TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custbody_bbs_contract_record.custrecord_bbs_contract_mgmt_fee_amt} / TO_CHAR(LAST_DAY({custbody_bbs_contract_record.custrecord_bbs_contract_end_date}),'DD')) * TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_end_date},'DD') ELSE CASE WHEN TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_early_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_early_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custbody_bbs_contract_record.custrecord_bbs_contract_mgmt_fee_amt} / TO_CHAR(LAST_DAY({custbody_bbs_contract_record.custrecord_bbs_contract_early_end_date}),'DD')) * TO_CHAR({custbody_bbs_contract_record.custrecord_bbs_contract_early_end_date},'DD') ELSE {custbody_bbs_contract_record.custrecord_bbs_contract_mgmt_fee_amt} END END END END END,2)"
			},
					{
				name: 'custrecord_bbs_contract_currency',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_end_date',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_early_end_date',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'subsidiary',
				join: 'customer'
			},
					{
				name: 'custentity_bbs_location',
				join: 'customer'
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
				name: 'subsidiary',
				operator: 'anyof',
				values: [subsidiary]
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
    		},
    				{
    			name: 'custrecord_bbs_contract_billing_type',
    			join: 'custbody_bbs_contract_record',
    			operator: 'anyof',
    			values: [billingType]
    		},
    				{
    			name: 'internalid',
    			operator: 'anyof',
    			values: [384653]
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
    	
    	// declare new date object. Global variable so can be accessed throughout the script
    	invoiceDate = new Date();
    	invoiceDate.setDate(0); // set date to be the last day of the previous month
    	
    	invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate());
    	
    	// retrieve search results
    	var searchResult 		= JSON.parse(context.value);
    	var recordID			= searchResult.id;
    	var contractRecord 		= searchResult.values["custbody_bbs_contract_record"].value;
    	var billingType 		= searchResult.values["custrecord_bbs_contract_billing_type.custbody_bbs_contract_record"].value;
    	var contractCurrency 	= searchResult.values["custrecord_bbs_contract_currency.custbody_bbs_contract_record"].value;
    	var customer 			= searchResult.values["entity"].value;
		var customerSubsidiary	= searchResult.values["subsidiary.customer"].value;
		var customerLocation 	= searchResult.values["custentity_bbs_location.customer"].value;
		var mgmtFee 			= searchResult.values["custrecord_bbs_contract_mgmt_fee.custbody_bbs_contract_record"].value;
		var mgmtFeeType 		= searchResult.values["custrecord_bbs_contract_mgmt_fee_type.custbody_bbs_contract_record"].value;
		var mgmtFeeAmt 			= searchResult.values["formulacurrency"];
		var contractEnd 		= searchResult.values["custrecord_bbs_contract_end_date.custbody_bbs_contract_record"];
		var earlyEndDate 		= searchResult.values["custrecord_bbs_contract_early_end_date.custbody_bbs_contract_record"];
		
		log.audit({
			title: 'Processing Sales Order',
			details: recordID
		});
		
		//============================================================================================
		// CHECK THE BILLING TYPE AND CALL THE RELEVANT FUNCTION FOR PRE-PROCESSING OF THE SALES ORDER
		//============================================================================================
		
		// AMBMA billing type
		if (billingType == 6)
			{
				// call the AMBMA function. Pass record ID, contractRecord and contractCurrency
				AMBMA(recordID, contractRecord, contractCurrency);
			}
		// AMP and Contract Extension billing types
		else if (billingType == 4 || billingType == 8)
			{
				// call the AMP function. Pass billingType, recordID, contractRecord and contractCurrency
				AMP(billingType, recordID, contractRecord, contractCurrency);
			}
		// BUR billing type
		else if (billingType == 7)
			{
				// call the BUR function. Pass recordID, contractRecord and contractCurrency
				BUR(recordID, contractRecord, contractCurrency);
			}
		// PAYG billing type
		else if (billingType == 1)
			{
				// call the PAYG function. Pass recordID and contractRecord
				PAYG(recordID, contractRecord);
			}
		// QMP billing type
		else if (billingType == 3)
			{
				// call the QMP function. Pass record ID, contractRecord and contractCurrency
				QMP(recordID, contractRecord, contractCurrency);
			}
		// QUR billing type
		else if (billingType == 5)
			{
				// call the QUR function. Pass record ID, contractRecord and contractCurrency
				QUR(recordID, contractRecord, contractCurrency);
			}
		// UIOLI billing type
		else if (billingType == 2)
			{
				// call the UIOLI function. Pass recordID and contractRecord
				UIOLI(recordID, contractRecord);
			}
		
		// if the mgmtFee variable returns 1 (Mgmt Fee is Yes)
		if (mgmtFee == 1)
			{
				// convert contractEnd to a date object
				contractEnd = format.parse({
			    	type: format.Type.DATE,
			    	value: contractEnd
			    });
				
				// check we have an early termination date
				if (earlyEndDate)
					{
						// convert earlyEndDate to a date object
						earlyEndDate = format.parse({
					    	type: format.Type.DATE,
					    	value: earlyEndDate
					    });
					}
				
				// check if mgmtFeeType returns 1 (Monthly)
				if (mgmtFeeType == 1)
					{
						// call function to create a management fee invoice. Pass in ID of contract record, customer, mgmtFeeAmt and contractCurrency
						createMgmtFeeInvoice(contractRecord, customer, customerLocation, mgmtFeeAmt, contractCurrency);
					}
				else if (mgmtFeeType == 2) // else if mgmtFeeType returns 2 (Upfront)
					{
						// check if the invoiceDate is greater than (after) or equal to the contractEnd OR earlyEndDate
						if (invoiceDate.getTime() >= contractEnd.getTime() || earlyEndDate!= '' && invoiceDate.getTime() >= earlyEndDate.getTime())
							{
								// call function to create a journal to recognise monthly management fee revenue. Pass in ID of contract record, customer, mgmtFeeAmt, contractCurrency, customerSubsidiary and customerLocation. True = Clearing Journal
								createMgmtFeeJournal(contractRecord, customer, mgmtFeeAmt, contractCurrency, customerSubsidiary, customerLocation, true);
							}
						else
							{
								// call function to create a journal to recognise monthly management fee revenue. Pass in ID of contract record, customer, mgmtFeeAmt and contractCurrency, customerSubsidiary and customerLocation. True = Clearing Journal NO
								createMgmtFeeJournal(contractRecord, customer, mgmtFeeAmt, contractCurrency, customerSubsidiary, customerLocation,  false);
							}
					}
			}
		
		// call function to search and return number of monthly recurring billing products
		var recurringProducts = searchNumberOfRecurringProducts(contractRecord);
		
		// do we have any recurring products
		if (recurringProducts > 0)
			{
				// call function to create an invoice. Pass in ID of contract record, customer, customerLocation and contractCurrency
				createRecurringProductInvoice(contractRecord, customer, customerLocation, contractCurrency);
			}
		
    }
    
    //=========================================
	// SEPARATE FUNCTIONS FOR EACH BILLING TYPE
	//=========================================
    
    function AMBMA(recordID, contractRecord, contractCurrency)
	    {
	    	// set the billingType variable to AMBMA
    		billingType = 'AMBMA';
    		
    		// declare and initialize variables
    		var monthlyMinimum;
    		var cumulativeMinimums;
    		var thisMonthUsage;
    		var cumulativeUsage;
    		var maximumMonthlyMinimum;
    		var invoiceAmount;
    		var currentPeriod;
    		
    		// lookup fields on the contract record
		    var contractRecordLookup = search.lookupFields({
		    	type: 'customrecord_bbs_contract',
		    	id: contractRecord,
		    	columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_end_date', 'custrecord_bbs_contract_early_end_date', 'custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_cum_inv_total']
		    });
		    
		    // return values from the contractRecordLookup
		    var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
		    var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
		    var earlyEndDate = contractRecordLookup.custrecord_bbs_contract_early_end_date;
		    var annualMinimum = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
		    var cumulativeInvoices = contractRecordLookup.custrecord_bbs_contract_cum_inv_total;
		    
		    // check if the cumulativeInvoices variable is empty
		    if (cumulativeInvoices == '')
		    	{
		    		// set the cumulativeInvoices variable to 0
		    		cumulativeInvoices = 0;
		    	}
		    
		    // use parseFloat to convert cumulativeInvoices to a floating point number
		    cumulativeInvoices = parseFloat(cumulativeInvoices);
		    
		    // format contractEnd as a date object
		    contractEnd = format.parse({
		    	type: format.Type.DATE,
		    	value: contractEnd
		    });
		    
		    // check if earlyEndDate returns a value
		    if (earlyEndDate)
		    	{
		    		// format earlyEndDate as a date object
		    		earlyEndDate = format.parse({
		    			type: format.Type.DATE,
		    			value: earlyEndDate
		    		});
		    	}
    		
    		// create search to find cumulative total of monthly invoices for this contract
    		search.create({
    			type: search.Type.INVOICE,
    			
    			columns: [{
    				name: 'formulacurrency',
    				summary: 'SUM',
    				formula: '{totalamount}-{taxtotal}'
    			}],
    			
    			filters: [{
    				name: 'mainline',
    				operator: 'is',
    				values: ['T']
    			},
    					{
    				name: 'custbody_bbs_invoice_type',
    				operator: 'anyof',
    				values: ['3'] // 3 = Prepayment
    			},
    					{
    				name: 'custbody_bbs_contract_record',
    				operator: 'anyof',
    				values: [contractRecord]
    			}],
    		}).run().each(function(result) {
    			
    			// get the total of all invoices from the search results
    			cumulativeInvoicesSearchResult = result.getValue({
    				name: 'formulacurrency',
    				summary: 'SUM'
    			});
    			
    		});
    		
    		// check if the cumulativeInvoicesSearchResult variable is null
    		if (cumulativeInvoicesSearchResult == '')
    			{
    				// set the cumulativeInvoicesSearchResult variable to 0
    				cumulativeInvoicesSearchResult = 0;
    			}
    		
    		cumulativeInvoicesSearchResult = parseFloat(cumulativeInvoicesSearchResult); // use parseFloat to convert to a floating point number
    		
    		// add cumulativeInvoicesSearchResult to cumulativeInvoices
    		cumulativeInvoices += cumulativeInvoicesSearchResult;
    		
    		// create search to find the usage for the contract
    		search.create({
    			type: 'customrecord_bbs_contract_period',
    			
    			columns: [{
    				name: 'custrecord_bbs_contract_period_prod_use',
    				summary: 'SUM'
    			},
    					{
    				name: 'formulacurrency',
    				formula: "CASE WHEN TO_CHAR({custrecord_bbs_contract_period_end}, 'MM') = TO_CHAR(ADD_MONTHS({today},-1), 'MM') AND TO_CHAR({custrecord_bbs_contract_period_end}, 'YYYY') = TO_CHAR(ADD_MONTHS({today},-1), 'YYYY') THEN {custrecord_bbs_contract_period_prod_use} END",
    				summary: 'SUM'
    			},
    					{
    				name: 'formulatext',
    				formula: "CASE WHEN TO_CHAR({custrecord_bbs_contract_period_end}, 'MM') = TO_CHAR(ADD_MONTHS({today},-1), 'MM') AND TO_CHAR({custrecord_bbs_contract_period_end}, 'YYYY') = TO_CHAR(ADD_MONTHS({today},-1), 'YYYY') THEN {custrecord_bbs_contract_period_period} END",
    				summary: 'MAX'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'onorbefore',
    				values: ['lastmonth']
    			}],
    		
    		}).run().each(function(result)	{
    			
    			// get the the total of this month's usage from the search
    			cumulativeUsage = result.getValue({
    				name: 'custrecord_bbs_contract_period_prod_use',
    				summary: 'SUM'
    			});
    			
    			thisMonthUsage = result.getValue({
    				name: 'formulacurrency',
    				summary: 'SUM'
    			});
    			
    			currentPeriod = result.getValue({
    				name: 'formulatext',
    				summary: 'MAX'
    			});
    			
    		});
    		
    		// check if the thisMonthUsage variable is null
    		if (thisMonthUsage == '')
    			{
    				// set the thisMonthUsage to 0
    				thisMonthUsage = 0;
    			}
    		
    		// check if the cumulativeUsage variable is null
    		if (cumulativeUsage == '')
    			{
    				// set the cumulativeUsage to 0
    				cumulativeUsage = 0;
    			}
    		
    		thisMonthUsage 	= parseFloat(thisMonthUsage); // use parseFloat to convert to a floating point number
    		cumulativeUsage = parseFloat(cumulativeUsage); // use parseFloat to convert to a floating point number
			
			// create search to find monthly minimums for this contract
    		search.create({
    			type: 'customrecord_bbs_contract_minimum_usage',
    			
    			columns: [{
    				name: 'custrecord_bbs_contract_min_usage',
    				summary: 'SUM'
    			},
    					{
    				name: 'formulacurrency',
    				formula: "CASE WHEN {custrecord_bbs_contract_min_usage_month} = " + currentPeriod + " THEN {custrecord_bbs_contract_min_usage_month} END",
    				summary: 'MAX'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_min_usage_parent',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_min_usage_month',
    				operator: 'lessthanorequalto',
    				values: [currentPeriod]
    			}],
    			
    		}).run().each(function(result){
    			
    			// get the cumulative monthly minimums from the search results
    			cumulativeMinimums = result.getValue({
    				name: 'custrecord_bbs_contract_min_usage',
    				summary: 'SUM'
    			});
    			
    			monthlyMinimum = result.getValue({
    				name: 'formulacurrency',
    				summary: 'MAX'
    			});
    			
    		});
    		
    		cumulativeMinimums	= parseFloat(cumulativeMinimums); // use parseFloat to convert to a floating point number
    		monthlyMinimum		= parseFloat(monthlyMinimum); // use parseFloat to convert to a floating point number
    		
    		// call function to calculate the remaining deferred revenue. Pass in contractRecord. Deferred revenue amount will be returned
			var deferredRevAmt = calculateDeferredRev(contractRecord);
			
			log.audit({
				title: 'AMBMA Check',
				details: 'Current Period: ' + currentPeriod + '<br>Monthly Minimum: ' + monthlyMinimum + '<br>Cumulative Monthly Minimum: ' + cumulativeMinimums + '<br>Cumulative Invoice Total: ' + cumulativeInvoices + '<br>This Month Usage: ' + thisMonthUsage + '<br>Cumulative Usage: ' + cumulativeUsage + '<br>Deferred Rev Amt: ' + deferredRevAmt
			});
			
			/*
			 * =========================================================
			 * CALCULATE THE MAXIMUM MONTHLY MINIMUM THAT CAN BE CHARGED
			 * =========================================================
			 */
			
			// check if cumulativeInvoices plus monthlyMinimum is greater than or equal to annualMinimum
			if ((cumulativeInvoices + monthlyMinimum) >= annualMinimum)
				{
					// maximumMonthlyMinimum will be annualMinimum minus cumulativeInvoices
					maximumMonthlyMinimum = parseFloat(annualMinimum - cumulativeInvoices);
				}
			else
				{
					// maximumMonthlyMinimum will be the monthlyMinimum
					maximumMonthlyMinimum = monthlyMinimum;
				}
			
			/*
			 * =========================================
			 * CALCULATE THE AMOUNT FOR THE NEXT INVOICE
			 * =========================================
			 */
			
			// check if cumulativeUsage is less than or equal to annualMinimum
			if (cumulativeUsage < annualMinimum)
				{
					// check if cumulativeUsage is less than or equal to cumulativeMinimums
					if (cumulativeUsage <= cumulativeMinimums)
						{
							// invoiceAmount will be maximumMonthlyMinimum
							invoiceAmount = maximumMonthlyMinimum;
						}
					else
						{
							// invoiceAmount will be thisMonthUsage minus deferredRevAmt
							invoiceAmount = parseFloat(thisMonthUsage - deferredRevAmt);
						}
				}
			else
				{
					// invoiceAmount will be thisMonthUsage minus deferredRevAmt
					invoiceAmount = parseFloat(thisMonthUsage - deferredRevAmt);
				}
			
			// check that invoiceAmount is greater than 0
			if (invoiceAmount > 0)
				{
					// call function to create the next quarterly invoice. Pass in billingType, contractRecord, customer, invoiceAmount and contractCurrency
					createNextInvoice(billingType, contractRecord, customer, invoiceAmount, contractCurrency);
				}
			else
				{
					log.audit({
						title: 'Unable to Create Next Prepayment Invoice',
						details: 'Contract Record ID: ' + contractRecord + '<br>Reason: This would have resulted in a zero value invoice'
					});
		
		    		// update fields on the contract record
					record.submitFields({
						type: 'customrecord_bbs_contract',
						id: contractRecord,
						values: {
							custrecord_bbs_contract_prepayment_inv: invoiceAmount
						}
					});
				}
			
    		// check if the invoiceDate is greater than (after) or equal to the contractEnd OR earlyEndDate
			if (invoiceDate.getTime() >= contractEnd.getTime() || earlyEndDate!= '' && invoiceDate.getTime() >= earlyEndDate.getTime())
				{
					// load the sales order record
					var soRecord = record.load({
						type: record.Type.SALES_ORDER,
						id: recordID,
						isDynamic: true
					});
				
					// call function to close the sales order. Pass in soRecord object
    				closeSalesOrder(soRecord);
				
					// call function to create journal recognising all revenue for the current contract period and to clear deferred revenue balance. Pass in recordID, billingType and contractCurrency (True = Clearing Journal YES)
	    			createRevRecJournal(recordID, billingType, contractCurrency, true);
				}
			else
				{
					// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (False = Clearing Journal NO)
	    			createRevRecJournal(recordID, billingType, contractCurrency, false);
				}
	    }
    
    function AMP(billingType, recordID, contractRecord, contractCurrency)
    	{
	    	// declare and initialize variables
			var thisMonthUsage;
			var cumulativeUsage;
			var amtToBill;
			var creditLineAmt;
    	
    		// check if the billingType is 4 (AMP)
    		if (billingType == 4)
    			{
	    			// set the billingType variable to AMP
	    			billingType = 'AMP';
    			}
    		else if (billingType == 8) // if the billingType is 8 (Contract Extension)
    			{
    				// set the billingType variable to Contract Extension
    				billingType = 'Contract Extension';
    			}
    		
    		// load the sales order record
			var soRecord = record.load({
				type: record.Type.SALES_ORDER,
				id: recordID,
				isDynamic: true
			});
			
			// get the subtotal from the soRecord object
			var soSubtotal = soRecord.getValue({
				fieldId: 'subtotal'
			});
    		
    		// lookup fields on the contract record
		    var contractRecordLookup = search.lookupFields({
		    	type: 'customrecord_bbs_contract',
		    	id: contractRecord,
		    	columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_end_date', 'custrecord_bbs_contract_early_end_date', 'custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_cum_inv_total']
		    });
		    
		    // return values from the contractRecordLookup
		    var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
		    var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
		    var earlyEndDate = contractRecordLookup.custrecord_bbs_contract_early_end_date;
		    var annualMinimum = parseFloat(contractRecordLookup.custrecord_bbs_contract_min_ann_use);
		    
		    // format contractEnd as a date object
		    contractEnd = format.parse({
		    	type: format.Type.DATE,
		    	value: contractEnd
		    });
		    
		    // check if earlyEndDate returns a value
		    if (earlyEndDate)
		    	{
		    		// format earlyEndDate as a date object
		    		earlyEndDate = format.parse({
		    			type: format.Type.DATE,
		    			value: earlyEndDate
		    		});
		    	}
    		
    		// create search to find the usage for the contract
    		search.create({
    			type: 'customrecord_bbs_contract_period',
    			
    			columns: [{
    				name: 'custrecord_bbs_contract_period_prod_use',
    				summary: 'SUM'
    			},
    					{
    				name: 'formulacurrency',
    				formula: "CASE WHEN TO_CHAR({custrecord_bbs_contract_period_end}, 'MM') = TO_CHAR(ADD_MONTHS({today},-1), 'MM') AND TO_CHAR({custrecord_bbs_contract_period_end}, 'YYYY') = TO_CHAR(ADD_MONTHS({today},-1), 'YYYY') THEN {custrecord_bbs_contract_period_prod_use} END",
    				summary: 'SUM'
    			},
    					{
    				name: 'formulatext',
    				formula: "CASE WHEN TO_CHAR({custrecord_bbs_contract_period_end}, 'MM') = TO_CHAR(ADD_MONTHS({today},-1), 'MM') AND TO_CHAR({custrecord_bbs_contract_period_end}, 'YYYY') = TO_CHAR(ADD_MONTHS({today},-1), 'YYYY') THEN {custrecord_bbs_contract_period_period} END",
    				summary: 'MAX'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'onorbefore',
    				values: ['lastmonth']
    			}],
    		
    		}).run().each(function(result)	{
    			
    			// get the the usage from the search
    			cumulativeUsage = result.getValue({
    				name: 'custrecord_bbs_contract_period_prod_use',
    				summary: 'SUM'
    			});
    			
    			thisMonthUsage = result.getValue({
    				name: 'formulacurrency',
    				summary: 'SUM'
    			});
    			
    			currentPeriod = result.getValue({
    				name: 'formulatext',
    				summary: 'MAX'
    			});
    			
    		});
    		
    		// check if the thisMonthUsage variable is null
    		if (thisMonthUsage == '')
    			{
    				// set the thisMonthUsage to 0
    				thisMonthUsage = 0;
    			}
    		
    		// check if the cumulativeUsage variable is null
    		if (cumulativeUsage == '')
    			{
    				// set the cumulativeUsage to 0
    				cumulativeUsage = 0;
    			}
    		
    		thisMonthUsage 	= parseFloat(thisMonthUsage); // use parseFloat to convert to a floating point number
    		cumulativeUsage = parseFloat(cumulativeUsage); // use parseFloat to convert to a floating point number
    		
    		// call function to calculate the remaining deferred revenue. Pass in contractRecord. Deferred revenue amount will be returned
			var deferredRevAmt = calculateDeferredRev(contractRecord);
			
			// set the value of the calculatedDeferredRevenue variable
			calculatedDeferredRevenue = parseFloat(deferredRevAmt - thisMonthUsage);
			
			log.audit({
				title: 'AMP Check',
				details: 'Current Period: ' + currentPeriod + '<br>Annual Minimum: ' + annualMinimum + '<br>This Month Usage: ' + thisMonthUsage + '<br>Cumulative Usage: ' + cumulativeUsage + '<br>Deferred Rev Amt: ' + deferredRevAmt + '<br>Calculated Deferred Revenue Balance: ' + calculatedDeferredRevenue
			});
			
			// check if the invoiceDate is greater than (after) or equal to the contractEnd OR earlyEndDate
			if (invoiceDate.getTime() >= contractEnd.getTime() || earlyEndDate != '' && invoiceDate.getTime() >= earlyEndDate.getTime())
		    	{
					// check if calculatedDeferredRevenue is less than 0
					if (calculatedDeferredRevenue < 0)
						{
							// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
									
							// check if soSubtotal minus amtToBill is greater than 0
							if ((soSubtotal - amtToBill) > 0)
					    		{
						    		// calculate the value of the credit line that needs adding
					    			creditLineAmt = parseFloat(soSubtotal - amtToBill);
					    					
					    			// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, creditLineAmt and contractRecord
					    			addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
					    		}
					    			
					    	// call function to transform the sales order to an invoice. Pass in recordID
						    createInvoice(recordID);
						}
					else
						{
							// call function to close the sales order. Pass in soRecord object
			    			closeSalesOrder(soRecord);
						}
					
					// check if we have deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (True = Clearing Journal YES)
		    				createRevRecJournal(recordID, billingType, contractCurrency, true);
						}
		    	}
			else
				{
					// check if calculatedDeferredRevenue is less than 0
					if (calculatedDeferredRevenue < 0)
						{
							// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
									
							// check if soSubtotal minus amtToBill is greater than 0
							if ((soSubtotal - amtToBill) > 0)
					    		{
						    		// calculate the value of the credit line that needs adding
					    			creditLineAmt = parseFloat(soSubtotal - amtToBill);
					    					
					    			// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, creditLineAmt and contractRecord
					    			addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
					    		}
					    			
					    	// call function to transform the sales order to an invoice. Pass in recordID
						    createInvoice(recordID);
						}
					
					// check if we have deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{				
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (False = Clearing Journal NO)
							createRevRecJournal(recordID, billingType, contractCurrency, false);
						}
				}
    	}
    
    function BUR(recordID, contractRecord, contractCurrency)
    	{
	    	// declare and initiate variables
			var halfEnd;
			var contractHalf;
			var thisMonthUsage = 0;
			var halfStart = false;
			var currentPeriod = 0;
			var cumulativeHalfUsage = 0;
			var cumulativeUsage = 0;
			var calculatedDeferredRevenue = 0;
			var nextInvoiceAmount = 0;
			var creditLineAmount = 0;
			var amtToBill;
	
			// set the billingType variable to BUR
			billingType = 'BUR';
			
			// load the sales order record
			var soRecord = record.load({
				type: record.Type.SALES_ORDER,
				id: recordID,
				isDynamic: true
			});
			
			// get the subtotal from the soRecord object
			var soSubtotal = soRecord.getValue({
				fieldId: 'subtotal'
			});
			
		    // get the minimum usage, currency and contract end date from the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecord,
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_bi_ann_use', 'custrecord_bbs_contract_end_date', 'custrecord_bbs_contract_early_end_date', 'custrecord_bbs_contract_prepayment_inv', 'custrecord_bbs_contract_term']
			});
			
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var minimumUsage = contractRecordLookup.custrecord_bbs_contract_bi_ann_use;
			var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
			var earlyEndDate = contractRecordLookup.custrecord_bbs_contract_early_end_date;
			var lastPrepaymentAmount = contractRecordLookup.custrecord_bbs_contract_prepayment_inv;
			var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;
			
			// check if lastPrepaymentAmount is null
			if (lastPrepaymentAmount == '')
				{
					// set lastPrepaymentAmount to 0
					lastPrepaymentAmount = 0;
				}
			
			// use parseFloat to convert lastPrepaymentAmount to a floating point number
			lastPrepaymentAmount = parseFloat(lastPrepaymentAmount);
			
			// check if earlyEndDate returns a value
			if (earlyEndDate)
				{
					// format earlyEndDate as a date object
					earlyEndDate = format.parse({
						type: format.Type.DATE,
						value: earlyEndDate
					});
				}
			
			// format contractEnd as a date object
			contractEnd = format.parse({
				type: format.Type.DATE,
				value: contractEnd
			});
	    		
			// run search to find period detail records for this billing month
			var periodDetailSearch = search.create({
				type: 'customrecord_bbs_contract_period',
	    	
				columns: [{
					name: 'custrecord_bbs_contract_period_half_end',
					summary: 'MAX'
				},
						{
					name: 'custrecord_bbs_contract_period_half',
					summary: 'MAX'
				},
						{
		    		name: 'custrecord_bbs_contract_period_prod_use',
		    		summary: 'SUM'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_halfstart',
		    		summary: 'MAX'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_period',
		    		summary: 'MAX'
		    	}],
	    	
				filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecord]
				},
						{
					name: 'custrecord_bbs_contract_period_start',
					operator: 'within',
					values: ['lastmonth']
				}],
			
			});
	    	
			// process search results
			periodDetailSearch.run().each(function(result){
			
				// get the half end date from the search results
				halfEnd = result.getValue({
					name: 'custrecord_bbs_contract_period_half_end',
					summary: 'MAX'
				});
				
				contractHalf = result.getValue({
					name: 'custrecord_bbs_contract_period_half',
					summary: 'MAX'
				});
				
				currentPeriod = result.getValue({
					name: 'custrecord_bbs_contract_period_period',
					summary: 'MAX'
				});
				
				// get the usage for the current billing month from the search results
	    		thisMonthUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
	    		// get the value of the half start checkbox from the search results
	    		halfStart = result.getValue({
	    			name: 'custrecord_bbs_contract_period_halfstart',
	    			summary: 'MAX'
	    		});
			
			});
			
			// check if thisMonthUsage is null
			if (thisMonthUsage == '')
				{
				 	// set thisMonthUsage to 0
					thisMonthUsage = 0;
				}
			
			// use parseFloat to convert thisMonthUsage to a floating point number
			thisMonthUsage = parseFloat(thisMonthUsage);
			
			// create search to find cumulative usage for the current half
			var periodDetailHalfSearch = search.create({
				type: 'customrecord_bbs_contract_period',
				
				columns: [{
					name: 'custrecord_bbs_contract_period_prod_use',
					summary: 'SUM'
				}],
				
				filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecord]
				},
						{
					name: 'custrecord_bbs_contract_period_half_end',
					operator: 'on',
					values: [halfEnd]
				}],
			});
			
			// process search results
			periodDetailHalfSearch.run().each(function(result){
				
				// get the cumulative usage for the current half from the search results
				cumulativeHalfUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
			});
			
			// check if cumulativeHalfUsage is null
			if (cumulativeHalfUsage == '')
				{
				 	// set cumulativeHalfUsage to 0
					cumulativeHalfUsage = 0;
				}
			
			// use parseFloat to convert cumulativeHalfUsage to a floating point number
			cumulativeHalfUsage = parseFloat(cumulativeHalfUsage);
			
			// create search to find cumulative usage across the contract to date
			var periodDetailCumulativeSearch = search.create({
				type: 'customrecord_bbs_contract_period',
				
				columns: [{
					name: 'custrecord_bbs_contract_period_prod_use',
					summary: 'SUM'
				}],
				
				filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecord]
				}],
			});
			
			// process search results
			periodDetailCumulativeSearch.run().each(function(result){
				
				// get the cumulative usage to date from the search results
				cumulativeUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
			});
			
			// check if cumulativeUsage is null
			if (cumulativeUsage == '')
				{
				 	// set cumulativeUsage to 0
					cumulativeUsage = 0;
				}
			
			// use parseFloat to convert cumulativeUsage to a floating point number
			cumulativeUsage = parseFloat(cumulativeUsage);
	
			// format halfEnd as a date object
			halfEnd = format.parse({
				type: format.Type.DATE,
				value: halfEnd
			});
			
			// call function to calculate the remaining deferred revenue. Pass in contractRecord. Deferred revenue amount will be returned
			var deferredRevAmt = calculateDeferredRev(contractRecord);
			
			// set the value of the calculatedDeferredRevenue variable
			calculatedDeferredRevenue = parseFloat(deferredRevAmt - thisMonthUsage);
			
			log.audit({
				title: 'BUR Check',
				details: 'Current Period ' + currentPeriod + ' of ' + contractTerm + '<br>Minimum Usage: ' + minimumUsage + '<br>This Month Usage: ' + thisMonthUsage + '<br>Cumulative Half Usage: ' + cumulativeHalfUsage + '<br>Cumulative Usage to Date: ' + cumulativeUsage + '<br>Last Prepayment Invoice: ' + lastPrepaymentAmount + '<br>Actual Deferred Revenue Balance: ' + deferredRevAmt + '<br>Calculated Deferred Revenue Balance: ' + calculatedDeferredRevenue
			});
		
			// check if the invoiceDate is greater than (after) or equal to the contractEnd OR the invoiceDate is greater than (after) or equal to the earlyEndDate
			if (invoiceDate.getTime() >= contractEnd.getTime() || earlyEndDate != '' && invoiceDate.getTime() >= earlyEndDate.getTime())
				{
					// check if calculatedDeferredRevenue is less than 0
					if (calculatedDeferredRevenue < 0)
						{
		    				// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
							
							// check if soSubtotal minus amtToBill is greater than 0
				    		if ((soSubtotal - amtToBill) > 0)
				    			{
					    			// calculate the value of the credit line that needs adding
				    				creditLineAmt = parseFloat(soSubtotal - amtToBill);
				    			
				    				// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
				    				addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
				    			}
				    			
				    			// call function to transform the sales order to an invoice. Pass in recordID
					    		createInvoice(recordID);
						}
					else // calculatedDeferredRevenue is greater than or equal to 0
						{
							// call function to close the sales order. Pass in soRecord
	    	    			closeSalesOrder(soRecord);
						}
				
					// check if we have deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (True = Clearing Journal YES)
		    				createRevRecJournal(recordID, billingType, contractCurrency, true);
						}
				}
			// else check if the invoiceDate is greater than or equal to the halfEnd date and this is not month 12 of the contract (pro rata contracts have 13 periods)
			else if (invoiceDate.getTime() == halfEnd.getTime() && currentPeriod != contractTerm)
				{
					// check if calculatedDeferredRevenue is less than 0
					if (calculatedDeferredRevenue < 0)
						{
							// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
							
							// check if soSubtotal minus amtToBill is greater than 0
							if ((soSubtotal - amtToBill) > 0)
			    				{
				    				// calculate the value of the credit line that needs adding
			    					creditLineAmt = parseFloat(soSubtotal - amtToBill);
			    					
			    					// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, creditLineAmt and contractRecord
			    					addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
			    				}
			    			
			    			// call function to transform the sales order to an invoice. Pass in recordID
				    		createInvoice(recordID);
						}
					else // calculatedDeferredRevenue is greater than or equal to 0
						{
							// call function to close the sales order. Pass in soRecord
	    	    			closeSalesOrder(soRecord);
						}
					
					// check if cumulativeUsage is greater than or equal to 4 x minimumUsage
					if (cumulativeUsage >= (4 * minimumUsage))
						{
							log.audit({
		    					title: 'Unable to Create Next Prepayment Invoice',
		    					details: 'Contract Record ID: ' + contractRecord + '<br>Unable to create next prepayment invoice as this would have resulted in a zero value invoice'
		    				});
							
							// set the nextInvoiceAmount variable to 0
							nextInvoiceAmount = 0;
		    		
				    		// update fields on the contract record
							record.submitFields({
								type: 'customrecord_bbs_contract',
								id: contractRecord,
								values: {
									custrecord_bbs_contract_prepayment_inv: nextInvoiceAmount
								}
							});
						}
					// check if cumulativeUsage is greater than or equal to 3 x minimumUsage
					else if (cumulativeUsage >= (2 * minimumUsage))
						{
							log.audit({
		    					title: 'Unable to Create Next Prepayment Invoice',
		    					details: 'Contract Record ID: ' + contractRecord + '<br>Unable to create next prepayment invoice as this would have resulted in a zero value invoice'
		    				});
							
							// set the nextInvoiceAmount variable to 0
							nextInvoiceAmount = 0;
		    		
				    		// update fields on the contract record
							record.submitFields({
								type: 'customrecord_bbs_contract',
								id: contractRecord,
								values: {
									custrecord_bbs_contract_prepayment_inv: nextInvoiceAmount
								}
							});
						}
					// check if cumulativeUsage is greater than minimumUsage
					else if (cumulativeUsage > minimumUsage)
						{
							// set the nextInvoiceAmount to be 2 x minimumUsage minus cumulativeUsage
							nextInvoiceAmount = parseFloat((2 * minimumUsage) - cumulativeUsage);
							
							// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
							createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
						}
					else
						{
							// set the nextInvoiceAmount to be the minimumUsage
							nextInvoiceAmount = minimumUsage;
						
							// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
							createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
						}
					
					// check if deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType, contractCurrency and nextInvoiceAmount (False = Clearing Journal NO)
			    			createRevRecJournal(recordID, billingType, contractCurrency, false, nextInvoiceAmount);
						}
				}
			// else this is a month end
			else
				{
					// check if calculatedDeferredRevenue is less than 0 and thisMonthUsage is greater than 0
					if (calculatedDeferredRevenue < 0 && thisMonthUsage > 0)
						{
							// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
								
							// check if soSubtotal minus amtToBill is greater than 0
						    if ((soSubtotal - amtToBill) > 0)
						    	{
							    	// calculate the value of the credit line that needs adding
						    		var creditLineAmt = parseFloat(soSubtotal - amtToBill);
						    			
						    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
						    		addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
						    	}
					    			
					    	// call function to transform the sales order to an invoice. Pass in recordID
						    createInvoice(recordID);
						}
					
					// check if deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (False = Clearing Journal NO)
				    		createRevRecJournal(recordID, billingType, contractCurrency, false);
						}
				}
    	}
    
    function PAYG(recordID, contractRecord)
	    {
	    	// call function to transform the sales order to an invoice. Pass in recordID
			createInvoice(recordID);
			
			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and contractRecord
			updatePeriodDetail(recordID, contractRecord);
	    }
    
    function QMP(recordID, contractRecord, contractCurrency)
    	{
    		// set the billingType variable to QMP
			billingType = 'QMP';
    	
    		// declare and initiate variables
    		var quarterEnd;
    		var thisMonthUsage = 0;
    		var cumulativeUsage = 0;
    		var currentPeriod = 0;
    		var amtToBill;
    		var creditLineAmt;
    	
    		// load the sales order record
		    var soRecord = record.load({
		    	type: record.Type.SALES_ORDER,
		    	id: recordID,
		    	isDynamic: true
		    });
			
			// get the subtotal from the soRecord object
			var soSubtotal = soRecord.getValue({
				fieldId: 'subtotal'
			});
		    	
		    // lookup fields on the contract record
		    var contractRecordLookup = search.lookupFields({
		    	type: 'customrecord_bbs_contract',
		    	id: contractRecord,
		    	columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_qu_min_use', 'custrecord_bbs_contract_early_end_date', 'custrecord_bbs_contract_end_date', 'custrecord_bbs_contract_term']
		    });
		    		
		    // return values from the contractRecordLookup
		    var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
		    var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
		    var earlyEndDate = contractRecordLookup.custrecord_bbs_contract_early_end_date;
		    var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
		    var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;
		    
		    // check if earlyEndDate returns a value
		    if (earlyEndDate)
		    	{
		    		// format earlyEndDate as a date object
		    		earlyEndDate = format.parse({
		    			type: format.Type.DATE,
		    			value: earlyEndDate
		    		});
		    	}
		    
		    // format contractEnd as a date object
		    contractEnd = format.parse({
		    	type: format.Type.DATE,
		    	value: contractEnd
		    });
		    		
		    // create search to find period detail records for this billing month
		    var periodDetailSearch = search.create({
		    	type: 'customrecord_bbs_contract_period',
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_contract_period_qu_end',
		    		summary: 'MAX'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_prod_use',
		    		summary: 'SUM'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_period',
		    		summary: 'MAX'
		    	}],
		    	
		    	filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_start',
    				operator: 'within',
    				values: ['lastmonth']
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'within',
    				values: ['lastmonth']
        		}],
        		
		    });
		    	
		    // process search results
    		periodDetailSearch.run().each(function(result) {
    			
    			// get the quarter end date from the search results
	    		quarterEnd = result.getValue({
	    			name: 'custrecord_bbs_contract_period_qu_end',
	    			summary: 'MAX'
	    		});
	    		
	    		// get the usage for the current billing month from the search results
	    		thisMonthUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
	    		currentPeriod = result.getValue({
	    			name: 'custrecord_bbs_contract_period_period',
	    			summary: 'MAX'
	    		});
	    		
    		});
    		
    		// use parseFloat to convert thisMonthUsage to a floating point number
    		thisMonthUsage = parseFloat(thisMonthUsage);
    		
    		// create search to find cumulative usage for the current quarter
    		var periodDetailQtrSearch = search.create({
    			type: 'customrecord_bbs_contract_period',
    			
    			columns: [{
    				name: 'custrecord_bbs_contract_period_prod_use',
    				summary: 'SUM'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_qu_end',
    				operator: 'on',
    				values: [quarterEnd]
    			}],
    		});
    		
    		// process search results
    		periodDetailQtrSearch.run().each(function(result) {
    			
    			// get the cumulative usage for the current quarter from the search results
	    		cumulativeUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
    		});
    		
    		// use parseFloat to convert cumulativeUsage to a floating point number
    		cumulativeUsage = parseFloat(cumulativeUsage);
    		
    		// format quarterEnd as a date object
    		quarterEnd = format.parse({
    			type: format.Type.DATE,
    			value: quarterEnd
    		});
    		
    		// call function to calculate the remaining deferred revenue. Pass in contractRecord. Deferred revenue amount will be returned
			var deferredRevAmt = calculateDeferredRev(contractRecord);
			
			// calculate calculated deferred revenue position
			var calculatedDeferredRevenue = parseFloat(minimumUsage - cumulativeUsage);
    		
    		log.audit({
    			title: 'QMP Check',
    			details: 'Current Period ' + currentPeriod + ' of ' + contractTerm + '<br>Minimum Usage: ' + minimumUsage + '<br>This Month Usage: ' + thisMonthUsage + '<br>Cumulative Usage: ' + cumulativeUsage + '<br>Actual Deferred Revenue Balance: ' + deferredRevAmt + '<br>Calculated Deferred Revenue Balance: ' + calculatedDeferredRevenue
    		});
    		
    		// check if the invoiceDate is equal to the quarterEnd OR the invoiceDate is greater than (after) or equal to the earlyEndDate
			if (invoiceDate.getTime() == quarterEnd.getTime() && currentPeriod != contractTerm || invoiceDate.getTime() >= contractEnd.getTime() || earlyEndDate != '' && invoiceDate.getTime() >= earlyEndDate.getTime())
    			{
					// check if calculatedDeferredRevenue is less than 0
				    if (calculatedDeferredRevenue < 0)
				    	{
					    	// check if cumulativeUsage minus thisMonthUsage is greater than minimumUsage
				    		if ((cumulativeUsage - thisMonthUsage) > minimumUsage)
				    			{
					    			// set the amtToBill variable to be the cumulativeUsage
				    				amtToBill = cumulativeUsage;
				    			}
				    		// check if cumulativeUsage minus minimumUsage is less than or equal to 0
				    		else if ((cumulativeUsage - minimumUsage) <= 0)
				    			{
				    				// set the amtToBill variable to be 0
				    				amtToBill = 0;
				    			}
				    		else
				    			{
				    				// set the amtToBill variable to be cumulativeUsage minus minimumUsage
				    				amtToBill = parseFloat(cumulativeUsage - minimumUsage);				    			
				    			}
				    		
				    		// check if soSubtotal minus amtToBill is greater than 0
				    		if ((soSubtotal - amtToBill) > 0)
				    			{
					    			// calculate the value of the credit line that needs adding
				    				creditLineAmt = parseFloat(soSubtotal - amtToBill);
				    			
				    				// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
				    				addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
				    			}
				    			
				    			// call function to transform the sales order to an invoice. Pass in recordID
					    		createInvoice(recordID);
				    	}
				    else // if calculatedDeferredRevenue is greater than or equal to 0
				    	{
					    	// call function to close the sales order. Pass in soRecord
		    				closeSalesOrder(soRecord);
				    	}
				    
				    // check if deferredRevAmt is greater than 0
				    if (deferredRevAmt > 0)
				    	{
					    	// check if this is either the end of the contract or the early termination date has passed
						    if (invoiceDate.getTime() >= contractEnd.getTime() || earlyEndDate != '' && invoiceDate.getTime() >= earlyEndDate.getTime())
						    	{
							    	// call function to create journal recognising all revenue for the current contract period and to clear deferred revenue balance (if any remaining). Pass in recordID, billingType and contractCurrency (True = Clearing Journal YES)
						    		createRevRecJournal(recordID, billingType, contractCurrency, true);
						    	}
						    // else if this is the end of a contract quarter
						    else
						    	{
							    	// call function to create journal recognising all revenue for the current contract period and to clear deferred revenue balance (if any remaining). Pass in recordID, billingType, contractCurrency and minimumUsage (True = Clearing Journal YES)
						    		createRevRecJournal(recordID, billingType, contractCurrency, true, minimumUsage);
						    	}
				    	}
    			}			
			// else if this is NOT the end of the quarter or the early termination date
			else
				{
					// check if calculatedDeferredRevenue is less than 0
					if (calculatedDeferredRevenue < 0)
						{
							// check if cumulativeUsage minus thisMonthUsage is greater than minimumUsage
				    		if ((cumulativeUsage - thisMonthUsage) > minimumUsage)
				    			{
					    			// set the amtToBill variable to be the cumulativeUsage
				    				amtToBill = cumulativeUsage;
				    			}
				    		// check if cumulativeUsage minus minimumUsage is less than or equal to 0
				    		else if ((cumulativeUsage - minimumUsage) <= 0)
				    			{
				    				// set the amtToBill variable to be 0
				    				amtToBill = 0;
				    			}
				    		else
				    			{
				    				// set the amtToBill variable to be cumulativeUsage minus minimumUsage
				    				amtToBill = parseFloat(cumulativeUsage - minimumUsage);				    			
				    			}
				    		
				    		// check if soSubtotal minus amtToBill is greater than 0
				    		if ((soSubtotal - amtToBill) > 0)
				    			{
					    			// calculate the value of the credit line that needs adding
				    				creditLineAmt = parseFloat(soSubtotal - amtToBill);
				    			
				    				// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
				    				addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
				    			}
				    			
				    			// call function to transform the sales order to an invoice. Pass in recordID
					    		createInvoice(recordID);
						}
					
					// check if deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (False = Clearing Journal NO)
							createRevRecJournal(recordID, billingType, contractCurrency, false);
						}
				}
    	}
    
    function QUR(recordID, contractRecord, contractCurrency)
	    {
    		// declare and initiate variables
			var quarterEnd;
			var contractQuarter;
			var currentPeriod = 0;
			var thisMonthUsage = 0;
			var quarterStart = 0;
			var cumulativeQtrUsage = 0;
			var cumulativeUsage = 0;
			var calculatedDeferredRevenue = 0;
			var nextInvoiceAmount = 0;
			var creditLineAmount = 0;
			var amtToBill;
	
			// set the billingType variable to QUR
			billingType = 'QUR';
			
			// load the sales order record
			var soRecord = record.load({
				type: record.Type.SALES_ORDER,
				id: recordID,
				isDynamic: true
			});
			
			// get the subtotal from the soRecord object
			var soSubtotal = soRecord.getValue({
				fieldId: 'subtotal'
			});
			
		    // get the minimum usage, currency and contract end date from the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecord,
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_qu_min_use', 'custrecord_bbs_contract_end_date', 'custrecord_bbs_contract_early_end_date', 'custrecord_bbs_contract_prepayment_inv', 'custrecord_bbs_contract_term']
			});
	    		
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
			var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
			var earlyEndDate = contractRecordLookup.custrecord_bbs_contract_early_end_date;
			var lastPrepaymentAmount = contractRecordLookup.custrecord_bbs_contract_prepayment_inv;
			var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;
			
			// check if lastPrepaymentAmount is null
			if (lastPrepaymentAmount == '')
				{
					// set lastPrepaymentAmount to 0
					lastPrepaymentAmount = 0;
				}
			
			// use parseFloat to convert lastPrepaymentAmount to a floating point number
			lastPrepaymentAmount = parseFloat(lastPrepaymentAmount);
			
			// check if earlyEndDate returns a value
			if (earlyEndDate)
				{
					// format earlyEndDate as a date object
					earlyEndDate = format.parse({
						type: format.Type.DATE,
						value: earlyEndDate
					});
				}
			
			// format contractEnd as a date object
			contractEnd = format.parse({
				type: format.Type.DATE,
				value: contractEnd
			});
	    		
			// run search to find period detail records for this billing month
			var periodDetailSearch = search.create({
				type: 'customrecord_bbs_contract_period',
	    	
				columns: [{
					name: 'custrecord_bbs_contract_period_qu_end',
					summary: 'MAX'
				},
						{
					name: 'custrecord_bbs_contract_period_quarter',
					summary: 'MAX'
				},
						{
		    		name: 'custrecord_bbs_contract_period_prod_use',
		    		summary: 'SUM'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_qtr_start',
		    		summary: 'MAX'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_period',
		    		summary: 'MAX'
		    	}],
	    	
				filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecord]
				},
						{
					name: 'custrecord_bbs_contract_period_start',
					operator: 'within',
					values: ['lastmonth']
				},
						{
					name: 'custrecord_bbs_contract_period_end',
					operator: 'within',
					values: ['lastmonth']
				}],
    		
			});
	    	
			// process search results
			periodDetailSearch.run().each(function(result) {
			
				// get the quarter end date from the search results
				quarterEnd = result.getValue({
					name: 'custrecord_bbs_contract_period_qu_end',
					summary: 'MAX'
    			});
				
				contractQuarter = result.getValue({
					name: 'custrecord_bbs_contract_period_quarter',
					summary: 'MAX'
				});
				
				currentPeriod = result.getValue({
					name: 'custrecord_bbs_contract_period_period',
					summary: 'MAX'
				});
				
				// get the usage for the current billing month from the search results
	    		thisMonthUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
	    		// get the value of the quarter start checkbox from the search results
	    		quarterStart = result.getValue({
	    			name: 'custrecord_bbs_contract_period_qtr_start',
	    			summary: 'MAX'
	    		});
    		
			});
			
			// check if thisMonthUsage is null
			if (thisMonthUsage == '')
				{
				 	// set thisMonthUsage to 0
					thisMonthUsage = 0;
				}
			
			// use parseFloat to convert thisMonthUsage to a floating point number
    		thisMonthUsage = parseFloat(thisMonthUsage);
    		
    		// create search to find cumulative usage for the current quarter
    		var periodDetailQtrSearch = search.create({
    			type: 'customrecord_bbs_contract_period',
    			
    			columns: [{
    				name: 'custrecord_bbs_contract_period_prod_use',
    				summary: 'SUM'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_qu_end',
    				operator: 'on',
    				values: [quarterEnd]
    			}],
    		});
    		
    		// process search results
    		periodDetailQtrSearch.run().each(function(result) {
    			
    			// get the cumulative usage for the current quarter from the search results
    			cumulativeQtrUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
    		});
    		
    		// check if cumulativeQtrUsage is null
			if (cumulativeQtrUsage == '')
				{
				 	// set cumulativeQtrUsage to 0
					cumulativeQtrUsage = 0;
				}
    		
    		// use parseFloat to convert cumulativeQtrUsage to a floating point number
			cumulativeQtrUsage = parseFloat(cumulativeQtrUsage);
			
			// create search to find cumulative usage across the contract to date
			var periodDetailCumulativeSearch = search.create({
				type: 'customrecord_bbs_contract_period',
				
				columns: [{
    				name: 'custrecord_bbs_contract_period_prod_use',
    				summary: 'SUM'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			}],
    		});
    		
			// process search results
			periodDetailCumulativeSearch.run().each(function(result) {
    			
    			// get the cumulative usage to date from the search results
    			cumulativeUsage = result.getValue({
	    			name: 'custrecord_bbs_contract_period_prod_use',
	    			summary: 'SUM'
	    		});
	    		
    		});
    		
    		// check if cumulativeUsage is null
			if (cumulativeUsage == '')
				{
				 	// set cumulativeUsage to 0
					cumulativeUsage = 0;
				}
    		
    		// use parseFloat to convert cumulativeUsage to a floating point number
			cumulativeUsage = parseFloat(cumulativeUsage);

			// format quarterEnd as a date object
    		quarterEnd = format.parse({
    			type: format.Type.DATE,
    			value: quarterEnd
    		});
    		
			// call function to calculate the remaining deferred revenue. Pass in contractRecord. Deferred revenue amount will be returned
			var deferredRevAmt = calculateDeferredRev(contractRecord);
			
			// set the value of the calculatedDeferredRevenue variable
			calculatedDeferredRevenue = parseFloat(deferredRevAmt - thisMonthUsage);
			
			log.audit({
    			title: 'QUR Check',
    			details: 'Current Period ' + currentPeriod + ' of ' + contractTerm + '<br>Minimum Usage: ' + minimumUsage + '<br>This Month Usage: ' + thisMonthUsage + '<br>Cumulative Qtr Usage: ' + cumulativeQtrUsage + '<br>Cumulative Usage to Date: ' + cumulativeUsage + '<br>Last Prepayment Invoice: ' + lastPrepaymentAmount + '<br>Actual Deferred Revenue Balance: ' + deferredRevAmt + '<br>Calculated Deferred Revenue Balance: ' + calculatedDeferredRevenue
    		});
		
			// check if the invoiceDate is greater than (after) or equal to the contractEnd OR the invoiceDate is greater than (after) or equal to the earlyEndDate
			if (invoiceDate.getTime() >= contractEnd.getTime() || earlyEndDate != '' && invoiceDate.getTime() >= earlyEndDate.getTime())
				{
					// check if calculatedDeferredRevenue is less than 0
					if (calculatedDeferredRevenue < 0)
						{
		    				// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
							
							// check if soSubtotal minus amtToBill is greater than 0
				    		if ((soSubtotal - amtToBill) > 0)
				    			{
					    			// calculate the value of the credit line that needs adding
				    				creditLineAmt = parseFloat(soSubtotal - amtToBill);
				    			
				    				// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
				    				addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
				    			}
				    			
				    			// call function to transform the sales order to an invoice. Pass in recordID
					    		createInvoice(recordID);
						}
					else // calculatedDeferredRevenue is greater than or equal to 0
						{
							// call function to close the sales order. Pass in soRecord
	    	    			closeSalesOrder(soRecord);
						}
				
					// check if we have deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (True = Clearing Journal YES)
		    				createRevRecJournal(recordID, billingType, contractCurrency, true);
						}
				}
			// else check if the invoiceDate is greater than or equal to the quarterEnd date
			else if (invoiceDate.getTime() == quarterEnd.getTime() && currentPeriod != contractTerm)
				{
					// check if calculatedDeferredRevenue is less than 0
					if (calculatedDeferredRevenue < 0)
						{
							// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
							
							// check if soSubtotal minus amtToBill is greater than 0
							if ((soSubtotal - amtToBill) > 0)
			    				{
				    				// calculate the value of the credit line that needs adding
			    					creditLineAmt = parseFloat(soSubtotal - amtToBill);
			    					
			    					// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, creditLineAmt and contractRecord
			    					addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
			    				}
			    			
			    			// call function to transform the sales order to an invoice. Pass in recordID
				    		createInvoice(recordID);
						}
					else // calculatedDeferredRevenue is greater than or equal to 0
						{
							// call function to close the sales order. Pass in soRecord
	    	    			closeSalesOrder(soRecord);
						}
					
					// if contractQuarter variable is 1
					if (contractQuarter == 1)
						{
							// check if cumulativeUsage is greater than or equal to 4 x minimumUsage
							if (cumulativeUsage >= (4 * minimumUsage))
								{
									log.audit({
				    					title: 'Unable to Create Next Prepayment Invoice',
				    					details: 'Contract Record ID: ' + contractRecord + '<br>Unable to create next prepayment invoice as this would have resulted in a zero value invoice'
				    				});
									
									// set the nextInvoiceAmount variable to 0
									nextInvoiceAmount = 0;
				    		
						    		// update fields on the contract record
									record.submitFields({
										type: 'customrecord_bbs_contract',
										id: contractRecord,
										values: {
											custrecord_bbs_contract_prepayment_inv: nextInvoiceAmount
										}
									});
								}
							// check if cumulativeUsage is greater than or equal to 3 x minimumUsage
							else if (cumulativeUsage >= (2 * minimumUsage))
								{
									log.audit({
				    					title: 'Unable to Create Next Prepayment Invoice',
				    					details: 'Contract Record ID: ' + contractRecord + '<br>Unable to create next prepayment invoice as this would have resulted in a zero value invoice'
				    				});
									
									// set the nextInvoiceAmount variable to 0
									nextInvoiceAmount = 0;
				    		
						    		// update fields on the contract record
									record.submitFields({
										type: 'customrecord_bbs_contract',
										id: contractRecord,
										values: {
											custrecord_bbs_contract_prepayment_inv: nextInvoiceAmount
										}
									});
								}
							// check if cumulativeUsage is greater than minimumUsage
							else if (cumulativeUsage > minimumUsage)
								{
									// set the nextInvoiceAmount to be 2 x minimumUsage minus cumulativeUsage
									nextInvoiceAmount = parseFloat((2 * minimumUsage) - cumulativeUsage);
									
									// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
									createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
								}
							else
								{
									// set the nextInvoiceAmount to be the minimumUsage
									nextInvoiceAmount = minimumUsage;
								
									// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
									createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
								}
						}
					// if contractQuarter is 2
					else if (contractQuarter == 2)
						{
							// check if cumulativeUsage is greater than or equal to 4 x minimumUsage
							if (cumulativeUsage >= (4 * minimumUsage))
								{
									log.audit({
				    					title: 'Unable to Create Next Prepayment Invoice',
				    					details: 'Contract Record ID: ' + contractRecord + '<br>Unable to create next prepayment invoice as this would have resulted in a zero value invoice'
				    				});
									
									// set the nextInvoiceAmount variable to 0
									nextInvoiceAmount = 0;
				    		
						    		// update fields on the contract record
									record.submitFields({
										type: 'customrecord_bbs_contract',
										id: contractRecord,
										values: {
											custrecord_bbs_contract_prepayment_inv: nextInvoiceAmount
										}
									});
								}
							// check if cumulativeUsage is greater than or equal to 3 x minimumUsage
							else if (cumulativeUsage >= (3 * minimumUsage))
								{
									log.audit({
				    					title: 'Unable to Create Next Prepayment Invoice',
				    					details: 'Contract Record ID: ' + contractRecord + '<br>Unable to create next prepayment invoice as this would have resulted in a zero value invoice'
				    				});
									
									// set the nextInvoiceAmount variable to 0
									nextInvoiceAmount = 0;
				    		
						    		// update fields on the contract record
									record.submitFields({
										type: 'customrecord_bbs_contract',
										id: contractRecord,
										values: {
											custrecord_bbs_contract_prepayment_inv: nextInvoiceAmount
										}
									});
								}
							// check if cumulativeUsage is greater than or equal to 2 x minimumUsage
							else if (cumulativeUsage > (2 * minimumUsage))
								{
									// set the nextInvoiceAmount to be 3 x minimumUsage minus cumulativeUsage
									nextInvoiceAmount = parseFloat((3 * minimumUsage) - cumulativeUsage);
									
									// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
									createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
								}
							else
								{
									// set the nextInvoiceAmount to be the minimumUsage
									nextInvoiceAmount = minimumUsage;
								
									// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
									createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
								}
						}
					// if contractQuarter is 3
					else if (contractQuarter == 3)
						{
							// check if cumulativeUsage is greater than or equal to 4 x minimumUsage
							if (cumulativeUsage >= (4 * minimumUsage))
								{
									log.audit({
				    					title: 'Unable to Create Next Prepayment Invoice',
				    					details: 'Contract Record ID: ' + contractRecord + '<br>Unable to create next prepayment invoice as this would have resulted in a zero value invoice'
				    				});
									
									// set the nextInvoiceAmount variable to 0
									nextInvoiceAmount = 0;
				    		
						    		// update fields on the contract record
									record.submitFields({
										type: 'customrecord_bbs_contract',
										id: contractRecord,
										values: {
											custrecord_bbs_contract_prepayment_inv: nextInvoiceAmount
										}
									});
								}
							// check if cumulativeUsage is greater than 3 x minimumUsage
							else if (cumulativeUsage > (3 * minimumUsage))
								{
									// set the nextInvoiceAmount to be 3 x minimumUsage minus cumulativeUsage
									nextInvoiceAmount = parseFloat((4 * minimumUsage) - cumulativeUsage);
									
									// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
									createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
								}
							else
								{
									// set the nextInvoiceAmount to be the minimumUsage
									nextInvoiceAmount = minimumUsage;
								
									// call function to create next prepayment invoice. Pass in billingType, contractRecord, customer, nextInvoiceAmount and contractCurrency
									createNextInvoice(billingType, contractRecord, customer, nextInvoiceAmount, contractCurrency);
								}						
						}
					
					// check if deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType, contractCurrency and nextInvoiceAmount (False = Clearing Journal NO)
			    			createRevRecJournal(recordID, billingType, contractCurrency, false, nextInvoiceAmount);
						}
				}
			// else this is a month end
			else
				{
					// check if calculatedDeferredRevenue is less than 0 and thisMonthUsage is greater than 0
					if (calculatedDeferredRevenue < 0 && thisMonthUsage > 0)
						{
							// set the amtToBill variable to be the calculatedDeferredRevenue multiplied by -1 to create a positive number
							amtToBill = parseFloat(calculatedDeferredRevenue * -1);
								
							// check if soSubtotal minus amtToBill is greater than 0
						    if ((soSubtotal - amtToBill) > 0)
						    	{
							    	// calculate the value of the credit line that needs adding
						    		var creditLineAmt = parseFloat(soSubtotal - amtToBill);
						    			
						    		// call function to add a credit line to the sales order prior to billing. Pass in soRecord, billingType, minimumUsage and contractRecord
						    		addCreditLine(soRecord, billingType, creditLineAmt, contractRecord);
						    	}
					    			
					    	// call function to transform the sales order to an invoice. Pass in recordID
						    createInvoice(recordID);
						}
					
					// check if deferredRevAmt is greater than 0
					if (deferredRevAmt > 0)
						{
							// call function to create journal recognising all revenue for the current contract period. Pass in recordID, billingType and contractCurrency (False = Clearing Journal NO)
				    		createRevRecJournal(recordID, billingType, contractCurrency, false);
						}				
				}
	    }
    
    function UIOLI(recordID, contractRecord)
    	{
	    	// set the billingType variable to UIOLI
			billingType = 'UIOLI';
			
			// declare and initialize variables
			var currentPeriod;
			var monthlyMinimum;
		
			// create search to find period detail records for this billing month
		    search.create({
		    	type: 'customrecord_bbs_contract_period',
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_contract_period_period'
		    	}],
		    	
		    	filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_start',
    				operator: 'within',
    				values: ['lastmonth']
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'within',
    				values: ['lastmonth']
        		}],
        		
		    }).run().each(function(result) {
    			
    			// get the current period from the search results
    			currentPeriod = result.getValue({
	    			name: 'custrecord_bbs_contract_period_period'
	    		});

    		});
    		
    		// create search to find the minimum usage for this month
    		search.create({
    			type: 'customrecord_bbs_contract_minimum_usage',
    			
    			columns: [{
    				name: 'custrecord_bbs_contract_min_usage'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_min_usage_parent',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_min_usage_month',
    				operator: 'equalto',
    				values: [currentPeriod]
    			}],
    			
    		}).run().each(function(result){
    			
    			// get the minimum usage from the search results
    			monthlyMinimum = result.getValue({
    				name: 'custrecord_bbs_contract_min_usage'
    			});
    			
    		});
    		
    		monthlyMinimum = parseFloat(monthlyMinimum); // use parseFloat to convert to a floating point number
			
    		// load the sales order record
			var soRecord = record.load({
				type: record.Type.SALES_ORDER,
				id: recordID,
				isDynamic: true
			});
			
			// get the subtotal from the soRecord object
			var totalUsage = soRecord.getValue({
				fieldId: 'subtotal'
			});
			
			log.audit({
				title: 'UIOLI Check',
				details: 'Current Period: ' + currentPeriod + '<br>Minimum Usage: ' + monthlyMinimum + '<br>Usage: ' + totalUsage
			});
			
			// check if the totalUsage is less than the monthlyMinimum
			if (totalUsage < monthlyMinimum)
	    		{
					// calculate the difference by subtracting the totalUsage from the monthlyMinimum
					var difference = parseFloat(monthlyMinimum - totalUsage).toFixed(2);
					
					// call function to add an adjustment item to the sales order prior to billing. Pass in soRecord, difference and contractRecord
					addAdjustmentItem(soRecord, difference, contractRecord);
	    		}
			
			// call function to transform the sales order to an invoice. Pass in recordID
			createInvoice(recordID);
			
			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in recordID and contractRecord
			updatePeriodDetail(recordID, contractRecord);
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
		    			   isDynamic: true,
		    			   defaultValues: {
		    				   customform: invoiceForm
		    			   }
		    		});
		    		
		    		// set header fields on the invoice
		    		invoiceRecord.setValue({
		    			fieldId: 'trandate',
		    			value: invoiceDate
		    		});
		    		
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
						title: 'Sales Order Billed',
						details: 'Invoice ID: ' + invoiceID + '<br>Sales Order ID: ' + recordID
					});
    			}
    		catch(error)
	    		{
	    			log.error({
	    				title: 'Error Billing Sales Order',
	    				details: 'Sales Order ID: ' + recordID + '<br>Error: ' + error
	    			});
	    		}
    	}
    
    // ==============================================================
    // FUNCTION TO CREATE A STANDALONE INVOICE FOR RECURRING PRODUCTS
    // ==============================================================
    
    function createRecurringProductInvoice(contractRecord, customer, location, currency)
    	{
	    	// call function to calculate the accounting period. Pass invoiceDate
			var accountingPeriod = calculateAccountingPeriod(invoiceDate);
			
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
	    				fieldId: 'trandate',
	    				value: invoiceDate
	    			});
	    			
	    			invoice.setText({
	    				fieldId: 'postingperiod',
	    				value: accountingPeriod
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
	    				value: 6 // 6 = Recurring Product
	    			});
	    			
	    			// call function to return number of products to be billed
	    			var recurringProducts = searchRecurringProducts(contractRecord);
	    			
	    			// run search and process results
	    			recurringProducts.run().each(function(result){
	    				
	    				// get the item and amount from the search
	    				var item = result.getValue({
	    					name: 'custrecord_bbs_contract_mnth_items_item'
	    				});
	    				
	    				var amount = result.getValue({
	    					name: 'formulacurrency'
	    				});
	    				
	    				// add a new line to the invoice
		    			invoice.selectNewLine({
		    				sublistId: 'item'
		    			});
		    			
		    			// set fields on the new line
		    			invoice.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'item',
		    				value: item
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
		    			
		    			// process additional search results
		    			return true;
	    				
	    			});
	    			
	    			// submit the invoice record
	    			var invoiceID = invoice.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'Recurring Product Invoice Created',
	    				details: 'Invoice ID: ' + invoiceID + '<br>Contract ID: ' + contractRecord
	    			});   				
				}
			catch(error)
				{
					log.error({
						title: 'Error Creating Recurring Product Invoice',
						details: 'Contract ID: ' + contractRecord + '<br>Error: ' + error
					});
				}
    	}
    
    //===================================================================
	// FUNCTION TO CREATE A STANDALONE INVOICE FOR MONTHLY MANAGEMENT FEE
	//===================================================================
    
    function createMgmtFeeInvoice(contractRecord, customer, location, mgmtFeeAmt, currency)
    	{
    		// call function to calculate the accounting period. Pass invoiceDate
			var accountingPeriod = calculateAccountingPeriod(invoiceDate);
			
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
	    				fieldId: 'trandate',
	    				value: invoiceDate
	    			});
	    			
	    			invoice.setText({
	    				fieldId: 'postingperiod',
	    				value: accountingPeriod
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
	    				details: 'Invoice ID: ' + invoiceID + '<br>Contract ID: ' + contractRecord
	    			});   				
    			}
    		catch(error)
    			{
    				log.error({
    					title: 'Error Creating Mgmt Fee Invoice',
    					details: 'Contract ID: ' + contractRecord + '<br>Error: ' + error
    				});
    			}
    	}
    
    //=========================================================================
	// FUNCTION TO CREATE A JOURNAL TO RECOGNISE MONTHLY MANAGEMENT FEE REVENUE
	//=========================================================================
    
    function createMgmtFeeJournal(contractRecord, customer, mgmtFeeAmt, contractCurrency, customerSubsidiary, customerLocation, clearingJournal)
    	{
	    	// call function to return remaining management fee deferred balance. Pass contractRecord
			var remainingBalance = getRemainingMgmtFeeBalance(contractRecord);
			
			// check that we have remaining balance
			if (remainingBalance > 0)
				{
		    		// declare new date object. Global variable so can be accessed throughout the script
					invoiceDate = new Date();
					invoiceDate.setDate(0); // set date to be the last day of the previous month
					    	
					invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate());
				    	
					// format the invoiceDate object to a date (DD/MM/YYYY)
					var journalDate = format.format({
						type: format.Type.DATE,
						value: invoiceDate
					});
					    	
					try
				    	{
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
								value: 'Management Fee Revenue Release + ' + journalDate
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
								value: customerSubsidiary
							});
								    		
							journalRecord.setValue({
								fieldId: 'location',
								value: customerLocation
							});
								    		
							journalRecord.setValue({
								fieldId: 'currency',
								value: contractCurrency
							});
							
							journalRecord.setValue({
			    				fieldId: 'approvalstatus',
			    				value: 2 // Approved
			    			});
								    
							// check if this is a clearing journal
							if (clearingJournal == true)
								{
									// ========================================================================
									// ADD A LINE TO THE JOURNAL TO CREDIT REMAINING BALANCE TO REVENUE ACCOUNT
									// ========================================================================
				    				
				    				// select a new line on the journal record
									journalRecord.selectNewLine({
										sublistId: 'line'
									});
										    
									// set fields on the new line
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
									    fieldId: 'account',
									    value: mgmtFeeAccount
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'entity',
										value: customer
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'location',
										value: customerLocation
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'custcol_bbs_contract_record',
										value: contractRecord
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'memo',
										value: 'Management Fee Revenue Release + ' + journalDate
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'credit',
										value: remainingBalance
									});
								    	
									// commit the line
									journalRecord.commitLine({
										sublistId: 'line'
									});
									
									// ==================================================================================
									// ADD A LINE TO THE JOURNAL TO DEBIT REMAINING BALANCE FROM DEFERRED REVENUE ACCOUNT
									// ==================================================================================
									
									// select a new line on the journal record
									journalRecord.selectNewLine({
										sublistId: 'line'
									});
										    
									// set fields on the new line
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
									    fieldId: 'account',
									    value: deferredIncomeMgmtFee
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'entity',
										value: customer
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'location',
										value: customerLocation
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'custcol_bbs_contract_record',
										value: contractRecord
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'memo',
										value: 'Management Fee Revenue Release + ' + journalDate
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'debit',
										value: remainingBalance
									});
								    	
									// commit the line
									journalRecord.commitLine({
										sublistId: 'line'
									});
								}
							else // this is NOT a clearing journal
								{
									// ============================================================================
									// ADD A LINE TO THE JOURNAL TO RECOGNISE REVENUE FOR THE CURRENT BILLING MONTH
									// ============================================================================
				    				
				    				// select a new line on the journal record
									journalRecord.selectNewLine({
										sublistId: 'line'
									});
										    
									// set fields on the new line
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
									    fieldId: 'account',
									    value: mgmtFeeAccount
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'entity',
										value: customer
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'location',
										value: customerLocation
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'custcol_bbs_contract_record',
										value: contractRecord
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'memo',
										value: 'Management Fee Revenue Release + ' + journalDate
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'credit',
										value: mgmtFeeAmt
									});
								    	
									// commit the line
									journalRecord.commitLine({
										sublistId: 'line'
									});
									
									// ==================================================================================
									// ADD A LINE TO THE JOURNAL TO DEBIT REMAINING BALANCE FROM DEFERRED REVENUE ACCOUNT
									// ==================================================================================
									
									// select a new line on the journal record
									journalRecord.selectNewLine({
										sublistId: 'line'
									});
										    
									// set fields on the new line
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
									    fieldId: 'account',
									    value: deferredIncomeMgmtFee
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'entity',
										value: customer
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'location',
										value: customerLocation
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'custcol_bbs_contract_record',
										value: contractRecord
									});
										    		
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'memo',
										value: 'Management Fee Revenue Release + ' + journalDate
									});
										    
									journalRecord.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'debit',
										value: mgmtFeeAmt
									});
								    	
									// commit the line
									journalRecord.commitLine({
										sublistId: 'line'
									});
								}
							
							// save the journal record
							var journalID = journalRecord.save({
								ignoreMandatoryFields: true
							});
							
							log.audit({
								title: 'Management Fee Journal Created',
								details: journalID
							});
				    	}
					catch(e)
						{
							log.error({
								title: 'Unable to Create Management Fee Journal',
								details: e
							});
						}
				}
			else
				{
					log.audit({
						title: 'Unable to Create Management Fee Journal',
						details: 'Insufficient remaining balance'
					});
				}
    	}
    
    //=======================================================
	// FUNCTION TO CREATE THE NEXT MONTHLY PREPAYMENT INVOICE
	//=======================================================
    
    function createNextInvoice(billingType, contractRecord, customer, amount, currency, overage)
		{
    		if (billingType == 'QUR' || billingType == 'BUR')
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
			
			// call function to calculate the accounting period. Pass invoiceDate
			var accountingPeriod = calculateAccountingPeriod(invoiceDate);
		    	
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
						fieldId: 'trandate',
						value: invoiceDate
					});
					
					invoice.setText({
	    				fieldId: 'postingperiod',
	    				value: accountingPeriod
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
			    	else if (billingType == 'QUR') // billingType is QUR
			    		{
			    			// set the item on the new line using the qmpItem
				    		invoice.setCurrentSublistValue({
					    		sublistId: 'item',
					    		fieldId: 'item',
					    		value: qmpItem
					    	});
			    		}
			    	else if (billingType == 'BUR') // billingType is BUR
			    		{
			    			// set the item on the new line using the burItem
				    		invoice.setCurrentSublistValue({
					    		sublistId: 'item',
					    		fieldId: 'item',
					    		value: burItem
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
			    			// set the amount to be amount minus overage
			    			amount = parseFloat(amount - overage);
			    		}
			    				
			    	// set the rate to be the amount
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
			    	var invoiceID = invoice.save({
			    		enableSourcing: false,
					    ignoreMandatoryFields: true
			    	});
			    			
			    	log.audit({
			    		title: 'Next Prepayment Invoice Created',
			    		details: 'Invoice ID: ' + invoiceID + '<br>Contract ID: ' + contractRecord
			    	});   				
				}
			catch(error)
				{
					log.error({
						title: 'Error Creating Next Prepayment Invoice',
						details: 'Contract ID: ' + contractRecord + '<br>Error: ' + error
					});
				}
			
			// update fields on the contract record
			record.submitFields({
				type: 'customrecord_bbs_contract',
				id: contractRecord,
				values: {
					custrecord_bbs_contract_prepayment_inv: amount
				}
			});
    		
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
			    		title: 'Error Closing Sales Order',
			    		details: 'Sales Order ID: ' + recordID + '<br>Error: ' + error
			    	});
	    		}
	    }
    
    //=================================================
	// FUNCTION TO ADD A CREDIT LINE TO THE SALES ORDER
	//=================================================
    
    function addCreditLine(soRecord, billingType, amount, contractRecord)
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
			    	// check if the billingType returns BUR
			    	else if (billingType == 'BUR')
			    		{
				    		// set the item on the new line
					    	soRecord.setCurrentSublistValue({
					            sublistId: 'item',
					            fieldId: 'item',
					            value: burCreditItem
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
			    		value: (amount * -1) // multiply the minimumUsage by -1 to convert to a negative number
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
			    		title: 'Credit Line Added to Sales Order',
			    		details: recordID
			    	});
	    		}
	    	catch(error)
		    	{
		    		log.error({
			    		title: 'Error Adding Credit Line to Sales Order',
			    		details: 'Error: ' + error
			    	});
		    	}
    	}
    
    //======================================================
	// FUNCTION TO ADD AN ADJUSTMENT ITEM TO THE SALES ORDER
	//======================================================
    
    function addAdjustmentItem(soRecord, difference, contractRecord)
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
						title: 'Adjustment Item Added to Sales Order',
						details: recordID
					});
	    		}
	    	catch(error)
		    	{
		    		log.error({
			    		title: 'Error Adding Adjustment Item to Sales Order',
			    		details: 'Sales Order ID: ' + recordID + '<br>Error: ' + error
			    	});
		    	}
	    }
    
    //=================================================
	// FUNCTION TO CREATE A REVENUE RECOGNITION JOURNAL
	//=================================================
    
    function createRevRecJournal(recordID, billingType, contractCurrency, clearingJournal, minimumUsage)
	    {
	    	// declare new date object. Global variable so can be accessed throughout the script
	    	invoiceDate = new Date();
	    	invoiceDate.setDate(0); // set date to be the last day of the previous month
	    	
	    	invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate());
    	
    		// declare and initialize variables
		    var itemID;
		    var lineAmount;
		    var itemLookup;
		    var postingAccount;
		    var thisMonthUsage = 0;
		    var total = 0;
		    var location;
		    var tier;
		    		
		    // lookup fields on the sales order
		    var salesOrderLookup = search.lookupFields({
		    	type: search.Type.SALES_ORDER,
		    	id: recordID,
		    	columns: ['custbody_bbs_contract_record', 'entity']
		    });
		    		
		    // retrieve values from the salesOrderLookup
		    var contractRecord = salesOrderLookup.custbody_bbs_contract_record[0].value;
				    
			// call function to calculate deferred revenue amount. Pass in contractRecord
		    var deferredRevAmt = calculateDeferredRev(contractRecord);
		    
		    // check if minimumUsage returns a value
		    if (minimumUsage)
		    	{
		    		// subtract minimumUsage from deferredRevAmt
		    		deferredRevAmt = parseFloat(deferredRevAmt - minimumUsage);
		    	}
		    		
		    // check that the deferredRevAmt variable is greater than 0
		    if (deferredRevAmt > 0)
		   		{
			    	// get the customer from the salesOrderLookup
		    		var customer = salesOrderLookup.entity[0].value;
		    		
				    // lookup fields on the customer record
					var customerLookup = search.lookupFields({
						   type: search.Type.CUSTOMER,
						   id: customer,
						   columns: ['subsidiary', 'custentity_bbs_location', 'custentity_bbs_client_tier']
					});
						    		
					// get the subsidiary from the customerLookup object
					var subsidiary = customerLookup.subsidiary[0].value;
					
					// check if we have a location on the customer
					if (customerLookup.custentity_bbs_location.length > 0)
						{
							location = customerLookup.custentity_bbs_location[0].value;
						}
					
					// check if we have a client tier on the customer
					if (customerLookup.custentity_bbs_client_tier.length > 0)
						{
							tier = customerLookup.custentity_bbs_client_tier[0].value;
						}
					
					// format the invoiceDate object to a date (DD/MM/YYYY)
				    var journalDate = format.format({
				    	type: format.Type.DATE,
				    	value: invoiceDate
				    });
				    
				    // create search to find contract usage for the current billing month
		    		var thisMonthUsageSearch = search.create({
		    			type: 'customrecord_bbs_contract_period',
		    			
		    			columns: [{
		    				name: 'custrecord_bbs_contract_period_prod_use',
		    				summary: 'SUM'
		    			}],
		    			
		    			filters: [{
		    				name: 'custrecord_bbs_contract_period_contract',
		    				operator: 'anyof',
		    				values: [contractRecord]
		    			},
		    					{
		    				name: 'custrecord_bbs_contract_period_start',
		    				operator: 'within',
		    				values: ['lastmonth']
		    			},
		    				{
		    				name: 'custrecord_bbs_contract_period_end',
		    				operator: 'within',
		    				values: ['lastmonth']
		    			}],
		    		});
		    		
		    		// run search and process results
		    		thisMonthUsageSearch.run().each(function(result)	{
		    			
		    			// get the the total of this month's usage from the search
		    			thisMonthUsage = result.getValue({
		    				name: 'custrecord_bbs_contract_period_prod_use',
		    				summary: 'SUM'
		    			});
		    			
		    		});
		    		
		    		// check if the thisMonthUsage variable is empty
		    		if (thisMonthUsage == '')
		    			{
		    				// set the thisMonthUsage to 0
		    				thisMonthUsage = 0;
		    			}
		    		
		    		thisMonthUsage = parseFloat(thisMonthUsage); // use parseFloat to convert to a floating point number
		    		
		    		// check if thisMonthUsage is greater than 0 AND clearingJournal is false OR clearingJournal is true
		    		if ((thisMonthUsage > 0 && clearingJournal == false) || clearingJournal == true)
		    			{
				    		try
					   			{
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
								    	value: contractCurrency
								    });
								    
								    journalRecord.setValue({
								    	fieldId: 'custbody_bbs_related_sales_order',
								    	value: recordID
								    });
								    
								    journalRecord.setValue({
					    				fieldId: 'approvalstatus',
					    				value: 2 // Approved
					    			});
								    
								    // check if this is a clearing journal
								    if (clearingJournal == true)
								    	{
								    		// check if thisMonthUsage is less than/equal to deferredRevAmt
								    		if (thisMonthUsage <= deferredRevAmt)
								    			{
								    				// calculate the unused revenue amount
								    				var unused = parseFloat(deferredRevAmt - thisMonthUsage);					    				
								    				
								    				// check if we have an unused balance
								    				if (unused > 0)
								    					{	
										    				// add unused to the total
														    total += unused;
														    
														    // ==========================================================
														    // ADD A LINE TO THE JOURNAL TO CLEAR UNUSED DEFERRED REVENUE
														    // ==========================================================
														    
														    // select a new line on the journal record
															journalRecord.selectNewLine({
																sublistId: 'line'
															});
																    
															// set the account on the new line using the unusedIncomeAccount variable
															journalRecord.setCurrentSublistValue({
																sublistId: 'line',
															    fieldId: 'account',
															    value: unusedIncomeAccount
															});
																    
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
																    
															// set the credit amount to be the deferredRevAmt
															journalRecord.setCurrentSublistValue({
																sublistId: 'line',
																fieldId: 'credit',
																value: parseFloat(unused).toFixed(2)
															});
														    	
															// commit the line
															journalRecord.commitLine({
																sublistId: 'line'
															});
								    					}
													
													// check if thisMonthUsage is greater than 0
								    				if (thisMonthUsage > 0)
								    					{
										    				// ==========================================================================================
															// NOW WE NEED TO ADD LINES TO THE JOURNAL TO RECOGNISE REVENUE FOR THE CURRENT BILLING MONTH
															// ==========================================================================================
															
										    				// create search to find sales order lines for the current billing month
														    var soSearch = search.create({
														    	type: search.Type.SALES_ORDER,
														    	
														    	columns: [{
														    		name: 'custcol_bbs_income_account',
														    		summary: 'GROUP'
														    	},
														    			{
														    		name: 'fxamount',
														    		summary: 'SUM'
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
														    		values: ['lastmonth']
														    	}],
												
														    });
												
														    // run search and process search results
														    soSearch.run().each(function(result) {
														    	
														    	// get the line amount from the search results
														    	lineAmount = result.getValue({
														    		name: 'fxamount',
														    		summary: 'SUM'
														    	});
														    	
														    	lineAmount = parseFloat(lineAmount); // use parseFloat to convert to floating point number
														    	
														    	// add the lineAmount to the total variable
														    	total += lineAmount;
													    	
														    	// get the income account for the item from the search results
														    	postingAccount = result.getValue({
														    		name: 'custcol_bbs_income_account',
														    		summary: 'GROUP'
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
														        	value: parseFloat(lineAmount).toFixed(2)
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
														        
														        // continue processing search results
														        return true;
												
															});
								    					}
												    
												    // =========================================================================================
												    // NOW WE NEED TO ADD A LINE TO DEBIT BALANCES FROM THE APPROPRIATE DEFERRED REVENUE ACCOUNT
												    // =========================================================================================
												    
												    // select a new line on the journal record
												    journalRecord.selectNewLine({
												    	sublistId: 'line'
												    });
												    		
											    	// check if the billingType is 'AMBMA'
											    	if (billingType == 'AMBMA')
											    		{
											    			// set the account on the new line using the deferredIncomeMonthly variable
											    			journalRecord.setCurrentSublistValue({
											    				sublistId: 'line',
											    				fieldId: 'account',
											    				value: deferredIncomeMonthly
											    			});
											    		}
											    	// else if the billingType is 'QMP, AMP or QUR'
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
												    
												    // set the debit amount using the total variable
													journalRecord.setCurrentSublistValue({
														sublistId: 'line',
														fieldId: 'debit',
														value: parseFloat(total).toFixed(2)
													});
												    		
												    // commit the line
												    journalRecord.commitLine({
														sublistId: 'line'
													});
				
								    			}
								    		// else if thisMonthUsage is greater than deferredRevAmt
								    		else
								    			{
									    			// =============================================================
								    				// ADD A LINE TO CREDIT BALANCES TO THE CHECKS COMPLETED ACCOUNT
								    				// =============================================================
								    			
									    			// select a new line on the journal record
												    journalRecord.selectNewLine({
												    	sublistId: 'line'
												    });
												    
												    // set the account on the new line using the checksCompleteAccount variable
									    			journalRecord.setCurrentSublistValue({
									    				sublistId: 'line',
									    				fieldId: 'account',
									    				value: checksCompleteAccount
									    			});
									    			
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
												    
												    // set the credit amount using the deferredRevAmt variable
													journalRecord.setCurrentSublistValue({
														sublistId: 'line',
														fieldId: 'credit',
														value: parseFloat(deferredRevAmt).toFixed(2)
													});
												    		
												    // commit the line
												    journalRecord.commitLine({
														sublistId: 'line'
													});
								    			
								    				// =========================================================================================
												    // NOW WE NEED TO ADD A LINE TO DEBIT BALANCES FROM THE APPROPRIATE DEFERRED REVENUE ACCOUNT
												    // =========================================================================================
												    
												    // select a new line on the journal record
												    journalRecord.selectNewLine({
												    	sublistId: 'line'
												    });
											    		
											    	// check if the billingType is 'AMBMA'
											    	if (billingType == 'AMBMA')
											    		{
											    			// set the account on the new line using the deferredIncomeMonthly variable
											    			journalRecord.setCurrentSublistValue({
											    				sublistId: 'line',
											    				fieldId: 'account',
											    				value: deferredIncomeMonthly
											    			});
											    		}
											    	// else if the billingType is 'QMP, AMP or QUR'
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
												    
												    // set the debit amount using the deferredRevAmt variable
													journalRecord.setCurrentSublistValue({
														sublistId: 'line',
														fieldId: 'debit',
														value: parseFloat(deferredRevAmt).toFixed(2)
													});
												    		
												    // commit the line
												    journalRecord.commitLine({
														sublistId: 'line'
													});
								    			}
								    	}	
								    // else if this is NOT a clearing journal
								    else
								    	{
								    		// check if thisMonthUsage is less than/equal to deferredRevAmt
								    		if (thisMonthUsage <= deferredRevAmt)
								    			{
									    			// ===========================================================================
													// ADD LINES TO THE JOURNAL TO RECOGNISE REVENUE FOR THE CURRENT BILLING MONTH
													// ===========================================================================
													
									    			// create search to find sales order lines for the current billing month
												    var soSearch = search.create({
												    	type: search.Type.SALES_ORDER,
												    	
												    	columns: [{
												    		name: 'custcol_bbs_income_account',
												    		summary: 'GROUP'
												    	},
												    			{
												    		name: 'fxamount',
												    		summary: 'SUM'
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
												    		values: ['lastmonth']
												    	}],
										
												    });
										
												    // run search and process search results
												    soSearch.run().each(function(result) {
												    	
												    	// get the line amount from the search results
												    	lineAmount = result.getValue({
												    		name: 'fxamount',
												    		summary: 'SUM'
												    	});
												    	
												    	lineAmount = parseFloat(lineAmount); // use parseFloat to convert to floating point number
												    	
												    	// add the lineAmount to the total variable
												    	total += lineAmount;
											    	
												    	// get the income account for the item from the search results
												    	postingAccount = result.getValue({
												    		name: 'custcol_bbs_income_account',
												    		summary: 'GROUP',
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
												        	value: parseFloat(lineAmount).toFixed(2)
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
												        
												        // continue processing search results
												        return true;
										
													});
											    
												    // =========================================================================================
												    // NOW WE NEED TO ADD A LINE TO DEBIT BALANCES FROM THE APPROPRIATE DEFERRED REVENUE ACCOUNT
												    // =========================================================================================
												    
												    // select a new line on the journal record
												    journalRecord.selectNewLine({
												    	sublistId: 'line'
												    });
												    		
											    	// check if the billingType is 'AMBMA'
											    	if (billingType == 'AMBMA')
											    		{
											    			// set the account on the new line using the deferredIncomeMonthly variable
											    			journalRecord.setCurrentSublistValue({
											    				sublistId: 'line',
											    				fieldId: 'account',
											    				value: deferredIncomeMonthly
											    			});
											    		}
											    	// else if the billingType is 'QMP, AMP or QUR'
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
												    
												    // set the debit amount using the total variable
													journalRecord.setCurrentSublistValue({
														sublistId: 'line',
														fieldId: 'debit',
														value: parseFloat(total).toFixed(2)							
													});
												    		
												    // commit the line
												    journalRecord.commitLine({
														sublistId: 'line'
													});
												    
								    			}
								    		// else if thisMonthUsage is greater than deferredRevAmt
								    		else
								    			{
									    			// =============================================================
								    				// ADD A LINE TO CREDIT BALANCES TO THE CHECKS COMPLETED ACCOUNT
								    				// =============================================================
								    			
									    			// select a new line on the journal record
												    journalRecord.selectNewLine({
												    	sublistId: 'line'
												    });
												    
												    // set the account on the new line using the checksCompleteAccount variable
									    			journalRecord.setCurrentSublistValue({
									    				sublistId: 'line',
									    				fieldId: 'account',
									    				value: checksCompleteAccount
									    			});
									    			
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
												    
												    // set the credit amount using the deferredRevAmt variable
													journalRecord.setCurrentSublistValue({
														sublistId: 'line',
														fieldId: 'credit',
														value: parseFloat(deferredRevAmt).toFixed(2)
													});
												    		
												    // commit the line
												    journalRecord.commitLine({
														sublistId: 'line'
													});
								    			
								    				// =========================================================================================
												    // NOW WE NEED TO ADD A LINE TO DEBIT BALANCES FROM THE APPROPRIATE DEFERRED REVENUE ACCOUNT
												    // =========================================================================================
												    
												    // select a new line on the journal record
												    journalRecord.selectNewLine({
												    	sublistId: 'line'
												    });
												    		
											    	// check if the billingType is 'AMBMA'
											    	if (billingType == 'AMBMA')
											    		{
											    			// set the account on the new line using the deferredIncomeMonthly variable
											    			journalRecord.setCurrentSublistValue({
											    				sublistId: 'line',
											    				fieldId: 'account',
											    				value: deferredIncomeMonthly
											    			});
											    		}
											    	// else if the billingType is 'QMP, AMP or QUR'
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
												    
												    // set the debit amount using the deferredRevAmt variable
													journalRecord.setCurrentSublistValue({
														sublistId: 'line',
														fieldId: 'debit',
														value: parseFloat(deferredRevAmt).toFixed(2)
													});
												    		
												    // commit the line
												    journalRecord.commitLine({
														sublistId: 'line'
													});
								    			}
								    	}
								    
								    // submit the journal record record
									var journalID = journalRecord.save({
										enableSourcing: false,
									   ignoreMandatoryFields: true
									});
													
									log.audit({
										title: 'Journal Created',
										details: 'Journal ID: ' + journalID + '<br>Sales Order ID: ' + recordID
									});
				    			}
					   		catch(error)
					   			{
						   			log.error({
										title: 'Error Creating Journal',
										details: 'Sales Order ID: ' + recordID + '<br>Error: ' + error
									});
					   			}
		    			}
    			}
		   else // deferred revenue balance is 0
			    {
			    	log.audit({
						title: 'Unable to Create Journal',
						details: 'Sales Order ID: ' + recordID + '<br>Reason: Insufficient Deferred Revenue Balance'
					});
			    }
	    }
    
    //===============================================================
	// FUNCTION TO UPDATE FIELDS ON THE RELEVANT PERIOD DETAIL RECORD	
	//===============================================================
    
    function updatePeriodDetail(salesOrderID, contractRecord)
	    {
	    	
	    	// create search to find sales order lines for the current billing month
	    	var soSearch = search.create({
	    		type: search.Type.SALES_ORDER,
	    		
	    		columns: [{
	    			name: 'item',
	    			summary: 'GROUP'
	    		}],
	    		
	    		filters: [{
	    			name: 'mainline',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'custcol_bbs_so_search_date',
	    			operator: 'within',
	    			values: ['lastmonth']
	    		},
	    				{
	    			name: 'custcol_bbs_contract_record',
	    			operator: 'anyof',
	    			values: [contractRecord]
	    		}],	
	    		
	    	});
	    	
	    	// run search and process results
	    	soSearch.run().each(function(result) {
	    		
	    		// get the item ID from the search results
	    		var itemID = result.getValue({
	    			name: 'item',
	    			summary: 'GROUP'
	    		});
	    		
	    		// create search to find period detail records for this billing month for this item
	    		var periodDetailSearch = search.create({
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
        				operator: 'within',
        				values: ['lastmonth']
        			},
        					{
        				name: 'custrecord_bbs_contract_period_end',
        				operator: 'within',
        				values: ['lastmonth']
            		}],
        		});
	    		
	    		// run search and process results
	    		periodDetailSearch.run().each(function(result) {
	    			
	    			// get the record ID from the search results
    	    		var recordID = result.getValue({
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
    							title: 'Error Updating Period Detail Record',
    							details: 'Sales Order ID: ' + salesOrderID + '<br>Error: ' + e
    						});
    					}
        		});
	    		
	    		// continue processing additional results
	    		return true
	    		
	    	});

	    }
    
    //========================================================
	// FUNCTION TO CALCULATE REMAINING DEFERRED REVENUE AMOUNT
	//========================================================
    
    function calculateDeferredRev(contractRecord)
    	{
	    	// load search to find remaining deferred revenue balance
	    	var deferredRevSearch = search.load({
	            id: 'customsearch_bbs_contract_record_def_rev'
	        });
	    	
	    	// get the current search filters from the loaded search object
	    	var searchFilters = deferredRevSearch.filters;
	    	
	    	// create a new search filter
	    	var newFilter = search.createFilter({
	    		name: 'custcol_bbs_contract_record',
	    	    operator: 'anyof',
	    	    values: [contractRecord]
	    	});
	    	
	    	// add the filter to the search using .push() method    
	    	searchFilters.push(newFilter);
	    	
	    	// run the search and process results
	    	deferredRevSearch.run().each(function(result) {
	    		
	    		// get the deferred revenue amount from the search results
	    		deferredRevAmt = result.getValue({
	    			name: 'fxamount',
	    			summary: 'SUM'
	    		});
	    		
	    		// only process the first search result
	    		return false;
	    	});
	    	
	    	// check if the deferredRevAmt variable is empty
	    	if (deferredRevAmt == '')
	    		{
	    			deferredRevAmt = 0;
	    		}
	    	
	    	deferredRevAmt = parseFloat(deferredRevAmt); // use parseFloat to convert to floating point number
	    	
	    	// return deferredRevAmt
	    	return deferredRevAmt;	    	
    	}
    
    // ====================================================================
    // FUNCTION TO RETURN REMAINING MANAGEMENT FEE DEFERRED REVENUE BALANCE
    // ====================================================================
    
    function getRemainingMgmtFeeBalance(contractRecord)
	    {
	    	// create search to find remaining management fee balance
    		var mgmtFeeSearch = search.create({
    			type: search.Type.TRANSACTION,
    			
    			filters: [{
    				name: 'custbody_bbs_contract_record',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'account',
    				operator: 'anyof',
    				values: [deferredIncomeMgmtFee]
    			}],
    			
    			columns: [{
    				name: 'fxamount',
    				summary: 'SUM'
    			}],    			
    			
    		});
    		
    		// run the search and process results
    		mgmtFeeSearch.run().each(function(result) {
	    		
	    		// get the remaining mgmt fee balance from the search results
	    		mgmtFeeBalance = result.getValue({
	    			name: 'fxamount',
	    			summary: 'SUM'
	    		});
	    		
	    		// only process the first search result
	    		return false;
	    	});
    		
    		
    		// check if the mgmtFeeBalance variable is empty
	    	if (mgmtFeeBalance == '')
	    		{
	    			mgmtFeeBalance = 0;
	    		}
	    	
	    	mgmtFeeBalance = parseFloat(mgmtFeeBalance); // use parseFloat to convert to floating point number
	    	
	    	// return deferredRevAmt
	    	return mgmtFeeBalance;

	    }
    
    // ================================================================
    // FUNCTION TO RETURN NUMBER OF RECURRING MONTHLY BILLING PROODUCTS
    // ================================================================
    
    function searchNumberOfRecurringProducts(contractRecord)
    	{
    		// declare and initialize variables
    		var numberOfProducts = 0;
    		
    		// create search to find number of recurring billing products for this contract
    		search.create({
    			type: 'customrecord_bbs_contract_monthly_items',
    			
    			filters: [{
    				name: 'isinactive',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_cont',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_start',
    				operator: 'notafter',
    				values: ['lastmonth']
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_end',
    				operator: 'notbefore',
    				values: ['lastmonth']
    			}],

    			columns: [{
    				name: 'internalid',
    				summary: 'COUNT'
    			}],
    			
    		}).run().each(function(result){
    			
    			numberOfProducts = result.getValue({
    				name: 'internalid',
    				summary: 'COUNT'
    			});
    			
    		});
    		
    		return numberOfProducts;
    		
    	}
    
    // ==========================================================
    // FUNCTION TO SEARCH FOR RECURRING MONTHLY BILLING PROODUCTS
    // ==========================================================
    
    function searchRecurringProducts(contractRecord)
    	{
    		return search.create({
    			type: 'customrecord_bbs_contract_monthly_items',
    			
    			filters: [{
    				name: 'isinactive',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_cont',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_start',
    				operator: 'notafter',
    				values: ['lastmonth']
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_end',
    				operator: 'notbefore',
    				values: ['lastmonth']
    			}],

    			columns: [{
    				name: 'custrecord_bbs_contract_mnth_items_item'
    			},
    					{
    				name: 'formulacurrency',
    				formula: "ROUND(CASE WHEN TO_CHAR({custrecord_bbs_contract_mnth_items_start},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_contract_mnth_items_end},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_contract_mnth_items_start},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_contract_mnth_items_end},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_contract_mnth_items_amt} / TO_CHAR(LAST_DAY({custrecord_bbs_contract_mnth_items_start}),'DD')) * (TO_CHAR({custrecord_bbs_contract_mnth_items_end},'DD') - TO_CHAR({custrecord_bbs_contract_mnth_items_start},'DD') +1) ELSE CASE WHEN TO_CHAR({custrecord_bbs_contract_mnth_items_start},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_contract_mnth_items_start},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_contract_mnth_items_amt} / TO_CHAR(LAST_DAY({custrecord_bbs_contract_mnth_items_start}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_contract_mnth_items_start}),'DD') - TO_CHAR({custrecord_bbs_contract_mnth_items_start},'DD') +1) ELSE CASE WHEN TO_CHAR({custrecord_bbs_contract_mnth_items_end},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_contract_mnth_items_end},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_contract_mnth_items_amt} / TO_CHAR(LAST_DAY({custrecord_bbs_contract_mnth_items_end}),'DD')) * TO_CHAR({custrecord_bbs_contract_mnth_items_end},'DD') ELSE {custrecord_bbs_contract_mnth_items_amt} END END END,2)"
    			}],
    			
    		});
    	}

    //================================================
	// FUNCTION TO GET THE NUMBER OF DAYS IN THE MONTH
	//================================================   
    
    function getDaysInMonth(month, year)
	    {
    		// day 0 is the last day in the current month
    	 	return new Date(year, month+1, 0).getDate(); // return the last day of the month
	    }
    
    // =======================================
    // FUNCTION TO CALCULATE ACCOUNTING PERIOD
    // =======================================
    
    function calculateAccountingPeriod(date)
    	{
    		// create array of months
    		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    		
    		// calculate the posting period
    		var postingPeriod = months[date.getMonth()] + ' ' + date.getFullYear();
    		
    		// return the posting period
    		return postingPeriod;
    	}
    
    function summarize(summary)
	    {
	    	log.audit({
	    		title: '*** END OF SCRIPT ***',
	    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
	    	});
	    	
	    	// =================================================================================================
	    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO END CONTRACTS WHERE THE CONTRACT END DATE HAS PASSED
	    	// =================================================================================================
	    	
	    	// create a map/reduce task
	    	var mapReduceTask = task.create({
	    	    taskType: task.TaskType.MAP_REDUCE,
	    	    scriptId: 'customscript_bbs_end_contracts_mr',
	    	    deploymentId: 'customdeploy_bbs_end_contracts_mr',
	    	    params: {
	    	    	custscript_bbs_billing_type_select: billingType,
	    	    	custscript_bbs_billing_type_select_text: billingTypeText,
	    	    	custscript_bbs_subsidiary_select: subsidiary,
	    	    	custscript_bbs_subsidiary_select_text: subsidiaryText,
	    	    	custscript_bbs_billing_email_emp_alert: initiatingUser
	    	    }
	    	});
	    	
	    	// submit the map/reduce task
	    	var mapReduceTaskID = mapReduceTask.submit();
	    	
	    	log.audit({
	    		title: 'Script Scheduled',
	    		details: 'BBS End Contracts Map/Reduce script has been Scheduled. Job ID ' + mapReduceTaskID
	    	});	    	
	    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    }
    
});
