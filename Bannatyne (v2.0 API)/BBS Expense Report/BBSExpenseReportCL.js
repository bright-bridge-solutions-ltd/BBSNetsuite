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
    	
    	// check if the quantity field on the expense sublist has been changed
    	if (scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'quantity')
    		{
    			// get the current record object
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get the value of the quantity field for the current expense line
    			var quantity = currentRecord.getCurrentSublistValue({
    				sublistId: 'expense',
    				fieldId: 'quantity'
    			});
    			
    			// set the 'BBS Expense Line Quantity' field on the current expense line
    			currentRecord.setCurrentSublistValue({
    				sublistId: 'expense',
    				fieldId: 'custcol_bbs_exp_line_quantity',
    				value: quantity
    			});
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
    	
    	// get the current record object
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the value of the rate field for the current line
    	var lineRate = currentRecord.getCurrentSublistValue({
    		sublistId: 'expense',
    		fieldId: 'rate'
    	});
    	
    	// check that the line rate is '0.25'
    	if (lineRate == '0.25')
    		{
    			// allow the line to be saved
    			return true;
    		}
    	else
    		{
    			// declare and initiate variables
		    	var mileageTotal = 0;
		    	
		    	// get the current record object
		    	var currentRecord = scriptContext.currentRecord;
		    	
		    	// get count of expense sublist lines
		    	var lineCount = currentRecord.getLineCount({
		    		sublistId: 'expense'
		    	});
		    	
		    	// check if lineCount is greater than 0
		    	if (lineCount > 0)
		    		{
		    			// loop through line count
		    			for (var i = 0; i < lineCount; i++)
		    				{
		    					// get the value of the expense category field
		    					var expenseCategory = currentRecord.getSublistValue({
		    						sublistId: 'expense',
		    						fieldId: 'category',
		    						line: i
		    					});
		    					
		    					// check if expenseCategory is 1 (Mileage)
		    					if (expenseCategory == '1')
		    						{
		    							// get the quantity from the line
		    							var lineQuantity = currentRecord.getSublistValue({
		    								sublistId: 'expense',
		    								fieldId: 'quantity',
		    								line: i
		    							});
		    							
		    							// add the line quantity to the mileageTotal
		    							mileageTotal += lineQuantity;
		    						}
		    				}
		    		}
		    	
		    	// get the quantity for the current line
		    	var lineQuantity = currentRecord.getCurrentSublistValue({
		    		sublistId: 'expense',
		    		fieldId: 'quantity'
		    	});
		    	
		    	// add the line quantity to the mileageTotal
		    	mileageTotal += lineQuantity;
		    	
		    	// get the internal ID of the employee
		    	var employee = currentRecord.getValue({
		    		fieldId: 'entity'
		    	});
		    	
		    	// run search to find total mileage lines for this employee for this year
		    	var mileageSearch = search.create({
		    		type: search.Type.EXPENSE_REPORT,
		    		
		    		filters: [{
		    			name: 'expensecategory',
		    			operator: 'anyof',
		    			values: ['1'] // 1 = Mileage
		    		},
		    				{
		    			name: 'expensedate',
		    			operator: 'within',
		    			values: ['thisyear']
		    		},
		    				{
		    			name: 'employee',
		    			operator: 'anyof',
		    			values: [employee]
		    		}],
		    		
		    		columns: [{
		    			name: 'custcol_bbs_exp_line_quantity',
		    			summary: 'SUM'
		    		}],
		    	});
		    	
		    	// run search and process results
		    	mileageSearch.run().each(function(result) {
		    		
		    		// get the total mileage quantity from the search
		    		var mileageSearchTotal = result.getValue({
		    			name: 'custcol_bbs_exp_line_quantity',
		    			summary: 'SUM'
		    		});
		    		
		    		// add the mileage total from the search to the mileageTotal
		    		mileageTotal += parseFloat(mileageSearchTotal);
		    		
		    	});
		    	
		    	// use parseFloat to convert mileageTotal to a floating point number
		    	mileageTotal = parseFloat(mileageTotal);
		    	
		    	// get the quantity for the current line
		    	var lineQuantity = currentRecord.getCurrentSublistValue({
		    		sublistId: 'expense',
		    		fieldId: 'quantity'
		    	});
		    	
		    	log.debug({
		    		title: 'Script Check',
		    		details: 'Expense Line Count: ' + lineCount + '<br>Employee: ' + employee + '<br>Mileage Total: ' + mileageTotal
		    	});
		    	
		    	// check if mileageTotal is less than or equal to 10000
		    	if (mileageTotal <= 10000)
		    		{
		    			// allow the line to be saved
		    			return true;
		    		}
		    	else // mileageTotal is greater than 10000
		    		{
			    		// get the currency from the record
		    			var currency = currentRecord.getValue({
		    				fieldId: 'expensereportcurrency'
		    			});
		    		
		    			// work out how many miles over the 10000 allowance we are
		    			var overage = mileageTotal - 10000;
		    			
		    			// get the expense date for the current line
			        	var expenseDate = currentRecord.getCurrentSublistValue({
			        		sublistId: 'expense',
			        		fieldId: 'expensedate'
			        	});
			        	
			        	// get the expense category for the current line
			        	var expenseCategory = currentRecord.getCurrentSublistValue({
			        		sublistId: 'expense',
			        		fieldId: 'category'
			        	});
			        			
			        	// calculate the quantity for the current line. This will be lineQuantity - overage
			        	var newLineQuantity = lineQuantity - overage;
			        			
			        	// set the quantity on the current line using the newLineQuantity variable
			        	currentRecord.setCurrentSublistValue({
			        		sublistId: 'expense',
			        		fieldId: 'quantity',
			        		value: newLineQuantity
			        	});
			        	
			        	// save the sublist line
			    		currentRecord.commitLine({
			    			sublistId: 'expense'
			    		});
			        	
			        	// select a new line on the expense sublist
			        	currentRecord.selectNewLine({
			        		sublistId: 'expense'
			        	});
			        	
			        	// set fields on the new line
			        	currentRecord.setCurrentSublistValue({
			        		sublistId: 'expense',
			        		fieldId: 'expenseDate',
			        		value: expenseDate
			        	});
			        	
			        	currentRecord.setCurrentSublistValue({
			    			sublistId: 'expense',
			    			fieldId: 'category',
			    			value: expenseCategory
			    		});
			        	
			        	currentRecord.setCurrentSublistValue({
			        		sublistId: 'expense',
			        		fieldId: 'quantity',
			        		value: overage
			        	});
			        	
			        	currentRecord.setCurrentSublistValue({
			    			sublistId: 'expense',
			    			fieldId: 'rate',
			    			value: '0.25'
			    		});
			    		
			    		currentRecord.setCurrentSublistValue({
			    			sublistId: 'expense',
			    			fieldId: 'currency',
			    			value: currency
			    		});
			    		
			    		currentRecord.setCurrentSublistValue({
			    			sublistId: 'expense',
			    			fieldId: 'amount',
			    			value: overage * 0.25
			    		});
		    		}
    		}
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
    	
    	return true;

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
        /*pageInit: pageInit,*/
        fieldChanged: fieldChanged,
        /*postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,*/
        validateLine: validateLine/*,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord*/
    };
    
});
