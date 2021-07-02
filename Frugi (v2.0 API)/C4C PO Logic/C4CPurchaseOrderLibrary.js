/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/file', 'N/runtime', 'N/render', 'N/email'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, file, runtime, render, email)  {
	
	function generateCSV(recordID) {
		
		// declare and initialize variables
		var csvFile = null;
		
		// lookup fields on the purchase order
		var poLookup = search.lookupFields({
			type: search.Type.PURCHASE_ORDER,
			id: recordID,
			columns: ['tranid', 'otherrefnum']
		});
		
		// start off the CSV
		var CSV = '"New Purchase Order",' + poLookup.tranid + '\r\n';
			CSV += '"Original Purchase Order",' + poLookup.otherrefnum + '\r\n';
			CSV += '\r\n';
			CSV += '"Supplier Code","Product No","Commodity Code","Description","Barcode","Qty","Unit Price","Total Value"\r\n';
			
		// run search to find PO lines to be included in the CSV file
		search.create({
			type: search.Type.PURCHASE_ORDER,
			
			filters: [{
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: [recordID]
			},
					{
				name: 'mainline',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'cogs',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'shipping',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'taxline',
				operator: search.Operator.IS,
				values: ['F']
			}],
			
			columns: [{
				name: 'parent',
				join: 'item',
				summary: search.Summary.GROUP
			},
					{
				name: 'formulatext',
				formula: "SUBSTR({item}, INSTR({item},':', -1) + 1)",
				summary: search.Summary.GROUP
			},
					{
				name: 'custitem_commodity_code',
				join: 'item',
				summary: search.Summary.MAX
			},
					{
				name: 'purchasedescription',
				join: 'item',
				summary: search.Summary.MAX
			},
					{
				name: 'upccode',
				join: 'item',
				summary: search.Summary.MAX
			},
					/*{
				name: 'formulatext',
				//formula: "CASE WHEN {class} = 'B2B' THEN 'Trade' ELSE CASE WHEN {class} = 'B2C' THEN 'Cons.' END END",
				formula: "CASE {class} WHEN 'B2B' THEN 'Trade' WHEN 'B2C' THEN 'Cons.' ELSE {class} END",
				summary: search.Summary.GROUP
			},*/
					{
				name: 'quantity',
				summary: search.Summary.SUM
			},
					{
				name: 'fxrate',
				summary: search.Summary.GROUP
			},
					{
				name: 'formulacurrency',
				formula: "{quantity} * {fxrate}",
				summary: search.Summary.SUM
			}],
			
		}).run().each(function(result){
			
			// retrieve search results. Using column numbers to return results of multiple formula fields
			var supplierCode	= result.getText(result.columns[0]);
			var productNo		= result.getValue(result.columns[1]);
			var commodityCode	= result.getValue(result.columns[2]);
			var description		= result.getValue(result.columns[3]);
		//		description		= description.replace(/,/g, ""); // strip commas from the description
			var barcode			= result.getValue(result.columns[4]);
		//	var class			= result.getValue(result.columns[5]);
			var quantity		= result.getValue(result.columns[5]);
		//		quantity		= class + ' ' + quantity;
			var unitPrice		= result.getValue(result.columns[6]);
			var totalValue		= result.getValue(result.columns[7]);
			
			// add to the CSV
			CSV += '"' + supplierCode + '","' + productNo + '","' + commodityCode + '","' + description + '","' + barcode + '","' + quantity + '","' + unitPrice + '","' + totalValue + '"';
			CSV += '\r\n';
			
			// continue processing search results
			return true
		
		});
			
		try
			{
				// create the CSV file
				csvFile = file.create({
					fileType: file.Type.CSV,
					name: 'Purchase Order ' + recordID + '.csv',
					contents: CSV
				});
			}
		catch(e)
			{
				csvFile = null;
			
				log.error({
					title: 'Error Generating CSV for PO ' + recordID,
					details: e
				});
			}
		
		// return csvFile to main script function
		return csvFile;
		
	}
	
	function generatePDF(recordID) {
		
		// declare and initialize variables
		var pdfFile = null;
		
		try
			{
				// render the PDF of the purchase order
				pdfFile = render.transaction({
				    entityId: recordID,
				    printMode: render.PrintMode.PDF
				});    
			}
		catch(e)
			{
				pdfFile = null;
				
				log.error({
					title: 'Error Rendering PDF for PO ' + recordID,
					details: e.message
				});
			}
		
		// return pdfFile to main script function
		return pdfFile;
		
	}
	
	function sendEmail(recordID, supplierID, emailAttachments) {
		
		// retrieve script parameters
		var currentScript = runtime.getCurrentScript();
		
		var emailSender = currentScript.getParameter({
			name: 'custscript_bbs_po_email_sender'
		});
				
		var emailTemplate = currentScript.getParameter({
			name: 'custscript_bbs_po_email_template'
		});
			
		try
			{
				// get the email template contents
				var mergeResult = render.mergeEmail({
					templateId: emailTemplate,
					transactionId: recordID
				});
						
				// send the email
				email.send({
					author: emailSender,
					recipients: supplierID,
					subject: mergeResult.subject,
					body: mergeResult.body,
					attachments: emailAttachments,
					relatedRecords: {
						transactionId: recordID
					}
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Sending Email',
					details: e
				});
			}
		
	}
    
    
    return {
    	generateCSV: 	generateCSV,
    	generatePDF:	generatePDF,
    	sendEmail: 		sendEmail
    };
    
});
