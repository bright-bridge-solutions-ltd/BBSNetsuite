/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Jul 2019     cedricgriffiths
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
function ddBatchDetailAS(type)
{
	var ddBatchDetailRecord = null;
	
	//Get the record we have been working with
	//
	if(type == 'delete')
		{
			ddBatchDetailRecord = nlapiGetOldRecord();
		}
	else
		{
			ddBatchDetailRecord = nlapiGetNewRecord();
		}
	
	if(ddBatchDetailRecord != null)
		{
			//Get the dd batch id & the pr id
			//
			var ddBatchId = ddBatchDetailRecord.getFieldValue('custrecord_bbs_dd_det_batch');
			var ddPrId = ddBatchDetailRecord.getFieldValue('custrecord_bbs_dd_det_pr');
		
			//Get the total value of batch details on this batch
			//
			var customrecordbbs_dd_batch_detSearch = nlapiSearchRecord("customrecordbbs_dd_batch_det",null,
					[
					   ["custrecord_bbs_dd_det_batch","anyof",ddBatchId]
					], 
					[
					   new nlobjSearchColumn("custrecord_bbs_dd_det_amount",null,"SUM")
					]
					);
			
			if(customrecordbbs_dd_batch_detSearch != null && customrecordbbs_dd_batch_detSearch.length == 1)
				{
					//Get the total value
					//
					var totalValue = Number(customrecordbbs_dd_batch_detSearch[0].getValue("custrecord_bbs_dd_det_amount",null,"SUM"));
				
					//Update the dd batch value
					//
					nlapiSubmitField('customrecord_bbs_dd_batch', ddBatchId, 'custrecord_bbs_dd_amount_to_process', totalValue, false);
				}
			
			
			//Get the total value of batch details for this pr record
			//
			var customrecordbbs_dd_batch_detSearch = nlapiSearchRecord("customrecordbbs_dd_batch_det",null,
					[
					   ["custrecord_bbs_dd_det_pr","anyof",ddPrId]
					], 
					[
					   new nlobjSearchColumn("custrecord_bbs_dd_det_amount",null,"SUM")
					]
					);
			
			if(customrecordbbs_dd_batch_detSearch != null && customrecordbbs_dd_batch_detSearch.length == 1)
				{
					//Get the total value
					//
					var totalValue = Number(customrecordbbs_dd_batch_detSearch[0].getValue("custrecord_bbs_dd_det_amount",null,"SUM"));
				
					nlapiSubmitField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_inv_proc_by_dd', totalValue, false);
					
					//Get the outstanding amount & the current status
					//
					var oustandingAmount = Number(nlapiLookupField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_inv_outstanding', false));
					var unAppliedAmount = Number(nlapiLookupField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_cn_unapplied', false));
					
					var status = nlapiLookupField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_status', false);
					var recordType = nlapiLookupField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_type', false);
					
					//If the PR record is an invoice & the outstanding amount is zero & the current status is 'open', then mark it as paid in full
					//
					if(recordType == 2 && oustandingAmount == 0 && status != 2)
						{
							nlapiSubmitField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_status', '2', false);
						}

					//If the PR record is an invoice & the outstanding amount is not zero & the current status is 'paid in full', then mark it as open
					//
					if(recordType == 2 && oustandingAmount != 0 && status != 1)
						{
							nlapiSubmitField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_status', '1', false);
						}
					
					//If the PR record is an credit note & the outstanding amount is zero & the current status is 'open', then mark it as paid in full
					//
					if(recordType == 1 && unAppliedAmount == 0 && status != 2)
						{
							nlapiSubmitField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_status', '2', false);
						}

					//If the PR record is an credit note & the outstanding amount is not zero & the current status is 'paid in full', then mark it as open
					//
					if(recordType == 1 && unAppliedAmount != 0 && status != 1)
						{
							nlapiSubmitField('customrecord_bbs_presentation_record', ddPrId, 'custrecord_bbs_pr_status', '1', false);
						}
				}
		}

}
