/*************************************************************************************
 * Name:		Pallet Label Suitelet (palletLabelPDFSuitelet.js)
 * Script Type:	Suitelet
 *
 * Version:		1.0.0 - 19/06/2013 - Initial - LE 
 * 				1.0.1 - added transaction id and barcode to each label
 * 				1.0.2 - Copied the code to SVN  -  SA
 * 				1.0.3 - 05/03/2014 - fixed a bug when there is an "&" in the item name -AT
 * 				1.1.0 - 04/12/2015 - Source supplierref from deliverynote field & added the itemBins - AT
 * 				1.1.1 - 20/01/2016 - Set itemBin as local variable - AT
 * 				1.1.2 - 13/10/2016 - Fixed a bug when there is an "&" in the supplier name codes - DM
 * 				1.1.3 - 17/10/2016 - Resolved issue with empty table and parsing '&' - CW
 * 				1.1.4 - 03/02/2017 - Added Preferred Location to print out - AT
 * 				1.1.5 - 08/02/2018 - Remove the spacing between text and the barcode if the item name
 * 									 takes up too many characters - JG
 * 				1.1.6 - 24/04/2018 - S17297 Fixed pagination logic - SB
 * 				1.1.7 - 08/05/2018 - S17297 Moved lower label down to fit - SB
 * 				1.1.8 - 25/09/2019 - Added if statement to check variables return a value before replacing '&' with '&amp;' - SB (BrightBridge Solutions)
 *
 * Author:		FHL 
 * 
 * Purpose:		create pallet label PDF from item receipt
 * 
 * Script: 		customscript_palletlabelpdf  
 * Deploy: 		customdeploy_palletlabelpdf
 * 
 * Notes:		Uses L7168-100 or compatible label template. 
 * 				https://www.avery.co.uk/product/parcel-labels-l7168-100
 * 				(119.6 x 143.5mm).
 * 
 * 
 * Library: 	Library.js
 *************************************************************************************/

var pdf = '';

var record = null;
var type = '';
var id = 0;
var tranID= 0;
var itemCode = '';
var itemDesc = '';
var supplierCode = '';
var supplierRefNo = '';
var deliveryDate = null;

var lineCount = 0;
var palletsRequired = 0;

var finalPDF = null;
var pdfName = '';

var error = '';

//**************************************
// render PDF
//**************************************

function renderPDF(request, response)
{
	try
	{		
		initialise();
		loadRecord();
		setPDFHeader();
		setPDFDetail(request, response);//1.1.3
	}
	catch(e)
	{
		error = "<html><body>Error Rendering PDF: " + e.message + "</body></html>";
		response.write(error);
		
		errorHandler('renderPDF',e);
	}
}

//**************************************
// initialise
//**************************************

function initialise()
{

	try
	{
		//get record parameters
		type = request.getParameter("type");
		id = request.getParameter("id");
	}
	catch(e)
	{
		errorHandler('initialise',e);
	}
}

//**************************************
//loadRecord
//**************************************

function loadRecord()
{

	try
	{
		//load the record
		record = nlapiLoadRecord(type, id, null);
	}
	catch(e)
	{
		errorHandler('loadRecord',e);
	}
}
//**************************************
//setPDFHeader
//1.1.4 - 03/02/2017	- Added Preferred Location to print out - AT
//**************************************

