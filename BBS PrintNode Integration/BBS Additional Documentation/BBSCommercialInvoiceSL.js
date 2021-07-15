/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/record', 'N/runtime'],
function(render, record, runtime) 
{
   
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
    	
    	//Retrieve parameters that were passed from the calling script
    	//
		var fulfilmentID = context.request.parameters['id'];
		
		//Retrieve script parameters
		//
		var currentScript = runtime.getCurrentScript();
		
		//Get the pdf template id
		//
		var templateId = currentScript.getParameter({name: 'custscript_bbs_pdf_template_id'});
		
		//Do we have an IF record id
		//
		if(fulfilmentID != null && fulfilmentID != '')
			{
				// load the item fulfilment record
				var itemFulfilment = record.load({
					type: record.Type.ITEM_FULFILLMENT,
					id: fulfilmentID
				});
				
				// retrieve details from the fulfilment record
				var salesOrderID 	= itemFulfilment.getValue({fieldId: 'createdfrom'});
				var subsidiaryID 	= itemFulfilment.getValue({fieldId: 'subsidiary'});
				var customerID 		= itemFulfilment.getValue({fieldId: 'entity'});
				
				// load the sales order record
				var salesOrder = record.load({
											type: 	record.Type.SALES_ORDER,
											id: 	salesOrderID
											});
				
				// load the subsidiary record
				var subsidiary = record.load({
											type: 	record.Type.SUBSIDIARY,
											id: 	subsidiaryID
											});
				
				// load the customer record
				var customer = record.load({
											type: 	record.Type.CUSTOMER,
											id: 	customerID
											});
				
				
				try
					{
						//Create a renderer
						//
						var renderer = render.create();
						
						renderer.setTemplateById(templateId);
						renderer.addRecord({templateName: 'record', record: itemFulfilment});
						renderer.addRecord({templateName: 'salesorder', record: salesOrder});
						renderer.addRecord({templateName: 'subsidiary', record: subsidiary});
						renderer.addRecord({templateName: 'customer', record: customer});
						
						//Create the PDF file
						//
						var renderedFile 			= renderer.renderAsPdf();
						renderedDocument.name 		= "Commercial Invoice " + fulfilmentID + ".pdf";
						renderedDocument.contents	= renderedFile.getContents();
					}
				catch(err)
					{
						log.error({title: 'Error rendering PDF ', details: err});
					}
			}
		
		//Return the object containing the name & the contents
		//
		context.response.write(JSON.stringify(renderedDocument));

    }

    return {
        onRequest: onRequest
    };
    
});
