/*
*  This script will only include files with 'Ad hoc contract' in the DocuSign Envelope
*/
function customSendMain() {
	
	var searches = [{ 
			keyword: 'Ad hoc contract',
			type: 'phrase'
		},
				{ 
			keyword: 'Rent Rental License',
			type: 'phrase'
		},
				{ 
			keyword: 'PT agreement',
			type: 'phrase'
		}];
	
	var recipients = docusignGetRecipients(docusignContext);
	var files = docusignGetFiles(docusignContext, searches);
	return docusignPopulateEnvelope(docusignContext, recipients, files);
}