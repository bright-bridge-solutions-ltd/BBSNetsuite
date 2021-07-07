/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/ui/message', 'N/ui/dialog', 'N/record', 'N/url'],
function(search, format, message, dialog, record, url) {
    
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
    	
    	if (scriptContext.mode == 'create')
    		{
		    	// get the URL parameters
		    	var urlParams 	= new URLSearchParams(window.location.search);
		    	var copiedFrom	= urlParams.get('copiedfrom');
		    	var type		= urlParams.get('type');
		    	
		    	if (copiedFrom != null && copiedFrom != '' && type != null && type != '')
		    		{
		    			// lookup fields on the contract record the current contract is being created from
		    			var contractLookup = search.lookupFields({
		    				type: 		'customrecord_bbs_contract',
		    				id: 		copiedFrom,
		    				columns:	['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_partner_contract', 'custrecord_bbs_contract_billing_type', 'custrecord_bbs_contract_mgmt_fee', 'custrecord_bbs_contract_mgmt_fee_type', 'custrecord_bbs_contract_mgmt_fee_amt', 'custrecord_bbs_contract_term', 'custrecord__bbs_contract_actual_term', 'custrecord_bbs_contract_billing_level', 'custrecord_bbs_contract_exc_auto_bill', 'custrecord_bbs_contract_consol_inv', 'custrecord_bbs_contract_auto_renew', 'custrecord_bbs_contract_renewal_type', 'custrecord_bbs_contract_end_date', 'custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_bi_ann_use', 'custrecord_bbs_contract_qu_min_use', 'custrecord_bbs_contract_mon_min_use', 'custrecord_bbs_contract_annual_commit', 'custrecord_bbs_contract_link']
		    			});
		    		
		    			switch(type) {
		    				
		    				case 'payg':
		    					
		    					// set fields on the form
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_customer',
		    						value:		contractLookup.custrecord_bbs_contract_customer[0].value
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_billing_type',
		    						value: 		1 // 1 = PAYG
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_partner_contract',
		    						value: 		1 // 1 = No Partner Attached
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_setup_fee',
		    						value: 		2 // 2 = No
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_mgmt_fee',
		    						value: 		2 // 2 = No
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_billing_level',
		    						value: 		2 // 2 = Child
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_consol_inv',
		    						value: 		2 // 2 = No
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_auto_renew',
		    						value: 		1 // 1 = Yes
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_renewal_type',
		    						value: 		1 // 1 = Auto Expire
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_renewal_type',
		    						value: 		1 // 1 = Auto Expire
		    					});
		    					
		    					break;
		    				
		    				case 'renewal':
		    					
		    					// get the end date of the old contract and convert to a date object
		    					var endDate = format.parse({
				    				type: format.Type.DATE,
				    				value: contractLookup.custrecord_bbs_contract_end_date
								});
		    					
		    					// set the date of the new contract to be a day after the end date of the old contract
		    					var startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
		    					
		    					// set fields on the form
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_customer',
		    						value:		contractLookup.custrecord_bbs_contract_customer[0].value
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_partner_contract',
		    						value:		contractLookup.custrecord_bbs_contract_partner_contract[0].value
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_billing_type',
		    						value:		contractLookup.custrecord_bbs_contract_billing_type[0].value
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_setup_fee',
		    						value: 		2 // 2 = No
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_mgmt_fee',
		    						value:		contractLookup.custrecord_bbs_contract_mgmt_fee[0].value
		    					});
		    					
		    					if (contractLookup.custrecord_bbs_contract_mgmt_fee_type.length > 0)
		    						{
				    					scriptContext.currentRecord.setValue({
				    						fieldId: 	'custrecord_bbs_contract_mgmt_fee_type',
				    						value:		contractLookup.custrecord_bbs_contract_mgmt_fee_type[0].value
				    					});
		    						}
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_mgmt_fee_amt',
		    						value:		contractLookup.custrecord_bbs_contract_mgmt_fee_amt
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_term',
		    						value:		contractLookup.custrecord_bbs_contract_term
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord__bbs_contract_actual_term',
		    						value:		contractLookup.custrecord__bbs_contract_actual_term
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_billing_level',
		    						value:		contractLookup.custrecord_bbs_contract_billing_level[0].value
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_exc_auto_bill',
		    						value:		contractLookup.custrecord_bbs_contract_exc_auto_bill
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_consol_inv',
		    						value:		contractLookup.custrecord_bbs_contract_consol_inv[0].value
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_auto_renew',
		    						value:		contractLookup.custrecord_bbs_contract_auto_renew[0].value
		    					});
		    					
		    					if (contractLookup.custrecord_bbs_contract_renewal_type.length > 0)
		    						{
			    						scriptContext.currentRecord.setValue({
				    						fieldId: 	'custrecord_bbs_contract_renewal_type',
				    						value:		contractLookup.custrecord_bbs_contract_renewal_type[0].value
				    					});
		    						}
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_start_date',
		    						value:		startDate
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_min_ann_use',
		    						value:		contractLookup.custrecord_bbs_contract_min_ann_use
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_bi_ann_use',
		    						value:		contractLookup.custrecord_bbs_contract_bi_ann_use
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_qu_min_use',
		    						value:		contractLookup.custrecord_bbs_contract_qu_min_use
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_mon_min_use',
		    						value:		contractLookup.custrecord_bbs_contract_mon_min_use
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_annual_commit',
		    						value:		contractLookup.custrecord_bbs_contract_annual_commit
		    					});
		    					
		    					scriptContext.currentRecord.setValue({
		    						fieldId: 	'custrecord_bbs_contract_link',
		    						value:		contractLookup.custrecord_bbs_contract_link
		    					});
		    					
		    					break;
		    			
		    			}
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
    	
    	if (scriptContext.fieldId == 'custrecord_bbs_contract_customer')
    		{
		    	// get the URL parameters
		    	var urlParams 	= new URLSearchParams(window.location.search);
		    	var copiedFrom	= urlParams.get('copiedfrom');
		    	var type		= urlParams.get('type');
		    	
		    	if (copiedFrom != null && copiedFrom != '' && type != null && type != '')
		    		{
		    			// lookup fields on the contract record the current contract is being created from
		    			var contractLookup = search.lookupFields({
		    				type: 		'customrecord_bbs_contract',
		    				id: 		copiedFrom,
		    				columns:	['custrecord_bbs_contract_currency', 'custrecord_bbs_contract_subsidiary', 'custrecord_bbs_contract_sales_force_id', 'custrecord_bbs_contract_sf_acc_id', 'custrecord_bbs_contract_sf_opp_id']
		    			});
		    		
		    			scriptContext.currentRecord.setValue({
    						fieldId: 	'custrecord_bbs_contract_currency',
    						value:		contractLookup.custrecord_bbs_contract_currency[0].value
    					});
		    			
		    			scriptContext.currentRecord.setValue({
		    				fieldId: 	'custrecord_bbs_contract_sales_force_id',
		    				value: 		contractLookup.custrecord_bbs_contract_sales_force_id
		    			});
		    					
		    			scriptContext.currentRecord.setValue({
		    				fieldId: 	'custrecord_bbs_contract_sf_acc_id',
		    				value: 		contractLookup.custrecord_bbs_contract_sf_acc_id
		    			});
		    					
		    			scriptContext.currentRecord.setValue({
		    				fieldId: 	'custrecord_bbs_contract_sf_opp_id',
		    				value: 		contractLookup.custrecord_bbs_contract_sf_opp_id
		    			});
		    					
		    			scriptContext.currentRecord.setValue({
		    				fieldId: 	'custrecord_bbs_contract_subsidiary',
		    				value: 		contractLookup.custrecord_bbs_contract_subsidiary[0].value
		    			});		    		
		    		}
    		}

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

    	// get the value of the 'Client Service Usage Identifier' field
    	var clientServiceUsageIdentifier = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_contract_sales_force_id'
    	});
    		
    	// create search to find active contracts where the Client Service Usage Identifier has been used previously
    	var contractRecordSearch = search.create({
    		type: 'customrecord_bbs_contract',
    		
    		columns: [{
    			name: 'internalid'
    	    }],
    	    		
    	    filters: [{
    	    	name: 'custrecord_bbs_contract_sales_force_id',
    	    	operator: 'is',
    	    	values: [clientServiceUsageIdentifier]
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
    				message: 'The Client Service Usage Identifier <b>' + clientServiceUsageIdentifier + '</b> has been used previously.<br><br>Please enter a unique Client Service Usage Identifier and try again.',
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
    
    function deleteContract(recordID) {
		
		// display dialog asking user if they wish to continue
		dialog.confirm({
			title: 'Confirm Deletion',
			message: 'Please confirm that you wish to delete this contract record and any associated product lines.'
		}).then(success).catch(failure);

		// helper function called when user selects OK or cancel on confirm dialog
		function success(result)
			{
			 	// check if the user clicked ok
				if (result == true)
					{
						// call helper functions to delete records
    					deleteProductDetailRecords(recordID);
    					deleteProductRecords(recordID);
    					deleteMinimumUsageRecords(recordID);
    					deleteContractRecord(recordID);
    					
    					// return the URL of the home page
    					var reloadURL = url.resolveTaskLink({
    						id: 'CARD_-29'
    					});
    					
    					// redirect the user to the home page
    					window.onbeforeunload = null;
    					window.location.href = reloadURL;
					}
			}
		
		function failure()
			{

			}
		
    }
    
    function createPAYGContract(recordID) {
    	
    	// define the URL that will be called
    	var reloadURL = url.resolveTaskLink({
			id: 'EDIT_CUST_377',
			params: {
				copiedfrom: 	recordID,
				type: 			'payg'
			}
		});
    	
    	// open a new contract record in a new tab/window
    	window.open(reloadURL, '_blank');
    	
    }
    
    function createRenewalContract(recordID) {
    	
    	// define the URL that will be called
    	var reloadURL = url.resolveTaskLink({
			id: 'EDIT_CUST_377',
			params: {
				copiedfrom: 	recordID,
				type: 			'renewal'
			}
		});
    	
    	// open a new contract record in a new tab/window
    	window.open(reloadURL, '_blank');
    	
    }
    
    //=================
	// HELPER FUNCTIONS
	//=================
	
	function deleteProductDetailRecords(recordID) {
			
		// declare and initialize variables
		var periodDetailRecord;
			
		// run search to find customrecord_bbs_contract_period records linked to this contract
		var periodDetailSearch = search.create({
			type: 'customrecord_bbs_contract_period',
				
			columns: [{
				name: 'internalid'
	    	}],
	    		
	    	filters: [{
	    		join: 'custrecord_bbs_contract_period_contract',
	    		name: 'internalid',
	    		operator: 'is',
	    		values: [recordID]
	    	}],
	    });
			
		// run search and process search results
	    periodDetailSearch.run().each(function(result) {
	    		
	    	// get the internal ID of the record
	    	periodDetailRecord = result.getValue({
	    		name: 'internalid'
	    	});
	    		
	    	try
	    		{
	    			// delete the record
	    			record.delete({
	    				type: 'customrecord_bbs_contract_period',
	    				id: periodDetailRecord
	    			});
	    		}
	    	catch(error)
	    		{

	    		}
	    		
	    	// continue processing search results
	    	return true;
	    });	    			
	}
	
	function deleteProductRecords(recordID)  {
			
		// declare and initialize variables
		var productRecord;
			
		// run search to find customrecord_bbs_contract_product records linked to this contract
    	var productSearch = search.create({
    		type: 'customrecord_bbs_contract_product',
    		
    		columns: [{
				name: 'internalid'
	    	}],
	    		
	    	filters: [{
	    		join: 'custrecord_contract_product_parent',
	    		name: 'internalid',
	    		operator: 'is',
	    		values: [recordID]
	    	}],
	    });
    		
    	// run search and process search results
    	productSearch.run().each(function(result) {
	    		
	    	// get the internal ID of the record
    		productRecord = result.getValue({
	    		name: 'internalid'
	    	});
	    		
	    	try
	    		{
	    			// delete the record
	    			record.delete({
	    				type: 'customrecord_bbs_contract_product',
	    				id: productRecord
	    			});
	    		}
	    	catch(error)
	    		{
	    			
	    		}
	    		
	    	// continue processing search results
	    	return true;
    	});
	}
	
	function deleteMinimumUsageRecords(recordID) {
			
		// declare and initialize variables
		var minimumUsageRecord;
			
		// create search to find minimum usage records for this contract
		var minimumUsageSearch = search.create({
			type: 'customrecord_bbs_contract_minimum_usage',
				
			filters: [{
				name: 'custrecord_bbs_contract_min_usage_parent',
				operator: 'anyof',
				values: [recordID]
			}],
				
			columns: [{
				name: 'internalid'
			}],
	
		});
			
		// run search and process results
		minimumUsageSearch.run().each(function(result){
				
			// get the internal ID of the record
			minimumUsageRecord = result.getValue({
				name: 'internalid'
			});
				
			try
	    		{
	    			// delete the record
	    			record.delete({
	    				type: 'customrecord_bbs_contract_minimum_usage',
	    				id: minimumUsageRecord
	    			});
	    		}
			catch(error)
	    		{
	    			
	    		}
    		
			// continue processing search results
			return true;
				
		});
			
	}
	
	function deleteContractRecord(recordID) {
			
		// delete the contract record
    	try
	    	{
	    		record.delete({
	    			type: 'customrecord_bbs_contract',
	    			id: recordID
	    		});
	    	}
    	catch(error)
	    	{
	    			
	    	}
	}

    return {
        pageInit:				pageInit,
    	fieldChanged: 			fieldChanged,
    	postSourcing:			postSourcing,
        saveRecord: 			saveRecord,
        deleteContract:			deleteContract,
        createPAYGContract:		createPAYGContract,
        createRenewalContract:	createRenewalContract
    };
    
});
