/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search'],
function(runtime, search) {
   
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
    	
    	// check if the record is being viewed
    	if (scriptContext.type == 'view')
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord; 
		    	
		    	// get the value of the 'Approval Status' field
		    	var approvalStatus = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_approval_status'
		    	});
		    	
		    	// get the ID of the current user's role
		    	var userRole = runtime.getCurrentUser().role;
		    	
		    	/* If statement to check that the following conditions are met:
		    	 * 
		    	 * approvalStatus variable returns 1 (Technical Approval)
		    	 * AND
		    	 * userRole variable returns 1014 (essensys COO (from CEO)), 1016 (essensys Head of Provisioning), 1000 (essensys Project Manager) or 3 (Administrator)
		    	 * OR
		    	 * approvalStatus variable returns 2 (Finance Approval)
		    	 * OR
		    	 * userRole variable 1012 (essensys CFO), 1013 (essensys Director of Finance) or 3 (Administator)
		    	 */

		    	if ((approvalStatus == 1 && (userRole == 1014 || userRole == 1016 || userRole == 1000 || userRole == 3)) || (approvalStatus == 2 && (userRole == 1012 || userRole == 1013 || userRole == 3)))
		    		{
			    		// get ID of current record
			        	var recordID = scriptContext.newRecord.id;
			        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 44585;
			    	
			    		// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Reject',
			    			functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID and userID to client script
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
    	
    	// declare and initialize variables
    	var premisesSummary = {};
    	
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
    		}
    	
    	// set the premises JSON field on the record
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_premises_json',
    		value: JSON.stringify(outputArray)
    	});

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
    	
    	// lookup fields on the site record
    	var siteLookup = search.lookupFields({
			type: 'customrecord_bbs_site',
			id: siteID,
			columns: ['name', 'custrecord_site_name', 'custrecord_bbs_site_address_1', 'custrecord_bbs_site_address_2', 'custrecord_bbs_site_address_3', 'custrecord_bbs_site_address_city', 'custrecord_bbs_site_address_state', 'custrecord_bbs_site_address_zip']
		});
    	
    	return {
    		site:			siteLookup.name,
    		name:			siteLookup.custrecord_site_name,
    		address1:		siteLookup.custrecord_bbs_site_address_1,
    		address2:		siteLookup.custrecord_bbs_site_address_2,
    		address3:		siteLookup.custrecord_bbs_site_address_3,
    		city:			siteLookup.custrecord_bbs_site_address_city,
    		state:			siteLookup.custrecord_bbs_site_address_state[0].text,
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
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
