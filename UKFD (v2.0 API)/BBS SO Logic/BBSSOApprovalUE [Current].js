/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSSOApprovalLibrary', 'N/runtime', 'N/search', 'N/record'],
function(libraryScript, runtime, search, record) {
   
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
    					scriptContext.form.clientScriptFileId = 9933161;
    					
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
				    	// retrieve script parameters
    					var webRep = runtime.getCurrentScript().getParameter({
    						name: 'custscript_bbs_so_approval_web_sales_rep'
    					});
    				
    					// get the customer type
				    	var customerType = currentRecord.getValue({
				    		fieldId: 'custbody_customertype'
				    	});
				    	
				    	// get the payment method of the order
						var paymentMethod = currentRecord.getValue({
							fieldId: 'paymentmethod'
						});
						
						// get the lead source
		    			var leadSource = currentRecord.getValue({
		    				fieldId: 'leadsource'
		    			});
						
						// get the sales rep
						var salesRep = currentRecord.getValue({
							fieldId: 'salesrep'
						});
						    	
						// if the customerType is 1 (General)
						if (customerType == 1)
						    {
								// if paymentMethod is 16 (PayPal (UKFD Site))
								if (paymentMethod == 16)
									{
										// set paymentApproval to true
								    	paymentApproval = true;
									}
								else if (paymentMethod == 13 || paymentMethod == 14) // if paymentMethod is 13 (VISA) or 14 (Master Card)
									{
										// call function to retrieve 3D secure results
										var paymentResults = libraryScript.return3DSecureResults(currentRecord);
										
										// call function to check if the billing/shipping address postcodes are the same
										var samePostcode = libraryScript.checkPostcodes(currentRecord);
										    			
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
										
										currentRecord.setValue({
											fieldId: 'custbody_bbs_payment_same_postcode',
											value: samePostcode
										});
										
										if (((paymentMethod == 13 && paymentResults.eciRaw == 05) || (paymentMethod == 14 && paymentResults.eciRaw == 02)) && paymentResults.paresStatus == 'Y' && paymentResults.reasonCode == 100 && paymentResults.decision == 'ACCEPT')
											{
												// set the 3D secure checkbox on the record
										    	currentRecord.setValue({
										    		fieldId: 'custbody_bbs_payment_3d_secure',
										    		value: true
										    	});
											
												// set paymentApproval to true
								    			paymentApproval = true;
											}
										else if (paymentResults.avsStreet == true && paymentResults.avsZip == true && paymentResults.csc == true && samePostcode == true && paymentResults.decision == 'ACCEPT')
											{
												// set paymentApproval to true
								    			paymentApproval = true;
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
						    	
						   // if all checks have passed and the leadSource is -6 (Web) and salesRep is webRep
						   if (paymentApproval == true && passedBusinessRules == true && leadSource == -6 && salesRep == webRep)
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
						    	}
						   
						   // save the changes to the sales order record
						   currentRecord.save({
							   ignoreMandatoryFields: true
						   });
						   
						   // if all checks have been passed, the leadSource is -6 (Web) and salesRep is webRep
						   if (paymentApproval == true && passedBusinessRules == true && leadSource == -6 && salesRep == webRep)
							   {
								   	// call function to transform the sales order into a cash sale
									var cashSaleID = libraryScript.transformToCashSale(currentRecordID);
									
									// if we have been able to create a cash sale
									if (cashSaleID)
										{
											// call function to send Ekomi email
											libraryScript.sendEkomiFeedbackEmail(cashSaleID);
										}
							   }
    				}
    		}

    }    

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
    
});
