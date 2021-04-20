/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/search'],
/**
 * @param {currentRecord} currentRecord
 * @param {record} record
 * @param {search} search
 */
function(currentRecord, record, search) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function itemfulfilmentAS(scriptContext) 
	    {
    		//Initialise variables
    		//
    		var currentRecord 		= scriptContext.newRecord;
    		var currentType			= currentRecord.type;
    		var currentId			= currentRecord.id;
    		var fulfilmentRecord	= null;
    		var packageData			= {};
    		var totalWeight			= Number(0);
    		
    		//Try to load the fulfilment record
    		//
    		try
				{
					fulfilmentRecord = record.load({
													type:		currentType,
													id:			currentId
													});
				}
			catch(err)
				{
	    			log.error({
								title:		'Error loading fulfilment record with id = ' + currentId,
								details:	err
								});
	    			
	    			fulfilmentRecord	= null;
				}
			
			//Did the record load ok
			//
			if(fulfilmentRecord != null)
				{
					//Loop round the item lines
					//
					var itemCount = fulfilmentRecord.getLineCount({sublistId: 'item'});
					
					for (var items = 0; items < itemCount; items++) 
						{
							//Get the item line quantity, item & weight
							//
							var lineQty 		= Number(fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: items}));	
							var lineItem 		= fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: items});	
							var lineUnitWeight	= getItemWeight(lineItem);
							
							//Total weight
							//
							totalWeight += (lineUnitWeight * lineQty);
							
							//Get the inventory detail sub-record
							//
							var inventoryDetail = fulfilmentRecord.getSublistSubrecord({
																			    	    sublistId: 	'item',
																			    	    fieldId: 	'inventorydetail',
																			    	    line: 		items
																						});
							
							//Did we get the inv detail ok?
							//
							if(inventoryDetail != null)
								{
									//Loop though the inventory assignments
									//
									var inventoryAssignments = inventoryDetail.getLineCount({sublistId: 'inventoryassignment'});
									
									for (var inventoryAssignment = 0; inventoryAssignment < inventoryAssignments; inventoryAssignment++) 
										{
											var packageName = inventoryDetail.getSublistValue({sublistId: 'inventoryassignment', fieldId: 'pickcarton', line: inventoryAssignment});		
											
											//Accumulate the packages
											//
											packageData[packageName] = packageName;
										}
								}
						}
					
					//Update the IF record with the total weight & packages
					//
					try
						{
							record.submitFields({
												type:		currentType,
												id:			currentId,
												options:	{
															enableSourcing:			false,
															ignoreMandatoryFields:	true
															},
												values:		{
															custbody_bbs_total_weight:			totalWeight.toFixed(2),
															custbody_bbs_number_of_packages:	Object.keys(packageData).length
															}
												});
						}
					catch(err)
						{
							log.error({
										title:		'Error updating fulfilment record with id = ' + currentId,
										details:	err
										});
						
						}
					
				}
			
	    }

    
    function getItemWeight(_itemid)
    	{
    		var weightInKg = Number(0);
    		
    		var itemSearchObj = getResults(search.create({
										    			   type: 		"item",
										    			   filters:
													    			   [
													    			      ["internalid","anyof",_itemid]
													    			   ],
										    			   columns:
													    			   [
													    			      search.createColumn({ name: "itemid",sort: search.Sort.ASC,label: "Name"}),
													    			      search.createColumn({name: "weight", label: "Weight"}),
													    			      search.createColumn({name: "weightunit", label: "Weight Units"})
													    			   ]
										    			}));
    			
    		if(itemSearchObj != null && itemSearchObj.length > 0)
    			{
    				for (var itemResult = 0; itemResult < itemSearchObj.length; itemResult++) 
	    				{
    						var itemWeightUnit 	= Number(itemSearchObj[itemResult].getValue({name: "weightunit"}));
    						var itemWeight 		= Number(itemSearchObj[itemResult].getValue({name: "weight"}));
    						
    						switch(itemWeightUnit)
	    						{
	    				    		case 1:	//Lb's
	    				    			weightInKg = itemWeight / 2.205;
	    				    			
	    				    			break;
	    				    			
	    				    		case 2: //Oz's
	    				    			weightInKg = itemWeight / 35.274;
	    				    			
	    				    			break;
	    				    			
	    				    		case 3: //Kg's
	    				    			weightInKg = itemWeight;
	    				    			
	    				    			break;
	    				    			
	    				    		case 4: //g's
	    				    			weightInKg = itemWeight / 1000.0;
	    				    			
	    				    			break;
	    				    			
	    				    		default:
	    				    			weightInKg = itemWeight;
	    							
	    								break;
	    						}
						}
    			}

	    	return weightInKg;
    	}
    
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});	//5GU's
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});		//5GU's
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }
    
    return {
        	afterSubmit: itemfulfilmentAS
    		};
    
});