function setPDFHeader()
{

	try
	{
		//get information from the record
		deliveryDate = record.getFieldValue("trandate");
		supplierRefNo = record.getFieldValue("custbody_supplierdeliverynote"); // 1.1.0 - 04/12/2015 - Source supplierref from deliverynote field
		tranID = record.getFieldValue("tranid");
		
		//getSupplierRefNo(); // // 1.1.0 - 04/12/2015 - Source supplierref from deliverynote field
		
		//pdf head info...
		pdf= '<?xml version="1.0"?>';
		pdf += '<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
		pdf += '<pdf><head><meta name="title" value="Pallet Label"/><style type="text/css">';
		pdf += 'body{padding: 0.5cm 0.79cm 0.28cm 0.74cm;}'; // 1.1.7 'margin' cannot be used on body tag
		pdf += '.itemCode{background:#000000;color:#FFFFFF;font-size:1.8em;text-align:center;font-family:sans-serif;}';
		pdf += '.itemDesc{font-size: 1.0em;text-align:center;font-family:sans-serif;}';
		pdf += '.location{font-size:1.0em;text-align:center;font-family:sans-serif;}';//1.1.4 - 03/02/2017	- Added Preferred Location to print out - AT
		pdf += '.supplierCode{font-size:1.0em;text-align:center;font-family:sans-serif;}';
		pdf += '.deliveryDate{font-size:0.9em;text-align:center;font-family:sans-serif;}';
		pdf += '.spacer{font-size:3.2em;text-align:center;font-family:sans-serif;height: 3.75cm;}'; // 1.1.7
		pdf += '.barCode{font-size:2em;text-align:center;font-family:sans-serif}';
		pdf += '.supplierRef{font-size:1.1em;text-align:center;font-family:sans-serif;}</style></head><body size="A4">';
		
	}
	catch(e)
	{
		errorHandler('setPDFHeader',e);
	}
}


/**
set PDF details
1.1.0 - 04/12/2015 - Source supplierref from deliverynote field & added the itemBins
1.1.2 - 13/10/2016 -  Fixed a bug when there is an "&" in the supplier name codes - DM
1.1.4 - 03/02/2017	- Added Preferred Location to print out - AT
1.1.5 - 08/02/2018 - Resolved issue where an item code with too many characters would cause barcodes
     			     to break onto new pages - JG

*/


/**
 * setPDFDetail
 * @param {object} request - suitelet request
 * @param {object} response - suitelet response
 * 1.1.6 Fixed pagination issue
 * 1.1.7 Ensured fits to label template
 */
