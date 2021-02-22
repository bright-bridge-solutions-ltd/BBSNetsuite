/**
 * Module Description
 * 
 * Version    	Date            Author          Remarks
 * 1.00       	02 Aug 2019     sambatten		Initial Version
 * 1.10			05 Aug 2019		sambatten		Added if statement to check custom form being used is 'SMI Standard Sales Order'
 * 1.20			09 Aug 2019		sambatten		Added if statement to check order doesn't contain any items with product codes starting 'CPHS'
 * 1.30			30 Aug 2019		sambatten		Added if statement to check the order status is 'Pending Approval' or 'Pending Fulfillment'
 * 1.40			26 Sep 2019		sambatten		Removed if statement to check order status as this wasn't working correctly when order is created (only working on edit)
 * 1.50			31 Oct 2019		sambatten		Removed execution context as 2019.2 now allows this to be set on the deployment record and amended script parameters
 * 1.60			15 Feb 2021		sambatten		Re-added if statement to check order status and changed function to after submit
 */

function afterSubmit(type)
	{
		// check the record is being created or edited
		if (type == 'create' || type == 'edit')
			{	
				// get the order status
				var status = nlapiGetFieldValue('status')
			
				// get the internal ID of the form being used
				var customForm = nlapiGetFieldValue('customform');
		              
		        // only continue with script when the custom form is 103 'SMI Standard Sales Order' AND status is Pending Approval or Pending Fulfilment
				if (customForm == 103 && (status == 'Pending Approval' || status == 'Pending Fulfilment'))
					{					
						// retrieve script parameters
						var biscuits = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_biscuits_item');
						var chocolates = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_chocolates_item');
						var biscuitsLevel = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_biscuits_level');
						nlapiLogExecution('DEBUG', 'Code Check', biscuitsLevel);
						biscuitsLevel = parseFloat(biscuitsLevel); // convert to integer number
						var chocolatesLevel = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_chocolates_level');
						chocolatesLevel = parseFloat(chocolatesLevel); // convert to integer number
									
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
								
						// declare variable called CPHSExists and initialize value
						var CPHSExists = false;
							
						// loop through item lines
						for (var a = 1; a <= itemCount; a++)
							{
								// get the text value of the item field for the line
								var itemCode = nlapiGetLineItemText('item', 'item', a);
								
								// check if the itemCode variable returns 'CPHS'. -1 will be returned if it desn't exist
								if (itemCode.search('CPHS') != -1)
									{
										// set the value of the CPHSExists variable to true
										CPHSExists = true;
												
										// break the loop
										break;
									}
							}
								
						// check that the CPHSExists variable returns true
						if (CPHSExists == true)
							{
								// save the record
								return true;
							}
						else // CPHSExists variable returns false
							{	
								// check if the total is greater than/equal to the biscuitsLevel variable AND less than the chocolatesLevel variable AND the freeBiscuits variable returns T
								if (freeBiscuits == 'T' && (total >= biscuitsLevel && total < chocolatesLevel))
									{
										// declare variable called alreadyExists and initialize value
										var alreadyExists = false;
														
										// loop through item lines
										for (var b = 1; b <= itemCount; b++)
											{
												// get the item ID from the line
												var item = nlapiGetLineItemValue('item', 'item', b);
								
												// check free chocolates item doesn't exist in the item sublist
												if (item == chocolates)
													{
														// remove the item from the sublist
														nlapiRemoveLineItem('item', b);
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
										for (var c = 1; c <= itemCount; c++)
											{
												// get the item ID from the line
												var item = nlapiGetLineItemValue('item', 'item', c);
									
												// check free biscuits item doesn't exist in the item sublist
												if (item == biscuits)
													{
														// remove the item from the sublist
														nlapiRemoveLineItem('item', c);
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
										for (var d = 1; d <= itemCount; d++)
											{
												// get the item ID from the line
												var item = nlapiGetLineItemValue('item', 'item', d);
									
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
												for (var e = 1; e <= itemCount; e++)
													{
														// get the item ID from the line
														var item = nlapiGetLineItemValue('item', 'item', e);
																					
														// check if the item is the free chocolates or free biscuits item
														if (item == chocolates || item == biscuits)
															{
																// remove the item from the sublist
																nlapiRemoveLineItem('item', e);
															}
													}
											}
									}
							}
					}
			}
	}