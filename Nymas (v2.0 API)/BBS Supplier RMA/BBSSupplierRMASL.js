/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/render'],
function(runtime, record, render) {

    function onRequest(context) {
    	
    	// get script parameters
		var templateID = runtime.getCurrentScript().getParameter({
			name: 'custscript_bbs_supplier_rma_pdf_template'
		});
		
		// retrieve internal ID of record that was passed to the Suitelet as a parameter
    	var recordID = context.request.parameters.record;
    	
    	// load the supplier return authorisation record using the recordID parameter
    	var supplierRMARecord = record.load({
    		type: record.Type.VENDOR_RETURN_AUTHORIZATION,
            id: recordID
    	});
    	
    	// create template renderer
    	var renderer = render.create();
    	
    	// add soRec object to renderer
    	renderer.addRecord('record', supplierRMARecord);
    	
    	// set template
    	renderer.setTemplateById(templateID);
    	
    	// render as XML string
    	var xml = renderer.renderAsString();
		xml = xml.replace(/&(?!amp;)/g, '&amp;');

    	// render output file as PDF
    	context.response.renderPdf({
			xmlString: xml
		});
    }

    return {
        onRequest: onRequest
    };
    
});