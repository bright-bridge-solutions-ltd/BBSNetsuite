/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['./BBSHelloSignLibrary', 'N/search', 'N/record', 'N/file'],
function(helloSignLibrary, search, record, file) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// search for records to be processed
    	return search.create({
    		type: search.Type.SALES_ORDER,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'status',
    			operator: search.Operator.ANYOF,
    			values: ['SalesOrd:A'] // Sales Order:Pending Approval
    		},
    				{
    			name: 'custbody_bbs_hellosign_sig_request_id',
    			operator: search.Operator.ISNOTEMPTY
    		}],
    		
    		columns: [{
    			name: 'custbody_bbs_hellosign_sig_request_id'
    		},
    				{
    			name: 'tranid'
    		}],
    		
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search results
    	var searchResults 		= JSON.parse(context.value);
    	var recordID 			= searchResults.id;
    	var tranID				= searchResults.values['tranid'];
    	var signatureRequestID 	= searchResults.values['custbody_bbs_hellosign_sig_request_id'];
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: 'Record ID: ' + recordID + '<br>Signature Request ID: ' + signatureRequestID
    	});
    	
    	// get the configuration
		var configuration = helloSignLibrary.getConfiguration();
		
		// have we got managed to retrieve the configuration
		if (configuration)
			{
				// declare and initialize variables
				var isComplete 		= 	false;
				var isDeclined		=	false;
				var errorMessages	=	null;
				var fileName		= 	null;
			
				try
					{
						// call function to make the API call to get the status of the signature request
						var getSignatureRequest = helloSignLibrary.getSignatureRequest(signatureRequestID);
						
						// check the result of the API call
						if (getSignatureRequest != null && getSignatureRequest.httpResponseCode == '200')
							{
								// return values from the getSignatureRequest object
								isComplete	= getSignatureRequest.apiResponse.signature_request.is_complete;
								isDeclined	= getSignatureRequest.apiResponse.signature_request.is_declined;
								
								// call function to update the HelloSign Recipients statuses
								helloSignLibrary.updateHellosignRecipientRecords(recordID, getSignatureRequest.apiResponse.signature_request.signatures);
						
								// has the signature request been declined or completed
								if (isComplete == true || isDeclined == true)
									{
										// if the signature request has been completed
										if (isComplete == true)
											{
												// set the fileName variable
												fileName = 'Sales Order_' + tranID + '_signed';
											}
										// if the signature request has been declined
										else if (isDeclined == true)
											{
												// call function to make the sales order as closed
												helloSignLibrary.closeSalesOrder(recordID);
												
												// set the fileName variable
												fileName = 'Sales Order_' + tranID + '_declined';
											}
										
										// call function to make the API call to get the URL of the signed document
										var getFilesRequest = helloSignLibrary.getFiles(signatureRequestID);
												
										// check the result of the API call
										if (getFilesRequest != null && getFilesRequest.httpResponseCode == '200')
											{
												// create the PDF file and save to the file cabinet
												var fileID = file.create({
													fileType: file.Type.PDF,
													name: fileName,
													contents: getFilesRequest.apiResponse,
													folder: configuration.fileCabinetFolderID,
													isOnline: true
												}).save();
														
												// attach the file to the sales order
												record.attach({
													record: {
														type: 'file',
														id: fileID
													},
													to: {
														type: record.Type.SALES_ORDER,
														id: recordID
													}
												});
														
												log.audit({
													title: 'Contract File Attached to Sales Order',
													details: recordID
												});
											}
										else
											{
												// add the API response to the error messages
												errorMessages = getFilesRequest.apiResponse.error.error_msg;
											}
									}
							}
						else
							{
								// add the API response to the error messages
								errorMessages = getSignatureRequest.apiResponse.error.error_msg;
							}
								
						// update fields on the sales order
						record.submitFields({
							type: record.Type.SALES_ORDER,
							id: recordID,
							values: {
								custbody_bbs_hellosign_is_complete:isComplete,
								custbody_bbs_hellosign_is_declined:isDeclined,
								custbody_bbs_hellosign_errors: errorMessages
							}
						});
								
						log.audit({
							title: 'Sales Order Updated',
							details: recordID
						});
					}
				catch(e)
					{
						log.error({
							title: 'Error Getting Signature Request',
							details: e.message
						});
					}
			}
		else
			{
				log.error({
					title: 'No valid configuration found'
				});
			}

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
