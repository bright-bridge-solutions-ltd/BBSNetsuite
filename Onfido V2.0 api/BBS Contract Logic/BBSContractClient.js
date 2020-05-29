/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/ui/message', 'N/ui/dialog'],
function(search, format, message, dialog) {
    
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
    	
    	// get the current record object
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the field that was changed
    	var fieldId = scriptContext.fieldId;
    	
    	// if statement to check that the start date or contract term fields have been changed
    	if (fieldId == 'custrecord_bbs_contract_start_date' || fieldId == 'custrecord_bbs_contract_term')
    		{
	    		// get the value of the start date field
				var startDate = currentRecord.getValue({
					fieldId: 'custrecord_bbs_contract_start_date'
				});
    		
    			// get the value of the contract term field
    			var contractTerm = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_term'
    			});
    			
    			// if statement to check that the user has selected a contractTerm and a start date
    			if (contractTerm && startDate)
    				{
		    			contractTerm = parseInt(contractTerm); // convert to integer number
		    			
		    			// construct a new date object and set the startDate as it's value
		    			startDate = new Date(startDate);
		    			
		    			// get the day from the date object
		    			var day = startDate.getDate();
		    			
		    			// decrease the day variable by 1
		    			day--;
		    			
						// create a new date object and set it's value. This will be the last day of the month
						var endDate = new Date();
						endDate.setFullYear(startDate.getFullYear());
						endDate.setMonth(startDate.getMonth()+contractTerm);
						endDate.setDate(day);
		    			
		    			// set the end date field on the record
		    			currentRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_end_date',
		    				value: endDate
		    			});	
		    		}
    		}
    	else if (fieldId == 'custrecord_bbs_contract_end_date') // if the end date has been changed
    		{
	    		// get the value of the end date field
	    		var endDate = currentRecord.getValue({
					fieldId: 'custrecord_bbs_contract_end_date'
				});
	    		
	    		// check the user has entered an end date
	    		if (endDate)
	    			{
		    			// get the value of the start date field
			    		var startDate = currentRecord.getValue({
							fieldId: 'custrecord_bbs_contract_start_date'
						});
			    		
			    		// get the value of the end date field
			    		var endDate = currentRecord.getValue({
							fieldId: 'custrecord_bbs_contract_end_date'
						});
		    		
		    			// get the value of the contract term field
			    		var contractTerm = currentRecord.getValue({
		    				fieldId: 'custrecord_bbs_contract_term'
		    			});
			    		
			    		// calculate what the end date should be
			    		var calculatedEndDate = new Date(startDate.getFullYear(), startDate.getMonth()+contractTerm, startDate.getDate()-1);
			    		
			    		// check if the endDate is greater than the calculatedEndDate
			    		if (endDate > calculatedEndDate)
			    			{
				    			// return user error
			    				dialog.alert({
			    					title: '⚠️ Error',
			    					message: 'The end date you have entered is more than <b>' + contractTerm + '</b> months after the start date.<br><br>The end date has been moved to be <b>' + contractTerm + '</b> months after the start date.'
			    				});
			    				
			    				// set the end date field on the record
				    			currentRecord.setValue({
				    				fieldId: 'custrecord_bbs_contract_end_date',
				    				value: calculatedEndDate
				    			});
			    			}
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
    	
    	// declare and initialize variables
    	var contracts = 0;
    	
    	// get the current record object
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the ID of the current record
    	var currentRecordID = currentRecord.id;
    	
    	// get the internal ID of the customer
    	var customerID = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_contract_customer'
    	});
    	
    	// get the text value of the customer field
		var customerText = currentRecord.getText({
			fieldId: 'custrecord_bbs_contract_customer'
		});
    	
    	// get the start date of the contract
    	var startDate = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_contract_start_date'
    	});
    	
    	// format startDate as a date string
    	startDate = format.format({
    		type: format.Type.DATE,
    		value: startDate
    	});
    	
    	// get the end date of the contract
    	var endDate = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_contract_end_date'
    	});
    	
    	// format endDate as a date string
    	endDate = format.format({
    		type: format.Type.DATE,
    		value: endDate
    	});
    	
    	// create search to find active contracts for this customer between the selected dates
    	var contractRecordSearch = search.create({
    		type: 'customrecord_bbs_contract',
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    		filters: [{
    			name: 'custrecord_bbs_contract_customer',
    			operator: 'anyof',
    			values: [customerID]
    		},
    				{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_contract_start_date',
    			operator: 'notafter',
    			values: [endDate]
    		},
    				{
    			name: 'custrecord_bbs_contract_end_date',
    			operator: 'onorafter',
    			values: [startDate]
    		},
    				{
    			name: 'custrecord_bbs_contract_early_end_date',
    			operator: 'notbefore',
    			values: [startDate]
    		}],
    	});
    	
    	// check we have a current record ID
    	if (currentRecordID)
    		{
	    		// get the current search filters
				var searchFilters = contractRecordSearch.filters;
				
				// create new filter
				var newSearchFilter = search.createFilter({
					name: 'internalid',
					operator: 'noneof',
					values: [currentRecordID]
	    		});
	
				// add the filter using .push() method
				searchFilters.push(newSearchFilter);
    		}
    	
    	// run search and process results
    	contractRecordSearch.run().each(function(result) {
    		
    		// increase the contracts variable
    		contracts++;
    		
    	});
    	
    	// check if the contracts variable is greater than 0
    	if (contracts > 0)
    		{
    			// display an alert to the user
        		message.create({
                    title: 'Error', 
                    message: 'There is already an existing contract record for <b>' + customerText + '</b> which runs between the selected dates.<br><br>Please amend your dates and try again.',
                    type: message.Type.ERROR,
                    duration: 5000 // show message for 5000 milliseconds/5 seconds
                }).show(); // show message
                
        		// do not allow the record to be submitted
    			return false;
    		}
    	else // contracts variable is 0
    		{
    			// get the value of the 'Sales Force Opportunity ID' field
    			var salesForceOppID = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_sales_force_id'
    			});
    			
    			// reset contracts variable to 0
    			contracts = 0;
    		
    			// create search to find active contracts where the sales force opportunity has been used
    	    	var contractRecordSearch = search.create({
    	    		type: 'customrecord_bbs_contract',
    	    		
    	    		columns: [{
    	    			name: 'internalid'
    	    		}],
    	    		
    	    		filters: [{
    	    			name: 'custrecord_bbs_contract_sales_force_id',
    	    			operator: 'is',
    	    			values: [salesForceOppID]
    	    		},
    	    				{
    	    			name: 'isinactive',
    	    			operator: 'is',
    	    			values: ['F']
    	    		},
    	    				{
    	    			name: 'custrecord_bbs_contract_start_date',
    	    			operator: 'notafter',
    	    			values: [endDate]
    	    		},
    	    				{
    	    			name: 'custrecord_bbs_contract_end_date',
    	    			operator: 'onorafter',
    	    			values: [startDate]
    	    		},
    	    				{
    	    			name: 'custrecord_bbs_contract_early_end_date',
    	    			operator: 'notbefore',
    	    			values: [startDate]
    	    		}],
    	    	});
    	    	
    	    	// check we have a current record ID
    	    	if (currentRecordID)
    	    		{
    		    		// get the current search filters
    					var searchFilters = contractRecordSearch.filters;
    					
    					// create new filter
    					var newSearchFilter = search.createFilter({
    						name: 'internalid',
    						operator: 'noneof',
    						values: [currentRecordID]
    		    		});
    		
    					// add the filter using .push() method
    					searchFilters.push(newSearchFilter);
    	    		}
    	    	
    	    	// run search and process results
    	    	contractRecordSearch.run().each(function(result) {
    	    		
    	    		// increase the contracts variable
    	    		contracts++;
    	    		
    	    	});
    	    	
    	    	// check if the contracts variable is greater than 0
    	    	if (contracts > 0)
    	    		{
    	    			// display an alert to the user
    	        		message.create({
    	                    title: 'Error', 
    	                    message: 'The Sales Force Opportunity ID <b>' + salesForceOppID + '</b> has been used previously.<br><br>Please enter a unique Sales Force Opportunity ID and try again.',
    	                    type: message.Type.ERROR,
    	                    duration: 5000 // show message for 5000 milliseconds/5 seconds
    	                }).show(); // show message
    	                
    	        		// do not allow the record to be submitted
    	    			return false;
    	    		}
    	    	else
    	    		{
	    	    		// allow the record to be submitted
	        			return true;
    	    		}
    		}
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
