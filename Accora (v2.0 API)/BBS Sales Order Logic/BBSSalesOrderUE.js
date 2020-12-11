/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/render', 'N/file', 'N/url', 'N/record'],
/**
 * @param {serverWidget} serverWidget
 */
function(runtime, render, file, url, record) {
   
    /**
     * Function definition to be triggered after record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	
    	// check if the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// retrieve script parameters
    			var enabledLocation = runtime.getCurrentScript().getParameter({
    				name: 'custscript_bbs_sales_order_ue_location'
    			});
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the custom form from the current record
    			var transactionForm = parseInt(currentRecord.getValue({
    				fieldId: 'customform'
    			}));
    			
    			// get the ID of the current record
		    	var recordID = currentRecord.id;
		    			
		    	// get the value of the location field
		    	var location = currentRecord.getValue({
		    		fieldId: 'location'
		    	});
		    			
		    	// if enabledLocation = location
		    	if (enabledLocation == location)
		    		{
				    	// call function to generate the PDF of the transaction.
				    	var fileID = generatePDF(recordID, transactionForm);
				    			
				    	// check the file was created successfully
				    	if (fileID)
				    		{
				    			// call function to update the transaction with the URL of the file
				    			updateTransaction(recordID, fileID);
				    		}
    				}
    		}   	
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function generatePDF(recordID, transactionForm) {
    	
    	// retrieve script parameters
		var currentScript = runtime.getCurrentScript();
		
		var fileCabinetFolder = parseInt(currentScript.getParameter({
			name: 'custscript_bbs_sales_order_ue_folder_id'
		})); // use parseInt to convert to integer number
    	
    	// declare and initialize variables
		var fileID = null;
		
		try
			{
				// create the PDF of the transaction
				var transactionPDF = render.transaction({
					entityId: recordID,
					printMode: render.PrintMode.PDF,
					formId: transactionForm,
					inCustLocale: true
				});
				
				// set the folder where the file will be stored
				transactionPDF.folder = fileCabinetFolder;
				
				// set the file to be available without login
				transactionPDF.isOnline = true;
				
				// save the file to the file cabinet
				var fileID = transactionPDF.save();
			}
		catch(e)
			{
				log.error({
					title: 'Error Generating PDF',
					details: 'Record ID: ' + recordID + '<br>Error: ' + e
				});
			}
		
		// return folderID to main script function
		return fileID;
    	
    }
    
    function updateTransaction(recordID, fileID) {
    	
    	// call function to return the URL of the file
    	var fileURL = getFileURL(fileID);
    	
    	// check we have a file URL
    	if (fileURL)
    		{
    			// get the domain URL
    			var domainURL = url.resolveDomain({
    			    hostType: url.HostType.APPLICATION
    			});
    			
    			// set the full URL of the file
    			fileURL = 'https://' + domainURL + fileURL;
    			
    			try
    				{
    					// update the transaction with the file's URL
    					record.submitFields({
    						type: record.Type.SALES_ORDER,
    						id: recordID,
    						values: {
    							custbody_bbs_sales_order_pdf_file_url: fileURL
    						}
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Updating Transaction',
    						details: 'Record ID: ' + recordID + '<br>Error: ' + e
    					});
    				}
    		}
    	
    	
    }
    
    function getFileURL(fileID) {
    	
    	// declare and initialize variables
    	var fileURL = null;
    	
    	try
    		{
    			// load the file
    			var fileObj = file.load({
    				id: fileID
    			});
    			
    			// get the URL of the file
    			fileURL = fileObj.url;
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Loading File',
    				details: 'File ID: ' + fileID + '<br>Error: ' + e
    			});
    		}
    	
    	// return fileURL to main script function
    	return fileURL;
    	
    }
    

    return {
        afterSubmit: afterSubmit
    };
    
});