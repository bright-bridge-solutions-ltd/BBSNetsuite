/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) {
   
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
    	
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// declare and initialize variables
    			var itemFulfillment	= null;
    			var salesOrder 		= null;
    			
    			// get the ID of the current record
    			var recordID = scriptContext.newRecord.id;
    			
    			try
    				{
    					// reload the current record
    					itemFulfillment = record.load({
    						type: record.Type.ITEM_FULFILLMENT,
    						id: recordID,
    						isDynamic: true
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Loading Item Fulfillment ' + recordID,
    						details: e
    					});
    				}
    			
    			// if we have been able to reload the item fulfillment
    			if (itemFulfillment)
    				{
	    				// get the related sales order
	        			var salesOrderID = itemFulfillment.getValue({
	        				fieldId: 'createdfrom'
	        			});
	        			
	        			try
		    				{
		    					// load the sales order record
		    					salesOrder = record.load({
		    						type: record.Type.SALES_ORDER,
		    						id: salesOrderID
		    					});
		    				}
		    			catch(e)
		    				{
			    				log.error({
		    						title: 'Error Loading Sales Order ' + salesOrderID,
		    						details: e
		    					});
		    				}
		    			
		    			// if we have been able to load the sales order
		    			if (salesOrder)
		    				{
		    					// get count of item lines on the item fulillment and sales order records
		    					var ifLineCount = itemFulfillment.getLineCount({
		    						sublistId: 'item'
		    					});
		    					
		    					var soLineCount = salesOrder.getLineCount({
		    						sublistId: 'item'
		    					});
		    					
		    					// loop through ifLineCount
		    					for (var i = 0; i < ifLineCount; i++)
		    						{
		    							// select the item fulfilment line
		    							itemFulfillment.selectLine({
		    								sublistId: 'item',
		    								line: i
		    							});
		    						
		    							// get the value of the orderLine field
		    							var orderLine = itemFulfillment.getCurrentSublistValue({
		    								sublistId: 'item',
		    								fieldId: 'orderline'
		    							});
		    							
		    							// loop through soLineCount
		    							for (var x = 0; x < soLineCount; x++)
		    								{
		    									// get the value of the line field
		    									var line = salesOrder.getSublistValue({
				    								sublistId: 'item',
				    								fieldId: 'line',
				    								line: x
				    							});
		    									
		    									if (orderLine == line)
		    										{
		    											// get the estimated unit cost from the SO line
		    											var estUnitCost = salesOrder.getSublistValue({
		    												sublistId: 'item',
		    												fieldId: 'costestimaterate',
		    												line: x
		    											});
		    											
		    											// set the original estimated unit cost on the IF line
		    											itemFulfillment.setCurrentSublistValue({
		    												sublistId: 'item',
		    												fieldId: 'custcol_bbs_original_est_unit_cost',
		    												value: estUnitCost
		    											});
		    											
		    											// commit the changes to the line
		    											itemFulfillment.commitLine({
		    												sublistId: 'item'
		    											});
		    											
		    											// break inner loop
		    											break;
		    										}
		    								}
		    						}
		    					
		    					try
		    						{
		    							// save the changes to the item fulfillment
		    							itemFulfillment.save({
		    								ignoreMandatoryFields: true
		    							});
		    						}
		    					catch(e)
		    						{
		    							log.error({
		    								title: 'Error Saving Item Fulfillment ' + recordID,
		    								details: e
		    							});
		    						}
		    				}	    			
    				}
    		}
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
