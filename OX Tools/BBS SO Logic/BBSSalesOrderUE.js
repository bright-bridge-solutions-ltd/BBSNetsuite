/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search'],
function(runtime, record, search) {
   
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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// run the backorder process function
    			runBackOrderProcess(scriptContext.newRecord.id);    					
    		}
    	else if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the value of the run backorder process checkbox
    			var runBOProcess = scriptContext.newRecord.getValue({
    				fieldId: 'custbody_bbs_run_backorder_process'
    			});
    			
    			// if the run backorder process checkbox is checked
    			if (runBOProcess == true)
    				{
    					// run the backorder process function
        				runBackOrderProcess(scriptContext.newRecord.id); 
    				}
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getScriptParameters() {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var closeRemainingLinesAmt = currentScript.getParameter({
    		name: 'custscript_bbs_close_remaining_lines_amt'
    	});
    	
    	// return values to the main script function
    	return {
    		closeRemainingLinesAmt:	closeRemainingLinesAmt
    	}
    	
    }
    
    function runBackOrderProcess(recordID) {
    	
    	// call function to retrieve script parameters
		var scriptParameters = getScriptParameters();
    	
    	try
			{
				// reload the sales order
				var salesOrder = record.load({
					type: record.Type.SALES_ORDER,
					id: recordID,
					isDynamic: true
				});
				
				// get the subsidiary from the sales order record
				var subsidiaryID = salesOrder.getValue({
					fieldId: 'subsidiary'
				});
				
				// if the subsidiary is 12 (Ox Tools UK)
				if (subsidiaryID == 12)
					{
						// get the customer ID
						var customerID = salesOrder.getValue({
		    				fieldId: 'entity'
		    			});
						
						// get the backorder requirement
						var backOrderRequirement = salesOrder.getValue({
							fieldId: 'custbody_bbs_cust_backorder_req'
						});
						
						switch(backOrderRequirement) {
						
							case '1':	// Ox Policy
								
	    							// call function to get the latest due date
	    	    					var latestDueDate = getLatestDueDate(salesOrder);
	    	    					
	    	    					// call function to set all outstanding lines to the latest due date
	    	    					salesOrder = updateDueDates(salesOrder, latestDueDate);
								
									// get the date 30 days in the future
									var thirtyDaysAhead = new Date();
										thirtyDaysAhead = new Date(thirtyDaysAhead.getFullYear(), thirtyDaysAhead.getMonth(), thirtyDaysAhead.getDate()+30);
								
									// is the latestDueDate more than 30 days ahead
									if (latestDueDate.getTime() > thirtyDaysAhead.getTime())
										{
											// call function to get the total of remaining lines
											var totalRemaining = getTotalRemaining(salesOrder);
											
											// if the total remaining is over the specified amount
											if (totalRemaining < scriptParameters.closeRemainingLinesAmt)
												{
													// call function to close all remaining lines on the sales order
													salesOrder = closeAllRemainingLines(salesOrder);
												}
										}
									
									// save the changes to the sales order
									salesOrder.save({
										ignoreMandatoryFields: true
									});
								
									break;
									
							case '2':	// No Back Orders
								
									// call function to close all remaining lines on the sales order
									salesOrder = closeAllRemainingLines(salesOrder);
									
									// save the changes to the sales order
									salesOrder.save({
										ignoreMandatoryFields: true
									});
								
									break;
									
							case '3':	// All Back Orders
								
	    							// call function to get the latest due date
	    	    					var latestDueDate = getLatestDueDate(salesOrder);
	    	    					
	    	    					// call function to set all outstanding lines to the latest due date
	    	    					salesOrder = updateDueDates(salesOrder, latestDueDate);
								
	    							// save the changes to the sales order
									salesOrder.save({
										ignoreMandatoryFields: true
									});
								
									break;
						}
					}
			}
		catch(e)
			{
				log.error({
					title: 'Error Updating Sales Order ' + recordID,
					details: e.message
				});
			}
    	
    }
    
    function getLatestDueDate(salesOrder) {
    	
    	// declare and initialize variables
    	var latestDueDate = new Date();
    	
    	// get count of sales order lines
    	var lineCount = salesOrder.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through sales order lines
    	for (var i = 0; i < lineCount; i++)
    		{
	    		// get the backordered quantity from the line
				var backorderQty = salesOrder.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantitybackordered',
					line: i
				});
				
				// if this line has a backorder quantity
				if (backorderQty > 0)
					{
		    			// get the expected ship date from the line
						var expShipDate = salesOrder.getSublistValue({
							sublistId: 'item',
							fieldId: 'expectedshipdate',
							line: i
						});
						
						// if the expected ship date is after the current latest due date
						if (expShipDate.getTime() > latestDueDate.getTime())
		    				{
			    				// set the latestDueDate to be the the expected ship date
								latestDueDate = expShipDate;
		    				}
					}
    		}
    	
    	// return values to main script function
    	return latestDueDate;
    	
    }
    
    function updateDueDates(salesOrder, latestDueDate) {
    	
    	// get count of sales order lines
    	var lineCount = salesOrder.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through sales order lines
    	for (var i = 0; i < lineCount; i++)
    		{
	    		// select the line
				salesOrder.selectLine({
					sublistId: 'item',
					line: i
				});
			
				// get the backordered quantity from the line
				var backorderQty = salesOrder.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'quantitybackordered'
				});
				
				// if this line has a backorder quantity
				if (backorderQty > 0)
					{
						// set the supply required by date on the line
						salesOrder.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'requesteddate',
							value: latestDueDate
						});
						
						salesOrder.commitLine({
							sublistId: 'item'
						});
					}
    		}
    	
    	// return the amended sales order record image to the main script function
    	return salesOrder;
    	
    }
    
    function getBackorderRequirement(customerID) {
    	
    	// declare and intialize variables
    	var backOrderRequirement = null;
    	
    	// lookup fields on the customer record
    	var customerLookup = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['custentity_bbs_cust_backorder_req']
    	});
    	
    	// if we have a backorder requirement on the customer
    	if (customerLookup.custentity_bbs_cust_backorder_req.length > 0)
    		{
    			// get the value of the backorder requirement
    			backOrderRequirement = customerLookup.custentity_bbs_cust_backorder_req[0].value;
    		}
    	
    	// return values to main script function
    	return backOrderRequirement;
    	
    }
    
    function getTotalRemaining(salesOrder) {
    	
    	// declare and initialize variables
    	var totalRemaining = 0;
    	
    	// get count of sales order lines
    	var lineCount = salesOrder.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through sales order lines
    	for (var i = 0; i < lineCount; i++)
    		{
	    		// get the backordered quantity from the line
				var backorderQty = salesOrder.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantitybackordered',
					line: i
				});
				
				// if this line has a backorder quantity
				if (backorderQty > 0)
					{
						// get the rate from the line
						var rate = parseFloat(salesOrder.getSublistValue({
							sublistId: 'item',
							fieldId: 'rate',
							line: i
						}));
						
						// multiply the rate by the back order quantity and add to the total remaining variable
						totalRemaining += (backorderQty * rate);
					}
    		}
    	
    	// return values to main script function
    	return totalRemaining.toFixed(2);
    	
    }
    
    function closeAllRemainingLines(salesOrder) {
    	
    	// get count of sales order lines
    	var lineCount = salesOrder.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through sales order lines
    	for (var i = 0; i < lineCount; i++)
    		{
	    		// select the line
    			salesOrder.selectLine({
    				sublistId: 'item',
    				line: i
    			});
    		
    			// get the backordered quantity from the line
				var backorderQty = salesOrder.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'quantitybackordered'
				});
				
				// if this line has a backorder quantity
				if (backorderQty > 0)
					{
						// mark the line as closed
						salesOrder.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'isclosed',
							value: true
						});
						
						salesOrder.commitLine({
							sublistId: 'item'
						});
					}
    		}
    	
    	// return the amended sales order record image to the main script function
    	return salesOrder;
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
