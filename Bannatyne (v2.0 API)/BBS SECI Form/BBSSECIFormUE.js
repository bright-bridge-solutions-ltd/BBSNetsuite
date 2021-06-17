/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
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
	    		// retrieve script parameters
    			var currentScript = runtime.getCurrentScript();
    			
    			var approvalRole = currentScript.getParameter({
    				name: 'custscript_bbs_seci_approval_role'
    			});
    			
    			var approvalUser = currentScript.getParameter({
    				name: 'custscript_bbs_seci_approval_user'
    			});
    		
    			// get the current user's role and id
    			var userRole 	= runtime.getCurrentUser().role;
    			var userID		= runtime.getCurrentUser().id;

    			// get the current record
				var currentRecord = scriptContext.newRecord;
				
				// get the value of the 'Approval Status' field
				var approvalStatus = currentRecord.getValue({
					fieldId: 'custrecord_bbs_seci_site_approval_status'
				});
				
				// if the approvalStatus is 2 (Pending Approval) and approvalRole = userRole OR userRole = 3 (Administrator) OR approvalUser = userID
				if (approvalStatus == 2 && (approvalRole == userRole || userRole == 3 || approvalUser == userID))
					{
						// get ID of current record
		        		var recordID = currentRecord.id;
		        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 408492;
			        	
			        	// add buttons to the form
			        	scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Rejected',
			    			functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
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
    	
    	// check the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the approval status from the old/new versions of the record
    			var oldStatus = scriptContext.oldRecord.getValue({
    				fieldId: 'custrecord_bbs_seci_site_approval_status'
    			});
    			
    			var status = scriptContext.newRecord.getValue({
    				fieldId: 'custrecord_bbs_seci_site_approval_status'
    			});
    			
    			// if the status has changed from Pending Approval(2) to Approved(1)
    			if (oldStatus == 2 && status == 1)
    				{
	    				// declare and initialize variables
	        			var subsidiaries = new Array();
    				
    					// call function to retrieve script parameters
    					var scriptParameters = getScriptParameters();
    				
    					// get the current record
    					var currentRecord = scriptContext.newRecord;
    					
    					// get the list of locations
						var locations = currentRecord.getValue({
							fieldId: 'custrecord_bbs_seci_site_location'
						});
    					
    					// first check if we can already find an existing supplier for the email address and phone number
    					var supplierID = findSupplier(currentRecord);
    					
    					// if we have not been able to find an existing supplier
    					if (supplierID == null)
    						{
		    					// loop through locations
		    					for (var i = 0; i < locations.length; i++)
		    						{
		    							// call function to get the subsidiary from the location record
		    							var subsidiaryID = getLocationSubsidiary(locations[i]);
		    							
		    							// if the subsidiary does not already exist in the subsidiaries array
		    							if (subsidiaries.indexOf(subsidiaryID) == -1)
		    								{
		    									// push the subsidiary ID to the subsidiaries array
		    									subsidiaries.push(subsidiaryID);
		    								}
		    						}
		    					
		    					try
		    						{
		    							// create a new supplier record
		    							var supplierRec = record.create({
		    								type: record.Type.VENDOR,
		    								isDynamic: true,
		    								defaultValues: {
		    									customform: scriptParameters.customForm
		    								}
		    							});
		    							
		    							// loop through subsidiaries array
		    							for (var x = 0; x < subsidiaries.length; x++)
		    								{
		    									// if this is the first subsidiary
												if (x == 0)
													{
														// set the subsidiary field
														supplierRec.setValue({
															fieldId: 'subsidiary',
															value: subsidiaries[x]
														});
													}
												else
													{
														// add a new line in the subsidiaries sublist
				    									supplierRec.selectNewLine({
				    										sublistId: 'submachine'
				    									});
				    									
				    									supplierRec.setCurrentSublistValue({
				    										sublistId: 'submachine',
				    										fieldId: 'subsidiary',
				    										value: subsidiaries[x]
				    									});
				    									
				    									supplierRec.commitLine({
				    										sublistId: 'submachine'
				    									});
													}
		    								}
		    							
		    							supplierRec.setValue({
		    								fieldId: 'isperson',
		    								value: 'T'
		    							});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'custentity_2663_payment_method',
		    								value: true
		    							});
		    							
		    							supplierRec.setValue({
		    		    					fieldId: 'emailtransactions',
		    		    					value: true
		    		    				});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'firstname',
		    								value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_first_name'
		    								})
		    							});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'lastname',
		    								value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_surname'
		    								})
		    							});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'companyname',
		    								value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_company_name'
		    								})
		    							});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'category',
		    								value: scriptParameters.category  							
		    							});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'email',
		    								value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_email'
		    								})
		    							});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'phone',
		    								value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_phone'
		    								})
		    							});
		    							
		    							supplierRec.setValue({
		    		    					fieldId: 'terms',
		    		    					value: scriptParameters.paymentTerms
		    		    				});
		    							
		    							supplierRec.setValue({
		    								fieldId: 'openingbalanceaccount',
		    								value: scriptParameters.openingBalanceAccount
		    							});
		    		    				
		    							supplierRec.setValue({
		    		    					fieldId: 'accountnumber',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'name'
		    								})
		    		    				});
		    							
		    							supplierRec.setValue({
		    		    					fieldId: 'vatregnumber',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_vat'
		    								})
		    		    				});
		    							
		    							// add a new line to the address sublist
		    							supplierRec.selectNewLine({
		    		    					sublistId: 'addressbook'
		    		    				});
		    		    				
		    		    				// select the address subrecord
		    		    				var addressSubrecord = supplierRec.getCurrentSublistSubrecord({
		    		    				    sublistId: 'addressbook',
		    		    				    fieldId: 'addressbookaddress'
		    		    				});
		    		    				
		    		    				// set fields on the sublist record
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'defaultbilling',
		    		    					value: true
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'defaultshipping',
		    		    					value: true
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'attention',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_first_name'
		    								}) + ' ' + currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_surname'
		    								})
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'addressee',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_company_name'
		    								})
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'addr1',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_address_1'
		    								})
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'addr2',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_address_2'
		    								})
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'city',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_city'
		    								})
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'state',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_county'
		    								})
		    		    				});
		    		    				
		    		    				addressSubrecord.setValue({
		    		    					fieldId: 'zip',
		    		    					value: currentRecord.getValue({
		    									fieldId: 'custrecord_bbs_seci_site_postcode'
		    								})
		    		    				});
		    		    				
		    		    				// commit the new address line
		    		    				supplierRec.commitLine({
		    								sublistId: 'addressbook'
		    							});
		    		    				
		    		    				// submit the new supplier record
		    			    			supplierID = supplierRec.save({
		    			    				enableSourcing: false,
		    					    		ignoreMandatoryFields: true
		    			    			});
		    			    			
		    			    			log.audit({
		    								title: 'Supplier Record Created Successfully',
		    								details: 'SECI Site: ' + currentRecord.id + '<br>Supplier ID: ' + supplierID
		    							});
		    						}
		    					catch(e)
		    						{
		    							log.error({
		    								title: 'Error Creating Supplier Record',
		    								details: 'SECI Site: ' + currentRecord.id + '<br>Error: ' + e.message
		    							});
		    						}
		    					
		    					// if we have been able to create the supplier
		    					if (supplierID)
		    						{
		    							try
		    								{
				    							// create a new 'Entity Bank Details' record
				    			    			var bankDetailsRecord = record.create({
				    			    				type: 'customrecord_2663_entity_bank_details'
				    			    			});
				    			    			
				    			    			bankDetailsRecord.setValue({
				    			    				fieldId: 'custrecord_2663_parent_vendor',
				    			    				value: supplierID
				    			    			});
				    			    			
				    			    			var companyName = currentRecord.getValue({
			    									fieldId: 'custrecord_bbs_seci_site_company_name'
			    								});
				    			    			
				    			    			if (companyName)
				    			    				{
						    			    			bankDetailsRecord.setValue({
						    			    				fieldId: 'name',
						    			    				value: companyName
						    			    			});
				    			    				}
				    			    			else
				    			    				{
					    			    				bankDetailsRecord.setValue({
						    			    				fieldId: 'name',
						    			    				value: currentRecord.getValue({
						    									fieldId: 'custrecord_bbs_seci_site_first_name'
						    								}) + ' ' + currentRecord.getValue({
						    									fieldId: 'custrecord_bbs_seci_site_surname'
						    								})
						    			    			});
				    			    				}
				    			    			
				    			    			bankDetailsRecord.setValue({
				    			    				fieldId: 'custrecord_2663_entity_file_format',
				    			    				value: 67 // 67 = BACS Bank of Scotland without transaction REF
				    			    			});
				    			    			
				    			    			bankDetailsRecord.setValue({
				    			    				fieldId: 'custrecord_2663_entity_bank_type',
				    			    				value: 1 // 1 = Primary
				    			    			});
				    			    			
				    			    			bankDetailsRecord.setValue({
				    			    				fieldId: 'custrecord_2663_entity_acct_no',
				    			    				value: currentRecord.getValue({
				    			    					fieldId: 'custrecord_bbs_seci_site_bank_acc_no'
				    			    				})
				    			    			});
				    			    			
				    			    			bankDetailsRecord.setValue({
				    			    				fieldId: 'custrecord_2663_entity_acct_name',
				    			    				value: currentRecord.getValue({
				    			    					fieldId: 'custrecord_bbs_seci_site_bank_acc_name'
				    			    				})
				    			    			});
				    			    			
				    			    			bankDetailsRecord.setValue({
				    			    				fieldId: 'custrecord_2663_entity_branch_no',
				    			    				value: currentRecord.getValue({
				    			    					fieldId: 'custrecord_bbs_seci_site_acc_sort'
				    			    				})
				    			    			});
				    			    			
				    			    			bankDetailsRecord.setValue({
				    			    				fieldId: 'custrecord_2663_entity_payment_desc',
				    			    				value: 'Bannatyne ' + currentRecord.getValue({
				    									fieldId: 'name'
				    								})
				    			    			});
				    			    			
				    			    			// save the bankDetailsRecord
				    			    			bankDetailsRecord.save();
				    			    			
				    			    			log.audit({
				    			    				title: 'Bank Details Record Created',
				    			    				details: 'SECI Site: ' + currentRecord.id + '<br>Supplier ID: ' + supplierID
				    			    			});
		    								}
		    							catch(e)
		    								{
		    									log.error({
		    										title: 'Error Creating Bank Details Record',
		    										details: 'SECI Site: ' + currentRecord.id + '<br>Supplier ID: ' + supplierID + '<br>Error: ' + e.message
		    									});
		    								}
		    						}
    						}
    					
    					// update the created supplier field on the SECI form
						record.submitFields({
							type: 'customrecord_bbs_seci_site_form',
							id: currentRecord.id,
							values: {
								custrecord_bbs_seci_site_supplier_record: supplierID
							}
						});
    				}
    			// if the record is Approved(1)
    			else if (status == 1)
    				{
    					// declare and initialize variables
        				var subsidiaries 		= new Array();
        				var addedSubsidiaries 	= new Array();
    				
    					// get the current record
						var currentRecord = scriptContext.newRecord;
						
						// get the list of locations
						var locations = currentRecord.getValue({
							fieldId: 'custrecord_bbs_seci_site_location'
						});
						
						// get the ID of the linked supplier
						var supplierID = currentRecord.getValue({
							fieldId: 'custrecord_bbs_seci_site_supplier_record'
						});
						
						// if we have a supplier ID
						if (supplierID)
							{
								// loop through locations
		    					for (var i = 0; i < locations.length; i++)
		    						{
		    							// call function to get the subsidiary from the location record
		    							var subsidiaryID = getLocationSubsidiary(locations[i]);
		    							
		    							// if the subsidiary does not already exist in the subsidiaries array
		    							if (subsidiaries.indexOf(subsidiaryID) == -1)
		    								{
		    									// push the subsidiary ID to the subsidiaries array
		    									subsidiaries.push(subsidiaryID);
		    								}
		    						}
		    					
		    					try
		    						{
		    							// load the supplier record
		    							var supplierRec = record.load({
		    								type: record.Type.VENDOR,
		    								id: supplierID,
		    								isDynamic: true
		    							});
		    							
		    							// get count of subsidiaries
		    							var subsidiaryCount = supplierRec.getLineCount({
		    								sublistId: 'submachine'
		    							});
		    							
		    							// loop through subsidiaries array
		    							for (var i = 0; i < subsidiaries.length; i++)
		    								{
			    								// declare and initialize variables
		    									var addSubsidiary = true;
		    								
		    									// loop through subsidiaryCount
				    							for (var x = 0; x < subsidiaryCount; x++)
				    								{
				    									// get the subsidiary ID from the line
				    									var subsidiaryID = supplierRec.getSublistValue({
				    										sublistId: 'submachine',
				    										fieldId: 'subsidiary',
				    										line: x
				    									});
				    									
				    									if (subsidiaryID == subsidiaries[i])
				    										{
				    											// set addSubsidiary to false
				    											addSubsidiary = false;
				    											
				    											// break the loop
				    											break;
				    										}
				    								}
				    							
				    							// if we need to add the subsidiary to the supplier
				    							if (addSubsidiary == true)
				    								{
					    								// add the subsidiary to the addedSubsidiaries array
				    									addedSubsidiaries.push(subsidiaries[i])
				    								
				    									// add a new line in the subsidiaries sublist
				    									supplierRec.selectNewLine({
				    										sublistId: 'submachine'
				    									});
				    									
				    									supplierRec.setCurrentSublistValue({
				    										sublistId: 'submachine',
				    										fieldId: 'subsidiary',
				    										value: subsidiaries[i]
				    									});
				    									
				    									supplierRec.commitLine({
				    										sublistId: 'submachine'
				    									});
				    								}
		    								}
		    							
		    							// have we added any subsidiaries
		    							if (addedSubsidiaries.length > 0)
		    								{
		    									// save the changes to the supplier record
		    									supplierRec.save();
		    									
		    									log.audit({
		    										title: 'Subsidiaries Added to Supplier',
		    										details: 'The following subsidiaries have been added to supplier ' + supplierID + '<br>Subsidiaries: ' + addedSubsidiaries.toString()
		    									});
		    								}
		    						}
		    					catch(e)
		    						{
			    						log.error({
											title: 'Error Adding Subsidiaries to Supplier',
											details: 'The following subsidiaries could not be added to supplier ' + supplierID + '<br>Subsidiaries: ' + addedSubsidiaries.toString() + '<br>Error: ' + e.message
										});
		    						}
							}
    				}
    		}

    }
    
    // ======================================
    // FUNCTION TO RETRIEVE SCRIPT PARAMETERS
    // ======================================
    
    function getScriptParameters() {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var category = currentScript.getParameter({
    		name: 'custscript_bbs_seci_supplier_def_cat'
    	});
    	
    	var openingBalanceAccount = currentScript.getParameter({
    		name: 'custscript_bbs_seci_supp_open_bal_acc'
    	});
    	
    	var paymentTerms = currentScript.getParameter({
    		name: 'custscript_bbs_seci_supplier_def_terms'
    	});
    	
    	var customForm = currentScript.getParameter({
    		name: 'custscript_bbs_seci_supplier_form'
    	});
    	
    	// return values to main script function
    	return {
    		category:				category,
    		openingBalanceAccount:	openingBalanceAccount,
    		paymentTerms:			paymentTerms,
    		customForm:				customForm
    	}
    	
    }
    
    // ===========================================
    // FUNCTION TO SEARCH FOR AN EXISTING SUPPLIER
    // ===========================================
    
    function findSupplier(seciSiteRecord) {
		
    	// declare and initialize variables
		var supplierID = null;
		
		// get field values from the seciSiteRecord object
		var email = seciSiteRecord.getValue({
			fieldId: 'custrecord_bbs_seci_site_email'
		});
		
		var phone = seciSiteRecord.getValue({
			fieldId: 'custrecord_bbs_seci_site_phone'
		});

		// run search to find suppliers for this email address or phone number
		search.create({
			type: search.Type.VENDOR,
			
			filters: [
		            ['isinactive', 'is', 'F'],
		            	'AND',
		            [
		              	['email', 'is', email],
		              	'OR',
		              	['phone', 'contains', phone]
		          	]
		             
		          ],
		
			columns: [{
				name: 'internalid'
			}],
			
		}).run().each(function(result){
			
			// get the internal ID of the supplier from the search
			supplierID = result.getValue({
				name: 'internalid'
			});
			
		});
		
		// return supplierID variable
		return supplierID;
	
	}
    
    // =======================================================
    // FUNCTION TO GET THE SUBSIDIARY FROM THE LOCATION RECORD
    // =======================================================
    
    function getLocationSubsidiary(locationID) {
    	
    	// load the location record and return the subsidiary ID to the main script function
    	return record.load({
    		type: record.Type.LOCATION,
    		id: locationID
    	}).getValue({
    		fieldId: 'subsidiary'
    	});
    	
    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
    
});
