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
    	
    	// call function to retrieve script parameters
    	var scriptParameters = getScriptParameters();
    	
    	// declare and initialize variables
    	var creditLimitExceeded 	= false;
    	var stripeFloorExceeded		= false;
    	var highValueOrder 			= false;
    	var vatExempt 				= false;
    	var unverifiedAddress 		= null;
    	var marginBelowThreePercent = false;
    	var marginBelowSixPercent 	= false;
    	
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
    	
    	var paymentMethod = currentRecord.getValue({
    		fieldId: 'custbody_bbs_payment_method'
    	});
    	
    	var profitPercent = parseFloat(
    			currentRecord.getValue({
    				fieldId: 'estgrossprofitpercent'
    			})
    		);
    	
    	if (profitPercent < 3)
    		{
    			marginBelowThreePercent = true;
    		}
    	else if (profitPercent >= 3 && profitPercent <= 6)
    		{
    			marginBelowSixPercent = true;
    		}
    	
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
    	var overdueInvoices = checkAgeOfInvoices(customerID, scriptParameters.daysOverdue);
    	
    	// call function to check if the order contains zero value lines
    	var zeroValueLine = checkZeroValueLines(currentRecord);
    	
    	if (paymentMethod == 8 && (orderTotal > scriptParameters.stripeFloor)) // payment method 8 = Stripe
    		{
    			// set stripeFloorExceeded to true
    			stripeFloorExceeded = true;
    		}
    	
    	if (orderTotal > availableBalance)
    		{
    			// set creditLimitExceeded variable to true
    			creditLimitExceeded = true;
    		}
    	
    	if (orderTotal > scriptParameters.highValueOrderLimit)
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
    		fieldId: 'custbody_bbs_margin_below_3_pc',
    		value: marginBelowThreePercent
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_margin_below_6_pc',
    		value: marginBelowSixPercent
    	});
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_zero_value_line',
    		value: zeroValueLine
    	});
    	
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
    	
    	currentRecord.setValue({
    		fieldId: 'custbody_bbs_stripe_floor_exceeded',
    		value: stripeFloorExceeded
    	});

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getScriptParameters() {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var highValueOrderLimit = currentScript.getParameter({
    		name: 'custscript_bbs_high_value_order_limit'
    	});
    	
    	var daysOverdue = currentScript.getParameter({
    		name: 'custscript_bbs_so_approval_invoice_days'
    	});
    	
    	var stripeFloor = currentScript.getParameter({
    		name: 'custscript_bbs_so_approval_stripe_floor'
    	});
    	
    	// return values to the main script function
    	return {
    		highValueOrderLimit:	highValueOrderLimit,
    		daysOverdue:			daysOverdue,
    		stripeFloor:			stripeFloor
    	}
    	
    }
     
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
    
    function checkAgeOfInvoices(customerID, daysOverdue) {
    	
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
    			name: 'status',
    			operator: search.Operator.ANYOF,
    			values: ['CustInvc:A'] // Invoice:Open
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
    
    function checkZeroValueLines(currentRecord) {
    	
    	// declare and initialize variables
    	var zeroValueLine = false;
    	
    	// get count of item lines on the sales order
    	var lineCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through lineCount
    	for (var i = 0; i < lineCount; i++)
    		{
    			// get the amount from the line
    			var amount = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'amount',
    				line: i
    			});
    			
    			// if the amount is 0
    			if (amount == 0)
    				{
    					// set zeroValueLine variable to true
    					zeroValueLine = true;
    					
    					// break the loop
    					break;
    				}
    		}
    	
    	return zeroValueLine;
    	
    }
    
    

    return {
        onAction : onAction
    };
    
});
