/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/task'],
function(runtime, search, record, task) {
   
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
    	
    	// run search to find journals to be processed
    	return search.create({
    		type: search.Type.JOURNAL_ENTRY,
    		
    		filters: [
	          			["custcol_bbs_site", search.Operator.ANYOF, "@NONE@"],
	          				"AND",
	          			["custcol_bbs_unable_to_add_site", search.Operator.IS, "F"],
	          				"AND",
	          			[["memo", search.Operator.IS, "Rev Rec Source"],
	          				"OR",
	          			["memo", search.Operator.IS, "Rev Rec Destination"]]
	          		],
    		
    		columns: [{
    			name: 'tranid',
    			summary: search.Summary.GROUP
    		},
    				{
    			name: 'internalid',
    			summary: search.Summary.MAX
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
    	
    	// declare and initialize variables
    	var sourceRecognitionPlans = {};
    	
    	// retrieve search results
    	var searchResult	= JSON.parse(context.value);
    	var jnlTranID		= searchResult.values['GROUP(tranid)'];
    	var jnlIntID		= searchResult.values['MAX(internalid)'];
    	
    	log.audit({
    		title: 'Processing Journal',
    		details: 'Tran ID: ' + jnlTranID + '<br>Internal ID: ' + jnlIntID
    	});
    	
    	try
    		{
    			// load the journal record
    			var journalRecord = record.load({
    				type: record.Type.JOURNAL_ENTRY,
    				id: jnlIntID,
    				isDynamic: true
    			});
    			
    			// get count of lines
    			var lineCount = journalRecord.getLineCount({
    				sublistId: 'line'
    			});
    			
    			// loop through lines
    			for (var i = 0; i < lineCount; i++)
    				{
	    				// get the site from the line
						var site = journalRecord.getSublistValue({
							sublistId: 'line',
							fieldId: 'custcol_bbs_site',
							line: i
						});
						
						// if this line does not already have a site
						if (site == '' || site == null)
							{
		    					// get values from the line
			        			var sourceRecognitionPlan = journalRecord.getSublistValue({
			        				sublistId: 'line',
			        				fieldId: 'sourcerevenueplan',
			        				line: i
			        			});
			        			
			        			var unableToUpdate = journalRecord.getSublistValue({
			        				sublistId: 'line',
			        				fieldId: 'custcol_bbs_unable_to_add_site',
			        				line: i
			        			});
			        			
			        			// if this line has a source recognition plan and has not been flagged as unable to update
			        			if (sourceRecognitionPlan != '' && sourceRecognitionPlan != null && unableToUpdate == false)
			        				{
				    					// if the source recognition plan doesn't already exist in the sourceRecognitionPlans object
										if (!sourceRecognitionPlans[sourceRecognitionPlan])
									        {
												// have we got sufficient units remaining?
												if (runtime.getCurrentScript().getRemainingUsage() > 30)
													{
														// call function to retrieve details for the source recognition plan
										    			var site = getSourceRecognitionPlanInfo(sourceRecognitionPlan);
										    			
										    			// does the line have a site?
										    			if (site)
										    				{
											    				// add a new entry to the sourceRecognitionPlans object
												    			sourceRecognitionPlans[sourceRecognitionPlan] = new sourceRecognitionPlanObj(site);
										    				}
										    			else
										    				{
										    					// mark the line so it won't be picked up by the script again
																journalRecord.selectLine({
																	sublistId: 'line',
																	line: i
																});
															
																journalRecord.setCurrentSublistValue({
																	sublistId: 'line',
																	fieldId: 'custcol_bbs_unable_to_add_site',
																	value: true
																});
																
																journalRecord.commitLine({
																	sublistId: 'line'
																});
										    				}
													}
												else
													{
														// insufficient units remaining so break the loop
														break;
													}
											}
			        				}
			        			else
			        				{
				        				// mark the line so it won't be picked up by the script again
										journalRecord.selectLine({
											sublistId: 'line',
											line: i
										});
									
										journalRecord.setCurrentSublistValue({
											sublistId: 'line',
											fieldId: 'custcol_bbs_unable_to_add_site',
											value: true
										});
										
										journalRecord.commitLine({
											sublistId: 'line'
										});
			        				}
							}
    				}
    			
    			// loop through lines
    			for (var x = 0; x < lineCount; x++)
    				{
	    				// get the site from the line
						var site = journalRecord.getSublistValue({
							sublistId: 'line',
							fieldId: 'custcol_bbs_site',
							line: x
						});
						
						// get the source recognition plan
						var sourceRecognitionPlan = journalRecord.getSublistValue({
							sublistId: 'line',
							fieldId: 'sourcerevenueplan',
							line: x
						});
						
						// if this line does not already have a site and does have a source recognition plan
						if ((site == '' || site == null) && (sourceRecognitionPlan != '' || sourceRecognitionPlan != null))
							{
								// does the source recognition plan exist in the sourceRecognitionPlans object
								if (sourceRecognitionPlans.hasOwnProperty(sourceRecognitionPlan) == true)
									{
										try
											{
												// set the site field on the journal line
												journalRecord.selectLine({
													sublistId: 'line',
													line: x
												});
											
												journalRecord.setCurrentSublistValue({
													sublistId: 'line',
													fieldId: 'custcol_bbs_site',
													value: sourceRecognitionPlans[sourceRecognitionPlan].site
												});
												
												journalRecord.commitLine({
													sublistId: 'line'
												});
											}
										catch(e)
											{
												log.error({
													title: 'Error Adding Site to Journal',
													details: 'Tran ID: ' + jnlTranID + '<br>Internal ID: ' + jnlIntID + '<br>Site ID: ' + sourceRecognitionPlans[sourceRecognitionPlan].site + '<br>Line: ' + x + '<br>Error: ' + e.message 
												});
												
												// mark the line so it won't be picked up by the script again
												journalRecord.selectLine({
													sublistId: 'line',
													line: x
												});
											
												journalRecord.setCurrentSublistValue({
													sublistId: 'line',
													fieldId: 'custcol_bbs_unable_to_add_site',
													value: true
												});
												
												journalRecord.commitLine({
													sublistId: 'line'
												});
											}
									}
							}
    				}
    			
    			// save the changes to the journal record
    			journalRecord.save();
    			
    			log.audit({
    				title: 'Journal Updated',
    				details: 'Tran ID: ' + jnlTranID + '<br>Internal ID: ' + jnlIntID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Journal',
    				details: 'Tran ID: ' + jnlTranID + '<br>Internal ID: ' + jnlIntID + '<br>Error: ' + e.message
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
    	
    	// declare and initialize variables
    	var journalsToBeProcessed = 0;
    	
    	// run search to check if there are still any journals to be processed
    	search.create({
    		type: search.Type.JOURNAL_ENTRY,
    		
    		filters: [
      					["custcol_bbs_site", search.Operator.ANYOF, "@NONE@"],
      						"AND",
      					["custcol_bbs_unable_to_add_site", search.Operator.IS, "F"],
      						"AND",
      					[["memo", search.Operator.IS, "Rev Rec Source"],
      						"OR",
      					["memo", search.Operator.IS, "Rev Rec Destination"]]
      				],
    		
    		columns: [{
    			name: 'tranid',
    			summary: search.Summary.COUNT
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the number of journals still to be processed
    		journalsToBeProcessed = result.getValue({
    			name: 'tranid',
    			summary: search.Summary.COUNT
    		});
    		
    	});
    	
    	// have we still got any journals to be processed
    	if (journalsToBeProcessed > 0)
    		{
    			// reschedule the script
	    		task.create({
	        	    taskType: task.TaskType.MAP_REDUCE,
	        	    scriptId: 'customscript_bbs_update_rev_rec_jnls_mr',
	        	    deploymentId: 'customdeploy_bbs_update_rev_rec_jnls_mr'
	        	}).submit();
        	
	        	log.audit({
	        		title: 'Script Rescheduled',
	        		details: ''
	        	});
    		}

    }
    
    // =======
    // OBJECTS
    // =======
    
    function sourceRecognitionPlanObj(site) {
    	
    	this.site		= site;
    	
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getSourceRecognitionPlanInfo(sourceRecognitionPlan){
    	
    	// declare and initialize variables
    	var site = null;
    	
    	// run search to retrieve details from the source recognition plan record
    	search.create({
    		type: search.Type.REVENUE_PLAN,
    		
    		filters: [{
    			name: 'recordnumber',
    			operator: search.Operator.IS,
    			values: [sourceRecognitionPlan]
    		}],
    		
    		columns: [{
    			name: 'creationtriggeredby'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the type and ID of the record that triggered the creation of the recognition plan record
    		var triggeredByType = result.getValue({
    			name: 'creationtriggeredby'
    		}).split(' #').shift();
    			
    		var triggeredByID = result.getValue({
    			name: 'creationtriggeredby'
    		}).split(' #').pop();
    		
    		// if this was triggered by a revenue element
    		if (triggeredByType == 'Revenue Element')
    			{
    				// call function to get the ID of the transaction linked to the revenue element record
    				triggeredByID = getRevenueElementInfo(triggeredByID);
    			}

    		// call function to get the site ID from the related transaction
    		site = getSite(triggeredByID);
    		
    	});
    	
    	// return values to main script function
    	return site;
    	
    }
    
    function getRevenueElementInfo(revElementID){
    	
    	// declare and initialize variables
    	var sourceTransactionID = null;
    	
    	// run search to retrieve details from the revenue element record
    	search.create({
    		type: 'revenueelement', // cannot find correct ENUM value
    		
    		filters: [{
    			name: 'recordnumber',
    			operator: search.Operator.EQUALTO,
    			values: [revElementID]
    		}],
    		
    		columns: [{
    			name: 'tranid',
    			join: 'sourceTransaction'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the source transaction ID
    		sourceTransactionID = result.getValue({
    			name: 'tranid',
    			join: 'sourceTransaction'
    		});
    		
    	});
    	
    	// return values to main script function
    	return sourceTransactionID;
    	
    }
    
    function getSite(tranID) {
    	
    	// declare and initialize variables
    	var site = null;
    	
    	// run search to retrieve details from the transaction record
    	search.create({
    		type: search.Type.TRANSACTION,
    		
    		filters: [{
    			name: 'tranid',
    			operator: search.Operator.IS,
    			values: [tranID]
    		}],
    		
    		columns: [{
    			name: 'formulatext',
    			formula: 'CASE WHEN {custbody_bbs_site_name} IS NOT NULL THEN {custbody_bbs_site_name.internalid} ELSE CASE WHEN {line} = 1 THEN {custcol_bbs_site.internalid} END END',
    			summary: search.Summary.MAX
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the site ID
    		site = result.getValue({
    			name: 'formulatext',
    			summary: search.Summary.MAX
    		});
    		
    	});
    	
    	// return values to main script function
    	return site;
    	
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
