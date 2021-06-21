/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, record) {
	
	function approveRMA(recordID) {
    	
		// declare and initialize variables
		var isApproved = true;
		
		try
	    	{
				// update fields on the RMA record
	    		record.submitFields({
	    			type: record.Type.RETURN_AUTHORIZATION,
	    			id: recordID,
	    			values: {
	    				custbody_bbs_approval_status: 6,// 6 = Approved
	    				orderstatus: 'B' // B = Pending Receipt
	    			},
					ignoreMandatoryFields: true
	    		});
	    	}
	    catch(e)
	    	{
	    		isApproved = false;
	    		
	    		log.error({
	    			title: 'Error Approving RMA Record',
	    			details: 'ID: ' + recordID + '<br>Error: ' + e
	    		});
	    	}
	    	
	    if (isApproved == true)
	    	{
		    	// call function to transform the RMA into a Credit Memo. Pass recordID
		        var creditMemoID = transformToCreditMemo(recordID);
		        	
		        // if we have been able to create the credit memo
		        if (creditMemoID)
		        	{
		        		// call function to close the RMA record
		        		closeRMA(recordID, creditMemoID);
		        	}
	    	}
	    	
	}
	
	function transformToCreditMemo(recordID) {
		
    	// declare and initialize variables
    	creditMemoRecord = null;
    	
    	try
	    	{
			    // transform the RMA into a credit memo
	    		creditMemoRecord = record.transform({
	    			fromType: record.Type.RETURN_AUTHORIZATION,
	    			fromId: recordID,
	    			toType: record.Type.CREDIT_MEMO
	    		}).save({
	    			ignoreMandatoryFields: true
	    		});
	    			
	    		log.audit({
	    			title: 'Credit Memo Record Created',
	    			details: creditMemoRecord
	    		});
	    	}
	    catch(e)
	    	{
	    		log.error({
	    			title: 'Error Creating Credit Memo Record',
	    			details: e
	    		});
	    	}
	    
	    return creditMemoRecord;
    }
	
    function closeRMA(recordID, creditMemoID) {
    	
    	try
			{
		    	// reload the RMA record
    			var rmaRecord = record.load({
    				type: record.Type.RETURN_AUTHORIZATION,
			    	id: recordID,
			    	isDynamic: true
    			});
    			
    			// set the credit note field and approval status
    			rmaRecord.setValue({
    				fieldId: 'custbody_bbs_related_credit_note',
    				value: creditMemoID
    			});
    			
    			rmaRecord.setValue({
    				fieldId: 'custbody_bbs_approval_status',
    				value: 6 // 6 = Approved
    			});
    			
    			// get count of item lines
    			var lineCount = rmaRecord.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through items
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
					title: 'Error Updating RMA Record',
					details: 'ID: ' + recordID + '<br>Error: ' + e
				});
			}
    	
    }
    
    function getApprovalLimit(employeeID) {
    	
    	var approvalLimit = search.lookupFields({
    		type: search.Type.EMPLOYEE,
    		id: employeeID,
    		columns: ['custentity_bbs_cr_note_req_approve_limit']
    	}).custentity_bbs_cr_note_req_approve_limit;
    	
    	if (approvalLimit)
    		{
    			approvalLimit = parseFloat(approvalLimit);
    		}
    	else
    		{
    			approvalLimit = 0;
    		}
    	
    	return approvalLimit;
    	
    }
    
    function updateApprovalStatus(recordID, approvalStatus) {
	    	
    	try
    		{
		    	record.submitFields({
			    	type: record.Type.RETURN_AUTHORIZATION,
			    	id: recordID,
			    	values:	{
			    		custbody_bbs_approval_status: approvalStatus
			    	},
					ignoreMandatoryFields: true
			    });
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Approval Status',
    				details: 'ID: ' + recordID + '<br>Error: ' + e
    			});
    		}
    }
    
    return {
    	getApprovalLimit:		getApprovalLimit,
    	updateApprovalStatus:	updateApprovalStatus,
    	approveRMA: 			approveRMA,
    	transformToCreditMemo: 	transformToCreditMemo,
    	closeRMA:				closeRMA
    };
    
});
