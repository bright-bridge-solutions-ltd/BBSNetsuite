/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/format'],
function(record, format) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	try
			{
				// load the sales order record
				var salesOrderRecord = record.load({
					type: record.Type.SALES_ORDER,
					id: 100012,
					isDynamic: true
				});
				
				log.debug({
					title: 'Loaded Sales Order'
				});
				
				// select a new line on the sales order
		    	salesOrderRecord.selectNewLine({
					sublistId: 'item'
				});
		    				
		    	// set fields on the new line
		    	salesOrderRecord.setCurrentSublistValue({
		    		sublistId: 'item',
		    		fieldId: 'item',
		    		value: 23
		    	});
		    				
		    	salesOrderRecord.setCurrentSublistValue({
		    		sublistId: 'item',
		    		fieldId: 'quantity',
		    		value: 1
		    	});
		    				
		    	salesOrderRecord.setCurrentSublistValue({
		    		sublistId: 'item',
		    		fieldId: 'rate',
		    		value: 1
		    	});
		    				
		    	// commit the line
		    	salesOrderRecord.commitLine({
					sublistId: 'item'
				});
				
				// submit the sales order record
				salesOrderRecord.save({
		    		enableSourcing: false,
				    ignoreMandatoryFields: true
		    	});
				
				log.debug({
					title: 'Sales Order Updated'
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Updating Sales Order',
					details: 'Error: ' + e
				});
			}

    }

    return {
        execute: execute
    };
    
});
