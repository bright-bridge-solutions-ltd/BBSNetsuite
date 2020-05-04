/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
	
define(['N/runtime', 'N/file', 'N/search', 'N/record', 'N/url', 'N/email', 'N/config'],
function(runtime, file, search, record, url, email, config) 
{
	var columnsEnum = new columnNames();

	function columnNames()
		{
			this.id						= 0;
			this.title					= 1;
			this.description 			= 2;
			this.googleProductCategory	= 3;
			this.link					= 4;
			this.imageLink				= 5;
			this.condition				= 6;
			this.availability			= 7;
			this.mpn					= 8;
			this.price					= 9;
			this.brand					= 10;
			this.gtin					= 11;
			this.productType			= 12;
			this.shipping				= 13;
		}
	
	function productSummary(_id, _mpn, _description, _url, _price)
		{
			this.id				= _id;
			this.mpn			= _mpn;
			this.description	= _description;
			this.url			= _url;
			this.price			= _price;
		}
	
	
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1 
     */
    function getInputData() 
	    { 
    		try
    			{
	    			return search.create({
	    				   type: "customrecord_bbs_comet_product_import",
	    				   filters:
	    				   [
	    				   ],
	    				   columns:
	    				   [
	    				      "custrecord_bbs_comet_pi_id",
	    				      "custrecord_bbs_comet_pi_title",
	    				      "custrecord_bbs_comet_pi_description",
	    				      "custrecord_bbs_comet_pi_category",
	    				      "custrecord_bbs_comet_pi_link",
	    				      "custrecord_bbs_comet_pi_image",
	    				      "custrecord_bbs_comet_pi_condition",
	    				      "custrecord_bbs_comet_pi_availability",
	    				      "custrecord_bbs_comet_pi_mpn",
	    				      "custrecord_bbs_comet_pi_price",
	    				      "custrecord_bbs_comet_pi_brand",
	    				      "custrecord_bbs_comet_pi_gtin",
	    				      "custrecord_bbs_comet_pi_prod_type",
	    				      "custrecord_bbs_comet_pi_shipping"
	    				   ]
	    				});

    			}
    		catch(err)
				{
					logMsg('E', 'An Unexpected Error Occured in getInputData', err);
				}
	    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
	    {
    		try
    			{
	    			//Retrieve search results
    				//
	    	    	var searchResult 	= JSON.parse(context.value);
	    	    	var lineNumber		= context.key;
			    	
	    	    	var columns 	= [];
	    	    	var internalId 	= searchResult.id;
	    	    	
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_id']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_title']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_description']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_category']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_link']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_image']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_condition']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_availability']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_mpn']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_price']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_brand']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_gtin']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_prod_type']);
	    	    	columns.push(searchResult.values['custrecord_bbs_comet_pi_shipping']);
	    	    	
	    	    	//Process the line data
	    	    	//
	    	    	processsLineData(columns, context);
	    	    	
    			}
    		catch(err)
    			{
    				logMsg('E', 'An Unexpected Error Occured Processing Line ' + lineNumber + ' MPN ' + searchResult.values['custrecord_bbs_comet_pi_mpn'], err);
    			}
    		finally
    			{
	    			//Delete the data from the custom record
	    	    	//
	    	    	record.delete({
	    	   						type:	'customrecord_bbs_comet_product_import',
	    	    					id:		internalId
	    	    					});
    			}
	    }

    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) 
	    {
    		try
    			{
	    			//Load the company config
	    	    	//
    				var companyConfigRecord = null;
    				
	    	    	try
	    	    		{
	    	    			companyConfigRecord = config.load({type: config.Type.COMPANY_INFORMATION});
	    	    		}
	    	    	catch(err)
	    	    		{
	    	    			companyConfigRecord = null;
	    	    			logMsg('E', 'Error loading company config record', err);
	    	    		}
	    	    	
	    	    	//If we got the company config ok
	    	    	//
	    	    	if(companyConfigRecord != null)
	    	    		{
		    	    		var accountId = companyConfigRecord.getValue({fieldId: 'companyid'});
			    			var urlPrefix = 'https://' + accountId.replace('_','-') + '.app.netsuite.com';
					    	
				    		//Get the parameter holding the integration record id
				    		//
				    		var integrationId = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_sftp_config_id'});
				    		
				    		if(integrationId != null && integrationId != '')
				    			{
				    				//Load the config record to get the email details
				    				//
				    				var integrationRecord = null;
				    			
				    				try
				    					{
				    						integrationRecord = record.load({
						    												type:	'customrecord_bbs_comet_integration',
						    												id:		integrationId
						    												});
				    					}
				    				catch(err)
				    					{
				    						integrationRecord = null;
				    						logMsg('E', 'Error loading config record', err);
				    					}
						    		
				    				//Did we load the integration record ok?
				    				//
				    				if(integrationRecord != null)	
				    					{
				    						var emailSender 		= integrationRecord.getValue({fieldId: 'custrecord_bbs_comet_email_sender'});
				    						var emailRecipients 	= integrationRecord.getValue({fieldId: 'custrecord_bbs_comet_email_recipients'});
										
				    						var emailMsg = 'The following products have been created in Netsuite from website product integration\n\n\n';
				    						
				    						summary.output.iterator().each(function (key, value)
				    				    	        {
				    									var productInfo = JSON.parse(value);
				    									
				    									emailMsg += 'Internal Id : ' 	+ productInfo.id + '\n';
				    									emailMsg += 'MPN : ' 			+ productInfo.mpn + '\n';
				    									emailMsg += 'Price : ' 			+ productInfo.price + '\n';
				    									emailMsg += 'URL : ' 			+ urlPrefix + productInfo.url + '\n\n\n';
				    							//		emailMsg += 'Description ' 		+ productInfo.description + '\n';
				    									
				    				    	            return true;
				    				    	        });
								    		
				    						try
												{
													email.send({
													            author: 		emailSender,
													            recipients: 	emailRecipients.split(';'),
													            subject: 		'New Products Created From Website Integration',
													            body: 			emailMsg,
													        	});
												}
											catch(err)
												{
													logMsg('E', 'Error sending email notification', err);
												}
				    					}
				    			}
	    	    		}
    			}
    		catch(err)
				{
					logMsg('E', 'An Unexpected Error Occured In The Summarize Section', err);
				}
	    }

	
    //Helper functions
	//
	function processsLineData(_columns, _context)
		{
			//Only process if the item has a mpn
			//
			if(_columns[columnsEnum.mpn] != '')
				{
					var itemId = findItem(_columns[columnsEnum.mpn]);
					
					//If not found, then we need to create it
					//
					if(!itemId)
						{
							var itemExternalId 		= _columns[columnsEnum.mpn] + '_' + _columns[columnsEnum.id];
							var itemDisplayName 	= _columns[columnsEnum.title];
							var itemDescription		= _columns[columnsEnum.description];
							var itemProductCategory	= lookupProductCategory(_columns[columnsEnum.googleProductCategory].replace(/>/g,":").replace(/&gt;/g,':'));
							var itemWebsiteLink		= _columns[columnsEnum.link];
							var itemImage			= _columns[columnsEnum.imageLink];
							var itemCondition		= _columns[columnsEnum.condition];
							var itemAvailability	= _columns[columnsEnum.availability];
							var itemMpn				= _columns[columnsEnum.mpn];
							var itemPrice			= _columns[columnsEnum.price].replace(',','.').replace(' GBP','');
							var itemBrand			= lookupItemBrand(_columns[columnsEnum.brand]);
							var itemGtin			= _columns[columnsEnum.gtin];
							var itemProductType		= lookupProductType(_columns[columnsEnum.productType].replace(/>/g,":").replace(/&gt;/g,':'));
							var itemSupplier		= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_sftp_product_supplier'});

							//Create the new product
							//
							var itemRecord = record.create({
															type:		record.Type.INVENTORY_ITEM,
															isDynamic:	true
															});
							
							itemRecord.setValue({
												fieldId:	'externalid',
												value:		itemExternalId
												});	

							itemRecord.setValue({
												fieldId:	'itemid',
												value:		itemMpn
												});	

							itemRecord.setValue({
												fieldId:	'displayname',
												value:		itemDisplayName.substr(0,250)
												});	

							itemRecord.setValue({
												fieldId:	'purchasedescription',
												value:		itemDescription.substr(0,250)
												});	
														
							itemRecord.setValue({
												fieldId:	'salesdescription',
												value:		itemDescription.substr(0,250)
												});	

							itemRecord.setValue({
												fieldId:	'storedescription',
												value:		itemDescription.substr(0,250)
												});	
							
							itemRecord.setValue({
												fieldId:	'class',
												value:		itemProductCategory
												});	

							itemRecord.setValue({
												fieldId:	'custitem_bbs_websitelink',
												value:		itemWebsiteLink
												});	

							itemRecord.setValue({
												fieldId:	'custitem_bbs_item_condition',
												value:		itemCondition
												});	

							itemRecord.setValue({
												fieldId:	'custitem_bbs_item_availability',
												value:		itemAvailability
												});	

							itemRecord.setValue({
												fieldId:	'mpn',
												value:		itemMpn
												});	

							itemRecord.setValue({
												fieldId:	'custitem_bbs_brand',
												value:		itemBrand
												});	

							itemRecord.setValue({
												fieldId:	'custitem_bbs_item_gtin',
												value:		itemGtin
												});	

							itemRecord.setValue({
												fieldId:	'department',
												value:		itemProductType
												});	

				
							itemRecord.setValue({
												fieldId:	'isdropshipitem',
												value:		true
												});	

							//Add the supplier sublist
							//
							itemRecord.selectNewLine({
													sublistId:	'itemvendor'
													});
							
							itemRecord.setCurrentSublistValue({
																sublistId: 	'itemvendor',
																fieldId: 	'vendor',
																value: 		itemSupplier
																});
							
							itemRecord.setCurrentSublistValue({
																sublistId: 	'itemvendor',
																fieldId: 	'preferredvendor',
																value: 		true
																});
							
							itemRecord.setCurrentSublistValue({
																sublistId: 	'itemvendor',
																fieldId: 	'purchaseprice',
																value: 		itemPrice
																});
				
							itemRecord.commitLine({
													sublistId: 'itemvendor'
													});
							
							//Save the new item
							//
							var itemId = itemRecord.save({	
														enableSourcing:			true,
														ignoreMandatoryFields:	true
														});
							
							var itemUrl = url.resolveRecord({
															recordType:		'inventoryitem',
															recordId:		itemId,
															isEditMode:		false
															});
							
							//Add details of the new product to the key/value pairs to be passed to the summarise section
							//
							_context.write({
											key:	itemId,
											value:	new productSummary(itemId, itemMpn, itemDisplayName, itemUrl, itemPrice)
											});
						}
				}
			else
				{
					logMsg('E', 'Product skipped, no mpn', '');
				}
		}
    
	
	//Lookup the product brand
	//
	function lookupItemBrand(_brand)
		{
			var brandId = null;
			
			var brandSearchObj = getResults(search.create({
																   type: 		"customlist_bbs_brandlist",
																   filters:
																			   [
																			      ["name","is",_brand]
																			   ],
																   columns:
																			   [
																			      search.createColumn({
																								         name: 	"name",
																								         sort: 	search.Sort.ASC,
																								         label: "Name"
																								      })
																			   ]
																}));


			if(brandSearchObj != null && brandSearchObj.length > 0)
				{
					brandId = brandSearchObj[0].id;
				}
			
			return brandId;
		}
	
	
	//Lookup the product category
	//
	function lookupProductCategory(_category)
		{
			var categoryId = null;
			
			if(_category != '')
				{
					//Search for the product category using the full heirarchical name
					//
					var classificationSearchObj = getResults(search.create({
																		   type: 		"classification",
																		   filters:
																					   [
																					      ["name","is",_category]
																					   ],
																		   columns:
																					   [
																					      search.createColumn({
																										         name: 	"name",
																										         sort: 	search.Sort.ASC,
																										         label: "Name"
																										      })
																					   ]
																		}));
		
					
					if(classificationSearchObj != null && classificationSearchObj.length > 0)
						{
							categoryId = classificationSearchObj[0].id;
						}
					else
						{
							//If we did not find it, then try finding it by just using the last portion of the name
							//
							var lastPart = _category.split(' : ')[_category.split(' : ').length -1];
							
							var classificationSearchObj = getResults(search.create({
																				   type: 		"classification",
																				   filters:
																							   [
																							      ["name","contains",lastPart]
																							   ],
																				   columns:
																							   [
																							      search.createColumn({
																												         name: 	"name",
																												         sort: 	search.Sort.ASC,
																												         label: "Name"
																												      })
																							   ]
																				}));
		
		
							if(classificationSearchObj != null && classificationSearchObj.length > 0)
								{
									categoryId = classificationSearchObj[0].id;
								}
						}
				}
			
			if(categoryId == null)
				{
					logMsg('D', 'Could not find product category "' + _category + '"', null);
				}
			
			return categoryId;
		}

	
	//Lookup the product type
	//
	function lookupProductType(_type)
		{
			var typeId = null;
			
			if(_type != '')
				{
					//Search for the product category using the full heirarchical name
					//
					var departmentSearchObj = getResults(search.create({
																		   type: 		"department",
																		   filters:
																					   [
																					      ["name","is",_type]
																					   ],
																		   columns:
																					   [
																					      search.createColumn({
																										         name: 	"name",
																										         sort: 	search.Sort.ASC,
																										         label: "Name"
																										      })
																					   ]
																		}));
		
					
					if(departmentSearchObj != null && departmentSearchObj.length > 0)
						{
							typeId = departmentSearchObj[0].id;
						}
					else
						{
							//If we did not find it, then try finding it by just using the last portion of the name
							//
							var lastPart = _type.split(' : ')[_type.split(' : ').length -1];
							
							var departmentSearchObj = getResults(search.create({
																				   type: 		"department",
																				   filters:
																							   [
																							      ["name","contains",lastPart]
																							   ],
																				   columns:
																							   [
																							      search.createColumn({
																												         name: 	"name",
																												         sort: 	search.Sort.ASC,
																												         label: "Name"
																												      })
																							   ]
																				}));
		
		
							if(departmentSearchObj != null && departmentSearchObj.length > 0)
								{
									typeId = departmentSearchObj[0].id;
								}
						}
				}
			
			if(typeId == null)
				{
					logMsg('D', 'Could not find product type "' + _type + '"', null);
				}
			
			return typeId;
		}
	

	//Find item by using the manufacturer's part number
	//
	function findItem(_mpn)
		{
			//Find item 
			//
			var itemId = null;
			
			var itemSearchObj = getResults(search.create({
														   type: "item",
														   filters:
														   [
														      ["name","is",_mpn]
														   ],
														   columns:
														   [
														      search.createColumn({name: "itemid", label: "Name"}),
														      search.createColumn({name: "displayname", label: "Display Name"})
														   ]
														}));
			
			if(itemSearchObj != null && itemSearchObj.length > 0)
				{	
					itemId = itemSearchObj[0].id;
				}
			
			return itemId;
		}
    
	//Logging
	//
	function logMsg(_severity, _title, _detail)
		{
			switch(_severity)
				{
					case 'D':
						log.debug({
									title: 		_title,
									details: 	_detail
									});
						break;
						
					case 'E':
						log.error({
									title: 		_title,
									details: 	_detail
									});
						break;
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
    
    
    //Return functions to calling routine
	//
    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        summarize: 		summarize
    		};
    
});
