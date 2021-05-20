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
    	else if (scriptContext.fieldId == 'custpage_seci_code')
    		{
	    		// declare and initialize variables
    			var seciSite	= null;
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
    			// allow the record to be saved
    			return true;
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
        fieldChanged: 	fieldChanged,
        saveRecord: 	saveRecord,
        cancelButton: 	cancelButton,
        returnToStart: 	returnToStart
    };
    
});
