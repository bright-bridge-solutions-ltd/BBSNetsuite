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
    	
    	// check the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the old/new images of the record
    			var oldRecord 		= scriptContext.oldRecord;
    			var currentRecord 	= scriptContext.newRecord;
    			
    			// get the trade registration status from the old/new images
    			var oldStatus = oldRecord.getValue({
    				fieldId: 'custentity_trade_reg_status'
    			});
    			
    			var newStatus = currentRecord.getValue({
    				fieldId: 'custentity_trade_reg_status'
    			});
    			
    			// if the status has changed to 2 (Accepted)
    			if (oldStatus != 2 && newStatus == 2)
    				{
    					// declare and initialize variables
    					var hasDefaultShippingAddress = false;
    				
    					// get count of customer addresses
    					var addressCount = currentRecord.getLineCount({
    						sublistId: 'addressbook'
    					});
    					
    					// loop through addresses
    					for (var i = 0; i < addressCount; i++)
    						{
    							// get the value of the default shipping flag
    							var defaultShipping = currentRecord.getSublistValue({
    								sublistId: 'addressbook',
    								fieldId: 'defaultshipping',
    								line: i
    							});
    							
    							// if this is the default shipping address
    							if (defaultShipping == true)
    								{
    									// set hasDefaultShippingAddress flag to true
    									hasDefaultShippingAddress = true;
    									
    									// break the loop
    									break;
    								}
    						}
    					
    					// get the global subscription status
    					var globalSubscriptionStatus = currentRecord.getValue({
    						fieldId: 'globalsubscriptionstatus'
    					});
    					
    					// if the customer has a default shipping address and globalSubscriptionStatus is 1 (Soft Opt-In) or 3 (Confirmed Opt-In) 
    					if (hasDefaultShippingAddress == true && (globalSubscriptionStatus == 1 || globalSubscriptionStatus == 3))
    						{
    							// call function to create a sales order to send out a price list/brochure
    							createSalesOrder(currentRecord.id);
    						}
    				}    			
    		}
    }
    
    // ================================
    // FUNCTION TO CREATE A SALES ORDER
    // ================================
    
    function createSalesOrder(customerID) {
    	
    	// call function to retrieve script parameters
    	var scriptParameters = getScriptParameters();
    	
    	try
    		{
    			// create a sales order
    			var salesOrder = record.transform({
    				fromType: 	record.Type.CUSTOMER,
    				fromId: 	customerID,
    				toType:		record.Type.SALES_ORDER,
    				isDynamic:	true
    			});
    			
    			// set header fields on the sales order
    			salesOrder.setValue({
    				fieldId: 'orderstatus',
    				value: 'B' // B = Pending Fulfillment
    			});
    			
    			salesOrder.setValue({
    				fieldId: 'location',
    				value: scriptParameters.location
    			});
    			
    			salesOrder.setValue({
    				fieldId: 'shipmethod',
    				value: scriptParameters.shippingmethod
    			});
    			
    			salesOrder.setValue({
    				fieldId: 'paymentmethod',
    				value: 18 // 18 = Free Sample
    			});
    			
    			salesOrder.setValue({
    				fieldId: 'custbody_expecteddeliverydate',
    				value: getTomorrowsDate()
    			});
    			
    			// select a new line in the item sublist
    			salesOrder.selectNewLine({
    				sublistId: 'item'
    			});
    			
    			// set fields on the current line
    			salesOrder.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'item',
    				value: scriptParameters.item
    			});
    			
    			salesOrder.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'quantity',
    				value: 1
    			});
    			
    			salesOrder.setCurrentSublistValue({
	    			sublistId: 'item',
	    			fieldId: 'rate',
	    			value: 0
	    		});
    			
    			// commit the line
    			salesOrder.commitLine({
					sublistId: 'item'
				});
    			
    			// submit the sales order record
	    		var salesOrderID = salesOrder.save({
	    			enableSourcing: false,
			    	ignoreMandatoryFields: true
	    		});
	    			
	    		log.audit({
	    			title: 'Sales Order Created',
	    			details: 'Sales Order ID: ' + salesOrderID + '<br>Customer ID: ' + customerID
	    		});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Sales Order',
    				details: 'Customer ID: ' + customerID + '<br>Error: ' + e
    			});
    		}
    	
    }
    
    // ======================================
    // FUNCTION TO RETRIEVE SCRIPT PARAMETERS
    // ======================================
    
    function getScriptParameters() {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var location = currentScript.getParameter({
    		name: 'custscript_bbs_customer_ue_location'
    	});
    	
    	var shippingMethod = currentScript.getParameter({
    		name: 'custscript_bbs_customer_ue_ship_method'
    	});
    	
    	var item = currentScript.getParameter({
    		name: 'custscript_bbs_customer_ue_item'
    	});
    	
    	// return values to main script function
    	return {
    		location:			location,
    		shippingmethod:		shippingMethod,
    		item:				item
    	}
    	
    }
    
    // ===============================
    // FUNCTION TO GET TOMORROW'S DATE
    // ===============================
    
    function getTomorrowsDate() {
    	
    	// get today's date
    	var dateObj = new Date();
    	
    	// add a day to the date to get tomorrow's date
    	dateObj.setDate(dateObj.getDate() + 1);
    	
    	// return the date to the main script function
    	return dateObj;
    	
    }
    

    return {
        afterSubmit: afterSubmit
    };
    
});
