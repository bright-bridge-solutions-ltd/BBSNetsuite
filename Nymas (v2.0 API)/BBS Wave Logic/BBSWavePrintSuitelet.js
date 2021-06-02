/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/format', 'N/http','N/record', 'N/render', 'N/xml'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, format, http, record, render, xml) 
{
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context)   
	    {
	    	if (context.request.method === http.Method.GET) 
		    	{
	    		  
		    		//=============================================================================================
			    	//Main Code
			    	//=============================================================================================
			    	//
		    			
		    		//Get parameters
					//
	    			var waveId 		= context.request.parameters['wave'];
	    			
					if(waveId != null && waveId != '')
						{
							var picktaskSearchObj = getResults(search.create({
								   type: "picktask",
								   filters:
								   [
								      ["wavename","anyof",waveId], 
								   ],
								   columns:
								   [
								      search.createColumn({name: "wavename", label: "Wave #"}),
								      search.createColumn({name: "wavelinenumber", label: "Wave Line #"}),
								      search.createColumn({name: "releaseddate", label: "Released Date"}),
								      search.createColumn({name: "location", label: "Location"}),
								      search.createColumn({name: "name",sort: search.Sort.ASC,label: "Pick Task #"}),
								      search.createColumn({name: "picker", label: "Assigned Picker"}),
								      search.createColumn({name: "recommendedbin", label: "Recommended Bin"}),
								      search.createColumn({name: "item", label: "Item"}),
								      search.createColumn({name: "salesdescription",join: "item",label: "Description"}),
								      search.createColumn({name: "lineitemstatus", label: "Line Item Status"}),
								      search.createColumn({name: "lineitemremainingquantity", label: "Line Item Remaining Quantity"}),
								      search.createColumn({name: "customer", label: "Line Item Order Customer"}),
								      search.createColumn({name: "lineitemsubitemof", label: "Line Item Subitem of"}),
								      search.createColumn({name: "kititemorderlinenumber", label: "Kit Item Order Line #"}),
								      search.createColumn({name: "internalid",join: "transaction",label: "Internal ID"}),
								      search.createColumn({name: "tranid",join: "transaction",label: "Document Name"})
								   ]
								}));
							
							//Build a list of all parent items in the results
							//
							var parentItems = {};
							var parentDescs = {};
							
							if(picktaskSearchObj != null && picktaskSearchObj.length > 0)
								{
									for (var int = 0; int < picktaskSearchObj.length; int++) 
										{
											var parentItem	= picktaskSearchObj[int].getValue({name: "lineitemsubitemof"});
											
											parentItems[parentItem] = false;
										}
								
								}
							
							//Now see which ones of these parent items are DOC M types
							//
							var itemSearchObj = getResults(search.create({
								   type: "item",
								   filters:
								   [
								      ["custitem_bbs_is_doc_m_order_type","is","T"], 
								      "AND", 
								      ["internalid","anyof",Object.keys(parentItems)]
								   ],
								   columns:
								   [
								      search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Name"}),
								      search.createColumn({name: "salesdescription"})
								   ]
								}));
								
							//Update the parent items to show which ones are DOC M types
							//
							if(itemSearchObj != null && itemSearchObj.length > 0)
								{
									for (var int2 = 0; int2 < itemSearchObj.length; int2++) 
										{
											var itemId 		= itemSearchObj[int2].getValue({name: "internalid"});
											var itemDesc 	= itemSearchObj[int2].getValue({name: "salesdescription"});
											
											parentItems[itemId] = true;
											parentDescs[itemId] = itemDesc;
										}
								}
							
							
							
							//Main processing of results 
							//
							var outputObj = {};
							
							if(picktaskSearchObj != null && picktaskSearchObj.length > 0)
								{
									for (var int = 0; int < picktaskSearchObj.length; int++) 
										{
											var salesOrderId 		= picktaskSearchObj[int].getValue({name: "internalid",join: "transaction"});
											var salesOrderNumber 	= picktaskSearchObj[int].getValue({name: "tranid",join: "transaction"});
											var salesOrderLine		= picktaskSearchObj[int].getValue({name: "kititemorderlinenumber"});
											var parentItem			= picktaskSearchObj[int].getValue({name: "lineitemsubitemof"});
											var parentItemDesc		= picktaskSearchObj[int].getText({name: "lineitemsubitemof"});
											var waveNumber			= picktaskSearchObj[int].getText({name: "wavename"});
											var binNumber			= picktaskSearchObj[int].getText({name: "recommendedbin"});
											var component			= picktaskSearchObj[int].getText({name: "item"});
											var componentDesc		= picktaskSearchObj[int].getValue({name: "salesdescription",join: "item"});
											var componentQty		= Number(picktaskSearchObj[int].getValue({name: "lineitemremainingquantity"}));
											var salesCustomer		= picktaskSearchObj[int].getText({name: "customer"});
											var releasedDate		= picktaskSearchObj[int].getValue({name: "releaseddate"});
											var location			= picktaskSearchObj[int].getText({name: "location"});
											
											//Continue if parent item is a DOC M 
											//
											if(parentItems[parentItem])
												{
													var uniqueKey = padding_left(salesOrderId, '0', 8) + '|' + padding_left(salesOrderLine, '0', 8);
													
													if(!outputObj.hasOwnProperty(uniqueKey))
														{
															outputObj[uniqueKey] = new outputHeaderObj();
														}
													
													//Populate header info
													outputObj[uniqueKey].product 		= parentItemDesc;
													outputObj[uniqueKey].waveNumber 	= waveNumber;
													outputObj[uniqueKey].orderNumber	= salesOrderNumber;
													outputObj[uniqueKey].customer		= salesCustomer;
													outputObj[uniqueKey].releaseDate	= releasedDate;
													outputObj[uniqueKey].description	= parentDescs[parentItem];
													outputObj[uniqueKey].location		= location;
													
													outputObj[uniqueKey].lines.push(new outputDetailObj(binNumber, component, componentDesc, componentQty));
												}
										}
									
									//Build up the XML string
									//
									var xmlStr = '<?xmlStr version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
									xmlStr += '<pdfset>';
									
									for ( var uniqueKey in outputObj) 
										{
											xmlStr += '	<pdf>';
											xmlStr += '	<head>';
											xmlStr += '		<link name="Arial" type="font" subtype="truetype" src="${nsfont.Arial_Regular}" src-bold="${nsfont.Arial_Bold}" src-italic="${nsfont.Arial_Italic}" src-bolditalic="${nsfont.Arial_BoldItalic}" bytes="2" />';
											xmlStr += '		<macrolist>';
											xmlStr += '	    	<macro id="nlheader">';
											xmlStr += '	      		<table style="width: 100%; font-size: 10pt;">';
											xmlStr += '	      			<tr>';
											xmlStr += '	      				<td align="left" style="font-size: 16pt;"><b>Doc M Picking List</b></td>';
											xmlStr += '	      			</tr>';
											xmlStr += '	      		</table>';
											xmlStr += '';
											xmlStr += '';
											
											xmlStr += '	      		<table style="width: 100%; font-size: 10pt; margin-top: 10px;">';
											xmlStr += '	      			<tr>';
											xmlStr += '	      				<td align="left" ><b>Order Number</b></td>';
											xmlStr += '	      				<td align="left" >' + xml.escape({xmlText: outputObj[uniqueKey].orderNumber}) + '</td>';
											xmlStr += '                      	<td align="left" >&nbsp;</td>';
											xmlStr += '                      	<td align="right"><b>Release Date</b></td>';
											xmlStr += '	      				<td align="left" >' + outputObj[uniqueKey].releaseDate + '</td>';
											xmlStr += '	      			</tr>';
											
											xmlStr += '	      			<tr>';
											xmlStr += '	      				<td align="left" ><b>Customer</b></td>';
											xmlStr += '	      				<td align="left" colspan="2">' + xml.escape({xmlText: outputObj[uniqueKey].customer}) + '</td>';
											xmlStr += '                      	<td align="right"><b>Wave No</b></td>';
											xmlStr += '	      				<td align="left" >' + outputObj[uniqueKey].waveNumber + '</td>';
											xmlStr += '	      			</tr>';
											
											xmlStr += '	      			<tr>';
											xmlStr += '	      				<td align="left" ><b>Product</b></td>';
											xmlStr += '	      				<td align="left" colspan="5">' + xml.escape({xmlText: outputObj[uniqueKey].product}) + '</td>';
											xmlStr += '	      			</tr>';
											
											xmlStr += '	      			<tr>';
											xmlStr += '	      				<td align="left" ><b>Description</b></td>';
											xmlStr += '	      				<td align="left" colspan="5">' + xml.escape({xmlText: outputObj[uniqueKey].description}) + '</td>';
											xmlStr += '	      			</tr>';
											
											
											xmlStr += '	      		</table>';
											xmlStr += '	        	<hr/> <!-- Horizontal Line -->';
											
											xmlStr += '	        </macro>';
											xmlStr += '	        <macro id="nlfooter">';
											xmlStr += '	        	<hr/> <!-- Horizontal Line -->';
											xmlStr += '	        </macro>';
											xmlStr += '	   </macrolist>';
											xmlStr += '	    ';
											xmlStr += '	    <style type="text/css">';
											xmlStr += '	    	* {';
											xmlStr += '				font-family: Arial, sans-serif;';
											xmlStr += '			}';
											xmlStr += '			table {';
											xmlStr += '				font-size: 10pt;';
											xmlStr += '				table-layout: fixed;';
											xmlStr += '			}';
											xmlStr += '	        th {';
											xmlStr += '	            font-weight: bold;';
											xmlStr += '	            font-size: 10pt;';
											xmlStr += '	            vertical-align: middle;';
											xmlStr += '	            padding: 5px 6px 3px;';
											xmlStr += '	            color: #333333;';
											xmlStr += '	        }';
											xmlStr += '	        td {';
											xmlStr += '	            padding: 4px 6px;';
											xmlStr += '	        }';
											xmlStr += '	        td.bankdetails {';
											xmlStr += '	        	padding-left: 0px;';
											xmlStr += '	        	padding-right: 0px;';
											xmlStr += '	        	padding-top: 5px;';
											xmlStr += '	        	padding-bottom: 0px;';
											xmlStr += '	        	font-size: 8pt;';
											xmlStr += '	        }';
											xmlStr += '	        td.footer {';
											xmlStr += '	        	padding-left: 0px;';
											xmlStr += '	        	padding-right: 0px;';
											xmlStr += '	        	padding-top: 5px;';
											xmlStr += '	        	padding-bottom: 0px;';
											xmlStr += '	        	font-size: 10pt;';
											xmlStr += '	        }';
											xmlStr += '			td p {';
											xmlStr += '				align:left;';
											xmlStr += '			}';
											xmlStr += '			hr {';
											xmlStr += '				width: 100%;';
											xmlStr += '				margin-top: 20px;';
											xmlStr += '				margin-bottom: 5px;';
											xmlStr += '			}';
											xmlStr += '	</style>';
											xmlStr += '	</head>';
											xmlStr += '	<body header="nlheader" header-height="150pt" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="A4">';
											xmlStr += '	<table style="width: 100%">';
											
											xmlStr += '	<thead>';
											xmlStr += '	<tr style="border-bottom: 1px; black;">';
											xmlStr += '		<th align="left" colspan="2">Location</th>';
											xmlStr += '		<th align="left" colspan="2">Component</th>';
											xmlStr += '		<th align="left" colspan="5">Description</th>';
											xmlStr += '		<th align="center" colspan="1">Qty</th>';
											xmlStr += '		<th align="center" colspan="1">Picked</th>';
											xmlStr += '	</tr>';
											xmlStr += '	</thead>';
											
											for (var int3 = 0; int3 < outputObj[uniqueKey].lines.length; int3++) 
												{
													xmlStr += '<tr style="border-bottom: 1px; black;">';
													xmlStr += '<td align="left" colspan="2">' + xml.escape({xmlText: outputObj[uniqueKey].lines[int3].location}) + '</td>';
													xmlStr += '<td align="left" colspan="2">' + xml.escape({xmlText: outputObj[uniqueKey].lines[int3].component}) + '</td>';
													xmlStr += '<td align="left" colspan="5">' + xml.escape({xmlText: outputObj[uniqueKey].lines[int3].description}) + '</td>';
													xmlStr += '<td align="center" colspan="1">' + xml.escape({xmlText: outputObj[uniqueKey].lines[int3].quantity.toFixed(2)}) + '</td>';
													xmlStr += '<td align="left" colspan="1">&nbsp;</td>';
													xmlStr += '</tr>';
												}

											xmlStr += '	</table>';
											xmlStr += '	</body>';
											xmlStr += '	</pdf>';
											xmlStr += '';
										}
									
									xmlStr += '	</pdfset>';
									
									
									//Convert xml to pdf
									//
									var outputFile = null;
									
									try
										{
											outputFile = render.xmlToPdf({xmlString: xmlStr});
											
											outputFile.description 		= 'Doc M Picking List';
											outputFile.name 			= 'DocMPickingList.pdf';
											
											//Return the form to the user
								            //
								            context.response.writeFile({file: outputFile, isInline: true});
											
										}
									catch(err)
										{
											log.error({
														title: 		'Unable to create PDF file',
														details: 	err
														});
										}
								}
						}
		        } 
		    else 
		    	{
		    		
		        }
	    }
    
        
      
    function outputHeaderObj()
    	{
    		this.orderNumber 		= '';
    		this.customer	 		= '';
			this.waveNumber			= '';
    		this.location			= '';
    		this.product			= '';
    		this.description 		= '';
    		this.duedate			= '';
    		this.releaseDate		= '';
    		this.lines				= [];
    	}
    
    function outputDetailObj(_location, _component, _description, _quantity)
		{
			this.location			= _location;
			this.component			= _component;
			this.description 		= _description;
			this.quantity			= _quantity;
		}
    
    //left padding s with c to a total of n chars
    //
    function padding_left(s, c, n) 
    {
    	if (! s || ! c || s.length >= n) 
    	{
    		return s;
    	}
    	
    	var max = (n - s.length)/c.length;
    	
    	for (var i = 0; i < max; i++) 
    	{
    		s = c + s;
    	}
    	
    	return s;
    }
    
    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }

    function isNull(_string, _replacer)
    	{
    		return (_string == null ? _replacer : _string);
    	}
    
    return {onRequest: onRequest};
});

