/**
 * @appliedtorecord recordType 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
 
function pageInit(type)
	{
		// get the value of the entity field
		var entityID = nlapiGetFieldValue('entity');
		var overrideDueDate = nlapiGetFieldValue('custbody_bbs_override_due_date');
		
		// if we have an entity and override checkbox is unticked
		if (entityID && overrideDueDate == 'F')
			{
				// call function to recalculate due dates
				recalculateDates(entityID);
			}
	}

function fieldChanged(type, name)
	{
		if (name == 'entity' || name == 'trandate' || name == 'custbody_bbs_shipment_date' || name == 'terms') // if the entity, trandate, shipment date or terms fields has been changed
			{
				// get the value of the entity field and override checkbox
				var entityID = nlapiGetFieldValue('entity');
				var overrideDueDate = nlapiGetFieldValue('custbody_bbs_override_due_date');
				
				// if we have an entity and override checkbox is unticked
				if (entityID && overrideDueDate == 'F')
					{
						// call function to recalculate due dates
						recalculateDates(entityID);
					}
			}
		else if (name == 'custbody_bbs_override_due_date') // if the override due date checkbox has been changed
			{
				// get value of entity field and override checkbox
				var overrideDueDate = nlapiGetFieldValue('custbody_bbs_override_due_date');
				var entityID = nlapiGetFieldValue('entity');
			
				// if we have an entity and override checkbox is unticked
				if (entityID && overrideDueDate == 'F')
					{
						// disable the due date field
						nlapiDisableField('duedate', true);
						
						// call function to recalculate due dates
						recalculateDates(entityID);
					}
				else if (overrideDueDate == 'T') // if override checkbox is ticked
					{
						// enable the due date field
						nlapiDisableField('duedate', false);
					}
			}	
	}

// =================================
// FUNCTION TO RECALCULATE DUE DATES
// =================================

function recalculateDates(entityID)
	{
		// lookup fields on the entity record
		var entityLookup 	= nlapiLookupField('entity', entityID, ['custentity_bbs_entity_payment_terms', 'custentity_bbs_entity_payment_term_days']);
		var paymentTerm 	= entityLookup.custentity_bbs_entity_payment_terms;
		var paymentDays		= entityLookup.custentity_bbs_entity_payment_term_days;
		
		// get the record type
		var recordType = nlapiGetRecordType();
		
		if (recordType == 'vendorbill') // if this is a vendor bill
			{
				// get the shipment date
				var calculationDate = nlapiGetFieldValue('custbody_bbs_shipment_date');
			}
		else if (recordType == 'invoice') // if this is an invoice
			{
				// get the transaction date
				var calculationDate = nlapiGetFieldValue('trandate');
			}
		
		// convert calculationDate to a date object
		calculationDate = nlapiStringToDate(calculationDate);
		
		// create a new date object and set to be the end of the calculation date's month
		var eomDate = new Date(calculationDate.getFullYear(), calculationDate.getMonth() + 1, 0);
		
		if (paymentTerm == 1) // if paymentTerm is 1 (Days)
			{
				// add the payment days to the calculation date
				calculationDate = nlapiAddDays(calculationDate, paymentDays);
				
				// convert calculationDate to a string and use to set the due date field
				nlapiSetFieldValue('duedate', nlapiDateToString(calculationDate));
			}
		else if (paymentTerm == 2) // if paymentTerm is 2 (EOM)
			{
				// add the payment days to the end of month date
				eomDate = nlapiAddDays(eomDate, paymentDays);
				
				// convert eomDate to a string and use to set the due date field
				nlapiSetFieldValue('duedate', nlapiDateToString(eomDate));
			}
	}