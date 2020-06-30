/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
    
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
		    	// get the current record object
		    	var currentRecord = scriptContext.currentRecord;
		    	
		    	// get the value of the 'Ship to Select' field
				var shipToSelect = currentRecord.getValue({
					fieldId: 'shipaddresslist'
				});
		    	
		    	// check that we have a shipping address and that it does not equal -2 (custom)
		    	if (shipToSelect != '' && shipToSelect != '-2')
		    		{
			    		// create search to find this address record
						var addressSearch = search.create({
							type: search.Type.CUSTOMER,
							
							filters: [{
								name: 'formulanumeric',
								formula: '{address.addressinternalid}',
								operator: 'equalto',
								values: [shipToSelect]
							}],
							
							columns: [{
								name: 'custrecord_bbs_delivery_notes',
								join: 'address'
							}],
						});
						
						// run search and process results
						addressSearch.run().each(function(result) {
							
							// get the delivery notes from the search
							deliveryNotes = result.getValue({
								name: 'custrecord_bbs_delivery_notes',
								join: 'address'
							});
							
							// set the delivery notes field on the sales order
							currentRecord.setValue({
								fieldId: 'custbody_bbs_order_delivery_notes',
								value: deliveryNotes
							});
							
						});
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
    	
    	// check if the 'Ship To Select' field has been changed
    	if (scriptContext.fieldId == 'shipaddresslist')
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get the value of the 'Ship to Select' field
    			var shipToSelect = currentRecord.getValue({
    				fieldId: 'shipaddresslist'
    			});
    			
    			// check that we have a shipping address and that it does not equal -2 (custom)
    	    	if (shipToSelect != '' && shipToSelect != '-2')
    	    		{
		    	    	// create search to find this address record
		    	    	var addressSearch = search.create({
		    	    		type: search.Type.CUSTOMER,
		    				
		    				filters: [{
		    					name: 'formulanumeric',
		    					formula: '{address.addressinternalid}',
		    					operator: 'equalto',
		    					values: [shipToSelect]
		    				}],
		    				
		    				columns: [{
		    					name: 'custrecord_bbs_delivery_notes',
		    					join: 'address'
		    				}],
		    			});
		    			
		    			// run search and process results
		    			addressSearch.run().each(function(result) {
		    				
		    				// get the delivery notes from the search
		    				deliveryNotes = result.getValue({
		    					name: 'custrecord_bbs_delivery_notes',
		    					join: 'address'
		    				});
		    				
		    				// set the delivery notes field on the sales order
							currentRecord.setValue({
								fieldId: 'custbody_bbs_order_delivery_notes',
								value: deliveryNotes
							});
		    				
		    			});
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

    return {
    	pageInit: pageInit,
        fieldChanged: fieldChanged
    };
    
});
