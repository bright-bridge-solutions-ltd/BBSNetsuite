/*************************************************************************************
 * Name:		Pallet Label PDF For Purchase Order  (poPalletLabelPDF.js)
 * 
 * Author:		FHL 
 * 
 * Script Type:	Suitelet
 *
 * Version:		1.0.0 - 27/08/2013 - First release - SA
 * 				1.0.1 - 28/08/2013 - added duedate for delivery date - SA
 * 				1.0.2 - 07/10/2013 - fixed a bug with line description internal id. replaced "itemdescription" with "description" - SA
 * 				1.0.4 - 05/03/2014 - fixed a bug when there is an "&" in the item name LE
 * 				1.0.5 - 13/10/2016 - Fixed a bug when PDF doesn't get created if there is an "&" in the supplier code for case S11958 - DM
 * 				1.0.6 - 17/10/2016 - Resolved issue with empty table and parsing '&' - CW
 *				1.1.0 - 01/12/2016 - Fixed crashing labels and added the preferred bin number to the label if available - DW
 *				1.1.1 - 03/02/2017 - Added Preferred Location to print out - AT
 *				1.1.2 - 30/05/2018 - S17297 Fixed pagination logic for 2018.1
 *										Moved lower label down to fit - SB
 * 
 * Author:		Fowlers Consulting Services Ltd
 *
 * Version:		2.0.0 - 28/01/2019 - Remove Supplier Ref, Remove Location, Remove Bin Number, Move Transaction ID below barcode, Remove Delivery Date, Enlarge SKU and Product Name, enlarge the barcode
 * 				2.0.1 - 30/01/2019 - Add Supplier code and Supplier to label.
 * 				2.0.2 - 26/09/2019 - Added if statement to only replace instances of "&" when variables return a value. SB (BrightBridge Solutions)
 * 
 * Purpose:		create pallet label PDF from purchase order
 * 
 * Script: 		customscript_popalletlabelpdf    
 * Deploy: 		customdeploy_popalletlabelpdf
 * 
 * Notes:		
 * 
 * Library: 	library.js
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

var endOfPage = 0;
//
/**************************************
* render PDF
**************************************/

function renderPDF(request, response)
{
	try
	{		
		initialise();
		loadRecord();
		setPDFHeader();
		setPDFDetail(request, response);//1.0.6
	}
	catch(e)
	{
		error = "<html><body>Error Rendering PDF: " + e.message + "</body</html>";
		response.write(error);
		errorHandler('renderPDF',e);
	}
}

/**************************************
*initialise
*
**************************************/

function initialise()
{

	try
	{
		//get record parameters
		id = request.getParameter("id");

	}
	catch(e)
	{
		errorHandler('initialise',e);
	}
}

/**************************************
*loadRecord
*
***************************************/

function loadRecord()
{

	try
	{
		//load the record
		record = nlapiLoadRecord('purchaseorder', id, null);
	}
	catch(e)
	{
		errorHandler('loadRecord',e);
	}
}
/**************************************
*setPDFHeader
*1.0.1 - 28/08/2013	- added duedate for delivery date - SA 
*1.1.1 - 03/02/2017	- Added Preferred Location to print out - AT
*1.1.2 Moved lower label down to fit
***************************************/
function setPDFHeader()
{

	try
	{
		//get information from the record
		// 1.0.1 added duedate for delivery date - SA
		deliveryDate = record.getFieldValue("duedate") || "";
		tranID = record.getFieldValue("tranid");	
		supplierRefNo = record.getFieldValue("otherrefnum") || "";
		
	
		//pdf head info...
		pdf= '<?xml version="1.0"?>';
		pdf += '<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
		pdf += '<pdf><head><meta name="title" value="Despatch Note"/><style type="text/css">';
		pdf += 'body{padding: 0.5cm 0.79cm 0.28cm 0.74cm;}'; // 1.1.2 'margin' cannot be used on body tag
		pdf += '.location{font-size:1.0em;text-align:center;font-family:sans-serif;}'; //1.1.1 - 03/02/2017	- Added Preferred Location to print out - AT
		pdf += '.itemCode{background:#000000;color:#FFFFFF;font-size:2.2em;text-align:center;font-family:sans-serif;}';
		pdf += '.itemDesc{font-size: 1.2em;text-align:center;font-family:sans-serif;}';
		pdf += '.supplierCode{font-size:1.0em;text-align:center;font-family:sans-serif;}';
		pdf += '.deliveryDate{font-size:0.9em;text-align:center;font-family:sans-serif;}';
		pdf += '.spacer{font-size:3.2em;text-align:center;font-family:sans-serif;height: 3.75cm;}'; // 1.1.2
		pdf += '.barCode{font-size:2.5em;text-align:center;font-family:sans-serif;margin-top:1em}';
		pdf += '.supplierRef{font-size:1.1em;text-align:center;font-family:sans-serif;}</style></head><body size="A4">';
		
	}
	catch(e)
	{
		errorHandler('setPDFHeader',e);
	}
}


/**************************************
*set PDF details
*1.0.2 - 07/10/2013	- fixed a bug with line description internal id. replaced "itemdescription" with "description" - SA
*1.0.5 - Fixed a bug when PDF doesn't get created if there is an "&" in the supplier code for case S11958 - DM
*1.1.0 - Fixed crashing labels and added the preferred bin number to the label if available - DW
*1.1.1 - 03/02/2017	- Added Preferred Location to print out - AT
*1.1.2 Fixed pagination logic for 2018.1
**************************************/
/**
 * @param {object} request - suitelet request
 * @param {object} response - suitelet response
 */
