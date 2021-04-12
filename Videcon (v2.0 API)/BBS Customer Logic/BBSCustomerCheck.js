/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/ui/dialog'],
function(search, record, dialog) {
    
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
    	
    	// get the customer stage and the value of the legacyCustomer checkbox
    	var customerStage = currentRecord.getValue({
    		fieldId: 'stage'
    	});
    	
    	var legacyCustomer = currentRecord.getValue({
    		fieldId: 'custentity_bbs_legacy_customer'
    	});
    	
    	// if the customer is a Prospect or Lead, OR they are a Customer and the legacyCustomer checkbox is NOT ticked
		if (customerStage != 'CUSTOMER' || (customerStage == 'CUSTOMER' && legacyCustomer == false))
			{
				// call function to check if the customer has any missing information
				var missingCustomerInformation = checkCustomer(currentRecord);
				
				// if the customer has missing information
				if (missingCustomerInformation.length > 0)
					{
						// convert the missingCustomerInformation array into a readable string
						missingCustomerInformation = JSON.stringify(missingCustomerInformation);
						missingCustomerInformation = missingCustomerInformation.replace('[', '');
						missingCustomerInformation = missingCustomerInformation.replace(']', '');
						missingCustomerInformation = missingCustomerInformation.replace(/"/g, ''); // replace all quotation marks
						missingCustomerInformation = missingCustomerInformation.replace(/,/g, '<br>'); // replace all commas
					
						// display an alert to the user
						dialog.alert({
							title: '⚠️ Error',
							message: 'The customer has not been fully setup and cannot be saved.<br><br>The following information is missing:<br><br>' + missingCustomerInformation
						});
					}
				else
					{
						// allow the record to be saved
						return true;
					}
			}
		else
			{
				// allow the record to be saved
				return true;
			}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function checkCustomer(customerRecord) {
    	
    	// declare and initialise variables
    	var missingInformation 			= new Array();
    	var hasDefaultBillingAddress 	= false;

    	// retrieve field values from the customer record
		var email 			= customerRecord.getValue({fieldId: 'email'});
		var phone 			= customerRecord.getValue({fieldId: 'phone'});
		var companyName		= customerRecord.getValue({fieldId: 'companyname'});
		var priceLevel		= customerRecord.getValue({fieldId: 'pricelevel'});
		var area			= customerRecord.getValue({fieldId: 'custentity_bbs_area'});
		var team			= customerRecord.getValue({fieldId: 'custentity_bbs_team'});
		var currentSupplier	= customerRecord.getValue({fieldId: 'custentity_bbs_current_supplier'});
		    			
		// check which customer info is missing and push the missing info to the missingInformation accordingly
		if (!email)
		    {
		    	missingInformation.push('Email');
		    }
		    			
		if (!phone)
		    {
		    	missingInformation.push('Phone');
		    }
		    			
		if (!companyName)
		    {
		    	missingInformation.push('Company Name');
		    }
		    			
		if (!priceLevel)
			{
				missingInformation.push('Price Level');
			}
		    			
		if (!area)
		  	{
				missingInformation.push('Area');
		  	}
		    			
		if (!team)
		 	{
		    	missingInformation.push('Team');
		 	}
		    			
		if (currentSupplier.length == 0)
		    {
		    	missingInformation.push('Current Supplier');
		    }
		    			
		// get count of addresses
		var addressCount = customerRecord.getLineCount({
		    sublistId: 'addressbook'
		});
		    			
		// loop through addresses
		for (var i = 0; i < addressCount; i++)
			{
				// select the line
				customerRecord.selectLine({
					sublistId: 'addressbook',
					line: i
				});
			
				// get the value of the 'Default Billing' checkbox for the line
		    	var defaultBilling = customerRecord.getCurrentSublistValue({
		    		sublistId: 'addressbook',
		    		fieldId: 'defaultbilling'
		    	});
		    					
		    	// if defaultBilling is true
		    	if (defaultBilling == true)
		    		{
		    			hasDefaultBillingAddress = true;
		    						
		    			// get the address subrecord
		    			var billingAddress = customerRecord.getCurrentSublistSubrecord({
		    				sublistId: 'addressbook',
		    				fieldId: 'addressbookaddress'
		    			});
		    							
		    			// retrieve address fields
		    			var addressLine1 = billingAddress.getValue({
		    				fieldId: 'addr1'
		    			});
		    							
		    			var city = billingAddress.getValue({
		    				fieldId: 'city'
		    			});
		    							
		    			var postcode = billingAddress.getValue({
		    				fieldId: 'zip'
		    			});
		    							
		    			// check which address info is missing and push the missing info to the missingInformation accordingly
		    			if (!addressLine1)
		    				{
		    					missingInformation.push('Default Billing Address Line 1');
		    				}
		    							
		    			if (!city)
		    				{
		    					missingInformation.push('Default Billing Address City');
		    				}
		    							
		    			if (!postcode)
		    				{
		    					missingInformation.push('Default Billing Address Postcode');
		    				}
		    			
		    			// deselect the line
		    			customerRecord.cancelLine({
		    				sublistId: 'addressbook'
		    			});
		    							
		    			// break the loop
		    			break;
		    		}
		    }
		    			
		    if (hasDefaultBillingAddress == false)
		    	{
		    		missingInformation.push('Default Billing Address');
		    	}
		
		// return values to main script function
		return missingInformation;
    	
    }

    return {
    	saveRecord: saveRecord
    };
    
});
