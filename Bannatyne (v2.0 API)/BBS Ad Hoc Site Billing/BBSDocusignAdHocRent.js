/*
*  This script will only include files with 'Rent deposit deed' in the DocuSign Envelope
*/
function customSendMain() {
	
	var searches = [{ 
		keyword: 'Rent deposit deed',
		type: 'phrase'
	}];
	
	var recipients = docusignGetRecipients(docusignContext);
	var files = docusignGetFiles(docusignContext, searches);
	return docusignPopulateEnvelope(docusignContext, recipients, files);
}