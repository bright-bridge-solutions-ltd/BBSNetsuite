/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/file', 'N/config'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, record, search, file, config) 
{
	
	function salesorderAfterSubmit(scriptContext) 
	    {
    		if(scriptContext.type == 'create' || scriptContext.type == 'edit')
    			{
    				var currentRecord 		= scriptContext.newRecord;
    				var currentRecordType 	= currentRecord.type;
    				var currentRecordId 	= currentRecord.id;
    				var recordUpdated		= false;
    				
			    	currentRecord 			= record.load({
															type:		currentRecordType,
															id:			currentRecordId,
															isDynamic:	true
															});
		    				
			    	var orderSubsidiary		= currentRecord.getValue({fieldId: 'subsidiary'});	
			    	var crossSubsidFulfil	= currentRecord.getValue({fieldId: 'iscrosssubtransaction'});	
					var itemCount 			= currentRecord.getLineCount({sublistId: 'item'});
		    		
					//If Dynamic Fire Protection & cross subsidiary fulfilment is not set, then set it
					//
					if(orderSubsidiary == '3' && !crossSubsidFulfil)	
						{
							currentRecord.setValue({fieldId: 'iscrosssubtransaction', value: true});	
							recordUpdated = true;
						}
					
					//Loop through the item lines
					//
		    		for (var int = 0; int < itemCount; int++) 
			    		{
							var invLocation = currentRecord.getSublistValue({
																			sublistId:		'item',
																			fieldId:		'inventorylocation',
																			line:			int
																		});
									
							var invSubsidiary = currentRecord.getSublistValue({
																			sublistId:		'item',
																			fieldId:		'inventorysubsidiary',
																			line:			int
																		});
							
							
							//If inventory location is not set, then set it to Head Office
							//
							if(invLocation == null ||invLocation == '')
								{
									currentRecord.selectLine({sublistId: 'item', line: int});
									
									currentRecord.setCurrentSublistValue({
																		sublistId:		'item',
																		fieldId:		'inventorylocation',
																		value:			1
																		});
									
									
									currentRecord.commitLine({sublistId: 'item', ignoreRecalc: false});
									
									recordUpdated = true;
								}
							
							
    					}
		    		
		    		if(recordUpdated)
						{
							try
		    					{
					    			currentRecord.save({
					    								doSourcing:				true,
					    								ignoreMandatoryFields:	true
					    								});
		    					}
		    				catch(err)
		    					{
			    					log.error({
												title:		'Error saving sales order record',
												details:	err
												});
		    					}
						}
    			}
	    }

    return 	{
        		afterSubmit: 	salesorderAfterSubmit
    		};
    
});
