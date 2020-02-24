/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Feb 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function carrierIntFulfilmentAS(type)
{
	switch(type)
		{
			case 'create':
			case 'edit':
				//See if we need to create a consignment
				
				break;
				
			case 'delete':
				//If we are deleting the item fulfilment & there is a consignment assigned to it, we need to see if we can delete the consignment
				//
				
				
				
				break
	
		}
}
