/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/render', 'N/xml'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(search, render, xml) {
	   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
	    		
    	// retrieve script parameters
    	var recordID = context.request.parameters.id;
    	
    	// build up the XML
    	var xmlString = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
    	xmlString += "<pdf>"
    	xmlString += "<body padding=\"20px 20px 20px 20px\" size=\"A4\">";
    	
    	// create search to find courier labels attached to the item fulfilment
    	var fileSearch = search.create({
    		type: search.Type.ITEM_FULFILLMENT,
    		
    		filters: [{
    			name: 'internalid',
    			operator: 'anyof',
    			values: [recordID]
    		},
    				{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		}],
    		
    		columns: [{
    			name: 'url',
    			join: 'file'
    		}],
    	});
    	
    	// run search and process results
    	fileSearch.run().each(function(result){
    		
    		// get the image URL
    		var imageURL = result.getValue({
    			name: 'url',
    			join: 'file'
    		});
    		
    		//imageURL = imageURL.replace(/&/g, '&amp;'); // replace the & symbol with &amp;
    		imageURL = xml.escape({xmlText: imageURL});  // replace the & symbol with &amp;
    		
    		// add image to the xml
    		xmlString += '<img src="' + imageURL + '" style="height: 1024px; width: 682px;"/>'
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    	// add closing xml tags
    	xmlString += "</body>";
    	xmlString += "</pdf>";
    	
    	// return the PDF to the user
    	context.response.renderPdf(xmlString);
    	
    }
	    	
	return {
    	onRequest: onRequest
    };

});
