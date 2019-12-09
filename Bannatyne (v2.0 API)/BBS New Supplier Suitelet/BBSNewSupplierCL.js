/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/message'],
function(record, message) {
	
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
		var rec = scriptContext.currentRecord;
		
		// get the value of the 'custpage_terms_accepted' field
		var termsAccepted = rec.getValue({
			fieldId: 'custpage_terms_accepted'
		});
		
		// check if termsAccepted returns false
		if (termsAccepted == false)
			{
				// display a message on the page
				message.create({
					type: message.Type.INFORMATION,
				        title: 'Bannatyne Terms & Conditions',
				        message: 'Please ensure you have accepted the Bannatyne terms and conditions before submitting the form'
					}).show();
			}
		else
			{
				// get the ID of the supplier record
				var supplierRecordID = rec.getValue({
					fieldId: 'custpage_supplier_record'
				});
		
				// load the supplier setup request record
				var supplierRecord = record.load({
					type: 'customrecord_tbg_supp_entry',
					id: supplierRecordID
				});
				
				// retrieve values from the supplierRecord object
				var createdSupplier = supplierRecord.getValue({
					fieldId: 'custrecord_tbg_supp_entry_supp_rec'
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

    }

    return {
        saveRecord: saveRecord,
        cancelButton: cancelButton
    };
    
});
