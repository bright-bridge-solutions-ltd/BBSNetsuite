/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    	
    	// only run script on create or edit
    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the ID of the current record
		    	var currentRecordID = currentRecord.id;
		    	
		    	// get the value of the 'Club' field from the current record
		    	var club = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_bl_club'
		    	});
		    	
		    	// get the value of the 'Charge Code' field from the current record
		    	var chargeCode = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_bl_charge_code'
		    	});
		    	
		    	// get the value of the 'Membership Type' field from the current record
		    	var membershipType = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_bl_membership_type'
		    	});
		    	
		    	// call function to return the Brightlime club, location and subsidiary IDs
		    	var blClubSearch = searchBLClubID(club);
		    	var blClubID = blClubSearch[0];
		    	var locationID = blClubSearch[1]
		    	var subsidiaryID = blClubSearch[2];
		    	
		    	// call function to return the Brightlime charge code and gl code
		    	var blChargeCodeSearch = searchBLChargeCode(chargeCode);
		    	var blChargeCodeID = blChargeCodeSearch[0];
		    	var glCodeID = blChargeCodeSearch[1];
		    	
		    	// call function to check if this is DD or Non DD
		    	var DD = searchBBSChargesDDList(membershipType);
		    	
		    	// call function to return the Brightlime Member Code
		    	var blMemberCode = searchBLType(membershipType);
    	
		    	// update fields on the current record
				record.submitFields({
					type: 'customrecord_bbs_brightlime_charges',
					id: currentRecordID,
					values: {
						custrecord_bbs_brightlime_club_id: blClubID,
						custrecord_bbs_bl_location1: locationID,
						custrecord_bbs_bl_subsidiary1: subsidiaryID,
						custrecord_bbs_brightlime_charge_code: blChargeCodeID,
						custrecord_bbs_bl_charge_member_code: blMemberCode,
						custrecord_bbs_bl_gl_account_id: glCodeID,
						custrecord_bbs_bl_dd_nondd: DD
					}			
				});
    		}

    }
    
    // ======================================================================
    // FUNCTIONS TO SEARCH AND RETURN VALUES TO POPULATE THE BL CHARGE RECORD
    // ======================================================================
    
    function searchBLClubID(club)
    	{
    		// declare new array to hold values to be returned
    		var returnValues = new Array();
    		
    		// declare and initialize variables
    		var blClubID = null;
    		var locationID = null;
    		var subsidiaryID = null;
    		
    		// create search to find the matching BrightLime Club ID record
    		var blClubSearch = search.create({
    			type: 'customrecordbbs_club_id',
    			
    			filters: [{
    				name: 'isinactive',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'name',
    				operator: 'is',
    				values: [club]
    			}],
    			
    			columns: [{
    				name: 'custrecord_bbs_bl_location'
    			},
    					{
    				name: 'custrecord_bbs_subsidiary2'
    			}],
    			
    		});
    		
    		// run search and process results
    		blClubSearch.run().each(function(result){
    			
    			// retrieve search results
    			blClubID = result.id;
    			
    			locationID = result.getValue({
    				name: 'custrecord_bbs_bl_location'
    			});
    			
    			subsidiaryID = result.getValue({
    				name: 'custrecord_bbs_subsidiary2'
    			});
    			
    		});
    		
    		// push values to the returnValues array
    		returnValues.push(blClubID);
    		returnValues.push(locationID);
    		returnValues.push(subsidiaryID);
    		
    		// return the returnValues array
    		return returnValues;
    		
    	}
    
    function searchBLChargeCode(chargeCode)
    	{
	    	// declare new array to hold values to be returned
			var returnValues = new Array();
			
			// declare and initialize variables
			var blChargeCodeID = null;
			var glCodeID = null;
			
			// create search to find the matching Brightlime Charge Code record
	    	var blChargeCodeSearch = search.create({
	    		type: 'customrecordbbs_brightlime_charge_code',
	    		
	    		filters: [{
	    			name: 'isinactive',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'name',
	    			operator: 'is',
	    			values: [chargeCode]
	    		}],
	    		
	    		columns:[{
	    			name: 'custrecordbbs_gl_code_id'
	    		}],
	    		
	    	});
	    	
	    	// run search and process results
	    	blChargeCodeSearch.run().each(function(result){
	    		
	    		// retrieve search results
	    		blChargeCodeID = result.id;
	    		
	    		glCodeID = result.getValue({
	    			name: 'custrecordbbs_gl_code_id'
	    		});
	    		
	    	});
	    	
	    	// push values to the returnValues array
	    	returnValues.push(blChargeCodeID);
	    	returnValues.push(glCodeID);
	    	
	    	// return the returnValues array
	    	return returnValues;
			
    	}
    
    function searchBBSChargesDDList(membershipType)
    	{
	    	// declare and intialize variables
    		var DD = false;
    		
    		// create search to find the matching BBS Charges DD List record
	    	var bbsChargesDDListSearch = search.create({
	    		type: 'customrecord_bbs_charges_dd_list',
	    		
	    		filters: [{
	    			name: 'isinactive',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				{
	    			name: 'name',
	    			operator: 'is',
	    			values: [membershipType]
	    		}],
	    		
	    		columns:[{
	    			name: 'internalid'
	    		}],
	    		
	    	});
	    	
	    	// run search and process results
	    	bbsChargesDDListSearch.run().each(function(result){
	    		
	    		// set DD variable to true
	    		DD = true;
	    		
	    	});
	    	
	    	// return DD variable
	    	return DD;
    	}
    
    function searchBLType(memberType)
    	{
    		// declare and initialize variables
    		var blMemberCode = null;
    		
    		// create search to find matching Brightlime Type record
    		var blTypeSearch = search.create({
    			type: 'customrecord_bbs_brightlime_types',
    			
    			filters: [{
    				name: 'isinactive',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'custrecord_bbs_brightlime_code',
    				operator: 'is',
    				values: [memberType]
    			}],
    			
    			columns: [{
    				name: 'custrecord_bbs_description'
    			}],
    			
    		});
    		
    		// run search and process results
    		blTypeSearch.run().each(function(result){
    			
    			// get the membership code
    			blMemberCode = result.getValue({
    				name: 'custrecord_bbs_description'
    			});
    			
    		});
    		
    		// return blMemberCode variable
    		return blMemberCode;
    	}

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
