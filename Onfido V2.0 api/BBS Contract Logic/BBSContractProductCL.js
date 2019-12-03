/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message'],
/**
 * @param {search} search
 */
function(search, message) {
    
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
    	
    	// declare and initiate variables
    	var contracts = 0;
    	
    	// get the current record object
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the internal ID of the contract record
    	var contractID = currentRecord.getValue({
    		fieldId: 'custrecord_contract_product_parent'
    	});
    	
    	// get the internal ID of the item
    	var itemID = currentRecord.getValue({
    		fieldId: 'custrecord_contract_product_product'
    	});
    	
    	// create search to find records where this contract has been used previously
    	var productSearch = search.create({
    		type: 'customrecord_bbs_contract_product',
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    		filters: [{
    			name: 'custrecord_contract_product_parent',
    			operator: 'anyof',
    			values: [contractID]
    		},
    				{
    			name: 'custrecord_contract_product_product',
    			operator: 'anyof',
    			values: [itemID]
    		}],
    	});
    	
    	// run search and process results
    	productSearch.run().each(function(result) {
    		
    		// increase contracts variable
    		contracts++;
    		
    	});
    	
    	// check if the contracts variable is greater than 0
    	if (contracts > 0)
    		{
    			// display an alert to the user
        		message.create({
                    title: 'Error', 
                    message: 'This item has already been added to the contract.<br><br>Please choose a different item and try again, or click cancel to return to the contract record.',
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

    return {
        saveRecord: saveRecord
    };
    
});
