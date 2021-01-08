/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/https', 'N/record', 'N/search', 'N/plugin', 'N/render', 'N/file', 'N/encode'],
/**
 * @param {https} https
 * @param {record} record
 * @param {search} search
 */
function(https, record, search, plugin, render, file, encode) 
{
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function automatedPrintingAS(scriptContext) 
	    {
    		//
    		//Function to automatically print IF documents (packing slip & carrier labels) via printnode
    		//
    		if(scriptContext.type == 'edit')
    			{
    				var oldRecord 			= scriptContext.oldRecord;
    				var newRecord 			= scriptContext.newRecord;
    				var oldShippingStatus 	= oldRecord.getValue({fieldId: 'shipstatus'});							// A=Picked, B=Packed, C=Shipped
    				var newShippingStatus 	= newRecord.getValue({fieldId: 'shipstatus'});							// A=Picked, B=Packed, C=Shipped
    				var packingStation	 	= newRecord.getValue({fieldId: 'custbody_bbs_printnode_workstation'});		
    				var recordId			= newRecord.id;
    				
    				//Has the IF changed from picked to packed?
    				//
    				if(oldShippingStatus == 'A' && newShippingStatus == 'B')
    					{
    						//Do we have a workstation assigned to the IF record
    						//
    						if(packingStation != null && packingStation != '')
    							{
		    						//Search for the workstation record
		    						//
			    					var customrecord_bbs_printnode_workstationSearchObj = getResults(search.create({
			    						   type: "customrecord_bbs_printnode_workstation",
			    						   filters:
			    						   [
			    						    ["internalid","anyof",packingStation]
			    						   ],
			    						   columns:
			    						   [
			    						      search.createColumn({name: "name",label: "Name"}),
			    						      search.createColumn({name: "custrecord_bbs_printnode_ws_doc_print", label: "Document Printer"}),
			    						      search.createColumn({name: "custrecord_bbs_printnode_ws_lbl_print", label: "Label Printer"}),
			    						      search.createColumn({name: "custrecord_bbs_printnode_printer_id", join: "CUSTRECORD_BBS_PRINTNODE_WS_DOC_PRINT",label: "Printer Id"}),
			    						      search.createColumn({name: "custrecord_bbs_printnode_printer_id",join: "CUSTRECORD_BBS_PRINTNODE_WS_LBL_PRINT",label: "Printer Id"})
			    						   ]
			    						}));
		    								
			    					//Did we find it?
			    					//
			    					if(customrecord_bbs_printnode_workstationSearchObj != null && customrecord_bbs_printnode_workstationSearchObj.length > 0)
			    						{
			    							var documentPrinter = customrecord_bbs_printnode_workstationSearchObj[0].getValue({name: "custrecord_bbs_printnode_printer_id", join: "CUSTRECORD_BBS_PRINTNODE_WS_DOC_PRINT"});
			    							var labelPrinter 	= customrecord_bbs_printnode_workstationSearchObj[0].getValue({name: "custrecord_bbs_printnode_printer_id", join: "CUSTRECORD_BBS_PRINTNODE_WS_LBL_PRINT"});
		
			    							//Load up the printnode plugin
			    							//
			    							var pnPlugin = null;
			    							
			    							try
			    								{
				    								var pnPlugin = plugin.loadImplementation({type: 'customscript_bbs_printnode_plugin'});
			    								}
			    							catch(err)
			    								{
			    									log.error({title: 'Error in printnode plugin', details: err});
			    									pnPlugin = null;
			    								}
			    							
			    							//Plugin loaded ok?
			    							//
			    							if(pnPlugin != null)
												{
			    									//
			    									//Process the packing slip
			    									//
			    									try
			    										{
				    										var printFile = render.packingSlip({
														    									entityId: 	recordId,
														    									printMode: 	render.PrintMode.PDF
														    									});

				    										var contents 		= printFile.getContents();

				    										var printRequestObj = new pnPrintRequestObj(documentPrinter, 'Packing Slip', 'pdf_base64', contents, '', 1);
				    										var printResult 	= pnPlugin.sendPrint(printRequestObj);

			    										}
			    									catch(err)
			    										{
			    											log.error({title: 'Error in processing packing slip via printnode', details: err});
			    										}
			    								
			    									
			    									//
			    									//Process the carrier labels
			    									//
			    									
			    									//Find any attachments to the IF record
			    									//
			    									var itemfulfillmentSearchObj = getResults(search.create({
			    										   type: "itemfulfillment",
			    										   filters:
			    										   [
			    										      ["type","anyof","ItemShip"], 
			    										      "AND", 
			    										      ["mainline","is","T"], 
			    										      "AND", 
			    										      ["internalid","anyof",recordId], 
			    										      "AND", 
			    										      ["file.internalid","noneof","@NONE@"]
			    										   ],
			    										   columns:
			    										   [
			    										      search.createColumn({name: "tranid", label: "Document Number"}),
			    										      search.createColumn({name: "entity", label: "Name"}),
			    										      search.createColumn({name: "name",join: "file",label: "Name"}),
			    										      search.createColumn({name: "filetype",join: "file",label: "Type"}),
			    										      search.createColumn({name: "description",join: "file",label: "Description"}),
			    										      search.createColumn({name: "internalid",join: "file",label: "Internal ID"}),
			    										      search.createColumn({name: "url",join: "file",label: "URL"})
			    										   ]
			    										}));
			    										
			    									if(itemfulfillmentSearchObj != null && itemfulfillmentSearchObj.length > 0)
			    										{
			    											for (var resultCount = 0; resultCount < itemfulfillmentSearchObj.length; resultCount++) 
				    											{
			    													//Get the internal id of the file
			    													//
																	var fileId = itemfulfillmentSearchObj[resultCount].getValue({name: "internalid",join: "file"});
																	
																	//Load the file, get its contents, encode to base64 & send to printnode
																	//
																	var fileObj = null;
																	
																	try
																		{
																			fileObj = file.load({id: fileId});
																		}
																	catch(err)	
																		{
																			fileObj = null;
																			log.error({title: 'Error in processing pcarrier labvel via printnode', details: err});
																		}
																	
																	if(fileObj != null)
																		{
																			var contents 		= fileObj.getContents();
																			var encodedContents	= encode.convert({
																													string:			contents,
																													inputEncoding:	encode.Encoding.UTF_8,
																													outputEncoding:	encode.Encoding.BASE_64
																													});
								    										var printRequestObj = new pnPrintRequestObj(labelPrinter, 'Carrier Label', 'raw_base64', encodedContents, '', 1);
								    										var printResult 	= pnPlugin.sendPrint(printRequestObj);

																		}
																}
			    										}
													
												}
	    								}
    							}
    					}
    			}
	    }

    function pnPrintRequestObj(_printerId, _title, _contentType, _content, _source, _quantity)
		{
			this.printerId		= _printerId;
			this.title			= _title;
			this.contentType	= _contentType;	//pdf_uri, pdf_base64, raw_uri or raw_base64
			this.content		= _content;
			this.source			= _source;
			this.qty			= _quantity;	//print quantity
		}
    
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
    
    return 	{
    		afterSubmit: 	automatedPrintingAS
    		};
    
});
