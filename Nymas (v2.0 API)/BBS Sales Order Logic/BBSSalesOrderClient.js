/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message'],
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
    	
    	// if the Customer PO Number field has been changed
    	if (scriptContext.fieldId == 'custbody_bbs_cust_po_number')
    		{  	
		    	// declare and initialize variables
		    	var salesOrders = 0;
		    	
		    	// get the current record
		    	var currentRecord = scriptContext.currentRecord;
		    	
		    	// get the internal ID of the current record
		    	var currentRecordID = currentRecord.id;
		    	
		    	// get the internal ID of the customer
		    	var customerID = currentRecord.getValue({
		    		fieldId: 'entity'
		    	});
		    	
		    	// get the value of the Customer PO Number field
		    	var customerPO = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_cust_po_number'
		    	});
		    	
		    	// check we have a Customer PO Number
		    	if (customerPO)
		    		{
				    	// create search to find existing sales orders for this sales order where this customer PO number has been used
				    	var soSearch = search.create({
				    		type: search.Type.SALES_ORDER,
				    		
				    		filters: [{
				    			name: 'mainline',
				    			operator: search.Operator.IS,
				    			values: ['T']
				    		},
				    				{
				    			name: 'mainname',
				    			operator: search.Operator.ANYOF,
				    			values: [customerID]
				    		},
				    				{
				    			name: 'custbody_bbs_cust_po_number',
				    			operator: search.Operator.IS,
				    			values: [customerPO]
				    		}],
				    		
				    		columns: [{
				    			name: 'tranid'
				    		}],
				    	
				    	});
				    	
				    	// if we have a current record ID (IE the Sales Order is being edited)
				    	if (currentRecordID)
				    		{
				    			// add an additional filter to the search to exclude the current record
				    			soSearch.filters.push(
				    									search.createFilter({
				    										name: 'internalid',
				    										operator: search.Operator.NONEOF,
				    										values: currentRecordID
				    									})
				    								);
				    		}
				    	
				    	// run the search and process results
				    	soSearch.run().each(function(result){
				    		
				    		// increase the salesOrders variable
				    		salesOrders++;
				    		
				    	});
				    	
				    	// if salesOrders is greater than 0
				    	if (salesOrders > 0)
				    		{
				    			// display an alert to the user
				    			message.create({
				    				type: message.Type.ERROR,
				    				title: '⚠️ Error',
				    				message: 'The Customer PO Number<b> ' + customerPO + '</b> has already been used on an existing Sales Order.<br><br>Please enter a unique Customer PO Number and try again.'
				    			}).show(5000); // show for 5 seconds
				    		
				    			// clear the Customer PO Number field
				    			currentRecord.setValue({
				    				fieldId: 'custbody_bbs_cust_po_number',
				    				value: null
				    			});
				    		}
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
        fieldChanged: fieldChanged
    };
    
});
