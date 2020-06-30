/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/format', 'N/render'],
/**
 * @param {record} record
 * @param {search} search
 */
function(ui, search, record, format, render) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	var request = context.request;
		
		if (context.request.method === 'GET')
			{
				
				// declare variables
		    	var transaction;
		    	var soNumber;
		    	var assemblyItem;
		    	var assemblyBelongsTo;
		    	var qty;
		    	var shipDate;
		    	var plannedDate;
		    	var dateEntered;
		    	var productType;
		    	var glassSpec;
		    	var glassThickness;
		    	var stockProcessed;
		    	var line = 0;
			
		    	// retrieve parameters that have been passed to the Suitelet
				var printed = request.parameters.printed;
				
				log.debug({
					title: 'Printed',
					details: printed
				});
			
				// create form
				var form = ui.createForm({
	                title: 'Work Order Printing'
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 2721;
				
				// add checkbox field to the form
				var printedCheckbox = form.addField({
                    id: 'printed',
                    type: ui.FieldType.CHECKBOX,
                    label: 'Include Printed Work Orders'
                });
				
				// if statement to check if the printed variable returns true
				if (printed == 'true')
					{
						log.debug({
							title: 'Entered If statement',
							details: ''
						});
					
						// set the printedCheckbox field's value using the printed variable
						printedCheckbox.defaultValue = 'T';
					}
				
				// add sublist and sublist fields to the form
                var sublist = form.addSublist({
                	id: 'wosublist',
                	type: ui.SublistType.LIST,
                	label: 'Work Orders'
                });
                
                var printCheckbox = sublist.addField({
                	id: 'print',
                	type: ui.FieldType.CHECKBOX,
                	label: 'Print'
                });
               
                var internalID = sublist.addField({
                	id: 'internalid',
                	type: ui.FieldType.FLOAT,
                	label: 'Internal ID'
                });
                
                // set the field to be hidden
                internalID.updateDisplayType({
                	displayType: ui.FieldDisplayType.HIDDEN
                });

                sublist.addField({
                	id: 'tranid',
                	type: ui.FieldType.TEXT,
                	label: 'Work Order'
                });
                
                sublist.addField({
                	id: 'sonumber',
                	type: ui.FieldType.TEXT,
                	label: 'SO Number'
                });
                
                sublist.addField({
                	id: 'assembly',
                	type: ui.FieldType.TEXT,
                	label: 'Assembly'
                });
                
                sublist.addField({
                	id: 'assemblybelongsto',
                	type: ui.FieldType.TEXT,
                	label: 'Assembly Belongs To'
                });
                
                sublist.addField({
                	id: 'quantity',
                	type: ui.FieldType.INTEGER,
                	label: 'Qty Required'
                });
                
                sublist.addField({
                	id: 'shipdate',
                	type: ui.FieldType.DATE,
                	label: 'Ship Date'
                });
                
                sublist.addField({
                	id: 'planneddate',
                	type: ui.FieldType.DATE,
                	label: 'Planned Date'
                });
                
                sublist.addField({
                	id: 'dateentered',
                	type: ui.FieldType.DATE,
                	label: 'Date Entered'
                });
                
                sublist.addField({
                	id: 'producttype',
                	type: ui.FieldType.TEXT,
                	label: 'Product Type'
                });
                
                sublist.addField({
                	id: 'glassspec',
                	type: ui.FieldType.TEXT,
                	label: 'Glass Spec'
                });
                
                sublist.addField({
                	id: 'thickness',
                	type: ui.FieldType.TEXT,
                	label: 'Thickness'
                });
                
                sublist.addField({
                	id: 'stockprocessed',
                	type: ui.FieldType.TEXT,
                	label: 'Stock/Processed'
                });
                
                // if the printed checkbox is ticked
                if (printed == 'true')
                	{
		                // run search to find records to populate sublist
		                var woSearch = search.create({
		                	type: search.Type.WORK_ORDER,
		                	
		                	columns: [{
		                		name: 'internalid'
		                	},
		                			{
		                		name: 'tranid'
		                	},
		                			{
		                		name: 'createdfrom'
		                	},
		                			{
		                		name: 'item'
		                	},
		                			{
		                		name: 'custitem_bbs_item_belongs_to',
		                		join: 'item'
		                	},
		                			{
		                		name: 'quantity'
		                	},
		                			{
		                		name: 'shipdate',
		                		join: 'createdfrom'
		                	},
		                			{
		                		name: 'trandate'
		                	},
		                			{
		                		name: 'custitem_bbs_item_product_type',
		                		join: 'item'
		                	},
		            				{
		                		name: 'custitem_bbs_item_material',
		                		join: 'item'
		                	},
		            				{
		                		name: 'custitem_bbs_item_thickness',
		                		join: 'item'
		                	},
		            				{
		                		name: 'custitem_bbs_item_stocked',
		                		join: 'item'
		                	}],
		                	
		                	filters: [{
		                		name: 'mainline',
		                		operator: 'is',
		                		values: 'T'
		                	},
		                			{
		                		name: 'custbody_bbs_wo_printed',
		                		operator: 'any',
		                		values: []
		                	},
		                			{
		                		name: 'status',
		                		operator: 'noneof',
		                		values: 'WorkOrd:G' // Work Order:Built
		                	},
		                			{
		                		name: 'buildable',
		                		operator: 'greaterthan',
		                		values: ['0']
		                	}],
		                });
                	}
                else // printed checkbox is not ticked
                	{
		                // run search to find records to populate sublist
		                var woSearch = search.create({
		                	type: search.Type.WORK_ORDER,
		                	
		                	columns: [{
		                		name: 'internalid'
		                	},
		                			{
		                		name: 'tranid'
		                	},
		                			{
		                		name: 'createdfrom'
		                	},
		                			{
		                		name: 'item'
		                	},
		                			{
		                		name: 'custitem_bbs_item_belongs_to',
		                		join: 'item'
		                	},
		                			{
		                		name: 'quantity'
		                	},
		                			{
		                		name: 'shipdate',
		                		join: 'createdfrom'
		                	},
		                			{
		                		name: 'trandate'
		                	},
		                			{
		                		name: 'custitem_bbs_item_product_type',
		                		join: 'item'
		                	},
		            				{
		                		name: 'custitem_bbs_item_material',
		                		join: 'item'
		                	},
		            				{
		                		name: 'custitem_bbs_item_thickness',
		                		join: 'item'
		                	},
		            				{
		                		name: 'custitem_bbs_item_stocked',
		                		join: 'item'
		                	}],
		                	
		                	filters: [{
		                		name: 'mainline',
		                		operator: 'is',
		                		values: 'T'
		                	},
		                			{
		                		name: 'custbody_bbs_wo_printed',
		                		operator: 'is',
		                		values: ['F']
		                	},
		                			{
		                		name: 'status',
		                		operator: 'noneof',
		                		values: 'WorkOrd:G' // Work Order:Built
		                	},
		                			{
		                		name: 'buildable',
		                		operator: 'greaterthan',
		                		values: ['0']
		                	}],
		                });       		
                	}
                
                // process search results
                woSearch.run().each(function(result) {
                	
                	// retrieve values from the search
                	transaction = result.getValue({
                		name: 'tranid'
                	});

    		    	soNumber = result.getText({
                		name: 'createdfrom'
                	});

    		    	assemblyItem = result.getText({
                		name: 'item'
                	});

    		    	assemblyBelongsTo = result.getText({
                		name: 'custitem_bbs_item_belongs_to',
                		join: 'item'
                	});

    		    	qty = result.getValue({
                		name: 'quantity'
                	});
    		    	
    		    	dateEntered = result.getValue({
    		    		name: 'trandate'
    		    	});
    		    	
    		    	shipDate = result.getValue({
    		    		name: 'shipdate',
    		    		join: 'createdfrom'
    		    	});
    		    	
    		    	// format dateEntered so it can be used to set sublist field
    		    	dateEntered = new Date(dateEntered);
    		    	dateEntered = format.format({
		 				value: dateEntered,
		 				type: format.Type.DATE
		 			});
    		    	
    		    	productType = result.getText({
                		name: 'custitem_bbs_item_product_type',
                		join: 'item'
                	});

    		    	glassSpec = result.getText({
                		name: 'custitem_bbs_item_material',
                		join: 'item'
                	});
    		    	
    		    	glassThickness = result.getText({
                		name: 'custitem_bbs_item_thickness',
                		join: 'item'
                	});
    		    	
    		    	stockProcessed = result.getText({
                		name: 'custitem_bbs_item_stocked',
                		join: 'item'
                	});
                	
                	// set sublist fields on the new line
                	sublist.setSublistValue({
                		id: 'tranid',
                		value: transaction,
                		line: line
                	});
                	
                	// check if the soNumber variable returns a value
                	if (soNumber)
                		{
		                	sublist.setSublistValue({
		                		id: 'sonumber',
		                		value: soNumber,
		                		line: line
		                	});
                		}
                	
                	sublist.setSublistValue({
                		id: 'assembly',
                		value: assemblyItem,
                		line: line
                	});
                	
                	// check if the assemblyBelongsTo variable returns a value
                	if (assemblyBelongsTo)
                		{
	                		sublist.setSublistValue({
	                		id: 'assemblybelongsto',
	                		value: assemblyBelongsTo,
	                		line: line
	                		});
                		}
                	
                	sublist.setSublistValue({
                		id: 'quantity',
                		value: qty,
                		line: line
                	});
                	
                	// check if the shipDate variable returns a value
                	if (shipDate)
                		{
	                		// format shipDate so it can be used to set sublist field
		    		    	shipDate = new Date(shipDate);
		    		    	shipDate = format.format({
				 				value: shipDate,
				 				type: format.Type.DATE
				 			});

		                	sublist.setSublistValue({
		                		id: 'shipdate',
		                		value: shipDate,
		                		line: line
		                	});
                		}
                	
                	sublist.setSublistValue({
                		id: 'dateentered',
                		value: dateEntered,
                		line: line
                	});
                	
                	// check if the productType variable returns a value
                	if (productType)
                		{
		                	sublist.setSublistValue({
		                		id: 'producttype',
		                		value: productType,
		                		line: line
		                	});
                		}
                		
                	// check if the glassSpec variable returns a value
                    if (glassSpec)
                    	{
		                	sublist.setSublistValue({
		                		id: 'glassspec',
		                		value: glassSpec,
		                		line: line
		                	});
                    	}
                    		
                    // check if the glassThickness variable returns a value
                    if (glassThickness)
                    	{
		                	sublist.setSublistValue({
		                		id: 'thickness',
		                		value: glassThickness,
		                		line: line
		                	});
                    	}
                	
                	// check if the stockProcessed variable returns a value
                	if (stockProcessed)
                		{
		                	sublist.setSublistValue({
		                		id: 'stockprocessed',
		                		value: stockProcessed,
		                		line: line
		                	});
                		}
                	
                	// increase line variable by 1
                	line++;
                	
                	// continue processing search results
                	return true;
                	
                });
                
                // add submit button to the form
   		 		form.addSubmitButton({
   		 			label: 'Submit'
   		 		});
   		 		
   		 		// add mark/unmark all buttons to the sublist
   		 		sublist.addMarkAllButtons();
   		 		sublist.addRefreshButton();
                
                context.response.writePage(form);
				
			}
		else if (context.request.method === 'POST')
			{
				//
				//=====================================================================
				// Start the xml off with the basic header info & the start of a pdfset
				//=====================================================================
				//
				var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdfset>";  // Main XML
				var xmlPt = ''; // Production Ticket XML
				
				//
				//=====================================================================
				// Produce the production ticket
				//=====================================================================
				//
				
				// initialize variables
				var firstTime = true;
				
				// get count of lines on the sublist
				var lineCount = request.getLineCount({
					group: 'wosublist'
				});

				// loop through line count
				for (var x = 0; x < lineCount; x++)
					{
						// get the value of the print checkbox field
						var toPrint = request.getSublistValue({
							group: 'wosublist',
							name: 'print',
							line: x
						});
						
						// check if the toPrint variable returns T
						if (toPrint == 'T')
							{
								//Header & style sheet
								//
								xmlPt += "<pdf>"
								xmlPt += "<head>";
								xmlPt += "<style type=\"text/css\">table {font-family: Calibri, Candara, Segoe, \"Segoe UI\", Optima, Arial, sans-serif;font-size: 9pt;table-layout: fixed;}";
								xmlPt += "th {font-weight: bold;font-size: 8pt;padding: 0px;border-bottom: 1px solid black;border-collapse: collapse;}";
								xmlPt += "td {padding: 0px;vertical-align: top;font-size:10px;}";
								xmlPt += "b {font-weight: bold;color: #333333;}";
								xmlPt += "table.header td {padding: 0px;font-size: 10pt;}";
								xmlPt += "table.footer td {padding: 0;font-size: 10pt;}";
								xmlPt += "table.itemtable th {padding-bottom: 0px;padding-top: 0px;}";
								xmlPt += "table.body td {padding-top: 0px;}";
								xmlPt += "table.total {page-break-inside: avoid;}";
								xmlPt += "table.message{border: 1px solid #dddddd;}";
								xmlPt += "tr.totalrow {line-height: 300%;}";
								xmlPt += "tr.messagerow{font-size: 6pt;}";
								xmlPt += "td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}";
								xmlPt += "td.addressheader {font-size: 10pt;padding-top: 0px;padding-bottom: 0px;}";
								xmlPt += "td.address {padding-top: 0;font-size: 10pt;}";
								xmlPt += "td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}";
								xmlPt += "td.totalcell {border: 1px solid black;border-collapse: collapse;}";
								xmlPt += "td.message{font-size: 8pt;}";
								xmlPt += "td.totalboxbot {background-color: #e3e3e3;font-weight: bold;}";
								xmlPt += "span.title {font-size: 28pt;}";
								xmlPt += "span.number {font-size: 16pt;}";
								xmlPt += "span.itemname {font-weight: bold;line-height: 150%;}";
								xmlPt += "hr {width: 100%;color: #d3d3d3;background-color: #d3d3d3;height: 1px;}";
								xmlPt += "</style>";
	
						        //Macros
						        //
								xmlPt += "<macrolist>";
								xmlPt += "<macro id=\"nlfooter\">";	
								
								xmlPt += "<table style=\"width: 100%; border: 1px solid black; \">";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Production Details</b></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Order Qty:</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">Employee Name:</td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Produced Qty:</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
								xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">Clock Card No:</td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"6\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Wastage:</b></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr style=\"line-height: 300%;\">";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Seeds</td>";
								xmlPt += "<td colspan=\"3\" rowspan=\"5\" align=\"left\" style=\"font-size:12px;\">Other Details:</td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr style=\"line-height: 300%;\">";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Scratches</td>";
								//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr style=\"line-height: 300%;\">";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Stains</td>";
								//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr style=\"line-height: 300%;\">";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Breakages</td>";
								//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr style=\"line-height: 300%;\">";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; margin: 2px 20px 2px 5px; border: 1px solid black;\">&nbsp;</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px;\">Poor Process Quality</td>";
								//xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
								xmlPt += "</tr>";
								xmlPt += "</table>";
	
								xmlPt += "<table class=\"footer\" style=\"width: 100%;\">";
								xmlPt += "<tr><td align=\"left\" style=\"font-size:6px;\">Printed: " "</td><td align=\"right\" style=\"font-size:6px;\">Page <pagenumber/> of <totalpages/></td></tr>";
								xmlPt += "</table>";
								
								xmlPt += "</macro>";
								xmlPt += "</macrolist>";
								xmlPt += "</head>";
								
								//Body
								//
								xmlPt += "<body footer=\"nlfooter\" footer-height=\"240px\" padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
								
								xmlPt += "<table style=\"width: 100%;\">";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"6\" align=\"center\" style=\"font-size:20px; padding-bottom: 20px;\"><b>Production Ticket</b></td>";
								xmlPt += "</tr>";
								
								xmlPt += "</table>";
								
								xmlPt += "<table style=\"width: 100%; border: 1px solid black; \">";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\"><b>Order Details</b></td>";
								xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">&nbsp;</td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Sales Order</td>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "<td colspan=\"3\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "</tr>";
								
								//xmlPt += "<tr>";
								//xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Customer</td>";
								//xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">" + nlapiEscapeXML(woEntity) + "</td>";
								//xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Works Order</td>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\">Production Batch</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Product</td>";
								xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Description</td>";
								xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Requested<br/>Delivery Date</td>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/></td>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/>Planned Date</td>";
								xmlPt += "<td colspan=\"2\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Order Qty</td>";
								xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Scrap Allowance</td>";
								xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"><br/></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Customer Part No.</td>";
								xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-bottom: 5px;\"></td>";
								xmlPt += "</tr>";
								
								xmlPt += "<tr>";
								xmlPt += "<td colspan=\"1\" align=\"left\" style=\"font-size:12px; padding-left: 5px; padding-bottom: 5px;\">Order Notes</td>";
								xmlPt += "<td colspan=\"5\" align=\"left\" style=\"font-size:12px; padding-right: 5px; padding-bottom: 5px;\"></td>";
								xmlPt += "</tr>";
	
								xmlPt += "</table>";
								
								xmlPt += "<p/>";
								
								xmlPt += "<table class=\"itemtable\" style=\"width: 100%; page-break-inside: avoid;\">";
								xmlPt += "<thead >";
								xmlPt += "<tr >";
								xmlPt += "<th align=\"left\" colspan=\"16\"><br/>Operation</th>";
	                          	xmlPt += "<th align=\"right\" colspan=\"2\">Time</th>";
								xmlPt += "<th align=\"right\" colspan=\"2\">Units</th>";
	                          
								xmlPt += "</tr>";
								xmlPt += "</thead>";
								xmlPt += "</table>";
							}
						
						// finish the body
						xmlPt += "</body>";
						
						// finish the pdf
						xmlPt += "</pdf>";

						xmlPt = '';

					}
				
				// finish the pdfset
				xml += "</pdfset>";
				
				//
				//=====================================================================
				// End of pdf generation
				//=====================================================================
				//
				
				//Convert to pdf using the BFO library
				//
				var pdfFileObject = nlapiXMLToPDF(xml);
				
				// render as XML string
		    	var xml = renderer.renderAsString();
		    	xml = xml.replace(/&(?!amp;)/g, '&amp;');
		    	
		    	// render output file as PDF
		    	response.renderPdf({ xmlString: xml });		
			
			}	

    }

    return {
        onRequest: onRequest
    };
    
});
