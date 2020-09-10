		/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','N/runtime','N/task'],

function(record, search, runtime, task) 
{

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function cbcCustomerBudgetAS(scriptContext) 
	    {
    		try
    			{
			    	if(scriptContext.type == 'create' || scriptContext.type == 'edit')
						{
					    	//Get the ID of the submitted record
				    		//
					    	var currentRecordID = scriptContext.newRecord.id;
					    	
					    	//Load the current record
					    	//
					    	var currentRecord = record.load({
												    		type: 	'customrecord_cbc_customer_record',
												    		id: 	currentRecordID
												    		});
					    	
					    	//Get field values
					    	//
					    	var customerId 			= currentRecord.getValue({fieldId: 'custrecord_cbc_customer_id'});
					    	var gradeId 			= currentRecord.getValue({fieldId: 'custrecord_cbc_customer_grade'});
					    	var budgetTypeId 		= currentRecord.getValue({fieldId: 'custrecord_cbc_customer_budget_type'});
					    	var allocationTypeId 	= currentRecord.getValue({fieldId: 'custrecord_cbc_customer_item_alloc_type'});
					    	var allocationQuantity 	= currentRecord.getValue({fieldId: 'custrecord_cbc_customer_quantity'});
					    	var resetDays 			= currentRecord.getValue({fieldId: 'custrecord_cbc_customer_reset_days'});
					    	
					    	
					    	//Call the map reduce script to process the changes to the budget record
					    	//
					    	var mrTask = task.create({
													taskType:		task.TaskType.MAP_REDUCE,
													scriptId:		'customscript_cbc_brd_mr',	
													deploymentid:	null,
													params:			{
																		custscript_cbs_brd_customer:	customerId,
																		custscript_cbs_brd_grade: 		gradeId,
																		custscript_cbs_brd_budget:		budgetTypeId,
																		custscript_cbs_brd_alloc_type:	allocationTypeId,
																		custscript_cbs_brd_quantity:	allocationQuantity,
																		custscript_cbs_brd_reset_days:	resetDays
																	}
													});
							
							mrTask.submit();
		
					    	
						}
    			}
    		catch(err)
    			{
	    			log.error({
								title: 		'Unexpected error in CBC budget rolldown UE',
								details: 	err
								});
    			}
	    }

    return 	{
        	afterSubmit: 	cbcCustomerBudgetAS
    		};
    
});
