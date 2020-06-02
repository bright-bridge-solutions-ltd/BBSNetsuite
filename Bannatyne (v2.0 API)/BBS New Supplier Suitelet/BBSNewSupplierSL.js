/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/record', 'N/search', 'N/email'],
function(runtime, ui, record, search, email) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method === 'GET')
			{
				// retrieve parameters that have been passed to the page
    			var supplierRecordID = context.request.parameters.record;
    		
    			// create form
				var form = ui.createForm({
	                title: 'Bannatyne - Supplier Bank Details',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = '406471';
				
				// add cancel button to the form
   		 		form.addButton({
   		 			id: 'custpage_cancel_button',
   		 			label: 'Close Page',
   		 			functionName: 'cancelButton()'
   		 		});
   		 		
   		 		// add field groups to the form
   		 		form.addFieldGroup({
   		 			id: 'header',
   		 			label: ' '
   		 		});
   		 		
	   		 	form.addFieldGroup({
	   		 		id: 'termsandconditions',
	   		 		label: 'Terms & Conditions'
	   		 	});
   		 		
   		 		form.addFieldGroup({
		 			id: 'bankdetails',
		 			label: 'Bank Details'
		 		});
   		 		
	   		 	form.addFieldGroup({
		 			id: 'creditcontrollerdetails',
		 			label: 'Credit Controller Details'
		 		});
				
				// add logo inline HTML field to the form
				var pageLogo = form.addField({
				    id: 'custpage_pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image',
					container: 'header'
				});
				
				// set default value of the pageLogo field
				pageLogo.defaultValue = "<img src='https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&c=4537381_SB1&h=7a14b6798dff769d5845' alt='Bannatyne Logo' style='width: 226px; height: 48px;'>";

				// add fields to the form to display supplier information
				var supplierRecordField = form.addField({
					id: 'custpage_supplier_record',
					type: ui.FieldType.INTEGER,
					label: 'Supplier Record',
					container: 'header'
				});
				
				supplierRecordField.updateDisplayType({
				    displayType : ui.FieldDisplayType.HIDDEN
				});
				
				var supplierNameField = form.addField({
					id: 'custpage_supplier_name',
					type: ui.FieldType.TEXT,
					label: 'Supplier Name',
					container: 'header'
				});
				
				supplierNameField.updateDisplayType({
				    displayType : ui.FieldDisplayType.INLINE
				});
				
				// check if the supplierRecordID parameter returns a value
				if (supplierRecordID)
					{
						// set supplier record field on the form
						supplierRecordField.defaultValue = supplierRecordID;
					
						// load the supplier setup request record
						var supplierRecord = record.load({
							type: 'customrecord_tbg_supp_entry',
							id: supplierRecordID
						});
						
						// retrieve values from the supplierRecord object
						var supplierName = supplierRecord.getValue({
							fieldId: 'altname'
						});
						
						var paymentTerms = supplierRecord.getText({
							fieldId: 'custrecord_tbg_supp_entry_pay_terms_give'
						});
							
						// set supplier name field on the form
						supplierNameField.defaultValue = supplierName;
						
						// add help inline HTML field to the form
						var helpText = form.addField({
							id: 'custpage_helptext',
							type: ui.FieldType.INLINEHTML,
							label: 'Help Text',
							container: 'header'
						});
						
						// set default value of the helpText field
						helpText.defaultValue = "<p><span style='font-size:20px;'><span style='font-family:arial,helvetica,sans-serif;'>Please use this form to enter your bank details and click 'Submit' once done.</span></span></p>";
						
						helpText.updateBreakType({
						    breakType : ui.FieldBreakType.STARTCOL
						});
						
						// add a field to the form to display the supplier's payment terms
						form.addField({
							id: 'custpage_payment_terms',
							type: ui.FieldType.INLINEHTML,
							label: 'Payment Terms',
							container: 'header'
						}).defaultValue = "<br><p><span style='font-size:16px;'><span style='font-family:arial,helvetica,sans-serif;'>Your payment terms will be <span style='color:#FF0000;'><b>" + paymentTerms + "</b></span> end of month</span></p>";
						
						// ===========================
						// TERMS AND CONDITIONS FIELDS
						// ===========================
						
						form.addField({
							id: 'custpage_terms_accepted',
							type: ui.FieldType.CHECKBOX,
							label: 'Bannatyne Terms and Conditions Accepted',
							container: 'termsandconditions'
						});
				
						// ===================
						// BANK DETAILS FIELDS
						// ===================
						
						form.addField({
							id: 'custpage_accountholdername',
							type: ui.FieldType.TEXT,
							label: 'Name of Account Holder',
							container: 'bankdetails'
						}).isMandatory = true;
						
						form.addField({
							id: 'custpage_accountnumber',
							type: ui.FieldType.TEXT,
							label: 'Account Number',
							container: 'bankdetails'
						}).isMandatory = true;
						
						form.addField({
							id: 'custpage_sortcode',
							type: ui.FieldType.TEXT,
							label: 'Sort Code',
							container: 'bankdetails'
						}).isMandatory = true;
						
						form.addField({
							id: 'custpage_payment_notification_email',
							type: ui.FieldType.EMAIL,
							label: 'Email Address for Payment Notification',
							container: 'bankdetails'
						}).isMandatory = true;
						
						form.addField({
							id: 'custpage_vat_number',
							type: ui.FieldType.TEXT,
							label: 'VAT Number',
							container: 'bankdetails'
						});
						
						// ========================
						// CREDIT CONTROLLER FIELDS
						// ========================
						
						form.addField({
							id: 'custpage_credit_controller_first_name',
							type: ui.FieldType.TEXT,
							label: 'First Name',
							container: 'creditcontrollerdetails'
						});
						
						form.addField({
							id: 'custpage_credit_controller_surname',
							type: ui.FieldType.TEXT,
							label: 'Surname',
							container: 'creditcontrollerdetails'
						});
						
						form.addField({
							id: 'custpage_credit_controller_job_title',
							type: ui.FieldType.TEXT,
							label: 'Job Title',
							container: 'creditcontrollerdetails'
						});
						
						form.addField({
							id: 'custpage_credit_controller_email',
							type: ui.FieldType.EMAIL,
							label: 'Email Address',
							container: 'creditcontrollerdetails'
						});
						
						form.addField({
							id: 'custpage_credit_controller_phone',
							type: ui.FieldType.PHONE,
							label: 'Phone Number',
							container: 'creditcontrollerdetails'
						});
						
						// add submit button to the form
		   		 		form.addSubmitButton({
		   		 			label : 'Submit'
		   		 		});
					}
				
				// write the response to the page
				context.response.writePage(form);
			}
    	else if (context.request.method === 'POST')
    		{
    			// create form
				var form = ui.createForm({
	                title: 'Supplier Bank Details',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 406356;
				
				// add cancel button to the form
   		 		form.addButton({
   		 			id: 'custpage_cancel_button',
   		 			label: 'Close Page',
   		 			functionName: 'cancelButton()'
   		 		});
				
				// add logo inline HTML field to the form
				var pageLogo = form.addField({
				    id: 'custpage_pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				// set default value of the pageLogo field
				pageLogo.defaultValue = "<img src='https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&c=4537381_SB1&h=7a14b6798dff769d5845' alt='Bannatyne Logo' style='width: 226px; height: 48px;'>";
				
				// add help inline HTML field to the form
				var helpText = form.addField({
					id: 'custpage_helptext',
					type: ui.FieldType.INLINEHTML,
					label: 'Help Text'
				});
				
				helpText.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				
				// retrieve script parameters. Parameters are global variables so can be accessed throughout the script
				var currentScript = runtime.getCurrentScript();
				
				payablesAccount = currentScript.getParameter({
			    	name: 'custscript_bbs_new_supp_sl_pay_acc'
			    });
				
				fileFormat = currentScript.getParameter({
					name: 'custscript_bbs_new_supp_sl_pay_file_form'
				});
				
				emailRecipient = currentScript.getParameter({
					name: 'custscript_bbs_new_sup_sl_item_email_rec'
				});
				
				emailSender = currentScript.getParameter({
					name: 'custscript_bbs_new_sup_sl_item_email_sen'
				});
    		
    			// retrieve field values from the form
    			var supplierRequestRecordID 	= context.request.parameters.custpage_supplier_record;
    			var companyName 				= context.request.parameters.custpage_supplier_name;
    			var nameOfAccountHolder			= context.request.parameters.custpage_accountholdername;
    			var accountNumber				= context.request.parameters.custpage_accountnumber;
    			var sortCode					= context.request.parameters.custpage_sortcode;
    			var emailForPaymentNotificaton	= context.request.parameters.custpage_payment_notification_email;
    			var vatNumber					= context.request.parameters.custpage_vat_number;
    			var creditControllerFirstName	= context.request.parameters.custpage_credit_controller_first_name;
    			var creditControllerSurname		= context.request.parameters.custpage_credit_controller_surname;
    			var creditControllerJobTitle	= context.request.parameters.custpage_credit_controller_job_title;
    			var creditControllerEmail		= context.request.parameters.custpage_credit_controller_email;
    			var creditControllerPhone		= context.request.parameters.custpage_credit_controller_phone;
    			
    			// call function to create a new supplier record
    			var supplierID = createSupplier(supplierRequestRecordID, companyName, emailForPaymentNotificaton, vatNumber);
    			
    			// have we been able to create a supplier record?
    			if (supplierID)
    				{
	    				// submit the supplier field on the supplier request record
		    			record.submitFields({
		    				type: 'customrecord_tbg_supp_entry',
		    				id: supplierRequestRecordID,
		    				values: {
		    					custrecord_tbg_supp_entry_supp_rec: supplierID,
		    					custrecord_tbg_supp_entry_terms_accepted: true
		    				}
		    			});
    				
    					// call function to create bank details for the new supplier
		    			createBankDetails(supplierID, companyName, nameOfAccountHolder, accountNumber, sortCode);
		    			
		    			// call function to add the new supplier to the vendors sublist on the item record. Pass itemSupplied and supplierID variables.
		    			updateItemRecord(supplierRequestRecordID, supplierID);

		    			// have we got credit controller information?
    					if (creditControllerFirstName)
    						{
    							// call function to create a new supplier contact
    							createSupplierContact(supplierID, creditControllerFirstName, creditControllerSurname, creditControllerJobTitle, creditControllerEmail, creditControllerPhone);
    						}
    					
    					// set default value of the helpText field
						helpText.defaultValue = "<p><span style='color:#008000;'><strong>Thankyou, your bank details have been submitted successfully.</strong></span></p><br><p><span style='color:#008000;'><strong>You may now close the page.</strong></span></p>"
    				}
    			else
    				{
    					// set default value of the helpText field
						helpText.defaultValue = "<p><span style='color:#FF0000;'><strong>Unfortunately, an error occurred submitting your bank details. Please try again and contact support if the error persists</strong></span></p>"
    				}
				
				// write the response to the page
				context.response.writePage(form);
				
    		}
    }

    // ========================================
    // FUNCTION TO CREATE A NEW SUPPLIER RECORD
    // ========================================
    
    function createSupplier(supplierRequestRecordID, companyName, emailForPaymentNotificaton, vatNumber)
    	{
	    	// declare and initialize variables
    		var supplierID = null;
    	
    		// load the supplier setup request record
			var supplierRequestRecord = record.load({
				type: 'customrecord_tbg_supp_entry',
				id: supplierRequestRecordID
			});
			
			// get field values from the supplierRequestRecord object
			var subsidiary = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_primary_sub'
			});
			
			var email = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_email'
			});
				
			var phone = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_phone'
			});
			
			var address1 = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_address_1'
			});
			
			var address2 = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_address_2'
			});
			
			var city = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_city'
			});
			
			var county = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_county'
			});
			
			var postcode = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_postcode'
			});
			
			var terms = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_pay_terms_give'
			});
			
			var sendViaEmail = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_send_via_email'
			});
			
			var classification = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_vat_class'
			});
			
			var category = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_category'
			});
			
			var siteCanRaiseWithoutRequisition = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_site_raise_po'
			});
			
			var itemSupplied = supplierRequestRecord.getValue({
				fieldId: 'custrecord_tbg_supp_entry_item'
			});
			
			try
				{
					// create a new supplier record
					var supplierRecord = record.create({
						type: record.Type.VENDOR,
						isDynamic: true
					});
					
					// set fields on the new supplier record
					supplierRecord.setValue({
						fieldId: 'isperson',
						value: 'F'
					});
					
					supplierRecord.setValue({
						fieldId: 'subsidiary',
						value: subsidiary
					});
					
					supplierRecord.setValue({
						fieldId: 'companyname',
						value: companyName
					});
					
					supplierRecord.setValue({
						fieldId: 'email',
						value: email
					});
					
					supplierRecord.setValue({
						fieldId: 'phone',
						value: phone
					});
					
					supplierRecord.setValue({
						fieldId: 'category',
						value: category
					});
					
					supplierRecord.setValue({
						fieldId: 'custentitycustentityfieldban_vat_class',
						value: classification
					});
					
					supplierRecord.setValue({
						fieldId: 'terms',
						value: terms
					})
					
					supplierRecord.setValue({
						fieldId: 'openingbalanceaccount',
						value: payablesAccount
					});
					
					supplierRecord.setValue({
						fieldId: 'custentity_2663_payment_method',
						value: true
					});
					
					supplierRecord.setValue({
						fieldId: 'custentity_bbs_sites_raise_po_without_rq',
						value: siteCanRaiseWithoutRequisition
					});
					
					supplierRecord.setValue({
						fieldId: 'emailtransactions',
						value: sendViaEmail
					});
					
					supplierRecord.setValue({
						fieldId: 'custentity_2663_email_address_notif',
						value: emailForPaymentNotificaton
					});
					
					supplierRecord.setValue({
						fieldId: 'vatregnumber',
						value: vatNumber
					});
					
					supplierRecord.setValue({
						fieldId: 'custentity_tbg_terms_conditions_accept',
						value: true
					});
					
					// add a new line to the address sublist
					supplierRecord.selectNewLine({
						sublistId: 'addressbook'
					});
					
					// select the address subrecord
					var addressSubrecord = supplierRecord.getCurrentSublistSubrecord({
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
						fieldId: 'addr1',
						value: address1
					});
					
					addressSubrecord.setValue({
						fieldId: 'addr2',
						value: address2
					});
					
					addressSubrecord.setValue({
						fieldId: 'city',
						value: city
					});
					
					addressSubrecord.setValue({
						fieldId: 'state',
						value: county
					});
					
					addressSubrecord.setValue({
						fieldId: 'zip',
						value: postcode
					});
					
					// commit the new address line
					supplierRecord.commitLine({
						sublistId: 'addressbook'
					});
					
					// submit the new supplier record
	    			supplierID = supplierRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'Supplier Record Created',
	    				details: supplierID
	    			});
	    		}
			catch(e)
				{
					log.error({
						title: 'Error Creating Supplier Record',
						details: e
					});
				}
			
			return supplierID;
    	}
    
    // ================================================
    // FUNCTION TO CREATE A NEW SUPPLIER CONTACT RECORD
    // ================================================
    
    function createSupplierContact(supplierID, creditControllerFirstName, creditControllerSurname, creditControllerJobTitle, creditControllerEmail, creditControllerPhone)
    	{
    		try
    			{
    				// create a new contact record
    				var contactRecord = record.create({
    					type: record.Type.CONTACT,
    					isDynamic: true
    				});
    				
    				// set fields on the new contact record
    				contactRecord.setValue({
    					fieldId: 'company',
    					value: supplierID
    				});
    				
    				contactRecord.setValue({
    					fieldId: 'firstname',
    					value: creditControllerFirstName
    				});
    				
    				contactRecord.setValue({
    					fieldId: 'lastname',
    					value: creditControllerSurname
    				});
    				
    				contactRecord.setValue({
    					fieldId: 'title',
    					value: creditControllerJobTitle
    				});
    				
    				contactRecord.setValue({
    					fieldId: 'email',
    					value: creditControllerEmail
    				});
    				
    				contactRecord.setValue({
    					fieldId: 'phone',
    					value: creditControllerPhone
    				});
    				
    				// save the contact record
    				var contactID = contactRecord.save({
    					enableSourcing: false,
    			    	ignoreMandatoryFields: true
    				});
    				
    				log.audit({
    					title: 'Supplier Contact Record Created',
    					details: contactID
    				});
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Creating Supplier Contact Record',
    					details: e
    				});
    			}
    	}
    
    // ========================================
    // FUNCTION TO CREATE A BANK DETAILS RECORD
    // ========================================
    
    function createBankDetails(supplierID, companyName, nameOfAccountHolder, accountNumber, sortCode)
    	{
    		try
    			{
			    	// create a new 'Entity Bank Details' record
					var bankDetailsRecord = record.create({
						type: 'customrecord_2663_entity_bank_details'
					});
					
					bankDetailsRecord.setValue({
						fieldId: 'custrecord_2663_entity_file_format',
						value: fileFormat
					});
					
					// set fields on the new bank details record
					bankDetailsRecord.setValue({
						fieldId: 'custrecord_2663_parent_vendor',
						value: supplierID
					});
					
					bankDetailsRecord.setValue({
						fieldId: 'name',
						value: companyName
					});
					
					bankDetailsRecord.setValue({
						fieldId: 'custrecord_2663_entity_bank_type',
						value: 1 // 1 = Primary
					});
					
					bankDetailsRecord.setValue({
						fieldId: 'custrecord_2663_entity_acct_no',
						value: accountNumber
					});
					
					bankDetailsRecord.setValue({
						fieldId: 'custrecord_2663_entity_acct_name',
						value: nameOfAccountHolder
					});
					
					bankDetailsRecord.setValue({
						fieldId: 'custrecord_2663_entity_branch_no',
						value: sortCode
					});
					
					// submit the bankDetailsRecord
					var bankDetailsRecordID = bankDetailsRecord.save({
						enableSourcing: false,
			    		ignoreMandatoryFields: true
					});
					
					log.audit({
						title: 'Bank Details Record Created',
						details: bankDetailsRecordID
					});
				}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Creating Bank Details Record',
    					details: e
    				});
    			}
    	}
    
    // ========================================
    // FUNCTION TO ADD THE SUPPLIER TO THE ITEM
    // ========================================
    
    function updateItemRecord(supplierRequestRecordID, supplierID)
    	{
    		// lookup fields on the supplier request record
    		var requestRecordLookup = search.lookupFields({
    			type: 'customrecord_tbg_supp_entry',
    			id: supplierRequestRecordID,
    			columns: ['custrecord_tbg_supp_entry_item']
    		});
    		
    		// get the item ID from the requestRecordLookup
    		var itemID = requestRecordLookup.custrecord_tbg_supp_entry_item[0].value;
    	
    		// declare and initialize variables
    		var itemType;
			var itemRecordType;
    		
    		// create search to find item type for the given item ID
    		var itemSearch = search.create({
    			type: search.Type.ITEM,
    			
    			filters: [{
    				name: 'internalid',
    				operator: 'anyof',
    				values: itemID
    			}],
    			
    			columns: [{
    				name: 'type'
    			}],
    			
    		});
    		
    		// run search and process results
    		itemSearch.run().each(function(result) {
    			
    			// get the item type from the search results
    			itemType = result.getValue({
    				name: 'type'
    			});
    		
    		});
			
			// translate the itemType so it can be used in the API calls
	        switch (itemType)
	        	{ 
		            case 'InvtPart':
		            	itemRecordType = 'inventoryitem';
		                break;
		                
		            case 'NonInvtPart':
		            	itemRecordType = 'noninventoryitem';
		                break;
		                
		            case 'Service':
		            	itemRecordType = 'serviceitem';
		            	break;
	        	}
	        
	        try
	        	{
			        // load the item record
			        var itemRecord = record.load({
			        	type: itemRecordType,
			        	id: itemID,
			        	isDynamic: true
			        });
			        
			        // add a new line to the 'itemvendor' sublist
			        itemRecord.selectNewLine({
						sublistId: 'itemvendor'
					});
			        
			        // set the 'vendor' field on the new line using the supplierID variable
			        itemRecord.setCurrentSublistValue({
			        	sublistId: 'itemvendor',
			        	fieldId: 'vendor',
			        	value: supplierID
			        });
			        
			        // commit the line
					itemRecord.commitLine({
						sublistId: 'itemvendor'
					});
					
					// submit the item record
					itemRecord.save({
						enableSourcing: false,
			    		ignoreMandatoryFields: true
					});
					
					log.audit({
						title: 'Item Record Updated',
						details: 'Supplier ' + supplierID + ' has been added to item ' + itemID
					});
				}
	        catch(error)
	        	{
	        		log.error({
	        			title: 'Unable to Update Item Record',
	        			details: 'Item ID: ' + itemID + ' | Error: ' + error
	        		});
	        		
	        		try
		        		{
		        			// ============================================================
			        		// SEND EMAIL NOTIFICATION OF AN ERROR UPDATING THE ITEM RECORD
			        		// ============================================================
			        		
			        		// build up the HTML of the email
			        		var emailBody = '<html>';
			        	    emailBody += '<p>There has been an error adding a new supplier to an item record</p>';
			            	emailBody += '<br>';
			            	emailBody += '<p><b>Item ID:</b> ' + itemID + '</p>';
			            	emailBody += '<br>';
			            	emailBody += '<p><b>Supplier ID:</b> ' + supplierID + '</p>';
			            	emailBody += '<br>';
			            	emailBody += '<p><b>Error:</b> ' + error + '</p>';
			            	emailBody += '<br>';
			            	emailBody += '<p><span style="font-size:10px;">this alert has been sent by &#39;BBS New Supplier Suitelet&#39; (customscript_bbs_new_supplier_suitelet)</span></p>';
			            	emailBody += '</html>';
			        		
			        		email.send({
				        		author: emailSender,
				        		recipients: emailRecipient,
				        		subject: 'Error Adding Supplier to Item Record',
				        		body: emailBody,
				        		relatedRecords: {
				        	           entityId: emailRecipient
				        		}
				        	});
			        		
			        		log.audit({
			        			title: 'Failure Email Notification Sent',
			        			details: 'Email Sender: ' + emailSender + ' | Email Recipient: ' + emailRecipient
			        		});
		        		}
	        		catch(error)
	        			{
	        				log.error({
	        					title: 'Unable to Send Email Notification',
	        					details: error
	        				});
	        			}
	        	}
    	}

    return {
        onRequest: onRequest
    };
    
});
