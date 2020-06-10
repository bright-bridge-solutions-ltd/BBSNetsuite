/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message'],
function(search, message) {
	
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
    	
    	// get the current record
		var currentRecord = scriptContext.currentRecord;
		
		// get the ID of the SECI record
		var seciRecordID = currentRecord.getValue({
			fieldId: 'custpage_secirecord'
		});
		
		// lookup fields on the SECI site record
		var seciSiteLookup = search.lookupFields({
			type: 'customrecord_bbs_seci_site_form',
			id: seciRecordID,
			columns: ['custrecord_bbs_seci_site_supplier_record']
		});
		
		// return values from the seciSiteLookup object
		var createdSupplier = seciSiteLookup.custrecord_bbs_seci_site_supplier_record;
		
		// check if createdSupplier returns a value
		if (createdSupplier.length)
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
