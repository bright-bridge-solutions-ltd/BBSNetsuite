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
				
				// add logo inline HTML field to the form
				var pageLogo = form.addField({
				    id: 'custpage_pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				// set default value of the pageLogo field
				pageLogo.defaultValue = "<img src='https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&c=4537381_SB1&h=7a14b6798dff769d5845' alt='Bannatyne Logo' style='width: 226px; height: 48px;'>";

				// add fields to the form to display supplier information
				var supplierRecordField = form.addField({
					id: 'custpage_supplier_record',
					type: ui.FieldType.INTEGER,
					label: 'Supplier Record'
				});
				
				supplierRecordField.updateDisplayType({
				    displayType : ui.FieldDisplayType.HIDDEN
				});
				
				var supplierNameField = form.addField({
					id: 'custpage_supplier_name',
					type: ui.FieldType.TEXT,
					label: 'Supplier Name'
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
							
						// set supplier name field on the form
						supplierNameField.defaultValue = supplierName;
						
						// add submit button to the form
		   		 		form.addSubmitButton({
		   		 			label : 'Submit'
		   		 		});
					}
				
				// add fields to enter bank details
				form.addField({
					id: 'custpage_bankname',
					type: ui.FieldType.TEXT,
					label: 'Bank Name'
				}).isMandatory = true;
				
				form.addField({
					id: 'custpage_accountnumber',
					type: ui.FieldType.TEXT,
					label: 'Account Number'
				}).isMandatory = true;
				
				form.addField({
					id: 'custpage_sortcode',
					type: ui.FieldType.TEXT,
					label: 'Sort Code'
				}).isMandatory = true;
				
				form.addField({
					id: 'custpage_payment_notification_email',
					type: ui.FieldType.EMAIL,
					label: 'Email Address for Payment Notification'
				}).isMandatory = true;
				
				form.addField({
					id: 'custpage_vat_number',
					type: ui.FieldType.TEXT,
					label: 'VAT Number'
				}).isMandatory = true;
				
				form.addField({
					id: 'custpage_terms_accepted',
					type: ui.FieldType.CHECKBOX,
					label: 'Bannatyne Terms and Conditions Accepted'
				});
				
				// add help inline HTML field to the form
				var helpText = form.addField({
					id: 'custpage_helptext',
					type: ui.FieldType.INLINEHTML,
					label: 'Help Text'
				});
				
				// set default value of the helpText field
				helpText.defaultValue = "<p><span style='font-size:20px;'><span style='font-family:arial,helvetica,sans-serif;'>Please use this form to enter your bank details and click 'Submit' once done.</span></span></p>";
				
				helpText.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				
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
				
				// retrieve script parameters
				var currentScript = runtime.getCurrentScript();
				
				var payablesAccount = currentScript.getParameter({
			    	name: 'custscript_bbs_new_supp_sl_pay_acc'
			    });
				
				var fileFormat = currentScript.getParameter({
					name: 'custscript_bbs_new_supp_sl_pay_file_form'
				});
				
				// emailRecipient and emailSender variables are global parameter so can be accessed throughout the script
				emailRecipient = currentScript.getParameter({
					name: 'custscript_bbs_new_sup_sl_item_email_rec'
				});
				
				emailSender = currentScript.getParameter({
					name: 'custscript_bbs_new_sup_sl_item_email_sen'
				});
    		
    			// retrieve field values from the form
    			var supplierRequestRecordID = context.request.parameters.custpage_supplier_record;
    			var companyName = context.request.parameters.custpage_supplier_name;
    			var bankName = context.request.parameters.custpage_bankname;
    			var accountNumber = context.request.parameters.custpage_accountnumber;
    			var sortCode = context.request.parameters.custpage_sortcode;
    			var emailForPaymentNotificaton = context.request.parameters.custpage_payment_notification_email;
    			var vatNumber = context.request.parameters.custpage_vat_number;
    			
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
		    			var supplierID = supplierRecord.save({
		    				enableSourcing: false,
				    		ignoreMandatoryFields: true
		    			});
		    			
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
		    				value: bankName
		    			});
		    			
		    			bankDetailsRecord.setValue({
		    				fieldId: 'custrecord_2663_entity_branch_no',
		    				value: sortCode
		    			});
		    			
		    			// submit the bankDetailsRecord
		    			bankDetailsRecord.save({
		    				enableSourcing: false,
				    		ignoreMandatoryFields: true
		    			});
		    			
		    			log.audit({
		    				title: 'New Supplier Record Created',
		    				details: 'Supplier Request Record: ' + supplierRequestRecordID + ' | Supplier ID: ' + supplierID
		    			});
		    			
		    			// submit the supplier field on the supplier request record
		    			record.submitFields({
		    				type: 'customrecord_tbg_supp_entry',
		    				id: supplierRequestRecordID,
		    				values: {
		    					custrecord_tbg_supp_entry_supp_rec: supplierID,
		    					custrecord_tbg_supp_entry_terms_accepted: true
		    				}
		    			});
		    			
		    			// call function to add the new supplier to the vendors sublist on the item record. Pass itemSupplied and supplierID variables.
		    			updateItemRecord(itemSupplied, supplierID);
				        
		    			// set default value of the helpText field
						helpText.defaultValue = "<p><span style='color:#008000;'><strong>Thankyou, your bank details have been submitted successfully.</strong></span></p><br><p><span style='color:#008000;'><strong>You may now close the page.</strong></span></p>"
						
					}
				catch(error)
	    			{
	    				log.error({
	    					title: 'Unable to Create Supplier Record',
	    					details: 'Supplier Request Record: ' + supplierRequestRecordID + ' | Error: ' + error
	    				});
	    				
	    				// set default value of the helpText field
						helpText.defaultValue = "<p><span style='color:#FF0000;'><strong>Unfortunately, an error occurred submitting your bank details. Please contact support quoting the following error message:</strong></span></p><br><p><span style='color:#FF0000;'><strong>" + error + "</strong></span></p>"
	    			}
				
				// write the response to the page
				context.response.writePage(form);
				
    		}
    }

    // =================================================
    // FUNCTION TO RUN SAVED SEARCH AND RETURN ITEM TYPE
    // =================================================
    
    function updateItemRecord(itemID, supplierID)
    	{
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
