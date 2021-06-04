/*
*  This script will only include files with 'SECI Agreement' in the DocuSign Envelope
*/
function customSendMain() {
	
	var searches = [{ 
		keyword: 'SECI Agreement',
		type: 'phrase'
	}];
	
	var recipients = docusignGetRecipients(docusignContext);
	var files = docusignGetFiles(docusignContext, searches);
	return docusignPopulateEnvelope(docusignContext, recipients, files);
}