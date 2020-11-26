/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Nov 2020     cedricgriffiths
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
function userEventAfterSubmit(type)
{
	if(type == 'create')
		{
			var woRecord = nlapiGetNewRecord();
			var woId = woRecord.getId();
			woRecord = nlapiLoadRecord('workorder', woId);
			
			var woQty = Number(woRecord.getFieldValue('quantity'));
			var woMoulds = woRecord.getFieldValue('custbody_bbs_nos_moulds');
			
			if(woMoulds != null && woMoulds != '' && woMoulds != '0')
				{
					woMoulds = Number(woMoulds);
				
					//var copies = (woQty / woMoulds) - 1;
					var copies = woQty - 1;
					
					var fields = [
								'title',
								'operationsequence',
								'message',
								'setuptime',
								'runrate',
								'manufacturingcosttemplate',
								'manufacturingworkcenter',
								'machineresources',
								'laborresources',
								'inputquantity'
								];
					
					//Find all operations for the works order
					//
					var manufacturingoperationtaskSearch = getResults(nlapiCreateSearch("manufacturingoperationtask",
							[
							   ["workorder","anyof",woId]
							], 
							[
							   new nlobjSearchColumn("name"), 
							   new nlobjSearchColumn("internalid"), 
							   new nlobjSearchColumn("sequence").setSort(false)
							]
							));
					
					//Get the list of all operations on the work order, hold the id's in an array & also find the last sequence number
					//
					if(manufacturingoperationtaskSearch != null && manufacturingoperationtaskSearch.length > 0)
						{
							var lastSeq = Number(0);
							var opIds = [];
							
							for (var int = 0; int < manufacturingoperationtaskSearch.length; int++) 
								{
									var operationId = manufacturingoperationtaskSearch[int].getValue("internalid");
									lastSeq = Number(manufacturingoperationtaskSearch[int].getValue("sequence"));
								
									opIds.push(operationId);
									
									nlapiSubmitField('manufacturingoperationtask', operationId, 'inputquantity', 1, true);
								}
							
							//Loop through the operations & copy them
							//
							for (var copyCount = 0; copyCount < copies; copyCount++) 
								{
									for (var int = 0; int < opIds.length; int++) 
										{
											//Load the old record
											//
											var oldRecord = nlapiLoadRecord('manufacturingoperationtask', opIds[int]);
		
											//Find the lag time from the predecessor
											//
											var predecessorLines = oldRecord.getLineItemCount('predecessor');
											var lagamount 	= '';
											var lagtype 	= '';
											var lagunits 	= '';
											
											for (var int2 = 1; int2 <= predecessorLines; int2++) 
												{
													lagamount = oldRecord.getLineItemValue('predecessor', 'lagamount', int2);
													lagtype = oldRecord.getLineItemValue('predecessor', 'lagtype', int2);
													lagunits = oldRecord.getLineItemValue('predecessor', 'lagunits', int2);
												}
												
											//Create the new record
											//
											var newRecord = nlapiCreateRecord('manufacturingoperationtask', {recordmode: 'dynamic', workorder: woId});
											
											//Copy across specific field values
											//
											for (var int2 = 0; int2 < fields.length; int2++)
												{
													newRecord.setFieldValue(fields[int2], oldRecord.getFieldValue(fields[int2]));
												}
					
												//Update the sequence
												//
												lastSeq += 10;
												newRecord.setFieldValue('operationsequence', lastSeq.toString());
					
											//Save the new record
											//
											var newId = nlapiSubmitRecord(newRecord, true, true);
				
											//Re-load the new record
											//
											newRecord = nlapiLoadRecord('manufacturingoperationtask', newId);
											
											var predecessorLines = newRecord.getLineItemCount('predecessor');
											
											for (var int2 = 1; int2 <= predecessorLines; int2++) 
											{
												newRecord.setLineItemValue('predecessor', 'lagamount', int2, lagamount);
												newRecord.setLineItemValue('predecessor', 'lagtype', int2, lagtype);
												newRecord.setLineItemValue('predecessor', 'lagunits', int2, lagunits);
											}
											
											//Re-save the new record
											//
											nlapiSubmitRecord(newRecord, true, true);
										}
								}
						}
				}
		}
}

//Page through results set from search
//
function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var start = 0;
	var end = 1000;
	var searchResultSet = searchResult.getResults(start, end);
	var resultlen = searchResultSet.length;

	//If there is more than 1000 results, page through them
	//
	while (resultlen == 1000) 
		{
				start += 1000;
				end += 1000;

				var moreSearchResultSet = searchResult.getResults(start, end);
				
				if(moreSearchResultSet == null)
					{
						resultlen = 0;
					}
				else
					{
						resultlen = moreSearchResultSet.length;
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
					}
				
				
		}
	
	return searchResultSet;
}

