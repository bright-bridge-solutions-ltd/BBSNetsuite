/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/runtime', 'N/search', 'N/ui/dialog'],

function(currentRecord, runtime, search, dialog) {
    
    function saveRecord(context) {
    	
    	var record = currentRecord.get();
    	var currentScript = runtime.getCurrentScript();
    	
    	// retrieve script parameters
	    var biscuits = currentScript.getParameter({
	    	name: 'custscript_free_biscuits'
	    });
	    		
		var chocolates = currentScript.getParameter({
			name: 'custscript_free_chocolates'
	    });
				
		var biscuitsLevel = currentScript.getParameter({
	    	name: 'custscript_free_biscuits_level'
	    });

		biscuitsLevel = parseInt(biscuitsLevel); // convert to integer number
				
		var chocolatesLevel = currentScript.getParameter({
	    	name: 'custscript_free_chocolates_level'
	    });
				
		chocolatesLevel = parseInt(chocolatesLevel) // convert to integer number
		
		
		log.debug({
			title: 'Parameters',
			details: 'Biscuits: ' + biscuitsLevel + ' / Chocolates ' + chocolatesLevel
		});
				
		// get the internal ID of the customer from the current record
		var customerID = record.getValue({
			fieldId: 'entity'
		});
				
		// lookup the free biscuits and free chocolates checkboxs on the customer record
		var freeItems = search.lookupFields({
			type: search.Type.CUSTOMER,
			id: customerID,
			columns: ['custentity_freebiscuits', 'custentity_freechoco']
		});
				
		freeBiscuits = freeItems.custentity_freebiscuits;
		freeChocolates = freeItems.custentity_freebiscuits;
		
		log.debug({
			title: 'Free Items',
			details: 'Biscuits: ' + freeBiscuits + ' / Chocolates ' + freeChocolates
		});
				
		// get the sales order total from the current record
		var total = record.getValue({
			fieldId: 'subtotal'
		});
		
		
				
		// get a count of lines in the item sublist
		var lineCount = record.getLineCount({
			sublistId: 'item'
		});
				
		// check if the total is greater than/equal to the biscuitsLevel variable AND less than the chocolatesLevel variable AND the freeBiscuits variable returns true
		if (freeBiscuits == true && (total >= biscuitsLevel && total < chocolatesLevel))
			{
				// declare variable called alreadyExists and initialize value
				var alreadyExists = false;
						
				// loop through item lines
				for (var i = 0; i < lineCount; i++)
					{
						// get the item ID from the line
						var item = record.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
								
						// check free chocolates item doesn't exist in the item sublist
						if (item == chocolates)
							{
								// remove the item from the sublist
								record.removeLine({
									sublistId: 'item',
									line: i
								});
							}
								
						// check free biscuits item doesn't already exist in the item sublist
						else if (item == biscuits)
							{
								// set value of alreadyExists variable to true
								alreadyExists = true;
							}
					}
						
				// check that the alreadyExists variable returns false
				if (alreadyExists == false)
					{
						// select a new line item
						record.selectNewLine({
							sublistId: 'item'
						});
								
						// set the item, quantity and rate field values on the new line
						record.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							value: biscuits
						});
								
						record.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							value: 1
						});
								
						record.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'rate',
							value: 0.00
						});
								
						// commit the line
						record.commitLine({
							sublistId: 'item'
						});
					}
				
				// save the record
				return true;
			}
				
		// check if the total is greater than/equal to the chocolateslevel variable AND the freeChocolates variable returns true		
		else if (freeChocolates == true && total >= chocolatesLevel)
			{
				// declare variable called alreadyExists and initialize value
				var alreadyExists = false;
			
				// loop through item lines
				for (var i = 0; i < lineCount; i++)
					{
						// get the item ID from the line
						var item = record.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
							
						// check free biscuits item doesn't exist in the item sublist
						if (item == biscuits)
							{
								// remove the item from the sublist
								record.removeLine({
									sublistId: 'item',
									line: i
								});
							}
								
						// check free chocolates item doesn't already exist in the item sublist
						else if (item == chocolates)
							{
								// set value of alreadyExists variable to true
								alreadyExists = true;
							}
					}
					
			// check that the alreadyExists variable returns false
			if (alreadyExists == false)
				{
					// select a new line item
					record.selectNewLine({
						sublistId: 'item'
					});
							
					// set the item, quantity and rate field values on the new line
					record.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						value: chocolates
					});
							
					record.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
							
					record.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: 0.00
					});
							
					// commit the line
					record.commitLine({
						sublistId: 'item'
					});
				}
			
				// save the record
				return true;
			}
				
		else // transaction total is below the rules set so we need to check the item sublist doesn't contain either of the free items
			{
				// declare variable called freeItemsExist and initialise value
	    		var freeItemsExist = false;
	    		
	    		// loop through line count
	        	for (var i = 0; i < lineCount; i++)
	        		{
	        			// get the itemID from the line
	        			var item = record.getSublistValue({
	        				sublistId: 'item',
	        				fieldId: 'item',
	        				line: i
	        			});
	        			
	        			// check free chocolates or biscuits items don't already exist in the item sublist
	    				if (item == chocolates || item == biscuits)
	    					{
	    						// set value of freeItemsExist variable to true
	    						freeItemsExist = true;
	    						
	    						// escape loop
	    						break;
	    					}
	        		}
	        	
	        	// check if freeItemsExist variable returns true
	        	if (freeItemsExist == true)
	        		{
		        		// display alert to warn the user and ask them if they want to remove the free items
						var confirmDialog = {
								title: 'Warning',
								message: 'The transaction total is below the level to include free items. Would you like to remove the free items from the order?'
						};
						
						function success() {
					    	 
					    	// loop through line count
					    	for (var i = 0; i < lineCount; i++)
					    		{
					    			// get the itemID from the line
					    			var item = record.getSublistValue({
					    				sublistId: 'item',
					    				fieldId: 'item',
					    				line: i
					    			});
					    			
					    			// check free chocolates or biscuits items don't already exist in the item sublist
									if (item == chocolates || item == biscuits)
										{
											// remove the item from the sublist
											record.removeLine({
												sublistId: 'item',
												line: i
											});
										}
					    		}
					    	
					    	// allow the record to be saved
					    	return true;
					    }
						
						function failure() {
					    	
					    	dialog.create({
					    		title: 'Failure',
					    		details: 'This has failed'
					    	});
							
							// allow the record to be saved
					    	return true;
					    }
						
						dialog.confirm(confirmDialog).then(success).catch(failure);
	        		}
	        	else
	        		{
	        			// allow the record to be saved
	        			return true;
	        		}
			}				
	}

    return {
        saveRecord: saveRecord
    };
    
});
