/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/format'],
function(ui, search, record, format) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method == 'GET')
			{
	    		// retrieve parameters that have been passed to the Suitelet
    			var seciSite = context.request.parameters.secisite;
    		
    			// create form that will be displayed to the user
				var form = ui.createForm({
	                title: 'Bannatyne - SECI Time Booking Portal',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 415995;
			 	
			 	// add field groups to the form
   		 		form.addFieldGroup({
   		 			id: 'header',
   		 			label: 'Header'
   		 		}).isBorderHidden = true;
   		 		
	   		 	form.addFieldGroup({
		 			id: 'seci_details',
		 			label: 'SECI Details'
		 		}).isBorderHidden = true;
			 	
			 	// add fields to the form
				var pageLogoField = form.addField({
				    id: 'custpage_page_logo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Page Logo',
				    container: 'header'
				});
				
				pageLogoField.defaultValue = "<br/><img src='https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&c=4537381_SB1&h=7a14b6798dff769d5845' alt='Bannatyne Logo' style='width: 226px; height: 48px;'>";

				var helpTextField = form.addField({
				    id: 'custpage_help_text',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Help Text',
				    container: 'header'
				});
				
				// update field layout types
				pageLogoField.updateLayoutType({
				    layoutType: ui.FieldLayoutType.STARTROW
				});
				
				helpTextField.updateLayoutType({
				    layoutType: ui.FieldLayoutType.ENDROW
				});
				
				if (!seciSite) // if the user has not yet entered their SECI details
					{
						// add cancel button to the form
					 	form.addButton({
					 		id: 'custpage_cancel_button',
					 		label: 'Close Page',
					 		functionName: 'cancelButton()'
					 	});
					
						// set the value of the help text field
						helpTextField.defaultValue = '<br/><p><span style="font-size:16px;"><strong><u>How to Use</u></strong></span></p><br/><p><span style="font-size:16px;">Enter your SECI code (if known) or your email address in the fields below.</span></p><br/><p><span style="font-size:16px;">If the details entered match any records in our system, you will be asked to confirm the details you have entered are corect and the page will refresh and you will then be able to add your time entries.</span></p></span></p>';
					
						// add fields to the form
						var seciCodeField = form.addField({
							id: 'custpage_seci_code',
							type: ui.FieldType.TEXT,
							label: 'SECI Code',
						    container: 'seci_details'
						});
						
						var seciEmailAddressField = form.addField({
							id: 'custpage_email_address',
							type: ui.FieldType.EMAIL,
							label: 'Email Address',
						    container: 'seci_details'
						});
						
						// add padding between fields
						seciCodeField.padding = 1;
					}
				else // if the user HAS yet entered their SECI details
					{
						// add buttons to the form
						form.addButton({
					 		id: 'custpage_reset_form_button',
					 		label: 'Reset Form',
					 		functionName: 'returnToStart()'
					 	});
						
						form.addButton({
					 		id: 'custpage_cancel_button',
					 		label: 'Close Page',
					 		functionName: 'cancelButton()'
					 	});
					
						// call function to retrieve details for entered SECI details
						var seciDetails = getSeciDetails(seciSite);
					
						// set the value of the help text field
						helpTextField.defaultValue = '<br/><p><span style="font-size:16px;"><strong><u>How to Use</u></strong></span></p><br/><p><span style="font-size:16px;">Please check your details are correct in the fields below. If they are not correct, please click the <i>Reset Form</i> button which will allow you to start over.</span></p><br/><p><span style="font-size:16px;">If your details are correct, you can enter your time entries in the table below.</span></p><br/><p><span style="font-size:16px;">Once you are done, click the <i>Submit</i> button which will send your time entries to the club manager for approval.</span></p><br/>';
					
						// add fields to the form
						var seciSiteField = form.addField({
							id: 'custpage_seci_site',
							type: ui.FieldType.SELECT,
							label: 'SECI Site',
							source: 'customrecord_bbs_seci_site_form',
						    container: 'seci_details'
						});
						
						var seciNameField = form.addField({
							id: 'custpage_seci_name',
							type: ui.FieldType.TEXT,
							label: 'Name',
						    container: 'seci_details'
						});
						
						var seciCompanyNameField = form.addField({
							id: 'custpage_seci_company_name',
							type: ui.FieldType.TEXT,
							label: 'Company Name',
						    container: 'seci_details'
						});
						
						// set field display types
						seciSiteField.updateDisplayType({
							displayType: ui.FieldDisplayType.INLINE
						});
						
						seciNameField.updateDisplayType({
							displayType: ui.FieldDisplayType.INLINE
						});
						
						seciCompanyNameField.updateDisplayType({
							displayType: ui.FieldDisplayType.INLINE
						});
						
						// update field break types
						seciNameField.updateBreakType({
							breakType: ui.FieldBreakType.STARTCOL
						});
						
						// set field values
						seciSiteField.defaultValue 			= seciSite;
						seciNameField.defaultValue 			= seciDetails.name;
						seciCompanyNameField.defaultValue 	= seciDetails.companyName;
						
						// add a sublist to the form
						var sublist = form.addSublist({
							type: ui.SublistType.INLINEEDITOR,
							id: 'custpage_time_entries',
							label: 'Time Entries'
						});
						
						sublist.addField({
							type: ui.FieldType.DATE,
							id: 'custpage_date_of_class',
							label: 'Date of Class'
						}).isMandatory = true;
						
						sublist.addField({
							type: ui.FieldType.TEXT,
							id: 'custpage_class',
							label: 'Class'
						}).isMandatory = true;
						
						sublist.addField({
							type: ui.FieldType.FLOAT,
							id: 'custpage_duration',
							label: 'Duration (Hours)'
						}).isMandatory = true;
						
						sublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'custpage_hourly_rate',
							label: 'Hourly Rate'
						}).isMandatory = true;
						
						sublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'custpage_total',
							label: 'Total'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.DISABLED
						});
	    				
	    				// add submit button to the form
	    	    		form.addSubmitButton({
	       		 			label: 'Submit'
	       		 		});
						
					}
				
				// write the response to the page
				context.response.writePage(form);
			
			}
    	else if (context.request.method == 'POST')
    		{
	    		// declare and initialize variables
    			var seciTimeEntryID = null;
    		
    			// retrieve field values
    			var seciSite = parseInt(context.request.parameters.custpage_seci_site);
    			
    			try
    				{
    					// create a new SECI time entry record
    					var seciTimeEntry = record.create({
    						type: 'customrecord_bbs_seci_time_entry'
    					});
    					
    					seciTimeEntry.setValue({
    						fieldId: 'custrecord_bbs_seci_time_entry_seci_site',
    						value: seciSite
    					});
    					
    					seciTimeEntryID = seciTimeEntry.save();
    				}
    			catch(e)
    				{
		    			log.error({
		    				title: 'Error Creating SECI Time Entry Record',
		    				details: e.message
		    			});
    				}
    			
    			// if we have been able to create a SECI time entry record
    			if (seciTimeEntryID)
    				{
	    				// get count of lines on the sublist
		    			var lineCount = context.request.getLineCount('custpage_time_entries');
						
						// loop through line count
		    			for (var i = 0; i < lineCount; i++)
		    				{
		    					try
		    						{
		    							// create a new SECI time entry lines record
		    							var seciTimeEntryLines = record.create({
		    								type: 'customrecord_bbs_seci_time_entry_li'
		    							});
		    							
		    							seciTimeEntryLines.setValue({
		    								fieldId: 'custrecord_bbs_seci_time_entry_li_parent',
		    								value: seciTimeEntryID
		    							});
		    							
		    							seciTimeEntryLines.setValue({
		    								fieldId: 'custrecord_bbs_seci_time_entry_li_date',
		    								value: format.parse({
		    											type: format.Type.DATE,
		    											value: context.request.getSublistValue({
		    														group: 'custpage_time_entries',
		    														name: 'custpage_date_of_class',
		    														line: i
		    													})
		    										})
		    							});
		    							
		    							seciTimeEntryLines.setValue({
		    								fieldId: 'custrecord_bbs_seci_time_entry_li_class',
		    								value: context.request.getSublistValue({
		    		    						group: 'custpage_time_entries',
		    		    						name: 'custpage_class',
		    		    						line: i
		    		    					})
		    							});
		    							
		    							seciTimeEntryLines.setValue({
		    								fieldId: 'custrecord_bbs_seci_time_entry_li_length',
		    								value: context.request.getSublistValue({
		    		    						group: 'custpage_time_entries',
		    		    						name: 'custpage_duration',
		    		    						line: i
		    		    					})
		    							});
		    							
		    							seciTimeEntryLines.setValue({
		    								fieldId: 'custrecord_bbs_seci_time_entry_li_length',
		    								value: context.request.getSublistValue({
		    		    						group: 'custpage_time_entries',
		    		    						name: 'custpage_duration',
		    		    						line: i
		    		    					})
		    							});
		    							
		    							seciTimeEntryLines.setValue({
		    								fieldId: 'custrecord_bbs_seci_time_entry_li_rate',
		    								value: context.request.getSublistValue({
		    		    						group: 'custpage_time_entries',
		    		    						name: 'custpage_hourly_rate',
		    		    						line: i
		    		    					})
		    							});
		    							
		    							seciTimeEntryLines.setValue({
		    								fieldId: 'custrecord_bbs_seci_time_entry_li_total',
		    								value: context.request.getSublistValue({
		    		    						group: 'custpage_time_entries',
		    		    						name: 'custpage_total',
		    		    						line: i
		    		    					})
		    							});
		    							
		    							seciTimeEntryLines.save();
		    						}
		    					catch(e)
		    						{
		    							log.error({
		    								title: 'Error Creating SECI Time Entry Lines Record',
		    								details: e.message
		    							});
		    						}		    					
		    				}
    				}
    			
    			// create form that will be displayed to the user
				var form = ui.createForm({
	                title: 'Bannatyne - SECI Time Booking Portal',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 415995;
				
				// add buttons to the form
				form.addButton({
			 		id: 'custpage_return_to_start_button',
			 		label: 'Return to Start',
			 		functionName: 'returnToStart()'
			 	});
				
				form.addButton({
			 		id: 'custpage_cancel_button',
			 		label: 'Close Page',
			 		functionName: 'cancelButton()'
			 	});
				
				// add fields to the form
				var pageLogoField = form.addField({
				    id: 'custpage_page_logo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Page Logo'
				}).defaultValue = "<br/><img src='https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&c=4537381_SB1&h=7a14b6798dff769d5845' alt='Bannatyne Logo' style='width: 226px; height: 48px;'>";

				var helpTextField = form.addField({
				    id: 'custpage_help_text',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Help Text'
				}).defaultValue = '<br/><p><span style="font-size:16px;"><strong>Your time entries have been submitted successfully.</strong></span></p><br/><p><span style="font-size:16px;"><strong>To submit further time entries, please click the <i>Return to Start</i> button.</strong></span></p><br/><p><span style="font-size:16px;"><strong>Otherwise, please close the page.</strong></span></p>';
				
				// write the response to the page
				context.response.writePage(form);
   		 		
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getSeciDetails(seciSite) {
    	
    	// loop fields on the seciSite record
    	var seciLookup = search.lookupFields({
    		type: 'customrecord_bbs_seci_site_form',
    		id: seciSite,
    		columns: ['custrecord_bbs_seci_site_first_name', 'custrecord_bbs_seci_site_surname', 'custrecord_bbs_seci_site_company_name']
    	});
    	
    	// return values to the main script function
    	return {
    		name: 			seciLookup.custrecord_bbs_seci_site_first_name + ' ' + seciLookup.custrecord_bbs_seci_site_surname,
    		companyName: 	seciLookup.custrecord_bbs_seci_site_company_name
    	}
    	
    }

    return {
        onRequest: onRequest
    };
    
});
