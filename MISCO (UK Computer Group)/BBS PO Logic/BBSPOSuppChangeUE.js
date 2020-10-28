/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search'],
/**
 * @param {currentRecord} currentRecord
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search) 
{
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) 
	    {
    		//Only needs to work if we are editing a PO
    		//
    		if (scriptContext.type == scriptContext.UserEventType.EDIT)
				{
    				//Get the old & new records
    				//
		    		var oldRecord 	= scriptContext.oldRecord;
		    		var newRecord	= scriptContext.newRecord;
		    		
		    		//Get the old & new suppliers
		    		//
		    		var oldSupplierId	= oldRecord.getValue({fieldId: 'entity'});
		    		var newSupplierId	= newRecord.getValue({fieldId: 'entity'});
		    		
		    		//Has the supplier changed
		    		//
		    		if(oldSupplierId != newSupplierId)
		    			{
		    				//Get the sales order the po is for
		    				//
		    				var salesOrderId = newRecord.getValue({fieldId: 'createdfrom'});
		    				
		    				//Only procede if we have a sales order
		    				//
		    				if(salesOrderId != null && salesOrderId != '')
		    					{
		    						//Load the sales order
		    						//
		    						var salesOrderRecord = null;
		    						
		    						try
		    							{
			    							salesOrderRecord = record.load({
			    															type:		record.Type.SALES_ORDER,
			    															id:			salesOrderId,
			    															isDynamic:	true
			    															});			
		    							}
		    						catch(err)
		    							{
		    								salesOrderRecord = null;
		    								
		    								log.error({
														title: 		'Error loading sales order with id = ' + salesOrderId,
														details: 	err
														});
		    							}
		    						
		    						//Did we get the sales order record
		    						//
		    						if(salesOrderRecord != null)
		    							{
		    								var soUpdated = false;
		    								
		    								//Loop round the items in the PO
		    								//
		    								var poLines = newRecord.getLineCount({sublistId: 'item'});
		    								
		    								for (var int = 0; int < poLines; int++) 
			    								{
													//Get the item id & the rate
		    										//
		    										var poLineItemId	= newRecord.getSublistValue({
			    																					sublistId:		'item',
			    																					fieldId:		'item',
			    																					line:			int
			    																					});
		    										
		    										var poLineItemType	= newRecord.getSublistValue({
																									sublistId:		'item',
																									fieldId:		'itemtype',
																									line:			int
																									});
		
		    										var poLineItemRate	= newRecord.getSublistValue({
																									sublistId:		'item',
																									fieldId:		'rate',
																									line:			int
																									});
		
		    										//Ignore other charges
		    										//
		    										if(poLineItemType != 'OthCharge')
		    											{
		    												//Now try to find the SO line that has the item on it
		    												//
		    												var soLineNo = salesOrderRecord.findSublistLineWithValue({
				    																									sublistId:	'item',
				    																									fieldId:	'item',
				    																									value:		poLineItemId
				    																									});
		    												
		    												//Did we find a match?
		    												//
		    												if(soLineNo != -1)
		    													{
		    														soUpdated = true;
		    													
		    														//Select the matched line
		    														//
			    													salesOrderRecord.selectLine({
			    																				sublistId:	'item',
			    																				line:		soLineNo
			    																				});
		    													
			    													//Update the estimated extended cost
			    													//
			    													salesOrderRecord.setCurrentSublistValue({
			    																							sublistId:	'item',
			    																							fieldId:	'costestimate',
			    																							value:		poLineItemRate
			    																							});
			    													
			    													//Commit the line
			    													//
			    													salesOrderRecord.commitLine({
			    																				sublistId:		'item',
			    																				ignoreRecalc:	false
			    																				});
		    													}
		    											}
												}
		    								
		    								//Did we update any so lines, if so save the sales order
		    								//
		    								if(soUpdated)
		    									{
		    										try
			    										{
					    									salesOrderRecord.save({
					    															enableSourcing:			true,
					    															ignoreMandatoryFields:	true
					    															});
			    										}
		    										catch(err)
		    											{
			    											log.error({
																		title: 		'Error saving sales order with id = ' + salesOrderId,
																		details: 	err
																		});
		    											}
		    									}
		    							}
		    					}
		    			}
				}
	    }

    return 	{
        	afterSubmit: afterSubmit
    		};
    
});
