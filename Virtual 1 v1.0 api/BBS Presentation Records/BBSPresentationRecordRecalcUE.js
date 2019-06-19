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
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function prRecordRecalcUE(type)
{
	//Only works for create, edit or delete actions
	//
	if(type == 'create' || type == 'edit' || type == 'delete')
		{
			//Get some basic details
			//
			var record = null;
			var recordId = null;
			var recordType = null;
			
			//Get old or new record depending on action type
			//
			if(type == 'create' || type == 'edit')
				{		
					record = nlapiGetNewRecord();
				}
					
			if(type == 'delete')
				{		
						record = nlapiGetOldRecord();
				}
			
			recordId = record.getId();
			recordType = record.getRecordType();
			
			//Process based on record type being actioned
			//
			switch(recordType)
				{
					case 'invoice':
					case 'creditmemo':
						
						//See if there is a PR record linked to this transaction
						//
						var presentationId = record.getFieldValue('custbody_bbs_pr_id');
						
						//Does this transaction have a pr linked to it?
						//
						if(presentationId != null && presentationId != '')
							{
								libRecalcPresentationRecord(presentationId);
							}
						
						break;
						
					case 'customerpayment':
						
						var prToProcess = {};
						var applyCount = record.getLineItemCount('apply');
						
						//Loop through all of the apply to sublist
						//
						for (var int = 1; int <= applyCount; int++) 
							{
								var applied = record.getLineItemValue('apply', 'apply', int);
								
								//Has the line beed applied?
								//
								if(applied == 'T')
									{
										var appliedTranType = record.getLineItemValue('apply', 'trantype', int);
										
										//Is the applied to transaction an invoice?
										//
										if(appliedTranType == 'CustInvc')
											{
												var appliedTranId = record.getLineItemValue('apply', 'internalid', int);
												
												//See if there is a PR record linked to this transaction
												//
												var presentationId = nlapiLookupField('invoice', appliedTranId, 'custbody_bbs_pr_id', false);
												
												//Does this transaction have a pr linked to it?
												//
												if(presentationId != null && presentationId != '')
													{
														//Build up a list of PR records to process
														//
														prToProcess[presentationId] = presentationId;
													}
											}
									}
							}
						
						//Now process any PR records that have been affected
						//
						for ( var presentationId in prToProcess) 
							{
								libRecalcPresentationRecord(presentationId);
							}
						
						break;
				}
		}
}

