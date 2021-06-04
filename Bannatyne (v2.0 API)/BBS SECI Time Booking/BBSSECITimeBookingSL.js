/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/format', 'N/ui/message'],
function(ui, search, record, format, message) {
   
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
    			var seciSite 	= context.request.parameters.secisite;
    			var timeEntry	= context.request.parameters.timeentry;
    		
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
				
				// if we have been passed the details of an existing time entry record or the user has entered their seci details
				if (timeEntry || seciSite)
					{
						// declare and initialize variables
						var defaultLocation 	= null;
					
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
					
						// set the value of the help text field
						helpTextField.defaultValue = '<br/><p><span style="font-size:16px;"><strong><u>How to Use</u></strong></span></p><br/><p><span style="font-size:16px;">Please check your details are correct in the fields below. If they are not correct, please click the <i>Reset Form</i> button which will allow you to start over.</span></p><br/><p><span style="font-size:16px;">If your details are correct, you can enter your time entries in the table below.</span></p><br/><p><span style="font-size:16px;">Once you are done, click the <i>Submit</i> button which will send your time entries to the club manager for approval.</span></p><br/>';
					
						// add fields to the form
						var timeEntryField = form.addField({
							id: 'custpage_time_entry',
							type: ui.FieldType.SELECT,
							label: 'Time Entry',
							source: 'customrecord_bbs_seci_time_entry',
							container: 'seci_details'
						});
						
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
						
						var seciLocationField = form.addField({
							id: 'custpage_seci_location',
							type: ui.FieldType.SELECT,
							label: 'Location',
							container: 'seci_details'
						});
						
						// set fields to be mandatory
						seciLocationField.isMandatory = true;
						
						// set field display types
						timeEntryField.updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
						
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
						
						var startTime = sublist.addField({
							type: ui.FieldType.SELECT,
							id: 'custpage_start_time',
							label: 'Start Time'
						});
						
						startTime.isMandatory = true;
						
						var endTime = sublist.addField({
							type: ui.FieldType.SELECT,
							id: 'custpage_end_time',
							label: 'End Time'
						});
						
						endTime.isMandatory = true;
						
						// add a default select option to the start/end time fields
						startTime.addSelectOption({
							value: 0,
							text: '',
							isSelected: true
						});
						
						endTime.addSelectOption({
							value: 0,
							text: '',
							isSelected: true
						});
						
						// call function to return class times
						var classTimes = getClassTimes();
						
						// loop through class times
						for (var i = 0; i < classTimes.length; i++)
							{
								// add a select option to the start/end time fields
								startTime.addSelectOption({
									value: classTimes[i].id,
									text: classTimes[i].name
								});
								
								endTime.addSelectOption({
									value: classTimes[i].id,
									text: classTimes[i].name
								});
							}
						
						sublist.addField({
							type: ui.FieldType.FLOAT,
							id: 'custpage_duration',
							label: 'Duration (Hours)'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.DISABLED
						});
						
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
	    	    		
	    	    		if (timeEntry) // if we have a time entry record ID
	    	    			{
	    	    				// add a pageInit message
	    	    				form.addPageInitMessage({
	    	    					type: message.Type.INFORMATION,
	    	    					title: '',
	    	    					message: 'You have opted to amend an existing time entry record that was rejected by the club manager. If you do not want to continue, please click the <i>Reset Form<i> button to start a new time entry.'
	    	    				});
	    	    			
	    	    				// set field values
    	    					timeEntryField.defaultValue	= timeEntry;
	    	    			
	    	    				try
	    	    					{
	    	    						// load the time entry record
	    	    						var timeEntryRecord = record.load({
	    	    							type: 'customrecord_bbs_seci_time_entry',
	    	    							id: timeEntry
	    	    						});
	    	    						
	    	    						// get the seciSite and location from the time entry record
	    	    						seciSite = timeEntryRecord.getValue({
	    	    							fieldId: 'custrecord_bbs_seci_time_entry_seci_site'
	    	    						});
	    	    						
	    	    						defaultLocation = new locationObj(
	    	    															timeEntryRecord.getText({fieldId: 'custrecord_bbs_seci_time_entry_location'}),
	    	    															timeEntryRecord.getValue({fieldId: 'custrecord_bbs_seci_time_entry_location'})
	    	    														);
	    	    						
	    	    						// get count of time entry lines
	    	    						var timeEntryLines = timeEntryRecord.getLineCount({
	    	    							sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent'
	    	    						});
	    	    						
	    	    						// loop through time entry lines
	    	    						for (var i = 0; i < timeEntryLines; i++)
	    	    							{
	    	    								// add a new line to the time entries sublist
	    	    								sublist.setSublistValue({
	    	    								    id: 'custpage_date_of_class',
	    	    								    value: format.format({
	    	    								    	type: format.Type.DATE,
	    	    								    	value: timeEntryRecord.getSublistValue({
		    	    								    	sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
		    	    								    	fieldId: 'custrecord_bbs_seci_time_entry_li_date',
		    	    								    	line: i
		    	    								    })
	    	    								    }),
	    	    								    line: i
	    	    								});
	    	    								
	    	    								// add a new line to the time entries sublist
	    	    								sublist.setSublistValue({
	    	    								    id: 'custpage_class',
	    	    								    value: timeEntryRecord.getSublistValue({
	    	    								    	sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
	    	    								    	fieldId: 'custrecord_bbs_seci_time_entry_li_class',
	    	    								    	line: i
	    	    								    }),
	    	    								    line: i
	    	    								});
	    	    								
	    	    								sublist.setSublistValue({
	    	    								    id: 'custpage_start_time',
	    	    								    value: timeEntryRecord.getSublistValue({
	    	    								    	sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
	    	    								    	fieldId: 'custrecord_bbs_seci_time_entry_li_start',
	    	    								    	line: i
	    	    								    }),
	    	    								    line: i
	    	    								});
	    	    								
	    	    								sublist.setSublistValue({
	    	    								    id: 'custpage_end_time',
	    	    								    value: timeEntryRecord.getSublistValue({
	    	    								    	sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
	    	    								    	fieldId: 'custrecord_bbs_seci_time_entry_li_end',
	    	    								    	line: i
	    	    								    }),
	    	    								    line: i
	    	    								});
	    	    								
	    	    								sublist.setSublistValue({
	    	    								    id: 'custpage_duration',
	    	    								    value: timeEntryRecord.getSublistValue({
	    	    								    	sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
	    	    								    	fieldId: 'custrecord_bbs_seci_time_entry_li_length',
	    	    								    	line: i
	    	    								    }),
	    	    								    line: i
	    	    								});
	    	    								
	    	    								sublist.setSublistValue({
	    	    								    id: 'custpage_hourly_rate',
	    	    								    value: timeEntryRecord.getSublistValue({
	    	    								    	sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
	    	    								    	fieldId: 'custrecord_bbs_seci_time_entry_li_rate',
	    	    								    	line: i
	    	    								    }),
	    	    								    line: i
	    	    								});
	    	    								
	    	    								sublist.setSublistValue({
	    	    								    id: 'custpage_total',
	    	    								    value: timeEntryRecord.getSublistValue({
	    	    								    	sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
	    	    								    	fieldId: 'custrecord_bbs_seci_time_entry_li_total',
	    	    								    	line: i
	    	    								    }),
	    	    								    line: i
	    	    								});
	    	    							}
	    	    					}
	    	    				catch(e)
	    	    					{
	    	    						log.error({
	    	    							title: 'Error Loading Time Entry Record ' + timeEntry,
	    	    							details: e.message
	    	    						});
	    	    					}
	    	    			}
	    	    		if (seciSite) // if we have a seci site record ID
	    	    			{
			    	    		// call function to retrieve details for entered SECI details
								var seciDetails = getSeciDetails(seciSite);
								
								// add a default select option to the location field
								seciLocationField.addSelectOption({
									value: 0,
									text: ''
								});
			
								// if we have a default location (picked up from the time entry record)
								if (defaultLocation)
									{
										// loop through seci locations
										for (var i = 0; i < seciDetails.locations.length; i++)
											{
												// if the location is the same as the default
												if (seciDetails.locations[i].value == defaultLocation.id)
													{
														// add a select option to the location field and select the location by default
														seciLocationField.addSelectOption({
															value: seciDetails.locations[i].value,
															text: seciDetails.locations[i].text,
															isSelected: true
														});
													}
												else
													{
														// add a select option to the location field
														seciLocationField.addSelectOption({
															value: seciDetails.locations[i].value,
															text: seciDetails.locations[i].text
														});
													}
												
												
											}
									}
								else
									{
										if (seciDetails.locations.length == 1) // if the SECI only takes classes at one location
											{
												// add a select option to the location field and select the location by default
												seciLocationField.addSelectOption({
													value: seciDetails.locations[0].value,
													text: seciDetails.locations[0].text,
													isSelected: true
												});
											}
										else
											{
												// loop through seci locations
												for (var i = 0; i < seciDetails.locations.length; i++)
													{
														// add a select option to the location field
														seciLocationField.addSelectOption({
															value: seciDetails.locations[i].value,
															text: seciDetails.locations[i].text
														});
													}
											}
									}
								
								if (seciDetails.locations.length == 1) // if the SECI only takes classes at one location
									{
										// disable the location field
										seciLocationField.updateDisplayType({
											displayType: ui.FieldDisplayType.INLINE
										});
									}
								
								// set field values
								seciSiteField.defaultValue 			= seciSite;
								seciNameField.defaultValue 			= seciDetails.name;
								seciCompanyNameField.defaultValue 	= seciDetails.companyName;
	    	    			}
					}
				else // if the user has not yet entered their SECI details
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
				
				// write the response to the page
				context.response.writePage(form);
			
			}
    	else if (context.request.method == 'POST')
    		{
	    		// declare and initialize variables
    			var hasErrorOccured = false;
    			var timeEntryRec 	= null;
    		
    			// retrieve field values
    			var seciSite 		= parseInt(context.request.parameters.custpage_seci_site);
    			var seciLocation	= parseInt(context.request.parameters.custpage_seci_location);
    			var seciTimeEntry	= parseInt(context.request.parameters.custpage_time_entry);
    			
    			if (seciTimeEntry) // if the user is editing an existing time entry record
    				{
    					try
    						{
    							// load the time entry record
    							timeEntryRec = record.load({
    								type: 'customrecord_bbs_seci_time_entry',
    								id: seciTimeEntry,
    								isDynamic: true
    							});
    							
    							// set the resubmitted flag and approval status on the record
    							timeEntryRec.setValue({
    								fieldId: 'custrecord_bbs_seci_time_entry_resubmit',
    								value: true
    							});
    							
    							timeEntryRec.setValue({
    								fieldId: 'custrecord_bbs_seci_time_entry_approval',
    								value: 2 // 2 = Pending Approval
    							});
    							
    							// get count of time entry lines
    							var timeEntryLines = timeEntryRec.getLineCount({
    								sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent'
    							});
    							
    							// loop through item lines
    							for (var i = timeEntryLines; i > 0; i--)
    				    			{
    				    				// select and remove the line
    									timeEntryRec.selectLine({
    				    					sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
    				    					line: i-1
    				    				});
    				    					
    									timeEntryRec.removeLine({
    				    					sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
    				    					line: i-1,
    				    					ignoreRecalc: true
    				    				});
    								}
    						}
    					catch(e)
    						{
    							hasErrorOccured = true;
    						
    							log.error({
    								title: 'Error Loading Time Entry Record ' + seciTimeEntry,
    								details: e.message
    							});
    						}
    				}
    			else
    				{
	    				try
	    					{
		    					// create a new SECI time entry record
	    						timeEntryRec = record.create({
		    						type: 'customrecord_bbs_seci_time_entry',
		    						isDynamic: true
		    					});
	    					}
	    				catch(e)
	    					{
		    					hasErrorOccured = true;
	    					
	    						log.error({
				    				title: 'Error Creating SECI Time Entry Record',
				    				details: e.message
				    			});
	    					}
    			
    				}
    			
    			// if we have been able to create/load a seci time entry record
    			if (timeEntryRec)
    				{
	    				// set fields on the time entry record
    					timeEntryRec.setValue({
							fieldId: 'custrecord_bbs_seci_time_entry_seci_site',
							value: seciSite
						});
						
    					timeEntryRec.setValue({
							fieldId: 'custrecord_bbs_seci_time_entry_location',
							value: seciLocation
						});
    				
    					// get count of lines on the sublist
		    			var lineCount = context.request.getLineCount('custpage_time_entries');
						
						// loop through line count
		    			for (var i = 0; i < lineCount; i++)
		    				{
		    					// add a new line to the time entry record
		    					timeEntryRec.selectNewLine({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent'
		    					});
		    					
		    					timeEntryRec.setCurrentSublistValue({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
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
		    					
		    					timeEntryRec.setCurrentSublistValue({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
		    						fieldId: 'custrecord_bbs_seci_time_entry_li_class',
    								value: context.request.getSublistValue({
    		    						group: 'custpage_time_entries',
    		    						name: 'custpage_class',
    		    						line: i
    		    					})
		    					});
		    					
		    					timeEntryRec.setCurrentSublistValue({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
		    						fieldId: 'custrecord_bbs_seci_time_entry_li_start',
    								value: context.request.getSublistValue({
    		    						group: 'custpage_time_entries',
    		    						name: 'custpage_start_time',
    		    						line: i
    		    					})
		    					});
		    					
		    					timeEntryRec.setCurrentSublistValue({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
		    						fieldId: 'custrecord_bbs_seci_time_entry_li_end',
    								value: context.request.getSublistValue({
    		    						group: 'custpage_time_entries',
    		    						name: 'custpage_end_time',
    		    						line: i
    		    					})
		    					});
		    					
		    					timeEntryRec.setCurrentSublistValue({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
		    						fieldId: 'custrecord_bbs_seci_time_entry_li_length',
    								value: context.request.getSublistValue({
    		    						group: 'custpage_time_entries',
    		    						name: 'custpage_duration',
    		    						line: i
    		    					})
		    					});
		    					
		    					timeEntryRec.setCurrentSublistValue({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
		    						fieldId: 'custrecord_bbs_seci_time_entry_li_rate',
    								value: context.request.getSublistValue({
    		    						group: 'custpage_time_entries',
    		    						name: 'custpage_hourly_rate',
    		    						line: i
    		    					})
		    					});
		    					
		    					timeEntryRec.setCurrentSublistValue({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent',
		    						fieldId: 'custrecord_bbs_seci_time_entry_li_total',
    								value: context.request.getSublistValue({
    		    						group: 'custpage_time_entries',
    		    						name: 'custpage_total',
    		    						line: i
    		    					})
		    					});
		    					
		    					timeEntryRec.commitLine({
		    						sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent'
		    					});
		    				}
		    			
		    			try
		    				{
		    					// save the seci time entry record
		    					timeEntryRec.save();
		    				}
		    			catch(e)
		    				{
		    					hasErrorOccured = true;
		    				
		    					log.error({
		    						title: 'Error Saving SECI Time Entry Record ' + seciTimeEntry,
		    						details: e.message
		    					});
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
				});
				
				// if any errors occured
				if (hasErrorOccured == true)
					{
						helpTextField.defaultValue = '<br/><p><span style="font-size:16px; color:red;"><strong>There was an error submitting your time entries.</strong></span></p><br/><p><span style="font-size:16px; color:red;"><strong>Please contact the club manager for assistance.</strong></span></p>';
					}
				else
					{
						helpTextField.defaultValue = '<br/><p><span style="font-size:16px;"><strong>Your time entries have been submitted successfully.</strong></span></p><br/><p><span style="font-size:16px;"><strong>To submit further time entries, please click the <i>Return to Start</i> button.</strong></span></p><br/><p><span style="font-size:16px;"><strong>Otherwise, please close the page.</strong></span></p>';
					}
				
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
    		columns: ['custrecord_bbs_seci_site_first_name', 'custrecord_bbs_seci_site_surname', 'custrecord_bbs_seci_site_company_name', 'custrecord_bbs_seci_site_location']
    	});
    	
    	// return values to the main script function
    	return {
    		name: 			seciLookup.custrecord_bbs_seci_site_first_name + ' ' + seciLookup.custrecord_bbs_seci_site_surname,
    		companyName: 	seciLookup.custrecord_bbs_seci_site_company_name,
    		locations:		seciLookup.custrecord_bbs_seci_site_location
    	}
    	
    }
    
    function getClassTimes() {
    	
    	// declare and initialize variables
    	var classTimes = new Array();
    	
    	// run search to return the class times
    	search.create({
    		type: 'customrecord_bbs_class_times',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'internalid',
    			sort: search.Sort.ASC
    		},
    				{
    			name: 'name'
    		}],	
    			
    	}).run().each(function(result){
    		
    		// push a new time obj to the classTimes array
    		classTimes.push(new timeObj(result.getValue({name: 'name'}), result.getValue({name: 'internalid'})));
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    	// return values to the main script function
    	return classTimes;
	
    }
    
    function locationObj(name, id) {
    	
    	this.name 	= name;
    	this.id		= id;
    	
    }
    
    function timeObj(name, id) {
    	
    	this.name	= name;
    	this.id		= id;
    	
    }

    return {
        onRequest: onRequest
    };
    
});
