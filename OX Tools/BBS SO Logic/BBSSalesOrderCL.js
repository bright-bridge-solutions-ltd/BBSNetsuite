/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/dialog'],
function(search, dialog) {
    
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
    	
    	if (scriptContext.fieldId == 'shipdate')
			{
	    		// get the ship date
	        	var shipDate = scriptContext.currentRecord.getValue({
	        		fieldId: 'shipdate'
	        	});
	        	
	        	// get count of item lines
	        	var lineCount = scriptContext.currentRecord.getLineCount({
	        		sublistId: 'item'
	        	});
	        	
	        	// loop through item lines
	        	for (var i = 0; i < lineCount; i++)
	        		{
	        			// set the supply required by date field on the line
	        			scriptContext.currentRecord.selectLine({
	        				sublistId: 'item',
	        				line: i
	        			});
	        			
	        			scriptContext.currentRecord.setCurrentSublistValue({
	        				sublistId: 	'item',
	        				fieldId: 	'requesteddate',
	        				value: 		shipDate
	        			});
	        			
	        			scriptContext.currentRecord.commitLine({
	        				sublistId: 'item'
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
<<<<<<< HEAD
    function postSourcing(scriptContext) 
    	{
	    	if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
				{
		    		// set the supply required by date field on the current line using the header ship date field
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 	'item',
						fieldId:	'requesteddate',
						value: 		scriptContext.currentRecord.getValue({
			        					fieldId: 'shipdate'
			        				})
					});        	
				}
    	
    		var sublistId 	= scriptContext.sublistId;
    		var fieldId		= scriptContext.fieldId;
    		
    		if(sublistId == 'item' && fieldId == 'item')
    			{
    				//Lookup the item record
    				//
	    			var itemSearchObj = getResults(search.create({
								    				   type: 	"item",
								    				   filters:
											    				   [
											    				      ["internalid","anyof","13169"]
											    				   ],
								    				   columns:
											    				   [
											    				      search.createColumn({name: "custitem_bbs_moq", label: "MOQ UK"}),
											    				      search.createColumn({name: "minimumquantity", label: "Minimum Quantity"})
											    				   ]
								    				}));
	    			
	    			if(itemSearchObj != null && itemSearchObj.length > 0)
	    				{
	    					var moqCheck = itemSearchObj[0].getValue({name: "custitem_bbs_moq"});
	    					var moqValue = itemSearchObj[0].getValue({name: "minimumquantity"});
	    					
	    					if(moqCheck == 'T')
	    						{
			    					dialog.alert({
													title: 		'Minimum Order Quantity Alert',
													message: 	'This product needs to be ordered in multiples of ' + moqValue
												});
	    						}
	    				}
    			}
	    }
=======
    function postSourcing(scriptContext) {
    	
    	if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
    		{
	    		// set the supply required by date field on the current line using the header ship date field
    			scriptContext.currentRecord.setCurrentSublistValue({
    				sublistId: 	'item',
    				fieldId:	'requesteddate',
    				value: 		scriptContext.currentRecord.getValue({
    	        					fieldId: 'shipdate'
    	        				})
    			});        	
    		}
>>>>>>> branch 'master' of https://github.com/bright-bridge-solutions-ltd/BBSNetsuite.git

    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
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
    	
    	if (scriptContext.sublistId == 'item')
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// get the item ID
    			var itemID = currentRecord.getCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'item'
    			});
    			
    			var isItemBrexitRestricted = false;
    			
    			// call function to lookup fields on the item record
    			if(itemID != null && itemID != '')
    				{
    					isItemBrexitRestricted = getItemInfo(itemID);
    				}
    			
    			// if this is a brexit restricted item
    			if (isItemBrexitRestricted == true)
    				{
    					// get the customer ID
    					var customerID = currentRecord.getValue({
    						fieldId: 'entity'
    					});
    					
    					// call function to lookup fields on the customer record
    					var isCustomerBrexitRestricted = false;
    					
    					if(customerID != null && customerID != '')
    						{
    							isCustomerBrexitRestricted = getCustomerInfo(customerID);
    						}
    					
    					// if this is a brexit restricted customer
    					if (isCustomerBrexitRestricted == true)
    						{
    							// display a warning and don't let the user save the line
    							dialog.alert({
    								title: '🇪🇺 Brexit Restricted',
    								message: 'This item cannot be sold to this customer as it is brexit restricted.<br><br>Please select a different item.'
    							});
    						}
    					else
    						{
    							// allow the line to be saved
    							return true;
    						}
    				}
    			else
    				{
    					// allow the line to be saved
    					return true;
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
    
    function getItemInfo(itemID) {
    	
    	// lookup fields on the item record
    	return search.lookupFields({
    		type: search.Type.ITEM,
    		id: itemID,
    		columns: ['custitem_bbs_brexit_restricted']
    	}).custitem_bbs_brexit_restricted;
    	
    }
    
    function getCustomerInfo(customerID) {
    	
    	// lookup fields on the customer record
    	return search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['custentity_bbs_brexit_restricted']
    	}).custentity_bbs_brexit_restricted;
    	
    }

    return {
        fieldChanged:	fieldChanged,
        postSourcing:	postSourcing,
    	validateLine: 	validateLine
    };
    
});
