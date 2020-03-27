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
		    	// declare and initialize variables
		    	var brightlimeClubID = null;
		    	var locationID = null;
		    	var subsidiaryID = null;
		    	var brightlimeChargeCodeID = null;
		    	var glCodeID = null;  		
		    	var DD = false;
		    	
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
		    	
		    	// create search to find the matching BrightLime Club ID record
		    	var brightlimeClubSearch = search.create({
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
		    	brightlimeClubSearch.run().each(function(result){
		    		
		    		// retrieve search results
		    		brightLimeClubID = result.id;
		    		
		    		locationID = result.getValue({
		    			name: 'custrecord_bbs_bl_location'
		    		});
		    		
		    		subsidiaryID = result.getValue({
		    			name: 'custrecord_bbs_subsidiary2'
		    		});
		    		
		    	});
		    	
		    	// create search to find the matching Brightlime Charge Code record
		    	var brightlimeChargeCodeSearch = search.create({
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
		    	brightlimeChargeCodeSearch.run().each(function(result){
		    		
		    		// retrieve search results
		    		brightlimeChargeCodeID = result.id;
		    		
		    		glCodeID = result.getValue({
		    			name: 'custrecordbbs_gl_code_id'
		    		});
		    		
		    	});
		    	
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
		    	
		    	// update fields on the current record
				record.submitFields({
					type: 'customrecord_bbs_brightlime_charges',
					id: currentRecordID,
					values: {
						custrecord_bbs_brightlime_club_id: brightLimeClubID,
						custrecord_bbs_bl_location1: locationID,
						custrecord_bbs_bl_subsidiary1: subsidiaryID,
						custrecord_bbs_brightlime_charge_code: brightlimeChargeCodeID,
						custrecord_bbs_bl_gl_account_id: glCodeID,
						custrecord_bbs_bl_dd_nondd: DD
					}			
				});
    		}

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
