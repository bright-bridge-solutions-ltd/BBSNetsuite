/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/runtime'],
function(search, record, runtime) 
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
	    	//Only works on creation of the item receipt
	    	//
	    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
	    		{   	
		    		var receiptRecordId 	= scriptContext.newRecord.id;
			    	var receiptRecord 		= null;
			    	var transferBin		 	= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_transfer_bin'});;
			    	
			    	//Load the item receipt record
			    	//
			    	try
			    		{
				    		receiptRecord = record.load({
					    									type:		record.Type.ITEM_RECEIPT,
					    									id:			receiptRecordId,
					    									isDynamic:	true
					    									});
			    		}
			    	catch(err)
			    		{
			    			receiptRecord = null;
			    			log.error({title: 'Error Loading Item Receipt Record id = ' + receiptRecordId, details: err});
			    		}
			    	
			    	//Did we load the record ok?
			    	//
			    	if(receiptRecord != null)
			    		{
			    			//Get the count or item lines on the receipt
			    			//
			    			var receiptLineCount = receiptRecord.getLineCount({sublistId: 'item'});
	    		
			    			//Loop through the item receipt lines looking for linked assembly builds
			    			//
			    			for (var receiptLine = 0; receiptLine < receiptLineCount; receiptLine++) 
				    			{
									var buildRecordId = receiptRecord.getSublistValue({sublistId: 'item', fieldId: 'linkedassemblybuild', line: receiptLine});
									
									if(buildRecordId != null && buildRecordId != '')
										{
											var buildRecord 	= null;
									    	
									    	//Load the assembly build record
									    	//
									    	try
									    		{
										    		buildRecord = record.load({
										    									type:		record.Type.ASSEMBLY_BUILD,
										    									id:			buildRecordId,
										    									isDynamic:	true
										    									});
									    		}
									    	catch(err)
									    		{
									    			buildRecord = null;
									    			log.error({title: 'Error Loading Assembly Build Record id = ' + buildRecordId, details: err});
									    		}
									    	
									    	//Did we load the record ok?
									    	//
									    	if(buildRecord != null)
									    		{
									    			//Get the loacation of the assembly build
									    			//
									    			var buildLocation = buildRecord.getValue({fieldId: 'location'});
									    			
									    			//Do we have a location?
									    			//
									    			if(buildLocation != null && buildLocation != '')
									    				{
									    					//See if the build location is an outsourced location
									    					//
									    					var isOutsourced = search.lookupFields({
									    															type:		search.Type.LOCATION,
									    															id:			buildLocation,
									    															columns:	'custrecord_bbs_i_am_outsource'
									    															}).custrecord_bbs_i_am_outsource;
									    					
									    					//Location is outsourced
									    					//
									    					if(isOutsourced)
									    						{
									    							//Get the assembly item & the build quantity
									    							//
									    							var assemblyId 			= buildRecord.getValue({fieldId: 'item'});
									    							var assemblyQty 		= buildRecord.getValue({fieldId: 'quantity'});
									    							var invTransferRecord 	= null;
									    									
									    							try
									    								{
									    									invTransferRecord = record.create({
									    																		type:		record.Type.INVENTORY_TRANSFER,
									    																		isDynamic:	true
									    																		});
									    								}
									    							catch(err)
									    								{
									    									invTransferRecord = null;
									    									log.error({title: 'Error creating inventory transfer record', details: err});
									    								}
									    									
									    							if(invTransferRecord != null)
									    								{
									    									invTransferRecord.setValue({fieldId: 'location', value: buildLocation});	//Outsourced location
									    									invTransferRecord.setValue({fieldId: 'transferlocation', value: 1});		//Nymas warehouse
									    											
									    									//Select a new inventory line
									    									//
										    								invTransferRecord.selectNewLine({
										    																sublistId:	'inventory'
										    																});
										    												
										    								//Set the item
										    								//
										    								invTransferRecord.setCurrentSublistValue({
										    																		sublistId:		'inventory',
										    																		fieldId:		'item',
										    																		value:			assemblyId
										    																		});
										    												
										    								//Set the quantity
										    								//
										    								invTransferRecord.setCurrentSublistValue({
																														sublistId:		'inventory',
																														fieldId:		'adjustqtyby',
																														value:			assemblyQty
																													});
										    												
										    								//Update the inventorydetail subrecord
										    								//
										    								var invTransferSubrecord	= invTransferRecord.getCurrentSublistSubrecord({
																																						sublistId:	'inventory',
																																						fieldId:	'inventorydetail'
																																						});
										    								//Did we get the subrecord ok?
										    								//
										    								if(invTransferSubrecord != null)
										    									{
										    										//Add a new inventory assignment sublist line
										    										//
										    										invTransferSubrecord.selectNewLine({
										    																			sublistId:	'inventoryassignment'
										    																			});
										    										
										    										//Set the inventory status (from)
										    										//
										    										invTransferSubrecord.setCurrentSublistValue({
																																sublistId:		'inventoryassignment',
																																fieldId:		'inventorystatus',
																																value:			1
																																});
										    										
										    										//Set the inventory status (to)
										    										//
										    										invTransferSubrecord.setCurrentSublistValue({
																																sublistId:		'inventoryassignment',
																																fieldId:		'toinventorystatus',
																																value:			1
																																});
										    										
										    										//Set the quantity
										    										//
										    										invTransferSubrecord.setCurrentSublistValue({
																																sublistId:		'inventoryassignment',
																																fieldId:		'quantity',
																																value:			assemblyQty
																																});
										    										
										    										//Set the bin if the script parameter has been set
										    										//
										    										if(transferBin != null && transferBin != '')
										    											{
											    											invTransferSubrecord.setCurrentSublistValue({
																																		sublistId:		'inventoryassignment',
																																		fieldId:		'tobinnumber',
																																		value:			transferBin
																																		});
										    											}
										    										
										    										//Commit the inventory assignment line
										    										//
										    										invTransferSubrecord.commitLine({
																													sublistId:		'inventoryassignment',
																													ignoreRecalc:	false
																													});
										    									}
										    												
										    												
										    								//Commit the inventory line
										    								//
										    								invTransferRecord.commitLine({
																										sublistId:		'inventory',
																										ignoreRecalc:	false
																										});
									    											
										    								//Try to save the inventory transfer
									    									//
									    									var transferId = null;
									    											
									    									try
									    										{
									    											transferId = invTransferRecord.save({
													    																enableSourcing:			true,
													    																ignoreMandatoryFields:	true
													    																});
									    										}
									    									catch(err)
									    										{
									    											transferId = null;
									    											log.error({title: 'Error saving inventory transfer record', details: err});
									    										}
									    								}
									    						}
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
