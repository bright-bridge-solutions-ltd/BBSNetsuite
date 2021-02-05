/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSSOApprovalLibrary', 'N/search', 'N/record', 'N/runtime', 'N/url', 'N/https'],
function(libraryScript, search, record, runtime, url, https) {
   
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
    	
    	// check the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    		
    			// get the order status
    			var orderStatus = currentRecord.getValue({
    				fieldId: 'status'
    			});
    			
    			// check that orderStatus is Pending Approval
    			if (orderStatus == 'Pending Approval')
    				{
    					// set client script to run on the form
    					scriptContext.form.clientScriptFileId = 9933162;
    					
    					// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Refresh Stock Check',
			    			functionName: "refreshStockCheck(" + currentRecord.id + ")" // call client script when button is clicked. Pass the current record's ID
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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// declare and initialize variables
		    	var paymentApproval 		= false;
		    	var passedBusinessRules 	= false;
		    	var allItemsInStock			= false;
		    	
		    	// get the ID of the current record
		    	var currentRecordID = scriptContext.newRecord.id;
		    	
		    	// reload the sales order record
		    	var currentRecord = record.load({
		    		type: record.Type.SALES_ORDER,
		    		id: currentRecordID,
		    		isDynamic: true
		    	});
		    	
		    	// get the order status
    			var orderStatus = currentRecord.getValue({
    				fieldId: 'status'
    			});
    			
    			// check that orderStatus is Pending Approval
    			if (orderStatus == 'Pending Approval')
    				{
				    	// get the customer type
				    	var customerType = currentRecord.getValue({
				    		fieldId: 'custbody_customertype'
				    	});
				    	
				    	// get the payment method of the order
						var paymentMethod = currentRecord.getValue({
							fieldId: 'paymentmethod'
						});
						    	
						// if the customerType is 1 (General)
						if (customerType == 1)
						    {
								// if paymentMethod is 16 (PayPal (UKFD Site))
								if (paymentMethod == 16)
									{
										// get the billing/shipping addresses
										var billingAddress = currentRecord.getValue({
										    fieldId: 'billaddress'
										});
										    			
										var shippingAddress = currentRecord.getValue({
										    fieldId: 'shipaddress'
										});
										    			
										// check if we have a billing address and a shipping address 
										if (billingAddress && shippingAddress)
										   {
										    	// retrieve the customer's phone number from the shipping address subrecord
										    	var customerPhone = currentRecord.getSubrecord({
										    		fieldId: 'shippingaddress'
										    	}).getValue({
										    		fieldId: 'addrphone'
										    	});
										    	
										    	// get the PayPal authorization ID
										    	var authorizationID = currentRecord.getValue({
										    		fieldId: 'paypalauthid'
										    	});
										    					
										    	// if we have a customer phone number and an authorization ID
										    	if (customerPhone && authorizationID)
										    		{
										    			// set paymentApproval to true
										    			paymentApproval = true;
										    		}
										    }
									}
						    }
						    	
						   // call function to check if the order passes Universal Business Rules
						   passedBusinessRules = libraryScript.checkUniversalBusinessRules(currentRecord);
						    	
						   // call function to check if all items are in stock
						   allItemsInStock = libraryScript.checkStockLevels(currentRecord);
						    	
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
						   
						   currentRecord.setValue({
							   fieldId: 'custbody_bbs_stock_last_checked',
							   value: new Date() // today's date'
						   });
						    	
						   // if all checks have passed
						   if (paymentApproval == true && passedBusinessRules == true)
							   {
								   // set the order status to Pending Fulfilment
									currentRecord.setValue({
										fieldId: 'orderstatus',
										value: 'B' // B = Pending Fulfilment
									});
											
									// tick the 'System Approved' checkbox
									currentRecord.setValue({
										fieldId: 'custbody_bbs_system_approved',
										value: true
									});
											
									// tick the 'Can Be Fulfilled' checkbox on the record
									currentRecord.setValue({
										fieldId: 'custbody_canbefulfilled',
										value: true
									});
									
									// if paymentMethod is 16 (PayPal (UKFD Site))
									if (paymentMethod == 16)
										{
											//  call SuiteCentric suitelet
											https.get({
											    url: url.resolveScript({
													scriptId: 'customscript_suitelet_web_order_payment',
													deploymentId: 'customdeploy_ukfd_transform_paypal_web_o',
													params: {
														id: currentRecordID
													},
													returnExternalUrl: true
											    }),
											});
										}
									
							   }
						   
						   // save the changes to the sales order record
						   currentRecord.save({
							   ignoreMandatoryFields: true
						   });
    				}
    		}
    	
    	

    }    

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
