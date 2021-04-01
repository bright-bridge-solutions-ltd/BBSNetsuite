/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSSFTPLibrary', 'N/search', 'N/record', 'N/runtime'],
function(sftpLibrary, search, record, runtime) {
   
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
    	
    	// check that the record is being viewed or edited
    	if (scriptContext.type == scriptContext.UserEventType.VIEW) // if the PO is being viewed
    		{
		    	// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the purchase order's status
    			var status = currentRecord.getValue({
    				fieldId: 'status'
    			});
    			
    			// get the value of the specord field
    			var isSpecialOrder = currentRecord.getValue({
    				fieldId: 'specord'
    			});
    			
    			// if the purchase order is not close and is a special order
    			if (status != 'Closed' && isSpecialOrder == 'T')
    				{
		    			// get the close button
    					var closeButton = scriptContext.form.getButton({
				    		id: 'closeremaining'
				    	});
    					
    					// if we have been able to get the close button
    					if (closeButton)
    						{
		    					// set the close button to be hidden
						    	closeButton.isHidden = true;
			    						
					    		// set a client script to fun on the form
						    	scriptContext.form.clientScriptFileId = 11036851;
					    						
					    		// add button to the form
							    scriptContext.form.addButton({
							    	id: 'custpage_bbs_close_po',
							    	label: 'Close',
							    	functionName: "closePo(" + currentRecord.id + ")" // call client script when button is clicked. Pass recordID to client script
							    });
    						}
    				}
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
    function beforeSubmit(scriptContext) {


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
    	
    	if (scriptContext.type == scriptContext.UserEventType.SPECIALORDER) // if the PO is being created and is a special order
    		{
	    		// declare and initialize variables
    			var requiredDeliveryDate 	= null;
    			var orderStatus				= '';
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the supplier ID
		    	var supplierID = currentRecord.getValue({
		    		fieldId: 'entity'
		    	});
		    			
		    	// call library function to see if we have a matching SFTP record for the supplier
		    	var sftpDetails = sftpLibrary.getSftpDetails(supplierID);
		    			
		    	// retrieve the SFTP details
		    	var sftpEndpoint 		= sftpDetails.endpoint;
		    	var sftpUsername		= sftpDetails.username;
		    	var sftpPassword		= sftpDetails.password;
		    	var sftpHostKey			= sftpDetails.hostKey;
		    	var sftpPortNumber		= sftpDetails.portNumber;
		    	var sftpOutDirectory	= sftpDetails.outDirectory;
		    	var sftpInDirectory		= sftpDetails.inDirectory;
		    	var sftpUnitsOfQuantity	= sftpDetails.unitsOfQuantity;
		    	var sftpLeadTime		= sftpDetails.leadTime;
		    	var sftpProcessingDays	= sftpDetails.processingDays;
		    			
		    	// if we have SFTP details for this supplier
		    	if (sftpEndpoint)
		    		{
		    			// call library function to make a connection to the SFTP site
		    			var sftpConnection = sftpLibrary.createSftpConnection(sftpEndpoint, sftpUsername, sftpPassword, sftpHostKey, sftpInDirectory);
		    					
		    			// if we have been able to successfully make a connection
		    			if (sftpConnection)
		    				{	    				
		    					// call library function to create the CSV file
		    					var createCsvFileResult = sftpLibrary.createCsvFile(currentRecord, sftpUnitsOfQuantity, sftpLeadTime, sftpProcessingDays, orderStatus);
		    					
		    					// return values from the createCsvFileResult
		    					var csvFile 			= createCsvFileResult.csvFile;
		    					requiredDeliveryDate 	= createCsvFileResult.requiredDeliveryDate;
		    					
		    					// if we have been able to successfully generate the CSV file
		    					if (csvFile)
		    						{
			    						// call library function to upload the CSV file to the SFTP site
										sftpLibrary.uploadCsvFile(sftpConnection, csvFile);
										
										// call library function to save the CSV file to the file cabinet
										var fileID = sftpLibrary.saveCsvFile(csvFile);
										
										// if we have been able to save the file
		    							if (fileID)
		    								{
		    									// call library function to attach the CSV file to the purchase order
												sftpLibrary.attachCsvFile(fileID, currentRecord.id);	
		    								}
		    						}
		    				}
		    			
		    			// change the purchase order's approval status to Approved and set the required delivery date
		    			record.submitFields({
		    				type: record.Type.PURCHASE_ORDER,
		    				id: currentRecord.id,
		    				values: {
		    					approvalstatus: 2, // 2 = Approved
		    					custbody_bbs_requested_delivery_date: requiredDeliveryDate
		    				},
		    				enableSourcing: false,
							ignoreMandatoryFields: true
		    			});
		    			
    				}
    		}
    	else if (scriptContext.type == scriptContext.UserEventType.XEDIT && runtime.executionContext == runtime.ContextType.SUITELET) // if the PO is being edited by the Suitelet
    		{
	    		// get the old/new images of the record
				var oldRecord = scriptContext.oldRecord;
				var newRecord = scriptContext.newRecord;
				
				// get the Furlong required delivery date from the old/new images of the record
				var oldDate = oldRecord.getValue({
					fieldId: 'custbody_bbs_requested_delivery_date'
				});
				
				var newDate = newRecord.getValue({
					fieldId: 'custbody_bbs_requested_delivery_date'
				});
				
				// if the Furlong required delivery date has been changed
				if (oldDate.getTime() != newDate.getTime())
					{
						// declare and initialize variables
	    				var orderStatus	= 'CHANGE';
	    				var poRecord	= null;
	    		
		    			try
		    				{
		    					// reload the purchase order
		    					poRecord = record.load({
		    						type: record.Type.PURCHASE_ORDER,
		    						id: newRecord.id
		    					});
		    				}
		    			catch(e)
		    				{
		    					log.error({
		    						title: 'Error Loading Purchase Order ' + newRecord.id,
		    						details: e
		    					});
		    				}
		    			
		    			// if we have been able to load the purchase order
		    			if (poRecord)
		    				{
			    				// get the supplier ID
						    	var supplierID = poRecord.getValue({
						    		fieldId: 'entity'
						    	});
					    			
						    	// call library function to see if we have a matching SFTP record for the supplier
						    	var sftpDetails = sftpLibrary.getSftpDetails(supplierID);
						    			
						    	// retrieve the SFTP details
						    	var sftpEndpoint 		= sftpDetails.endpoint;
						    	var sftpUsername		= sftpDetails.username;
						    	var sftpPassword		= sftpDetails.password;
						    	var sftpHostKey			= sftpDetails.hostKey;
						    	var sftpPortNumber		= sftpDetails.portNumber;
						    	var sftpOutDirectory	= sftpDetails.outDirectory;
						    	var sftpInDirectory		= sftpDetails.inDirectory;
						    	var sftpUnitsOfQuantity	= sftpDetails.unitsOfQuantity;
						    	var sftpLeadTime		= sftpDetails.leadTime;
						    	var sftpProcessingDays	= sftpDetails.processingDays;
						    			
						    	// if we have SFTP details for this supplier
						    	if (sftpEndpoint)
						    		{
						    			// call library function to make a connection to the SFTP site
						    			var sftpConnection = sftpLibrary.createSftpConnection(sftpEndpoint, sftpUsername, sftpPassword, sftpHostKey, sftpInDirectory);
						    					
						    			// if we have been able to successfully make a connection
						    			if (sftpConnection)
						    				{	    				
						    					// call library function to create the CSV file
						    					var createCsvFileResult = sftpLibrary.createCsvFile(poRecord, sftpUnitsOfQuantity, sftpLeadTime, sftpProcessingDays, orderStatus);
						    					
						    					// return values from the createCsvFileResult
						    					var csvFile = createCsvFileResult.csvFile;
						    					
						    					// if we have been able to successfully generate the CSV file
						    					if (csvFile)
						    						{
							    						// call library function to upload the CSV file to the SFTP site
														sftpLibrary.uploadCsvFile(sftpConnection, csvFile);
														
														// call library function to save the CSV file to the file cabinet
														var fileID = sftpLibrary.saveCsvFile(csvFile);
													
														// if we have been able to save the file
						    							if (fileID)
						    								{
						    									// call library function to attach the CSV file to the purchase order
																sftpLibrary.attachCsvFile(fileID, newRecord.id);	
						    								}
						    						}	
						    				}
						    		}
		    				}
					}
    		}
    	
    }

    return {
    	beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
    
});
