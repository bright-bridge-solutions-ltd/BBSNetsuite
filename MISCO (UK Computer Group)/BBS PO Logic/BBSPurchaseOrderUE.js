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
	
    function poAfterSubmit(scriptContext) {
    		
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.DROPSHIP || scriptContext.type == scriptContext.UserEventType.SPECIALORDER)
    		{
		    	// declare and initialize variables
    			var salesOrderDivision = null;
    				
    			// get the current record
    			var currentRecord 	= scriptContext.newRecord;
		    	var currentRecordId	= scriptContext.newRecord.id;
		    		
		    	// get the PO number from the first item line
	    		var poNumber = currentRecord.getSublistValue({
	    			sublistId: 'item',
	    			fieldId: 'custcol_bbs_sales_trx_ponumber',
	    			line: 0
	    		});
		    		
		    	// get the value of the created from field
		    	var createdFrom = currentRecord.getValue({
		    		fieldId: 'createdfrom'
		    	});
		    		
		    	// if we createdFrom returns a value
		    	if (createdFrom)
		    		{
			    		try
		    				{
					    		// lookup fields on the related sales order
			    				salesOrderDivision = search.lookupFields({
			    					type: record.Type.SALES_ORDER,
			    					id: createdFrom,
			    					columns: 'cseg_bbs_division'
			    				}).cseg_bbs_division[0].value;
					    			
		    				}
		    			catch(err)
		    				{
		    					// reset salesOrderDivision to hull
		    					salesOrderDivision = null;
		    						
		    					log.error({
							    	title: 	'Error getting division from sales order id = ' + createdFrom,
							    	details: err
							    });
		    				}
		    		}
		    		
		    	try
					{
						// update fields on the purchase order
		    			record.submitFields({
		    				type: record.Type.PURCHASE_ORDER,
		    				id:	currentRecordId,
		    				values:	{
		    					cseg_bbs_division: salesOrderDivision,
		    					custbody_bbs_ponumber: poNumber
		    				},
							options: {
								enableSourcing: true,
								ignoreMandatoryFields : true
							}
						});
					}
				catch(err)
					{
						log.error({
							title: 'Error updating purchase order with id = ' + currentRecordId,
							details: err
						});
					}
    		}
    }

    return {
    	afterSubmit: poAfterSubmit
    };
    
});
