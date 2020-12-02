/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// retrieve script parameters. Parameters are global variables so can be accessed throughout the script
    	var currentScript = runtime.getCurrentScript();
    	
    	highValueOrderLimit = currentScript.getParameter({
    		name: 'custscript_bbs_high_value_order_limit'
    	});
    	
    	daysOverdue = currentScript.getParameter({
    		name: 'custscript_bbs_so_approval_invoice_days'
    	});
    	
    	// declare and initialize variables
    	var creditLimitExceeded = false;
    	var highValueOrder = false;
    	var vatExempt = false;
    	var unverifiedAddress = null;
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// return values from the record
    	var customerID = currentRecord.getValue({
    		fieldId: 'entity'
    	});
    	
    	var orderTotal = currentRecord.getValue({
    		fieldId: 'total'
    	});
    	
    	var taxTotal = currentRecord.getValue({
    		fieldId: 'taxtotal'
    	});
    	
    	var verifiedAddress = currentRecord.getSubrecord({
    		fieldId: 'shippingaddress'
    	}).getValue({
    		fieldId: 'custrecord_bbs_verified_address'
    	});
    	
    	switch(verifiedAddress) {
    	
    		case true:
    			unverifiedAddress = false;
    			break;
    		
    		case false:
    			unverifiedAddress = true;
    			break;
    	
    	}
    	
    	// call function to lookup fields on the customer record
    	var customerInfo = getCustomerInfo(customerID);
    	var accountOnHold = customerInfo.accountonhold;
    	var availableBalance = customerInfo.availablebalance;
    	
    	// call function to check if the customer has made 3 or less orders
    	var firstThreeOrders = checkNumberOfOrders(customerID);
    	
    	// call function to check if the customer has any overdue invoices
    	var overdueInvoices = checkAgeOfInvoices(customerID);
    	
    	if (orderTotal > availableBalance)
    		{
    			// set creditLimitExceeded variable to true
    			creditLimitExceeded = true;
    		}
    	
    	if (orderTotal > highValueOrderLimit)
    		{
    			// set highValueOrder variable to true
    			highValueOrder = true;
    		}
    	
    	if (taxTotal == 0)
    		{
    			// set vatExempt variable to true
    			vatExempt = true;
    		}
    	
    	// update fields on the record
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_high_value_order',
    		value: highValueOrder
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_account_on_hold',
    		value: accountOnHold
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_credit_limit_exceeded',
    		value: creditLimitExceeded
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_1st_2nd_3rd_order',
    		value: firstThreeOrders
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_overdue_invoices',
    		value: overdueInvoices
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_vat_exempt',
    		value: vatExempt
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_unverified_address',
    		value: unverifiedAddress
    	});

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getCustomerInfo(customerID) {
    	
    	// declare and initialize variables
    	var accountOnHold = null;
    	var creditLimit = 0;
    	var balance = 0;
    	var unbilled = 0;
    	var availableBalance = 0;
    	
    	try
    		{
    			// load the customer record
    			var customerRecord = record.load({
    				type: record.Type.CUSTOMER,
    				id: customerID
    			});
    			
    			// get values from the customer record
    			accountOnHold = customerRecord.getValue({
    				fieldId: 'creditholdoverride'
    			});
    			
    			creditLimit = customerRecord.getValue({
    				fieldId: 'creditlimit'
    			});
    			
    			balance = customerRecord.getValue({
    				fieldId: 'balance'
    			});
    			
    			unbilled = customerRecord.getValue({
    				fieldId: 'unbilledorders'
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Loading Customer Record',
    				details: e
    			});
    		}
    	
    	// switch the accountOnHold
    	switch(accountOnHold) {
    	
    		case 'ON':
    			accountOnHold = true;
    			break;
    		
    		default:
    			accountOnHold = false;
    	
    	}
    	
    	// get the available balance
    	availableBalance = parseFloat(creditLimit) - (parseFloat(balance) + parseFloat(unbilled));
    	
    	// return values to the main script function
    	return {
    		accountonhold:		accountOnHold,
    		availablebalance:	availableBalance
    	}
    	
    }
    
    function checkNumberOfOrders(customerID) {
    	
    	// declare and initialize variables
    	var numberOfOrders = 0;
    	var firstThreeOrders = false;
    	
    	// run search to check if the customer has made 3 or less orders
    	search.create({
    		type: search.Type.SALES_ORDER,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'mainname',
    			operator: search.Operator.ANYOF,
    			values: [customerID]
    		}],
    		
    		columns: [{
    			name: 'tranid',
    			summary: search.Summary.COUNT
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the number of orders from the search
    		numberOfOrders = result.getValue({
    			name: 'tranid',
    			summary: search.Summary.COUNT
    		});
    		
    	});
    	
    	if (numberOfOrders <= 3)
    		{
    			// set firstThreeOrders variable to true
    			firstThreeOrders = true;
    		}
    	
    	// return firstThreeOrders variable to main script function
    	return firstThreeOrders;
    	
    }
    
    function checkAgeOfInvoices(customerID) {
    	
    	// declare and initialize variables
    	var numberOfInvoices = 0;
    	var overdueInvoices = false;
    	
    	// run search to check if the customer has made 3 or less orders
    	search.create({
    		type: search.Type.INVOICE,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'mainname',
    			operator: search.Operator.ANYOF,
    			values: [customerID]
    		},
    				{
    			name: 'daysoverdue',
    			operator: search.Operator.GREATERTHANOREQUALTO,
    			values: [daysOverdue]
    		}],
    		
    		columns: [{
    			name: 'tranid',
    			summary: search.Summary.COUNT
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the number of invoices from the search
    		numberOfInvoices = result.getValue({
    			name: 'tranid',
    			summary: search.Summary.COUNT
    		});
    		
    	});
    	
    	if (numberOfInvoices > 0)
    		{
    			// set overdueInvoices variable to true
    			overdueInvoices = true;
    		}
    	
    	// return overdueInvoices variable to main script function
    	return overdueInvoices;
    	
    }

    return {
        onAction : onAction
    };
    
});
