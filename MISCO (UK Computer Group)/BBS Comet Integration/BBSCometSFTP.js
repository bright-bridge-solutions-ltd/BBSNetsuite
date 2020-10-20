/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

define(['N/sftp', 'N/file', 'N/search', 'N/xml', 'N/record', 'N/runtime', 'N/email', 'N/format', 'N/task'],
/**
 * @param {sftp, file, search, xml, record, runtime, email} 
 */
function(sftp, file, search, xml, record, runtime, email, format, task) 
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
    		
    		//Get the deployment parameter which will determine what integration type to use
    		//
    		var integrationTypeParam = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_comet_integration_type'}).toString();
    		var supplierSuffixParam = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_comet_supplier_suffix'});
        	
    		if(integrationTypeParam != null && integrationTypeParam != '')
		    	{
		    		//Find the integration record
		    		//
		    		var customrecord_bbs_comet_integrationSearchObj = getResults(search.create({
						   type: 	"customrecord_bbs_comet_integration",
						   filters:	[
						           	 	["isinactive","is","F"],
						           	 	"AND",
						           	 	["custrecord_bbs_comet_integration_type","anyof",integrationTypeParam]
						           	 ],
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
						      search.createColumn({name: "custrecord_bbs_comet_division", 				label: "Division To Be Used For Sales Orders"}),
						      search.createColumn({name: "custrecord_bbs_comet_cust_form", 				label: "Customer Form"})
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
							var integrationCustFormId		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_cust_form"});
							var integrationPaymentMethod	= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_payment_type"});
							var integrationDivision			= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_division"});
							
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
													
													
													//Processing dependent on integration type
													//
													switch(integrationTypeParam)
														{
															case '1':	//Orders - B2C
																
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
																				var rawDateArray 		= output.Order.OrderHeader.OrderDate.substring(0,output.Order.OrderHeader.OrderDate.indexOf('T')).split('-');
																				var headerOrderNo 		= getDataElement(output, 'output.Order.OrderHeader.ExternalSystemOrderNo');
																				var headerCoName 		= getDataElement(output, 'output.Order.OrderHeader.CompanyInformation.Name');
																				var headerContactName 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Name');
																				var headerContactPhone 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Phone');
																				var headerContactMobile	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Mobile');
																				var headerContactEmail 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Email');
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
																				var headerDateString 	= rawDateArray[2] + '/' + rawDateArray[1] + '/' + rawDateArray[0];
																				var headerDate 			= format.parse({value: headerDateString, type: format.Type.DATE});
																				
																				//Find or create a cash sale customer
																				//
																				var customerToUse = findOrCreateCustomer(
																														headerContactEmail, 
																														integrationCashSaleCust, 
																														integrationDivision, 
																														headerContactName, 
																														headerBillAddress1,
																														headerBillAddress2,
																														headerBillCity,
																														headerBillCounty,
																														headerBillPostCode,
																														integrationCustFormId,
																														headerContactPhone,
																														headerContactMobile
																														);
																				
																				//Create sales order record
																				//
																				var salesOrderRecord = record.create({
																														type: 			record.Type.SALES_ORDER, 
																													    isDynamic: 		true,
																													    defaultValues: 	{
																													        			entity: customerToUse	//integrationCashSaleCust	//Cash Sale Customer
																													    				} 
																													});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'customform',
																											value:		integrationFormId					
																											});
								
																				salesOrderRecord.setValue({
																											fieldId:	'custbody_bbs_weborderref',
																											value:		headerOrderNo
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'trandate',
																											value:		headerDate
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'orderstatus',
																											value:		'B'					//Pending Fulfilment
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'paymentmethod',
																											value:		integrationPaymentMethod					
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'cseg_bbs_division',
																											value:		integrationDivision					
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
																						var lineProduct 			= output.Order.OrderLines[int2].ProductLine.ManufacturerArticleNo;
																						var lineDescription			= output.Order.OrderLines[int2].ProductLine.Label;
																						var lineSupplierAricleNo	= output.Order.OrderLines[int2].ProductLine.SupplierArticleNo;
																						var lineQuantity 			= output.Order.OrderLines[int2].ProductLine.Quantity;
																				//		var lineSupplier 			= output.Order.OrderLines[int2].ProductLine.Supplier;
																						var lineSupplier 			= output.Order.OrderLines[int2].ProductLine.SupplierExportId;
																						var linePoNumber			= output.Order.OrderLines[int2].ProductLine.PurchaseOrderNumber;
																						var linePoPrice 			= output.Order.OrderLines[int2].ProductLine.Price;
																						var lineSalesRate 			= output.Order.OrderLines[int2].ProductLine.SalesPrice.ExclusiveVAT;
																						var lineSalesAmount 		= output.Order.OrderLines[int2].ProductLine.TotalPrice.ExclusiveVAT;
																						
																						//lineSalesRate = Number(lineSalesRate);
																						//lineSalesRate = Math.round(lineSalesRate * 100) / 100;
																						
																						//linePoPrice = Number(linePoPrice);
																						//linePoPrice = Math.round(linePoPrice * 100) / 100;
																						
																						//lineSalesAmount = Number(lineSalesAmount);
																						//lineSalesAmount = Math.round(lineSalesAmount * 100) / 100;
																						
																						
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
																						
																						//If the item was not found, then we need to create one
																						//
																						if(itemId == null)
																							{
																								try
																									{
																										var itemRecord = record.create({
																																		type:		record.Type.INVENTORY_ITEM,
																																		isDynamic:	true
																																		});		
																										
																										itemRecord.setValue({
																															fieldId:	'itemid',
																															value:		lineProduct
																															});	
																						
																										itemRecord.setValue({
																															fieldId:	'isdropshipitem',
																															value:		true
																															});
																										
																										itemRecord.setValue({
																															fieldId: 	'offersupport',
																															value: 		true
																															});
																						
																										itemRecord.setValue({
																															fieldId:	'purchasedescription',
																															value:		lineDescription
																															});	
																																	
																										itemRecord.setValue({
																															fieldId:	'salesdescription',
																															value:		lineDescription
																															});	
																		
																										itemRecord.setValue({
																															fieldId:	'mpn',
																															value:		lineProduct
																															});	
																		
																										
																										//Find the supplier
																										//
																										var supplierId = findSupplier(lineSupplier, supplierSuffixParam);
																										
																										if(supplierId != null && supplierId != '')
																											{
																												//Add the supplier sublist
																												//
																												itemRecord.selectNewLine({
																																		sublistId:	'itemvendor'
																																		});
																											
																												itemRecord.setCurrentSublistValue({
																																					sublistId: 	'itemvendor',
																																					fieldId: 	'vendor',
																																					value: 		supplierId
																																					});
																												
																												itemRecord.setCurrentSublistValue({
																																					sublistId: 	'itemvendor',
																																					fieldId: 	'preferredvendor',
																																					value: 		true
																																					});
																												
																												itemRecord.setCurrentSublistValue({
																																					sublistId: 	'itemvendor',
																																					fieldId: 	'purchaseprice',
																																					value: 		linePoPrice
																																					});
																				
																												itemRecord.commitLine({
																																		sublistId: 'itemvendor'
																																		});
																											
																												//Save the item record
																												//
																												itemId = itemRecord.save({	
																																		enableSourcing:			true,
																																		ignoreMandatoryFields:	true
																																		});
																											}
																										else
																											{
																												emailMessage += 'Cannot find supplier "' + lineSupplier + '" while attempting to create product with code ' + lineProduct + ' for order # '+ headerOrderNo + ' - Line not added to order\n\n';
																											}
																									}
																								catch(err)
																									{
																										log.error({
																													title: 		'Error creating new inventory item - ' + lineProduct,
																													details: 	err
																													});
																							
																										emailMessage += 'Error creating new inventory item - ' + lineProduct + ' - ' + err.message + '\n\n';
																									}
																							
																							}
																						
																						//If we have an item we can add it
																						//
																						if(itemId != null)
																							{
																								//Find the supplier
																								//
																								var supplierId = findSupplier(lineSupplier, supplierSuffixParam);
																							
																								//Only add the line if we have found the supplier
																								//
																								if(supplierId != null)
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
																															    				fieldId: 	'rate',
																															    				value: 		lineSalesRate
																															    				});
																	
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'amount',
																															    				value: 		lineSalesAmount
																															    				});
								
																										//If we have found the supplier then we can explicitly set it
																										//
																										if(supplierId != null)
																											{
																												salesOrderRecord.setCurrentSublistValue({
																																	    				sublistId: 	'item',
																																	    				fieldId: 	'povendor',
																																	    				value: 		supplierId
																																	    				});
																											}
																										
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'porate',
																															    				value: 		linePoPrice
																															    				});
							
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'costestimatetype',
																															    				value: 		'CUSTOM'
																															    				});
																										
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'costestimaterate',
																															    				value: 		linePoPrice
																															    				});
							
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'createpo',
																															    				value: 		'DropShip'
																															    				});
																										
																										salesOrderRecord.setCurrentSublistValue({
																						    													sublistId: 	'item',
																						    													fieldId: 	'custcol_bbs_sales_trx_ponumber',
																						    													value: 		linePoNumber
																						    													});
		
								
																										salesOrderRecord.commitLine({
																																	sublistId: 	'item'
																																	});
																									}
																								else
																									{
																										emailMessage += 'Cannot find supplier "' + lineSupplier + '" for product with code ' + lineProduct + ' for order # '+ headerOrderNo + ' - Line not added to order\n\n';
																									}
																							}
																						else
																							{
																								emailMessage += 'Unable to add product with code ' + lineProduct + ' for order # '+ headerOrderNo + '\n\n';
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
																
																break;
																
															case '2': 	//Orders - B2B
																
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
																				var rawDateArray 		= output.Order.OrderHeader.OrderDate.substring(0,output.Order.OrderHeader.OrderDate.indexOf('T')).split('-');
																				var headerOrderNo 		= getDataElement(output, 'output.Order.OrderHeader.ExternalSystemOrderNo');
																				var headerCoName 		= getDataElement(output, 'output.Order.OrderHeader.CompanyInformation.Name');
																				var headerContactName 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Name');
																				var headerContactPhone 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Phone');
																				var headerContactEmail 	= getDataElement(output, 'output.Order.OrderHeader.ContactInformation.Email');
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
																				var headerDateString 	= rawDateArray[2] + '/' + rawDateArray[1] + '/' + rawDateArray[0];
																				var headerDate 			= format.parse({value: headerDateString, type: format.Type.DATE});
																				
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
																											fieldId:	'custbody_bbs_weborderref',
																											value:		headerOrderNo
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'trandate',
																											value:		headerDate
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'orderstatus',
																											value:		'A'					//Pending Approval
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'paymentmethod',
																											value:		integrationPaymentMethod					
																											});
																				
																				salesOrderRecord.setValue({
																											fieldId:	'cseg_bbs_division',
																											value:		integrationDivision					
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
																						var lineProduct 			= output.Order.OrderLines[int2].ProductLine.ManufacturerArticleNo;
																						var lineDescription			= output.Order.OrderLines[int2].ProductLine.Label;
																						var lineSupplierAricleNo	= output.Order.OrderLines[int2].ProductLine.SupplierArticleNo;
																						var lineQuantity 			= output.Order.OrderLines[int2].ProductLine.Quantity;
																				//		var lineSupplier 			= output.Order.OrderLines[int2].ProductLine.Supplier;
																						var lineSupplier 			= output.Order.OrderLines[int2].ProductLine.SupplierExportId;
																						var linePoNumber			= output.Order.OrderLines[int2].ProductLine.PurchaseOrderNumber;
																						var linePoPrice 			= output.Order.OrderLines[int2].ProductLine.Price;
																						var lineSalesRate 			= output.Order.OrderLines[int2].ProductLine.SalesPrice.ExclusiveVAT;
																						var lineSalesAmount 		= output.Order.OrderLines[int2].ProductLine.TotalPrice.ExclusiveVAT;
																						
																						//lineSalesRate = Number(lineSalesRate);
																						//lineSalesRate = Math.round(lineSalesRate * 100) / 100;
																						
																						//linePoPrice = Number(linePoPrice);
																						//linePoPrice = Math.round(linePoPrice * 100) / 100;
																						
																						//lineSalesAmount = Number(lineSalesAmount);
																						//lineSalesAmount = Math.round(lineSalesAmount * 100) / 100;
																						
																						
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
																						
																						//If the item was not found, then we need to create one
																						//
																						if(itemId == null)
																							{
																								try
																									{
																										var itemRecord = record.create({
																																		type:		record.Type.INVENTORY_ITEM,
																																		isDynamic:	true
																																		});		
																										
																										itemRecord.setValue({
																															fieldId:	'itemid',
																															value:		lineProduct
																															});	
																						
																										itemRecord.setValue({
																															fieldId:	'isdropshipitem',
																															value:		true
																															});
																										
																										itemRecord.setValue({
																															fieldId: 	'offersupport',
																															value: 		true
																															});
																						
																										itemRecord.setValue({
																															fieldId:	'purchasedescription',
																															value:		lineDescription
																															});	
																																	
																										itemRecord.setValue({
																															fieldId:	'salesdescription',
																															value:		lineDescription
																															});	
																		
																										itemRecord.setValue({
																															fieldId:	'mpn',
																															value:		lineProduct
																															});	
																		
																										
																										//Find the supplier
																										//
																										var supplierId = findSupplier(lineSupplier, supplierSuffixParam);
																										
																										if(supplierId != null && supplierId != '')
																											{
																												//Add the supplier sublist
																												//
																												itemRecord.selectNewLine({
																																		sublistId:	'itemvendor'
																																		});
																											
																												itemRecord.setCurrentSublistValue({
																																					sublistId: 	'itemvendor',
																																					fieldId: 	'vendor',
																																					value: 		supplierId
																																					});
																												
																												itemRecord.setCurrentSublistValue({
																																					sublistId: 	'itemvendor',
																																					fieldId: 	'preferredvendor',
																																					value: 		true
																																					});
																												
																												itemRecord.setCurrentSublistValue({
																																					sublistId: 	'itemvendor',
																																					fieldId: 	'purchaseprice',
																																					value: 		linePoPrice
																																					});
																				
																												itemRecord.commitLine({
																																		sublistId: 'itemvendor'
																																		});
																											
																												//Save the item record
																												//
																												itemId = itemRecord.save({	
																																		enableSourcing:			true,
																																		ignoreMandatoryFields:	true
																																		});
																											}
																										else
																											{
																												emailMessage += 'Cannot find supplier "' + lineSupplier + '" while attempting to create product with code ' + lineProduct + ' for order # '+ headerOrderNo + ' - Line not added to order\n\n';
																											}
																									}
																								catch(err)
																									{
																										log.error({
																													title: 		'Error creating new inventory item - ' + lineProduct,
																													details: 	err
																													});
																							
																										emailMessage += 'Error creating new inventory item - ' + lineProduct + ' - ' + err.message + '\n\n';
																									}
																							
																							}
																						
																						//If we have an item we can add it
																						//
																						if(itemId != null)
																							{
																								//Find the supplier
																								//
																								var supplierId = findSupplier(lineSupplier, supplierSuffixParam);
																							
																								//Only add the line if we have found the supplier
																								//
																								if(supplierId != null)
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
																															    				fieldId: 	'rate',
																															    				value: 		lineSalesRate
																															    				});
																	
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'amount',
																															    				value: 		lineSalesAmount
																															    				});
								
																										//If we have found the supplier then we can explicitly set it
																										//
																										if(supplierId != null)
																											{
																												salesOrderRecord.setCurrentSublistValue({
																																	    				sublistId: 	'item',
																																	    				fieldId: 	'povendor',
																																	    				value: 		supplierId
																																	    				});
																											}
																										
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'porate',
																															    				value: 		linePoPrice
																															    				});
							
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'costestimatetype',
																															    				value: 		'CUSTOM'
																															    				});
																										
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'costestimaterate',
																															    				value: 		linePoPrice
																															    				});
							
																										salesOrderRecord.setCurrentSublistValue({
																															    				sublistId: 	'item',
																															    				fieldId: 	'createpo',
																															    				value: 		'DropShip'
																															    				});
																										
																										salesOrderRecord.setCurrentSublistValue({
													    																						sublistId: 	'item',
													    																						fieldId: 	'custcol_bbs_sales_trx_ponumber',
													    																						value: 		linePoNumber
													    																						});
		
								
																										salesOrderRecord.commitLine({
																																	sublistId: 	'item'
																																	});
																									}
																								else
																									{
																										emailMessage += 'Cannot find supplier "' + lineSupplier + '" for product with code ' + lineProduct + ' for order # '+ headerOrderNo + ' - Line not added to order\n\n';
																									}
																							}
																						else
																							{
																								emailMessage += 'Unable to add product with code ' + lineProduct + ' for order # '+ headerOrderNo + '\n\n';
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
																
																break;
																
															case '3':	//Products
																
																var fileProcessedOk = true;
																
																//Do we have a file to process
																//
																if(downloadedFile != null)
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
											    								
											    								fileId 			= null;
											    								fileProcessedOk = false;
											    							}
																		
											    						if(fileId != null)
											    							{
											    							
											    								//Read through the file to split it into 10k lines each
											    								//
												    							var iterator 		= downloadedFile.lines.iterator();
												    		    				var fileHeader 		= '';
												    		    				var filePartCounter	= Number(1);
												    		    				var filePart 		= null;
												    		    				var lineCounter 	= Number(0);
												    			    	        
												    			    			//Get the first line (CSV header)
												    			    			//
												    			    	        iterator.each(function (line) 
												    			    	        	{
												    			    	        		fileHeader = line.value;
												    			    	        		return false;
												    			    	        	});
												    			    	        
												    			    	        //Create the first part of the file
												    			    	        //
												    			    	        filePart 			= file.create({
												    			    	        									name:		'Product File Part ' + filePartCounter.toString(),
												    			    	        									fileType:	file.Type.CSV
												    			    	        									});
												    			    	        
												    			    	        //Add the header line to the current file part
								    				    	            		//
								    				    	            		filePart.appendLine({value: fileHeader});
								    				    	            		
												    			    	        //Process the rest of the lines
												    			    	        //
												    			    	        iterator.each(function (line)
												    				    	        {	
												    			    	        		//Increment the line counter
												    			    	        		//
												    			    	        		lineCounter++;
												    			    	        		
												    			    	        		//Get the line contents
												    			    	        		//
												    				    	            var lineValues = line.value;
												    				    	            
												    				    	            //Are we less than 10k rows?
												    				    	            //
												    				    	            if(lineCounter < 10000)
												    				    	            	{	
												    				    	            		//Add the current line to the current file part
												    				    	            		//
												    				    	            		filePart.appendLine({value: lineValues});
												    				    	            	}
												    				    	            else
												    				    	            	{
												    				    	            		//If we have reached the 10k mark, then submit this file & start a new one
												    				    	            		//
													    				    	            	var csvImportTask = task.create({
															    																taskType:		task.TaskType.CSV_IMPORT,
															    																importFile:		filePart,
															    																mappingId:		'custimport_bbs_product_import'
															    																});
															    								
															    								//Submit the job
															    								//
															    								var csvTaskId = csvImportTask.submit();
															    								
															    								//Reset the line counter
															    								//
															    								lineCounter 	= Number(1);
															    								
															    								//Increment the file part counter
															    								//
															    								filePartCounter++;
															    								
															    								//Create a new file part
															    								//
															    								filePart 			= file.create({
																    			    	        									name:		'Product File Part ' + filePartCounter.toString(),
																    			    	        									fileType:	file.Type.CSV
																    			    	        									});
															    								
															    								//Add the header line to the current file part
												    				    	            		//
												    				    	            		filePart.appendLine({value: fileHeader});
												    				    	            		
															    								//Add the current line to the current file part
												    				    	            		//
												    				    	            		filePart.appendLine({value: lineValues});
												    				    	            	}
												    				    	            
												    				    	            return true;
												    				    	          });
												    			    	        
												    			    	        //Process the last file part
												    			    	        //
												    			    	        var csvImportTask = task.create({
											    																taskType:		task.TaskType.CSV_IMPORT,
											    																importFile:		filePart,
											    																mappingId:		'custimport_bbs_product_import'
											    																});
				    								
											    								//Submit the last job
											    								//
											    								var csvTaskId = csvImportTask.submit();
				    								
											    								/*
											    								//Wait until the job has finished
											    								//
											    								var csvTaskStatus = task.checkStatus({
			    								    																taskId: csvTaskId
			    								    																});
											    								
											    								while (csvTaskStatus.status == task.TaskStatus.PENDING || csvTaskStatus.status == task.TaskStatus.PROCESSING) 
												    								{
											    										sleep(60000);	//sleep 60 seconds
											    										
												    									csvTaskStatus = task.checkStatus({
													    								    								taskId: csvTaskId
													    								    							});
												    							
																					}
											    								
											    								
												    							//Submit the map/reduce job to process the custom record data that has been populated by the csv imports
																				//
											    								
											    								try
											    									{
																						var mrTask = task.create({
																												taskType:		task.TaskType.MAP_REDUCE,
																												scriptId:		'customscript_bbs_sft_product_mr',	
																												deploymentid:	null,
																												params:			{
																																	custscript_bbs_sftp_product_file_id:	fileId,
																																	custscript_bbs_sftp_config_id:			integrationId
																																}
																						});
																						
																						mrTask.submit();
											    									}
											    								catch(err)
											    									{
												    									log.error({
													    											title: 		'Error submitting mr script',
													    											details: 	err
													    											});	
											    								
												    									emailMessage += 'Error Submitting MR Script To Process Product File id = ' + fileId + ' - ' + err.message + '\n\n';
												    									fileProcessedOk = false;
											    									}
											    								*/
											    								
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
																
																break;
														}
												}
											else
												{
													break;
												}
										}
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
					else
						{
							log.error({
										title: 		'Error - unable to find configuration record',
										details: 	''
										});
						}
			    }
    		else
    			{
	    			log.error({
								title: 		'No integration type specified in deployment parameters',
								details: 	''
								});
    			}
	    }

    //Find cash sale customer by email address
    //
    function findOrCreateCustomer(_headerContactEmail, _integrationCashSaleCust, _division, _contactName, _address1, _address2, _city, _county, _postCode, _customForm, _phone, _mobile)
    	{
    		var customerSearchObj 	= null;
    		var customerId			= _integrationCashSaleCust;	//Default returned customer to be the built in one
    		
    		//Try to find the customer by email address
    		//
    		try
    			{
	    			customerSearchObj = getResults(search.create({
										    				   type: 		"customer",
										    				   filters:
													    				   [
													    				      ["email","is",_headerContactEmail]
													    				   ],
										    				   columns:
													    				   [
													    				      search.createColumn({name: "entityid",sort: search.Sort.ASC,label: "Name"})
													    				   ]
										    				}));
    				
    			}
    		catch(err)
    			{
	    			log.error({
								title: 		'Error searching for customer by email address',
								details: 	err
								});
	    			
	    			customerSearchObj = null;
    			}
    		
    		if(customerSearchObj != null && customerSearchObj.length > 0)
    			{
    				//If we have found at least one record then take the first one we find
    				//
    				customerId = customerSearchObj[0].id;
    			}
    		else
    			{
    				//Try & create a new customer
    				//
    				var createdCustomerId 		= null;
    				var createdCustomerRecord	= null;
    				
    				try
    					{
    						createdCustomerRecord = record.create({
	    															type:		record.Type.CUSTOMER,
	    															isDynamic:	true
																	});		

    						if(_customForm != null && _customForm != '')
    							{
		    						createdCustomerRecord.setValue({
																	fieldId:	'customform',
																	value:		_customForm
																	});	
    							}

    						createdCustomerRecord.setValue({
															fieldId:	'isperson',
															value:		'T'	
															});	

    						createdCustomerRecord.setValue({
															fieldId:	'cseg_bbs_division',
															value:		_division	//Division from config record
															});	

    						createdCustomerRecord.setValue({
															fieldId:	'firstname',
															value:		'CASH SALE'
															});	

    						createdCustomerRecord.setValue({
															fieldId:	'lastname',
															value:		_contactName
															});	

    						createdCustomerRecord.setValue({
															fieldId:	'name',
															value:		'CASH SALE ' + _contactName
															});	

    						if(_headerContactEmail != null && _headerContactEmail != '')
								{
		    						createdCustomerRecord.setValue({
																	fieldId:	'email',
																	value:		_headerContactEmail		
																	});	
								}
    						
    						if(_phone != null && _phone != '')
								{
		    						createdCustomerRecord.setValue({
																	fieldId:	'phone',
																	value:		_phone		
																	});	
								}
						
    						if(_mobile != null && _mobile != '')
								{
		    						createdCustomerRecord.setValue({
																	fieldId:	'mobilephone',
																	value:		_mobile		
																	});	
								}
						
    						createdCustomerRecord.setValue({
															fieldId:	'terms',
															value:		4				//0 Net
															});	
    						
    						createdCustomerRecord.setValue({
															fieldId:	'category',
															value:		3				//Prepayment
															});	
    						
    						
    						// add a new line to the address sublist
    						createdCustomerRecord.selectNewLine({
								    	    					sublistId: 'addressbook'
								    	    					});
    	    				
    	    				// select the address subrecord
    	    				var addressSubrecord = createdCustomerRecord.getCurrentSublistSubrecord({
																	    	    				    sublistId: 'addressbook',
																	    	    				    fieldId: 'addressbookaddress'
																	    	    					});
    	    				
    	    				// set fields on the sublist record
    	    				addressSubrecord.setValue({
						    	    					fieldId: 	'defaultbilling',
						    	    					value: 		true
						    	    				});
    	    				
    	    				addressSubrecord.setValue({
						    	    					fieldId: 	'defaultshipping',
						    	    					value: 		true
						    	    				});
    	    				
    	    				addressSubrecord.setValue({
						    	    					fieldId: 	'addr1',
						    	    					value: 		_address1
						    	    				});
    	    				
    	    				addressSubrecord.setValue({
						    	    					fieldId: 	'addr2',
						    	    					value: 		_address2
						    	    				});
    	    				
    	    				addressSubrecord.setValue({
						    	    					fieldId: 	'city',
						    	    					value: 		_city
						    	    				});
    	    				
    	    				addressSubrecord.setValue({
						    	    					fieldId: 	'state',
						    	    					value: 		_county
						    	    				});
    	    				
    	    				addressSubrecord.setValue({
						    	    					fieldId: 	'zip',
						    	    					value: 		_postCode
						    	    				});
    	    				
    	    				createdCustomerRecord.commitLine({
								    							sublistId: 'addressbook'
								    						});
    						
    						createdCustomerId = createdCustomerRecord.save({
					    													enableSourcing:			true,
					    													ignoreMandatoryFields:	true
					    													});								
    					}
    				catch(err)
    					{
    						createdCustomerId = null;
    					
	    					log.error({
										title: 		'Error creating new customer',
										details: 	err
										});
    					}
    			
    				if(createdCustomerId != null)
    					{
    						//If we did create a new customer then pass back the internal id
    						//
    						customerId = createdCustomerId;
    					}
    			}
    		
    		//Return the customer id
    		//
    		return customerId;
    	}
    
    //Sleep 
    //
    function sleep(milliseconds) 
	    {
	    	  const date = Date.now();
	    	  
	    	  var currentDate = null;
	
	    	  do{ currentDate = Date.now();
	    		  } while (currentDate - date < milliseconds);
	    }
    
    
    //Find the supplier
    //
    function findSupplier(_supplier, _supplierSuffixParam)
    	{
    		var supplierId = null;
    		//var supplerSearch = (_supplier == 'Ingram Micro' ? _supplier : _supplier + ' ' + _supplierSuffixParam);
    		var supplerSearch = _supplier + ' ' + _supplierSuffixParam;
    		
	    	var vendorSearchObj = getResults(search.create({
				   type: 	"vendor",
				   filters:
							   [
							      ["entityid","is",supplerSearch]
							   ],
				   columns:
							   [
							      search.createColumn({
											         name: 	"entityid",
											         sort: 	search.Sort.ASC,
											         label: "Name"
							      					})
							   ]
				}));
	
			if(vendorSearchObj != null && vendorSearchObj.length >= 1)
				{	
					supplierId = vendorSearchObj[0].id;
				}
			    	
			return supplierId;
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
			    								       try
			    								       		{
			    								    	   		eval(cmd.replace('\n',''));
			    								       		}
			    								       catch(err)
			    								       		{
			    								    	   
			    								       		}
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
			    				  	  				
			    				  	  				try
			    				  	  					{
			    				  	  						eval(cmd.replace('\n',''));
			    				  	  					}
			    				  	  				catch(err)
			    				  	  					{
			    				  	  					
			    				  	  					}
			    				  	  				
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
			    					  	  		
			    				  	  		try
			    				  	  			{
			    				  	  				eval(cmd.replace('\n',''));
			    				  	  			}
			    				  	  		catch(err)
			    				  	  			{
			    				  	  			
			    				  	  			}
			    				  	  		
			    					  	  	var firstAttribute = true;
			    					  	  	
			    					  	  	for(var attribute in c)
			    								{
			    					  	  			if(firstAttribute)
			    					  	  				{
			    					  	  					var cmd = "_output." + path + ".attributes = {}";
			    					  	  					
			    					  	  					try
			    					  	  						{
			    					  	  							eval(cmd.replace('\n',''));
			    					  	  						}
			    					  	  					catch(err)
			    					  	  						{
			    					  	  						
			    					  	  						}
			    					  	  					
			    					  	  					firstAttribute = false;
			    					  	  				}
			    					  	  			
			    								       var attributeValue = _nodes[int].getAttribute({name : attribute});
			    								       var attributeName = '@' + attribute;
			    								       var cmd = "_output." + path + ".attributes['" + attributeName + "'] = '" + attributeValue + "'";
			    								       
			    								       try
				    								       	{
				    								    	   eval(cmd.replace('\n',''));
				    								       	}
			    								       catch(err)
			    								       		{
			    								    	   
			    								       		}
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
			    						
			    						try
			    							{
			    								eval(cmd.replace('\n',''));
			    							}
			    						catch(err)
			    							{
			    							
			    							}
			    						
			    						//log.debug({title: path + ' = ' + value});
			    					}
			    	    }
			    }
	    }
    
    return {execute: execute};

});
