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
	
	//=============================================================================================
	//Prototypes
	//=============================================================================================
	//
	
	//Date & time formatting prototype 
	//
	(function() {

		Date.shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
		Date.longMonths = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
		Date.shortDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
		Date.longDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

		// defining patterns
		var replaceChars = {
		// Day
		d : function() {
			return (this.getDate() < 10 ? '0' : '') + this.getDate();
		},
		D : function() {
			return Date.shortDays[this.getDay()];
		},
		j : function() {
			return this.getDate();
		},
		l : function() {
			return Date.longDays[this.getDay()];
		},
		N : function() {
			return (this.getDay() == 0 ? 7 : this.getDay());
		},
		S : function() {
			return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
		},
		w : function() {
			return this.getDay();
		},
		z : function() {
			var d = new Date(this.getFullYear(), 0, 1);
			return Math.ceil((this - d) / 86400000);
		}, // Fixed now
		// Week
		W : function() {
			var target = new Date(this.valueOf());
			var dayNr = (this.getDay() + 6) % 7;
			target.setDate(target.getDate() - dayNr + 3);
			var firstThursday = target.valueOf();
			target.setMonth(0, 1);
			if (target.getDay() !== 4) {
				target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
			}
			var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

			return (retVal < 10 ? '0' + retVal : retVal);
		},
		// Month
		F : function() {
			return Date.longMonths[this.getMonth()];
		},
		m : function() {
			return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
		},
		M : function() {
			return Date.shortMonths[this.getMonth()];
		},
		n : function() {
			return this.getMonth() + 1;
		},
		t : function() {
			var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
			if (nextMonth === 12) {
				year = year++;
				nextMonth = 0;
			}
			return new Date(year, nextMonth, 0).getDate();
		},
		// Year
		L : function() {
			var year = this.getFullYear();
			return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
		}, // Fixed now
		o : function() {
			var d = new Date(this.valueOf());
			d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
			return d.getFullYear();
		}, //Fixed now
		Y : function() {
			return this.getFullYear();
		},
		y : function() {
			return ('' + this.getFullYear()).substr(2);
		},
		// Time
		a : function() {
			return this.getHours() < 12 ? 'am' : 'pm';
		},
		A : function() {
			return this.getHours() < 12 ? 'AM' : 'PM';
		},
		B : function() {
			return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
		}, // Fixed now
		g : function() {
			return this.getHours() % 12 || 12;
		},
		G : function() {
			return this.getHours();
		},
		h : function() {
			return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
		},
		H : function() {
			return (this.getHours() < 10 ? '0' : '') + this.getHours();
		},
		i : function() {
			return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
		},
		s : function() {
			return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
		},
		u : function() {
			var m = this.getMilliseconds();
			return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
		},
		// Timezone
		e : function() {
			return /\((.*)\)/.exec(new Date().toString())[1];
		},
		I : function() {
			var DST = null;
			for (var i = 0; i < 12; ++i) {
				var d = new Date(this.getFullYear(), i, 1);
				var offset = d.getTimezoneOffset();

				if (DST === null)
					DST = offset;
				else
					if (offset < DST) {
						DST = offset;
						break;
					}
					else
						if (offset > DST)
							break;
			}
			return (this.getTimezoneOffset() == DST) | 0;
		},
		O : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		},
		P : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		}, // Fixed now
		T : function() {
			return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
		},
		Z : function() {
			return -this.getTimezoneOffset() * 60;
		},
		// Full Date/Time
		c : function() {
			return this.format("Y-m-d\\TH:i:sP");
		}, // Fixed now
		r : function() {
			return this.toString();
		},
		U : function() {
			return this.getTime() / 1000;
		}
		};

		// Simulates PHP's date function
		Date.prototype.format = function(format) {
			var date = this;
			return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
				return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
			});
		};

	}).call(this);
	
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
	    								var today = new Date();
	    								
	    								// format in the following format YYYY-MM-DD
	    								var despatchDate = today.format('Y-m-d');
	    								
	    								// call function to find contact details for the customer. Contact object will be returned
	    								var contactInfo = new BBSCommon.findContactDetails(customerID);
	    								
	    								// call function to find the full address. Address object will be returned
	    								var shippingAddress = new BBSCommon.findAddressDetails(addressID);
	    								
	    								//Build up the process shipments request object
	    								//
	    								var processShipmentsRequest = new BBSObjects.processShipmentRequest(integrationDetails, shippingCarrierInfo, shipmentReference, shippingAddress, contactInfo, despatchDate, weight, packageCount, 'PNG');
	    								
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
			    											var consignmentNumber = processShipmentsResponse['consignmentNumber'];
			    											
			    											// get package count
			    											var packages = processShipmentsResponse['packages'];
			    											
			    											// loop through package count
			    											for (var i = 0; i < packages.length; i++)
			    												{
			    													// get package data
			    													var labelImage = packages[i]['labelImage'];
			    													var labelFileType = packages[i]['labelType'];
			    													
			    													// if labelFileType is PNG
			    													if (labelFileType == 'PNG')
			    														{
				    														// create a PNG of the courier label and store in the file cabinet
									    									var courierLabel = file.create({
									    										fileType: file.Type.PNGIMAGE,
									    										name: packages[i]['packageNumber'] + '.' + labelFileType,
									    										contents: labelImage,
									    										folder: fileCabinetFolder,
									    										isOnline: true
									    									});
			    														}
			    													else if (labelFileType == 'PDF') // if labelFileType is PDF
			    														{
				    														// create a PDF of the courier label and store in the file cabinet
									    									var courierLabel = file.create({
									    										fileType: file.Type.PDF,
									    										name: packages[i]['packageNumber'] + '.' + labelFileType,
									    										contents: labelImage,
									    										folder: fileCabinetFolder,
									    										isOnline: true
									    									});
			    														}
							    									
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
					    											
					    											// check if this is the first package
					    											if (i = 0)
					    												{
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
			    												}
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
