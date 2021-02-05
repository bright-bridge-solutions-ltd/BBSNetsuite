/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


define([
        'N/config',
		'N/runtime',
        'N/url',
		'N/record',
        'N/search',
        'N/file',
        'N/email',
        '../Modules/BBSObjects',				//Objects used to pass info back & forth
        '../Modules/BBSCommon',					//Common code
        '../Modules/BBSCarrierGFS',				//GFS integration module
        '../Modules/BBSCarrierProCarrier',		//ProCarrier integration module
        '../Modules/BBSCarrierDPD',				//DPD integration module
        '../Modules/BBSCarrierFedEx'			//FedEx integration module
        ],
/**
 * @param {record} record
 */
function(config, runtime, url, record, search, file, email, BBSObjects, BBSCommon, BBSCarrierGFS, BBSCarrierProCarrier, BBSCarrierDPD, BBSCarrierFedEx) 
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
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function carrierIntFulfilmentBL(scriptContext) {
    	
    	
    	// check that the record is being viewed
    	if (scriptContext.type == 'view')
    		{
	    		// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the BBS [CI] CONSIGNMENT NUMBER field
    			var consignmentNumber = currentRecord.getValue({fieldId: 'custbody_bbs_ci_consignment_number'});
    			
    			// check if the consignmentNumber variable returns a value
    			if (consignmentNumber)
    				{
	    				// get the internal ID of the current record
	    	        	var currentRecordID = currentRecord.id;
	    	        	
	    	        	// define URL of Suitelet
						var suiteletURL = url.resolveScript({
															scriptId: 		'customscript_bbs_carrier_int_label_sl',
															deploymentId: 	'customdeploy_bbs_carrier_int_label_sl',
															params: 		{
																			'id': 	currentRecordID
																			}
															});
	    	        	
	    	        	// add button to the form
	    	    		scriptContext.form.addButton({
							    	    			id: 			'custpage_print_courier_labels',
							    	    			label: 			'Print Courier Labels',
							    	    			functionName: 	"window.open('" + suiteletURL + "');" // call Suitelet when button is clicked
							    	    			});
    				}
    		}
    	
    }
	
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
    		var currentScript 		= runtime.getCurrentScript();
	    	var fileCabinetFolder 	= currentScript.getParameter({name: 'custscript_bbs_carrier_int_folder_id'});
	    	var emailSender 		= currentScript.getParameter({name: 'custscript_bbs_shipment_delete_sender'});
    		var type 				= scriptContext.type;
    		var newRecord 			= scriptContext.newRecord;
    		var integrationDetails 	= null;
    		var shippingCarrierInfo = null;
    		var itemLineInfo 		= [];
    		
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
	    								//Get the internal ID of the carrier
	    								//
	    								var shippingCarrier = shippingCarrierInfo.subCarrierCodeId;
	    							
	    								//Get the internal ID of the record
	    								//
	    								var recordID = newRecord.id;
	    								
	    								//Get the integration info 
	    								//
	    								integrationDetails = BBSCommon.getConfig(shippingCarrierInfo.primaryCarrier);
	    								
	    								//Reload the item fulfillment record
	    								//
	    								var itemFulfillmentRecord = record.load({
										    									type: 		record.Type.ITEM_FULFILLMENT,
										    									id: 		recordID,
										    									isDynamic: 	true
										    									});
	    								
	    								
	    								//Get the required information from the item fulfilment record to build up the label
	    								//
	    								var shipmentReference 	= itemFulfillmentRecord.getValue({fieldId: 'tranid'});
	    								var weight 				= itemFulfillmentRecord.getValue({fieldId: 'custbody_bbs_total_weight'});
	    								var transactionDate 	= itemFulfillmentRecord.getValue({fieldId: 'trandate'});
	    								var totalWeight 		= itemFulfillmentRecord.getValue({fieldId: 'custbody_bbs_total_weight'});
	    								var packageCount 		= itemFulfillmentRecord.getValue({fieldId: 'custbody_bbs_number_of_packages'});
	    								var createdFrom 		= itemFulfillmentRecord.getValue({fieldId: 'createdfrom'});
	    								
	    								
	    								//Load the related sales order
	    								//
	    								var salesOrderRecord = null;
	    								
	    								if(createdFrom != null && createdFrom != '')
	    									{
			    								try
			    									{
				    									var salesOrderRecord = record.load({
													    									type: 		record.Type.SALES_ORDER,
													    									id: 		createdFrom,
													    									isDynamic: 	false
													    									});
			    									}
			    								catch(err)
			    									{
			    										salesOrderRecord = null;
			    									}
			    								
			    								if(salesOrderRecord != null)
			    									{
			    										itemLineInfo = getItemLineInfo(itemFulfillmentRecord, salesOrderRecord);
			    									}
	    								
	    									}
	    								
	    								// check if totalWeight and packageCount are empty
	    								if (totalWeight == '' && packageCount == '')
	    									{
	    										// set totalWeight to 0
	    										totalWeight = 0;
	    									
	    										// get count of lines on the package sublist
	    										packageCount = itemFulfillmentRecord.getLineCount({sublistId: 'package'});
	    										
	    										// where packageCount is not 0
	    										if (packageCount > 0)
	    											{
			    										// loop through package sublist lines
			    										for (var i = 0; i < packageCount; i++)
			    											{
			    												// get the weight for the line
			    												var weight = itemFulfillmentRecord.getSublistValue({
															    													sublistId: 	'package',
															    													fieldId: 	'packageweight',
															    													line: 		i
															    													});
			    												
			    												// add the weight to the totalWeight variable
			    												totalWeight += weight;
			    											}
	    											}
	    										else
	    											{
	    												// set totalWeight to 1
	    												totalWeight = 1;
	    												
	    												// set packageCount to 1
	    												packageCount = 1;
	    											}
	    									}
	    								
	    								var customerID = itemFulfillmentRecord.getValue({fieldId: 'entity'});
	    								
	    								//Get the shipping address subrecord
	    								//
	    								var shippingAddressSubrecord = itemFulfillmentRecord.getSubrecord({fieldId: 'shippingaddress'});
	    								
	    								//Get shipping address fields
	    								//
	    								var addresse 		= shippingAddressSubrecord.getValue({fieldId: 'addressee'});
	    								var addressLine1 	= shippingAddressSubrecord.getValue({fieldId: 'addr1'});
	    								var addressLine2 	= shippingAddressSubrecord.getValue({fieldId: 'addr2'});
	    								var city 			= shippingAddressSubrecord.getValue({fieldId: 'city'});
	    								var county 			= shippingAddressSubrecord.getValue({fieldId: 'state'});
	    								var postcode 		= shippingAddressSubrecord.getValue({fieldId: 'zip'});
	    								var country 		= shippingAddressSubrecord.getValue({fieldId: 'country'});
	    								var addressPhone 	= shippingAddressSubrecord.getValue({fieldId: 'addrphone'});
	    								
	    								// create an address object
	    								//
	    								var shippingAddress = new BBSObjects.addressObject(addresse, addressLine1, addressLine2, city, county, postcode, country);
	    								
	    								
	    								//Get the subsidiary field value from the IF record (if present)
	    								//
	    								var subsidiaryId = itemFulfillmentRecord.getValue({fieldId: 'subsidiary'});
	    								
	    								//Return the senders address by either getting the data from the subsidiary, or the company information
	    								//
	    								var senderAddress = BBSCommon.getSenderAddress(subsidiaryId);
	    								
	    								//Call function to find contact details for the subsidiary. Contact object will be returned
	    								//
	    								var subsidiaryContactInfo = new BBSCommon.findSubsidiaryContactDetails(subsidiaryId);
	    								
	    								//Get today's date without the time component
	    								//
	    								var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
	    								
	    								//If the transaction date is in the past then use today's date as the despatch date
	    								//
	    								var despatchDate = '';
	    								var tempDate = null;
	    								
	    								if(transactionDate.getTime() < today.getTime())
	    									{
	    										tempDate = today;
	    									}
	    								else
	    									{
	    										tempDate = transactionDate;
	    									}
	    								
	    								//See if the despatch date is a Saturday
	    								//
	    								var isSaturday = (tempDate.getDay() == 6 ? true : false);
	    								
	    								//Format the date in the following format YYYY-MM-DD
	    								//
	    								despatchDate = tempDate.format('Y-m-d');
	    								
	    								//Call function to find contact details for the customer. Contact object will be returned
	    								//
	    								var contactInfo = new BBSCommon.findContactDetails(customerID);
	    								
	    								//If the contact phone no is blank, get it from the shipping address
	    								//
	    								if(contactInfo.mobileNumber == null || contactInfo.mobileNumber == '')
	    									{
	    										contactInfo.mobileNumber = addressPhone;
	    									}
                                  
	    								//Build up the process shipments request object
	    								//
	    								var processShipmentsRequest = new BBSObjects.processShipmentRequest(integrationDetails, shippingCarrierInfo, shipmentReference, shippingAddress, contactInfo, despatchDate, totalWeight, packageCount, isSaturday, senderAddress, subsidiaryContactInfo, itemLineInfo);
	    								
	    								//
							    		//LICENCE CHECK
							    		//
							    		var licenceResponse = BBSCommon.doLicenceCheck('CARRIER' + shippingCarrierInfo.primaryCarrierName);
							    		
							    		if(licenceResponse.status == 'OK')
							    			{
			    								//
			    								//=============================================================
			    								//Work out which integration module to use
			    								//=============================================================
			    								//
							    				var processShipmentsResponse = null;
							    			
			    								switch(shippingCarrierInfo.primaryCarrierName)
			    									{
					    								case 'GFS':
					    								
					    									//Send the request to the specific carrier
					    									//
					    									processShipmentsResponse = BBSCarrierGFS.carrierProcessShipments(processShipmentsRequest);	//Pass in the info gleaned from the IF record here
					    								
					    									break;
					    								
					    								case 'ProCarrier':
					    									
					    									//Send the request to the specific carrier
					    									//
					    									processShipmentsResponse = BBSCarrierProCarrier.carrierProcessShipments(processShipmentsRequest);	//Pass in the info gleaned from the IF record here
					    									
					    									break;
					    									
					    								case 'DPD':
					    									
					    									//Send the request to the specific carrier
					    									//
					    									processShipmentsResponse = BBSCarrierDPD.carrierProcessShipments(processShipmentsRequest);	//Pass in the info gleaned from the IF record here
					    									
					    									break;

					    								case 'FedEx':
					    									
					    									//Send the request to the specific carrier
					    									//
					    									processShipmentsResponse = BBSCarrierFedEx.carrierProcessShipments(processShipmentsRequest);	//Pass in the info gleaned from the IF record here
					    									
					    									break;
			    									}
			    								
		    									//Check if we have got a success message back
			    								//
		    									if (processShipmentsResponse['status'] == 'SUCCESS' || processShipmentsResponse['status'] == '200')
		    										{
		    											// get the company URL
		    											var companyURL = getCompanyUrl();
		    											
		    											// set the shipping carrier field on the record
			    										itemFulfillmentRecord.setValue({
											    										fieldId: 	'custbody_bbs_ci_shipping_carrier',
											    										value: 		shippingCarrier
											    										});
		    										
		    											// get the consignment number and label
		    											var consignmentNumber = processShipmentsResponse['consignmentNumber'];
		    											
		    											// get package count
		    											var packages = processShipmentsResponse['packages'];
		    											
		    											// loop through package count
		    											for (var i = 0; i < packages.length; i++)
		    												{
		    													// get package data
		    													var labelImage 			= packages[i]['labelImage'];
		    													var labelFileType 		= packages[i]['labelType'];
		    													var packageNumber 		= packages[i]['packageNumber'];
		    													var fileTypeIdentifier	= '';
		    													
		    													switch(labelFileType)
		    														{
				    													case 'PNG':
				    														fileTypeIdentifier = file.Type.PNGIMAGE;
				    														
				    														break;
				    												
				    													case 'PDF':
				    														fileTypeIdentifier = file.Type.PDF;
				    														
				    														break;
				    										
				    													default:
				    														fileTypeIdentifier = file.Type.PLAINTEXT;
				    														
				    														break;
				    										
		    														}
		    													
		    													// create a PNG of the courier label and store in the file cabinet
								    							var courierLabel = file.create({
															    								fileType: 	fileTypeIdentifier,
															    								name: 		packageNumber + '.' + labelFileType,
															    								contents: 	labelImage,
															    								folder: 	fileCabinetFolder,
															    								isOnline: 	true
															    								});
		    													
						    									
						    									// save the file in the file cabinet and get the file's ID
						    									var courierLabelFileID = courierLabel.save();
						    									
						    									// attach the file to the item fulfilment
				    											record.attach({
							    												record: {
							    														type: 	'file',
							    														id: 	courierLabelFileID
							    														},
							    												to: 	{
							    														type: 	record.Type.ITEM_FULFILLMENT,
							    														id: 	recordID
							    														}
							    												});
				    											
				    											// reload the file
						    									courierLabel = file.load({id: courierLabelFileID});
		    												
		    													// build up the file's URL
						    									var courierLabelFileURL  = 'https://';
						    									courierLabelFileURL 	+= companyURL;
						    									courierLabelFileURL 	+= courierLabel.url;

						    									// check if this is the first package, in which case update the IF record with the url of the first label
				    											if (i == 0)
				    												{
						    											// update the item fulfilment record
								    									itemFulfillmentRecord.setValue({
															    										fieldId: 	'custbody_bbs_ci_consignment_number',
															    										value: 		consignmentNumber
															    										});
								    									
								    									itemFulfillmentRecord.setValue({
															    										fieldId: 	'custbody_bbs_ci_consignment_error',
															    										value: 		null
															    										});
								    									
								    									itemFulfillmentRecord.setValue({
															    										fieldId: 	'custbody_bbs_ci_label_image',
															    										value: 		courierLabelFileURL
															    										});
				    												}

		    													// select the line on the packages sublist on the item record
		    													itemFulfillmentRecord.selectLine({
									    														sublistId: 	'package',
									    														line: 		i
		    																					});
		    													
		    													// get the weight for the current line
		    													var packageWeight = itemFulfillmentRecord.getCurrentSublistValue({
																		    														sublistId: 	'package',
																		    														fieldId: 	'packageweight'
																		    													});
		    													
		    													// if there is no weight on the line
		    													if (!packageWeight)
		    														{
		    															// set the package weight to 1
		    															itemFulfillmentRecord.setCurrentSublistValue({
												    																sublistId: 	'package',
												    																fieldId: 	'packageweight',
												    																value: 		1
												    																});
		    														}
		    													
		    													// set the tracking number field on the sublist line to hold the url of the label image
		    													var labelUrlArray = courierLabel.url.replace('?','&').split('&');
		    													var labelUrlString = '?' + labelUrlArray[1] + '&' + labelUrlArray[3]
		    													
		    													itemFulfillmentRecord.setCurrentSublistValue({
												    														sublistId: 	'package',
												    														fieldId: 	'packagetrackingnumber',
												    														value: 		labelUrlString		//packageNumber
												    														});
		    													
		    													// commit the changes to the sublist line
		    													itemFulfillmentRecord.commitLine({sublistId: 'package'});
		    													
		    													//Create the data required to generate the hyperlink to tracking info
						    									//
						    									try
						    										{
						    											var customRecord = record.create({
						    																				type:		'customrecord_bbs_if_additional_fields',
						    																				isDynamic:	true
						    																			});
						    											customRecord.setValue({
						    																	fieldId:	'custrecord_bbs_if_fulfilment',
						    																	value:		recordID
						    																	});
						    											
						    											customRecord.setValue({
						    																	fieldId:	'custrecord_bbs_if_package_key',
						    																	value:		labelUrlString	//packageNumber
						    																	});
						    											
						    											customRecord.setValue({
						    																	fieldId:	'custrecord_bbs_if_package_track_no',
						    																	value:		packageNumber
						    																	});
						    											
						    											customRecord.save({
						    																enableSourcing: 		false,
						    																ignoreMandatoryFields:	true
						    																});
						    										}
						    									catch(err)
						    										{
						    										
						    										}
		    												}
		    										}
		    									else
		    										{
		    											// get any error messages
		    											var errorMessages = processShipmentsResponse['message'];
		    											
		    											// update the item fulfilment record
		    											itemFulfillmentRecord.setValue({
		    																			fieldId: 	'custbody_bbs_ci_consignment_number',
		    																			value: 		null
				    																	});
				    									
				    									itemFulfillmentRecord.setValue({
											    										fieldId: 	'custbody_bbs_ci_consignment_error',
											    										value: 		errorMessages
											    										});
				    									
				    									itemFulfillmentRecord.setValue({
											    										fieldId: 	'custbody_bbs_ci_label_image',
											    										value: 		null
											    									});
				    									
				    									itemFulfillmentRecord.setValue({
											    										fieldId: 	'custbody_bbs_ci_shipping_carrier',
											    										value: 		null
											    									});
		    										}


			    								// save the item fulfilment record
			    								itemFulfillmentRecord.save();
							    			}
							    		else
							    			{
							    				//Notify of licence failure
							    				//
							    				var licenceError = 'Carrier Integration licence issue ' + licenceResponse.status + ' : ' + licenceResponse.message;
							    				
								    			// update the item fulfilment record
												itemFulfillmentRecord.setValue({
									    										fieldId: 	'custbody_bbs_ci_consignment_number',
									    										value: 		null
		    																	});
		    									
		    									itemFulfillmentRecord.setValue({
									    										fieldId: 	'custbody_bbs_ci_consignment_error',
									    										value: 		licenceError
									    										});
		    									
		    									itemFulfillmentRecord.setValue({
									    										fieldId: 	'custbody_bbs_ci_label_image',
									    										value: 		null
									    										});
		    									
		    									itemFulfillmentRecord.setValue({
									    										fieldId: 	'custbody_bbs_ci_shipping_carrier',
									    										value: 		null
									    										});
		    									
		    									// save the item fulfilment record
			    								itemFulfillmentRecord.save();
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
	    								var cancelShipmentResponse = null;
	    								
	    								switch(shippingCarrierInfo.primaryCarrierName)
	    									{
			    								case 'GFS':
			    								
			    									//Send the request to the specific carrier
			    									//
			    									cancelShipmentResponse = BBSCarrierGFS.carrierCancelShipments(cancelShipmentRequest);	//Pass in the info gleaned from the IF record here
			    									
			    									break;
			    									
			    								case 'ProCarrier':
			    									
			    									//Send the request to the specific carrier
			    									//
			    									cancelShipmentResponse = BBSCarrierProCarrier.carrierCancelShipments(cancelShipmentRequest);	//Pass in the info gleaned from the IF record here
			    									
			    									break;
	    									}
	    								
			    						//Process the response from the carrier
			    						//
			    						if (cancelShipmentResponse['status'] == 'SUCCESS' || cancelShipmentResponse['status'] == '200')
			    							{
				    							//Define email subject
					    						//
					    						var emailSubject = 'Cancel Shipment Request - Processed ok';
					    									
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
							    									author: 		emailSender,
							    									recipients: 	currentUser,
							    									subject: 		emailSubject,
							    									body: 			emailBody
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
							    									author: 		emailSender,
							    									recipients: 	currentUser,
							    									subject: 		emailSubject,
							    									body: 			emailBody
							    								});
						    						}
					    						catch(e)
					    							{
					    								log.error({
					    											title: 		'Unable to Send Email',
					    											details: 	e
					    										});
					    							}
			    							}
	    							}
	    					}
	    				
	    				break;
    			}
	    }
    
    function getItemLineInfo(_itemFulfillmentRecord, _salesOrderRecord)
    	{
    		var itemInfoArray 		= [];
    		var fulfilmentLines 	= _itemFulfillmentRecord.getLineCount({sublistId: 'item'});
    		var salesOrdersLines 	= _salesOrderRecord.getLineCount({sublistId: 'item'});
    		
    		//Loop through the lines on the fulfilment
    		//
    		for (var ifLine = 0; ifLine < fulfilmentLines; ifLine++) 
	    		{
					var ifItemId = _itemFulfillmentRecord.getSublistValue({
																			sublistId: 	'item',
																			fieldId: 	'item',
																			line: 		ifLine
																			});
					
					var ifItemDesc = _itemFulfillmentRecord.getSublistValue({
																			sublistId: 	'item',
																			fieldId: 	'description',
																			line: 		ifLine
																			});

					var ifItemQty = Number(_itemFulfillmentRecord.getSublistValue({
																			sublistId: 	'item',
																			fieldId: 	'quantity',
																			line: 		ifLine
																			}));
					
					var ifItemOrderLine = _itemFulfillmentRecord.getSublistValue({
																					sublistId: 	'item',
																					fieldId: 	'orderline',
																					line: 		ifLine
																					});

					//Get the rate from the corresponding sales order line
					//
					var soItemRate 		= Number(0);
					var soItemAmount 	= Number(0);
					var soItemQuantity 	= Number(0);
					var soItemValue 	= Number(0);
					var soItemText 		= '';
					
					for (var soLine = 0; soLine < salesOrdersLines; soLine++) 
						{
							var soLineNo = _salesOrderRecord.getSublistValue({
																				sublistId: 	'item',
																				fieldId: 	'line',
																				line: 		soLine
																				});
							
							if(soLineNo == ifItemOrderLine)
								{
									soItemRate = Number(_salesOrderRecord.getSublistValue({
																							sublistId: 	'item',
																							fieldId: 	'rate',
																							line: 		soLine
																							}));
									
									soItemText = _salesOrderRecord.getSublistText({
																							sublistId: 	'item',
																							fieldId: 	'item',
																							line: 		soLine
																							});

									soItemAmount = Number(_salesOrderRecord.getSublistValue({
																							sublistId: 	'item',
																							fieldId: 	'amount',
																							line: 		soLine
																							}));

									soItemQuantity = Number(_salesOrderRecord.getSublistValue({
																							sublistId: 	'item',
																							fieldId: 	'quantity',
																							line: 		soLine
																							}));

									//Allow for the item rate being zero
									//
									if(soItemRate == null || soItemRate == '' || soItemRate == 0)
										{
											soItemRate = soItemAmount / soItemQuantity;
										}
									
									break;
								}
						}
					
					
					//Get data from the item record
					//
					var itemData = search.lookupFields({
														type:		search.Type.ITEM,
														id:			ifItemId,
														columns:	['countryofmanufacture', 'custitem_commodity_code']		
														});
					
					var itemCountry 		= (itemData.hasOwnProperty('countryofmanufacture') ? itemData.countryofmanufacture : '');
					var itemCommodityCode	= (itemData.hasOwnProperty('custitem_commodity_code') ? itemData.custitem_commodity_code : '');
					
					itemInfoArray.push(new BBSObjects.itemInfoObj(soItemText, ifItemDesc, itemCommodityCode, itemCountry, ifItemQty, (ifItemQty * soItemRate)));
				}
    		
    		return itemInfoArray;
    	}
    
    
    
    // ===============================
    // FUNCTION TO GET THE COMPANY URL
    // ===============================
    function getCompanyUrl()
    	{
    		// load the company information
    		var companyInformation = config.load({
    			type: config.Type.COMPANY_INFORMATION
    		});
    		
    		// get the account id
    		var accountId = companyInformation.getValue({
    			fieldId: 'companyid'
    		});
    		
    		// return the company URL
    		return url.resolveDomain({
    			hostType: url.HostType.APPLICATION,
    			accountId: accountId
    		});
    	}
    


    return 	{
        		beforeLoad: carrierIntFulfilmentBL,
    			afterSubmit: carrierIntFulfilmentAS
    		};
    
});
