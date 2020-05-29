/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/format', 'N/record'],
function(runtime, search, format, record) {
   
    // retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be access throughout the script
	invoiceForm = currentScript.getParameter({
		name: 'custscript_bbs_ad_hoc_invoice_form'
	});
	
	// create new array to hold names of months. Global variable so can be accessed throughout the script
	monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
	// get today's date. Global variable so can be accessed throughout the script
	today = new Date();
	
	/**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// create search to find contracts to create invoices for
    	return search.create({
    		type: 'customrecord_bbs_ad_hoc_site',
    		
    		columns: [{
    			name: 'custrecord_bbs_ad_hoc_site_customer'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_monthly_amt'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_gym_spa'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_location'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_item'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_vat_rate'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_serv_desc'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_stepped_rent'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_1_amt'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_1_date'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_2_amt'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_2_date'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_3_amt'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_3_date'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_4_amt'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_4_date'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_5_amt'
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_step_5_date'
    		}],
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_app_status',
    			operator: 'anyof',
    			values: ['1'] // 1 = Approved
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_con_terminate', 
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_start_date',
    			operator: 'onorbefore',
    			values: ['today']
    		},
    				{
    			name: 'custrecord_bbs_ad_hoc_site_customer',
    			operator: 'noneof',
    			values: ['@NONE@']
    		}],
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// declare and initialize variables
    	var invoiceAmount = 0;
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the internal ID of the record from the search results
		var recordID = searchResult.id;
		
		log.audit({
			title: 'Processing Ad Hoc Site Record',
			details: recordID
		});
		
		// get the customer from the search results
		var customer = searchResult.values["custrecord_bbs_ad_hoc_site_customer"].value;
			
		// get the line of business from the search results
		var lineOfBusiness = searchResult.values["custrecord_bbs_ad_hoc_site_gym_spa"].value;
		
		// get the location from the search results
		var location = searchResult.values["custrecord_bbs_ad_hoc_site_location"].value;
		
		// get the item from the search results
		var item = searchResult.values["custrecord_bbs_ad_hoc_site_item"].value;
		
		// get the vat rate from the search results
		var vatRate = searchResult.values["custrecord_bbs_ad_hoc_site_vat_rate"].value;
			
		// get the description from the search results
		var description = searchResult.values["custrecord_bbs_ad_hoc_site_serv_desc"];
			
		// get the stepped rent from the search results
		var steppedRent = searchResult.values["custrecord_bbs_ad_hoc_site_stepped_rent"].value;
		
		// check if the steppedRent variable returns 1 (Yes)
		if (steppedRent == '1')
			{
				// get today's date
				var today = new Date();
				today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			
				// get the value of the step dates from the search results
				var step1Date = searchResult.values["custrecord_bbs_ad_hoc_site_step_1_date"];
				var step2Date = searchResult.values["custrecord_bbs_ad_hoc_site_step_2_date"];
				var step3Date = searchResult.values["custrecord_bbs_ad_hoc_site_step_3_date"];
				var step4Date = searchResult.values["custrecord_bbs_ad_hoc_site_step_4_date"];
				var step5Date = searchResult.values["custrecord_bbs_ad_hoc_site_step_5_date"];
				
				// check if the step1Date variable returns a value
				if (step1Date)
					{
						// format step1Date as a date object
						step1Date = format.parse({
							type: format.Type.DATE,
							value: step1Date
						});
						
						// get the step1Amount from the search results and set the invoiceAmont variable using this value
						invoiceAmount = searchResult.values["custrecord_bbs_ad_hoc_site_step_1_amt"];
					
						// check if today is after the step 1 date
						if (today.getTime() > step1Date.getTime())
							{
								// check if the step2Date variable returns a value
								if (step2Date)
									{
										// format step2Date as a date object
										step2Date = format.parse({
											type: format.Type.DATE,
											value: step2Date
										});
										
										// get the step2Amount from the search results and set the invoiceAmont variable using this value
										invoiceAmount = searchResult.values["custrecord_bbs_ad_hoc_site_step_2_amt"];
										
										// check if today is after the step 2 date
										if (today.getTime() > step2Date.getTime())
											{
												// check if the step3Date variable returns a value
												if (step3Date)
													{
														// format step3Date as a date object
														step3Date = format.parse({
															type: format.Type.DATE,
															value: step3Date
														});
														
														// get the step3Amount from the search results and set the invoiceAmont variable using this value
														invoiceAmount = searchResult.values["custrecord_bbs_ad_hoc_site_step_3_amt"];
														
														// check if today is after the step 3 date
														if (today.getTime() > step3Date.getTime())
															{
																// check if the step4Date variable returns a value
																if (step4Date)
																	{
																		// format step4Date as a date object
																		step4Date = format.parse({
																			type: format.Type.DATE,
																			value: step4Date
																		});
																		
																		// get the step4Amount from the search results and set the invoiceAmont variable using this value
																		invoiceAmount = searchResult.values["custrecord_bbs_ad_hoc_site_step_4_amt"];
											
																		// check if today is after the step 4 date
																		if (today.getTime() > step4Date.getTime())
																			{
																				// check if the step5Date variable returns a value
																				if (step5Date)
																					{
																						// get the step5Amount from the search results and set the invoiceAmont variable using this value
																						invoiceAmount = searchResult.values["custrecord_bbs_ad_hoc_site_step_5_amt"];
																					}
																			}
																	}
															}
													}
											}
									}
							}
					}	
			}
		else // steppedRent variable returns 2 (No)
			{
				// get the monthly amount from the search results and set the invoiceAmount variable using this value
				invoiceAmount = searchResult.values["custrecord_bbs_ad_hoc_site_monthly_amt"];
			}
		
		// call function to create an invoice record. Pass recordID, customer, invoiceAmount, lineOfBusiness, location, item, vatRate and description
		createInvoice(recordID, customer, invoiceAmount, lineOfBusiness, location,  item, vatRate, description);

    }
    
    /*
     * ====================================
     * FUNCTION TO CREATE AN INVOICE RECORD
     * ====================================
     */
    
    function createInvoice(adHocSiteID, customer, amount, lineOfBusiness, location, item, vatRate, description)
    	{
    		try
    			{
	    			// create a new invoice record
					var invoiceRecord = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
    			
					// set header fields on the invoice record
					invoiceRecord.setValue({
    					fieldId: 'approvalstatus',
    					value: 2 // 2 = Approved
    				});
					
					invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_site',
    					value: adHocSiteID
    				});
    				
    				invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_inv_desc',
    					value: 'Monthly Invoice for ' + monthNames[today.getMonth()]
    				});
    				
    				invoiceRecord.setValue({
    					fieldId: 'custbody_bbs_ad_hoc_invoice_type',
    					value: 2 // 2 = Ongoing
    				});
    				
    				/*
    				 * =======================================================================
    				 * ADD A LINE TO THE ITEMS SUBLIST FOR THE ITEM ASSOCIATED TO THE CONTRACT
    				 * =======================================================================
    				 */
    				
    				// select a new sublist line
    				invoiceRecord.selectNewLine({
    					sublistId: 'item'
    				});
    				
    				// set fields on the new line
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'item',
    					value: item
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'description',
    					value: description
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'price',
    					value: '-1' // -1 = Custom
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'rate',
    					value: amount
    				}),
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'vatcode',
    					value: vatRate
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'quantity',
    					value: 1
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'class',
    					value: lineOfBusiness
    				});
    				
    				invoiceRecord.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'location',
    					value: location
    				});
    				
    				// commit the line
    				invoiceRecord.commitLine({
						sublistId: 'item'
					});
	    			
	    			// submit the invoice record
	    			var invoiceID = invoiceRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'Invoice Created',
	    				details: 'Ad Hoc Site: ' + adHocSiteID + ' | Invoice ID: ' + invoiceID
	    			});
    				
    			}
    		catch(error)
    			{
    				log.error({
    					title: 'An Error Occured Creating an Invoice',
    					details: 'Ad Hoc Site: ' + adHocSiteID + ' | Error: ' + error
    				});
    			}
    	}
    

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(context) {
    	
    	log.audit({
    		title: 'Units Used',
    		details: context.usage
    	});
    	
    	log.audit({
    		title: 'Number of Yields',
    		details: context.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
