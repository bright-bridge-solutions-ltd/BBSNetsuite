function dummyRecipientsMain() {
	
	// get field values from the current record
	var name = nlapiGetFieldValue('name');
	var email = nlapiGetFieldValue('custrecord_bbs_ad_hoc_site_email');
	
	var dummyRecipients = [{ 
			id: 1,
         	order: 1,
            name: name,
            email: email
		}];
	
	var nsRecipients = docusignGetRecipients(docusignContext, 2, 2);
	var recipients = dummyRecipients.concat(nsRecipients);
	var files = docusignGetFiles(docusignContext);
	return docusignPopulateEnvelope(docusignContext, recipients, files);
}
