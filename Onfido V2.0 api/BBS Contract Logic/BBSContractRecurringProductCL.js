/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/ui/dialog'],
/**
 * @param {search} search
 */
function(search, format, dialog) {
    
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
    	
    	// check the record is being created
    	if (scriptContext.mode = 'create')
    		{
	    		// get the current record
		    	var currentRecord = scriptContext.currentRecord;
		    	
		    	// get the value of the 'Contract Record' field
		    	var contractRecord = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_contract_mnth_items_cont'
		    	});
		    	
		    	// check we have a contract record
		    	if (contractRecord)
		    		{
		    			// lookup fields on the contract record
		    			var contractLookup = search.lookupFields({
		    				type: 'customrecord_bbs_contract',
		    				id: contractRecord,
		    				columns: ['custrecord_bbs_contract_start_date', 'custrecord_bbs_contract_end_date']
		    			});
		    			
		    			// get the start/end date of the contract AND format as date objects
		    			var startDate = format.parse({
		    				type: format.Type.DATE,
		    				value: contractLookup.custrecord_bbs_contract_start_date
		    			});
		    			
		    			var endDate = format.parse({
		    				type: format.Type.DATE,
		    				value: contractLookup.custrecord_bbs_contract_end_date
		    			});
		    			
		    			// set the start/end date fields on the current record
		    			currentRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_mnth_items_start',
		    				value: startDate
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_mnth_items_end',
		    				value: endDate
		    			});
		    		}
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
    	
    	// if the 'Start Date' field has been changed
    	if (scriptContext.fieldId == 'custrecord_bbs_contract_mnth_items_start')
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get the value of the 'Contract Record' field
    			var contractRecord = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_mnth_items_cont'
    			});
    			
    			// lookup fields on the contract record
    			var contractLookup = search.lookupFields({
    				type: 'customrecord_bbs_contract',
    				id: contractRecord,
    				columns: ['custrecord_bbs_contract_start_date', 'custrecord_bbs_contract_end_date']
    			});
    			
    			// get the start/end date of the contract AND format as date objects
    			var contractStartDate = format.parse({
    				type: format.Type.DATE,
    				value: contractLookup.custrecord_bbs_contract_start_date
    			});
    			
    			var contractEndDate = format.parse({
    				type: format.Type.DATE,
    				value: contractLookup.custrecord_bbs_contract_end_date
    			});
    			
    			// get the selected start date and format as a date object
    			var startDate = format.parse({
    				type: format.Type.DATE,
    				value: currentRecord.getValue({fieldId: 'custrecord_bbs_contract_mnth_items_start'})
    			});
    				
    			// check if the startDate is before the contractStartDate
    			if (startDate < contractStartDate)
    				{
    					// display an alert to the user
    					dialog.alert({
    						title: 'Error',
    						message: 'The date you have entered is before the contract start date.<br><br>The start date has been reset to the contract start date.'
    					});
    				
    					// reset start date field to be the contract start date
    					currentRecord.setValue({
    						fieldId: 'custrecord_bbs_contract_mnth_items_start',
    						value: contractStartDate
    					});
    				}
    			else if (startDate > contractEndDate) // if the startDate is after the contractEndDate
    				{
	    				// display an alert to the user
						dialog.alert({
							title: 'Error',
							message: 'The date you have entered is after the contract end date.<br><br>The start date has been reset to the contract start date.'
						});
					
						// reset start date field to be the contract start date
						currentRecord.setValue({
							fieldId: 'custrecord_bbs_contract_mnth_items_start',
							value: contractStartDate
						});
    				}
    		}
    	else if (scriptContext.fieldId == 'custrecord_bbs_contract_mnth_items_end') // if the 'End Date' field has been changed
    		{
	    		// get the current record
				var currentRecord = scriptContext.currentRecord;
				
				// get the value of the 'Contract Record' field
				var contractRecord = currentRecord.getValue({
					fieldId: 'custrecord_bbs_contract_mnth_items_cont'
				});
				
				// lookup fields on the contract record
				var contractLookup = search.lookupFields({
					type: 'customrecord_bbs_contract',
					id: contractRecord,
					columns: ['custrecord_bbs_contract_end_date']
				});
				
				// get the send date of the contract AND format as a date object
				var contractEndDate = format.parse({
					type: format.Type.DATE,
					value: contractLookup.custrecord_bbs_contract_end_date
				});
				
				// get the selected start/end dates and format as date objects
				var startDate = format.parse({
					type: format.Type.DATE,
					value: currentRecord.getValue({fieldId: 'custrecord_bbs_contract_mnth_items_start'})
				});
				
				var endDate = format.parse({
					type: format.Type.DATE,
					value: currentRecord.getValue({fieldId: 'custrecord_bbs_contract_mnth_items_end'})
				});
				
				// if the endDate is before the startDate
				if (endDate < startDate)
					{
						// display an alert to the user
						dialog.alert({
							title: 'Error',
							message: 'The end date you have entered is before the selected start date.<br><br>The end date has been reset to the contract end date.'
						});
					
						// reset start date field to be the contract start date
						currentRecord.setValue({
							fieldId: 'custrecord_bbs_contract_mnth_items_end',
							value: contractEndDate
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
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the value of the 'Contract Record', 'Item', 'Start Date' and 'End Date' fields
    	var contractRecord = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_contract_mnth_items_cont'
    	});
    	
    	var itemID = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_contract_mnth_items_item'
    	});
    	
    	var startDate = format.format({
    		type: format.Type.DATE,
    		value: currentRecord.getValue({fieldId: 'custrecord_bbs_contract_mnth_items_start'})
    	});
    	
    	var endDate = format.format({
    		type: format.Type.DATE,
    		value: currentRecord.getValue({fieldId: 'custrecord_bbs_contract_mnth_items_end'})
    	});
    	
    	// call function to check if this item already exists on the contract
    	var itemAlreadyExists = searchContractRecurringItems(contractRecord, itemID, startDate, endDate);
    	
    	// if the item already exists on the contract
    	if (itemAlreadyExists == true)
    		{
    			// display error dialog
    			dialog.alert({
    				title: 'Error',
    				message: 'The item cannot be added to the contract as the item already exists for the selected dates.<br><br>Please enter your dates and try again.'
    			});
    		}
    	else
    		{
    			// allow the record to be saved
    			return true;
    		}

    }
    
    // =============================================================================================
    // FUNCTION TO CHECK IF AN ITEM ALREADY EXISTS ON THE CONTRACT RECORD BETWEEN THE SELECTED DATES
    // =============================================================================================
    
    function searchContractRecurringItems(contractRecord, itemID, startDate, endDate)
    	{
    		// declare and intialize variables
    		var itemExists = false;
    		
    		// run search to check if the item already exists on the contract record
    		search.create({
    			type: 'customrecord_bbs_contract_monthly_items',
    			
    			filters: [{
    				name: 'isinactive',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_cont',
    				operator: 'anyof',
    				values: [contractRecord]
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_start',
    				operator: 'notafter',
    				values: [endDate]
    			},
    					{
    				name: 'custrecord_bbs_contract_mnth_items_end',
    				operator: 'onorafter',
    				values: [startDate]
    			}],
    			
    			columns: [{
    				name: 'internalid'
    			}],
    			
    		}).run().each(function(result){
    			
    			// set itemExists variable to true
    			itemExists = true;
    			
    		});
    		
    		return itemExists;
    		
    	}

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
