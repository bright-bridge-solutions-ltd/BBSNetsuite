/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/file', 'N/xml'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, record, search, file, xml) 
{
	function salesOrderBeforeSubmit(scriptContext) {
			
			// check the record is being created and the excecution context is web services
			if (scriptContext.type == scriptContext.UserEventType.CREATE && runtime.executionContext == runtime.ContextType.WEBSERVICES)
				{
					// get the current record
					var currentRecord = scriptContext.newRecord;
					
					// get line item count
					var lineCount = currentRecord.getLineCount({
						sublistId: 'item'
					});
					
					// loop through items
					for (var i = 0; i < lineCount; i++)
						{
							// set the 'Create PO' field to null
							currentRecord.setSublistValue({
								sublistId: 'item',
								fieldId: 'createpo',
								line: i,
								value: null
							});
						}
				}
		}
    
	
	
	function salesOrderAfterSubmit(scriptContext) 
	    {
    		if(scriptContext.type == 'create' || scriptContext.type == 'edit')
    			{
    				var currentRecord 		= scriptContext.newRecord;
    				var currentRecordType 	= currentRecord.type;
    				var currentRecordId 	= currentRecord.id;
    				
    				currentRecord = record.load({
    											type:		currentRecordType,
    											id:			currentRecordId
    											});
    				
    				
    				var itemCount 		= currentRecord.getLineCount({sublistId:	'item'});
    				
    				for (var int = 0; int < itemCount; int++) 
	    				{
							var lineUrl = currentRecord.getSublistValue({
																			sublistId:		'item',
																			fieldId:		'custcol_bbs_item_url',
																			line:			int
																			});
							
							var lineItem = currentRecord.getSublistValue({
																			sublistId:		'item',
																			fieldId:		'item',
																			line:			int
																			});

							var itemDescription = search.lookupFields({
																		type:		search.Type.ITEM,
																		id:			lineItem,
																		columns:	'custitem_bbs_description'
																		});


							currentRecord.setSublistValue({
															sublistId: 	'item',
															fieldId: 	'description',
															line:		int,
															value: 		itemDescription.custitem_bbs_description
															});


							if(lineUrl == '' || lineUrl == null)
								{
									
									try
										{
											
											
											var fieldLookUp = search.lookupFields({
																				    type: 		search.Type.ITEM,
																				    id: 		lineItem,
																				    columns: 	'custitem_bbs_printed_cad'
																					});
											
											if(fieldLookUp != null && fieldLookUp != '')
												{
													var imageId = fieldLookUp.custitem_bbs_printed_cad[0].value;
													var fileObj	= null;
													
													if(imageId != null && imageId != '')
														{
															try
																{
																	fileObj = file.load({id: imageId});
																}
															catch(err)
																{
																	fileObj	= null;
																}
															
															if(fileObj != null)
																{
																	var fileUrl = 'https://5514691.app.netsuite.com' + xml.escape({xmlText:  fileObj.url}); //.replace(/&/g, "&amp;")
																	
																	currentRecord.setSublistValue({
																									sublistId:		'item',
																									fieldId:		'custcol_bbs_item_url',
																									line:			int,
																									value:			fileUrl
																									});
																}
														}
												}
										}
									catch(err)
										{
											log.error({
														title:		'Error reading item',
														details:	err
														});
										}
								}
							
							
						}
    				

	    			currentRecord.save({
	    								doSourcing:				true,
	    								ignoreMandatoryFields:	true
	    								});

    			}
	    }

    return 	{
        		beforeSubmit: salesOrderBeforeSubmit,
    			afterSubmit: salesOrderAfterSubmit
    		};
    
});
