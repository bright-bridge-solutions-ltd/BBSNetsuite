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
    	
    	// check the record is being created
    	if (scriptContext.mode == 'create')
    		{
	    		// get the current record
    			var currentRecord = scriptContext.currentRecord;
    		
    			// get the record type
	    		var recordType = currentRecord.type;
    		
    			// get the value of the customer field
		    	var customerID = currentRecord.getValue({
		    		fieldId: 'entity'
		    	});
		    			
		    	// if we have a customer ID
		    	if (customerID)
		    		{
		    			// call function to handle logic for when a customer has been selected
						customerSelected(currentRecord, customerID, recordType);
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
    	
    	// if the customer field has been changed
    	if (scriptContext.fieldId == 'entity')
    		{
    			// get the current record
				var currentRecord = scriptContext.currentRecord;
    		
    			// get the record type
    			var recordType = currentRecord.type;
    		
    			// get the value of the customer field
    			var customerID = currentRecord.getValue({
    				fieldId: 'entity'
    			});
    			
    			// if we have a customer ID
    			if (customerID)
    				{
	    				// call function to handle logic for when a customer has been selected
    					customerSelected(currentRecord, customerID, recordType);
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

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function customerSelected(currentRecord, customerID, recordType) {
    	
    	// call function to get customer info
		var customerInfo = getCustomerInfo(customerID);
				
		// if the customer is a Prospect or Lead, OR they are a Customer and the legacyCustomer checkbox is NOT ticked
		if (customerInfo.stage != 'CUSTOMER' || (customerInfo.stage == 'CUSTOMER' && customerInfo.legacyCustomer == false))
			{
				// call function to check if the customer has any missing information
				var missingCustomerInformation = checkCustomer(customerID, recordType);
				
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
							message: 'The customer you have selected has not been fully setup and cannot be transacted with.<br><br>The following information is missing:<br><br>' + missingCustomerInformation
						});
					
						// clear the customer field
						currentRecord.setValue({
		    				fieldId: 'entity',
		    				value: null
		    			});
					}
			}
    	
    }
    
    function getCustomerInfo(customerID) {
    	
    	// declare and initialize variables
    	var stage = null;
    	var legacyCustomer = null;
    	
    	// lookup fields on the customer record
    	var customerLookup = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['stage', 'custentity_bbs_legacy_customer']
    	});
    	
    	// return values to the main script function
    	return {
    		stage: customerLookup.stage[0].value,
    		legacyCustomer:	customerLookup.custentity_bbs_legacy_customer
    	};
    	
    }
    
    function checkCustomer(customerID, recordType) {
    	
    	// declare and initialise variables
    	var customerRecord = null;
    	var missingInformation = new Array();
    	
    	try
    		{
    			// load the customer record
    			customerRecord = record.load({
    				type: record.Type.CUSTOMER,
    				id: customerID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Unable to Load Customer ' + customerID,
    				details: e.message
    			});
    		}
    	
    	// if we have been able to load the customer
    	if (customerRecord)
    		{
		    	// if the record type is salesorder
		    	if (recordType == 'salesorder')
		    		{
			    		// declare and initialize variables
		    			var hasDefaultBillingAddress 	= false;
		    			var missingContactInfo			= true;

		    			// retrieve field values from the customer record
		    			var email 			= customerRecord.getValue({fieldId: 'email'});
		    			var phone 			= customerRecord.getValue({fieldId: 'phone'});
		    			var companyName		= customerRecord.getValue({fieldId: 'companyname'});
		    			var priceLevel		= customerRecord.getValue({fieldId: 'pricelevel'});
		    			var area			= customerRecord.getValue({fieldId: 'custentity_bbs_area'});
		    			var team			= customerRecord.getValue({fieldId: 'custentity_bbs_team'});
		    			var terms			= customerRecord.getValue({fieldId: 'terms'});
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
		    			
		    			if (!terms)
		    				{
		    					missingInformation.push('Payment Terms');
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
		    					// get the value of the 'Default Billing' checkbox for the line
		    					var defaultBilling = customerRecord.getSublistValue({
		    						sublistId: 'addressbook',
		    						fieldId: 'defaultbilling',
		    						line: i
		    					});
		    					
		    					// if defaultBilling is true
		    					if (defaultBilling == true)
		    						{
		    							hasDefaultBillingAddress = true;
		    						
		    							// get the address subrecord
		    							var billingAddress = customerRecord.getSublistSubrecord({
		    							    sublistId: 'addressbook',
		    							    fieldId: 'addressbookaddress',
		    							    line: i
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
		    							
		    							// break the loop
		    							break;
		    						}
		    				}
		    			
		    			// get count of contacts
		    			var contacts = customerRecord.getLineCount({
		    				sublistId: 'contactroles'
		    			});
		    			
		    			// loop through contacts
		    			for (var x = 0; x < contacts; x++)
		    				{
		    					// get contact fields
		    					var contactName = customerRecord.getSublistValue({
		    						sublistId: 'contactroles',
		    						fieldId: 'contactname',
		    						line: x
		    					});
		    					
		    					var contactEmail = customerRecord.getSublistValue({
		    						sublistId: 'contactroles',
		    						fieldId: 'email',
		    						line: x
		    					});
		    					
		    					// if the customer has a name and an email address
		    					if (contactName && contactEmail)
		    						{
		    							// set missingContactInfo to false
		    							missingContactInfo = false;
		    							
		    							// break the loop
		    							break;
		    						}
		    				}
		    			
		    			if (hasDefaultBillingAddress == false)
		    				{
		    					missingInformation.push('Default Billing Address');
		    				}
		    			
		    			if (missingContactInfo == true)
		    				{
		    					missingInformation.push('Contact Info (Missing Name and/or Email Address)');
		    				}
		    		}
		    	else
		    		{
			    		// declare and initialize variables
		    			var hasDefaultBillingAddress 	= false;
		    			var missingContactInfo			= true;
	
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
		    					// get the value of the 'Default Billing' checkbox for the line
		    					var defaultBilling = customerRecord.getSublistValue({
		    						sublistId: 'addressbook',
		    						fieldId: 'defaultbilling',
		    						line: i
		    					});
		    					
		    					// if defaultBilling is true
		    					if (defaultBilling == true)
		    						{
		    							hasDefaultBillingAddress = true;
		    						
		    							// get the address subrecord
		    							var billingAddress = customerRecord.getSublistSubrecord({
		    							    sublistId: 'addressbook',
		    							    fieldId: 'addressbookaddress',
		    							    line: i
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
		    							
		    							// break the loop
		    							break;
		    						}
		    				}
		    			
		    			// get count of contacts
		    			var contacts = customerRecord.getLineCount({
		    				sublistId: 'contactroles'
		    			});
		    			
		    			// loop through contacts
		    			for (var x = 0; x < contacts; x++)
		    				{
		    					// get contact fields
		    					var contactName = customerRecord.getSublistValue({
		    						sublistId: 'contactroles',
		    						fieldId: 'contactname',
		    						line: x
		    					});
		    					
		    					var contactEmail = customerRecord.getSublistValue({
		    						sublistId: 'contactroles',
		    						fieldId: 'email',
		    						line: x
		    					});
		    					
		    					// if the customer has a name and an email address
		    					if (contactName && contactEmail)
		    						{
		    							// set missingContactInfo to false
		    							missingContactInfo = false;
		    							
		    							// break the loop
		    							break;
		    						}
		    				}
		    			
		    			if (hasDefaultBillingAddress == false)
		    				{
		    					missingInformation.push('Default Billing Address');
		    				}
		    			
		    			if (missingContactInfo == true)
		    				{
		    					missingInformation.push('Contact Info (Missing Name and/or Email Address)');
		    				}
			    	}
    		}
		
		// return values to main script function
		return missingInformation;
    	
    }

    return {
    	pageInit: pageInit,
        fieldChanged: fieldChanged
    };
    
});
