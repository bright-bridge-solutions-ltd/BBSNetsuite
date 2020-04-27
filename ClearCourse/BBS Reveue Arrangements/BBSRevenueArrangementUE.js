/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Apr 2020     cedricgriffiths
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
function revenueArrangementAS(type)
{
	//Only process if on edit of the invoice or credit note
	//
	if(type == 'edit')
		{
			//Get info about the record we are processing
			//
			var newRecord 		= nlapiGetNewRecord();
			var currentId 		= newRecord.getId();
			var currentType 	= newRecord.getRecordType();
			var currentRecord 	= null;
			
			//Try to load the record we are working with
			//
			try
				{
					currentRecord = nlapiLoadRecord(currentType, currentId);
				}
			catch(err)
				{
					currentRecord = null;
				}
			
			//Did we get the record ok?
			//
			if(currentRecord != null)
				{
					//Get the transaction id of the current record
					//
					var currentTransactionTranid = (currentType == 'invoice' ? 'CustInvc_' : 'CustCred_') + currentId
					
					//Find all the lines on the current record
					//
					var lineCount = currentRecord.getLineItemCount('item');
					
					//Loop through all of the lines
					//
					for (var lineCounter = 1; lineCounter <= lineCount; lineCounter++) 
						{
							//Get the info from the line
							//
							var lineRevRecStart = currentRecord.getLineItemValue('item', 'custcol_cle_rev_rec_sta_dat', lineCounter);
							var lineRevRecEnd 	= currentRecord.getLineItemValue('item', 'custcol_cle_rev_rec_end_dat', lineCounter);
							var lineUniqueKey 	= currentRecord.getLineItemValue('item', 'lineuniquekey', lineCounter);
							
							updateRevenueArrangement(currentTransactionTranid, lineUniqueKey, lineRevRecStart, lineRevRecEnd);
							
							
						}
				}
		}
}

function updateRevenueArrangement(_currentTransactionTranid, _currentLineUniqueKey, _startDate, _endDate)
{
	//Find a revenue element for the current record
	//
	var revenueelementSearch = nlapiSearchRecord("revenueelement",null,
			[
			   ["referenceid","is", _currentTransactionTranid]
			], 
			[
				new nlobjSearchColumn("internalid","revenueArrangement",null)
			]
			);
	
	if(revenueelementSearch != null && revenueelementSearch.length > 0)
		{
			//Loop through the search results
			//
			for (var resultCounter = 0; resultCounter < revenueelementSearch.length; resultCounter++) 
				{
					var revArrangementId = revenueelementSearch[resultCounter].getValue("internalid","revenueArrangement");
		
					//Have we got an associated revenue arrangement
					//
					if(revArrangementId != null && revArrangementId != '')
						{
							var arrangementRecord = null;
						
							//Try to load the revenue arrangement record
							//
							try
								{
									arrangementRecord = nlapiLoadRecord('revenuearrangement', revArrangementId);
								}
							catch(err)
								{
									arrangementRecord = null;
									nlapiLogExecution('ERROR', 'Error loading revenue arrangement, id = ' + revArrangementId, err.message);
								}
							
							if(arrangementRecord != null)
								{
									var arrangementUpdated = false;
									
									//Process the revenue arrangement record elements
									//
									var elementCount = arrangementRecord.getLineItemCount('revenueelement');
									
									//Loop through the elements
									//
									for (var elementCounter = 1; elementCounter <= elementCount; elementCounter++) 
										{
											//Get the source from the line
											//
											var elementReferenceId 		= arrangementRecord.getLineItemValue('revenueelement', 'referenceid', elementCounter);
											var elementSourceId 		= arrangementRecord.getLineItemValue('revenueelement', 'sourceid', elementCounter);
											var elementRevRecStartDate 	= arrangementRecord.getLineItemValue('revenueelement', 'revrecstartdate', elementCounter);
											var elementRevRecEndDate 	= arrangementRecord.getLineItemValue('revenueelement', 'revrecenddate', elementCounter);
											
											//Check to make sure that everything matches
											//
											if(elementReferenceId == _currentTransactionTranid && elementSourceId == _currentLineUniqueKey)
												{
													//Now see if the dates have changed
													//
													if(elementRevRecStartDate != _startDate || elementRevRecEndDate != _endDate)
														{
															//Update the element
															//
															arrangementRecord.setLineItemValue('revenueelement', 'revrecstartdate', elementCounter, _startDate);
															arrangementRecord.setLineItemValue('revenueelement', 'revrecenddate', elementCounter, _endDate);
															
															arrangementUpdated = true;											
														}
												}
										}
								
									//Save the revenue arrangement record
									//
									if(arrangementUpdated)
										{
											try
												{
													nlapiSubmitRecord(arrangementRecord, false, true);
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Error saving revenue arrangement, id = ' + revArrangementId, err.message);
												}
										}
								}
						}
				}
		}
}