function setPDFDetail(request, response)
{	
	var endOfPage = 0;
	var itemBin = [];	//1.1.1 - 20/01/2016 - Set itemBin as local variable - AT
	var totalPallets = null; //1.1.3
	var location = ''; //1.1.4 - 03/02/2017	- Added Preferred Location to print out - AT
	var firstPage = true; // 1.1.6

	try
	{
		lineCount = record.getLineItemCount("item");
		
		//...pdf content...
		for(var i = 1; i <= lineCount; i++)
		{
			//get the internal id of the item, then look up it name from the record
			itemInternalID = record.getLineItemValue("item", "item" , i);
			itemCode = nlapiLookupField('inventoryitem', itemInternalID, 'itemid');
			
			// check the itemCode variable returns a value
			if (itemCode)
				{
					itemCode = itemCode.replace("&", "&amp;"); // need to escape any instances of "&" to avoid XML parse errors
				}
			
			itemDesc = record.getLineItemValue("item", "itemdescription" , i);
			
			// check the itemCode variable returns a value
			if (itemDesc)
				{
					itemDesc = itemCode.replace("&", "&amp;"); // need to escape any instances of "&" to avoid XML parse errors
				}
			
			supplierCode = record.getLineItemValue("item", "custcol_suppliernamecodes" , i) || "";
			
			// check the itemCode variable returns a value
			if (supplierCode)
				{
					supplierCode = itemCode.replace("&", "&amp;"); // need to escape any instances of "&" to avoid XML parse errors
				}
			
			palletsRequired = record.getLineItemValue("item", "custcol_noofpalletlabels" , i) || 0;
			totalPallets += palletsRequired;//1.1.3
			
			itemBin = getItemBins(i,itemBin); //1.1.0 - 04/12/2015 - Source supplierref from deliverynote field & added the itemBins
			
			location = record.getFieldText('location'); //1.1.4 - 03/02/2017	- Added Preferred Location to print out - AT

			//print number of copies, determined by "custcol_noofpalletlabels"
			for(var p = 1; p <= palletsRequired; p++)
			{
				// 1.1.6 Stop blank page at end of document by only using page break when we know we have labels
				// If this is the first label on a page other than page 1...
				if (!firstPage && endOfPage == 0)
				{
					// Use page break
					pdf += '<pbr />';
				}

				firstPage = false;

				pdf += '<table align="center" style="width: 100%; padding-top: 2.1cm;">'; // 1.1.7
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="itemCode">' + String(itemCode) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="itemDesc">' + String(itemDesc) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="location">Location: ' + String(location) + '</td><td style="width: 25px;">&nbsp;</td></tr>';//1.1.4 - 03/02/2017	- Added Preferred Location to print out - AT
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="supplierCode">Supplier Code: ' + String(supplierCode) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="deliveryDate">Delivery Date: ' + String(deliveryDate) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="supplierRef">Supplier Ref: ' + String(supplierRefNo) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="supplierRef">Transaction ID: ' + String(tranID) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="supplierRef">Item Bin: ' + String(itemBin) + '</td><td style="width: 25px;">&nbsp;</td></tr>';

//				nlapiLogExecution('debug', "num", String(itemDesc).length);
//				nlapiLogExecution('debug', "str", String(itemDesc));

				if (String(itemDesc).length > 74) //1.1.5
				{
					pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="barCode"><barcode codetype="code128" showtext="false" value="' + itemCode + '" /></td><td style="width: 25px;">&nbsp;</td></tr>';
				}
				else //1.1.5
				{
					pdf += '<tr style="margin-top:1em"><td style="width: 25px;">&nbsp;</td><td align="center" class="barCode"><barcode codetype="code128" showtext="false" value="' + itemCode + '" /></td><td style="width: 25px;">&nbsp;</td></tr>';
				}

				// 1.1.6 Changed IF statement logic so that no labels are split between pages
				nlapiLogExecution('DEBUG', 'endOfPage', endOfPage);
				nlapiLogExecution('DEBUG', 'p', p);
				nlapiLogExecution('DEBUG', 'palletsRequired', palletsRequired);
				nlapiLogExecution('DEBUG', 'i', i);
				nlapiLogExecution('DEBUG', 'lineCount', lineCount);

				//use the endOfPage to determine if this is is last item to fit on the page...
				if(endOfPage == 0) // Not end of pallet && not end of page
				{
					//this line creates a gap between the items on the page
					pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="spacer">&nbsp;</td><td style="width: 25px;">&nbsp;</td></tr></table>';
					
					//...if not, increment the flag
					endOfPage++;
				}
				else
				{
					pdf += '</table>';
					endOfPage = 0;
				}
			}
		}
		
		if(totalPallets == 0)//1.1.3
		{
			pdf += "You do not appear to need any pallet lables. Check the PALLET LABELS REQUIRED column.";
		};
		
		//...closing pdf elements
		pdf += "</body></pdf>";
		
		//writing the pdf		
		finalPDF = nlapiXMLToPDF(pdf);
		response.setContentType('PDF','PalletNote.pdf', 'inline');
		response.write(finalPDF);//1.1.3
	}
	catch(e)
	{
		errorHandler('setPDFDetail',e);
	}
}

/**
 * fetch all bins for this current lines item from the inventory detail subrecord
 * 1.1.0 - 04/12/2015 - Source supplierref from deliverynote field & added the itemBins
 * 1.1.1 - 20/01/2016 - Set itemBin as local variable - AT
 */
function getItemBins(i,itemBin)
{
	var subrecord = '';
	var subrecordLineCount = '';
	var itemBin = []; //1.1.1 - 20/01/2016 - Set itemBin as local variable - AT
	
	try
	{

		subrecord = record.viewLineItemSubrecord("item","inventorydetail",i);
		subrecordLineCount = subrecord.getLineItemCount('inventoryassignment'); 
			
		for(var j = 1; j <= subrecordLineCount ; j++)
			{
			itemBin.push(subrecord.getLineItemText("inventoryassignment", "binnumber",j));			
			}
		itemBin = itemBin.toString();
	}
	catch(e)
	{
		errorHandler("getItemBins", e);
	}
	
	return itemBin;
}

/**
 * look up the supplier ref number from the purchase order
 * 
 * as sometimes it is not present on the receipt
 */
function getSupplierRefNo()
{
	var createdFrom = 0;
	
	try
	{
		//get the id or the record that the receipt was created from
		createdFrom = record.getFieldValue("createdfrom");

		//use the id to look up the supplier ref no on the PO
		supplierRefNo = nlapiLookupField("purchaseorder", createdFrom, "otherrefnum") || "";
	}
	catch(e)
	{
		supplierRefNo = nlapiLookupField("transferorder", createdFrom, "otherrefnum");
	}
}


