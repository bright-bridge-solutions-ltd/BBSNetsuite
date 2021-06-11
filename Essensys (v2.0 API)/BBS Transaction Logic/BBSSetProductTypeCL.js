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
    	
    	if (scriptContext.fieldId == 'class')
			{
				var productCategory = scriptContext.currentRecord.getValue({
					fieldId: 'class'
				});
				
				if (productCategory)
					{
						// call function to find the relevant product type for the selected class and set the product type field
						scriptContext.currentRecord.setValue({
							fieldId: 'custbody_bbs_order_type',
							value: getProductType(productCategory)
						});
					}
			}

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
    
    function getProductType(productCategory) {
    	
    	// declare and initialize variables
    	var productType = null;
    	
    	// run search to find the relevant product type(s) for the selected product category
    	var searchResults = getResults(
    										search.create({
    											type: 'customrecord_bbs_order_type',
    											
    											filters: [{
    												name: 'isinactive',
    												operator: search.Operator.IS,
    												values: ['F']
    											},
    													{
    												name: 'custrecord_bbs_order_type_product_cat',
    												operator: search.Operator.ANYOF,
    												values: [productCategory]
    											}],
    											
    											columns: [{
    												name: 'name'
    											}],
    											
    										})
    									);
    	
    	// if only one result has been found
    	if (searchResults.length == 1)
    		{
    			// get the product type from the first search result
    			productType = searchResults[0].id;
    		}
    	
    	return productType;
    	
    }
    
  function getResults(_searchObject) {
	    	
	  var results = [];
	
	  var pageData = _searchObject.runPaged({pageSize: 1000});
	
	  for (var int = 0; int < pageData.pageRanges.length; int++) 
	   	{
		  	var searchPage = pageData.fetch({index: int});
	    	
		  	var data = searchPage.data;
	    			
	    	results = results.concat(data);
	    }
	
	  return results;
  }

    return {
        postSourcing: postSourcing
    };
    
});
