/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Jul 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var currentRecordId = context.getSetting('SCRIPT', 'custscript_invoice_id');
	
	var currentRec = nlapiLoadRecord('invoice',currentRecordId); //10GU's
    
    // Get the number of line Time Tracking items submitted
    lines = currentRec.getLineItemCount('time'); 
    
    //parse the list of time records
    for ( var i=1; i<=lines; i++ )
        {
    		checkResources();
    	
	        //get the ID of the Time Tracking 
	        var timeRecId = currentRec.getLineItemValue('time', 'doc', i);
	        var timeSelected = currentRec.getLineItemValue('time', 'apply', i);
	        var timeQuantity = currentRec.getLineItemValue('time', 'quantity', i);
	        var timeRate = currentRec.getLineItemValue('time', 'rate', i);
	        var timeAmount = currentRec.getLineItemValue('time', 'amount', i);
	        
	        //if it's selected on the invoice, update its custom field
	        if (timeSelected == 'T')
	        	{
	        		var timeRecord = null;
	        		
	        		try
		        		{
		        			timeRecord = nlapiLoadRecord('timebill', timeRecId); //10GU's
		        		}
	        		catch(err)
		        		{
	        				timeRecord = null;
		        		}
	        		
	        		if(timeRecord)
	        			{
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice', currentRecordId);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_qty', timeQuantity);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_rate', timeRate);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_amt', timeAmount);
		        			
		        			try
			        			{
			        				nlapiSubmitRecord(timeRecord, false, true); //20GU's
			        			}
		        			catch(err)
			        			{
			        				nlapiLogExecution('ERROR', 'Error updating time bill record', err.message);
			        			}
	        			}
	        	}
	        else
	            {
		            //ensure that updates on invoices when Time Tracking records are unapplied
		            var timeRecord = nlapiLoadRecord('timebill', timeRecId);
		            var invoiceNoSet = timeRecord.getFieldValue('custcol_bbs_related_invoice');
		            
		            if (invoiceNoSet != null)
		            	{
			            	timeRecord.setFieldValue('custcol_bbs_related_invoice', null);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_qty', null);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_rate', null);
		        			timeRecord.setFieldValue('custcol_bbs_related_invoice_amt', null);
		        			
		        			try
			        			{
			        				nlapiSubmitRecord(timeRecord, false, true);
			        			}
		        			catch(err)
			        			{
			        				nlapiLogExecution('ERROR', 'Error updating time bill record', err.message);
			        			}
		            	}
	            }
        }
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}