function setPDFDetail(request, response)
{	
	var totalPallets = null; //1.0.6
	var itemRecord = null;
	var itemInternalID = null;
	var binNumber = null;
	var location = '';//1.1.1 - 03/02/2017	- Added Preferred Location to print out - AT
	var firstPage = true; // 1.1.2
	
	try
	{
		lineCount = record.getLineItemCount("item");

		//...pdf content...
		for(var i = 1; i <= lineCount; i++)
		{
			//get the internal id of the item, then look up it name from the record
			itemInternalID = record.getLineItemValue("item", "item" , i);
			itemRecord = nlapiLoadRecord('inventoryitem', itemInternalID);
			
			itemCode = itemRecord.getFieldValue('itemid');
			
			// check if the itemCode variable returns a value
			if (itemCode)
				{
					itemCode = itemCode.replace("&", "&amp;"); // need to escape any instances of "&" to avoid XML parse errors
				}
			
			//1.1.0
			binNumber = findPerferredBin(itemRecord);
			
			//1.0.2 - fixed a bug with line description internal id. replaced "itemdescription" with "description" - SA
			itemDesc = record.getLineItemValue("item", "description", i);
			
			// check if the itemDesc variable returns a value
			if (itemDesc)
				{
					itemDesc = itemDesc.replace("&", "&amp;"); // need to escape any instances of "&" to avoid XML parse errors
				}

			supplierCode = record.getLineItemValue("item", "custcol_suppliernamecodes" , i) || "";
			
			// check if the supplierCode variable returns a value
			if (supplierCode)
				{
					supplierCode = supplierCode.replace("&", "&amp;"); // need to escape any instances of "&" to avoid XML parse errors
				}
						
			palletsRequired = record.getLineItemValue("item", "custcol_noofpalletlabels" , i) || 0;//1.0.6
			totalPallets += palletsRequired;//1.0.6
			
			location = record.getFieldText('location');//1.1.1 - 03/02/2017	- Added Preferred Location to print out - AT

			//print number of copies, determined by "custcol_noofpalletlabels"
			for(var p = 1; p <= palletsRequired; p++)
			{
				// 1.1.2 Stop blank page at end of document by only using page break when we know we have labels
				// If this is the first label on a page other than page 1...
				if (!firstPage && endOfPage == 0)
				{
					// Use page break
					pdf += '<pbr />';
				}

				firstPage = false;

				pdf += '<table align="center" style="width: 100%; padding-top: 1cm;">'; // 1.1.2
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="itemCode">' + String(itemCode) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px; padding-top: 8px;">&nbsp;</td><td align="center" style="padding-top: 8px;" class="itemDesc">' + String(itemDesc) + '</td><td style="width: 25px; padding-top: 8px;">&nbsp;</td></tr>';
				pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="supplierCode">Supplier Code: ' + String(supplierCode) + '</td><td style="width: 25px;">&nbsp;</td></tr>';
               
			

				if (String(itemDesc).length > 74) //1.1.2
				{
					pdf += '<tr><td style="width: 25px;">&nbsp;</td><td align="center" class="barCode"><barcode codetype="code128"  width="100%"  showtext="false" value="' + itemCode + '" /></td><td style="width: 25px;">&nbsp;</td></tr>';
				}
				else //1.1.2
				{
					pdf += '<tr style="margin-top:1em"><td style="width: 25px;">&nbsp;</td><td align="center" class="barCode"><barcode codetype="code128"  width="100%"  showtext="false" value="' + itemCode + '" /></td><td style="width: 25px;">&nbsp;</td></tr>';
				}
              	pdf += '<tr><td style="width: 25px; padding-top: 8px;">&nbsp;</td><td style="padding-top: 8px;"><table width="100%"><tr><td class="supplierRef">Supplier Ref: ' + String(supplierRefNo) + '</td><td align="right" class="supplierRef">Transaction ID: ' + String(tranID) + '</td></tr></table></td><td style="width: 25px; padding-top: 8px;">&nbsp;</td></tr>';
				
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
		
		if(totalPallets == 0)//1.0.6
		{
			pdf += "You do not appear to need any pallet lables. Check the PALLET LABELS REQUIRED column.";
		};
		
		//...closing pdf elements
		pdf += "</body></pdf>";
		
		//writing the pdf
		finalPDF = nlapiXMLToPDF(pdf);
		response.setContentType('PDF','PalletNote.pdf', 'inline');
		response.write(finalPDF);//1.0.6
	}
	catch(e)
	{
		errorHandler('setPDFDetail',e);
	}
}

/**
 * Finds the preferred bin for this item
 * 
 * @since 1.1.0
 * @param {nlobjRecord} record
 * @return {String} binNumber
 */
function findPerferredBin(record)
{
	var binCount = null;
	var preferred = null;
	var binId = null;
	var binNumber = '';
	
	try
	{
		binCount = record.getLineItemCount('binnumber');

		if (binCount > 0)
		{
			for (var i = 1; i < binCount+1; i++)
			{
				preferred = record.getLineItemValue('binnumber', 'preferredbin', i);

				if (preferred == 'T')
				{
					binId = record.getLineItemValue('binnumber', 'binnumber', i);
				}
			}
		}

		if (binId)
		{
			binNumber = nlapiLookupField('bin', binId, 'binnumber');
		}
	}
	catch (e)
	{
		errorHandler('findPreferredBin', e);
	}
	
	return binNumber;
}

