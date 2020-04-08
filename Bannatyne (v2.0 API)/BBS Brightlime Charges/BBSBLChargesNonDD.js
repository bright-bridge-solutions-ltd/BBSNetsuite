/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/task'],
function(runtime, search, record, task) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	customForm = currentScript.getParameter({
		name: 'custscript_bl_charge_journal_form'
	});
	
	defaultCreditGLAccount = currentScript.getParameter({
		name: 'custscript_bl_charge_jnl_non_dd_cred_gl'
	});
	
	defaultDebitGLAccount = currentScript.getParameter({
		name: 'custscript_bl_charge_jnl_non_dd_debit_gl'
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
    		type: 'customrecord_bbs_brightlime_charges',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_bl_dd_nondd',
    			operator: 'is',
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_brightlime_club_id',
    			summary: 'GROUP',
    			sort: search.Sort.ASC
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_bl_subsidiary1',
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
    	var searchResult = JSON.parse(context.value);
    	
    	log.debug({
    		title: 'Search Result',
    		details: searchResult
    	});
    	
    	
    	var clubID = searchResult.values['GROUP(custrecord_bbs_brightlime_club_id)'].value;
    	var clubName = searchResult.values['GROUP(custrecord_bbs_brightlime_club_id)'].text;
    	var subsidiary = searchResult.values['MAX(internalid.custrecord_bbs_bl_subsidiary1)'];
    	
    	log.audit({
    		title: 'Processing Club',
    		details: 'Club ID: ' + clubID + '<br>Club Name: ' + clubName + '<br>Subsidiary: ' + subsidiary
    	});
    	
    	// call function to create search to find BrightLime Charge lines for this club
    	var brightlimeChargeLines = searchBLChargeLines(clubID);
    	
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
    				fieldId: 'subsidiary',
    				value: subsidiary
    			});
    			
    			journalRec.setValue({
    				fieldId: 'memo',
    				value: 'BL Charge Journal (Non DD)'
    			});
    			
    			journalRec.setValue({
    				fieldId: 'approvalstatus',
    				value: 2 // Approved
    			});
    			
    			// call function to create search to find BrightLime Charge lines for this club
    	    	var brightlimeChargeLines = searchBLChargeLines(clubID);
    	    	
    	    	// run search and process results
    	    	brightlimeChargeLines.run().each(function(result){
    	    		
    	    		// retrieve search results
    	    		var glAccountID = result.getValue({
    	    			name: 'custrecord_bbs_bl_gl_account_id'
    	    		});
    	    		
    	    		var amount = result.getValue({
    	    			name: 'formulacurrency'
    	    		});
    	    		
    	    		var blTranID = result.getValue({
    	    			name: 'custrecord_bbs_bl_bantrans_serial'
    	    		});
    	    		
    	    		var memo = result.getValue({
    	    			name: 'formulatext'
    	    		});
    	    		
    	    		var location = result.getValue({
    	    			name: 'custrecord_bbs_bl_location1'
    	    		});
    	    		
    	    		var blMemberID = result.getValue({
    	    			name: 'custrecord_bbs_bl_member_id'
    	    		});
    	    		
    	    		var blMemberCode = result.getValue({
    	    			name: 'custrecord_bbs_bl_charge_member_code'
    	    		})
    	    		
    	    		var blChargeCodeDesc = result.getValue({
    	    			name: 'custrecord_bbs_description2',
    	    			join: 'custrecord_bbs_brightlime_charge_code'
    	    		});
    	    		
    	    		// create a new debit line on the journal record
    	    		journalRec.selectNewLine({
    	    			sublistId: 'line'
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    					fieldId: 'account',
    					value: defaultDebitGLAccount
    				});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'debit',
    					value: amount
    				});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_trans_id',
    	    			value: blTranID
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'memo',
    	    			value: memo
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_trans_id',
    	    			value: blTranID
    	    		});
    	    		
    	    		// check if blChargeCodeDesc is 'Wellness'
    	    		if (blChargeCodeDesc == 'Wellness')
    	    			{
    	    				journalRec.setCurrentSublistValue({
    	    					sublistId: 'line',
    	    					fieldId: 'class',
    	    					value: 3 // 3 = Spa
    	    				});
    	    			}
    	    		else
    	    			{
	    	    			journalRec.setCurrentSublistValue({
		    					sublistId: 'line',
		    					fieldId: 'class',
		    					value: 1 // 1 = Gym
		    				});
    	    			}
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'location',
    	    			value: location
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_member_id',
    	    			value: blMemberID
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_charge_code',
    	    			value: blChargeCodeDesc
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_member_code',
    	    			value: blMemberCode
    	    		});
    	    		
    	    		journalRec.commitLine({
    	    			sublistId: 'line'
    	    		});
    	    		
    	    		// create a new credit line on the journal record
    	    		journalRec.selectNewLine({
    	    			sublistId: 'line'
    	    		});
    	    		
    	    		// check if we have a glAccountID
    	    		if (glAccountID)
    	    			{
    	    				// set account on the new journal line using the glAccountID
    	    				journalRec.setCurrentSublistValue({
    	    					sublistId: 'line',
    	    					fieldId: 'account',
    	    					value: glAccountID
    	    				});
    	    			}
    	    		else
    	    			{
    	    				// set the account on the new journal line using the default
	    	    			journalRec.setCurrentSublistValue({
	    	    				sublistId: 'line',
	    	    				fieldId: 'account',
		    					value: defaultCreditGLAccount
		    				});
    	    			}
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'credit',
    					value: amount
    				});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_trans_id',
    	    			value: blTranID
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'memo',
    	    			value: memo
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_trans_id',
    	    			value: blTranID
    	    		});
    	    		
    	    		// check if blChargeCodeDesc is 'Wellness'
    	    		if (blChargeCodeDesc == 'Wellness')
    	    			{
    	    				journalRec.setCurrentSublistValue({
    	    					sublistId: 'line',
    	    					fieldId: 'class',
    	    					value: 3 // 3 = Spa
    	    				});
    	    			}
    	    		else
    	    			{
	    	    			journalRec.setCurrentSublistValue({
		    					sublistId: 'line',
		    					fieldId: 'class',
		    					value: 1 // 1 = Gym
		    				});
    	    			}
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'location',
    	    			value: location
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_member_id',
    	    			value: blMemberID
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_charge_code',
    	    			value: blChargeCodeDesc
    	    		});
    	    		
    	    		journalRec.setCurrentSublistValue({
    	    			sublistId: 'line',
    	    			fieldId: 'custcol_bbs_brightlime_member_code',
    	    			value: blMemberCode
    	    		});
    	    		
    	    		journalRec.commitLine({
    	    			sublistId: 'line'
    	    		});
    	    		
    	    		// continue processing search results
    	    		return true;
    	    		
    	    	});
    	    	
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
    	
    	/*// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_bl_charges_dd',
    	    deploymentId: 'customdeploy_bbs_bl_charges_dd'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS BL Charges DD script has been scheduled. Job ID ' + mapReduceTaskID
    	});*/

    }
    
    // ==============================================
    // FUNCTION TO SEARCH FOR BRIGHTLIME CHARGE LINES
    // ==============================================
    
    function searchBLChargeLines(clubID)
    	{
    		return search.create({
    			type: 'customrecord_bbs_brightlime_charges',
    			
    			filters: [{
        			name: 'isinactive',
        			operator: 'is',
        			values: ['F']
        		},
        				{
        			name: 'custrecord_bbs_bl_dd_nondd',
        			operator: 'is',
        			values: ['F']
        		},
        				{
        			name: 'custrecord_bbs_brightlime_club_id',
        			operator: 'anyof',
        			values: [clubID]
        		}],
        		
        		columns: [{
        			name: 'custrecord_bbs_bl_gl_account_id'
        		},
        				{
        			name: 'formulacurrency',
        			formula: "{custrecord_bbs_bl_amount} - {custrecord_bbs_bl_vat_amount}"
        		},
        				{
        			name: 'custrecord_bbs_bl_bantrans_serial'
        		},
        				{
        			name: 'formulatext',
        			formula: "CONCAT({custrecord_bbs_bl_bantrans_serial},CONCAT(',',CONCAT({custrecord_bbs_bl_charge_code},CONCAT(',',CONCAT({custrecord_bbs_bl_membership_type},CONCAT(',',{custrecord_bbs_bl_member_id}))))))"
        		},
        				{
        			name: 'custrecord_bbs_bl_location1'
        		},
        				{
        			name: 'custrecord_bbs_bl_member_id',
        		},
        				{
        			name: 'custrecord_bbs_bl_charge_member_code'
        		},
        				{
        			name: 'custrecord_bbs_description2',
	    			join: 'custrecord_bbs_brightlime_charge_code'
        		}],
    			
    		});
    	}

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
