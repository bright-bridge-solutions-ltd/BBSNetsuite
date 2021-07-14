/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/render', 'N/xml', 'N/runtime', 'N/plugin', 'N/file','N/encode'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(search, render, xml, runtime, plugin, file, encode) 
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
	    	//Retrieve script parameters
    		//
	    	var recordID 		= context.request.parameters.id;
	    	
	    	var userWorkstation	= null;
	    	
	    	//Get the workstation from the user preference
			//
			var currentScript 		= runtime.getCurrentScript();
	    	var userPrefWorkstation = currentScript.getParameter({name: 'custscript_bbs_up_pref_pack_station'});
	    	
	    	try
				{
			    	//Get the current user
					//
					var currentUser	= runtime.getCurrentUser().id;
					
		
					//See if the current user has a printnode workstation assigned
					//
					userWorkstation	= search.lookupFields({
						    									type:		search.Type.EMPLOYEE,
						    									id:			currentUser,
						    									columns:	'custentity_bbs_default_workstation'
						    									}).custentity_bbs_default_workstation;		
					
					userWorkstation = (userWorkstation.length > 0 ? userWorkstation[0].value : null);
				}
			catch(err)
				{
					userWorkstation	= null;
				}
			
			//See if the IF record has a printnode workstation assigned
			//
			var packingStation	=	search.lookupFields({
				    									type:		search.Type.ITEM_FULFILLMENT,
				    									id:			recordID,
				    									columns:	'custbody_bbs_printnode_workstation'
				    									}).custbody_bbs_printnode_workstation;		
			
			packingStation = (packingStation.length > 0 ? packingStation[0].value : null);
			
			//If the packing station from the IF is empty then try and use the default printnode workstation from the employee record
			//
			if(packingStation == null || packingStation == '')
				{
					packingStation = userWorkstation;
				}
			
			//If there is a user preference for a workstation use that instead as this will override everything else
			//
			if(userPrefWorkstation != null && userPrefWorkstation != '')
				{
					packingStation = userPrefWorkstation;
				}
			
			
			//Only carry on if we have a workstation in some shape or form
			//
			if(packingStation != null && packingStation != '')
				{
    				//Search for the workstation record
					//
   					var customrecord_bbs_printnode_workstationSearchObj = getResults(search.create({
    						   																		type: 		"customrecord_bbs_printnode_workstation",
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
			    				//Get the printnode config record
								//
								var pnConfig = null;
								
								try
									{
										pnConfig = pnPlugin.getConfiguration();
									}
								catch(err)
									{
										pnConfig = null;
										log.error({title: 'Error getting printnode configuration', details: err});
									}
								
								if(pnConfig)
									{
										//
				    					//Process the carrier labels
				    					//
				    					if(labelPrinter != null && labelPrinter != '')
				    						{
						    					//Find any attachments to the IF record
						    					//
						    					var itemfulfillmentSearchObj = getResults(search.create({
						    							   												type: 		"itemfulfillment",
						    							   												filters:
																				    							   [
																				    							    ["type","anyof","ItemShip"], 
																				    							    "AND", 
																				    							    ["mainline","is","T"], 
																				    							    "AND", 
																				    							    ["internalid","anyof",recordID], 
																				    							    "AND", 
																				    							    ["file.internalid","noneof","@NONE@"],
																	    										      "AND", 
																	    										    ["file.filetype","anyof",pnConfig.labelFileType]
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
			
			var xml = "<html><body><script>window.close();</script></body></html>";
			context.response.write({output: xml});
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


	return {
    		onRequest: onRequest
    		};

});
