/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Nov 2020     cedricgriffiths
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
			var newRecord 	= nlapiGetNewRecord();
			var newId 		= newRecord.getId();
			var newType 	= newRecord.getRecordType();
			var thisRecord 	= null;
			
			try
				{
					thisRecord = nlapiLoadRecord(newType, newId);
				}
			catch(err)
				{
					thisRecord = null;
				}
			
			if(thisRecord)
				{
					//Get the billing address info
					//
					var billaddress = thisRecord.viewSubrecord('billingaddress');
					var billContact = billaddress.getFieldValue('attention');

					//Get the shipping address info
					//
					var shipaddress = thisRecord.viewSubrecord('shippingaddress');
					var shipCountry = billaddress.getFieldText('country');

					//Set values
					//
					thisRecord.setFieldValue('custbody_bbs_destination_country', shipCountry);
					thisRecord.setFieldValue('custbody_bbs_buyer_contact', billContact);
					
					//Save
					//
					try
						{
							nlapiSubmitRecord(thisRecord, false, true);
						}
					catch(err)
						{
							thisRecord = null;
						}
				}
		}
}
