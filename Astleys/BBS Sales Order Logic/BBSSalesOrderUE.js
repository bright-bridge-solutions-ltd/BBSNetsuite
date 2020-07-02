/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Jul 2020     cedricgriffiths
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
function salesOrderAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var salesOrderRecord 	= nlapiGetNewRecord();
			var shipAddressId 		= salesOrderRecord.getFieldValue('shippingaddress_key');
			var customerId 			= salesOrderRecord.getFieldValue('entity');
			var salesOrderId 		= salesOrderRecord.getId();
			
			if(shipAddressId != null && shipAddressId != '')
				{
					var customerRecord = null;
					
					try
						{
							customerRecord = nlapiLoadRecord('customer', customerId);
						}
					catch(err)
						{
							customerRecord = null;
							nlapiLogExecution('ERROR', 'Error loading customer record', err.message);
						}
					
					if(customerRecord != null)
						{
							var addressLines 			= customerRecord.getLineItemCount('addressbook');
							var addressShippingMethod 	= null;
							
							for (var int = 1; int <= addressLines; int++) 
								{
									var addressSubRecord = customerRecord.viewLineItemSubrecord('addressbook', 'addressbookaddress', int);
									var addressId = addressSubRecord.getId();
									
									if(addressId == shipAddressId)
										{
											addressShippingMethod = addressSubRecord.getFieldValue('custrecord_bbs_shipping_method');
											
											break;
										}
								}
							
							if(addressShippingMethod != null && addressShippingMethod != '')
								{
									try
										{
											nlapiSubmitField('salesorder', salesOrderId, 'shipmethod', addressShippingMethod, true);
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Error updating sales order with shipping method', err.message);
										}
								}
						}
				}
		}
}
