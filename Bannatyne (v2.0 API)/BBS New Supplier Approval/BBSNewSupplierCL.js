/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/ui/message'],
function(currentRecord, record, message) {
	
	function cancelButton()
		{
	    	// close the window
			window.close();    
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
    	
    	// load current record in order to manipulate it
		var rec = currentRecord.get();
		
		// get the ID of the seci record
		var seciRecordID = rec.getValue({
			fieldId: 'custpage_secirecord'
		});
		
		// load the seci record
		var seciRecord = record.load({
			type: 'customrecord_bbs_seci_record',
			id: seciRecordID
		});
		
		// retrieve values from the seciRecord object
		var createdSupplier = seciRecord.getValue({
			fieldId: 'custrecord_bbs_seci_record_create_pt_sup'
		});
		
		// check if createdSupplier returns a value
		if (createdSupplier)
			{
				// display a message on the page
				message.create({
					type: message.Type.ERROR,
				        title: 'Error',
				        message: 'You have already submitted your bank details using this form'
					}).show();
			
				// prevent the record from being submitted
				return false;
			}
		else
			{
				// allow the record to be submitted
				return true;
			}

    }

    return {
        saveRecord: saveRecord,
        cancelButton: cancelButton
    };
    
});
