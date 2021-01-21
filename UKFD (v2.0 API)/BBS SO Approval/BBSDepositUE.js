/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSSOApprovalLibrary', 'N/search', 'N/record', 'N/runtime'],
function(libraryScript, search, record, runtime) {
   
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
		    	// retrieve script parameters
    			var use3DSecure = runtime.getCurrentScript().getParameter({
    				name: 'custscript_bbs_so_approval_use_3d_secure'
    			});
    		
    			// declare and initialize variables
		    	var paymentApproval 		= false;
		    	var passedBusinessRules 	= false;
		    	var allItemsInStock			= false;
		    	
		    	// get the ID of the current record
		    	var depositID = scriptContext.newRecord.id;
		    	
		    	// reload the deposit record
		    	var depositRecord = record.load({
		    		type: record.Type.CUSTOMER_DEPOSIT,
		    		id: depositID,
		    		isDynamic: true
		    	});
		    	
		    	// get the ID of the related sales order
		    	var salesOrderID = depositRecord.getValue({
		    		fieldId: 'salesorder'
		    	});
		    	
		    	// reload the sales order record
		    	var salesOrder = record.load({
		    		type: record.Type.SALES_ORDER,
		    		id: salesOrderID,
		    		isDynamic: true
		    	});
		    	
		    	// get the sales order's status
    			var orderStatus = salesOrder.getValue({
    				fieldId: 'status'
    			});
    			
    			// check that orderStatus is Pending Approval
    			if (orderStatus == 'Pending Approval')
    				{
	    				// get the customer type from the sales order
				    	var customerType = salesOrder.getValue({
				    		fieldId: 'custbody_customertype'
				    	});
				    	
				    	// get the payment method from the deposit record
						var paymentMethod = depositRecord.getValue({
							fieldId: 'paymentmethod'
						});
						    	
						// if the customerType is 1 (General)
						if (customerType == 1)
						    {
								if (paymentMethod == 13 || paymentMethod == 14) // if paymentMethod is 13 (VISA) or 14 (Master Card)
									{
										// call function to retrieve 3D secure results
										var paymentResults = libraryScript.return3DSecureResults(depositRecord);
										
										// call function to check if the billing/shipping address postcodes are the same
										var samePostcode = libraryScript.checkPostcodes(salesOrder);
										    			
										// set fields on the Sales Order
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_eci',
										    value: paymentResults.eci
										});
										    			
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_eci_raw',
										    value: paymentResults.eciRaw
										});
										    			
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_pares_status',
										    value: paymentResults.paresStatus
										});
										    			
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_reason_code',
										    value: paymentResults.reasonCode
										});
										    			
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_decision',
										    value: paymentResults.decision
										});
										    			
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_avs_street',
										    value: paymentResults.avsStreet
										});
										    			
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_avs_zip',
										    value: paymentResults.avsZip
										});
										    			
										salesOrder.setValue({
										    fieldId: 'custbody_bbs_payment_csc',
										    value: paymentResults.csc
										});
										
										salesOrder.setValue({
											fieldId: 'custbody_bbs_payment_same_postcode',
											value: samePostcode
										});
									
										if(samePostcode)
											{		
												// if avsStreet/avsZip/csc = true and decision = ACCEPT
										    	if (paymentResults.avsStreet == true && paymentResults.avsZip == true && paymentResults.csc == true && paymentResults.decision == 'ACCEPT')
										    		{
										    			if(use3DSecure) // 3D secure enabled
										    				{
												    			if ((paymentResults.eciRaw == 05 || paymentResults.eciRaw == 02) && paymentResults.paresStatus == 'Y' && paymentResults.reasonCode == 100)
												    				{
																    	// set the 3D secure checkbox on the sales order record
												    					salesOrder.setValue({
																    		fieldId: 'custbody_bbs_payment_3d_secure',
																    		value: true
																    	});
												    		
														    			// set paymentApproval to true
														    			paymentApproval = true;
												    				}
										    				}
										    			else
										    				{
											    				// set paymentApproval to true
												    			paymentApproval = true;
										    				}
										    		}
											}
									}
						    }
					    	
						// call function to check if the order passes Universal Business Rules
						passedBusinessRules = libraryScript.checkUniversalBusinessRules(salesOrder);
						    	
						// call function to check if all items are in stock
						allItemsInStock = libraryScript.checkStockLevels(salesOrder);
					    	
						// set the approval checkboxes on the sales order record
						salesOrder.setValue({
							fieldId: 'custbody_bbs_passed_payment_approval',
							value: paymentApproval
						});
					    	
						salesOrder.setValue({
							fieldId: 'custbody_bbs_passed_uni_business_rules',
							value: passedBusinessRules
						});
					    	
						salesOrder.setValue({
							fieldId: 'custbody_bbs_all_items_in_stock',
							value: allItemsInStock
						});
					   
						salesOrder.setValue({
							fieldId: 'custbody_bbs_stock_last_checked',
							value: new Date() // today's date'
						});
					    	
						// if all checks have passed
						if (paymentApproval == true && passedBusinessRules == true)
							{
							   	// set the sales order's status to Pending Fulfilment
								salesOrder.setValue({
									fieldId: 'orderstatus',
									value: 'B' // B = Pending Fulfilment
								});
										
								// tick the 'System Approved' checkbox
								salesOrder.setValue({
									fieldId: 'custbody_bbs_system_approved',
									value: true
								});
										
								// tick the 'Can Be Fulfilled' checkbox on the sales order record
								salesOrder.setValue({
									fieldId: 'custbody_canbefulfilled',
									value: true
								});
						   }
					   
						// save the changes to the sales order record
						salesOrder.save({
						   ignoreMandatoryFields: true
						});

    				}	
    		}
    }    

    return {
        afterSubmit: afterSubmit
    };
    
});
