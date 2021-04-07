/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/url'],
function(runtime, search, url) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	// check that the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
	    		// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the approval status field
    			var approvalStatus = currentRecord.getValue({
    				fieldId: 'custbody_bbs_approval_status'
    			});
    			
    			// get the user's ID and current role
    		    var userID = runtime.getCurrentUser().id;
    			var userRole = runtime.getCurrentUser().role;
    					
    			// get the user's supervisor
    			var supervisor = search.lookupFields({
    				type: search.Type.EMPLOYEE,
    				id: userID,
    				columns: ['supervisor']
    			}).supervisor[0].value;
    					
    			/*
    			 * approvalStatus = 1 (Technical Approval) AND userRole is 1016 (essensys Head of Provisioning), 1000 (essensys Project Manager) or 3 (Administrator)
    			 * OR
    			 * approvalStatus = 11 (Supervisor Approval) AND userID = supervisor OR userRole = 3 (Administrator)
    			 * 
    			 * orderType = 3 (Equipment) AND userRole is 1016 (essensys Head of Provisioning), 1000 (essensys Project Manager) or 3 (Administrator)
    			 * OR
    			 * userID = supervisor OR userRole = 3 (Administrator)
    			 */
    			
    			if ((approvalStatus == 1 && (userRole == 1016 || userRole == 1000 || userRole == 3)) || (approvalStatus == 11 && (userID == supervisor || userRole == 3)))
    				{
    					// get ID of current record
	    			  	var recordID = scriptContext.newRecord.id;
	    			        	
	    			  	// set client script to run on the form
	    			  	scriptContext.form.clientScriptFileId = 270003;
	    			  	
	    			  	// add button to the form
	    			  	scriptContext.form.addButton({
	    			  		id: 'custpage_reject',
	    			  		label: 'Reject',
	    			  		functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
	    			    });
    				}
    			else if (approvalStatus == 6) // if approvalStatus = 6 (Approved)
    				{
	    				// get ID of current record
	    			  	var recordID = scriptContext.newRecord.id;
	    			  	
	    			  	// set client script to run on the form
	    			  	scriptContext.form.clientScriptFileId = 270003;
	    			  	
	    			  	// retrieve field values from the record
	    			  	var orderType = currentRecord.getValue({
	    			  		fieldId: 'custbody_order_type'
	    			  	});
	    			  	
	    			  	var productType = currentRecord.getValue({
	    			  		fieldId: 'custbody_bbs_order_type'
	    			  	});
	    			  	
	    			  	var customerID = currentRecord.getValue({
	    			  		fieldId: 'entity'
	    			  	});
	    			  	
	    			  	var project = currentRecord.getValue({
	    			  		fieldId: 'job'
	    			  	});
	    			  	
	    			  	// add button to the form
	    			  	scriptContext.form.addButton({
	    			  		id: 'custpage_transform_to_sales_order',
	    			  		label: 'Agreed with Customer',
	    			  		functionName: "transformToSalesOrder(" + recordID + "," + orderType + "," + productType + "," + customerID + "," + project + ")" // call client script when button is clicked
	    			    });
    				}
    			
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// declare and initialize variables
		    	var premisesSummary = {};
		    	var recurringItems = 0;
		    	var setupItems = 0;
		    	var nonStandardOrder = false;
		    	
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get count of item lines
		    	var itemCount = currentRecord.getLineCount({
		    		sublistId: 'item'
		    	});
		    	
		    	// loop through items
		    	for (var i = 0; i < itemCount; i++)
		    		{
		    			// get the site from the line
		    			var siteID = currentRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_site',
		    				line: i
		    			});
		    			
		    			// if we have a site
		    			if (siteID)
		    				{
			    				// does the site exist in the premises summary, if not create a new entry
								if (!premisesSummary[siteID])
									{
										// call function to lookup fields on the site record
										var siteLookup = getSiteDetails(siteID);
									
										premisesSummary[siteID] = new libSiteObj(
											siteLookup.site,
											siteLookup.name,
											siteLookup.address1,
											siteLookup.address2,
											siteLookup.address3,
											siteLookup.city,
											siteLookup.state,
											siteLookup.zip
										);
									}
								
								// now we have done all summarising, we need to generate the output format
								var outputArray = new Array;
		
								const sortedSummary = {};
						                  
								for (siteID in sortedSummary)
									{
										delete sortedSummary[siteID]
									}
									      
								Object.keys(premisesSummary).sort().forEach(function(siteID) {
									sortedSummary[siteID] = premisesSummary[siteID];
								});
									      
								// loop through the summaries
								for (var siteID in sortedSummary)
									{
										// push a new instance of the output summary object onto the output array
										outputArray.push(new libSiteObj(
																			premisesSummary[siteID].site,
																			premisesSummary[siteID].name,
																			premisesSummary[siteID].address1,
																			premisesSummary[siteID].address2,
																			premisesSummary[siteID].address3,
																			premisesSummary[siteID].city,
																			premisesSummary[siteID].state,
																			premisesSummary[siteID].zip
																		)
										);
									}
		    				}
		    			
		    			// get values from the item line
		    			var rate = currentRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'rate',
		    				line: i
		    			});
		    			
		    			var billingSchedule = currentRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'billingschedule',
		    				line: i
		    			});
		    			
		    			var defaultRate = currentRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_default_rate',
		    				line: i
		    			});
		    			
		    			var defaultBillingSchedule = currentRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_default_billing_schedule',
		    				line: i
		    			});
		    			
		    			var setupFee = currentRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_setup_fee',
		    				line: i
		    			});
		    			
		    			// if this is a setup fee item
		    			if (setupFee == true)
		    				{
		    					// increase the setupItems variable
		    					setupItems++;
		    				}
		    			else
		    				{
		    					// increase the recurringItems variable
		    					recurringItems++;
		    				}
		    			
		    			// if the rate or billing schedule is different to the default
		    			if (rate != defaultRate || billingSchedule != defaultBillingSchedule)
		    				{
		    					// set nonStandardOrder to true
		    					nonStandardOrder = true;
		    				}
		    			
		    		}
		    	
		    	// update fields on the record
		    	currentRecord.setValue({
		    		fieldId: 'custbody_bbs_premises_json',
		    		value: JSON.stringify(outputArray)
		    	});
		    	
		    	currentRecord.setValue({
		    		fieldId: 'custbody_bbs_number_of_recurring_items',
		    		value: recurringItems
		    	});
		    	
		    	currentRecord.setValue({
		    		fieldId: 'custbody_bbs_number_of_setup_items',
		    		value: setupItems
		    	});
		    	
		    	currentRecord.setValue({
		    		fieldId: 'custbody_bbs_non_standard_order',
		    		value: nonStandardOrder
		    	});
		    	
    		}
    
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }
    
    // ============================================
    // FUNCTION TO LOOKUP FIELDS ON THE SITE RECORD
    // ============================================
    
    function getSiteDetails(siteID) {
    	
    	// declare and initialize variables
    	var state = null;
    	
    	// lookup fields on the site record
    	var siteLookup = search.lookupFields({
			type: 'customrecord_bbs_site',
			id: siteID,
			columns: ['name', 'custrecord_site_name', 'custrecord_bbs_site_address_1', 'custrecord_bbs_site_address_2', 'custrecord_bbs_site_address_3', 'custrecord_bbs_site_address_city', 'custrecord_bbs_site_address_state', 'custrecord_bbs_site_address_zip']
		});
    	
    	// check if we have a state on the site
    	if (siteLookup.custrecord_bbs_site_address_state.length > 0)
    		{
    			// get the state from the site lookup
    			state = siteLookup.custrecord_bbs_site_address_state[0].text;
    		}
    	
    	return {
    		site:			siteLookup.name,
    		name:			siteLookup.custrecord_site_name,
    		address1:		siteLookup.custrecord_bbs_site_address_1,
    		address2:		siteLookup.custrecord_bbs_site_address_2,
    		address3:		siteLookup.custrecord_bbs_site_address_3,
    		city:			siteLookup.custrecord_bbs_site_address_city,
    		state:			state,
    		zip:			siteLookup.custrecord_bbs_site_address_zip
    	}
    	
    }
    
    // =======
    // OBJECTS
    // =======
    
    function libSiteObj(site, name, address1, address2, address3, city, state, zip) {
    	
    	this.site		=	site;
    	this.name		=	name;
    	this.address1	=	address1;
    	this.address2	=	address2;
    	this.address3	=	address3;
    	this.city		=	city;
    	this.state		=	state;
    	this.zip		=	zip;
    	
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };
    
});
