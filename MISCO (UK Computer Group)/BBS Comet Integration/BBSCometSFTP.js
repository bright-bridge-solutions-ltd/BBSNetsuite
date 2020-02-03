/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/sftp', 'N/file', 'N/search', 'N/xml', 'N/record', 'N/runtime', 'N/email'],
/**
 * @param {sftp, file, search, xml, record, runtime, email} 
 */
function(sftp, file, search, xml, record, runtime, email) 
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
    		var emailMessage = '';
    		
    		//Find the integration record
    		//
    		var customrecord_bbs_comet_integrationSearchObj = getResults(search.create({
				   type: 	"customrecord_bbs_comet_integration",
				   filters:	[],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbs_comet_username", 				label: "SFTP Username"}),
				      search.createColumn({name: "custrecord_bbs_comet_password", 				label: "SFTP Password (Tokenised)"}),
				      search.createColumn({name: "custrecord_bbs_comet_url", 					label: "SFTP Site URL Or IP Address"}),
				      search.createColumn({name: "custrecord_bbs_comet_port", 					label: "SFTP Port Number"}),
				      search.createColumn({name: "custrecord_bbs_comet_outboud_dir", 			label: "SFTP Site Outbound Directory"}),
				      search.createColumn({name: "custrecord_bbs_comet_processed_dir", 			label: "SFTP Site Processed Directory"}),
				      search.createColumn({name: "custrecord_bbs_comet_hostkey", 				label: "SFTP Site Host Key"}),
				      search.createColumn({name: "custrecord_bbs_comet_cash_sale_cust", 		label: "Cash Sale Customer"}),
				      search.createColumn({name: "custrecord_bbs_comet_attachments_folder", 	label: "Attachments Folder"}),
				      search.createColumn({name: "custrecord_bbs_comet_email_sender", 			label: "Email Sender"}),
				      search.createColumn({name: "custrecord_bbs_comet_email_recipients", 		label: "Email Recipients"}),
				      search.createColumn({name: "custrecord_bbs_comet_file_extension", 		label: "File Extension"}),
				      search.createColumn({name: "custrecord_bbs_comet_so_form", 				label: "Sales Order Form"}),
				      search.createColumn({name: "custrecord_bbs_comet_payment_type", 			label: "Payment Type"}),
				      
				   ]
				}));
			
			if(customrecord_bbs_comet_integrationSearchObj != null && customrecord_bbs_comet_integrationSearchObj.length == 1)
				{
					var integrationId 				= customrecord_bbs_comet_integrationSearchObj[0].id;
					var integrationUsername 		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_username"});
					var integrationPassword 		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_password"});
					var integrationUrl 				= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_url"});
					var integrationPort 			= Number(customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_port"}));
					var integrationOutbound 		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_outboud_dir"});
					var integrationProcessed 		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_processed_dir"});
					var integrationHostkey			= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_hostkey"});
					var integrationCashSaleCust		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_cash_sale_cust"});
					var integrationAttachFolder		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_attachments_folder"});
					var integrationEmailSender		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_email_sender"});
					var integrationEmailRecipients	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_email_recipients"});
					var integrationFileExtension	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_file_extension"});
					var integrationFormId			= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_so_form"});
					var integrationPaymentMethod	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_payment_type"});
					
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
							
							emailMessage += 'Error connecting to sftp site - ' + err.message + '\n\n';
						}
					
					//Continue if we have a connection
					//
					if(objConnection != null)
						{
							//Find the files to process
							//
							var fileList = [];
							
							try
								{
									fileList = objConnection.list({
																	path: 	'./' + integrationFileExtension, 
																	sort: 	sftp.Sort.DATE
																	});
								}
							catch(err)
								{
									log.error({
												title: 		'Error getting file list',
												details: 	err
												});
						
									emailMessage += 'Error getting file list - ' + err.message + '\n\n';
								}
							
							//Process the list of files
							//
							for (var int = 0; int < fileList.length; int++) 
								{
									//Check resources
									//
									if(runtime.getCurrentScript().getRemainingUsage() > 100)
										{
											//Extract the file name
											//
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
													
													emailMessage += 'Error downloading file ' + fileName + ' - ' + err.message + '\n\n';
													
													downloadedFile = null;
												}
											
											//Do we have a file to process
											//
											if(downloadedFile != null)
												{
													//Get the file contents
													//
													var fileContents = downloadedFile.getContents();
													
													//Convert contents to xml object
													//
													var xmlDocument = xml.Parser.fromString({
																							text: fileContents
																							});
													
													var orderHeaderNode = xml.XPath.select({node: xmlDocument, xpath: '/*'});
		
													var output = {};
													processNodes(orderHeaderNode, '', output, false);
		
													//Process the xml into NetSuite records
													//
													var fileProcessedOk = true;
													var salesOrderId = null;
													
													try
														{
															//Extract order header data from output object
															//
															/*
															var rawDateArray 		= output.Order.OrderHeader.OrderDate.substring(0,output.Order.OrderHeader.OrderDate.indexOf('T')).split('-');
															var headerOrderNo 		= output.Order.OrderHeader.ExternalSystemOrderNo;
															var headerCoName 		= output.Order.OrderHeader.CompanyInformation.Name;
															var headerContactName 	= output.Order.OrderHeader.ContactInformation.Contact.Name;
															var headerContactPhone 	= output.Order.OrderHeader.ContactInformation.Contact.Phone;
															var headerContactEmail 	= output.Order.OrderHeader.ContactInformation.Contact.Email;
															var headerBillAdressee 	= output.Order.OrderHeader.AddressingInformation.BillToAddress.AddressName;
															var headerBillCompany 	= output.Order.OrderHeader.AddressingInformation.BillToAddress.Company;
															var headerBillAddress1 	= output.Order.OrderHeader.AddressingInformation.BillToAddress.Address1;
															var headerBillAddress2 	= output.Order.OrderHeader.AddressingInformation.BillToAddress.Address2;
															var headerBillCity 		= output.Order.OrderHeader.AddressingInformation.BillToAddress.City;
															var headerBillCounty 	= output.Order.OrderHeader.AddressingInformation.BillToAddress.County;
															var headerBillPostCode 	= output.Order.OrderHeader.AddressingInformation.BillToAddress.Zip;
															var headerBillCountry 	= output.Order.OrderHeader.AddressingInformation.BillToAddress.Country;
															var headerShipAdressee 	= output.Order.OrderHeader.AddressingInformation.ShipToAddress.AddressName;
															var headerShipCompany 	= output.Order.OrderHeader.AddressingInformation.ShipToAddress.Company;
															var headerShipAddress1 	= output.Order.OrderHeader.AddressingInformation.ShipToAddress.Address1;
															var headerShipAddress2 	= output.Order.OrderHeader.AddressingInformation.ShipToAddress.Address2;
															var headerShipCity 		= output.Order.OrderHeader.AddressingInformation.ShipToAddress.City;
															var headerShipCounty 	= output.Order.OrderHeader.AddressingInformation.ShipToAddress.County;
															var headerShipPostCode 	= output.Order.OrderHeader.AddressingInformation.ShipToAddress.Zip;
															var headerShipCountry 	= output.Order.OrderHeader.AddressingInformation.ShipToAddress.Country;
															var headerShipTotal		= output.Order.OrderHeader.ShippingTotal.ExclusiveVAT;
															var headerShipVat		= output.Order.OrderHeader.ShippingTotal.VAT;
															var headerOrderTotal	= output.Order.OrderHeader.OrderTotal.ExclusiveVAT;
															var headerOrderVat		= output.Order.OrderHeader.OrderTotal.VAT;
															*/
															var rawDateArray 		= output.Order.OrderHeader.OrderDate.substring(0,output.Order.OrderHeader.OrderDate.indexOf('T')).split('-');
															var headerOrderNo 		= getDataElement(output, 'output.Order.OrderHeader.ExternalSystemOrderNo');
															var headerCoName 		= getDataElement(output, 'output.Order.OrderHeader.CompanyInformation.Name');
															var headerContactName 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Contact.Name');
															var headerContactPhone 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Contact.Phone');
															var headerContactEmail 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Contact.Email');
															var headerBillAdressee 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.AddressName');
															var headerBillCompany 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.Company');
															var headerBillAddress1 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.Address1');
															var headerBillAddress2 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.Address2');
															var headerBillCity 		= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.City');
															var headerBillCounty 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.County');
															var headerBillPostCode 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.Zip');
															var headerBillCountry 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.BillToAddress.Country');
															var headerShipAdressee 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.AddressName');
															var headerShipCompany 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.Company');
															var headerShipAddress1 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.Address1');
															var headerShipAddress2 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.Address2');
															var headerShipCity 		= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.City');
															var headerShipCounty 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.County');
															var headerShipPostCode 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.Zip');
															var headerShipCountry 	= getDataElement(output, 'output.Order.OrderHeader.AddressingInformation.ShipToAddress.Country');
															var headerShipTotal		= getDataElement(output, 'output.Order.OrderHeader.ShippingTotal.ExclusiveVAT');
															var headerShipVat		= getDataElement(output, 'output.Order.OrderHeader.ShippingTotal.VAT');
															var headerOrderTotal	= getDataElement(output, 'output.Order.OrderHeader.OrderTotal.ExclusiveVAT');
															var headerOrderVat		= getDataElement(output, 'output.Order.OrderHeader.OrderTotal.VAT');

															var headerDate 			= rawDateArray[2] + '/' + rawDateArray[1] + '/' + rawDateArray[0];
															
															//Create sales order record
															//
															var salesOrderRecord = record.create({
																									type: 			record.Type.SALES_ORDER, 
																								    isDynamic: 		true,
																								    defaultValues: 	{
																								        			entity: integrationCashSaleCust	//Cash Sale Customer
																								    				} 
																								});
															
															salesOrderRecord.setValue({
																						fieldId:	'customform',
																						value:		integrationFormId					
																						});
			
															salesOrderRecord.setValue({
																						fieldId:	'otherrefnum',
																						value:		headerOrderNo
																						});
															
															salesOrderRecord.setValue({
																						fieldId:	'trandate',
																						value:		new Date(headerDate)
																						});
															
															salesOrderRecord.setValue({
																						fieldId:	'orderstatus',
																						value:		'B'					//Pending Fulfilment
																						});
															
															salesOrderRecord.setValue({
																						fieldId:	'paymentmethod',
																						value:		integrationPaymentMethod					
																						});
			
															//Shipping Address
															//
															var shippingSubrecord = salesOrderRecord.getSubrecord({fieldId: 'shippingaddress'});
															shippingSubrecord.setValue({fieldId: 'addr1', value: headerShipAddress1});
															shippingSubrecord.setValue({fieldId: 'addr2', value: headerShipAddress2});
															shippingSubrecord.setValue({fieldId: 'city', value: headerShipCity});
															shippingSubrecord.setValue({fieldId: 'state', value: headerShipCounty});
															shippingSubrecord.setValue({fieldId: 'zip', value: headerShipPostCode});
															shippingSubrecord.setValue({fieldId: 'adressee', value: headerShipCompany});
															shippingSubrecord.setValue({fieldId: 'attention', value: headerShipAdressee});
															
															//Billing Address
															//
															var billingSubrecord = salesOrderRecord.getSubrecord({fieldId: 'billingaddress'});
															billingSubrecord.setValue({fieldId: 'addr1', value: headerBillAddress1});
															billingSubrecord.setValue({fieldId: 'addr2', value: headerBillAddress2});
															billingSubrecord.setValue({fieldId: 'city', value: headerBillCity});
															billingSubrecord.setValue({fieldId: 'state', value: headerBillCounty});
															billingSubrecord.setValue({fieldId: 'zip', value: headerBillPostCode});
															billingSubrecord.setValue({fieldId: 'adressee', value: headerBillCompany});
															billingSubrecord.setValue({fieldId: 'attention', value: headerBillAdressee});
															
															//Line Processing
															//
															for (var int2 = 0; int2 < output.Order.OrderLines.length; int2++) 
																{
																	var lineProduct = output.Order.OrderLines[int2].ProductLine.ManufacturerArticleNo;
																	var lineQuantity = output.Order.OrderLines[int2].ProductLine.Quantity;
																	var lineSupplier = output.Order.OrderLines[int2].ProductLine.Supplier;
																	var linePrice = output.Order.OrderLines[int2].ProductLine.Price;
																
																	//Find item 
																	//
																	var itemId = null;
																	
																	var itemSearchObj = getResults(search.create({
																												   type: "item",
																												   filters:
																												   [
																												      ["name","is",lineProduct]
																												   ],
																												   columns:
																												   [
																												      search.createColumn({name: "itemid", label: "Name"}),
																												      search.createColumn({name: "displayname", label: "Display Name"})
																												   ]
																												}));
																	
																	if(itemSearchObj != null && itemSearchObj.length == 1)
																		{	
																			itemId = itemSearchObj[0].id;
																		}
																	
																	//If we have found the item we can add it
																	//
																	if(itemId != null)
																		{
																			salesOrderRecord.selectNewLine({
																						    				sublistId: 'item'
																						    				});
																			
																			salesOrderRecord.setCurrentSublistValue({
																								    				sublistId: 	'item',
																								    				fieldId: 	'item',
																								    				value: 		itemId
																								    				});
										
																			salesOrderRecord.setCurrentSublistValue({
																								    				sublistId: 	'item',
																								    				fieldId: 	'quantity',
																								    				value: 		lineQuantity
																								    				});
																			
																			salesOrderRecord.setCurrentSublistValue({
																								    				sublistId: 	'item',
																								    				fieldId: 	'amount',
																								    				value: 		linePrice
																								    				});
										
																			salesOrderRecord.commitLine({
																										sublistId: 	'item'
																										});
																		}
																	else
																		{
																			emailMessage += 'Unable to find product with code ' + lineProduct + ' for order # '+ headerOrderNo + '\n\n';
																		}
																}
															
															//Save the sales order
															//
															salesOrderId = salesOrderRecord.save();
														}
													catch(err)
														{
															salesOrderId = null;
															fileProcessedOk = false;
															
															log.error({
																		title: 		'Error creating sales order',
																		details: 	err
																	});
															
															emailMessage += 'Error creating sales order - ' + err.message + '\n\n';
															
														}
													
													//Save the file as an attachment 
													//
													if(fileProcessedOk)
														{
															//Set the attachments folder
								    						//
															downloadedFile.folder = integrationAttachFolder;
								    						
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
								    								
								    								emailMessage += 'Error Saving file To File Cabinet - ' + err.message + '\n\n';
								    								
								    								fileId = null;
								    							}
															
								    						//If we have saved the file ok, then we need to attach the file
								    						//
								    						if(fileId != null)
								    							{
								    								record.attach({
								    												record: 	{type: 'file', id: fileId},
								    												to: 		{type: record.Type.SALES_ORDER, id: salesOrderId}
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
																					try
																						{
																							objConnection.move({
																												from:	'./' + fileName,
																												to:		integrationProcessed + '/' + fileName
																												});
																						}
																					catch(err)
																						{
																							log.error({
																										title: 		'Error moving file in SFTP site ' + fileName,
																										details: 	err
																										});
																							
																							emailMessage += 'Error moving file from  ./' + fileName + ' to ' + integrationProcessed + ' - ' + err.message + '\n\n';
																						}
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
																										title: 		'Error deleting file from SFTP site ' + fileName,
																										details: 	err
																										});
																							
																							emailMessage += 'Error deleting file from SFTP site ' + fileName + ' - ' + err.message + '\n\n';
																						}
																				}
																		}
								    							}
														}
												}
										}
									else
										{
											break;
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
			
			//If we have errors to report, then email them out
			//
			if(emailMessage != '')
				{
					try
						{
							email.send({
							            author: 		integrationEmailSender,
							            recipients: 	integrationEmailRecipients.split(';'),
							            subject: 		'COMET Integration Errors',
							            body: 			emailMessage,
							        	});
						}
					catch(err)
						{
							log.error({
										title: 		'Error sending email notification \n\n' + emailMessage,
										details: 	err
										});
						}
				}
	    }

    //Get data elements from output object
    //
    function getDataElement(output, _element)
    	{
    		var returnData = '';
    		
    		try
    			{
    				returnData = eval(_element);
    			}
    		catch(err)
    			{
    				returnData = '';
    			}
    		
    		return returnData;
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

    function processNodes(_nodes, _prefix, _output, _isArray, _arrayIndex)
	    {
	    	for(var int=0; int< _nodes.length; int++)
		    	{
	    			var nodeType = _nodes[int].nodeType;
		
	    			if(nodeType != 'TEXT_NODE')
	    				{
		            	  	_arrayIndex++;
			    			var a = _nodes[int].nodeName;
			    			var b = _nodes[int].textContent;
			    			var c = _nodes[int].attributes;
			    			
			    			var childNodes = _nodes[int].childNodes;
			
			    			if(processChildNodes(childNodes))
			    				{
			    					if(_prefix == '')
			    				  	  	{
			    							_output[a] = {};
			    				  	  		
			    				  	  		var firstAttribute = true;
			    					  	  	for(var attribute in c)
			    								{
			    					  	  			if(firstAttribute)
			    					  	  				{
			    					  	  					_output[a].attributes = {};
			    					  	  					firstAttribute = false;
			    					  	  				}
			    					  	  			
			    								       var attributeValue = _nodes[int].getAttribute({name : attribute});
			    								       var attributeName = '@' + attribute;
			    								       var cmd = "_output." + a + ".attributes['" + attributeName + "'] = '" + attributeValue + "'";
			    								       eval(cmd);
			    								 }
			    					  	  	
			    				  	  		processNodes(childNodes, a, _output, false, -1);
			    				  	  	}
			    					else
			    				  	  	{
			    				  	  		var isArray = false;
			    				  	  		var arrayIndex = -1;
			
			    				  	  		if(_isArray)
			    				  	  			{
			    				  	  				var cmd = 'if(_output.' + _prefix + '.length <= ' + _arrayIndex + '){_output.' + _prefix + '.push(new Object())}';
			    				  	  				
			    				  	  				eval(cmd);
			    				  	  				var path =  _prefix + '[' + _arrayIndex + ']' + '.' + a;
			    				  	  			}
			    				  	  		else
			    				  	  			{
			    				  	  				var path = _prefix + '.' + a;
			    				  	  			}
			    				  	  		
			    				  	  		if(a == 'OrderLines' || a == 'Suppliers')
			    				  	  			{
			    									//var cmd = "_output." + path + " = Array.apply(null, Array(10)).map(function () {return new Object();})";
			    									var cmd = "_output." + path + " = []";
			    									isArray = true;
			    									//arrayIndex++;
			
			    									//path += '[0]';
			    				  	  			}
			    				  	  		else
			    					  	  		{
			    					  	  			var cmd = "_output." + path + " = {}";
			    					  	  		}
			    					  	  		
			    				  	  		eval(cmd);
			
			    					  	  	var firstAttribute = true;
			    					  	  	
			    					  	  	for(var attribute in c)
			    								{
			    					  	  			if(firstAttribute)
			    					  	  				{
			    					  	  					var cmd = "_output." + path + ".attributes = {}";
			    					  	  					eval(cmd);
			    					  	  					firstAttribute = false;
			    					  	  				}
			    					  	  			
			    								       var attributeValue = _nodes[int].getAttribute({name : attribute});
			    								       var attributeName = '@' + attribute;
			    								       var cmd = "_output." + path + ".attributes['" + attributeName + "'] = '" + attributeValue + "'";
			    								       eval(cmd);
			    								 }
			    				  	  	
			    				  	  		processNodes(childNodes, path, _output, isArray, arrayIndex);
			    				  	  	}
			    				  	}
			    				else
			    					{
			    						var path = _prefix + '.' + a;
			    						var value = b;
			    						var pathParts = path.split('.');
			
			    						var cmd = "_output." + path + " = '" + value + "'";
			    						eval(cmd);
			
			    						//log.debug({title: path + ' = ' + value});
			    					}
			    	    }
			    }
	    }
    
    return {execute: execute};

});