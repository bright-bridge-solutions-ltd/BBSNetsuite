 /**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/record', 'N/url', 'N/https'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, record, url, https)  {

    // ==========================================
    // FUNCTION TO CHECK UNIVERSAL BUSINESS RULES
    // ==========================================
    
    function checkUniversalBusinessRules(currentRecord) {
    	
    	// declare and initialize variables
    	var passedRules = true;
    	
    	// get item count
    	var itemCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    			
    	// loop through item lines
    	for (var i = 0; i < itemCount; i++)
    		{
    			// get the value of the 'Create PO' field for the line
    			var createPO = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'createpo',
    				line: i
    			});
    			
    			// if this is a special order line
    			if (createPO == 'SpecOrd')
    				{
	    				// set passedRules variable to false
						passedRules = false;
								
						// break the loop
						break;
    				}
    			else // not a special order line
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
		    							var itemID = currentRecord.getSublistText({
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
    			
    			// if the type is Sale and the result is Accept
    			if (type == 'Sale' && result == 'Accept')
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
    
    // =====================================================================
    // FUNCTION TO CHECK THE BILLING/SHIPPING ADDRESS POSTCODES ARE THE SAME
    // =====================================================================
    
    function checkPostcodes(currentRecord) {
    	
    	// declare and initialize variables
    	var samePostcode = true;
    	
    	// get the postcode from the billing/shipping addresses
    	var billingPostcode = currentRecord.getSubrecord({
		    fieldId: 'billingaddress'
		}).getValue({
			fieldId: 'zip'
		});
    	
    	var shippingPostcode = currentRecord.getSubrecord({
		    fieldId: 'shippingaddress'
		}).getValue({
			fieldId: 'zip'
		});
    	
    	// check if billing and shipping postcodes are different
    	if (billingPostcode != shippingPostcode)
    		{
    			// set samePostcode variable to false
    			samePostcode = false;
    		}
    	
    	// return samePostcode to main script function
    	return samePostcode;
    	
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
    
    // ====================================================
    // FUNCTION TO TRANSFORM THE SALES ORDER TO A CASH SALE
    // ====================================================
    
    function transformToCashSale(salesOrderID) {
    	
    	// declare and initialize variables
    	var cashSaleID = null;
    	
    	try
    		{
    			// convert the sales order to a cash sale
    			cashSaleID = record.transform({
    				fromId: 	salesOrderID,
					fromType: 	record.Type.SALES_ORDER,
					toType:		record.Type.CASH_SALE
    			}).save({
    				ignoreMandatoryFields: true
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Transforming Sales Order ' + salesOrderID + ' to a Cash Sale',
    				details: e
    			});
    		}
    	
    	return cashSaleID;
    	
    }
    
    // ============================
    // FUNCTION TO SEND EKOMI EMAIL
    // ============================
    
    function sendEkomiFeedbackEmail(cashSaleID) {
    	
    	try
    		{
    			// declare and initialize variables
    			var suiteletURL = 'https://';
    		
    			// get the company URL
    			suiteletURL += url.resolveDomain({
    			    hostType: url.HostType.APPLICATION,
    			});
    		
    			// get the URL of the send Ekomi Suitelet
    			suiteletURL += url.resolveScript({
    			    scriptId: 'customscript_ekomi_send_review',
    			    deploymentId: 'customdeploy_ekomi_send_review',
    			    params: {
    			    	'cs_id': cashSaleID
    			    }
    			});
    			
    			// call the Suitelet
    			https.get({
					url: suiteletURL
				});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Calling Suitelet',
    				details: e
    			});
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
    
    return {
    	
    	checkUniversalBusinessRules:	checkUniversalBusinessRules,
    	return3DSecureResults:			return3DSecureResults,
    	getPaymentResponseDetails:		getPaymentResponseDetails,
    	checkPostcodes:					checkPostcodes,
    	checkStockLevels:				checkStockLevels,
    	getOnHandQuantity:				getOnHandQuantity,
    	transformToCashSale:			transformToCashSale,
    	sendEkomiFeedbackEmail:			sendEkomiFeedbackEmail,
    	convertToBoolean:				convertToBoolean
    };
    
});
