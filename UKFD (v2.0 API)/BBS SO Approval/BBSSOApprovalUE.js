/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
   
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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// declare and initialize variables
		    	var paymentApproval 		= false;
		    	var passedBusinessRules 	= false;
		    	var allItemsInStock			= false;
		    	
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the payment method of the order
		    	var paymentMethod = currentRecord.getValue({
		    		fieldId: 'paymentmethod'
		    	});
		    	
		    	// if paymentMethod is 9 (PayPal (Other)) or 16 (PayPal (UKFD Site))
		    	if (paymentMethod == 9 || paymentMethod == 16)
		    		{
		    			// get the billing address
		    			var billingAddress = currentRecord.getValue({
		    				fieldId: 'billaddress'
		    			});
		    			
		    			// check if we have a billing address
		    			if (billingAddress)
		    				{
		    					// get the billing address subrecord
		    					var billingAddressSubrecord = currentRecord.getSubrecord({
		    						fieldId: 'billingaddress'
		    					});
		    					
		    					// retrieve details from the billing address
		    					var customerName = billingAddressSubrecord.getValue({
		    						fieldId: 'addressee'
		    					});
		    					
		    					var postcode = billingAddressSubrecord.getValue({
		    						fieldId: 'zip'
		    					});
		    					
		    					// get the customer's phone number
		    					var telephoneNumber = currentRecord.getValue({
		    						fieldId: 'custbody_customerphonesourced'
		    					});
		    					
		    					// if we have a customerName, telephoneNumber and a postcode
		    					if (customerName && telephoneNumber && postcode)
		    						{
		    							// set paymentApproval to true
		    							paymentApproval = true;
		    						}
		    				}
		    		}
		    	else if (paymentMethod == 13 || paymentMethod == 14) // if paymentMethod is 13 (VISA) or 14 (Master Card)
		    		{
		    			// call function to retrieve 3D secure results
		    			var paymentResults = return3DSecureResults(currentRecord);
		    			
		    			// set fields on the Sales Order
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_eci',
		    				value: paymentResults.eci
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_eci_raw',
		    				value: paymentResults.eciRaw
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_pares_status',
		    				value: paymentResults.paresStatus
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_reason_code',
		    				value: paymentResults.reasonCode
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_decision',
		    				value: paymentResults.decision
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_avs_street',
		    				value: paymentResults.avsStreet
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_avs_zip',
		    				value: paymentResults.avsZip
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_payment_csc',
		    				value: paymentResults.csc
		    			});
		    			
		    			if ((paymentResults.eciRaw == 05 || paymentResults.eciRaw == 02) && paymentResults.paresStatus == 'Y' && paymentResults.reasonCode == 100)
	    					{
		    					// set the 3D secure checkbox on the record
		    					currentRecord.setValue({
		    						fieldId: 'custbody_bbs_payment_3d_secure',
		    						value: true
		    					});
		    					
		    					// if avsStreet/avsZip/csc = true and decision = ACCEPT
		    					if (paymentResults.avsStreet == true && paymentResults.avsZip == true && paymentResults.csc == true && paymentResults.decision == 'ACCEPT')
		    						{
		    							// set paymentApproval to true
		    							paymentApproval = true;
		    						}
	    					}
		    		}
		    	
		    	// call function to check if the order passes Universal Business Rules
		    	passedBusinessRules = checkUniversalBusinessRules(currentRecord);
		    	
		    	// call function to check if all items are in stock
		    	allItemsInStock = checkStockLevels(currentRecord);
		    	
		    	// set the approval checkboxes on the record
		    	currentRecord.setValue({
		    		fieldId: 'custbody_bbs_passed_payment_approval',
		    		value: paymentApproval
		    	});
		    	
		    	currentRecord.setValue({
		    		fieldId: 'custbody_bbs_passed_uni_business_rules',
		    		value: passedBusinessRules
		    	});
		    	
		    	currentRecord.setValue({
		    		fieldId: 'custbody_bbs_all_items_in_stock',
		    		value: allItemsInStock
		    	});
		    	
		    	// if all checks have passed
		    	if (paymentApproval == true && passedBusinessRules == true && allItemsInStock == true)
		    		{
			    		// set the order status to Pending Fulfilment
						currentRecord.setValue({
							fieldId: 'orderstatus',
							value: 'B' // B = Pending Fulfilment
						});
		    		}
    		}

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

    }
    
    // ==========================================
    // FUNCTION TO CHECK UNIVERSAL BUSINESS RULES
    // ==========================================
    
    function checkUniversalBusinessRules(currentRecord) {
    	
    	// declare and initialize variables
    	var passedRules = true;
    	
    	// get the customer name from the currentRecord object
    	var customerName = currentRecord.getText({
    		fieldId: 'entity'
    	});
    	
    	// if the customerName contains 'Guest Shopper'
    	if (customerName.indexOf('Guest Shopper') > -1)
    		{
    			// set passedRules variable to false
    			passedRules = false;
    		}
    	else
    		{
	    		// get item count
    			var itemCount = currentRecord.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through item lines
    			for (var i = 0; i < itemCount; i++)
    				{
    					// get the item name
    					var itemName = currentRecord.getSublistText({
    						sublistId: 'item',
    						fieldId: 'item',
    						line: i
    					});
    					
    					// if the itemName contains 'VIN'
    					if (itemName.indexOf('VIN') > -1)
    						{
    							// loop through the items again
    							for (var x = 0; x < itemCount; x++)
    								{
    									// get the item name
	    								var itemName = currentRecord.getSublistText({
	    		    						sublistId: 'item',
	    		    						fieldId: 'item',
	    		    						line: x
	    		    					});
	    								
	    								// if part code matches to one of these products
	    								if (itemName == 'ACC-UN-NO-008' || itemName == 'ACC-UN-NO-005' || itemName == 'ACC-UN-NO-004' || itemName == 'ACC-UN-NO-002' || itemName == 'ACC-UN-FB-55' || itemName == 'ACC-UN-FF-001' || itemName.indexOf('S-VIN') > -1 || itemName.indexOf('S-SOL') > -1)
	    									{
	    										// set passedRules variable to false
	    										passedRules = false;
	    										
	    										// break the loop
	    										break;
	    									}
    								}
    						}
    					else if (itemName.indexOf('SOL') > -1) // if the itemName contain 'SOL'
    						{
    							// loop through the items again
    							for (var x = 0; x < itemCount; x++)
    								{
    									// get the item name
    									var itemName = currentRecord.getSublistText({
    										sublistId: 'item',
    										fieldId: 'item',
    										line: x
    									});
    									
    									// if part code matches to one of these products
    									if (itemName == 'ACC-UN-NO-008' || itemName == 'ACC-UN-NO-005' || itemName == 'ACC-UN-NO-004' || itemName == 'ACC-UN-NO-002' || itemName == 'ACC-UN-FB-55' || itemName == 'ACC-UN-LC-03' || itemName.indexOf('S-VIN') > -1 || itemName.indexOf('S-SOL') > -1)
    										{
	    										// set passedRules variable to false
	    										passedRules = false;
	    										
	    										// break the loop
	    										break;
    										}
    								}
    						}
    				}
    		}
    	
    	// return passedRules variable to main script function
    	return passedRules;
    	
    }
    
    // ====================================
    // FUNCTION TO RETURN 3D SECURE RESULTS
    // ====================================
    
    function return3DSecureResults(currentRecord) {
    	
    	// declare and initialize variables
		var eci				= 	null;
    	var eciRaw			= 	null;
    	var paresStatus		= 	null;
    	var reasonCode		= 	null;
    	var avsStreet		= 	false;
    	var avsZip			= 	false;
    	var csc				= 	false;
    	var decision		= 	null;
    	
    	// get count of payment event lines
    	var paymentEvents = currentRecord.getLineCount({
    		sublistId: 'paymentevent'
    	});
    	
    	// loop through payment event lines
    	for (var i = 0; i < paymentEvents; i++)
    		{
    			// get the type and the result
    			var type = currentRecord.getSublistValue({
    				sublistId: 'paymentevent',
    				fieldId: 'type',
    				line: i
    			});
    			
    			var result = currentRecord.getSublistValue({
    				sublistId: 'paymentevent',
    				fieldId: 'result',
    				line: i
    			});
    			
    			// if the type is Authorization and the result is Accept
    			if (type == 'Authorization' && result == 'Accept')
    				{
    					// return values from the line
    					avsStreet = convertToBoolean(
	    													currentRecord.getSublistValue({
	    														sublistId: 'paymentevent',
	    														fieldId: 'avsstreet',
	    														line: i
	    													})
    												);
    					
    					avsZip = convertToBoolean(
	    												currentRecord.getSublistValue({
	    													sublistId: 'paymentevent',
	    													fieldId: 'avszip',
	    													line: i
	    												})
    											);
    					
    					csc = convertToBoolean(
													currentRecord.getSublistValue({
														sublistId: 'paymentevent',
														fieldId: 'csc',
														line: i
													})
											);
    					
    					var paymentResponse = getPaymentResponseDetails(
    																	currentRecord.getSublistValue({
    																		sublistId: 'paymentevent',
    																		fieldId: 'response',
    																		line: i
    																	})
    															);
    					
    					// return values from the paymentResponse object
    					eci 			= 	paymentResponse.eci;
    					eciRaw			=	paymentResponse.eciRaw;
    					paresStatus		=	paymentResponse.paresStatus;
    					reasonCode		=	paymentResponse.reasonCode;
    					decision		=	paymentResponse.decision;

    					// break the loop
    					break;
    				}
    		}
    	
    	// return values to the main script function
    	return {
    		eci: 			eci,
    		eciRaw:			eciRaw,
    		paresStatus:	paresStatus,
    		reasonCode:		reasonCode,
    		decision:		decision,
    		avsStreet:		avsStreet,
    		avsZip:			avsZip,
    		csc:			csc
    	}
    	
    }
    
    // ======================================
    // FUNCTION TO CONVERT TO A BOOLEAN VALUE
    // ======================================
    
    function convertToBoolean(value) {
    	
    	// declare and initialize variables
    	var returnValue = null;
    	
    	// if value is Y
    	if (value == 'Y')
    		{
    			// set returnValue to true
    			returnValue = true;
    		}
    	else
    		{
    			// set returnValue to false
    			returnValue = false;
    		}
    	
    	// return returnValue to main script function
    	return returnValue;   	
    	
    }
    
    // ===========================================
    // FUNCTION TO RETURN PAYMENT RESPONSE DETAILS
    // ===========================================
    
    function getPaymentResponseDetails(paymentResponse) {
    	
    	// declare and initialize variables
    	var outputArray 	= 	{};
    	var eci 			= 	null;
    	var eciRaw			= 	null;
    	var paresStatus		=	null;
    	var reasonCode		=	null;
    	var decision		=	null;
    	
    	// split the paymentResponse string to create an array
    	paymentResponse = paymentResponse.split('<br />');
    	
    	// loop through paymentResponse array
    	for (var i = 0; i < paymentResponse.length; i++)
    		{
    			// split the paymentResponse array element to create a new array containing key/value pairs
    			var keyValue = paymentResponse[i].split(':');
    			
    			// create a new object in the output array. Use trim to remove white spaces
    			outputArray[keyValue[0].trim()] = keyValue[1];
    		}
    	
    	// do we have a payerAuthValidateReply_eci element in the output array
    	if (outputArray.hasOwnProperty('payerAuthValidateReply_eci'))
    		{
    			// get the value of the payerAuthValidateReply_eci element. Use trim to remove white spaces
    			eci = outputArray.payerAuthValidateReply_eci.trim();
    		}
    	
    	// do we have a payerAuthValidateReply_eciRaw element in the output array
    	if (outputArray.hasOwnProperty('payerAuthValidateReply_eciRaw'))
    		{
    			// get the value of the payerAuthValidateReply_eciRaw element. Use trim to remove white spaces
    			eciRaw = outputArray.payerAuthValidateReply_eciRaw.trim();
    		}
    	
    	// do we have a payerAuthValidateReply_paresStatus element in the output array
    	if (outputArray.hasOwnProperty('payerAuthValidateReply_paresStatus'))
			{
				// get the value of the payerAuthValidateReply_paresStatus element. Use trim to remove white spaces
    			paresStatus = outputArray.payerAuthValidateReply_paresStatus.trim();
			}
    	
    	// do we have a payerAuthValidateReply_reasonCode element in the output array
    	if (outputArray.hasOwnProperty('payerAuthValidateReply_reasonCode'))
			{
				// get the value of the payerAuthValidateReply_reasonCode element. Use trim to remove white spaces
    			reasonCode = outputArray.payerAuthValidateReply_reasonCode.trim();
			}
    	
    	// do we have a decision element in the output array
    	if (outputArray.hasOwnProperty('decision'))
    		{
    			// get the value of the decision element. Use trim to remove white spaces and toUpperCase to convert to capitals
    			decision = outputArray.decision.trim().toUpperCase();
    		}
    	
    	// return values to the main script function
    	return {
    		eci: 			eci,
    		eciRaw: 		eciRaw,
    		paresStatus: 	paresStatus,
    		reasonCode: 	reasonCode,
    		decision:		decision
    	}
    	
    }
    
    // ========================================
    // FUNCTION TO CHECK ALL ITEMS ARE IN STOCK
    // ========================================
    
    function checkStockLevels(currentRecord) {
    	
    	// declare and initialize variables
    	var allItemsInStock = true;
    	
    	// get item count
    	var itemCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through items
    	for (var i = 0; i < itemCount; i++)
    		{
	    		// get the itemType from the line
    			var itemType = currentRecord.getSublistValue({
					sublistId:	'item',
					fieldId: 'itemtype',
					line: i
				});

    			// if item is an Inventory Item
				if (itemType == 'InvtPart')
					{
		    			// get the item ID and quantity
						var itemID = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						
						var quantity = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: i
						});
						
						// call function to return the on hand quantity
						var onHandQuantity = getOnHandQuantity(itemID);
						
						// if onHandQuantity < quantity
						if (onHandQuantity < quantity)
							{
								// set allItemsInStock variable to false
								allItemsInStock = false;
								
								// break the loop
								break;
							}
					}	
    		}
    	
    	// return allItemsInStock to main script function
    	return allItemsInStock;
    	
    }
    
    // =======================================
    // FUNCTION TO RETURN THE ON HAND QUANTITY
    // =======================================
    
    function getOnHandQuantity(itemID) {
    	
    	// declare and initialize variables
    	var onHandQuantity = 0;
    	
    	// run search to return the item's on hand quantity
    	search.create({
    		type: search.Type.INVENTORY_ITEM,
    		
    		filters: [{
    			name: 'internalid',
    			operator: search.Operator.ANYOF,
    			values: [itemID]
    		}],
    		
    		columns: [{
    			name: 'formulanumeric',
    			formula: 'CASE WHEN {quantityonhand} IS NULL THEN 0 ELSE {quantityonhand} END'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the on hand quantity from the search results
    		onHandQuantity = result.getValue({
    			name: 'formulanumeric'
    		});
    		
    	});
    	
    	// return onHandQuantity to main script function
    	return onHandQuantity;
    	
    }
    

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
