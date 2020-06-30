/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/dialog', 'N/search'],
function(runtime, dialog, search) {
    
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
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	var mandatoryAttachmentsLimit = currentScript.getParameter({
    		name: 'custscript_bbs_po_file_attachment_limit'
    	});
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	var currentRecordID = currentRecord.id;
    	
    	// get the PO total
    	var poTotal = currentRecord.getValue({
    		fieldId: 'total'
    	});
    	
    	// check if the poTotal variable is greater than mandatoryAttachmentsLimit
    	if (poTotal > mandatoryAttachmentsLimit)
    		{
    			// is the record is being edited
    			if (currentRecordID)
    				{
	    				// call search to return number of files attached to the record
						var fileCount = searchFiles(currentRecordID);
						
						// check if the fileCount variable is less than 1 (IE no files have been attached)
		    			if (fileCount < 1)
		    				{
		    					// get the currency symbol
		    					var currencySymbol = currentRecord.getValue({
		    						fieldId: 'custbody_bbs_currency_symbol'
		    					});
		    				
		    					// display alert to the user
			    				dialog.alert({
			        				title: '⚠️ Error',
			        				message: 'File attachments are mandatory for Purchase Orders over <b>' + currencySymbol + mandatoryAttachmentsLimit + '</b>.<br><br>Please attach a file and try again.'
			        			});
		    				}
		    			else // at least 1 file has been attached
		    				{
		    					// allow the record to be saved
		    					return true
		    				}
    				}
    			else // record is being created
    				{
    					// get a count of lines on the 'Files' sublist
		    			var fileCount = currentRecord.getLineCount({
		    				sublistId: 'mediaitem'
		    			});
		    			
		    			// check if the fileCount variable is less than 1 (IE no files have been attached)
		    			if (fileCount < 1)
		    				{
		    					// get the currency symbol
		    					var currencySymbol = currentRecord.getValue({
		    						fieldId: 'custbody_bbs_currency_symbol'
		    					});
		    				
		    					// display alert to the user
			    				dialog.alert({
			        				title: '⚠️ Error',
			        				message: 'File attachments are mandatory for Purchase Orders over <b>' + currencySymbol + mandatoryAttachmentsLimit + '</b>.<br><br>Please attach a file and try again.'
			        			});
		    				}
		    			else // at least 1 file has been attached
		    				{
		    					// allow the record to be saved
		    					return true
		    				}
    				}
    		}
    	else // poTotal is less than/equal to mandatoryAttachmentsLimit
    		{
	    		// allow the record to be saved
				return true;
    		}

    }
    
    // ===================================================
    // FUNCTION TO CHECK IF PURCHASE ORDER HAS ATTACHMENTS
    // ===================================================
    
    function searchFiles(currentRecordID) {
    	
    	// declare and initialize variables
    	var fileCount = 0;
    	
    	// run search to find files attached to the record
    	search.create({
    		type: search.Type.PURCHASE_ORDER,
    		
    		filters: [{
    			name: 'internalid',
    			operator: 'anyof',
    			values: [currentRecordID]
    		},
    				{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		}],
    		
    		columns: [{
    			name: 'internalid',
    			join: 'file',
    			summary: 'COUNT',
    			sort: search.Sort.ASC
    		}],
    		
    	}).run().each(function(result) {
    		
    		// get the number of files from the search
    		fileCount = result.getValue({
    			name: 'internalid',
    			join: 'file',
    			summary: 'COUNT'
    		});
    		
    	});
    	
    	// return fileCount to main script function
    	return fileCount;
    	
    }

    return {
        saveRecord: saveRecord
    };
    
});
