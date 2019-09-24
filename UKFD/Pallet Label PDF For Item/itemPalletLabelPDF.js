/*************************************************************************************
 * Name:		Pallet Label PDF For Item (itemPalletLabelPDF.js)
 * 
 * Script Type:	Suitelet
 *
 * Version:		1.0.0 - 13/09/2013	- First release - AS
 *
 * Author:		FHL 
 * 
 * Purpose:		create pallet label PDF from Item record
 * 
 * Script: 		customscript_itempalletlabelpdf    
 * Deploy: 		customdeploy_itempalletlabelpdf
 * 
 * Notes:		24/09/2019	Sam Batten (BrightBridge Solutions) Added code to replace '&' symbol for item description to avoid XML parse errors
 * 
 * Library: 	library.js
 *************************************************************************************/

var pdf = '';

var record = null;
var type = '';
var id = 0;


var itemCode = '';
var itemDesc = '';
var supplierCode = '';


var finalPDF = null;
var pdfName = '';

var error = '';

var endOfPage = 0;

/**************************************
* render PDF
* 
**************************************/

function renderPDF(request, response)
{
	try
	{	
		initialise();
		getRequiredData();
		setPDFHeader();
		setPDFDetail();
	}
	catch(e)
	{
		error = "<html><body>Error Rendering PDF: " + e.message + "</body</html>";
		response.write(error);
		
		errorHandler('renderPDF',e);
	}
}

/**************************************
*initialise - initialise the static variables
*
**************************************/

function initialise()
{

	try
	{
		//get record parameters from the url passing from the 'poAddPalletButton' user event
		id = request.getParameter("id");

	}
	catch(e)
	{
		errorHandler('initialise',e);
	}
}


/**************************************
*getRequiredData - getting the item record's data 
*
***************************************/
function getRequiredData()
{	
	var noOfSuppliers = 0;
	var preferredVendor = 'F';
	
	try
	{
		//loading the record
		record = nlapiLoadRecord('inventoryitem', id, null);
	
		//get information from the record
		itemCode = record.getFieldValue('itemid');					//item code
		
		//if item code is null
		if(itemCode == null)
		{
			itemCode = '';
		}
		
		itemDesc = record.getFieldValue('salesdescription');		//item description
		
		//if item description is null
		if(itemDesc == null)
			{
				itemDesc = '';
			}
		else
			{
				// replace the '&' symbol in the item description with &amp to avoid XML parsing errors
				itemDesc = itemDesc.replace('&', '&amp;');
			}
	
		//getting the number of suppliers from 'suppliers' line item record
		noOfSuppliers = record.getLineItemCount('itemvendor');
		
		//looping through the 'suppliers' line item
		for(var i = 1; i <= noOfSuppliers; i++)
		{			
			//getting the value of the 'preferred vendor' column
			preferredVendor = record.getLineItemValue('itemvendor', 'preferredvendor', i);
			
			//if the supplier is the preferred vendor
			if(preferredVendor == 'T')
			{
				//getting the supplier code
				supplierCode = 	record.getLineItemValue('itemvendor', 'vendorcode', i);
			}

		}
	
		//if suplier code is null
		if(supplierCode == null)
		{
			supplierCode = '';
		}

	}
	catch(e)
	{
		errorHandler('getRequiredData',e);
	}
}


/**************************************
*setPDFHeader
*1.0.1 - 28/08/2013	- added duedate for delivery date - SA 
***************************************/
function setPDFHeader()
{

	try
	{
		//pdf head info...
		pdf= '<?xml version="1.0"?>';
		pdf += '<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
		pdf += '<pdf><head><meta name="title" value="Despatch Note"/><style type="text/css">';
		pdf += '.itemCode{background:#000000;color:#FFFFFF;font-size:1.8em;text-align:center;font-family:sans-serif;}';
		pdf += '.itemDesc{font-size: 1.0em;text-align:center;font-family:sans-serif;}';
		pdf += '.supplierCode{font-size:1.0em;text-align:center;font-family:sans-serif;}';
		pdf += '.deliveryDate{font-size:0.9em;text-align:center;font-family:sans-serif;}';
		pdf += '.spacer{font-size:3.2em;text-align:center;font-family:sans-serif;}';
		pdf += '.barCode{font-size:2em;text-align:center;font-family:sans-serif;margin-top:1em}';
		pdf += '.supplierRef{font-size:1.1em;text-align:center;font-family:sans-serif;}</style></head><body size = "A4">';
		
	}
	catch(e)
	{
		errorHandler('setPDFHeader',e);
	}
}


/**************************************
*set PDF details
*
**************************************/
function setPDFDetail()
{	
	try
	{
		pdf += '<table align="center" style="width: 100%;">';
		pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="itemCode">' + String(itemCode) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
		pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="itemDesc"> Description : ' + String(itemDesc) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
		pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="supplierCode">Supplier Code: ' + String(supplierCode) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
		pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="barCode"><barcode codetype="code128" showtext = "false" value="' + itemCode + '" /></td><td style="width: 25px;">&nbsp;</td></tr>';

		pdf += '</table>';
	
		//...closing pdf elements
		pdf += "</body></pdf>";

		//writing the pdf
		finalPDF = nlapiXMLToPDF(pdf);
		response.setContentType('PDF','PalletNote.pdf', 'inline');
		response.write(finalPDF.getValue());

	}
	catch(e)
	{
		errorHandler('setPDFDetail',e);
	}
}

