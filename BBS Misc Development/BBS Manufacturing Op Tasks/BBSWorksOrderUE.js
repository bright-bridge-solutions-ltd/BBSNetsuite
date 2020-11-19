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
			
			if(woMoulds != null && woMoulds != '')
				{
					woMoulds = Number(woMoulds);
				
					var copies = (woQty / woMoulds) - 1;
					
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
					
				
					if(manufacturingoperationtaskSearch != null && manufacturingoperationtaskSearch.length > 0)
						{
							var lastSeq = Number(0);
							var opIds = [];
							
							for (var int = 0; int < manufacturingoperationtaskSearch.length; int++) 
								{
									var operationId = manufacturingoperationtaskSearch[int].getValue("internalid");
									lastSeq = Number(manufacturingoperationtaskSearch[int].getValue("sequence"));
								
									opIds.push(operationId);
									
									nlapiSubmitField('manufacturingoperationtask', operationId, 'inputquantity', woMoulds, true);
								}
							
							for (var copyCount = 0; copyCount < copies; copyCount++) 
								{
									for (var int = 0; int < opIds.length; int++) 
										{
											var oldRecord = nlapiLoadRecord('manufacturingoperationtask', opIds[int]);
		
											var newRecord = nlapiCreateRecord('manufacturingoperationtask', {recordmode: 'dynamic', workorder: woId});
					
											for (var int2 = 0; int2 < fields.length; int2++)
												{
													newRecord.setFieldValue(fields[int2], oldRecord.getFieldValue(fields[int2]));
												}
					
												lastSeq += 10;
												newRecord.setFieldValue('operationsequence', lastSeq.toString());
					
											var newId = nlapiSubmitRecord(newRecord, true, true);
				
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

