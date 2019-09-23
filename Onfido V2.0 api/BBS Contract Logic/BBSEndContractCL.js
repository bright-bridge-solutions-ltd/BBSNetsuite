/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/ui/dialog'],
function(currentRecord, url, dialog) {
    
    function cancelButton(record)
    	{
	    	// retrieve parameters that were passed to the function
			var recordID = record;
			
			// return URL of contract record
			var reloadURl = url.resolveRecord({
			    recordType: 'customrecord_bbs_contract',
			    recordId: recordID,
			    isEditMode: false
			});
			
			// redirect the user back to the contract record
			window.onbeforeunload = null;
			window.location.href = reloadURl;
    	}	
	
	/**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	
    	// load current record in order to manipulate it
		var rec = currentRecord.get();
		
		// get the value of the dateselect field
		var dateSelect = rec.getValue({
			fieldId: 'dateselect'
		});
		
		// check that the dateSelect variable returns a value
		if (dateSelect)
			{
				// allow the Suitelet to be submitted
				return true;
			}
		else // dateSelect variable does NOT return a value
			{
				// display an alert to the user
				dialog.alert({
					title: '⚠️ Warning',
					message: 'An early termination date has not been entered..<br/><br/>Please enter a date and try again, or click the cancel button to return to the Contract Record.'
				});
			
				// do not allow the Suitelet to be submitted
				return false;
			}

    }


    return {
    	saveRecord: saveRecord,
    	cancelButton: cancelButton
    };
    
});
