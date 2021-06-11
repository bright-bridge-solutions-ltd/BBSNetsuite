/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/record'],
function(ui, search, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// retrieve parameters that were passed to the Suitelet
    	var soID = context.request.parameters.so;
    	
    	// create for the form that will be displayed to the user
    	var form = ui.createForm({
            title: 'Approve Order',
            hideNavBar: true
        });
    	
    	// add fields to the form
    	var pageText = form.addField({
		    id: 'pagetext',
		    type: ui.FieldType.INLINEHTML,
		    label: 'Page Text'
		});
    	
    	// call function to get the current approval status of the sales order
    	var approvalStatus = getApprovalStatus(soID);
    	
    	// if the approval status is 13 (Approved - Pending Email Confirmation)
    	if (approvalStatus == 13)
    		{
    			// call function to approve the sales order
    			var salesOrderUpdated = approveSalesOrder(soID);
    			
    			if (salesOrderUpdated == true)
    				{
    					// set value of page text field
    					pageText.defaultValue = '<br/><p align="center"><img src="https://5423837-sb1.app.netsuite.com/core/media/media.nl?id=2851&c=5423837_SB1&h=263dbead5b271f496136" alt="essensys Logo" style="width: 200px; height: 50px; float: center;"></p><br/><p align="center"><span style="font-size:20px; color:#008000;"><strong>Thankyou, you have approved the order and it will now be processed.</strong></span></p><br/><p align="center"><span style="font-size:20px; color:#008000;"><strong>You may now close the page.</strong></span></p>';
    				}
    			else
    				{
    					// set value of page text field
						pageText.defaultValue = '<br/><p align="center"><img src="https://5423837-sb1.app.netsuite.com/core/media/media.nl?id=2851&c=5423837_SB1&h=263dbead5b271f496136" alt="essensys Logo" style="width: 200px; height: 50px; float: center;"></p><br/><p align="center"><span style="font-size:20px; color:#FF0000;"><strong>There was a problem marking the order as approved.</strong></span></p><br/><p align="center"><span style="font-size:20px; color:#FF0000;"><strong>Please contact your account manager for further assistance.</strong></span></p>';
    				}
    		}
    	else
    		{
    			// set value of page text field
				pageText.defaultValue = '<br/><p align="center"><img src="https://5423837-sb1.app.netsuite.com/core/media/media.nl?id=2851&c=5423837_SB1&h=263dbead5b271f496136" alt="essensys Logo" style="width: 200px; height: 50px; float: center;"></p><br/><p align="center"><span style="font-size:20px; color:#FF0000;"><strong>You cannot approve this order as it has already been approved.</strong></span></p><br/><p align="center"><span style="font-size:20px; color:#FF0000;"><strong>Please contact your account manager for further assistance.</strong></span></p>';
    		}
    	
    	// write the response to the page
		context.response.writePage(form);
    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getApprovalStatus(soID) {
    	
    	// declare and initialize variables
    	var approvalStatus = null;
    	
    	// lookup fields on the sales order
    	var soLookup = search.lookupFields({
    		type: search.Type.SALES_ORDER,
    		id: soID,
    		columns: ['custbody_bbs_approval_status']
    	});
    	
    	if (soLookup.custbody_bbs_approval_status.length > 0)
    		{
    			approvalStatus = soLookup.custbody_bbs_approval_status[0].value;
    		}

    	return approvalStatus;  	
    }
    
    function approveSalesOrder(soID) {
    	
    	// declare and initialize variables
    	var salesOrderUpdated = true;
    	
    	try
    		{
    			// update fields on the sales order
    			record.submitFields({
    				type: record.Type.SALES_ORDER,
    				id: soID,
    				values: {
    					custbody_bbs_approval_status: 14 // 14 = Approved - Email Confirmation Received
    				},
    				ignoreMandatoryFields: true
    			});
    		}
    	catch(e)
    		{
    			salesOrderUpdated = false;
    		
    			log.error({
    				title: 'Error Updating Sales Order ' + soID,
    				details: e.message
    			});
    		}
    	
    	return salesOrderUpdated;
    }

    return {
        onRequest: onRequest
    };
    
});
