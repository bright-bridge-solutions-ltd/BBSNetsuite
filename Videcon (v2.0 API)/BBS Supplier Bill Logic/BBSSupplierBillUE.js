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
function(record, search) 
{
	
	function supplierBillAfterSubmit(scriptContext) 
	    {
    		if(scriptContext.type == 'create')
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
		    				
			    	var ibsCount 			= currentRecord.getLineCount({sublistId: 'inboundshipments'});
		    		
			    	//Loop through the ibs lines
					//
		    		for (var int = 0; int < ibsCount; int++) 
			    		{
							var ibsId = currentRecord.getSublistValue({
																			sublistId:		'inboundshipments',
																			fieldId:		'id',
																			line:			int
																		});
						
							//Do we have an Inbound Shipment Id
							//
							if(ibsId != null && ibsId != '')
								{
									//Find the reference number from the ibs record
									//
									var invoiceReference = search.lookupFields({
																				type:		search.Type.INBOUND_SHIPMENT,
																				id:			ibsId,
																				columns:	'custrecord_bbs_invoice_reference'
																				}).custrecord_bbs_invoice_reference;
									
									//Do we have a value ?
									//
									if(invoiceReference != null && invoiceReference != '')
										{
											try
						    					{
									    			record.submitFields({
									    								type:		currentRecordType,
									    								id:			currentRecordId,
										    							values:		{
										    											tranid:	invoiceReference
										    										},
										    							options:	{
										    											enableSourcing:			false,
										    											ignoreMandatoryFields:	true
										    										}
									    								});
						    					}
						    				catch(err)
						    					{
							    					log.error({
																title:		'Error updating supplier bill, id = ' + currentRecordId,
																details:	err
																});
						    					}
										}
								}
    					}
    			}
	    }

    return 	{
        		afterSubmit: 	supplierBillAfterSubmit
    		};
    
});
