/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/url', 'N/ui/dialog'],
function(search, url, dialog) {
    
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
    	
    	// if the customer select field has been changed
    	if (scriptContext.fieldId == 'customerselect')
    		{
    			// get the value of the customer select field
    			var customerID = scriptContext.currentRecord.getValue({
    				fieldId: 'customerselect'
    			});
    			
    			// if we have a customer selected
    			if (customerID)
    				{
		    			// get the URL of the Suitelet
						var suiteletURL = url.resolveScript({
							scriptId: 'customscript_bbs_generate_price_list_sl',
							deploymentId: 'customdeploy_bbs_generate_price_list_sl',
							params: {
								customer: customerID
							}
						});
						
						// reload the Suitelet
    					window.onbeforeunload = null;
						window.location.href = suiteletURL;
    				}
    		}
    	else if (scriptContext.sublistId == 'itemsublist' && scriptContext.fieldId == 'item')
    		{
    			// get the value of the item field from the current sublist line
    			var itemID = scriptContext.currentRecord.getCurrentSublistValue({
    				sublistId: 'itemsublist',
    				fieldId: 'item'
    			});
    			
    			// if we have an item
    			if (itemID)
    				{
    					// call function to lookup fields on the item record
    					var itemDetails = getItemDetails(itemID);
    					
    					// update price fields on the current line
    					scriptContext.currentRecord.setCurrentSublistValue({
    	    				sublistId: 'itemsublist',
    	    				fieldId: 'tradeprice',
    	    				value: itemDetails.tradeprice
    	    			});
    					
    					scriptContext.currentRecord.setCurrentSublistValue({
    	    				sublistId: 'itemsublist',
    	    				fieldId: 'costprice',
    	    				value: itemDetails.costprice
    	    			});
    					
    					scriptContext.currentRecord.setCurrentSublistValue({
    	    				sublistId: 'itemsublist',
    	    				fieldId: 'customprice',
    	    				value: itemDetails.customprice
    	    			});
    				}
    		}
    	else if (scriptContext.sublistId == 'itemsublist' && (scriptContext.fieldId == 'sellingprice' || scriptContext.fieldId == 'quantity'))
    		{
    			// get the value of the selling price and quantity fields from the current sublist line
    			var sellingPrice = scriptContext.currentRecord.getCurrentSublistValue({
    				sublistId: 'itemsublist',
    				fieldId: 'sellingprice'
    			});
    			
    			var quantity = scriptContext.currentRecord.getCurrentSublistValue({
    				sublistId: 'itemsublist',
    				fieldId: 'quantity'
    			});
    			
    			// check we have a selling price and a quantity
    			if (sellingPrice && quantity)
    				{
	    				// calculate the line total
	        			var lineTotal = parseFloat(sellingPrice * quantity);
	        			
	        			// set the line total field on the current line
	        			scriptContext.currentRecord.setCurrentSublistValue({
    	    				sublistId: 'itemsublist',
    	    				fieldId: 'linetotal',
    	    				value: lineTotal
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
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getItemDetails(itemID) {
    	
    	// declare and initialize variables
    	var tradePrice	= null;
    	var costPrice	= null;
    	var customPrice	= null;
    	
    	// lookup fields on the item record
    	var itemLookup = search.lookupFields({
    		type: 'item',
    		id: itemID,
    		columns: ['baseprice', 'costestimate']
    	});
    	
    	// retrieve values from the item lookup
    	tradePrice 	= itemLookup.baseprice;
    	costPrice 	= itemLookup.costestimate;
    	
    	// return values to the main script function
    	return {
    		tradeprice: 	tradePrice,
    		costprice:		costPrice,
    		customprice:	customPrice
    	}
    	
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
