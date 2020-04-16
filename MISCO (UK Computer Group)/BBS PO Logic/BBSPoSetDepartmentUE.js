/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 */
function(record, search) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function poSetDepartmentsAS(scriptContext) 
	    {
    		if(scriptContext.type == 'create' || scriptContext.type == 'dropship' || scriptContext.type == 'specialorder')
    			{
		    		var currentRecord 		= scriptContext.newRecord;
		    		var currentRecordId 	= scriptContext.newRecord.id;
		    		var createdFrom 		= currentRecord.getValue({fieldId: 'createdfrom'});
		    		
		    		if(createdFrom != null && createdFrom != '')
		    			{
		    				var salesOrderDivision = null;
		    				
		    				try
		    					{
					    			salesOrderDivision = search.lookupFields({
																    	    		type: 		record.Type.SALES_ORDER,
																    				id: 		createdFrom,
																    				columns: 	'cseg_bbs_division'
																    			}).cseg_bbs_division[0].value;
					    			
		    					}
		    				catch(err)
		    					{
		    						salesOrderDivision = null;
		    						
		    						log.error({
	    					    		title: 		'Error getting division from sales order id = ' + createdFrom,
	    					    		details: 	err
	    					    		});
		    					}
		    				
		    				if(salesOrderDivision != null)
		    					{
		    						try
		    							{
		    								record.submitFields({
		    													type:		record.Type.PURCHASE_ORDER,
		    													id:			currentRecordId,
		    													values:		{
		    																cseg_bbs_division:		salesOrderDivision
		    																},
		    													options: 	{
				    												        enableSourcing: 		true,
				    												        ignoreMandatoryFields : true
				    												    	}
		    								});
		    							}
		    						catch(err)
		    							{
			    							log.error({
					    					    		title: 		'Error updating purchase order with division id = ' + currentRecordId,
					    					    		details: 	err
					    					    		});
		    							}
		    					}
		    			}
    			}
	    }

    return 	{
        	afterSubmit: poSetDepartmentsAS
    		};
    
});
