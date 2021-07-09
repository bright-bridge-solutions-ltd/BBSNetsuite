/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['./BBSSFTPLibrary', 'N/record'],
/**
 * @param {ui} ui
 * @param {serverWidget} serverWidget
 */
function(sftpLibrary, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// declare and initialize variables
    	var orderStatus	= 'CANCELLATION';
    	var poRecord 	= null;
    	
    	// retrieve parameters that have been passed to the Suitelet
    	var recordID = context.request.parameters.id;
    	
    	try
    		{
    			// load the PO record
    			poRecord = record.load({
    				type: record.Type.PURCHASE_ORDER,
    				id: recordID,
    				isDynamic: true
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Loading Purchase Order  ' + recordID,
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
    			
    			// call library function to return the SFTP details for the supplier
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
												sftpLibrary.attachCsvFile(fileID, recordID);
		    								}
		    						}
		    				}
		    		}
    		
    			// call library function to close all lines on the PO
    			sftpLibrary.closeAllLines(recordID, poRecord);
    		}
    	
    }
    
    return {
        onRequest: onRequest
    };
    
});
