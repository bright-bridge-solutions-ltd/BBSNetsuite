/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record'],
function(runtime, record) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// call function to return script parameters
				var scriptParameters = getScriptParameters();
			
				// get ID of the expense report
				var recordID = scriptContext.newRecord.id;
				
				try
					{
						// re-load the expense report record
						var expenseReport = record.load({
							type: record.Type.EXPENSE_REPORT,
							id: recordID,
							isDynamic: true
						});
						
						// check if the record is being edited
						if (scriptContext.type == scriptContext.UserEventType.EDIT)
							{
								// clear the tax details subrecord
								var taxLineCount = expenseReport.getLineCount({
									sublistId: 'taxdetails'
								});
								
								// loop through tax lines
								for (var i = taxLineCount; i > 0; i--)
									{
										// select the tax line
										expenseReport.selectLine({
											sublistId: 'taxdetails',
											line: i
										});
										
										// remove the line from the expense report
										expenseReport.removeLine({
											sublistId: 'taxdetails',
											line: i-1,
											ignoreRecalc: true
										});
									}
							}
						
						// set tax details fields
						expenseReport.setValue({
							fieldId: 'nexus',
							value: scriptParameters.taxNexus
						});
						
						expenseReport.setValue({
							fieldId: 'custbody_ste_transaction_type',
							value: scriptParameters.taxTranType
						});
						
						// get count of expense lines
						var lineCount = expenseReport.getLineCount({
							sublistId: 'expense'
						});
						
						// loop through expense lines
		    			for (var i = 0; i < lineCount; i++)
		    				{
		    					// get tax details from the line
		    					var taxDetailsReference = expenseReport.getSublistValue({
		    						sublistId: 'expense',
		    						fieldId: 'taxdetailsreference',
		    						line: i
		    					});
		    					
		    					var taxType = expenseReport.getSublistValue({
		    						sublistId: 'expense',
		    						fieldId: 'custcol_bbs_tax_type',
		    						line: i
		    					});
		    					
		    					var taxCode = expenseReport.getSublistValue({
		    						sublistId: 'expense',
		    						fieldId: 'custcol_bbs_tax_code',
		    						line: i
		    					});
		    					
		    					var taxRate = expenseReport.getSublistValue({
		    						sublistId: 'expense',
		    						fieldId: 'custcol_bbs_tax_rate',
		    						line: i
		    					});
		    					
		    					var amount = parseFloat(
							    							expenseReport.getSublistValue({
							    								sublistId: 'expense',
							    								fieldId: 'amount',
							    								line: i
							    							})
							    						);
		    					
		    					// add a new line to the tax details sublist
		    					expenseReport.selectNewLine({
		    						sublistId: 'taxdetails'
		    					});
		    					
		    					expenseReport.setCurrentSublistValue({
		    						sublistId: 'taxdetails',
		    						fieldId: 'taxdetailsreference',
		    						value: taxDetailsReference
		    					});
		    					
		    					expenseReport.setCurrentSublistValue({
		    						sublistId: 'taxdetails',
		    						fieldId: 'taxtype',
		    						value: taxType
		    					});
		    					
		    					expenseReport.setCurrentSublistValue({
		    						sublistId: 'taxdetails',
		    						fieldId: 'taxcode',
		    						value: taxCode
		    					});
		    					
		    					expenseReport.setCurrentSublistValue({
		    						sublistId: 'taxdetails',
		    						fieldId: 'taxbasis',
		    						value: amount
		    					});
		    					
		    					expenseReport.setCurrentSublistValue({
		    						sublistId: 'taxdetails',
		    						fieldId: 'taxrate',
		    						value: taxRate
		    					});
		    					
		    					expenseReport.setCurrentSublistValue({
		    						sublistId: 'taxdetails',
		    						fieldId: 'taxamount',
		    						value: (amount * taxRate) / 100
		    					});
		    					
		    					expenseReport.commitLine({
		    						sublistId: 'taxdetails'
		    					});
		    				}
		    			
		    			// save the changes to the expense report
		    			expenseReport.save();
		    			
					}
				catch(e)
					{
						log.error({
							title: 'Error Updating Expense Report ' + recordID,
							details: e.message
						});
					}
    		}

    }
    
    // ======================================
    // FUNCTION TO RETRIEVE SCRIPT PARAMETERS
    // ======================================
    
    function getScriptParameters() {
    	
    	// get the current script
    	var currentScript = runtime.getCurrentScript();
    	
    	taxNexus = currentScript.getParameter({
    		name: 'custscript_bbs_exp_rep_tax_nexus'
    	});
    	
    	taxTranType = currentScript.getParameter({
    		name: 'custscript_bbs_exp_rep_tax_tran_type'
    	});
    	
    	// return values to main script function
    	return {
    		taxNexus:		taxNexus,
    		taxTranType:	taxTranType
    	}	
    	
    }

    return {
    	afterSubmit: afterSubmit
    };
    
});
