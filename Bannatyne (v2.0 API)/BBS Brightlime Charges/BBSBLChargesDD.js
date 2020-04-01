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
		name: 'custscript_bl_charge_jnl_dd_credit_gl'
	});
	
	defaultDebitGLAccount = currentScript.getParameter({
		name: 'custscript_bl_charge_jnl_dd_debit_gl'
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
				values: ['T']
			}],
			
			columns: [{
				name: 'custrecord_bbs_brightlime_club_id',
				summary: 'GROUP'
			},
					{
				name: 'custrecord_bbs_brightlime_charge_code',
				summary: 'GROUP'
			},
					{
				name: 'custrecord_bbs_bl_membership_type',
				summary: 'GROUP'
			},
					{
				name: 'custrecord_bbs_description2',
    	    	join: 'custrecord_bbs_brightlime_charge_code',
    	    	summary: 'MAX'
			},
					{
				name: 'custrecord_bbs_bl_charge_member_code',
				summary: 'MAX'
			},
					{
    			name: 'internalid',
    			join: 'custrecord_bbs_bl_subsidiary1',
    			summary: 'MAX'
			},
					{
				name: 'internalid',
				join: 'custrecord_bbs_bl_location1',
				summary: 'MAX'
			},
					{
				name: 'formulacurrency',
				formula: "{custrecord_bbs_bl_amount} - {custrecord_bbs_bl_vat_amount}",
				summary: 'SUM'
			},
					{
				name: 'formulatext',
				formula: "CONCAT({custrecord_bbs_brightlime_club_id},CONCAT(',',CONCAT({custrecord_bbs_brightlime_charge_code},CONCAT(',',{custrecord_bbs_bl_membership_type}))))",
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
    	var searchResults = JSON.parse(context.value);
    	var clubID = searchResults.values['GROUP(custrecord_bbs_brightlime_club_id)'].value;
    	var clubName = searchResults.values['GROUP(custrecord_bbs_brightlime_club_id)'].text;
    	var blChargeCodeDesc = searchResults.values['MAX(custrecord_bbs_description2.custrecord_bbs_brightlime_charge_code)'];
    	var blMemberCode = searchResults.values['MAX(custrecord_bbs_bl_charge_member_code)'];
    	var subsidiary = searchResults.values['MAX(internalid.custrecord_bbs_bl_subsidiary1)'];
    	var location = searchResults.values['MAX(internalid.custrecord_bbs_bl_location1)'];
    	var amount = searchResults.values['SUM(formulacurrency)'];
    	var memo = searchResults.values['MAX(formulatext)'];
    	
    	log.audit({
    		title: 'Processing Club',
    		details: 'Club ID: ' + clubID + '<br>Club Name: ' + clubName
    	});
    	
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
    			
    			// set header fields on the journal record
    			journalRec.setValue({
    				fieldId: 'subsidiary',
    				value: subsidiary
    			});
    			
    			journalRec.setValue({
    				fieldId: 'memo',
    				value: 'BL Charge Journal (DD)'
    			});
    			
    			journalRec.setValue({
    				fieldId: 'approvalstatus',
    				value: 2 // Approved
    			});
    			
    			// create a new credit line
    			journalRec.selectNewLine({
    				sublistId: 'line'
    			});
    			
    			journalRec.setCurrentSublistValue({
    				sublistId: 'line',
    				fieldId: 'account',
    				value: defaultCreditGLAccount
    			});
    			
    			journalRec.setCurrentSublistValue({
    				sublistId: 'line',
    				fieldId: 'credit',
    				value: amount
    			});
    			
    			journalRec.setCurrentSublistValue({
    				sublistId: 'line',
    				fieldId: 'memo',
    				value: memo
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
    			
    			// create a new debit line
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
    				fieldId: 'memo',
    				value: memo
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
    	
    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_delete_bl_charges',
    	    deploymentId: 'customdeploy_bbs_delete_bl_charges'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS Delete BL Charges script has been scheduled. Job ID ' + mapReduceTaskID
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
