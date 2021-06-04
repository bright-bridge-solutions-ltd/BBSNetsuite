/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/dialog', 'N/url'],
function(search, dialog, url) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    
    	// get the the () automatically added by NetSuite to the end of the sublist name
    	if (document.getElementsByClassName("smalltext")[0])
    		{
    			// hide the () automatically added by NetSuite to the end of the sublist name
        		document.getElementsByClassName("smalltext")[0].style.visibility = "hidden";
    		}

    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
    	
    	if (scriptContext.sublistId == 'custpage_time_entries' && (scriptContext.fieldId == 'custpage_duration' || scriptContext.fieldId == 'custpage_hourly_rate'))
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    		
    			// get the value of the duration and hourly rate fields
    			var duration = currentRecord.getCurrentSublistValue({
    				sublistId: 'custpage_time_entries',
    				fieldId: 'custpage_duration'
    			});
    			
    			var hourlyRate = currentRecord.getCurrentSublistValue({
    				sublistId: 'custpage_time_entries',
    				fieldId: 'custpage_hourly_rate'
    			});
    			
    			if (duration && hourlyRate)
    				{
    					// set the total field on the line
    					currentRecord.setCurrentSublistValue({
    						sublistId: 'custpage_time_entries',
    						fieldId: 'custpage_total',
    						value: (duration * hourlyRate).toFixed(2)
	    				});
    				}
    		}
    	else if (scriptContext.sublistId == 'custpage_time_entries' && (scriptContext.fieldId == 'custpage_start_time' || scriptContext.fieldId == 'custpage_end_time'))
			{
    			// get the current record
				var currentRecord = scriptContext.currentRecord;
    		
    			// get the start and end times
    			var startTime = currentRecord.getCurrentSublistText({
    				sublistId: 'custpage_time_entries',
    				fieldId: 'custpage_start_time'
    			});
    			
    			var endTime = currentRecord.getCurrentSublistText({
    				sublistId: 'custpage_time_entries',
    				fieldId: 'custpage_end_time'
    			});
    			
    			// if we have a start and end time
    			if (startTime && endTime)
    				{
    					// declare and initialize variables
    					var startTimeDate 	= new Date();
    					var endTimeDate		= new Date();
    					
    					// split the start/end times on the : character
    					startTime	= startTime.split(':');
    					endTime 	= endTime.split(':');
    					
    					// set the time of the start/end time date objects
    					startTimeDate.setHours(startTime[0]);
    					startTimeDate.setMinutes(startTime[1]);
    					startTimeDate.setSeconds(0);
    					startTimeDate.setMilliseconds(0);
    					
    					endTimeDate.setHours(endTime[0]);
    					endTimeDate.setMinutes(endTime[1]);
    					endTimeDate.setSeconds(0);
    					endTimeDate.setMilliseconds(0);
    					
    					// check if the end time is after the start time
    					if (endTimeDate.getTime() > startTimeDate.getTime())
    						{
		    					// calculate the class duration (difference between the start/end times)
		    					var duration = (endTimeDate.getTime() - startTimeDate.getTime()) / 1000;
		    					duration /= (60 * 60);
		    					duration = Math.abs(duration);
		    					
		    					// set the duration field
		    					currentRecord.setCurrentSublistValue({
		    	    				sublistId: 'custpage_time_entries',
		    	    				fieldId: 'custpage_duration',
		    	    				value: duration
		    	    			});
    						}
    					else
    						{
    							// display an error message
	    						dialog.alert({
	    		    				title: '⚠️ Error',
	    		    				message: 'The end time you have selected is before the selected start time.<br><br>Please correct this before continuing.'
	    		    			});
    						}
    				}
			}
    	else if (scriptContext.fieldId == 'custpage_seci_code')
    		{
	    		// declare and initialize variables
    			var startTime
    			var firstName 	= null;
    			var lastName 	= null;
    			var companyName = null;
    		
    			// get the SECI code that was entered
				var seciCode = scriptContext.currentRecord.getValue({
					fieldId: 'custpage_seci_code'
				});
				
				// run search to find SECI site records using the entered code
				search.create({
					type: 'customrecord_bbs_seci_site_form',
					
					filters: [{
						name: 'isinactive',
						operator: search.Operator.IS,
						values: ['F']
					},
							{
						name: 'idtext',
						operator: search.Operator.IS,
						values: [seciCode]
					}],
					
					columns: [{
						name: 'custrecord_bbs_seci_site_first_name'
					},
							{
						name: 'custrecord_bbs_seci_site_surname'
					},
							{
						name: 'custrecord_bbs_seci_site_company_name'
					}],
					
				}).run().each(function(result){
					
					// retrieve search results
					seciSite = result.id;
					
					firstName = result.getValue({
						name: 'custrecord_bbs_seci_site_first_name'
					});
					
					lastName = result.getValue({
						name: 'custrecord_bbs_seci_site_surname'
					});
					
					companyName = result.getValue({
						name: 'custrecord_bbs_seci_site_company_name'
					});
					
				});
				
				// if the details are valid
				if (firstName != null && lastName != null && companyName != null)
					{
						// show a confirmation dialog asking the user to verify the details are correct
						Ext.Msg.confirm('', "The following details have been found for the SECI code you have entered:<br><br><b>" + firstName + " " + lastName + "<br>" + companyName + "</b><br><br>Please verify these details are correct", function(btn) {
					
							if (btn == 'yes')
								{
									// get the URL of the suitelet
									var suiteletURL = url.resolveScript({
									    scriptId: 'customscript_bbs_seci_time_booking_sl',
									    deploymentId: 'customdeploy_bbs_seci_time_booking_sl',
									    returnExternalUrl: true,
									    params: {
									    	secisite: seciSite
									    }
									});
								
									// reload the Suitelet
									window.onbeforeunload = null;
									window.location.href = suiteletURL;
								}
						});
					}
				else
					{
						// show an alert dialog
						dialog.alert({
							title: "No Details Found",
							message: "We were unable to find any matches for the SECI code you have entered.<br><br>Please check the SECI code and try again."
						});
					}
    		}
    	else if (scriptContext.fieldId == 'custpage_email_address')
			{
	    		// declare and initialize variables
				var seciSite	= null;
				var firstName 	= null;
				var lastName 	= null;
				var companyName = null;
		
				// get the email address that was entered
				var emailAddress = scriptContext.currentRecord.getValue({
					fieldId: 'custpage_email_address'
				});
			
				// run search to find SECI site records using the entered code
				search.create({
					type: 'customrecord_bbs_seci_site_form',
					
					filters: [{
						name: 'isinactive',
						operator: search.Operator.IS,
						values: ['F']
					},
							{
						name: 'custrecord_bbs_seci_site_email',
						operator: search.Operator.IS,
						values: [emailAddress]
					}],
					
					columns: [{
						name: 'custrecord_bbs_seci_site_first_name'
					},
							{
						name: 'custrecord_bbs_seci_site_surname'
					},
							{
						name: 'custrecord_bbs_seci_site_company_name'
					}],
					
				}).run().each(function(result){
				
				// retrieve search results
				seciSite = result.id;
				
				firstName = result.getValue({
					name: 'custrecord_bbs_seci_site_first_name'
				});
				
				lastName = result.getValue({
					name: 'custrecord_bbs_seci_site_surname'
				});
				
				companyName = result.getValue({
					name: 'custrecord_bbs_seci_site_company_name'
				});
				
			});
			
			// if the details are valid
			if (firstName != null && lastName != null && companyName != null)
				{
					// show a confirmation dialog asking the user to verify the details are correct
					Ext.Msg.confirm('', "The following details have been found for the email address you have entered:<br><br><b>" + firstName + " " + lastName + "<br>" + companyName + "</b><br><br>Please verify these details are correct", function(btn) {
				
						if (btn == 'yes')
							{
								// get the URL of the suitelet
								var suiteletURL = url.resolveScript({
								    scriptId: 'customscript_bbs_seci_time_booking_sl',
								    deploymentId: 'customdeploy_bbs_seci_time_booking_sl',
								    returnExternalUrl: true,
								    params: {
								    	secisite: seciSite
								    }
								});
							
								// reload the Suitelet
								window.onbeforeunload = null;
								window.location.href = suiteletURL;
							}
					});
				}
			else
				{
					// show an alert dialog
					dialog.alert({
						title: "No Details Found",
						message: "We were unable to find any matches for the email address you have entered.<br><br>Please check the email address and try again."
					});
				}
			}

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {
    	
    	// check if the user is adding a new line to the time entries sublist
    	if (scriptContext.sublistId == 'custpage_time_entries')
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get the start and end times
    			var startTime = currentRecord.getCurrentSublistText({
    				sublistId: 'custpage_time_entries',
    				fieldId: 'custpage_start_time'
    			});
    			
    			var endTime = currentRecord.getCurrentSublistText({
    				sublistId: 'custpage_time_entries',
    				fieldId: 'custpage_end_time'
    			});
    			
    			// if we have a start and end time
    			if (startTime && endTime)
    				{
    					// declare and initialize variables
    					var startTimeDate 	= new Date();
    					var endTimeDate		= new Date();
    					
    					// split the start/end times on the : character
    					startTime	= startTime.split(':');
    					endTime 	= endTime.split(':');
    					
    					// set the time of the start/end time date objects
    					startTimeDate.setHours(startTime[0]);
    					startTimeDate.setMinutes(startTime[1]);
    					startTimeDate.setSeconds(0);
    					startTimeDate.setMilliseconds(0);
    					
    					endTimeDate.setHours(endTime[0]);
    					endTimeDate.setMinutes(endTime[1]);
    					endTimeDate.setSeconds(0);
    					endTimeDate.setMilliseconds(0);
    					
    					// check if the end time is after the start time
    					if (endTimeDate.getTime() > startTimeDate.getTime())
    						{
		    					// allow the user to save the line
    							return true;
    						}
    					else
    						{
    							// display an error message
	    						dialog.alert({
	    		    				title: '⚠️ Error',
	    		    				message: 'The end time you have selected is before the selected start time.<br><br>Please correct this before continuing.'
	    		    			});
    						}
    				}
    			else
    				{
    					// display an error message
	    				dialog.alert({
		    				title: '⚠️ Error',
		    				message: 'A start and end time have not been selected.<br><br>Please correct this before continuing.'
		    			});
    				}
    		}

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	
    	// get count of time entries
    	var timeEntries = scriptContext.currentRecord.getLineCount({
    		sublistId: 'custpage_time_entries'
    	});
    	
    	if (timeEntries > 0) // if the user has entered at least one time entry
    		{
    			// get the value of the location field
    			var location = scriptContext.currentRecord.getValue({
    	    		fieldId: 'custpage_seci_location'
    	    	});
    			
    			// if the user has not selected a location
    			if (location == 0)
    				{
	    				// display an alert
	        			dialog.alert({
	        				title: '⚠️ Error',
	        				message: 'You must select a location before submitting the form'
	        			});
    				}
    			else
    				{
    					// allow the record to be saved
        				return true;
    				}
    		}
    	else // user has not entered any time entries
    		{
    			// display an alert
    			dialog.alert({
    				title: '⚠️ Error',
    				message: 'You must enter at least one time entry before submitting the form'
    			});
    		}
    }
    
    function cancelButton() {
    	
    	// close the window
		window.close();  
    
    }
    
    function returnToStart() {
    	
    	// get the URL of the suitelet
		var suiteletURL = url.resolveScript({
		    scriptId: 'customscript_bbs_seci_time_booking_sl',
		    deploymentId: 'customdeploy_bbs_seci_time_booking_sl',
		    returnExternalUrl: true
		});
	
		// reload the Suitelet
		window.onbeforeunload = null;
		window.location.href = suiteletURL; 
    
    }

    return {
        pageInit:		pageInit,
    	fieldChanged: 	fieldChanged,
    	validateLine:	validateLine,
        saveRecord: 	saveRecord,
        cancelButton: 	cancelButton,
        returnToStart: 	returnToStart
    };
    
});
