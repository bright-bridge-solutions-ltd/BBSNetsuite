/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param {record} record
 */
function(record) 
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
	    function afterSubmit(scriptContext) 
		    {
	    		//Trigger on create or edit
	    		//
	    		if(scriptContext.type == 'create'|| scriptContext.type == 'edit')
	    			{
	    				var recordType 	= scriptContext.newRecord.type;
	    				var recordId	= scriptContext.newRecord.id;
	    				var thisRecord	= null;
	    				
	    				//If we are editing, get the old & new eta values
	    				//
	    				if(scriptContext.type == 'edit')
	    					{
			    				var oldEta1		= scriptContext.oldRecord.getValue({fieldId: 'expecteddeliverydate'});
			    				var oldEta2		= scriptContext.oldRecord.getValue({fieldId: 'custrecord_bbs_eta2'});
			    				var oldEta3		= scriptContext.oldRecord.getValue({fieldId: 'custrecord_bbs_eta3'});
			    				
			    				var newEta1		= scriptContext.newRecord.getValue({fieldId: 'expecteddeliverydate'});
			    				var newEta2		= scriptContext.newRecord.getValue({fieldId: 'custrecord_bbs_eta2'});
			    				var newEta3		= scriptContext.newRecord.getValue({fieldId: 'custrecord_bbs_eta3'});
			    				
			    				oldEta1 = (oldEta1 == '' | oldEta1 == null ? new Date('2000', '0', '1') : oldEta1);
			    				oldEta2 = (oldEta2 == '' | oldEta2 == null ? new Date('2000', '0', '1') : oldEta2);
			    				oldEta3 = (oldEta3 == '' | oldEta3 == null ? new Date('2000', '0', '1') : oldEta3);
			    				
			    				newEta1 = (newEta1 == '' | newEta1 == null ? new Date('2000', '0', '1') : newEta1);
			    				newEta2 = (newEta2 == '' | newEta2 == null ? new Date('2000', '0', '1') : newEta2);
			    				newEta3 = (newEta3 == '' | oldEta3 == null ? new Date('2000', '0', '1') : newEta3);
	    					}
	    				
	    				//If we are creating a new record, or editing an existing one & any of the eta's have changed we want to continue
	    				//
	    				if(scriptContext.type == 'create'|| (scriptContext.type == 'edit' && (oldEta1.getTime() != newEta1.getTime() || oldEta2.getTime() != newEta2.getTime() || oldEta3.getTime() != newEta3.getTime())))
	    					{
			    				//Try to load the record
			    				//
			    				try
			    					{
			    						thisRecord = record.load({
			    													type:		recordType,
			    													id:			recordId,
			    													isDynamic:	true
			    												});
			    					}
			    				catch(err)
			    					{
			    						thisRecord	= null;
			    						log.error({title: 'Error loading record', details: err});
			    					}
			    				
			    				if(thisRecord != null)
			    					{
			    						//Get the ETA dates
			    						//
				    					var eta1 = thisRecord.getValue({fieldId: 'expecteddeliverydate'});
				    					var eta2 = thisRecord.getValue({fieldId: 'custrecord_bbs_eta2'});
				    					var eta3 = thisRecord.getValue({fieldId: 'custrecord_bbs_eta3'});
			    						
				    					//Allow for blank dates
				    					//
				    					eta1 = (eta1 == '' | eta1 == null ? new Date('2000', '0', '1') : eta1);
				    					eta2 = (eta2 == '' | eta2 == null ? new Date('2000', '0', '1') : eta2);
				    					eta3 = (eta3 == '' | eta3 == null ? new Date('2000', '0', '1') : eta3);
				    					
				    					//Work out the latest date
				    					//
				    					var latestDate = new Date('2000', '0', '1');
				    					
				    					latestDate = (eta1.getTime() > latestDate.getTime() ? eta1 : latestDate);
				    					latestDate = (eta2.getTime() > latestDate.getTime() ? eta2 : latestDate);
				    					latestDate = (eta3.getTime() > latestDate.getTime() ? eta3 : latestDate);
				    					
				    					//Loop through the lines on the inbound shipment
				    					//
				    					var poValues 	= {};
				    					var lineCount 	= thisRecord.getLineCount({sublistId: 'items'});
				    					
				    					for (var lineCounter = 0; lineCounter < lineCount; lineCounter++) 
					    					{
					    						var linePoId	= thisRecord.getSublistValue({sublistId: 'items', fieldId: 'purchaseorder', line: lineCounter});
					    						var linePoLine	= thisRecord.getSublistValue({sublistId: 'items', fieldId: 'lineid', line: lineCounter});
					    						var linePoItem	= thisRecord.getSublistValue({sublistId: 'items', fieldId: 'itemid', line: lineCounter});
												
					    						//Make up a key of the po id + line
					    						//
					    						var poKey = padding_left(linePoId, '0', 8)  + '|' + padding_left(Number(linePoLine).toFixed(0), '0', 3);
					    						
					    						//Update the poValues object
					    						//
					    						poValues[poKey] = linePoItem;
											}
				    					
				    					//Now sort the po details into order
				    					//
				    					const sortedPoValues = {};
				  	                  
								        for (key in sortedPoValues)
								      		{
								    	  		delete sortedPoValues[key]
								      		}
								      
								        Object.keys(poValues).sort().forEach(function(key) 
								        	{
								        	sortedPoValues[key] = poValues[key];
								        	});
								        
								        //Now process the sorted object one po at at time
								        //
								        var lastPoId = '';
								        var poRecord = null;
								        
								        for ( var poKey in sortedPoValues) 
									        {
												var poId 	= Number(poKey.split('|')[0]);
												var poLine 	= Number(poKey.split('|')[1]);
												
												//Have we changed PO's?
												//
												if(lastPoId != poId)
													{
														//See if we need to save the previous PO
														//
														if(lastPoId != '')
															{
																try
																	{
																		poRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
																	}
																catch(err)
																	{
																		log.error({title: 'Error saving po record id = ' + lastPoId, details: err});
																	}
															}
														
														//Load the PO record
														//
														try
															{
																poRecord = record.load({type: record.Type.PURCHASE_ORDER, id: poId, isDynamic: true});
															}
														catch(err)
															{
																log.error({title: 'Error loading po record id = ' + poId, details: err});
																poRecord = null;
															}
														
														//Update the previous po id
														//
														lastPoId = poId;
													}
												
												//Find the line on the current po we want to update
												//
												if(poRecord != null)
													{
														var lineToFind = poRecord.findSublistLineWithValue({sublistId: 'item', fieldId: 'line', value: poLine});
														
														if(lineToFind != -1)
															{
																poRecord.selectLine({sublistId: 'item', line: lineToFind});
																poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'expectedreceiptdate', value: latestDate, ignoreFieldChange: false});
																poRecord.commitLine({sublistId: 'item', ignoreRecalc: false});
															}
													}
											}
								        
								        //Update the final PO
								        //
								        if(poRecord != null)
											{
												 try
													{
														poRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
													}
												catch(err)
													{
														log.error({title: 'Error saving po record id = ' + lastPoId, details: err});
													}
											}
			    					}
	    					}
	    			}
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
	    
	    return {
	        	afterSubmit: afterSubmit
	    		};
    
	});
