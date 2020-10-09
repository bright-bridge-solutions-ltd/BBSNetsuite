/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
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
    	var templateID = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_cr_approval_sl_email_temp'
    	});
    	
    	var level1ApprovalLimit = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_cr_approval_level_1_limit'
    	});
    	
    	// retrieve parameters that were passed from the client script
    	var recordID = context.request.parameters.id;
    		recordID = parseInt(recordID); // use parseInt to convert to a number
    		
    	// lookup fields on the RMA record
    	var rmaLookup = search.lookupFields({
    		type: record.Type.RETURN_AUTHORIZATION,
    		id: recordID,
    		columns: ['total', 'createdfrom', 'custbody_bbs_level_1_approved']
    	});
    	
    	// retrieve values from the RMA lookup
    	var total = parseFloat(rmaLookup.total * -1); // lookup returns negative number so multiply by -1 to get a positive number
    	var invoiceID = rmaLookup.createdfrom[0].value;
    	var level1Approved = rmaLookup.custbody_bbs_level_1_approved;
    	
    	// check if the total is less than equal to the level1ApprovalLimit
    	if (total <= level1ApprovalLimit)
    		{
	    		// call function to transform the RMA into a Credit Memo. Pass recordID and invoiceID
	        	var creditMemoRecordID = transformToCreditMemo(recordID, invoiceID);
	        	
	        	// check if creditMemoRecordID returns a value
	        	if (creditMemoRecordID)
	        		{
	        			// call function to close the RMA record. Pass recordID and creditMemoRecordID
	        			closeRMA(recordID, creditMemoRecordID);
	        		}
    		}
    	else // total is greater than the level1ApprovalLimit
    		{
    			// check if the level1Approved is true
    			if (level1Approved == true)
    				{
	    				// call function to transform the RMA into a Credit Memo. Pass recordID and invoiceID
	    	        	var creditMemoRecordID = transformToCreditMemo(recordID, invoiceID);
	    	        	
	    	        	// check if creditMemoRecordID returns a value
	    	        	if (creditMemoRecordID)
	    	        		{
	    	        			// call function to close the RMA record. Pass recordID and creditMemoRecordID
	    	        			closeRMA(recordID, creditMemoRecordID);
	    	        		}
    				}
    			else
    				{
    					// call function to update the 'Level 1 Approved' checkbox on the RMA record
    					updateLevel1Approved(recordID);
    				}
    		}

    }
    
    // ================================================
    // FUNCTION TO TRANSFORM THE RMA INTO A CREDIT MEMO
    // ================================================
    
    function transformToCreditMemo(recordID, invoiceID)
    	{
    		// declare and initialize variables
    		var creditMemoRecordID = null;
    		
    		try
	    		{
			    	// transform the RMA into a credit memo
	    			var creditMemoRecord = record.transform({
	    				fromType: record.Type.RETURN_AUTHORIZATION,
	    				fromId: recordID,
	    				toType: record.Type.CREDIT_MEMO
	    			});
	    			
	    			// get count of 'Apply' sublist lines
	    			var lineCount = creditMemoRecord.getLineCount({
	    				sublistId: 'apply'
	    			});
	    			
	    			// loop through 'Apply' sublist
	    			for (var i = 0; i < lineCount; i++)
	    				{
	    					// get the invoice ID for the current line
	    					var lineInvoiceID = creditMemoRecord.getSublistValue({
	    						sublistId: 'apply',
	    						fieldId: 'internalid',
	    						line: i
	    					});
	    					
	    					// is lineInvoiceID the same as the invoiceID
	    					if (lineInvoiceID == invoiceID)
	    						{
	    							// tick the 'Apply' checkbox for the line
	    							creditMemoRecord.setSublistValue({
	    								sublistId: 'apply',
	    								fieldId: 'apply',
	    								value: true,
	    								line: i
	    							});
	    						}
	    				}
	    			
	    			// save the credit memo record
	    			creditMemoRecordID = creditMemoRecord.save({
	    				ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'Credit Memo Record Created',
	    				details: creditMemoRecordID
	    			});
	    		}
	    	catch(e)
	    		{
	    			log.error({
	    				title: 'Error Creating Credit Memo Record',
	    				details: e
	    			});
	    		}
	    	
	    	return creditMemoRecordID;
	    	
    	}
    
    // ================================
    // FUNCTION TO CLOSE THE RMA RECORD
    // ================================
    
    function closeRMA(recordID, creditMemoRecordID)
    	{
	    	try
	    		{
	    			// load the RMA record
	    			var rmaRecord = record.load({
	    				type: record.Type.RETURN_AUTHORIZATION,
	    				id: recordID,
	    				isDynamic: true
	    			});
	    			
	    			// set fields on the RMA record
	    			rmaRecord.setValue({
	    				fieldId: 'custbody_bbs_approval_status',
	    				value: 4 // 4 = Approved
	    			});
	    			
	    			rmaRecord.setValue({
	    				fieldId: 'custbody_bbs_related_credit_note',
	    				value: creditMemoRecordID
	    			});
	    			
	    			// get line count
	    	    	var lineCount = rmaRecord.getLineCount({
	    	    		sublistId: 'item'
	    	    	});
	    	    	
	    	    	// loop through line count
	    	    	for (var i = 0; i < lineCount; i++)
	    	    		{
	    	    			// select the line
	    	    			rmaRecord.selectLine({
	    	    				sublistId: 'item',
	    	    				line: i
	    	    			});
	    	    			
	    	    			// set the closed checkbox
	    	    			rmaRecord.setCurrentSublistValue({
	    	    				sublistId: 'item',
	    	    				fieldId: 'isclosed',
	    	    				value: true
	    	    			});
	    	    			
	    	    			// commit the new line
	    	    			rmaRecord.commitLine({
	    						sublistId: 'item'
	    					});
	    	    		}
	    	    	
	    	    	// save the RMA record
	    	    	rmaRecord.save({
	    	    		ignoreMandatoryFields: true
	    	    	});
	    			
	    		}
	    	catch(e)
	    		{
	    			log.error({
	    				title: 'Error Closing RMA Record',
	    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
	    			});
	    		}
    	}
    
    // =============================================================
    // FUNCTION TO UPDATE THE RMA RECORD'S LEVEL 1 APPROVED CHECKBOX
    // =============================================================
    
    function updateLevel1Approved(recordID)
	    {
	    	record.submitFields({
	    		type: record.Type.RETURN_AUTHORIZATION,
	    		id: recordID,
	    		values:	{
	    			custbody_bbs_level_1_approved: true
	    		},
	    		enableSourcing: false,
				ignoreMandatoryFields: true
	    	});
	    }

    return {
        onRequest: onRequest
    };
    
});
