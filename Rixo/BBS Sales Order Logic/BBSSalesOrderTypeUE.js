/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/file', 'N/xml'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, record, search, file, xml) 
{

	function salesOrderTypeAS(scriptContext) 
	    {
    		if(scriptContext.type == 'create')
    			{
    				var currentRecord 		= scriptContext.newRecord;
    				var currentRecordType 	= currentRecord.type;
    				var currentRecordId 	= currentRecord.id;
    				
    				if(currentRecord != null)
    					{
    						var orderChannel = currentRecord.getValue({fieldId: 'class'});
    						
    						if(orderChannel == 1)	//ecommerce
    							{
    								//Get the count of lines
    								//
	    							var itemCount = currentRecord.getLineCount({sublistId:	'item'});
	    		    				
	    							//Default order type
	    							//
	    							var orderType = 2;	//Direct
	    							
	    		    				for (var int = 0; int < itemCount; int++) 
	    			    				{
	    									var lineLocation = currentRecord.getSublistValue({
	    																					sublistId:		'item',
	    																					fieldId:		'location',
	    																					line:			int
	    																					});
	    									
	    									if(lineLocation != 214) 	//If any line location is not "Direct", then set the order type to be "Omni"
	    										{
	    											orderType = 1;	//Omni
	    											break;
	    										}
	    			    				}
	    		    				
	    		    				try
	    		    					{
			    		    				record.submitFields({
			    		    									type:		currentRecordType,
			    		    									id:			currentRecordId,
			    		    									options:	{
			    		    												ignoreMandatoryFields:	true
			    		    												},
			    		    									values:		{
			    		    												ordertype:	orderType
			    		    												}
			    		    				});
	    		    					}
	    		    				catch(err)
	    		    					{
	    		    						log.error({
	    		    									title:		'Error updating order type on sales order id = ' + currentRecordId,
	    		    									details:	err
	    		    									})	
	    		    					}
    							}
    					}
    			}
	    }

    return 	{
        		afterSubmit: salesOrderTypeAS
    		};
    
});
