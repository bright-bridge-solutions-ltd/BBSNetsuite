/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/sftp', 'N/record', 'N/runtime'],
/**
 * @param {sftp, file, search, xml, record, runtime, email} 
 */
function(search, sftp, record, runtime) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    		
    	// search for SFTP supplier detail records
    	search.create({
    		type: 'customrecord_bbs_sftp',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_sftp_stock_file_enabled',
    			operator: search.Operator.IS,
    			values: ['T']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_sftp_endpoint'
    		},
    				{
    			name: 'custrecord_bbs_sftp_username'
    		},
    				{
    			name: 'custrecord_bbs_sftp_password'
    		},
    				{
    			name: 'custrecord_bbs_sftp_host_key'
    		},
    				{
    			name: 'custrecord_bbs_sftp_port_number'
    		},
    				{
    			name: 'custrecord_bbs_sftp_outbound_directory'
    		},
    				{
    			name: 'custrecord_bbs_sftp_inbound_directory'
    		},
    				{
    			name: 'custrecord_bbs_sftp_stock_file_format'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the SFTP details from the search result
    		var sftpEndpoint = result.getValue({
    			name: 'custrecord_bbs_sftp_endpoint'
    		});
    		
    		var sftpUsername = result.getValue({
    			name: 'custrecord_bbs_sftp_username'
    		});
    		
    		var sftpPassword = result.getValue({
    			name: 'custrecord_bbs_sftp_password'
    		});
    		
    		var sftpHostKey = result.getValue({
    			name: 'custrecord_bbs_sftp_host_key'
    		});
    		
    		var sftpPortNumber = result.getValue({
    			name: 'custrecord_bbs_sftp_port_number'
    		});
    		
    		var sftpOutDirectory = result.getValue({
    			name: 'custrecord_bbs_sftp_outbound_directory'
    		});
    		
    		var sftpInDirectory = result.getValue({
    			name: 'custrecord_bbs_sftp_inbound_directory'
    		});
    		
    		var sftpFileType = result.getValue({
    			name: 'custrecord_bbs_sftp_stock_file_format'
    		});
    		
    		// call function to process files on the server
    		processFiles(sftpEndpoint, sftpUsername, sftpPassword, sftpHostKey, sftpPortNumber, sftpOutDirectory, sftpFileType);
    		
    		// continue processing search results
    		return true;
    		
    	});
    }
    
    // ============================================
    // FUNCTION TO PROCESS FILES ON THE SFTP SERVER
    // ============================================
    
    function processFiles(sftpEndpoint, sftpUsername, sftpPassword, sftpHostKey, sftpPortNumber, sftpDirectory, sftpFileType) {
    	
    	// declare and initialize variables
    	var sftpConnection = null;
    	
    	try
			{
				// make a connection to the SFTP site
				sftpConnection = sftp.createConnection({
					url: 			sftpEndpoint,
					username:		sftpUsername,
					passwordGuid:	sftpPassword,
					hostKey:		sftpHostKey,
					directory:		sftpDirectory
				});
			}
		catch(e)
			{
				log.error({
					title: 'SFTP Connection Error',
					details: e
				});
			}
		
		// if we have been able to successfully connect to the SFTP site
		if (sftpConnection)
			{
				// declare and initialize variables
				var fileList = null;
				
				try
					{
						// get a list of files from the SFTP site
						fileList = sftpConnection.list({
							path: 	'./' + sftpFileType, 
							sort: 	sftp.Sort.DATE
						});
					}
				catch(e)
					{
						log.error({
							title: 'Error Retrieving SFTP File List',
							details: e
						});
					}
				
				log.audit({
					title: 'Number of Files to Process',
					details: fileList.length
				});
				
				// if we have any files
				if (fileList.length > 0)
					{
						// loop through files
						for (var i = 0; i < fileList.length; i++)
							{
								log.audit({
									title: 'Processing File',
									details: i+1 + ' of ' + fileList.length
								});
									
								// declare and initialize variables
								var downloadedFile = null;
									
								// get the file name
								var fileName = fileList[i].name;
										
								try
									{
										// download the file from the SFTP site
										downloadedFile = sftpConnection.download({
											filename: fileName
										});
									}
								catch(e)
									{
										log.error({
											title: 'Error Downloading File',
											details: 'File Name: ' + fileName + '<br>Error: ' + e
										});
									}
										
								// if we have been able to successfully download the file
								if (downloadedFile)
									{
										// get the lines of the file
										var fileLines = downloadedFile.lines.iterator();
												
										// process the HEAD line from the file
										fileLines.each(function(line){
													
											// remove "" from lineValues
											var lineValues = line.value.replace(/"/g, '');
															
											// split lineValues so we can return info from it
											lineValues = lineValues.split(',');
															
											// retrieve line values
											var itemID 		= getItemInternalID(lineValues[0]);
											var stockStatus = getStatus(lineValues[1]);
											var inStockDate	= lineValues[2];
															
											// check we have an item ID
											if (itemID)
												{
													if (stockStatus == 1 || stockStatus == 2) // In Stock or Low Stock
														{
															try
																{
																	// update the item record
																	record.submitFields({
																		type: record.Type.INVENTORY_ITEM,
																		id: itemID,
																		values: {
																			custitem_spec_order_stock_status: 	stockStatus,
																			custitem_spec_order_incoming_date:	null
																		}
																	});
																}
															catch(e)
																{
																	log.error({
																		title: 'Error Updating Item Record',
																		details: 'Item ID: ' + itemID + '<br>Error: ' + e
																	});
																}
															}
														else if (stockStatus == 3) // Out of Stock
															{
																if (inStockDate) // check if we have an in stock date
																	{
																		try
																			{
																				// update the item record
																				record.submitFields({
																					type: record.Type.INVENTORY_ITEM,
																					id: itemID,
																					values: {
																						custitem_spec_order_stock_status: 	stockStatus,
																						custitem_spec_order_incoming_date:	inStockDate
																					}
																				});
																			}
																		catch(e)
																			{
																				log.error({
																					title: 'Error Updating Item Record',
																					details: 'Item ID: ' + itemID + '<br>Error: ' + e
																				});
																			}
																	}
																else // inStockDate is empty
																	{
																		try
																			{
																				// update the item record
																				record.submitFields({
																					type: record.Type.INVENTORY_ITEM,
																					id: itemID,
																					values: {
																						custitem_spec_order_stock_status: 	stockStatus
																					}
																				});
																			}
																		catch(e)
																			{
																				log.error({
																					title: 'Error Updating Item Record',
																					details: 'Item ID: ' + itemID + '<br>Error: ' + e
																				});
																			}
																	}
															}
												}
											
											// check we have sufficient remaining usage
											if (runtime.getCurrentScript().getRemainingUsage() > 20)
												{
													// continue processing lines
													return true;
												}		
										});
									
										
										// check we have sufficient remaining usage
										if (runtime.getCurrentScript().getRemainingUsage() > 10)
											{
												try
													{										
														// finally, delete the file from the SFTP site
														sftpConnection.removeFile({
															path: fileName
														});
													}
												catch(e)
													{
														log.error({
															title: 'Error Deleting File from SFTP Site',
															details: 'File Name: ' + fileName + '<br>Error: ' + e
														});
													}
											}
										else
											{
												log.error({
													title: 'Unable to Delete File from SFTP Site',
													details: 'Insuffient Script Units Remaining'
												});
											}
									
									}
							}
					}
			}
		
		log.audit({
			title: '*** END OF SCRIPT ***',
			details: 'Units Used: ' + (10000 - runtime.getCurrentScript().getRemainingUsage())
		});
		
    }
    
    // ====================================
    // FUNCTION TO GET THE ITEM INTERNAL ID
    // ====================================
    
    function getItemInternalID(itemName) {
    	
    	// declare and initialize variables
    	var itemID = null;
    	
    	// check we have an item name
    	if (itemName)
    		{
		    	// search for the internal ID of the item
		    	search.create({
		    		type: search.Type.INVENTORY_ITEM,
		    		
		    		filters: [{
		    			name: 'name',
		    			operator: search.Operator.CONTAINS,
		    			values: [itemName]
		    		}],
		    		
		    		columns: [{
		    			name: 'internalid'
		    		}],
		    		
		    	}).run().each(function(result){
		    		
		    		// get the internal ID of the item
		    		itemID = result.getValue({
		    			name: 'internalid'
		    		});
		    		
		    	});
    		}
    	
    	// return itemID to main script function
    	return itemID;
    	
    }
    
    // ========================================================================
    // FUNCTION TO SWITCH THE STATUS SO WE CAN SET THE STATUS FIELD IN NETSUITE
    // ========================================================================
    
    function getStatus(status) {
    	
    	switch(status) {
    	
    		case 'OK':
    			status = 1;
    			break;
    		
    		case 'LOW':
    			status = 2;
    			break;
    		
    		case 'NONE':
    			status = 3;
    			break;
    	
    	}
    	
    	// return status to main script function
    	return status;
    	
    }
    
    return {
    	execute: execute
    };

});
