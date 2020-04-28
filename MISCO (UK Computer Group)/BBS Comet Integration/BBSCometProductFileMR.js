/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
	
define(['N/runtime', 'N/file', 'N/search'],
function(runtime, file, search) 
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
			this.shipping				=13;
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
	    	//Get script parameter
	    	//
	    	var productFileId = '31865'; //runtime.getCurrentScript().getParameter({name: 'custscript_bbs_sftp_product_file_id'});
	    	
	    	//Debug logging
	    	//
	    	logMsg('D', 'Product File Id', productFileId)
		   
	    	//Read each line of the input file & add to the key/value pairs passed to the map stage
	    	//
	    	var fileObject = null;
	    	
	    	try
	    		{
	    			fileObject = file.load({id: productFileId});
	    		}
	    	catch(err)
	    		{
	    			fileObject = null;
	    			logMsg('E', 'Error loading file id =  ' + productFileId, err);
	    		}
	    	
	    	return fileObject;
	    	
	    	/*
	    	if(fileObject != null)
	    		{
	    			var iterator = fileObject.lines.iterator();
	    				
	    			//Skip the first line (CSV header)
	    			//
	    	        iterator.each(function () 
	    	        	{
	    	        		return false;
	    	        	});
	    	        
	    	        //Process the rest of the lines
	    	        //
	    	        iterator.each(function (line)
		    	        {
		    	            var lineValues = line.value;
		    	            
		    	            return true;
		    	          });
	    		}
	    	*/
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
			    	var rawLine 	= context.value;
			    	var lineNumber	= Number(context.key)
			    	
			    	//Skip the first line as that is the column headers
			    	//
			    	if(lineNumber > 0)
			    		{
			    			//Split out the columns
			    			//
			    			//var columns = rawLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
			    			var columns = splitCSVButIgnoreCommasInDoublequotes(rawLine);
			    			
			    			//Remove any double quotes from the line data
			    			//
			    			for (var int = 0; int < columns.length; int++) 
						    	{
					    			columns[int] = columns[int].replace(/"/g,"");
								}
			    			
			    			//Process the line data
			    			//
			    	    	processsLineData(columns);
			    		}
    			}
    		catch(err)
    			{
    				logMsg('E', 'An Unexpected Error Occured Processing Line ' + lineNumber, err);
    			}
	    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) 
	    {
	
	    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) 
	    {
	
	    }

	
    //Helper functions
	//
    function splitCSVButIgnoreCommasInDoublequotes(str) {  
        //split the str first  
        //then merge the elments between two double quotes  
        var delimiter = ',';  
        var quotes = '"';  
        var elements = str.split(delimiter);  
        var newElements = [];  
        for (var i = 0; i < elements.length; ++i) {  
            if (elements[i].indexOf(quotes) >= 0) {//the left double quotes is found  
                var indexOfRightQuotes = -1;  
                var tmp = elements[i];  
                //find the right double quotes  
                for (var j = i + 1; j < elements.length; ++j) {  
                    if (elements[j].indexOf(quotes) >= 0) {  
                        indexOfRightQuotes = j; 
                        break;
                    }  
                }  
                //found the right double quotes  
                //merge all the elements between double quotes  
                if (-1 != indexOfRightQuotes) {   
                    for (var j = i + 1; j <= indexOfRightQuotes; ++j) {  
                        tmp = tmp + delimiter + elements[j];  
                    }  
                    newElements.push(tmp);  
                    i = indexOfRightQuotes;  
                }  
                else { //right double quotes is not found  
                    newElements.push(elements[i]);  
                }  
            }  
            else {//no left double quotes is found  
                newElements.push(elements[i]);  
            }  
        }  

        return newElements;  
    } 
    
    
	function processsLineData(_columns)
		{
			logMsg('D', 'Trying to find product', _columns);
			
			//Only process if the item has a mpn
			//
			if(_columns[columnsEnum.mpn] != '')
				{
					var itemId = findItem(_columns[columnsEnum.mpn]);
					
					//If not found, then we need to create it
					//
			//		if(!itemId)
			//			{
							logMsg('D', 'Product not found - creating new one', _columns[columnsEnum.mpn]);
							
							var itemExternalId 		= _columns[columnsEnum.mpn] + '_' + _columns[columnsEnum.id];
							var itemDisplayName 	= _columns[columnsEnum.title];
							var itemDescription		= _columns[columnsEnum.description];
							var itemProductCategory	= lookupProductCategory(_columns[columnsEnum.googleProductCategory].replace(/>/g,":"));
							var itemWebsiteLink		= _columns[columnsEnum.link];
							var itemImage			= _columns[columnsEnum.imageLink];
							var itemCondition		= _columns[columnsEnum.condition];
							var itemAvailability	= _columns[columnsEnum.availability];
							var itemMpn				= _columns[columnsEnum.mpn];
							var itemPrice			= _columns[columnsEnum.price].replace(',','.').replace(' GBP','');
							var itemBrand			= lookupItemBrand(_columns[columnsEnum.brand]);
							var itemGtin			= _columns[columnsEnum.gtin];
							var itemProductType		= lookupProductType(_columns[columnsEnum.productType]);
							var itemSupplier		= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_sftp_product_supplier'});
					    	
							logMsg('D', 'itemExternalId', itemExternalId);
							logMsg('D', 'itemDisplayName', itemDisplayName);
							logMsg('D', 'itemDescription', itemDescription);
							logMsg('D', 'itemProductCategory', itemProductCategory);
							logMsg('D', 'itemWebsiteLink', itemWebsiteLink);
							logMsg('D', 'itemImage', itemImage);
							logMsg('D', 'itemMpn', itemMpn);
							logMsg('D', 'itemPrice', itemPrice);
							logMsg('D', 'itemGtin', itemGtin);
							logMsg('D', 'itemSupplier', itemSupplier);
							logMsg('D', 'itemCondition', itemCondition);
							logMsg('D', 'itemAvailability', itemAvailability);
							logMsg('D', 'itemBrand', itemBrand);
							logMsg('D', 'itemProductType', itemProductType);
							
							
							
				//		}
					
				}
			else
				{
					logMsg('D', 'Product skipped, no mpn', '');
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
			
			logMsg('D', 'Product category full search', _category);
			
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
							
							logMsg('D', 'Product category partial search', lastPart);
							
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
			
			return categoryId;
		}

	
	//Lookup the product type
	//
	function lookupProductType(_type)
		{
			var typeId = null;
			
			logMsg('D', 'Product type full search', _type);
			
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
							
							logMsg('D', 'Product type partial search', lastPart);
							
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
			
			return categoryId;
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
	        reduce: 		reduce,
	        summarize: 		summarize
    };
    
});
