/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
   
     /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function itemReceiptAfterSubmit(scriptContext) 
	    {
    		//Function to update the works orders linked to the purchase order that is linked to the transfer order that is linked to the item receipt (this record)
    		//with the expected completion date
    		//
    		var type			= scriptContext.type;
    		var currentRecord 	= scriptContext.newRecord;
    		
    		//Only works in create or edit mode
			//
			if (type == scriptContext.UserEventType.CREATE || type == scriptContext.UserEventType.EDIT)
				{
					//Get the created from
					//
					var createdFrom = currentRecord.getValue({fieldId: 'createdfrom'});
					
					//Get the entered estimated completion date
					//
					var estimatedCompletionDate = currentRecord.getValue({fieldId: 'createdfrom'});
					
					//Check to see if the created from is a transfer order
					//
					var recordType = checkRecordType(createdFrom);
					
					if(recordType == 'Transfer Order')
						{
							//Find the purchase order that is on the transfer order
							//
							var purchaseOrder = search.lookupFields({
																	type:		record.Type.TRANSFER_ORDER,
																	id:			createdFrom,
																	columns:	'custbody_bbs_related_po'
																	})[custbody_bbs_related_po];
							
							//Do we have a related purchase order?
							//
							if(purchaseOrder != null && purchaseOrder != '')
								{
									//Find all works orders that are linked to lines on the purchase order
									//
									var purchaseorderSearchObj = getResults(search.create({
																						   type:	"purchaseorder",
																						   filters:
																							   		[
																								      ["type","anyof","PurchOrd"], 
																								      "AND", 
																								      ["mainline","is","F"], 
																								      "AND", 
																								      ["shipping","is","F"], 
																								      "AND", 
																								      ["taxline","is","F"], 
																								      "AND", 
																								      ["cogs","is","F"], 
																								      "AND", 
																								      ["internalidnumber","equalto",purchaseOrder], 
																								      "AND", 
																								      ["applyingtransaction","noneof","@NONE@"]
																								   ],
																						   columns:
																								   [
																								      search.createColumn({name: "line", label: "Line ID"}),
																								      search.createColumn({name: "item", label: "Item"}),
																								      search.createColumn({name: "applyingtransaction", label: "Applying Transaction"})
																								   ]
																							}));
									
									//Did we find any results?
									//
									if(purchaseorderSearchObj != null && purchaseorderSearchObj.length > 0)
										{
											for (var poResult = 0; poResult < purchaseorderSearchObj.length; poResult++) 
												{
													//Get the id of the works order
													//
													var worksOrderId = purchaseorderSearchObj[poResult].getValue({name: "applyingtransaction"});
													
													//Update the end date on each works order
													//
													
												}
										}
									
								}
						}
					
					
				}
	    }

    //Function to check the record type
    //
    function checkRecordType(_createdFrom)
    	{
    		var recordType = null;
    		
    		var transactionSearchObj = getResults(search.create({
									    			   type: 	  "transaction",
									    			   filters:
												    			   [
												    			      ["mainline","is","T"], 
												    			      "AND", 
												    			      ["internalidnumber","equalto",_createdFrom]
												    			   ],
									    			   columns:
												    			   [
												    			      search.createColumn({name: "type", label: "Type"})
												    			   ]
									    			}));
    			
    		if(transactionSearchObj != null && transactionSearchObj.length > 0)
    			{
    				recordType = transactionSearchObj[0].getValue({name: "type"});
    			}
    		
    		return recordType;
    	}
    
    
    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }
    
    
    return 	{
        	afterSubmit: 	itemReceiptAfterSubmit
    		};
});
