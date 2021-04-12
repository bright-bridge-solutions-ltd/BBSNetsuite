/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/file', 'N/email'],
function(runtime, search, file, email) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// declare and initialize variables. Global parameter so can be accessed throughout the script
    	emailAttachments = new Array();
    	
    	// call function to send the work order reports
    	sendWorkOrderReport();
    	sendWorkOrderProgressReport();
    	
    	// call function to send the email
		sendEmail(emailAttachments);

    }
    
    // ======================================
    // FUNCTION TO SEND THE WORK ORDER REPORT
    // ======================================
    
    function sendWorkOrderReport() {
    	
    	// declare and initialize variables
    	var CSV 		= '"Reference Code","Description","Product Reference Code","Product Description","Unit Of Measure","Order Quantity","Workflow Type Reference Code","Destination","Release Date","Internal Due Date","Quoted Due Date","Is Using Buffer Slack","Pre-Release Days","Despatching Days","Buffer","Parent Work Order Reference Code","High Touch Time Hours","CCR Buffer Peneration Percentage","Notes 1","Notes 2","Notes 3","Notes 4","Notes 5","Notes 6","Notes 7","Notes 8","Notes 9","Notes 10","Production Resource Reference Code","Operation Number","Operation Descrioption","Setup Hours","Production Hours REVIEW"\r\n';
    	var fileObj		= null;
    	var fileName	= 'workorder.csv';
    	
    	// run search to find records to be processed
    	search.create({
    		type: search.Type.WORK_ORDER,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'status',
    			operator: search.Operator.IS,
    			values: ['WorkOrd:D', 'WorkOrd:A', 'WorkOrd:B'] // Work Order:In Process, Work Order:Planned, Work Order:Released
    		}],
    		
    		columns: [{
    			name: 'tranid'
    		},
    				{
    			name: 'item'
    		},
    				{
    			name: 'salesdescription',
    			join: 'item'
    		},
    				{
    			name: 'quantity'
    		},
    				{
    			name: 'formulatext',
    			formula: "CONCAT(TO_CHAR({enddate},'yyyy-mm-dd'),' 00:00:00')"
    		},
    				{
    			name: 'formulatext',
    			formula: "CONCAT(TO_CHAR({enddate},'yyyy-mm-dd'),' 00:00:00')"
    		},
    				{
    			name: 'createdfrom'
    		}],	
    			
    			
    	}).run().each(function(result){
    		
    		// retrieve search results. Using column numbers to return formula values
			var referenceCode 			= result.getValue(result.columns[0]);
			var productReferenceCode	= result.getText(result.columns[1]);
			var productDescription		= result.getValue(result.columns[2]).replace(/,/g, ''); // remove all commas
			var orderQuantity			= result.getValue(result.columns[3]);
			var internalDueDate			= result.getValue(result.columns[4]);
			var quotedDueDate			= result.getValue(result.columns[5]);
			var notes1					= result.getText(result.columns[6]);
			
			// add the work order details to the CSV
			CSV += referenceCode + ',' + ',' + productReferenceCode + ',' + productDescription + ',' + 'Each' + ',' + orderQuantity + ',' + 'MTO' + ',' + ',' + ',' + internalDueDate + ',' + quotedDueDate + ',' + '0' + ',' + '0' + ',' + '0' + ',' + 'A' + ',' + ',' + '0' + ',' + ',' + notes1 + ',' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + ',' + 'ASSEMBLY' + ',' + '10' + ',' + ',' + '0' + ',';
 			CSV += '\r\n';
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    	// call function to create the CSV file
    	var csvFile = createCSVFile(fileName, CSV);
    	
    	// if we have been able to create the CSV file
		if (csvFile)
			{
				// push the file to the emailAttachments array
				emailAttachments.push(csvFile);
			}
    	
    }
    
    // ===============================================
    // FUNCTION TO SEND THE WORK ORDER PROGRESS REPORT
    // ===============================================
    
    function sendWorkOrderProgressReport() {
    	
    	// declare and initialize variables
    	var CSV 		= '"Work Order Reference Code","Current Operation Number","Production Resource Reference Code","Percentage Complete","Is Completed","Progress Notes"\r\n';
    	var fileObj		= null;
    	var fileName	= 'workorderprogress.csv';
    	
    	// run search to find records to be processed
    	search.create({
    		type: search.Type.WORK_ORDER,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'status',
    			operator: search.Operator.IS,
    			values: ['WorkOrd:D', 'WorkOrd:A', 'WorkOrd:B'] // Work Order:In Process, Work Order:Planned, Work Order:Released
    		}],
    		
    		columns: [{
    			name: 'tranid'
    		}],	
    			
    			
    	}).run().each(function(result){
    		
    		// retrieve search results
			var woReferenceCode = result.getValue({
				name: 'tranid'
			});
			
			// add the work order details to the CSV
			CSV += woReferenceCode + ',' + '10' + ',' + ',' + '0' + ',' + '0' + ',';
 			CSV += '\r\n';
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    	// call function to create the CSV file
    	var csvFile = createCSVFile(fileName, CSV);
    	
    	// if we have been able to create the CSV file
		if (csvFile)
			{
				// push the file to the emailAttachments array
				emailAttachments.push(csvFile);
			}
    	
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getScriptParameters() {
    	
    	// get script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var emailSender = currentScript.getParameter({
    		name: 'custscript_bbs_wo_reports_email_sender'
    	});
    	
    	var emailRecipient = currentScript.getParameter({
    		name: 'custscript_bbs_wo_reports_email_recip'
    	});
    	
    	var emailSubject = currentScript.getParameter({
    		name: 'custscript_bbs_wo_reports_email_subject'
    	});
    	
    	// return values to main script function
    	return {
    		emailSender: 	emailSender,
    		emailRecipient:	emailRecipient,
    		emailSubject:	emailSubject
    	}
    	
    }
    
    function createCSVFile(fileName, fileContents) {
    	
    	// declare and initialize variables
    	var csvFile = null;
    	
    	try
			{
	    		// create the CSV file
    			csvFile = file.create({
		    		fileType: file.Type.CSV,
		    		name: fileName,
		    		contents: fileContents,
		    	});
			}
		catch(e)
			{
				log.error({
					title: 'Error Creating CSV',
					details: e.message
				});
			}
		
		// return values to main script function
		return csvFile;
    	
    }
    
    function sendEmail(emailAttachments) {
    	
    	// retrieve script parameters
    	var scriptParameters = getScriptParameters();
    	
    	try
			{
				// send the CSV file via email
				email.send({
					author: scriptParameters.emailSender,
					recipients: scriptParameters.emailRecipient,
					subject: scriptParameters.emailSubject,
					body: ' ',
					attachments: emailAttachments
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Sending Email',
					details: e.message
				});
			}
    	
    }

    return {
        execute: execute
    };
    
});
