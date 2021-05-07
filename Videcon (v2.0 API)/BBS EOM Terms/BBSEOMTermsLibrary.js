/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/format'],
function(search, format) {
    
	function recalculateDueDate(currentRecord) {
		
		// declare and initialize variables
		var dueDate 		= null;
		var paymentTerms	= null;
		var paymentDays		= 0;
		
		// get the entity ID from the current record
		var entityID = currentRecord.getValue({
			fieldId: 'entity'
		});
		
		// lookup fields on the entity record
		var entityLookup = search.lookupFields({
			type: search.Type.ENTITY,
			id: entityID,
			columns: ['custentity_bbs_entity_payment_terms', 'custentity_bbs_entity_payment_term_days']
		});
		
		if (entityLookup.custentity_bbs_entity_payment_terms.length > 0)
			{
				paymentTerms = entityLookup.custentity_bbs_entity_payment_terms[0].value;
			}
		
		if (entityLookup.custentity_bbs_entity_payment_term_days)
			{
				paymentDays = parseInt(entityLookup.custentity_bbs_entity_payment_term_days);
			}
		
		// get the record type
		var recordType = currentRecord.type;
		
		if (recordType == 'vendorbill') // if this is a vendor bill
			{
				// get the shipment date
				dueDate = currentRecord.getValue({
					fieldId: 'custbody_bbs_shipment_date'
				});
			}
		else if (recordType == 'invoice') // if this is an invoice
			{
				// get the transaction date
				dueDate = currentRecord.getValue({
					fieldId: 'trandate'
				});
			}
		
		if (paymentTerms == 2) // if paymentTerms is 2 (EOM)
			{
				// set the due date to be the end of the month
				dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth()+1, 0);
			}
		
		// calculate the due date
		dueDate.setDate(dueDate.getDate() + paymentDays);
		
		// set the due date field on the record
		currentRecord.setValue({
			fieldId: 'duedate',
			value: dueDate
		});
		
	}

    return {
    	recalculateDueDate: recalculateDueDate
    };
    
});
