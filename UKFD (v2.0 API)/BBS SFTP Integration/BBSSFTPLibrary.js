/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/sftp', 'N/file', 'N/format', 'N/runtime'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, sftp, file, format, runtime)  {

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
    	var unitsOfQuantity	= null;
    	var leadTime		= null;
    	var processingDays	= null;
    	
    	// search for Supplier SFTP Detail records
    	search.create({
    		type: 'customrecord_bbs_sftp',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_sftp_supplier',
    			operator: search.Operator.ANYOF,
    			values: [supplierID]
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
    			name: 'custrecord_bbs_sftp_units_of_quantity'
    		},
    				{
    			name: 'custrecord_bbs_sftp_lead_time'
    		},
    				{
    			name: 'custrecord_bbs_sftp_processing_days'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the SFTP details from the search result
    		endpoint = result.getValue({
    			name: 'custrecord_bbs_sftp_endpoint'
    		});
    		
    		username = result.getValue({
    			name: 'custrecord_bbs_sftp_username'
    		});
    		
    		password = result.getValue({
    			name: 'custrecord_bbs_sftp_password'
    		});
    		
    		hostKey = result.getValue({
    			name: 'custrecord_bbs_sftp_host_key'
    		});
    		
    		portNumber = result.getValue({
    			name: 'custrecord_bbs_sftp_port_number'
    		});
    		
    		outDirectory = result.getValue({
    			name: 'custrecord_bbs_sftp_outbound_directory'
    		});
    		
    		inDirectory = result.getValue({
    			name: 'custrecord_bbs_sftp_inbound_directory'
    		});
    		
    		unitsOfQuantity = result.getText({
    			name: 'custrecord_bbs_sftp_units_of_quantity'
    		});
    		
    		leadTime = result.getValue({
    			name: 'custrecord_bbs_sftp_lead_time'
    		});
    		
    		processingDays = result.getValue({
    			name: 'custrecord_bbs_sftp_processing_days'
    		});
    		
    	});
    	
    	// return values to the main script function
    	return {
    		endpoint:			endpoint,
    		username:			username,
    		password:			password,
    		hostKey:			hostKey,
    		portNumber:			portNumber,
    		outDirectory:		outDirectory,
    		inDirectory:		inDirectory,
    		unitsOfQuantity:	unitsOfQuantity,
    		leadTime:			leadTime,
    		processingDays:		processingDays
    	}
    	
    }
    
    // =====================================
    // FUNCTION TO CREATE AN SFTP CONNECTION
    // =====================================
    
    function createSftpConnection(sftpEndpoint, sftpUsername, sftpPassword, sftpHostKey, sftpDirectory) {
    	
    	// declare and initialize variables
		var sftpConnection 	= null;
			
		try
			{
				// make a connection to the SFTP site
				var sftpConnection = sftp.createConnection({
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
		
		// return values to the main script function
		return sftpConnection;
    	
    }
    
    // ==================================================
    // FUNCTION TO GET A LIST OF FILES FROM THE SFTP SITE
    // ==================================================
    
    function getSftpFileList(sftpConnection, fileType) {
    	
    	// declare and initialize variables
    	var fileList = null;
    	
    	try
	    	{
	    		// get a list of files from the SFTP site
	    		fileList = sftpConnection.list({
	    			path: 	'./' + fileType, 
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
    	
    }
    
    // =============================
    // FUNCTION TO CREATE A CSV FILE
    // =============================
    
    function createCsvFile(currentRecord, unitsOfQuantity, leadTime, processingDays, orderStatus) {
    	
    	// declare and initialize variables
    	var csvFile 				= null;
    	var requiredDeliveryDate	= null;
    	
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
						
				var warehouseAddress = currentRecord.getValue({
					fieldId: 'custbody_warehouseaddress'
				}).split('\r\n');
				
				var salesOrderID = currentRecord.getValue({
					fieldId: 'createdfrom'
				});
				
				var soNumber = currentRecord.getText({
					fieldId: 'createdfrom'
				}).split('#').pop();
				
				// call function to lookup details on the sales order
				var salesOrderInfo = getSalesOrderInfo(salesOrderID);
						
				// if we have a fulfil date on the sales order
				if (salesOrderInfo.fulfilDate)
					{
						// call function to calculate the required delivery date
						requiredDeliveryDate = calculateDate(salesOrderInfo.fulfilDate, leadTime, processingDays);
								
						// format requiredDeliveryDate as a date string
						requiredDeliveryDate = format.format({
							type: format.Type.DATE,
							value: requiredDeliveryDate
						});
					}
							
				// start off the CSV
				var CSV = '"HEAD",,"UKFD","UKFD",' + poNumber + ',' + orderDate + ',' + requiredDeliveryDate + ',,,,,,,,,,' + warehouseAddress[0] + ',' + warehouseAddress[1] + ',' + warehouseAddress[2] + ',' + warehouseAddress[3] + ',' + warehouseAddress[4] + ',' + warehouseAddress[6] + ',,,,,,,' + orderStatus + ',' + soNumber + ',' + salesOrderInfo.menziesDepot + '\r\n';
						
				// get count of lines on the PO
				var lineCount = currentRecord.getLineCount({
					sublistId: 'item'
				});
						
				// loop through line count
				for (var i = 0; i < lineCount; i++)
					{
						// retrieve details from the line
						var lineNo = currentRecord.getSublistValue({
							sublistId: 	'item',
							fieldId: 	'line',
							line: 		i
						});
					
						var productCode = currentRecord.getSublistText({
							sublistId: 	'item',
							fieldId: 	'item',
							line: 		i
						}).split(" : ").pop(); // just keep the child part no
								
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
						CSV += "LINE" + ',' + lineNo + ',,,,,' + productCode + ',,,,' + productDescription + ',,,,,,,,,,,,,,,' + quantityRequired + ',' + unitsOfQuantity + '\r\n';		    									
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
		
		// return values to the main script function
		return {
			csvFile:				csvFile,
			requiredDeliveryDate:	requiredDeliveryDate
		}
    	
    }
    
    // ==============================================
    // FUNCTION TO DOWNLOAD A FILE FROM THE SFTP SITE
    // ==============================================
    
    function downloadFile(sftpConnection, fileName) {
    	
    	// declare and initialize variables
    	var downloadedFile = null;
    	
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
		
		// return values to the main script function
		return downloadedFile;
    	
    }
    
    // ============================================
    // FUNCTION TO DELETE A FILE FROM THE SFTP SITE
    // ============================================
    
    function deleteFile(sftpConnection, fileName) {
    	
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
    
    // ================================================
    // FUNCTION TO UPLOAD THE CSV FILE TO THE SFTP SITE
    // ================================================
    
    function uploadCsvFile(sftpConnection, csvFile) {
    	
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
    	
    }
    
    // =================================================
    // FUNCTION TO SAVE THE CSV FILE TO THE FILE CABINET
    // =================================================
    
    function saveCsvFile(csvFile) {
    	
    	// retrieve script parameters
    	var folderID = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_sftp_folder_id'
    	});
    	
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
    	
    	// return values to the main script function
    	return fileID;
    	
    }
    
    // =====================================================
    // FUNCTION TO ATTACH THE CSV FILE TO THE PURCHASE ORDER
    // =====================================================
    
    function attachCsvFile(fileID, recordID) {
    	
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
				        id: recordID
				    }
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Attaching File to PO ' + recordID,
					details: 'File ID: ' + fileID + '<br>Error: ' + e
				});
			}
    	
    }
    
    // =================================================
    // FUNCTION TO CLOSE ALL LINES ON THE PURCHASE ORDER
    // =================================================
    
    function closeAllLines(recordID, poRecord) {
    	
    	try
    		{
    			// get count of PO lines
    			var lineCount = poRecord.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through PO lines
    			for (var i = 0; i < lineCount; i++)
    				{
    					// select the line
    					poRecord.selectLine({
    						sublistId: 'item',
    						line: i
    					});
    					
    					// mark the line as closed
    					poRecord.setCurrentSublistValue({
    						sublistId: 'item',
    						fieldId: 'isclosed',
    						value: true
    					});
    					
    					// commit the changes to the line
    					poRecord.commitLine({
    						sublistId: 'item'
    					});
    				}
    			
    			// save the PO record
    			poRecord.save({
    				ignoreMandatoryFields: true
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Closing Purchase Order ' + recordID,
    				details: e
    			});
    		}
    	
    }
    
    // =====================================================
	// FUNCTION TO LOOKUP DETAILS ON THE RELATED SALES ORDER
	// =====================================================
	
	function getSalesOrderInfo(salesOrderID) {
		
		// declare and initialize variables
		var menziesDepot 	= null;
		var fulfilDate		= null;
		
		// lookup values on the sales order
		var salesOrderLookup = search.lookupFields({
			type: search.Type.SALES_ORDER,
			id: salesOrderID,
			columns: ['custbody_bbs_menzies_depot_number', 'custbody_bbs_fulfil_date']
		});
		
		// return values to the main script function
		return {
			menziesDepot: 	salesOrderLookup.custbody_bbs_menzies_depot_number,
			fulfilDate:		salesOrderLookup.custbody_bbs_fulfil_date
		}
		
	}
	
	// ================================================
	// FUNCTION TO LOOKUP DETAILS ON THE PURCHASE ORDER
	// ================================================
	
	function getPurchaseOrderInfo(purchaseOrderID) {
		
		// declare and initialize variables
		var soFulfilDate	= null;
		var supplierID		= null;
		
		// lookup values on the purchase order
		var purchaseOrderLookup = search.lookupFields({
			type: search.Type.PURCHASE_ORDER,
			id: purchaseOrderID,
			columns: ['createdfrom.custbody_bbs_fulfil_date', 'entity']
		});
		
		// return values to the main script function
		return {
			soFulfilDate:	purchaseOrderLookup['createdfrom.custbody_bbs_fulfil_date'],
			supplierID:		purchaseOrderLookup.entity[0].value
		}
		
	}
	
	// ===================================================================
	// FUNCTION TO GET THE UKFD PROCESSING DAYS FROM THE SUBSIDIARY RECORD
	// ===================================================================
	
	function getUKFDProcessingDays(subsidiaryID) {
		
		// declare and initialize variables
		var processingDays = null;
		
		// run search to return the UKFD processing days
		search.create({
			type: search.Type.SUBSIDIARY,
			
			filters: [{
				name: 'isinactive',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: [subsidiaryID]
			}],
			
			columns: [{
				name: 'custrecord_bbs_processing_days'
			}],
			
		}).run().each(function(result){
			
			// get the processing days from the search results
			processingDays = result.getValue({
				name: 'custrecord_bbs_processing_days'
			});
			
		});
		
		// return values to the main script function
		return processingDays;
		
	}
	
	// ============================================================
	// FUNCTION TO LOOKUP THE LEAD TIME ON THE MENZIES DEPOT RECORD
	// ============================================================
	
	function getMenziesDepotLeadTime(menziesDepot) {
		
		// return/lookup the lead time on the Menzies depot record
		return search.lookupFields({
			type: 'customrecord_bbs_menzies_depot',
			id: menziesDepot,
			columns: ['custrecord_bbs_menzies_depot_lead_time']
		}).custrecord_bbs_menzies_depot_lead_time;
		
	}
	
	// ========================================================================
	// FUNCTION TO CALCULATE A DATE EXCLUDING NON PROCESSING DAYS/BANK HOLIDAYS
	// ========================================================================
	
	function calculateDate(inputDate, sftpLeadTime, sftpProcessingDays) {
		
		// declare and initialize variables
		var counter = 0;
		
		// call function to get the bank holidays
		var bankHolidays = getBankHolidays();
		
		// split sftpProcessingDays on the , to create an array
		sftpProcessingDays = sftpProcessingDays.split(',');
		
		// if the input date is a string
		if (typeof inputDate == "string")
			{
				// convert the input date to a date object
				inputDate = format.parse({
					type: format.Type.DATE,
					value: inputDate
				});
			}
		
		while(counter < sftpLeadTime)
			{
				// subtract 1 day from the input date to calculate the output date
				inputDate.setDate(inputDate.getDate() - 1);
				
				// check if the date is a processingDay
				var processingDay = isProcessingDay(sftpProcessingDays, inputDate);
				
				// if this is a processing day
				if (processingDay == true)
					{
						// check if the date is a bank holiday
						var bankHoliday = isBankHoliday(bankHolidays, inputDate);
						
						// if this is not a bank holiday
						if (bankHoliday == false)
							{
								counter++;
							}
					}
			}
		
		// return the amended input date to the main script function
		return inputDate;
		
	}
	
	// ===========================================
	// FUNCTION TO RETURN THE PUBLIC/BANK HOLIDAYS
	// ===========================================
	
	function getBankHolidays() {
		
		// declare and initialize variables
		var bankHolidays = new Array();
		
		// run search to return the bank holidays
		search.create({
			type: 'customrecord_bbs_bank_holiday',
			
			filters: [{
				name: 'isinactive',
				operator: search.Operator.IS,
				values: ['F']
			}],
			
			columns: [{
				name: 'custrecord_bbs_bank_holiday_date',
				sort: search.Sort.ASC
			}],
			
		}).run().each(function(result){
			
			// get the bank holiday date
			var bankHolidayDate = result.getValue({
				name: 'custrecord_bbs_bank_holiday_date'
			});
			
			// convert bankHoliday date to a date object
			bankHolidayDate = format.parse({
				type: format.Type.DATE,
				value: bankHolidayDate
			});
			
			// push the date to the bankHolidays array
			bankHolidays.push(bankHolidayDate);
			
			// continue processing search results
			return true;
			
		});
		
		// return values to the main script function
		return bankHolidays;
		
	}
	
	// =============================================
	// FUNCTION TO CHECK IF A DATE IS A BANK HOLIDAY
	// =============================================
	
	function isBankHoliday(bankHolidays, inputDate) {
		
		// declare and initialize variables
		var bankHoliday = false;
		
		// loop through bank holidays days
		for (var i = 0; i < bankHolidays.length; i++)
			{
				// get the bank holiday date
				var bankHolidayDate = bankHolidays[i];
				
				// if the bank holiday date matches the input date
				if (bankHolidayDate.getTime() == inputDate.getTime())
					{
						// set bankHoliday to true
						bankHoliday = true;
						
						// break the loop
						break;
					}
			}
		
		// return values to the main script function
		return bankHoliday;
		
	}
	
	// ===============================================
	// FUNCTION TO CHECK IF A DATE IS A PROCESSING DAY
	// ===============================================
	
	function isProcessingDay(processingDays, inputDate) {
		
		// declare and initialize variables
		var isProcessingDay = false;
		
		// get the day of the week from the inputDate
		var dayOfWeek = inputDate.getDay();
		
		// loop through processing days
		for (var i = 0; i < processingDays.length; i++)
			{
				// get the processing day number
				var processingDay = processingDays[i];
				
				// if the processing day matches the day of the week of the input date
				if (processingDay == dayOfWeek)
					{
						// set isProcessingDay to true
						isProcessingDay = true;
						
						// break the loop
						break;
					}
			}
		
		// return isProcessingDay to the main script function
		return isProcessingDay;
		
	}
    
    return {
    	getSftpDetails:				getSftpDetails,
    	createSftpConnection:		createSftpConnection,
    	getSftpFileList:			getSftpFileList,
    	createCsvFile:				createCsvFile,
    	downloadFile:				downloadFile,
    	deleteFile:					deleteFile,
    	uploadCsvFile:				uploadCsvFile,
    	saveCsvFile:				saveCsvFile,
    	attachCsvFile:				attachCsvFile,
    	closeAllLines:				closeAllLines,
    	getPurchaseOrderInfo:		getPurchaseOrderInfo,
    	getUKFDProcessingDays:		getUKFDProcessingDays,
    	getMenziesDepotLeadTime:	getMenziesDepotLeadTime,
    	calculateDate:				calculateDate
    };
    
});
