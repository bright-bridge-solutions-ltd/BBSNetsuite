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
			var oldRecord = null;
			var record = null;
			var recordId = null;
			var recordType = null;
			
			//Get old or new record depending on action type
			//
			if(type == 'create' || type == 'edit')
				{		
					record = nlapiGetNewRecord();
					oldRecord = nlapiGetOldRecord();
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
						
						//Does this transaction have a pr linked to it? If so, we need to recalculate the PR record
						//
						if(presentationId != null && presentationId != '')
							{
								libRecalcPresentationRecord(presentationId);
								
								//If the invoice has a linked PR & the PR is on a DD batch detail record, then we will have to recalculate the amount paid if
								//the invoice has just been switched from "ok" to "in dispute" i.e. change the paid amount by the invoice amount
								//
								if(oldRecord != null)
									{
										var oldDisputeFlag = oldRecord.getFieldValue('custbody_bbs_disputed');
										var newDisputeFlag = record.getFieldValue('custbody_bbs_disputed');
										
										if(newDisputeFlag != oldDisputeFlag)
											{
												var oldInvoiceAmount = Number(oldRecord.getFieldValue('total'));
												var newInvoiceAmount = Number(record.getFieldValue('total'));
											
												//TODO recalculate the amount on the DD Batch detail record for this batch/pr record
												//
												
											}
										
									}
								
							}
						
						//If the invoice was on a PR, but it is now not on one, we need to recalculate the old PR record as well
						//
						if(oldRecord != null)
							{
								var oldPresentationId = oldRecord.getFieldValue('custbody_bbs_pr_id');
								
								if(oldPresentationId != null && oldPresentationId != '' && (presentationId == null || presentationId == ''))
									{
										libRecalcPresentationRecord(oldPresentationId);
									}
							}
						
						break;
						
					case 'customerpayment':
						
						var prToProcess = {};
						var applyCount = record.getLineItemCount('apply');
						var invoiceObject = {};
						var invoiceArray = [];
						
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
												
												invoiceObject[appliedTranId] = appliedTranId;
												
												
												//See if there is a PR record linked to this transaction
												//
												//var presentationId = nlapiLookupField('invoice', appliedTranId, 'custbody_bbs_pr_id', false);
												
												//Does this transaction have a pr linked to it?
												//
												//if(presentationId != null && presentationId != '')
												//	{
														//Build up a list of PR records to process
														//
												//		prToProcess[presentationId] = presentationId;
												//	}
												
											}
									}
							}
						
						for ( var invoiceObjectId in invoiceObject) 
							{
								invoiceArray.push(invoiceObjectId)
							}
						
						//New code to get list of PR records to update
						//
						var invoiceSearch = nlapiSearchRecord("invoice",null,
								[
								   ["type","anyof","CustInvc"], 
								   "AND", 
								   ["mainline","is","T"], 
								   "AND", 
								   ["internalid","anyof",invoiceArray]
								], 
								[
								   new nlobjSearchColumn("custbody_bbs_pr_id",null,"GROUP")
								]
								);
						
						if(invoiceSearch != null && invoiceSearch.length > 0)
							{
								for (var int2 = 0; int2 < invoiceSearch.length; int2++) 
									{
										var prId = invoiceSearch[int2].getValue("custbody_bbs_pr_id",null,"GROUP");
										prToProcess[prId] = prId;
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

