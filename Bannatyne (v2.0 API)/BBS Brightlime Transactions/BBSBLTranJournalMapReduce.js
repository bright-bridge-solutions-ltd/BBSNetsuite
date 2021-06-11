/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/task', 'N/format'],
function(runtime, search, record, task, format) {
   
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	customForm = currentScript.getParameter({
		name: 'custscript_bl_charge_journal_form'
	});
	
	defaultGLAccount = currentScript.getParameter({
		name: 'custscript_bl_tran_jnl_default_gl'
	});
	
	defaultTaxCode = currentScript.getParameter({
		name: 'custscript_bl_tran_jnl_default_tax_code'
	});
	
	defaultDebitTaxAccount = currentScript.getParameter({
		name: 'custscript_bl_tran_jnl_def_debit_tax_acc'
	});
	
	defaultCreditTaxAccount = currentScript.getParameter({
		name: 'custscript_bl_tran_jnl_def_cred_tax_acc'
	});
	
	// set the date of the journal
	journalDate = new Date();
	journalDate = new Date(journalDate.getFullYear(), journalDate.getMonth(), journalDate.getDate() - 1); // Yesterday
	
	// format journalDate as a date
	formattedDate = format.format({
		type: format.Type.DATE,
		value: journalDate
	});
	
	memo = 'Brightlime Transaction Summary for ' + formattedDate;
	
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
    		title: '*** BEGINNING OF SCRIPT ***'
    	});
    	
    	// create search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_brightlime_transactions',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_brightlime_tran_date',
    			operator: 'on',
    			values: ['yesterday']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_brightlime_tran_location',
    			summary: 'GROUP',
    			sort: search.Sort.ASC
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_brightlime_tran_sub_id',
    			summary: 'MAX'
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
    	var searchResult 	= JSON.parse(context.value);
    	var locationID 		= searchResult.values['GROUP(custrecord_bbs_brightlime_tran_location)'].value;
    	var locationName	= searchResult.values['GROUP(custrecord_bbs_brightlime_tran_location)'].text;
    	var subsidiaryID 	= searchResult.values['MAX(internalid.custrecord_bbs_brightlime_tran_sub_id)'];
    	
    	// lookup fields on the subsidiary record
    	var subsidiaryLookup = search.lookupFields({
    		type: search.Type.SUBSIDIARY,
    		id: subsidiaryID,
    		columns: ['custrecord_bbs_bank_gl_account']
    	});
    	
    	// retrieve values from the subsidiaryLookup object
    	var bankGLAccountName 	= subsidiaryLookup.custrecord_bbs_bank_gl_account[0].text;
    	var bankGLAccountID		= subsidiaryLookup.custrecord_bbs_bank_gl_account[0].value;
    	
    	log.audit({
    		title: 'Processing Club',
    		details: 'Location ID: ' + locationID + '<br>Location Name: ' + locationName + '<br>Subsidiary ID: ' + subsidiaryID + '<br>Bank GL Name: ' + bankGLAccountName + '<br>Bank GL ID: ' + bankGLAccountID
    	});
    	
    	// call function to create a new journal record. Pass context, subsidiaryID, locationID and bankGLAccountID
    	createJournal(context, subsidiaryID, locationID, bankGLAccountID);

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
    function summarize(summary) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});
    	
    	// ==============================================================================
    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO CREATE BRIGHTLIME CHARGE JOURNALS
    	// ==============================================================================
    	
    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_bl_charges_journal_mr',
    	    deploymentId: 'customdeploy_bbs_bl_charges_journal_mr'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script Scheduled',
    		details: 'BBS BL Charge Journal Map/Reduce script has been Scheduled.<br>Job ID: ' + mapReduceTaskID
    	});

    }
    
    // ===================================
    // FUNCTION TO CREATE A JOURNAL RECORD
    // ===================================
    
    function createJournal(context, subsidiaryID, locationID, bankGLAccountID) {
    	
    	// declare new array to hold IDs of processed BL Charge records
    	var processedRecords 		= new Array();
    	var totalDebitNetAmount 	= 0;
    	var totalDebitGrossAmount	= 0;
    	var totalCreditNetAmount	= 0;
    	var totalCreditGrossAmount	= 0;
    	var directDebitTotal		= 0;
    	
    	try
    		{
	    		// create a new journal record
				var journalRec = record.create({
					type: record.Type.JOURNAL_ENTRY,
					isDynamic: true,
					defaultValues: {
						customform: customForm
					}
				});
				
				// set header fields on the new journal record
				journalRec.setValue({
					fieldId: 'trandate',
					value: journalDate
				});
				
				journalRec.setValue({
					fieldId: 'subsidiary',
					value: subsidiaryID
				});
				
				journalRec.setValue({
					fieldId: 'memo',
					value: 'Brightlime Transaction Journal'
				});
				
				journalRec.setValue({
					fieldId: 'approvalstatus',
					value: 2 // Approved
				});
				
				// call function to create/run search to find BrightLime Transaction lines for this club
    	    	searchBLTransactionLines(locationID).each(function(result) {
    	    		
    	    		// retrieve search results
    	    		var glAccountID = result.getValue({
    	    			name: 'custrecord_bbs_brightlime_tran_gl_code',
    	    			summary: 'GROUP'
    	    		});
    	    		
    	    		var lineOfBusiness = result.getValue({
    	    			name: 'custrecord_bl_trans_line_of_business',
    	    			summary: 'GROUP'
    	    		});
    	    		
    	    		var directDebit = result.getValue({
    	    			name: 'custrecord_bbs_bl_trans_dd',
    	    			summary: 'GROUP'
    	    		});
    	    		
    	    		var creditOrDebit = result.getValue({
    	    			name: 'custrecord_bbs_brightlime_trans_d_or_c',
    	    			summary: 'GROUP'
    	    		});
    	    		
    	    		var debit = parseFloat(result.getValue({
    	    			name: 'custrecord_bbs_brightlime_tran_debit',
    	    			summary: 'SUM'
    	    		}));
    	    		
    	    		var credit = parseFloat(result.getValue({
    	    			name: 'custrecord_bbs_brightlime_tran_credit',
    	    			summary: 'SUM'
    	    		}));
    	    		
    	    		var grossAmt = parseFloat(result.getValue({
    	    			name: 'custrecord_bbs_brightlime_tran_gross_amt',
    	    			summary: 'SUM'
    	    		}));
    	    		
    	    		var taxCode = result.getValue({
    	    			name: 'internalid',
    	    			join: 'custrecord_bbs_brightlime_tran_tax_code',
    	    			summary: 'MAX'
    	    		});
    	    		
    	    		var taxAccount = result.getValue({
    	    			name: 'internalid',
    	    			join: 'custrecord_bbs_brightlime_tran_tax_acc',
    	    			summary: 'MAX'
    	    		});
    	    		
    	    		try
    	    			{
		    	    		// check if this line is a direct debit line
    	    				if (directDebit == true)
    	    					{
    	    						// ===========
    	    						// CREDIT LINE
    	    						// ===========
    	    					
	    	    					journalRec.selectNewLine({
		    	    					sublistId: 'line'
		    	    				});
		    	    				
		    	    				journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'account',
		    							value: glAccountID
		    						});
		    						
		    						journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'credit',
		    							value: credit
		    						});
		    						
		    						// check if we have a tax code
		    						if (taxCode)
		    							{
		    								journalRec.setCurrentSublistValue({
		    									sublistId: 'line',
		    									fieldId: 'taxcode',
		    									value: taxCode
		    								});
		    								
		    								journalRec.setCurrentSublistValue({
		    									sublistId: 'line',
		    									fieldId: 'grossamt',
		    									value: grossAmt
		    								});
		    								
		    								journalRec.setCurrentSublistValue({
		    									sublistId: 'line',
		    									fieldId: 'tax1acct',
		    									value: taxAccount
		    								});
		    							}
		    						
		    						journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'location',
		    							value: locationID
		    						});
		    						
		    						journalRec.setCurrentSublistValue({
				    	    			sublistId: 'line',
				    	    			fieldId: 'class',
				    	    			value: lineOfBusiness
				    	    		});
		    						
		    						journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'memo',
		    							value: memo
		    						});
		    						
		    						journalRec.commitLine({
		    							sublistId: 'line'
		    						});
		    						
		    						// add the gross amount to the directDebitTotal
		    						directDebitTotal += grossAmt;
    	    					}
    	    				// check if we have got a debit line
    	    				else if (creditOrDebit == 'D')
		    	    			{
		    	    				// ===========
		    	    				// CREDIT LINE
		    	    				// ===========
		    	    			
		    	    				journalRec.selectNewLine({
		    	    					sublistId: 'line'
		    	    				});
		    	    				
		    	    				journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'account',
		    							value: glAccountID
		    						});
		    						
		    						journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'credit',
		    							value: grossAmt
		    						});
		    						
		    						journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'location',
		    							value: locationID
		    						});
		    						
		    						journalRec.setCurrentSublistValue({
				    	    			sublistId: 'line',
				    	    			fieldId: 'class',
				    	    			value: lineOfBusiness
				    	    		});
		    						
		    						journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'memo',
		    							value: memo
		    						});
		    						
		    						journalRec.commitLine({
		    							sublistId: 'line'
		    						});
		    						
		    						// add the net/gross amount to the total variables
		    						totalDebitNetAmount			+= debit;
		    						totalDebitGrossAmount 		+= grossAmt;
		    	    			}
		    	    		else if (creditOrDebit == 'C') // if we have got a credit line
		    	    			{
			    	    			// ==========
				    				// DEBIT LINE
				    				// ==========
				    			
				    				journalRec.selectNewLine({
				    					sublistId: 'line'
				    				});
				    				
				    				journalRec.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'account',
										value: glAccountID
									});
									
									journalRec.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'debit',
										value: grossAmt
									});
									
									journalRec.setCurrentSublistValue({
										sublistId: 'line',
										fieldId: 'location',
										value: locationID
									});
									
									journalRec.setCurrentSublistValue({
				    	    			sublistId: 'line',
				    	    			fieldId: 'class',
				    	    			value: lineOfBusiness
				    	    		});
									
									journalRec.setCurrentSublistValue({
		    							sublistId: 'line',
		    							fieldId: 'memo',
		    							value: memo
		    						});
									
									journalRec.commitLine({
										sublistId: 'line'
									});
									
									// add the net/gross amount to the total variables
									totalCreditNetAmount		+= credit;
		    						totalCreditGrossAmount 		+= grossAmt;
		    	    			}
    	    			}
    	    		catch(e)
    	    			{
	    	    			log.error({
	    	    				title: 'Error Adding Credit or Debit Line',
	    	    				details: e
	    	    			});
    	    			}
    	    		
    	    		// continue processing search results
    	    		return true;
    	    	});
    	    	
    	    	// =================
    	    	// TOTAL CREDIT LINE
    	    	// =================
    	    	
    	    	if (totalCreditNetAmount > 0)
    	    		{
		    	    	journalRec.selectNewLine({
							sublistId: 'line'
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: defaultGLAccount
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'credit',
							value: totalCreditNetAmount.toFixed(2)
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'taxcode',
							value: defaultTaxCode
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'grossamt',
							value: totalCreditGrossAmount.toFixed(2)
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'tax1acct',
							value: defaultCreditTaxAccount
						});
		    	    		
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'location',
							value: locationID
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'memo',
							value: memo
						});
						
						journalRec.commitLine({
							sublistId: 'line'
						});
    	    		}
				
				// ================
    	    	// TOTAL DEBIT LINE
    	    	// ================
    	    	
    	    	if (totalDebitNetAmount > 0)
    	    		{ 	    	
		    	    	journalRec.selectNewLine({
							sublistId: 'line'
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: defaultGLAccount
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'debit',
							value: totalDebitNetAmount.toFixed(2)
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'taxcode',
							value: defaultTaxCode
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'grossamt',
							value: totalDebitGrossAmount.toFixed(2)
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'tax1acct',
							value: defaultDebitTaxAccount
						});
		    	    		
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'location',
							value: locationID
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'memo',
							value: memo
						});
						
						journalRec.commitLine({
							sublistId: 'line'
						});
    	    		}
    	    	
    	    	if (directDebitTotal > 0)
    	    		{
	    	    		journalRec.selectNewLine({
							sublistId: 'line'
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'account',
							value: bankGLAccountID
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'debit',
							value: directDebitTotal.toFixed(2)
						});
		    	    		
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'location',
							value: locationID
						});
						
						journalRec.setCurrentSublistValue({
							sublistId: 'line',
							fieldId: 'memo',
							value: memo
						});
						
						journalRec.commitLine({
							sublistId: 'line'
						});
    	    		}
				
				// save the journal record
				var journalID = journalRec.save();
				
				log.audit({
					title: 'Journal Created',
					details: journalID
				});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Journal',
    				details: e
    			});
    		}
    }
    
    // ===================================================
    // FUNCTION TO SEARCH FOR BRIGHTLIME TRANSACTION LINES
    // ===================================================
    
    function searchBLTransactionLines(locationID) {
    	
    	return search.create({
			type: 'customrecord_bbs_brightlime_transactions',
			
			filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_brightlime_tran_date',
    			operator: 'on',
    			values: ['yesterday']
    		},
    				{
    			name: 'custrecord_bbs_brightlime_tran_location',
    			operator: 'anyof',
    			values: [locationID]
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_brightlime_tran_gl_code',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bl_trans_line_of_business',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_bl_trans_dd',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_brightlime_trans_d_or_c',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_brightlime_tran_debit',
    			summary: 'SUM'
    		},
    				{
    			name: 'custrecord_bbs_brightlime_tran_credit',
    			summary: 'SUM'
    		},
    				{
    			name: 'custrecord_bbs_brightlime_tran_gross_amt',
    			summary: 'SUM'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_brightlime_tran_tax_code',
    			summary: 'MAX'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_brightlime_tran_tax_acc',
    			summary: 'MAX'
    		}],
			
		}).run();
    	
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
