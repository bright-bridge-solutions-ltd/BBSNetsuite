/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
   
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
    	
    	// create search of records to be processed
    	return search.create({
    		type: 'customrecord_bbs_brightlime_charges',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_bl_club'
    		},
    				{
    			name: 'custrecord_bbs_bl_charge_code'
    		},
    				{
    			name: 'custrecord_bbs_bl_membership_type'
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
    	
    	// retrieve search result
    	var searchResult = JSON.parse(context.value);
    	var recordID = searchResult.id;
    	var club = searchResult.values['custrecord_bbs_bl_club'];
    	var chargeCode = searchResult.values['custrecord_bbs_bl_charge_code'];
    	var membershipType = searchResult.values['custrecord_bbs_bl_membership_type'];
    	
    	log.audit({
    		title: 'Processing Record',
    		details: 'Record ID: ' + recordID
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

    	try
    		{
		    	// update fields on the current record
				record.submitFields({
					type: 'customrecord_bbs_brightlime_charges',
					id: recordID,
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
				
				log.audit({
					title: 'Record Updated',
					details: recordID
				});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
    			})
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
    function summarize(summary) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

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
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
