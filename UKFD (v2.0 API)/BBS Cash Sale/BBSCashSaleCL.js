/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search'],
function(runtime, search) {
    
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
		    	// get the parameters from the URL
		    	var params 				= new URLSearchParams(location.search);
		    	var collection			= params.get('collection');
		    	var collectionFee		= params.get('collectionfee');
		    	var returnAuthorisation	= params.get('returnauthorisation');
		    	var locationID			= params.get('location');
		    	
		    	// if the collection parameter returns true
		    	if (collection == 'true')
		    		{
		    			// retrieve script parameters
		    			var currentScript = runtime.getCurrentScript();
		    		
		    			var collectionItem = currentScript.getParameter({
		    				name: 'custscript_bbs_collection_fee_item'
		    			});
		    			
		    			var taxCode = currentScript.getParameter({
		    				name: 'custscript_bbs_collection_fee_tax_code'
		    			});
		    			
		    			// lookup fields on the collection item record
		    			var productCategory = search.lookupFields({
		    				type: search.Type.OTHER_CHARGE_ITEM,
		    				id: collectionItem,
		    				columns: ['custitem_product_category']
		    			}).custitem_product_category[0].value;
		    		
		    			// get the current record
		    			var currentRecord = scriptContext.currentRecord;
		    			
		    			// add a new line to the item sublist
		    			currentRecord.selectLine({
		    				sublistId: 'item',
		    				line: 0
		    			});
		    			
		    			currentRecord.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'item',
		    				value: collectionItem
		    			});
		    			
		    			currentRecord.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'quantity',
		    				value: 1
		    			});
		    			
		    			currentRecord.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'rate',
		    				value: collectionFee
		    			});
		    			
		    			currentRecord.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'taxcode',
		    				value: taxCode
		    			});
		    			
		    			currentRecord.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'location',
		    				value: locationID
		    			});
		    			
		    			currentRecord.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_product_category',
		    				value: productCategory
		    			});

		    			currentRecord.commitLine({
		    				sublistId: 'item'
		    			});
		    			
		    			// set the linked RA field
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_linked_ra',
		    				value: returnAuthorisation
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
        pageInit: pageInit
    };
    
});
