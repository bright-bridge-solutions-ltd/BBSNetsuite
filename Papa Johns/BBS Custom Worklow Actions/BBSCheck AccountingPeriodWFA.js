/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Jun 2020     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function workflowAction() 
{
	var returnState = 'F';
	
	try
		{    	
	    	//Get the current record
			//
			var currentRecord = nlapiGetNewRecord();
			
			//Get the period from the record
			//
			var postingPeriod = currentRecord.getFieldValue('postingperiod');
			
			//Read in the period record
			//
			var periodRecord = null;
			
			try
				{
					periodRecord = nlapiLoadRecord('accountingperiod', postingPeriod);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error reading accounting period', err.message);
					periodRecord = null;
				}
			
			//Period record read ok?
			//
			if(periodRecord != null)
				{
					//Is the A/P locked?
					//
					var apLocked = periodRecord.getFieldValue('aplocked');
				
					returnState = (apLocked == 'T' ? 'T' : 'F');
				}
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Unexpected error in custom workflow action', err.message);
		}
	
	return returnState;
}
