/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search','N/record'],

function(search, record) 
{
   
	function libCreateSession()
		{
			var uniqueId = Number(Date.now()).toFixed(0).toString();
			
			var paramsRecord = record.create({
											type:		'customrecord_bbs_internal_params',
											isDynamic:	true
											});
					
			paramsRecord.setValue({
									fieldId:	'custrecord_bbs_params_id', 
									value:		uniqueId
									});
			
			var sessionId = paramsRecord.save();
			
			return sessionId.toString();
		}
	
	function libGetSessionData(sessionId)
		{
			var sessionRecord = record.load({
											type:		'customrecord_bbs_internal_params', 
											id:			sessionId,
											isDynamic:	true
											});
			var data = null;
			
			if (sessionRecord)
				{
					data = sessionRecord.getValue({
												fieldId:	'custrecord_bbs_params_data'
												});
					
				}
			
			return data;
		}
	
	function libSetSessionData(sessionId, sessionData)
		{
			var sessionRecord = record.load({
											type:		'customrecord_bbs_internal_params', 
											id:			sessionId,
											isDynamic:	true
											});
			
			if (sessionRecord)
				{
					sessionRecord.setValue({
											fieldId:	'custrecord_bbs_params_data', 
											value:		sessionData
											});
					
					sessionRecord.save();
				}
		}
		
	function libClearSessionData(sessionId)
		{
			record.delete({
							type:	'customrecord_bbs_internal_params', 
							id:		sessionId
							});
		}
	
    //Carton info object
    //
    function cartonInfoObj(_cartonId, _cartonNumber)
    	{
    		this.cartonId		= _cartonId;
    		this.cartonNumber	= _cartonNumber;
    	}
    
      
    function loadItemFulfillment(ifId)
    	{
    		var ifRecord = null;
    		
    		try
				{
    				ifRecord = record.load({
												type:		record.Type.ITEM_FULFILLMENT,
												id:			ifId,
												isDynamic:	false
												});
					
				}
			catch(err)
				{
	    			log.error({
								title:		'Error loading IF record id = ' + ifId,
								details:	err
							});
				}
			
    		return ifRecord;
    	}
    
	//Create a new carton
    //
    function libCreateNewCarton()
    	{
    		var cartonId 		= null;
    		var cartonNumber	= null;
    		var cartonRecord	= null;
    		
    		try
    			{
    				cartonRecord = record.create({
    											type:		'customrecord_bbs_carton',
    											isDynamic:	true
    											});
    				
    				cartonId 		= cartonRecord.save({ignoreMandatoryFields: true});
    				
    				cartonNumber 	= search.lookupFields({
															type: 		'customrecord_bbs_carton',
															id: 		cartonId,
															columns: 	['name']
															}).name;
    				
    			}
    		catch(err)
    			{
	    			log.error({
								title:		'Error creating new carton record',
								details:	err
							});
    			}
    		
    		var cartonInfo = new cartonInfoObj(cartonId, cartonNumber);
    		
    		return cartonInfo;
    	}
  
    function libFindIfRecord(salesOrderItemFulfillment)
    	{
    		debugger;
    		
    		var ifRecordId = null;
    		
    		//Search transactions (sales orders & IF's) by document number
    		//
    		var initialSearch = searchTransactionsByNumber(salesOrderItemFulfillment);
    		
    		//Did we find a match
    		//
    		if(initialSearch != null && initialSearch.length == 1)
    			{
	    			var initialTransType 	= initialSearch[0].getValue({name: "type"});
	    			var initialTransId 		= initialSearch[0].getValue({name: "internalid"});
				
	    			//Did we find an IF record
	    			//
	    			if(initialTransType == 'ItemShip')
	    				{
	    					ifRecordId = initialTransId;
	    				}
	    			else
	    				{
	    					//If not, find IF record by sales order id
	    					//
	    					var secondSearch = searchIfBySalesOrder(initialTransId);
	    					
	    					//Did we find a match
	    		    		//
	    		    		if(secondSearch != null && secondSearch.length == 1)
	    		    			{
	    			    			var secondTransId 	= secondSearch[0].getValue({name: "internalid"});
	    			    			ifRecordId 			= secondTransId;
	    		    			}
	    				}
    			}
    		
    		return ifRecordId;
    	}
    
    function searchTransactionsByNumber(doumentNumber)
    	{
	    	var transactionSearchObj = getResults(search.create({
												    		   type: "transaction",
												    		   filters:
												    		   [
												    		      ["type","anyof","ItemShip","SalesOrd"], 
												    		      "AND", 
												    		      ["mainline","is","T"], 
												    		      "AND", 
												    		      ["numbertext","is",doumentNumber]
												    		   ],
												    		   columns:
												    		   [
												    		      search.createColumn({name: "type", label: "Type"}),
												    		      search.createColumn({name: "internalid", label: "internalid"}),
												    		      search.createColumn({name: "tranid", label: "Document Number"})
												    		   ]
												    		}));
	    	
	    		return transactionSearchObj;
    	}
    
    function searchIfBySalesOrder(soId)
		{
	    	var itemfulfillmentSearchObj = getResults(search.create({
										    		   type: "itemfulfillment",
										    		   filters:
										    		   [
										    		      ["type","anyof","ItemShip"], 
										    		      "AND", 
										    		      ["mainline","is","T"], 
										    		      "AND", 
										    		      ["createdfrom","anyof",soId]
										    		   ],
										    		   columns:
										    		   [
										    		      search.createColumn({name: "type", label: "Type"}),
										    		      search.createColumn({name: "internalid", label: "internalid"}),
										    		      search.createColumn({name: "tranid", label: "Document Number"})
										    		   ]
										    		}));
	    	
	    		return itemfulfillmentSearchObj;
		}
    
    function findItem(selectionValue)
    	{
    		var itemInfo = null;
    		
    		//Find an item based on its name or upc code
    		//
    		var itemSearchObj = getResults(search.create({
									    			   type: 		"item",
									    			   filters:
												    			   [
												    			      ["name","is",selectionValue], 
												    			      "OR", 
												    			      ["upccode","is",selectionValue]
												    			   ],
									    			   columns:
												    			   [
												    			      search.createColumn({name: "itemid",sort: search.Sort.ASC,label: "Name"}),
												    			      search.createColumn({name: "displayname", label: "Display Name"}),
												    			      search.createColumn({name: "salesdescription", label: "Description"}),
												    			      search.createColumn({name: "type", label: "Type"}),
												    			      search.createColumn({name: "saleunit", label: "Primary Sale Unit"}),
												    			      search.createColumn({name: "weight", label: "Weight"})
												    			   ]
									    			}));
    			
    		//Did we find the item?
    		//
    		if(itemSearchObj != null && itemSearchObj.length > 0)
    			{
    				var itemId 			= itemSearchObj[0].id;
    				var itemName 		= itemSearchObj[0].getValue({name: "itemid"});
    				var itemDescription	= itemSearchObj[0].getValue({name: "displayname"});
    				var itemType 		= itemSearchObj[0].getValue({name: "type"});
    				var itemUnit 		= itemSearchObj[0].getValue({name: "saleunit"});
    				var itemWeight 		= itemSearchObj[0].getValue({name: "weight"});
    				itemInfo			= new itemInfoObj(itemId, itemName, itemUnit, itemWeight, 1);
    			}
    		else
    			{
    				//If not, try the item alias
    				//
	    			var customrecord_wmsse_sku_aliasSearchObj = getResults(search.create({
																	    				   type: 		"customrecord_wmsse_sku_alias",
																				    				   filters:
																				    				   [
																				    				      ["name","is",selectionValue]
																				    				   ],
																	    				   columns:
																				    				   [
																				    				    search.createColumn({name: "name",sort: search.Sort.ASC,label: "Name"}),
																				    				    search.createColumn({name: "custrecord_wmsse_alias_item", label: "Item"}),
																				    				    search.createColumn({name: "custrecord_wms_alias_unit", label: "Alias Unit"}),
																				    				    search.createColumn({name: "internalid",join: "CUSTRECORD_WMSSE_ALIAS_ITEM",label: "Internal Id"}),
																				    				    search.createColumn({name: "itemid",join: "CUSTRECORD_WMSSE_ALIAS_ITEM",label: "Name"}),
																				    				    search.createColumn({name: "displayname",join: "CUSTRECORD_WMSSE_ALIAS_ITEM",label: "Display Name"}),         
																				    				    search.createColumn({name: "type",join: "CUSTRECORD_WMSSE_ALIAS_ITEM",label: "Type"}),
																				    				    search.createColumn({name: "saleunit",join: "CUSTRECORD_WMSSE_ALIAS_ITEM",label: "Primary Sale Unit"}),
																				    				    search.createColumn({name: "weight",join: "CUSTRECORD_WMSSE_ALIAS_ITEM",label: "Weight"})
																				    				    ]
																	    				}));
	    			
	    			//Did we find an alias?
	    			//
	    			if(customrecord_wmsse_sku_aliasSearchObj != null && customrecord_wmsse_sku_aliasSearchObj.length > 0)
	    				{
		    				var itemId 			= customrecord_wmsse_sku_aliasSearchObj[0].getValue({name: "internalid",join: "CUSTRECORD_WMSSE_ALIAS_ITEM"});
		    				var itemName 		= customrecord_wmsse_sku_aliasSearchObj[0].getValue({name: "itemid",join: "CUSTRECORD_WMSSE_ALIAS_ITEM"});
		    				var itemDescription	= customrecord_wmsse_sku_aliasSearchObj[0].getValue({name: "displayname",join: "CUSTRECORD_WMSSE_ALIAS_ITEM"});
		    				var itemType 		= customrecord_wmsse_sku_aliasSearchObj[0].getValue({name: "type",join: "CUSTRECORD_WMSSE_ALIAS_ITEM"});
		    				var itemUnit 		= customrecord_wmsse_sku_aliasSearchObj[0].getValue({name: "saleunit",join: "CUSTRECORD_WMSSE_ALIAS_ITEM"});
		    				var itemWeight 		= customrecord_wmsse_sku_aliasSearchObj[0].getValue({name: "weight",join: "CUSTRECORD_WMSSE_ALIAS_ITEM"});
		    				
		    				var aliasUOM		= customrecord_wmsse_sku_aliasSearchObj[0].getValue({name: "custrecord_wms_alias_unit"});
		    				
		    				var uomFactor		= findUomConversion(aliasUOM, itemUnit);
		    				
		    				itemInfo			= new itemInfoObj(itemId, itemName, itemUnit, itemWeight, uomFactor);
	    				}
    			}
    		
    		return itemInfo;
    	}
    
    function findUomConversion(aliasUOM, itemUnit)
    	{
    		var uomFactor = Number(1);
    		
    		
    		return uomFactor;
    	}

    function itemInfoObj(_itemId, _itemName, _itemUnit, _itemWeight, _itemUomFactor)
    	{
    		this.itemId			= _itemId;
    		this.itemName		= _itemName;
    		this.itemUnit		= _itemUnit;
    		this.itemWeight		= _itemWeight;
    		this.itemUomFactor	= _itemUomFactor;
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
    
    
    //Function to replace a null value with a specific value
	//
	function isNullorBlank(_string, _replacer)
		{
			if(_string == null || _string == '')
				{
					return _replacer;
				}
			else
				{
					return _string;
				}
		}

		return	{
				libCreateSession:		libCreateSession,
				libGetSessionData:		libGetSessionData,
				libSetSessionData:		libSetSessionData,
				libClearSessionData:	libClearSessionData,
				libCreateNewCarton:		libCreateNewCarton,
				libFindIfRecord:		libFindIfRecord,
				loadItemFulfillment:	loadItemFulfillment,
				isNullorBlank:			isNullorBlank,
				findItem:				findItem
				}
	});
