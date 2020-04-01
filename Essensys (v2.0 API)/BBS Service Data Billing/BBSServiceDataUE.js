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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
    		{
		    	// declare and initialize variables
		    	var siteRecord = null;
		    	var itemRecord = null;
		    	var validationErrors = '';
		    	
		    	// get the current record object
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the value of the 'Site Alias' field
		    	var siteAlias = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_service_data_site_alias'
		    	});
		    	
		    	// get the value of the 'Parent Product' field
		    	var parentProduct = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_service_data_parent_prod'
		    	});
		    	
		    	// check that we have a site alias
		    	if (siteAlias)
		    		{
				    	// create search to find site record with this external ID
				    	var siteSearch = search.create({
				    		type: 'customrecord_bbs_site',
				    		
				    		filters: [{
				    			name: 'externalid',
				    			operator: 'anyof',
				    			values: [siteAlias]
				    		}],
				    		
				    		columns: [{
				    			name: 'name'
				    		}],
				    	});
				    	
				    	// run search and process results
				    	siteSearch.run().each(function(result){
				    		
				    		// get the internal id of the site record from the search
				    		siteRecord = result.id;
				    		
				    	});
				    	
				    	// check if we have a matching site record
				    	if (siteRecord)
				    		{
				    			// set the 'BBS Site Record' field on the current record
				    			currentRecord.setValue({
				    				fieldId: 'custrecord_bbs_service_data_site_record',
				    				value: siteRecord
				    			});
				    		}
				    	else // no site record found
				    		{
					    		// set the 'BBS Site Record' field on the current record to null
				    			currentRecord.setValue({
				    				fieldId: 'custrecord_bbs_service_data_site_record',
				    				value: null
				    			});
				    		
				    			log.error({
				    				title: 'No Matching Site Record Found',
				    				details: 'Site Alias: ' + siteAlias
				    			});
				    			
				    			validationErrors += 'No Matching Site Record Found<br>';
				    			
				    			log.debug({
				    				title: 'Validation Errors',
				    				details: validationErrors
				    			});
				    		}
		    		}
		    	else
		    		{
		    			validationErrors += 'Site Alias Field is Empty<br>';
		    		}
		    	
		    	// check we have a product
		    	if (parentProduct)
		    		{    	
				    	// create search to find item record with this item ID
				    	var itemSearch = search.create({
				    		type: search.Type.ITEM,
				    		
				    		filters: [{
				    			name: 'itemid',
				    			operator: 'is',
				    			values: [parentProduct]
				    		}],
				    		
				    		columns: [{
				    			name: 'itemid'
				    		}],
				    	});
				    	
				    	// run search and process results
				    	itemSearch.run().each(function(result){
				    		
				    		// get the internal id of the item from the search
				    		itemRecord = result.id;
				    		
				    	});
				    	
				    	// check if we have a matching item record
				    	if (itemRecord)
				    		{
				    			// set the 'BBS Item Record' field on the current record
				    			currentRecord.setValue({
				    				fieldId: 'custrecord_bbs_service_data_product_rec',
				    				value: itemRecord
				    			});
				    		}
				    	else // no item record found
				    		{
					    		// set the 'BBS Item Record' field on the current record to null
				    			currentRecord.setValue({
				    				fieldId: 'custrecord_bbs_service_data_product_rec',
				    				value: null
				    			});
				    		
				    			log.error({
				    				title: 'No Matching Product Record Found',
				    				details: 'Item Alias: ' + parentProduct
				    			});
				    			
				    			validationErrors += 'No Matching Product Record Found<br>';
				    		}
		    		}
		    	else
		    		{
		    			validationErrors += 'Parent Product Field is Empty<br>';
		    		}
		    	
		    	// set the 'Validation Errors' field on the current record
		    	currentRecord.setValue({
		    		fieldId: 'custrecord_bbs_service_data_validate_err',
		    		value: validationErrors
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

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
