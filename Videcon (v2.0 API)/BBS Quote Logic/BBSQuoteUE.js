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
	
	function quoteAfterSubmit(scriptContext) 
	    {
    		if(scriptContext.type == 'create' || scriptContext.type == 'edit')
    			{
    				var currentRecord 		= scriptContext.newRecord;
    				var currentRecordType 	= currentRecord.type;
    				var currentRecordId 	= currentRecord.id;
    				var configRecord		= null;
    				
    				try
    					{
	    					configRecord = config.load({type: config.Type.COMPANY_INFORMATION});
    					}
    				catch(err)
    					{
    						configRecord		= null;
    					}
    				
    				if(configRecord != null)
    					{
    						var appUrl = configRecord.getValue({fieldId: 'appurl'});

    						currentRecord = record.load({
		    											type:		currentRecordType,
		    											id:			currentRecordId
		    											});
		    				
		    				
		    				var itemCount = currentRecord.getLineCount({sublistId:	'item'});
		    				
		    				for (var int = 0; int < itemCount; int++) 
			    				{
									var lineUrl = currentRecord.getSublistValue({
																					sublistId:		'item',
																					fieldId:		'custcol_bbs_data_sheet',
																					line:			int
																				});
									
									var lineItem = currentRecord.getSublistValue({
																					sublistId:		'item',
																					fieldId:		'item',
																					line:			int
																				});
									
									
									if(lineUrl == '' || lineUrl == null)
										{			
											var fieldLookUp = search.lookupFields({
																				    type: 		search.Type.ITEM,
																				    id: 		lineItem,
																				    columns: 	'custitem_bbs_data_sheet'
																					});
													
											if(fieldLookUp != null && fieldLookUp != '')
												{
													var imageId = fieldLookUp.custitem_bbs_printed_cad[0].value;
													
													if(imageId != null && imageId != '')
														{
															var fileSearchObj = getResults(search.create({
																											type: 	"file",
																											   filters:
																											   [
																											      ["internalid","anyof",imageId]
																											   ],
																											   columns:
																											   [
																											      search.createColumn({name: "url", label: "URL"})
																											   ]
																											}));
																	
															if(fileSearchObj != null && fileSearchObj.length == 1)
																{
																	var fileUrl = fileSearchObj[0].getValue({name: "url"});
																	
																	fileUrl = appUrl + fileUrl;
																			
																	currentRecord.setSublistValue({
																									sublistId:		'item',
																									fieldId:		'custcol_bbs_data_sheet',
																									line:			int,
																									value:			fileUrl
																									});
																}
														}
												}
										}
								}
		    				
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
        		afterSubmit: 	quoteAfterSubmit
    		};
    
});
