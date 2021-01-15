/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
   
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
    	
    	// if the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// declare and initialize variables
    			var address1 	= null;
    			var address2	= null;
    			var address3	= null;
    			var city		= null;
    			var county		= null;
    			var postcode	= null;
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the postcode from the shipping address subrecord
    			var postcode = currentRecord.getSubrecord({
    			    fieldId: 'shippingaddress'
    			}).getValue({
    				fieldId: 'zip'
    			});
    			
    			// check if the postcode contains a space
    			if (postcode.indexOf(" ") != -1)
    				{
    					// keep the characters before the space
    					postcode = postcode.split(" ").shift();
    					
    					// lookup the Menzies depot using the postcode
    					var menziesDepot = getMenziesDepot(postcode);
    					
    					// retrieve the menzies depot details
    					address1 	= menziesDepot.address1;
    					address2	= menziesDepot.address2;
    					address3	= menziesDepot.address3;
    					city		= menziesDepot.city;
    					county		= menziesDepot.county;
    					postcode	= menziesDepot.postcode;
    				}
    			
    			// replace the shipping address with the Menzies depot address details
    			var shippingAddress = currentRecord.getSubrecord({
    				fieldId: 'shippingaddress'
    			});
    			
    			shippingAddress.setValue({
    				fieldId: 'addressee',
    				value: 'Menzies Distribution'
    			});
    			
    			shippingAddress.setValue({
    				fieldId: 'addr1',
    				value: address1
    			});
    			
    			shippingAddress.setValue({
    				fieldId: 'addr2',
    				value: address2
    			});
    			
    			shippingAddress.setValue({
    				fieldId: 'addr3',
    				value: address3
    			});
    			
    			shippingAddress.setValue({
    				fieldId: 'city',
    				value: city
    			});
    			
    			shippingAddress.setValue({
    				fieldId: 'state',
    				value: county
    			});
    			
    			shippingAddress.setValue({
    				fieldId: 'zip',
    				value: postcode
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
    
    // =========================================
    // FUNCTION TO RETURN THE MENZIES DEPOT INFO
    // =========================================
    
    function getMenziesDepot(areaCode) {
    	
    	// declare and initialize variables
    	var address1 	= null;
    	var address2 	= null;
    	var address3 	= null;
    	var city 		= null;
    	var county 		= null;
    	var postcode 	= null;
    	
    	// search for the menzies depot by the area code
    	search.create({
    		type: 'customrecord_bbs_menzies_depot',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_menzies_depot_area_code',
    			operator: search.Operator.IS,
    			values: [areaCode]
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_menzies_depot_address_1'
    		},
    				{
    			name: 'custrecord_bbs_menzies_depot_address_2'
    		},
    				{
    			name: 'custrecord_bbs_menzies_depot_address_3'
    		},
    				{
    			name: 'custrecord_bbs_menzies_depot_city'
    		},
    				{
    			name: 'custrecord_bbs_menzies_depot_county'
    		},
    				{
    			name: 'custrecord_bbs_menzies_depot_postcode'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the address details from the search results
    		address1 = result.getValue({
    			name: 'custrecord_bbs_menzies_depot_address_1'
    		});
    		
    		address2 = result.getValue({
    			name: 'custrecord_bbs_menzies_depot_address_2'
    		});
    		
    		address3 = result.getValue({
    			name: 'custrecord_bbs_menzies_depot_address_3'
    		});
    		
    		city = result.getValue({
    			name: 'custrecord_bbs_menzies_depot_city'
    		});
    		
    		county = result.getValue({
    			name: 'custrecord_bbs_menzies_depot_county'
    		});
    		
    		postcode = result.getValue({
    			name: 'custrecord_bbs_menzies_depot_postcode'
    		});
    		
    	});
    	
    	// return the depot info to main script function
    	return {
    		address1:	address1,
    		address2:	address2,
    		address3:	address3,
    		city:		city,
    		county:		county,
    		postcode:	postcode
    	}
    	
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
