/**
 * Module Description
 * 
 * Version    	Date            Author          Remarks
 * 1.00       	02 Aug 2019     sambatten		Initial Version
 * 1.10			05 Aug 2019		sambatten		Added if statement to check custom form being used is 'SMI Standard Sales Order'
 */

function beforeSubmit(type)
	{
		// get the execution context
		var currentContext = nlapiGetContext();
		var executionContext = currentContext.getExecutionContext();
		
		// only run below code when the execution context is csvimport OR 
		if (executionContext == 'csvimport' || executionContext == 'webstore')
			{
				// get the internal ID of the form being used
				var customForm = nlapiGetFieldValue('customform');
				
				// only run below code when the customForm is 103 'SMI Standard Sales Order'
				if (customForm == 103)
					{
						// retrieve script parameters
						var biscuits = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_biscuits_ue');
						var chocolates = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_chocolates_ue');
						var biscuitsLevel = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_biscuits_level_ue');
						biscuitsLevel = parseInt(biscuitsLevel); // convert to integer number
						var chocolatesLevel = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_chocolates_level_ue');
						chocolatesLevel = parseInt(chocolatesLevel) // convert to integer number
							
						// get the internal ID of the customer from the current record
						var customerID = nlapiGetFieldValue('entity');
								
						// lookup the free biscuits checkbox on the customer record
						var freeBiscuits = nlapiLookupField('customer', customerID, 'custentity_freebiscuits');
								
						// lookup the free chocolates checkbox on the customer record
						var freeChocolates = nlapiLookupField('customer', customerID, 'custentity_freechoco');
								
						// get the sales order total from the current record
						var total = nlapiGetFieldValue('subtotal');
								
						// get a count of lines in the item sublist
						var itemCount = nlapiGetLineItemCount('item');
								
						// check if the total is greater than/equal to the biscuitsLevel variable AND less than the chocolatesLevel variable AND the freeBiscuits variable returns T
						if (freeBiscuits == 'T' && (total >= biscuitsLevel && total < chocolatesLevel))
							{
								// declare variable called alreadyExists and initialize value
								var alreadyExists = false;
										
								// loop through item lines
								for (var i = 1; i <= itemCount; i++)
									{
										// get the item ID from the line
										var item = nlapiGetLineItemValue('item', 'item', i);
				
										// check free chocolates item doesn't exist in the item sublist
										if (item == chocolates)
											{
												// remove the item from the sublist
												nlapiRemoveLineItem('item', i);
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
										nlapiSelectNewLineItem('item');
										
										// set the item, quantity and item rate field values on the new line
										nlapiSetCurrentLineItemValue('item', 'item', biscuits, false, true); // type, fldnam, value, firefieldchanged, synchronous
										nlapiSetCurrentLineItemValue('item', 'quantity', 1, false, true); // type, fldnam, value, firefieldchanged, synchronous
										nlapiSetCurrentLineItemValue('item', 'rate', 0.00, false, true); // type, fldnam, value, firefieldchanged, synchronous
												
										// commit the line
										nlapiCommitLineItem('item');
									}
							}
						
						// check if the total is greater than/equal to the chocolatesLevel variable AND the freeChocolates variable returns T
						else if (freeChocolates == 'T' && total >= chocolatesLevel)
							{
								// declare variable called alreadyExists and initialize value
								var alreadyExists = false;
										
								// loop through item lines
								for (var i = 1; i <= itemCount; i++)
									{
										// get the item ID from the line
										var item = nlapiGetLineItemValue('item', 'item', i);
					
										// check free biscuits item doesn't exist in the item sublist
										if (item == biscuits)
											{
												// remove the item from the sublist
												nlapiRemoveLineItem('item', i);
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
										nlapiSelectNewLineItem('item');
												
										// set the item, quantity and item rate field values on the new line
										nlapiSetCurrentLineItemValue('item', 'item', chocolates, false, true); // type, fldnam, value, firefieldchanged, synchronous
										nlapiSetCurrentLineItemValue('item', 'quantity', 1, false, true); // type, fldnam, value, firefieldchanged, synchronous
										nlapiSetCurrentLineItemValue('item', 'rate', 0.00, false, true); // type, fldnam, value, firefieldchanged, synchronous
												
										// commit the line
										nlapiCommitLineItem('item');
									}
							}
								
						else // transaction total is below the rules set so we need to check the item sublist doesn't contain either of the free items
							{
								// declare variable called freeItemsExist and initialise value
						    	var freeItemsExist = false;
				
						    	// loop through item lines
								for (var i = 1; i <= itemCount; i++)
									{
										// get the item ID from the line
										var item = nlapiGetLineItemValue('item', 'item', i);
					
										// check free chocolates or biscuits items don't already exist in the item sublist
										if (item == chocolates || item == biscuits)
											{
												// set value of freeItemsExist variable to true
						    					freeItemsExist = true;
						    						
						    					// escape loop
						    					break;
											}
									}
										
								// check if the freeItemsExist variable returns true
								if (freeItemsExist == true)
									{
										// loop through item lines
										for (var i = 1; i <= itemCount; i++)
											{
												// get the item ID from the line
												var item = nlapiGetLineItemValue('item', 'item', i);
																	
												// check if the item is the free chocolates or free biscuits item
												if (item == chocolates || item == biscuits)
													{
														// remove the item from the sublist
														nlapiRemoveLineItem('item', i);
													}
											}
									}
							}
					}
			}
	}