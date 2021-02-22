/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/sftp', 'N/file', 'N/format', 'N/record', 'N/runtime'],
function(search, sftp, file, format, record, runtime) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// check the PO is a special order
    	if (scriptContext.type == scriptContext.UserEventType.SPECIALORDER)
    		{
    			// set the status to 'Pending Receipt'
    			scriptContext.newRecord.setValue({
    				fieldId: 'orderstatus',
					value: 'B' // B = Pending Receipt
				});
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	
    	// check the PO is a special order
    	if (scriptContext.type == scriptContext.UserEventType.SPECIALORDER)
    		{
	    		// retrieve script parameters
	        	var folderID = runtime.getCurrentScript().getParameter({
	        		name: 'custscript_bbs_supplier_sftp_folder_id'
	        	});
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the supplier ID
		    	var supplierID = currentRecord.getValue({
		    		fieldId: 'entity'
		    	});
		    			
		    	// see if we have a matching SFTP record for the supplier
		    	var sftpDetails = getSftpDetails(supplierID);
		    			
		    	// retrieve the SFTP details
		    	var sftpEndpoint 		= sftpDetails.endpoint;
		    	var sftpUsername		= sftpDetails.username;
		    	var sftpPassword		= sftpDetails.password;
		    	var sftpHostKey			= sftpDetails.hostKey;
		    	var sftpPortNumber		= sftpDetails.portNumber;
		    	var sftpOutDirectory	= sftpDetails.outDirectory;
		    	var sftpInDirectory		= sftpDetails.inDirectory;
		    			
		    	// if we have SFTP details for this supplier
		    	if (sftpEndpoint)
		    		{
		    			// declare and initialize variables
		    			var sftpConnection 	= null;
		    			var csvFile			= null;
		    				
		    			try
							{
								// make a connection to the SFTP site
								var sftpConnection = sftp.createConnection({
									url: 			sftpEndpoint,
									username:		sftpUsername,
									passwordGuid:	sftpPassword,
									hostKey:		sftpHostKey,
									directory:		sftpInDirectory
								});
							}
		    			catch(e)
		    				{
		    					log.error({
		    						title: 'SFTP Connection Error',
		    						details: e
		    					});
		    				}
		    					
		    			// if we have been able to successfully make a connection
		    			if (sftpConnection)
		    				{
		    					try
		    						{
				    					// get details from the record header
				    					var poNumber = currentRecord.getValue({
				    						fieldId: 'tranid'
				    					});
				    							
				    					var orderDate = currentRecord.getValue({
				    						fieldId: 'trandate'
				    					});
				    							
				    					// format orderDate as a date string
				    					orderDate = format.format({
		    								type: 	format.Type.DATE,
		    								value: 	orderDate
		    							});
				    							
				    					var requiredDate = currentRecord.getValue({
				    						fieldId: 'custbody_bbs_requested_collection_date'
				    					});
				    							
				    					// if we have a required date
				    					if (requiredDate)
				    						{
				    							// format as a date string
				    							requiredDate = format.format({
				    								type: 	format.Type.DATE,
				    								value: 	requiredDate
				    							});
				    						}
				    					
				    					var soNumber = currentRecord.getText({
				    						fieldId: 'createdfrom'
				    					}).split('#').pop();
				    									
				    					// start off the CSV
				    					var CSV = '"HEAD",,"UKFD","UKFD",' + poNumber + ',' + orderDate + ',' + requiredDate + ',,,,,,,,,,"UKFD Warehouse","Unit H1","Pilgrims Walk","Prologis Park","Coventry","CV6 4QG",,,,,,,,' + soNumber + '\r\n';
				    							
				    					// get count of lines on the PO
				    					var lineCount = currentRecord.getLineCount({
				    						sublistId: 'item'
				    					});
				    							
				    					// loop through line count
				    					for (var i = 0; i < lineCount; i++)
				    						{
				    							// retrieve details from the line
				    							var productCode = currentRecord.getSublistText({
				    								sublistId: 	'item',
				    								fieldId: 	'item',
				    								line: 		i
				    							});
				    									
				    							var productDescription = currentRecord.getSublistValue({
				    								sublistId: 	'item',
				    								fieldId: 	'description',
				    								line: 		i
				    							});
				    									
				    							var quantityRequired = currentRecord.getSublistValue({
				    								sublistId: 	'item',
				    								fieldId: 	'quantity',
				    								line: 		i
				    							});
				    									
				    							// add the line details to the CSV
				    							CSV += "LINE" + ',' + (i+1) + ',,,,,' + productCode + ',,,,' + productDescription + ',,,,,,,,,,,,,,,' + quantityRequired + ',"M"\r\n';		    									
				    						}
				    								
				    					// add a 'RECON' line to the CSV
				    					CSV += '"RECON",,"UKFD",' + poNumber + ',' + lineCount + '\r\n';
				    							
				    					// create the CSV file
				    					csvFile = file.create({
				    					fileType: 	file.Type.CSV,
				    						name: 		poNumber + '.csv',
				    						contents: 	CSV
				    					});
		    						}
		    					catch(e)
		    						{
		    							log.error({
		    								title: 'Error Generating CSV File',
		    								details: e
		    							});
		    						}
		    					
		    					// if we have been able to successfully generate the CSV file
		    					if (csvFile)
		    						{
		    							try
		    								{
		    									// upload the file to the SFTP site
		    									sftpConnection.upload({
		    										file: 				csvFile,
		    										replaceExisting: 	true
		    									});
		    								}
		    							catch(e)
		    								{
		    									log.error({
		    										title: 'SFTP Upload Error',
		    										details: e
		    									});
		    								}
		    							
		    							// declare and initialize variables
		    							var fileID = null;
		    							
		    							try
		    								{
		    									// save the CSV file to the file cabinet
		    									csvFile.folder = folderID;
		    									
		    									fileID = csvFile.save();
		    								}
		    							catch(e)
		    								{
		    									log.error({
		    										title: 'Error Saving File',
		    										details: e
		    									});
		    								}
		    							
		    							// if we have been able to save the file
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
														        id: currentRecord.id
														    }
														});
			    									}
			    								catch(e)
			    									{
			    										log.error({
			    											title: 'Error Attaching File to PO',
			    											details: 'File ID: ' + fileID + '<br>Error: ' + e
			    										});
			    									}
		    								}
		    						}
		    				}
    				}
    		}
    	
    }
    
    // ===========================================
    // FUNCTION TO GET THE SFTP CONNECTION DETAILS
    // ===========================================
    
    function getSftpDetails(supplierID) {
    	
    	// declare and initialize variables
    	var endpoint 		= null;
    	var username 		= null;
    	var password 		= null;
    	var hostKey			= null;
    	var portNumber		= null;
    	var outDirectory	= null;
    	var inDirectory		= null;
    	
    	// search for Supplier SFTP Detail records
    	search.create({
    		type: 'customrecord_bbs_supplier_sftp',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_supplier',
    			operator: search.Operator.ANYOF,
    			values: [supplierID]
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
    		endpoint = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_endpoint'
    		});
    		
    		username = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_username'
    		});
    		
    		password = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_password'
    		});
    		
    		hostKey = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_host_key'
    		});
    		
    		portNumber = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_port_number'
    		});
    		
    		outDirectory = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_out_folder'
    		});
    		
    		inDirectory = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_in_folder'
    		});
    		
    	});
    	
    	// return values to the main script function
    	return {
    		endpoint:		endpoint,
    		username:		username,
    		password:		password,
    		hostKey:		hostKey,
    		portNumber:		portNumber,
    		outDirectory:	outDirectory,
    		inDirectory:	inDirectory
    	}
    	
    }

    return {
    	beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});