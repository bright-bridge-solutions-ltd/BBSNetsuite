/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/render', 'N/email'],
function(search, record, render, email) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// create search to find records to be processed
    	var creditMemoSearch = search.create({
        		type: search.Type.CREDIT_MEMO,
    		
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		},
    				{
    			name: 'custbody_bbs_credit_note_error',
    			operator: 'is',
    			values: ['T']
    		}],
    		
    		columns: [{
    			name: 'tranid'
    		},
    				{
    			name: 'custentity_bbs_credit_note_email',
    			join: 'customer'
    		}],
    	});
    	
    	// run search and process results
    	creditMemoSearch.run().each(function(result) {
    		
    		// get the internal ID of the record from the search results
    		var recordID = parseInt(result.id); // 
    		
    		// get the tran ID from the search results
    		var tranID = result.getValue({
    			name: 'tranid'
    		});
    		
    		// get the email address from the search results
    		var emailRecipient = result.getValue({
    			name: 'custentity_bbs_credit_note_email',
    			join: 'customer'
    		});
    			
    		log.audit({
    			title: "Processing Credit Memo",
    			details: tranID
    		});
    		
    		// call function to update record. Pass recordID
    		updateTransactionSummary(recordID);
    		
    		// compile email content
        	var mergeResult = render.mergeEmail({
        		templateId: 306,
        		entity: null,
        		recipient: null,
        		customRecord: null,
        		supportCaseId: null,
        		transactionId: recordID
        	});
        	
        	var emailSubject = mergeResult.subject;
        	var emailBody = mergeResult.body;
        	
        	// generate the PDF file
        	var emailAttachments = render.transaction({
				entityId: recordID,
				printMode: render.PrintMode.PDF,
				inCustLocale: false
			});
        	
        	try
	    		{
		    		email.send({
		        		author: '1175', // 1175 = Onfido Billing
		        		recipients: emailRecipient,
		        		subject: emailSubject,
		        		body: emailBody,
		        		attachments: [emailAttachments],
		        		relatedRecords:	{
		        			transactionId: recordID
		        		}
		        	});
		    		
		    		log.audit({
		    			title: "Email Sent",
		    			details: "Credit Note: " + tranID
		    		});
	    		}
        	catch(error)
	    		{
	    			log.error({
	    				title: "Error Sending Email",
	    				details: "Record ID: " + recordID + " | Error: " + error
	    			});
	    		}
        	
        	// continue processing results
        	return true;
    	
    	});

    }
    
    function updateTransactionSummary(recordID)
		{
			var summary = {};
			
			// load the credit memo record
			var creditMemoRecord = record.load({
				type: record.Type.CREDIT_MEMO,
				id: recordID,
				isDynamic: true
			});
			
			// get the value of the currency field
			var currency = creditMemoRecord.getValue({
				fieldId: 'currency'
			});
			
			// load the currency record
			var currencyRecord = record.load({
				type: record.Type.CURRENCY,
				id: currency,
				isDynamic: true
			});
			
			// get the currency symbol from the currencyRecord object
			var currencySymbol = currencyRecord.getValue({
				fieldId: 'displaysymbol'
			});
			
			// get count of item lines
			var lineCount = creditMemoRecord.getLineCount({
				sublistId: 'item'
			});
			
			// loop through the item lines
			for (var int = 0; int < lineCount; int++) 
				{
				  	var itemId = creditMemoRecord.getSublistValue({
				  		sublistId: 'item',
						fieldId: 'item',
						line: int
					});
		
					var itemDescription = creditMemoRecord.getSublistText({
						sublistId: 'item',
						fieldId: 'item',
						line: int
					});
		
					var itemUnitPrice = Number(creditMemoRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						line: int
					}));
		
					var itemQuantity = Number(creditMemoRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						line: int
					}));
		
					var itemAmount = Number(creditMemoRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'amount',
						line: int
					}));
		
					var itemVatAmount = Number(creditMemoRecord.getSublistValue({
						sublistId: 'item',
						fieldId: 'taxamount',
						line: int
					}));
		
					var itemVatRate = Number(0);
							
					try
						{
							itemVatRate = creditMemoRecord.getSublistValue({
								sublistId: 'taxdetails',
								fieldId: 'taxrate',
								line: int
							});
						}
					catch(err)
						{
							itemVatRate = Number(0);
						}
					
					// see if we have this product in the summary yet
					if (!summary[itemId])
						{
							// add it to the summary
							summary[itemId] = new itemSummaryInfo(itemId, itemDescription, itemUnitPrice, itemQuantity, itemAmount, itemVatAmount, itemVatRate, currencySymbol);
						}
					else
						{
							// update the summary
							summary[itemId].quantity += itemQuantity;
							summary[itemId].amount += itemAmount;
							summary[itemId].vatAmount += itemVatAmount;
						}
				}
		    	
			// update the record with the new summary info
			var outputArray = [];
			
			for (var summaryKey in summary) 
				{
			    	outputArray.push(summary[summaryKey]);
				}
			
			try
			    {
			    	record.submitFields({
			    		type: record.Type.CREDIT_MEMO,
			    		id: recordID,
			    		values: {
			    			custbody_bbs_json_summary: JSON.stringify(outputArray)
			    		}
			    	});
			    			
			    	log.audit({
			    		title: 'Record Updated',
			    		details: recordID
			    	});
			    }
			catch(err)
			    {
			    	log.error({
			    		title: 'Error Updating Record',
			    		details: 'Record ID: ' + recordID + '<br>Error: ' + err
			    	});
			    }
	    }

	//=============================================================================
	//Objects
	//=============================================================================
	//
	function itemSummaryInfo(_itemid, _salesdescription, _unitPrice, _quantity, _amount, _vatAmount, _itemVatRate, _currencySymbol)
	  	{
		  	//Properties
		  	//
		  	this.itemId 				= _itemid;
		  	this.salesDescription 		= _salesdescription;
		  	this.unitPrice 				= Number(_unitPrice);
		  	this.quantity 				= Number(_quantity);
		  	this.amount 				= Number(_amount);
		  	this.vatAmount				= Number(_vatAmount);
		  	this.vatRate				= _itemVatRate + '%';
		  	this.symbol					= _currencySymbol;
	  	}

    return {
        execute: execute
    };
    
});
