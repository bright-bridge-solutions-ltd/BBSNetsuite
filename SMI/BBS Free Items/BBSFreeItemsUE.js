/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Jul 2019     sambatten
 *
 */

function freeItemsBeforeSubmit(type)
	{
		// check if the record is being created or edited
		if (type == 'create' || type == 'edit')
			{
				// retrieve script parameters
				var biscuits = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_biscuits');
				var chocolates = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_chocolates');
				var biscuitsLevel = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_biscuits_level');
				biscuitsLevel = parseInt(biscuitsLevel); // convert to integer number
				var chocolatesLevel = nlapiGetContext().getSetting('SCRIPT', 'custscript_free_chocolates_level');
				chocolatesLevel = parseInt(chocolatesLevel) // convert to integer number
			
				// get the internal ID of the customer from the current record
				var customerID = nlapiGetFieldValue('entity');
				
				// lookup the free biscuits checkbox on the customer record
				var freeBiscuits = nlapiLookupField('customer', customerID, 'custentity_freebiscuits');
				
				// lookup the free chocolates checkbox on the customer record
				var freeChocolates = nlapiLookupField('customer', customerID, 'custentity_freechoco');
				
				// get the sales order total from the current record
				var total = nlapiGetFieldValue('total');
				
				// get a count of lines in the item sublist
				var itemCount = nlapiGetLineItemCount('item');
				
				// check if the total is greater than/equal to the chocolatesLevel variable AND less than the biscuitsLevel variable AND the freeChocolates variable returns T
				if (freeChocolates == 'T' && (total >= chocolatesLevel && total < biscuitsLevel))
					{
						// declare variable called alreadyExists and initialize value
						var alreadyExists = 'F';
						
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
										// set value of alreadyExists variable to 'T'
										alreadyExists = 'T';
									}
							}
					
						// check that the alreadyExists variable returns 'F'
						if (alreadyExists == 'F')
							{
								// select a new line item
								nlapiSelectNewLineItem('item');
								
								// set the item, quantity and item rate field values on the new line
								nlapiSetCurrentLineItemValue('item', 'item', chocolates);
								nlapiSetCurrentLineItemValue('item', 'quantity', 1);
								nlapiSetCurrentLineItemValue('item', 'rate', 0.00);
								
								// commit the line
								nlapiCommitLineItem('item');
							}
					}
				// check if the total is greater than/equal to the biscuitsLevel variable AND the freeBiscuits variable returns T
				else if (freeBiscuits == 'T' && total >= biscuitsLevel)
					{
						// declare variable called alreadyExists and initialize value
						var alreadyExists = 'F';
						
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
										// set value of alreadyExists variable to 'T'
										alreadyExists = 'T';
									}
							}
					
						// check that the alreadyExists variable returns 'F'
						if (alreadyExists == 'F')
							{
								// select a new line item
								nlapiSelectNewLineItem('item');
								
								// set the item, quantity and item rate field values on the new line
								nlapiSetCurrentLineItemValue('item', 'item', biscuits);
								nlapiSetCurrentLineItemValue('item', 'quantity', 1);
								nlapiSetCurrentLineItemValue('item', 'rate', 0.00);
								
								// commit the line
								nlapiCommitLineItem('item');
							}
					}
				else // transaction total is below the rules set so we need to check the item sublist doesn't contain either of the free items
					{
						// loop through item lines
						for (var i = 1; i <= itemCount; i++)
							{
								// get the item ID from the line
								var item = nlapiGetLineItemValue('item', 'item', i);
	
								// check free chocolates or biscuits items don't already exist in the item sublist
								if (item == chocolates || item == biscuits)
									{
										// remove the item from the sublist
										nlapiRemoveLineItem('item', i);
									}
							}
					}
			}
	}
