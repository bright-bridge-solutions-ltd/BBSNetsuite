/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/sftp', 'N/file', 'N/search', 'N/xml', 'N/record'],
/**
 * @param {sftp} 
 */
function(sftp, file, search, xml, record) 
{
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) 
	    {
	    	//Get runtime parameters
			//
			var currentScript = runtime.getCurrentScript();
			var attachmentsFolder = currentScript.getParameter({name: 'custscript_bbs_attachments_folder'});
			
    		//Find the integration record
    		//
    		var customrecord_bbs_comet_integrationSearchObj = getResults(search.create({
				   type: 	"customrecord_bbs_comet_integration",
				   filters:	[],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbs_comet_username", label: "SFTP Username"}),
				      search.createColumn({name: "custrecord_bbs_comet_password", label: "SFTP Password (Tokenised)"}),
				      search.createColumn({name: "custrecord_bbs_comet_url", label: "SFTP Site URL Or IP Address"}),
				      search.createColumn({name: "custrecord_bbs_comet_port", label: "SFTP Port Number"}),
				      search.createColumn({name: "custrecord_bbs_comet_outboud_dir", label: "SFTP Site Outbound Directory"}),
				      search.createColumn({name: "custrecord_bbs_comet_processed_dir", label: "SFTP Site Processed Directory"}),
				      search.createColumn({name: "custrecord_bbs_comet_hostkey", label: "SFTP Site Host Key"})
				   ]
				}));
			
			if(customrecord_bbs_comet_integrationSearchObj != null && customrecord_bbs_comet_integrationSearchObj.length == 1)
				{
					var integrationId 			= customrecord_bbs_comet_integrationSearchObj[0].id;
					var integrationUsername 	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_username"});
					var integrationPassword 	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_password"});
					var integrationUrl 			= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_url"});
					var integrationPort 		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_port"});
					var integrationOutbound 	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_outboud_dir"});
					var integrationProcessed 	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_processed_dir"});
					var integrationHostkey		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_hostkey"});
					
					//Create a connection
					//
					var objConnection = null;
					
					try
						{
								objConnection = sftp.createConnection({
															    	    username: 		integrationUsername,
															    	    passwordGuid: 	integrationPassword,
															    	    url: 			integrationUrl, 
															    	    port:			integrationPort,
															    	    directory: 		integrationOutbound,
															    	    hostKey: 		integrationHostkey
					    											});
					
						}
					catch(err)
						{
							objConnection = null;
							
							log.error({
										title: 		'Error connecting to sftp site',
										details: 	err
										});
						}
					
					//Continue if we have a connection
					//
					if(objConnection != null)
						{
							var fileList = objConnection.list({
																path: 	'.', 
																sort: 	sftp.Sort.DATE
															});
						
							//Process the list of files
							//
							for (var int = 0; int < fileList.length; int++) 
								{
									//Check resources
									//
									checkResources();
									
									var fileName = fileList[int].name;
									var downloadedFile = null;
									
									//Try to download the file
									//
									try
										{
											downloadedFile = objConnection.download({filename: fileName});
										}
									catch(err)
										{
											log.error({
														title: 		'Error downloading file ' + fileName,
														details: 	err
														});
											
											downloadedFile = null;
										}
									
									//Do we have a file to process
									//
									if(downloadedFile != null)
										{
											//Process the file
											//
											var fileContents = downloadedFile.getContents();
											
											//Convert contents to xml
											//
											var xmlDocument = xml.Parser.fromString({
																					text: fileContents
																					});
											
											//Process the xml into a cash sale 
											//
											var fileProcessedOk = true;
											var cashSaleRecordId = null;
											//TODO
											
											
											//Save the file as an attachment to the cash sale record
											//
											if(cashSaleRecordId != null)
												{
													//Set the attachments folder
						    						//
													downloadedFile.folder = attachmentsFolder;
						    						
													//Make available without login
						    						//
													downloadedFile.isOnline = true;
						    						
						    						//Try to save the file to the filing cabinet
						    						//
						    						var fileId = null;
						    						
						    						try
						    							{
						    								fileId = downloadedFile.save();
						    							}
						    						catch(err)
						    							{
						    								log.error({
						    											title: 'Error Saving file To File Cabinet ' + attachmentsFolder,
						    											details: err
						    											});
						    								
						    								fileId = null;
						    							}
													
						    						//If we have saved the file ok, then we need to attach the file
						    						//
						    						if(fileId != null)
						    							{
						    								record.attach({
						    												record: {type: 'file', id: fileId},
						    												to: {type: record.Type.CASH_SALE, id: cashSaleRecordId}
						    												});
						    							
						    						
															//If all worked ok the we can move or delete the file
															//
															if(fileProcessedOk)
																{
																	//See if we are moving the file to another directory or just deleting it
																	//
																	if(integrationProcessed != null && integrationProcessed != '')
																		{
																			//Move the file to the processed directory
																			//
																				
																			//TODO	
																			
																		}
																	else
																		{
																			//Delete the file
																			//
																			try
																				{
																					objConnection.removeFile({
																											path:	'./' + fileName
																											});
																				}
																			catch(err)
																				{
																					log.error({
																								title: 		'Error deleting file ' + fileName,
																								details: 	err
																								});
																				}
																		}
																}
						    							}
												}
										}
								}
						}
				}
			else
				{
					log.error({
								title: 		'Error - unable to find configuration record',
								details: 	''
								});
				}
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
    
    //Check resources
    //
    function checkResources()
	    {
	    	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	    	
	    	if(remaining < 100)
	    		{
	    			nlapiYieldScript();
	    		}
	    }
    
    
    function processChildNodes(_childNodes)
    {
    	var retValue = false;

    	for(var int2=0; int2< _childNodes.length; int2++)
    		{
    			if(_childNodes[int2].nodeType != 'TEXT_NODE')
    				{
    					retValue = true;
    				}
    		}

    	return retValue;
    }

    function processNodes(_nodes)
    {
    	for(var int=0; int< _nodes.length; int++)
    	{
              var nodeType = _nodes[int].nodeType;

              if(nodeType != 'TEXT_NODE')
              {

    			  var a = _nodes[int].nodeName;
    			  var b = _nodes[int].textContent;
    			  var c = _nodes[int].attributes;

    				

    			  var childNodes = _nodes[int].childNodes;

    			  if(processChildNodes(childNodes))
    				  {
    					processNodes(childNodes);
    				  }
    				else
    					{
    						log.debug({title: a + ' = ' + b});
    					}

    			  for(var attribute in c)
    			    {
    			       var d = _nodes[int].getAttribute({name : attribute});
    			    }
    	    }

    	}


    }
    
    
    return {execute: execute};

});
