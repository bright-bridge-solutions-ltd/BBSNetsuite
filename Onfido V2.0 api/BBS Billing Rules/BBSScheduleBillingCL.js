/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/url', 'N/https', 'N/search'],
function(message, url, https, search) {
    
    function cancelButton()
    	{
	    	// close the window
    		parent.close();
    	}
    
    function createQMPInvoices(scriptContext)
    	{
    		// ==============================================================
			// CALL BACKEND SUITELET TO SCHEDULE 'Create QMP Invoices' SCRIPT
			// ==============================================================
		
			// define URL of Suitelet
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_bbs_create_qmp_invoices_sl',
				deploymentId: 'customdeploy_bbs_create_qmp_invoices_sl'
			});
		
			// call a backend Suitelet to check if 'Billing Process Complete' company pref is set
			var response = 	https.get({
				url: suiteletURL
			});
			
			response = response.body; // get the response body
			
			// check if response is true
			if (response == 'true')
				{
					// display a confirmation message
					message.create({
						type: message.Type.CONFIRMATION,
				        title: 'Create QMP Invoices Scheduled',
				        message: 'The process for the creation of QMP invoices has been scheduled successfully.'
					}).show();
				}
			// check if response is false
			else if (response == 'false')
				{
					// display an error message
					message.create({
						type: message.Type.ERROR,
				        title: 'Error',
				        message: 'The billing process for QMP has not yet completed so the creation of QMP invoices cannot start.<br><br>Please wait until you have received an email informing you that the billing process has completed and try again.'
					}).show(5000); // show for 5 seconds	
				}		
    	}
    
    function createConsolidatedInvoices()
    	{
    		// return the URL of the 'Create Consolidated Invoices' Suitelet
			var reloadURL = url.resolveScript({
			    scriptId: 'customscript_nsts_ci_online_sl',
			    deploymentId: 'customdeploy_nsts_ci_online_sl'
			});
			
			// open the 'Create Consolidated Invoices' Suitelet in a new tab/window
    		window.open(reloadURL, '_blank');
    	}
    
    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	
    	// declare and initialize variables
    	var salesOrders = 0;
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the value of the billing type field from the currentRecord object
    	var billingType = currentRecord.getValue({
    		fieldId: 'billingtypeselect'
    	});
    	
    	// get the text value of the billing type field from the currentRecord object
    	var billingTypeText = currentRecord.getText({
    		fieldId: 'billingtypeselect'
    	});
    	
    	// check if the billing type is 'BUR'
    	if (billingTypeText == 'BUR')
    		{
	    		// display an error message
				message.create({
					type: message.Type.ERROR,
			        title: 'Error',
			        message: 'The ' + billingTypeText + ' billing type is not currently supported.<br><br>Please select a different billing type and try again.'
				}).show();
				
				// prevent the Suitelet from being submitted
				return false;
    		}
    	else
    		{
		    	// get the value of the subsidiary field from the currentRecord object
		    	var subsidiary = currentRecord.getValue({
		    		fieldId: 'subsidiaryselect'
		    	});
		    	
		    	// get the text value of the subsidiary field from the currentRecord object
		    	var subsidiaryText = currentRecord.getText({
		    		fieldId: 'subsidiaryselect'
		    	});
		    	
		    	// check if the billingType
		    	
		    	// create search to find open sales orders for this billing type where the usage updated checkbox is NOT ticked
		    	var salesOrderSearch = search.create({
		    		type: search.Type.SALES_ORDER,
		    		
		    		columns: [{
		    			name: 'tranid',
		    			summary: 'GROUP'
		    		}],
		    		
		    		filters: [{
		    			name: 'status',
		    			operator: 'anyof',
		    			values: ['SalesOrd:F'] // SalesOrd:F = Sales Order:Pending Billing
		    		},
		    		     	{
		    			name: 'custrecord_bbs_contract_billing_type',
		    			join: 'custbody_bbs_contract_record',
		    			operator: 'anyof',
		    			values: [billingType]
		    		},
		    				{
		    			name: 'subsidiary',
		    			operator: 'anyof',
		    			values: [subsidiary]
		    		},
		    				{
		    			name: 'custcol_bbs_usage_updated',
		    			operator: 'is',
		    			values: ['F']
		    		},
		    				{
		    			name: 'mainline',
		    			operator: 'is',
		    			values: ['F']
		    		},
		    				{
		    			name: 'cogs',
		    			operator: 'is',
		    			values: ['F']
		    		},
		    				{
		    			name: 'shipping',
		    			operator: 'is',
		    			values: ['F']
		    		},
		    				{
		    			name: 'taxline',
		    			operator: 'is',
		    			values: ['F']
		    		}],
		    		
		    	});
		    	
		    	// run search and process search results
		    	salesOrderSearch.run().each(function(result) {
		    		
		    		// increase the salesOrders variable
		    		salesOrders++;
		    		
		    	});
		    	
		    	// check if the salesOrders variable is greater than 0
		    	if (salesOrders > 0)
		    		{
			    		// display an error message
						message.create({
							type: message.Type.ERROR,
					        title: 'Error',
					        message: 'The billing process for ' + billingTypeText + ' cannot be started as there are open sales orders for the ' + subsidiaryText + ' subsidiary where the usage on the contract record has not been updated.<br><br><a href="https://5554661-sb1.app.netsuite.com/app/common/search/searchresults.nl?searchid=397&AQT_CUSTRECORD_BBS_CONTRACT_BILLING_TYPE=' + billingType + '&Transaction_SUBSIDIARY=' + subsidiary + 'target="_blank">Click Here</a> to view details of these orders (this will open in a new tab/window)'
						}).show();
						
						// prevent the Suitelet from being submitted
						return false;
		    		}
		    	else
		    		{
		    			// allow the Suitelet to be submitted
		    			return true;
		    		}
    		} 	
    }

    return {
    	saveRecord: saveRecord,
    	cancelButton: cancelButton,
    	createQMPInvoices: createQMPInvoices,
    	createConsolidatedInvoices:  createConsolidatedInvoices
    };
    
});
