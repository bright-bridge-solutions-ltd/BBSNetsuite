/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


define([
        'N/runtime',
		'N/record',
        'N/search',
        'N/file',
        'N/email',
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSObjects',		//Objects used to pass info back & forth
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSCommon',		//Common code
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSCarrierGFS'	//GFS integration module
        ],
/**
 * @param {record} record
 */
function(runtime, record, search, file, email, BBSObjects, BBSCommon, BBSCarrierGFS) 
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
    		// retrieve script parameters
    		var currentScript = runtime.getCurrentScript();
    	
	    	var fileCabinetFolder = currentScript.getParameter({
	        	name: 'custscript_bbs_carrier_int_folder_id'
	        });
	    	
	    	var emailSender = currentScript.getParameter({
	    		name: 'custscript_bbs_shipment_delete_sender'
	    	});
    	
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
	    								//Get the internal ID of the record
	    								//
	    								var recordID = newRecord.id;
	    							
	    								//Get the integration info 
	    								//
	    								integrationDetails = BBSCommon.getConfig(shippingCarrierInfo.primaryCarrier);
	    								
	    								// get the required information from the current record to build up the label
	    								var shipmentReference = newRecord.getValue({
	    									fieldId: 'tranid'
	    								});
	    								
	    								var weight = newRecord.getValue({
	    									fieldId: 'custbody_bbs_total_weight'
	    								});
	    								
	    								var packageCount = newRecord.getValue({
	    									fieldId: 'custbody_bbs_number_of_packages'
	    								});
	    								
	    								var customerID = newRecord.getValue({
	    									fieldId: 'entity'
	    								});
	    								
	    								var addressID = newRecord.getValue({
	    									fieldId: 'shipaddresslist'
	    								});
	    								
	    								// get today's date
	    								var despatchDate = new Date();
	    								
	    								// get month and date from the despatchDate object
	    								var month = despatchDate.getMonth()+1;
	    								var date = despatchDate.getDate();
	    								
	    								// check if month is less than 10
	    								if (month < 10)
	    									{
	    										// add a 0 to the start of the month
	    										month = '0' + month;
	    									}
	    								
	    								// check if date is less than 10
	    								if (date < 10)
	    									{
	    										// add a 0 to the start of the date
	    										date = '0' + date;
	    									}
	    								
	    								// create a string from date parts
	    								despatchDate = despatchDate.getFullYear() + '-' + month + '-' + date;
	    								
	    								// call function to find contact details for the customer. Contact object will be returned
	    								var contactInfo = new BBSCommon.findContactDetails(customerID);
	    								
	    								// call function to find the full address. Address object will be returned
	    								var shippingAddress = new BBSCommon.findAddressDetails(addressID);
	    								
	    								//Build up the process shipments request object
	    								//
	    								var processShipmentsRequest = new BBSObjects.processShipmentRequest(integrationDetails, shippingCarrierInfo, shipmentReference, shippingAddress, contactInfo, despatchDate, weight, packageCount, null);
	    								
	    								//Work out which integration module to use
	    								//
	    								switch(shippingCarrierInfo.primaryCarrierName)
	    									{
			    								case 'GFS':
			    								
			    									//Send the request to the specific carrier
			    									//
			    									var processShipmentsResponse = BBSCarrierGFS.carrierProcessShipments(processShipmentsRequest);	//Pass in the info gleaned from the IF record here
			    									
			    									// check if we have got a success message back
			    									if (processShipmentsResponse['status'] == 'SUCCESS')
			    										{
			    											// get the consignment number and label
			    											var consignmentNumber = processShipmentsResponse['consignmentNumber']['ConsignmentNo']['#text'];
			    											var labelImage = processShipmentsResponse['consignmentNumber']['Labels']['Image']['#text'];
			    											
			    											// create a PDF of the courier label and store in the file cabinet
					    									var courierLabel = file.create({
					    										fileType: file.Type.PDF,
					    										name: consignmentNumber + '.pdf',
					    										contents: labelImage,
					    										folder: fileCabinetFolder,
					    										isOnline: true
					    									});
					    											
					    									// save the file in the file cabinet and get the file's ID
					    									var courierLabelFileID = courierLabel.save();
					    									
					    									// attach the file to the item fulfilment
			    											record.attach({
			    												record: {
			    													type: 'file',
			    													id: courierLabelFileID
			    												},
			    												to: {
			    													type: record.Type.ITEM_FULFILLMENT,
			    													id: recordID
			    												}
			    											});
					    									
					    									// reload the file
					    									courierLabel = file.load({
					    									    id: courierLabelFileID
					    									});
					    									
					    									// get the file's URL
					    									var courierLabelFileURL = 'https://system.netsuite.com';
					    									courierLabelFileURL += courierLabel.url;

			    											// update the item fulfilment record
			    											record.submitFields({
					    										type: record.Type.ITEM_FULFILLMENT,
					    										id: recordID,
					    										values: {
					    											custbody_bbs_ci_consignment_number: consignmentNumber,
					    											custbody_bbs_ci_consignment_error: null,
					    											custbody_bbs_ci_label_image: courierLabelFileURL
					    										}
					    									});
			    										}
			    									else
			    										{
			    											// get any error messages
			    											var errorMessages = processShipmentsResponse['message'];
			    										
			    											// update the item fulfilment record
				    										record.submitFields({
					    										type: record.Type.ITEM_FULFILLMENT,
					    										id: recordID,
					    										values: {
					    											custbody_bbs_ci_consignment_number: null,
					    											custbody_bbs_ci_consignment_error: errorMessages,
					    											custbody_bbs_ci_label_image: null
					    										}
					    									});
			    										}
			    									
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
	    				var currentUser 	= runtime.getCurrentUser().id;
	    				var oldRecord 		= scriptContext.oldRecord;
	    				var tranID			= oldRecord.getValue({fieldId: 'tranid'});
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
	    								var cancelShipmentRequest = new BBSObjects.cancelShipmentRequest(integrationDetails, consignmentNo, shippingCarrierInfo.subCarrierCode);
	    								
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
			    									if (cancelShipmentResponse['status'] == 'SUCCESS')
			    										{
				    										//Define email subject
					    									//
					    									var emailSubject = 'Cancel Shipment Request - ' + cancelShipmentResponse['status'];
					    									
					    									//Define email body
					    									//
					    									var emailBody 	= 	'<b>Item Fulfillment:</b> ' + tranID;
					    									emailBody 		+= 	'<br><b>Consignment No:</b> ' + consignmentNo;
					    									emailBody		+= 	'<br><br>this alert has been generated by the script BBS Carrier Fulfilment Integration UE';
					    									
					    									try
						    									{
						    										//Send email to the logged in user
							    									//
							    									email.send({
							    										author: emailSender,
							    										recipients: currentUser,
							    										subject: emailSubject,
							    										body: emailBody
							    									});
						    									}
					    									catch(e)
					    										{
					    											log.error({
					    												title: 'Unable to Send Email',
					    												details: e
					    											});
					    										}
			    										}
			    									else
			    										{
				    										//Define email subject
					    									//
					    									var emailSubject = 'Cancel Shipment Request - ' + cancelShipmentResponse['status'];
					    									
					    									//Define email body
					    									//
					    									var emailBody 	= 	'<b>Item Fulfillment:</b> ' + tranID;
					    									emailBody 		+= 	'<br><b>Consignment No:</b> ' + consignmentNo;
					    									emailBody		+=	'<br><b>Error Messages:</b> ' + cancelShipmentResponse['message'];
					    									emailBody		+= 	'<br><br>this alert has been generated by the script BBS Carrier Fulfilment Integration UE';
					    									
					    									try
						    									{
						    										//Send email to the logged in user
							    									//
							    									email.send({
							    										author: emailSender,
							    										recipients: currentUser,
							    										subject: emailSubject,
							    										body: emailBody
							    									});
						    									}
					    									catch(e)
					    										{
					    											log.error({
					    												title: 'Unable to Send Email',
					    												details: e
					    											});
					    										}
			    										}
			    									
			    									
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
