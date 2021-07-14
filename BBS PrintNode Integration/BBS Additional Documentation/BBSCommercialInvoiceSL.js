/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/record'],
function(render, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	var renderedDocument 		= {};
    	renderedDocument.name 		= '';
    	renderedDocument.contents	= '';
    	
    	// retrieve parameters that were passed from the client script
		var fulfilmentID = context.request.parameters['id'];
		
		if(fulfilmentID != null && fulfilmentID != '')
			{
				// load the item fulfilment record
				var itemFulfilment = record.load({
					type: record.Type.ITEM_FULFILLMENT,
					id: fulfilmentID
				});
				
				// retrieve details from the fulfilment record
				var salesOrderID = itemFulfilment.getValue({
					fieldId: 'createdfrom'
				});
				
				var subsidiaryID = itemFulfilment.getValue({
					fieldId: 'subsidiary'
				});
				
				var customerID = itemFulfilment.getValue({
					fieldId: 'entity'
				});
				
				// load the sales order record
				var salesOrder = record.load({
					type: record.Type.SALES_ORDER,
					id: salesOrderID
				});
				
				// load the subsidiary record
				var subsidiary = record.load({
					type: record.Type.SUBSIDIARY,
					id: subsidiaryID
				});
				
				// load the customer record
				var customer = record.load({
					type: record.Type.CUSTOMER,
					id: customerID
				});
				
				// render the transaction file
				try
					{
						var renderer = render.create();
						
						renderer.setTemplateById(109);
						renderer.addRecord({templateName: 'record', record: itemFulfilment});
						renderer.addRecord({templateName: 'salesorder', record: salesOrder});
						renderer.addRecord({templateName: 'subsidiary', record: subsidiary});
						renderer.addRecord({templateName: 'customer', record: customer});
						
						// create the PDF file
						var renderedFile 			= renderer.renderAsPdf();
						renderedDocument.name 		= "Commercial Invoice " + fulfilmentID + ".pdf";
						renderedDocument.contents	= renderedFile.getContents();
					}
				catch(err)
					{
						log.error({title: 'Error rendering PDF ', details: err});
					}
			}
		
		// return the file 
		
		context.response.write(JSON.stringify(renderedDocument));

    }

    return {
        onRequest: onRequest
    };
    
});
