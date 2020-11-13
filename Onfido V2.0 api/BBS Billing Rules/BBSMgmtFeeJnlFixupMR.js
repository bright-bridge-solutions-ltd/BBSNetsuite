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
	deferredIncomeMgmtFee = currentScript.getParameter({
		name: 'custscript_bbs_def_inc_mgmt_fee'
	});
	
	mgmtFeeAccount = currentScript.getParameter({
		name: 'custscript_bbs_account_management_acc'
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
    	
    	// create search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_contract',
			
			filters: [{
				name: 'custrecord_bbs_contract_status',
				operator: search.Operator.ANYOF,
				values: [1] // 1 = Approved
			},
					{
    			name: 'custrecord_bbs_contract_exc_auto_bill',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
					{
				name: 'custrecord_bbs_contract_mgmt_fee_type',
				operator: search.Operator.ANYOF,
				values: [2] // 2 = Upfront
			},
					{
				name: 'custrecord_bbs_contract_mgmt_fee_amt',
				operator: search.Operator.GREATERTHAN,
				values: [0]
			},
					{
				name: 'custrecord_bbs_contract_start_date',
				operator: search.Operator.NOTAFTER,
				values: ['lastmonth'] // End of last month
			},
					{
				name: 'custrecord_bbs_contract_end_date',
				operator: search.Operator.NOTBEFORE,
				values: ['startoflastmonth']
			},
					{
				name: 'custrecord_bbs_contract_early_end_date',
				operator: search.Operator.NOTBEFORE,
				values: ['startoflastmonth']
			},
					{
				name: 'internalid',
				operator: search.Operator.NONEOF,
				values: [1266]
			}],
			
			columns: [{
				name: 'custrecord_bbs_contract_mgmt_fee_amt'
			},
					{
				name: 'custrecord_bbs_contract_customer'
			},
					{
				name: 'custrecord_bbs_contract_currency'
			},
					{
				name: 'custrecord_bbs_contract_subsidiary'
			},
					{
				name: 'custrecord_bbs_contract_location'
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
    	
    	// retrieve search results
    	var searchResult 		= JSON.parse(context.value);
    	var contractRecordID	= searchResult.id;
    	var mgmtFeeAmt			= parseFloat(searchResult.values['custrecord_bbs_contract_mgmt_fee_amt']);
    	var customerID			= searchResult.values['custrecord_bbs_contract_customer'].value;
    	var currencyID			= searchResult.values['custrecord_bbs_contract_currency'].value;
    	var subsidiaryID		= searchResult.values['custrecord_bbs_contract_subsidiary'].value;
    	var locationID			= searchResult.values['custrecord_bbs_contract_location'].value;
    	
    	log.audit({
    		title: 'Processing Contract Record',
    		details: contractRecordID
    	});
    	
    	// call function to create a mgmt fee journal
    	createMgmtFeeJournal(contractRecordID, customerID, mgmtFeeAmt, currencyID, subsidiaryID, locationID, false);
    	
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(context) {
    	
    	log.audit({
    		title: 'Units Used',
    		details: context.usage
    	});
    	
    	log.audit({
    		title: 'Number of Yields',
    		details: context.yields
    	});

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
					
					// call function to calculate the accounting period. Pass invoiceDate
					var accountingPeriod = calculateAccountingPeriod(invoiceDate);
				    	
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
				    		
				    		journalRecord.setText({
			    				fieldId: 'postingperiod',
			    				value: accountingPeriod
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
    
    // ====================================================================
    // FUNCTION TO RETURN REMAINING MANAGEMENT FEE DEFERRED REVENUE BALANCE
    // ====================================================================
    
    function getRemainingMgmtFeeBalance(contractRecordID)
	    {
	    	// create search to find remaining management fee balance
    		var mgmtFeeSearch = search.create({
    			type: search.Type.TRANSACTION,
    			
    			filters: [{
    				name: 'custbody_bbs_contract_record',
    				operator: search.Operator.ANYOF,
    				values: [contractRecordID]
    			},
    					{
    				name: 'account',
    				operator: search.Operator.ANYOF,
    				values: [deferredIncomeMgmtFee]
    			}],
    			
    			columns: [{
    				name: 'fxamount',
    				summary: search.Summary.SUM
    			}],    			
    			
    		});
    		
    		// run the search and process results
    		mgmtFeeSearch.run().each(function(result) {
	    		
	    		// get the remaining mgmt fee balance from the search results
	    		mgmtFeeBalance = result.getValue({
	    			name: 'fxamount',
	    			summary: search.Summary.SUM
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

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
