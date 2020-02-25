/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


define([
        'N/record',
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSObjects',		//Objects used to pass info back & forth
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSCommon',		//Common code
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSCarrierGFS'	//GFS integration module
        ],
/**
 * @param {record} record
 */
function(record, BBSObjects, BBSCommon, BBSCarrierGFS) 
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
    function carrierIntFulfilmentAS(scriptContext) 
	    {
    		var type 				= scriptContext.type;
    		var newRecord 			= scriptContext.newRecord;
    		var integrationDetails 	= null;
    		var shippingCarrierInfo = null;

    		switch(type)
    			{
	    			case 'create':	
	    			case 'edit':
	    			case 'pack':
	    				
	    				//See if we need to create a consignment
	    				//
	    				var newRecord 		= scriptContext.newRecord;
	    				var shippingMethod 	= newRecord.getValue({fieldId: 'shipmethod'});
	    				var shippingStatus 	= newRecord.getValue({fieldId: 'shipstatus'});		// A=Picked, B=Packed, C=Shipped
	    				var consignmentNo 	= newRecord.getValue({fieldId: 'custbody_bbs_ci_consignment_number'});
	    				var labelImageLink 	= newRecord.getValue({fieldId: 'custbody_bbs_ci_label_image'});
	    				
	    				//First check to see if the shipping item has a carrier integration linked to it
	    				//
	    				if(!BBSCommon.isNullOrEmpty(shippingMethod) && shippingStatus == 'B' && BBSCommon.isNullOrEmpty(consignmentNo))
	    					{
	    						shippingCarrierInfo = BBSCommon.lookupShippingItem(shippingMethod);
	    					
	    						//Did we get back any carrier integration data?
	    						//
	    						if(shippingCarrierInfo)
	    							{
	    								//Get the integration info 
	    								//
	    								integrationDetails = BBSCommon.getConfig(shippingCarrierInfo.primaryCarrier);
	    								
	    								//Build up the process shipments request object
	    								//
	    								var processShipmentsRequest = new BBSCommon.processShipmentRequest();
	    								
	    								//Work out which integration module to use
	    								//
	    								switch(shippingCarrierInfo.primaryCarrierName)
	    									{
			    								case 'GFS':
			    								
			    									//Send the request to the specific carrier
			    									//
			    									var processShipmentsResponse = BBSCarrierGFS.carrierProcessShipments(processShipmentsRequest);	//Pass in the info gleaned from the IF record here
			    									
			    									//Process the response from the carrier, save the image to a file & populate the IF record as appropriate
			    									//
			    									
			    									break;
			    									
			    								//Other integration implementations go here
			    								//
	    									}
	    								
	    								
	    							
	    							}
	    					}
	    				
	    				
	    				break;
	    				
	    				
	    			case 'delete':
	    				//If we are deleting the item fulfilment & there is a consignment assigned to it, we need to see if we can delete the consignment
	    				//
	    				
	    				var oldRecord 	= scriptContext.oldRecord;
	    				var consignmentNo 	= oldRecord.getValue({fieldId: 'custbody_bbs_ci_consignment_number'});
	    				var labelImageLink 	= oldRecord.getValue({fieldId: 'custbody_bbs_ci_label_image'});
	    				var shippingMethod 	= oldRecord.getValue({fieldId: 'shipmethod'});
	    				
	    				//First check to see if the shipping item has a carrier integration linked to it
	    				//
	    				if(!BBSCommon.isNullOrEmpty(shippingMethod) && !BBSCommon.isNullOrEmpty(consignmentNo))
	    					{
	    						shippingCarrierInfo = BBSCommon.lookupShippingItem(shippingMethod);
	    					
	    						//Did we get back any carrier integration data?
	    						//
	    						if(shippingCarrierInfo)
	    							{
	    								//Get the integration info 
	    								//
	    								integrationDetails = BBSCommon.getConfig(shippingCarrierInfo.primaryCarrier);
	    								
	    								//Build up the cancel shipments request object
	    								//
	    								var cancelShipmentRequest = new BBSCommon.cancelShipmentRequest();
	    								
	    								//Work out which integration module to use
	    								//
	    								switch(shippingCarrierInfo.primaryCarrierName)
	    									{
			    								case 'GFS':
			    								
			    									//Send the request to the specific carrier
			    									//
			    									var cancelShipmentResponse = BBSCarrierGFS.carrierCancelShipments(cancelShipmentRequest);	//Pass in the info gleaned from the IF record here
			    									
			    									//Process the response from the carrier
			    									//
			    									
			    									
			    									
			    									break;
			    									
			    								//Other integration implementations go here
				    							//
	    									}
	    							}
	    					}
	    				
	    				break;
    			}
	    }


    return 	{
        	afterSubmit: carrierIntFulfilmentAS
    		};
    
});
