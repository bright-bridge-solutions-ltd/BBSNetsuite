/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/record'],
function(ui, record) {
   
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
    			var seciRecordID = context.request.parameters.record;
    		
    			// create form
				var form = ui.createForm({
	                title: 'Bannatyne - SECI Bank Details',
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

				// add fields to the form to display SECI information
				var seciRecordField = form.addField({
					id: 'custpage_secirecord',
					type: ui.FieldType.INTEGER,
					label: 'SECI Record'
				});
				
				seciRecordField.updateDisplayType({
				    displayType : ui.FieldDisplayType.HIDDEN
				});
				
				var firstNameField = form.addField({
					id: 'custpage_firstname',
					type: ui.FieldType.TEXT,
					label: 'First Name'
				});
				
				firstNameField.updateDisplayType({
				    displayType : ui.FieldDisplayType.INLINE
				});
				
				var surnameField = form.addField({
					id: 'custpage_surname',
					type: ui.FieldType.TEXT,
					label: 'Surname'
				});
				
				surnameField.updateDisplayType({
				    displayType : ui.FieldDisplayType.INLINE
				});
				
				var companyNameField = form.addField({
					id: 'custpage_companyname',
					type: ui.FieldType.TEXT,
					label: 'Company Name'
				});
				
				companyNameField.updateDisplayType({
				    displayType : ui.FieldDisplayType.INLINE
				});
				
				// check if the seciRecord parameter returns a value
				if (seciRecordID)
					{
						// load the seci record
						var seciRecord = record.load({
							type: 'customrecord_bbs_seci_record',
							id: seciRecordID
						});
						
						// retrieve values from the seciRecord object
						var firstName = seciRecord.getValue({
							fieldId: 'custrecord_bbs_seci_record_first_name'
						});
						
						var surname = seciRecord.getValue({
							fieldId: 'custrecord_bbs_seci_record_last_name'
						});
						
						var companyName = seciRecord.getValue({
							fieldId: 'custrecord_bbs_seci_record_comp_name'
						});
							
						// set record id, first name, surname and company number fields on the form
						seciRecordField.defaultValue = seciRecordID;
						firstNameField.defaultValue = firstName;
						surnameField.defaultValue = surname;
						companyNameField.defaultValue = companyName;
						
						// add submit button to the form
		   		 		form.addSubmitButton({
		   		 			label : 'Submit'
		   		 		});
					}
				
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
			    	name: 'custscript_bbs_new_seci_sl_pay_acc'
			    });
				
				var fileFormat = currentScript.getParameter({
					name: 'custscript_bbs_new_supp_sl_pay_file_form'
				});
    		
    			// retrieve field values from the form
    			var seciRecordID = context.request.parameters.custpage_secirecord;
    			var firstName = context.request.parameters.custpage_firstname;
    			var surname = context.request.parameters.custpage_surname;
    			var companyName = context.request.parameters.custpage_companyname;
    			var bankName = context.request.parameters.custpage_bankname;
    			var accountNumber = context.request.parameters.custpage_accountnumber;
    			var sortCode = context.request.parameters.custpage_sortcode;
    			
    			// load the seci record
				var seciRecord = record.load({
					type: 'customrecord_bbs_seci_record',
					id: seciRecordID
				});
				
				// get field values from the seciRecord object
				var subsidiary = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record_subsidiary'
				});
				
				var email = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record_email'
				});
					
				var phone = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record_phone'
				});
				
				var address1 = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record__addr_1'
				});
				
				var address2 = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record_addr_2'
				});
				
				var town = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record_town'
				});
				
				var county = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record_county'
				});
				
				var postcode = seciRecord.getValue({
					fieldId: 'custrecord_bbs_seci_record_post_code'
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
	    					value: 'T'
	    				});
						
						supplierRecord.setValue({
	    					fieldId: 'subsidiary',
	    					value: subsidiary
	    				});
						
						supplierRecord.setValue({
	    					fieldId: 'firstname',
	    					value: firstName
	    				});
						
						supplierRecord.setValue({
	    					fieldId: 'lastname',
	    					value: surname
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
	    					value: 21 // 21 = Personal Trainer
	    				});
						
						supplierRecord.setValue({
							fieldId: 'openingbalanceaccount',
							value: payablesAccount
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
	    					value: town
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
		    				fieldId: 'custpage_2663_entity_file_format',
		    				value: fileFormat
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
		    				details: 'SECI Record: ' + seciRecordID + ' | Supplier ID: ' + supplierID
		    			});
		    			
		    			// submit the customer field on the ad hoc site record
		    			record.submitFields({
		    				type: 'customrecord_bbs_seci_record',
		    				id: seciRecordID,
		    				values: {
		    					custrecord_bbs_seci_record_create_pt_sup: supplierID
		    				}
		    			});
		    			
		    			// set default value of the helpText field
						helpText.defaultValue = "<p><span style='color:#008000;'><strong>Thankyou, your bank details have been submitted successfully.</strong></span></p><br><p><span style='color:#008000;'><strong>You may now close the page.</strong></span></p>"
						
					}
				catch(error)
	    			{
	    				log.error({
	    					title: 'Unable to Create Supplier Record',
	    					details: 'SECI Record: ' + seciRecordID + ' | Error: ' + error
	    				});
	    				
	    				// set default value of the helpText field
						helpText.defaultValue = "<p><span style='color:#FF0000;'><strong>Unfortunately, an error occurred submitting your bank details. Please contact support quoting the following error message:</strong></span></p><br><p><span style='color:#FF0000;'><strong>" + error + "</strong></span></p>"
	    			}
				
				// write the response to the page
				context.response.writePage(form);
				
    		}
    }

    return {
        onRequest: onRequest
    };
    
});
