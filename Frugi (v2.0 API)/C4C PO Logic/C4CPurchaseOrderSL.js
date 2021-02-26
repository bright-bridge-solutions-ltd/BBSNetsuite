/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['./BBSPurchaseOrderLibrary'],
function(poLibrary) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// retrieve parameters that were passed from the client script
		var recordID = context.request.parameters.id;
		
		// call library script function to generate the CSV file
		var csvFile = poLibrary.generateCSV(recordID);
		
		// return the file to the browser
    	context.response.writeFile({
    		file: csvFile,
    		isInline: false
    	});

    }

    return {
        onRequest: onRequest
    };
    
});
