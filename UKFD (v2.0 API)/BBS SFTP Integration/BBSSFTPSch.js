/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/sftp', 'N/record', 'N/format', 'N/file', 'N/runtime'],
/**
 * @param {sftp, file, search, xml, record, runtime, email} 
 */
function(search, sftp, record, format, file, runtime) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    		
    	// retrieve script parameters. Script parameters are global parameters so can be accessed throughout the script
    	currentScript = runtime.getCurrentScript();
    	
    	folderID = currentScript.getParameter({
    		name: 'custscript_bbs_supplier_sftp_folder_id'
    	});
    	
    	// search for SFTP supplier detail records
    	search.create({
    		type: 'customrecord_bbs_supplier_sftp',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_supplier_sftp_endpoint'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_username'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_password'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_host_key'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_port_number'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_out_folder'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_in_folder'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the SFTP details from the search result
    		var sftpEndpoint = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_endpoint'
    		});
    		
    		var sftpUsername = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_username'
    		});
    		
    		var sftpPassword = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_password'
    		});
    		
    		var sftpHostKey = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_host_key'
    		});
    		
    		var sftpPortNumber = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_port_number'
    		});
    		
    		var sftpOutDirectory = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_out_folder'
    		});
    		
    		var sftpInDirectory = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_in_folder'
    		});
    		
    		// call function to process files on the server
    		processFiles(sftpEndpoint, sftpUsername, sftpPassword, sftpHostKey, sftpPortNumber, sftpOutDirectory);
    		
    		// continue processing search results
    		return true;
    		
    	});
    }
    
    // ============================================
    // FUNCTION TO PROCESS FILES ON THE SFTP SERVER
    // ============================================
    
    function processFiles(sftpEndpoint, sftpUsername, sftpPassword, sftpHostKey, sftpPortNumber, sftpDirectory) {
    	
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
							path: 	'./', 
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
									details: (i+1) + ' of ' + fileList.length
								});
							
								// check we have sufficient remaining usage
								if (currentScript.getRemainingUsage() > 200)
									{
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
												// declare and initialize variables
												var poNumber 	= null;
												var orderStatus = null;
											
												// get the lines of the file
												var fileLines = downloadedFile.lines.iterator();
												
												// process the HEAD line from the file
												fileLines.each(function(line){
													
													// split the line so we can return info from it
													var lineValues = line.value.split(',');
													
													// get values from the line
													poNumber 	= lineValues[4];
													orderStatus = getStatus(lineValues[28]); // switch the status so we can set the status field in NetSuite
													
													// only process the first line
													return false;
													
												});
												
												// get the internal ID of the po number
												var poID = getPOInternalID(poNumber);
												
												try
													{
														// load the PO record
														var poRecord = record.load({
															type: record.Type.PURCHASE_ORDER,
															id: poID,
															isDynamic: true
														});
														
														// update fields on the PO
														poRecord.setValue({
															fieldId: 'custbody_bbs_supplier_status',
															value: orderStatus
														});
														
														// process the LINES lines from the file
														fileLines.each(function(line){
															
															// split the line so we can return info from it
															var lineValues = line.value.split(',');
															
															// get values from the line
															var lineNumber 		= lineValues[1];
															var lineStatus 		= getStatus(lineValues[5]); // switch the status so we can set the status field in NetSuite
															var dispatchDate	= lineValues[7];
															var inStockDate		= lineValues[8];
															
															// if we have a dispatch date
															if (dispatchDate)
																{
																	// convert dispatchDate as a date object
																	dispatchDate = format.parse({
																		type: format.Type.DATE,
																		value: dispatchDate
																	});
																}
															
															// if we have an in stock date
															if (inStockDate)
																{
																	// format inStockDate as a date object
																	inStockDate = format.parse({
																		type: format.Type.DATE,
																		value: inStockDate
																	});
																}
															
															// update line fields on the PO
															poRecord.selectLine({
																sublistId: 'item',
																line: lineNumber-1
															});
															
															poRecord.setCurrentSublistValue({
																sublistId: 'item',
																fieldId: 'custcol_bbs_supplier_status',
																value: lineStatus
															});
															
															poRecord.setCurrentSublistValue({
																sublistId: 'item',
																fieldId: 'custcol_bbs_supplier_dispatch_date',
																value: dispatchDate
															});
															
															poRecord.setCurrentSublistValue({
																sublistId: 'item',
																fieldId: 'custcol_bbs_supplier_in_stock_date',
																value: inStockDate
															});
															
															poRecord.commitLine({
																sublistId: 'item'
															});
															
															// continue processing lines
															return true;
															
														});
														
														// save the PO record
														poRecord.save({
															ignoreMandatoryFields: true
														});														
													}
												catch(e)
													{
														log.error({
															title: 'Error Updating PO',
															details: 'PO ID: ' + poID + '<br>Error: ' + e
														});
													}
												
												// declare and initialize variables
												var fileID = null;
												
												try
													{
														// save the file to the file cabinet
														var fileObj = file.create({
															fileType: 	file.Type.CSV,
															name: 		fileName,
															contents: 	downloadedFile.getContents()
														});
														
														fileObj.folder = folderID;
														
														fileID = fileObj.save();
													}
												catch(e)
													{
														log.error({
															title: 'Error Creating File',
															details: e
														});
													}
												
												// if we have been able to create the file
												if (fileID)
													{
														try
															{
																// attach the file to the PO
																record.attach({
																	record: {
																        type: 'file',
																        id: fileID
																    },
																    to: {
																        type: record.Type.PURCHASE_ORDER,
																        id: poID
																    }
																});
															}
														catch(e)
															{
																log.error({
																	title: 'Error Attaching File to PO',
																	details: 'PO ID: ' + poID + '<br>Error: ' + e
																});
															}
													}
												
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
									}
								else
									{
										log.error({
											title: 'Insufficient Script Usage Remaining',
											details: 'Units Remaining: ' + currentScript.getRemainingUsage()
										});
										
										// break loop
										break;
									}
							}
					}
			}    	
    }
    
    // ==================================
    // FUNCTION TO GET THE PO INTERNAL ID
    // ==================================
    
    function getPOInternalID(poNumber) {
    	
    	// declare and initialize variables
    	var poID = null;
    	
    	// search for the internal ID of the PO
    	search.create({
    		type: search.Type.PURCHASE_ORDER,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'numbertext',
    			operator: search.Operator.IS,
    			values: [poNumber]
    		}],
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the internal ID of the purchase order
    		poID = result.getValue({
    			name: 'internalid'
    		});
    		
    	});
    	
    	// return poID to main script function
    	return poID;
    	
    }
    
    // ========================================================================
    // FUNCTION TO SWITCH THE STATUS SO WE CAN SET THE STATUS FIELD IN NETSUITE
    // ========================================================================
    
    function getStatus(status) {
    	
    	switch(status) {
    	
    		case 'ACCEPTED':
    			status = 1;
    			break;
    		
    		case 'CANCELLED':
    			status = 3;
    			break;
    		
    		case 'CUT':
    			status = 5;
    			break;
    		
    		case 'DISPATCHED':
    			status = 2;
    			break;
    		
    		case 'ON-VAN':
    			status = 6;
    			break;
    		
    		case 'OUT OF STOCK':
    			status = 4;
    			break;
    	
    	}
    	
    	// return status to main script function
    	return status;
    	
    }
    
    return {
    	execute: execute
    };

});
