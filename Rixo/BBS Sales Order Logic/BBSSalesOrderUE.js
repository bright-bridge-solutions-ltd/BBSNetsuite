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
function(runtime, record, search, file, xml) {
	
	function salesOrderBeforeSubmit(scriptContext) {
			
		// check the record is being created
		if (scriptContext.type == scriptContext.UserEventType.CREATE)
			{
				// retrieve script parameters
				var currentScript = runtime.getCurrentScript();
			
				var doNotCommitChannel = currentScript.getParameter({
					name: 'custscript_bbs_do_not_commit_channel'
				});
				
				var doNotCommitLocation = currentScript.getParameter({
					name: 'custscript_bbs_do_not_commit_location'
				});
				
				// get the current record
				var currentRecord = scriptContext.newRecord;
					
				// get the value of the Channel (class) field
				var channel = currentRecord.getValue({
					fieldId: 'class'
				});
				
				// get the value of the Location field
				var location = currentRecord.getValue({
					fieldId: 'location'
				});
					
				// if doNotCommitChannel = channel AND doNotCommitLocation = location
				if (doNotCommitChannel == channel && doNotCommitLocation == location)
					{
						// get line item count
						var lineCount = currentRecord.getLineCount({
							sublistId: 'item'
						});
							
						// loop through items
						for (var i = 0; i < lineCount; i++)
							{
								// set the commit flag to Do Not Commit
								currentRecord.setSublistValue({
									sublistId: 'item',
									fieldId: 'commitinventory',
									value: 3, // 3 = Do Not Commit
									line: i
								});
							}
					}
			}
		
		// check the record is being created or edited
		if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
			{
				// retrieve script parameters
				var currentScript = runtime.getCurrentScript();
			
				// retrieve script parameters
				var splitLevelAmount = currentScript.getParameter({
					name: 'custscript_bbs_split_ship_indicator_amt'
				});
					
				var splitShipChannel = currentScript.getParameter({
					name: 'custscript_bbs_split_ship_channel'
				});
					
				var splitShipCountry = currentScript.getParameter({
					name: 'custscript_bbs_split_ship_country'
				});
				
				// get the current record
				var currentRecord = scriptContext.newRecord;
					
				// get the value of the Channel (class) field
				var channel = currentRecord.getValue({
					fieldId: 'class'
				});
					
				// get the shipping country from the record
				var shippingCountry = currentRecord.getSubrecord({
					fieldId: 'shippingaddress'
				}).getValue({
					fieldId: 'country'
				});
					
				// check if shplitShipChannel = channel AND splitShipCountry = shippingCountry
				if (splitShipChannel == channel && splitShipCountry == shippingCountry)
					{
						// declare and initialize variables
						var lineTotal = 0;
						var splitShipIndicator = 1;
				
						// get line item count
						var lineCount = currentRecord.getLineCount({
							sublistId: 'item'
						});
							
						// loop through items
						for (var i = 0; i < lineCount; i++)
							{
								// get the line total
								var lineAmount = currentRecord.getSublistValue({
									sublistId: 'item',
									fieldId: 'amount',
									line: i
								});
									
								// add lineAmount to the lineTotal
								lineTotal += lineAmount;
									
								// check if lineTotal is greater than splitLevelAmount script parameter AND this is not the first line
								if (lineTotal > splitLevelAmount && i > 0)
									{
										// increase splitShipIndicator variable by 1
										splitShipIndicator++;
											
										// set lineTotal variable to be the lineAmount
										lineTotal = lineAmount;
									}
									
								// set the Split Ship field using the splitShip variable
								currentRecord.setSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_bbs_split_ship',
									value: splitShipIndicator,
									line: i
								});
									
							}
					}
			}
		
		// check the record is being created and the excecution context is web services
		if (scriptContext.type == scriptContext.UserEventType.CREATE && runtime.executionContext == runtime.ContextType.WEBSERVICES)
			{
				// retrieve script parameters
				var splitLevelAmount = runtime.getCurrentScript().getParameter({
					name: 'custscript_bbs_split_ship_indicator_amt'
				});
					
				// declare and initialize variables
				var lineTotal = 0;
				var splitShipIndicator = 1;
					
				// get the current record
				var currentRecord = scriptContext.newRecord;
					
				// get line item count
				var lineCount = currentRecord.getLineCount({
					sublistId: 'item'
				});
					
				// loop through items
				for (var i = 0; i < lineCount; i++)
					{
						// get the line total
						var lineAmount = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'amount',
							line: i
						});
							
						// add lineAmount to the lineTotal
						lineTotal += lineAmount;
							
						// check if lineTotal is greater than splitLevelAmount script parameter
						if (lineTotal > splitLevelAmount)
							{
								// increase splitShipIndicator variable by 1
								splitShipIndicator++;
									
								// set lineTotal variable to be the lineAmount
								lineTotal = lineAmount;
							}
							
						// set the Split Ship field using the splitShip variable
						currentRecord.setSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_bbs_split_ship',
							value: splitShipIndicator,
							line: i
						});
							
					}
			}
		
		// check the record is being created and the excecution context is web services
		if (scriptContext.type == scriptContext.UserEventType.CREATE && runtime.executionContext == runtime.ContextType.WEBSERVICES)
			{
				// get the current record
				var currentRecord = scriptContext.newRecord;
					
				if (currentRecord)
					{
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
