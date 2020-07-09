/**
 * Module Description
 * 
 * Version    	Date            Author         	Remarks
 * 1.00       	09 Nov 2018     suceen		   	Get location address when creating purchase order.
 * 1.10			08 Jul 2020		sambatten		Amended beforeLoad function to prevent script error
 */


function poBeforeSubmit(type)
	{
		// check the record is being created
		if (type == 'create') 
			{
				// get the location from the record
				var location = nlapiGetFieldValue('location');
			
				// check we have a location
				if (location)
					{
						// load the location record
						var locationRec = nlapiLoadRecord('location', location);
				
						// get the address from the location record
						var address = locationRec.getFieldValue('mainaddress_text');
						
						// set the delivery address field on the PO
						nlapiSetFieldValue('custbodypo_delviery_address', address);
						
						nlapiLogExecution('DEBUG', 'Address:-', address);
					}
			}
	}

function poUserEventBeforeLoad(type, form, request)
	{
		// get the user's role
		var userRole = nlapiGetRole();
	
		// check the user's role is not 3 (Administrator) AND the record is being created or edited
		if (userRole != 3 && (type == 'create' || type == 'edit'))
			{
				// get line item fields
				var amount = nlapiGetLineItemField('item', 'amount');
				var taxAmount = nlapiGetLineItemField('item', 'tax1amt');
				var grossAmount = nlapiGetLineItemField('item', 'grossamt');
					
				// check we can get the amount field
				if (amount)
					{
						// disable the amount field
						amount.setDisplayType('disabled');
					}
							
				// check we can get the tax amount field
				if (taxAmount)
					{
						// disable the tax amount field
						taxAmount.setDisplayType('disabled');
					}
							
				// check we can get the gross amount field
				if (grossAmount)
					{
						// disable the gross amount field
						grossAmount.setDisplayType('disabled');
					}
			}
	}