/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/file'],
function(ui, search, file) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method == 'GET')
			{
	    		// retrieve parameters that have been passed to the Suitelet
    			var customerID = context.request.parameters.customer;
    		
    			// create a new form
	    		var form = ui.createForm({
	                title: 'Generate Price List',
	                hideNavBar: false
	            });
    		
	    		// set client script to run on the page
				form.clientScriptFileId = 11436;
	    		
	    		// add fields to the form
	    		form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				}).defaultValue = "<img src='https://4626874-sb1.app.netsuite.com/core/media/media.nl?id=3171&c=4626874_SB1&h=1018d60683c3ca665f0e' alt='Astleys Logo' style='width: 250px; height: 75px;'>";
	    		
	    		var customerSelect = form.addField({
	    			id: 'customerselect',
	    			type: ui.FieldType.SELECT,
	    			label: 'Customer',
	    			source: 'customer'
	    		});
	    		
	    		// check if we have a customer selected
	    		if (customerID)
	    			{
	    				// set the value of the customer field
	    				customerSelect.defaultValue = customerID;
	    				
	    				// add a sublist to the form
	    				var itemSublist = form.addSublist({
							type: ui.SublistType.INLINEEDITOR,
							id: 'itemsublist',
							label: 'Items',
						});
	    				
	    				itemSublist.addField({
							type: ui.FieldType.SELECT,
							id: 'item',
							label: 'Item',
							source: 'item'
						});
	    				
	    				itemSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'tradeprice',
							label: 'Trade Price'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.DISABLED
						});
	    				
	    				itemSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'costprice',
							label: 'Cost Price'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.DISABLED
						});
	    				
	    				itemSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'customprice',
							label: 'Custom Price'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.DISABLED
						});
	    				
	    				itemSublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'sellingprice',
							label: 'Selling Price'
						});
	    				
	    				itemSublist.addField({
							type: ui.FieldType.INTEGER,
							id: 'quantity',
							label: 'Quantity'
						});
	    				
	    				// add a submit button to the form
	    				form.addSubmitButton({
	       		 			label: 'Generate Price List'
	       		 		});
	    			}
	    		
	    		// write the response to the page
				context.response.writePage(form);
    	
			}
    	else if (context.request.method == 'POST')
    		{
    		
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
