/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message', 'N/ui/dialog', 'N/currentRecord'],
function(search, message, dialog, currentRecord) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    	
    	// get the internal ID of the customer
    	var customerID = scriptContext.currentRecord.getValue({
    		fieldId: 'entity'
    	});
    			
    	// if we have a customer ID
    	if (customerID)
    		{
    			// lookup fields on the customer record
    			var customerAlerts = search.lookupFields({
    				type: search.Type.CUSTOMER,
    				id: customerID,
    				columns: ['custentity_bbs_customer_alerts']
    			}).custentity_bbs_customer_alerts;
    					
    			// if we have any customer alerts
    			if (customerAlerts)
    				{
    					// add a message at the top of the page
	    				message.create({
				    		type: message.Type.INFORMATION,
				    		title: 'Customer Alerts',
				    		message: customerAlerts
				    	}).show();
    				}
    		}
    	
    	// if record is being created
    	if (scriptContext.mode == 'create')
    		{
		    	// initialize the expected ship date field on the current line using today's date
		    	scriptContext.currentRecord.setCurrentSublistValue({
		    		sublistId: 'item',
		    		fieldId: 'expectedshipdate',
		    		value: new Date() // today
		    	});
    		}

    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
    	
    	// if the Customer field has been changed
    	if (scriptContext.fieldId == 'entity')
    		{
	    		// get the internal ID of the customer
	        	var customerID = scriptContext.currentRecord.getValue({
	        		fieldId: 'entity'
	        	});
	        			
	        	// if we have a customer ID
	        	if (customerID)
	        		{
	        			// lookup fields on the customer record
	        			var customerAlerts = search.lookupFields({
	        				type: search.Type.CUSTOMER,
	        				id: customerID,
	        				columns: ['custentity_bbs_customer_alerts']
	        			}).custentity_bbs_customer_alerts;
	        					
	        			// if we have any customer alerts
	        			if (customerAlerts)
	        				{
	        					// add a message at the top of the page
	    	    				message.create({
	    				    		type: message.Type.INFORMATION,
	    				    		title: 'Customer Alerts',
	    				    		message: customerAlerts
	    				    	}).show();
	        				}
	        		}
    		}
    	else if (scriptContext.fieldId == 'custbody_bbs_cust_po_number') // if the Customer PO Number field has been changed
    		{  	
		    	// declare and initialize variables
		    	var salesOrders = 0;
		    	
		    	// get the current record
		    	var currentRecord = scriptContext.currentRecord;
		    	
		    	// get the internal ID of the current record
		    	var currentRecordID = currentRecord.id;
		    	
		    	// get the internal ID of the customer
		    	var customerID = currentRecord.getValue({
		    		fieldId: 'entity'
		    	});
		    	
		    	// get the value of the Customer PO Number field
		    	var customerPO = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_cust_po_number'
		    	});
		    	
		    	// check we have a Customer PO Number and a customer selected
		    	if (customerPO)
		    		{
				    	// create search to find existing sales orders for this sales order where this customer PO number has been used
				    	var soSearch = search.create({
				    		type: search.Type.SALES_ORDER,
				    		
				    		filters: [{
				    			name: 'mainline',
				    			operator: search.Operator.IS,
				    			values: ['T']
				    		},
				    				{
				    			name: 'mainname',
				    			operator: search.Operator.ANYOF,
				    			values: [customerID]
				    		},
				    				{
				    			name: 'custbody_bbs_cust_po_number',
				    			operator: search.Operator.IS,
				    			values: [customerPO]
				    		}],
				    		
				    		columns: [{
				    			name: 'tranid'
				    		}],
				    	
				    	});
				    	
				    	// if we have a current record ID (IE the Sales Order is being edited)
				    	if (currentRecordID)
				    		{
				    			// add an additional filter to the search to exclude the current record
				    			soSearch.filters.push(
				    									search.createFilter({
				    										name: 'internalid',
				    										operator: search.Operator.NONEOF,
				    										values: currentRecordID
				    									})
				    								);
				    		}
				    	
				    	// run the search and process results
				    	soSearch.run().each(function(result){
				    		
				    		// increase the salesOrders variable
				    		salesOrders++;
				    		
				    	});
				    	
				    	// if salesOrders is greater than 0
				    	if (salesOrders > 0)
				    		{
				    			// display an alert to the user
				    			message.create({
				    				type: message.Type.ERROR,
				    				title: '⚠️ Error',
				    				message: 'The Customer PO Number<b> ' + customerPO + '</b> has already been used on an existing Sales Order.<br><br>Please enter a unique Customer PO Number and try again.'
				    			}).show(5000); // show for 5 seconds
				    		}
		    		}
    		}
    	else if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'quantity') // if the quantity has been changed
    		{
	    		// get the current record
		    	var currentRecord = scriptContext.currentRecord;
		    	
		    	// get the quantity, available quantity and max quote quantity for the current line
		    	var quantity = currentRecord.getCurrentSublistValue({
		    		sublistId: 'item',
		    		fieldId: 'quantity'
		    	});
		    	
		    	var availableQuantity = currentRecord.getCurrentSublistValue({
		    		sublistId: 'item',
		    		fieldId: 'quantityavailable'
		    	});
		    	
		    	// get the max quote quantity for the line
    			var maxQuoteQty = currentRecord.getCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'custcol_bbs_max_quote_qty'
    			});
		    	
		    	if (quantity > availableQuantity) // if quantity > availableQuantity
		    		{
		    			// display an alert to the user
		    			dialog.alert({
		    				title: '⚠️ Check Quantity',
		    				message: 'You have entered a quantity of <b>' + quantity + '</b> but there are only <b>' + availableQuantity + '</b> available.<br><br>Please check the quantity you have entered before continuing.'
		    			});
		    		}
		    	else if (quantity >= maxQuoteQty) // if quantity >= maxQuoteQty
    				{
    					// display an alert to the user
    					dialog.create({
    						title: '⚠️ Maximum Quote Quantity Exceeded',
    						message: 'The quantity you have entered (<b>' + quantity + '</b>) is greater than the maximum quote quantity (<b>' + maxQuoteQty + '</b>) for this item.<br><br>If you continue, the transaction will require approval before it can be processed.'
    					});
    				}
    		}
    	else if (scriptContext.fieldId == 'shipdate')
    		{
    			// call function to reset line level ship dates
    			resetExpectedShipDates();
    		}
    	else if (scriptContext.fieldId == 'custbodyny_ca_srdheader')
    		{
    			// call function to reset line level required by dates
    			resetRequiredByDates();
    		}
    	else if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
			{
				// initialize fields on the current line
				scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'expectedshipdate',
					value: new Date() // today
				});
    			
    			scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'requesteddate',
					value: scriptContext.currentRecord.getValue({
						fieldId: 'custbodyny_ca_srdheader'
					})
				});
			}
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {
    	
    	// set the order priority field on the line being added
    	scriptContext.currentRecord.setCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'orderpriority',
			value: 5
		});
    	
    	// allow the line to be saved
    	return true;

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	
    	// declare and initialize variables
    	var maxQuoteQtyExceeded = false;
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get count of item lines
    	var itemCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through item lines
    	for (var i = 0; i < itemCount; i++)
    		{
    			// get the quantity for the line
    			var quantity = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'quantity',
    				line: i
    			});
    			
    			// get the max quote quantity for the line
    			var maxQuoteQty = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'custcol_bbs_max_quote_qty',
    				line: i
    			});
    			
    			// if quantity >= maxQuoteQty
    			if (quantity >= maxQuoteQty)
    				{
    					// set maxQuoteQtyExceeded flag to true
    					maxQuoteQtyExceeded = true;
    					
    					// break the loop
    					break;
    				}
    		}
    	
    	// set the 'Max Quote Qty Exceeded' checkbox on the record
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_apply_mqq_block',
    		value: maxQuoteQtyExceeded
    	});
    	
    	// allow the record to be saved
    	return true;

    }
    
    // ===============================================================================
    // CUSTOM FUNCTION TO RESET LINE LEVEL SHIP DATES USING THE HEADER SHIP DATE FIELD
    // ===============================================================================
    
    function resetExpectedShipDates() {
    	
    	// get the current record
    	var currRec = currentRecord.get();
    	
    	// get the value of the ship date field
    	var shipDate = currRec.getValue({
    		fieldId: 'shipdate'
    	});
    	
    	// get count of item lines
    	var lineCount = currRec.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through item lines
    	for (var i = 0; i < lineCount; i++)
    		{
    			// set the expected ship date field on the line
    			currRec.selectLine({
    				sublistId: 'item',
    				line: i
    			});
    			
    			currRec.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'expectedshipdate',
    				value: shipDate
    			});
    			
    			currRec.commitLine({
    				sublistId: 'item'
    			});
    		}
    	
    }
    
    function resetRequiredByDates() {
    	
    	// get the current record
    	var currRec = currentRecord.get();
    	
    	// get the value of the supply required by date field
    	var requiredDate = currRec.getValue({
    		fieldId: 'custbodyny_ca_srdheader'
    	});
    	
    	// get count of item lines
    	var lineCount = currRec.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through item lines
    	for (var i = 0; i < lineCount; i++)
    		{
    			// set the supply required by date field on the line
    			currRec.selectLine({
    				sublistId: 'item',
    				line: i
    			});
    			
    			currRec.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'custbodyny_ca_srdheader',
    				value: requiredDate
    			});
    			
    			currRec.commitLine({
    				sublistId: 'item'
    			});
    		}
    	
    }

    return {
        pageInit: 		pageInit,
    	fieldChanged: 	fieldChanged,
    	validateLine: 	validateLine,
    	saveRecord: 	saveRecord,
    	resetExpectedShipDates: resetExpectedShipDates
    };
    
});
