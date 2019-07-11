/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jun 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function presentationRecordBL(type, form, request)
{
	if(type == 'view')
		{
			form.addButton('custpage_email_button', 'Email Documents To Partner', 'sendEmail()');
			form.setScript('customscript_bbs_pr_client');
		}
}

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
function presentationRecordAS(type)
{
	if(type == 'edit')
		{
			//Get the record id
			//
			var prId = nlapiGetRecordId();
			
			//Get the outstanding amount & the current status
			//
			var oustandingAmount = Number(nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_inv_outstanding', false));
			var status = nlapiLookupField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', false);
			
			//If the outstanding amount is zero & the current status is 'open', then mark it as paid in full
			//
			if(oustandingAmount == 0 && status != 2)
				{
					nlapiSubmitField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', '2', false);
				}

			//If the outstanding amount is not zero & the current status is 'paid in full', then mark it as open
			//
			if(oustandingAmount != 0 && status != 1)
				{
					nlapiSubmitField('customrecord_bbs_presentation_record', prId, 'custrecord_bbs_pr_status', '1', false);
				}
		}
}
