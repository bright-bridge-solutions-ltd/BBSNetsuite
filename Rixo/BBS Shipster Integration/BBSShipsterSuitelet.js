/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/record', 'N/search', 'N/http', 'N/xml', 'N/format','N/runtime'],
/**
 * @param {file} file
 * @param {record} record
 * @param {search} search
 */
function(file, record, search, http, xml, format, runtime) 
{
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) 
	    {
    		var countries_list = {AD:  'Andorra', AE:  'United Arab Emirates', AF:  'Afghanistan', AG:  'Antigua and Barbuda', AI:  'Anguilla', AL:  'Albania', AM:  'Armenia', AO:  'Angola', AQ:  'Antarctica', AR:  'Argentina', AS:  'American Samoa', AT:  'Austria', AU:  'Australia', AW:  'Aruba', AX:  'Aland Islands', AZ:  'Azerbaijan', BA:  'Bosnia and Herzegovina', BB:  'Barbados', BD:  'Bangladesh', BE:  'Belgium', BF:  'Burkina Faso', BG:  'Bulgaria', BH:  'Bahrain', BI:  'Burundi', BJ:  'Benin', BL:  'Saint Barth�lemy', BM:  'Bermuda', BN:  'Brunei Darrussalam', BO:  'Bolivia', BQ:  'Bonaire, Saint Eustatius, and Saba', BR:  'Brazil', BS:  'Bahamas', BT:  'Bhutan', BV:  'Bouvet Island', BW:  'Botswana', BY:  'Belarus', BZ:  'Belize', CA:  'Canada', CC:  'Cocos (Keeling) Islands', CD:  'Congo, Democratic People\'s Republic', CF:  'Central African Republic', CG:  'Congo, Republic of', CH:  'Switzerland', CI:  'Cote d\'Ivoire', CK:  'Cook Islands', CL:  'Chile', CM:  'Cameroon', CN:  'China', CO:  'Colombia', CR:  'Costa Rica', CU:  'Cuba', CV:  'Cape Verde', CW:  'Curacao', CX:  'Christmas Island', CY:  'Cyprus', CZ:  'Czech Republic', DE:  'Germany', DJ:  'Djibouti', DK:  'Denmark', DM:  'Dominica', DO:  'Dominican Republic', DZ:  'Algeria', EA:  'Ceuta and Melilla', EC:  'Ecuador', EE:  'Estonia', EG:  'Egypt', EH:  'Western Sahara', ER:  'Eritrea', ES:  'Spain', ET:  'Ethiopia', FI:  'Finland', FJ:  'Fiji', FK:  'Falkland Islands', FM:  'Micronesia, Federal State of', FO:  'Faroe Islands', FR:  'France', GA:  'Gabon', GB:  'United Kingdom', GD:  'Grenada', GE:  'Georgia', GF:  'French Guiana', GG:  'Guernsey', GH:  'Ghana', GI:  'Gibraltar', GL:  'Greenland', GM:  'Gambia', GN:  'Guinea', GP:  'Guadeloupe', GQ:  'Equatorial Guinea', GR:  'Greece', GS:  'South Georgia', GT:  'Guatemala', GU:  'Guam', GW:  'Guinea-Bissau', GY:  'Guyana', HK:  'Hong Kong', HM:  'Heard and McDonald Islands', HN:  'Honduras', HR:  'Croatia/Hrvatska', HT:  'Haiti', HU:  'Hungary', IC:  'Canary Islands', ID:  'Indonesia', IE:  'Ireland', IL:  'Israel', IM:  'Isle of Man', IN:  'India', IO:  'British Indian Ocean Territory', IQ:  'Iraq', IR:  'Iran (Islamic Republic of)', IS:  'Iceland', IT:  'Italy', JE:  'Jersey', JM:  'Jamaica', JO:  'Jordan', JP:  'Japan', KE:  'Kenya', KG:  'Kyrgyzstan', KH:  'Cambodia', KI:  'Kiribati', KM:  'Comoros', KN:  'Saint Kitts and Nevis', KP:  'Korea, Democratic People\'s Republic', KR:  'Korea, Republic of', KW:  'Kuwait', KY:  'Cayman Islands', KZ:  'Kazakhstan', LA:  'Lao People\'s Democratic Republic', LB:  'Lebanon', LC:  'Saint Lucia', LI:  'Liechtenstein', LK:  'Sri Lanka', LR:  'Liberia', LS:  'Lesotho', LT:  'Lithuania', LU:  'Luxembourg', LV:  'Latvia', LY:  'Libyan Arab Jamahiriya', MA:  'Morocco', MC:  'Monaco', MD:  'Moldova, Republic of', ME:  'Montenegro', MF:  'Saint Martin', MG:  'Madagascar', MH:  'Marshall Islands', MK:  'Macedonia', ML:  'Mali', MM:  'Myanmar', MN:  'Mongolia', MO:  'Macau', MP:  'Northern Mariana Islands', MQ:  'Martinique', MR:  'Mauritania', MS:  'Montserrat', MT:  'Malta', MU:  'Mauritius', MV:  'Maldives', MW:  'Malawi', MX:  'Mexico', MY:  'Malaysia', MZ:  'Mozambique', NA:  'Namibia', NC:  'New Caledonia', NE:  'Niger', NF:  'Norfolk Island', NG:  'Nigeria', NI:  'Nicaragua', NL:  'Netherlands', NO:  'Norway', NP:  'Nepal', NR:  'Nauru', NU:  'Niue', NZ:  'New Zealand', OM:  'Oman', PA:  'Panama', PE:  'Peru', PF:  'French Polynesia', PG:  'Papua New Guinea', PH:  'Philippines', PK:  'Pakistan', PL:  'Poland', PM:  'St. Pierre and Miquelon', PN:  'Pitcairn Island', PR:  'Puerto Rico', PS:  'Palestinian Territories', PT:  'Portugal', PW:  'Palau', PY:  'Paraguay', QA:  'Qatar', RE:  'Reunion Island', RO:  'Romania', RS:  'Serbia', RU:  'Russian Federation', RW:  'Rwanda', SA:  'Saudi Arabia', SB:  'Solomon Islands', SC:  'Seychelles', SD:  'Sudan', SE:  'Sweden', SG:  'Singapore', SH:  'Saint Helena', SI:  'Slovenia', SJ:  'Svalbard and Jan Mayen Islands', SK:  'Slovak Republic', SL:  'Sierra Leone', SM:  'San Marino', SN:  'Senegal', SO:  'Somalia', SR:  'Suriname', SS:  'South Sudan', ST:  'Sao Tome and Principe', SV:  'El Salvador', SX:  'Sint Maarten', SY:  'Syrian Arab Republic', SZ:  'Swaziland', TC:  'Turks and Caicos Islands', TD:  'Chad', TF:  'French Southern Territories', TG:  'Togo', TH:  'Thailand', TJ:  'Tajikistan', TK:  'Tokelau', TM:  'Turkmenistan', TN:  'Tunisia', TO:  'Tonga', TP:  'East Timor', TR:  'Turkey', TT:  'Trinidad and Tobago', TV:  'Tuvalu', TW:  'Taiwan', TZ:  'Tanzania', UA:  'Ukraine', UG:  'Uganda', UM:  'US Minor Outlying Islands', US:  'United States', UY:  'Uruguay', UZ:  'Uzbekistan', VA:  'Holy See (City Vatican State)', VC:  'Saint Vincent and the Grenadines', VE:  'Venezuela', VG:  'Virgin Islands (British)', VI:  'Virgin Islands (USA)', VN:  'Vietnam', VU:  'Vanuatu', WF:  'Wallis and Futuna Islands', WS:  'Samoa', XK:  'Kosovo', YE:  'Yemen', YT:  'Mayotte', ZA:  'South Africa', ZM:  'Zambia', ZW:  'Zimbabwe'};

	    	if (context.request.method === http.Method.GET) 
		    	{
	    			//Retrieve parameters that were passed from the client script
	        		var recordID 			= context.request.parameters.id;
	        		var fulfilmentRecord	= null;
	        		var customerRecord 		= null;
	        		var transactionRecord	= null;
	        		var customerId			= null;
	        		var createdFromId		= null;
	        		var fileObj				= null;
	        		var supplierID			= null;
	        		var tranId	 			= '';
	        		var xmlString 			= '';
	        		var itemsArray			= [];
	        		var shippingCarriers	= getShippingCarriers();	//Get a list of the carriers available
	        		var manufacturersObject	= {};
	        		
	        		
	        		//Load the item fulfilment (10GU's)
	        		//
	        		try
	        			{
	        				fulfilmentRecord = record.load({
	        												type:		record.Type.ITEM_FULFILLMENT,
	        												id:			recordID
	        												});
	        			}
	        		catch(err)
	        			{
		        			log.error({
										title:		'Error loading fulfilment record with id = ' + recordID,
										details:	err
										});
		        			
		        			fulfilmentRecord	= null;
	        			}

	        		if(fulfilmentRecord != null)
	        			{
	        				var itemDataArray 	= getItemDataInfo(fulfilmentRecord);		//Get all the item information up front so we don't have to look them up for each line
		        		
	        				customerID 			= fulfilmentRecord.getValue({fieldId: 'entity'});
	        				createdFromID		= fulfilmentRecord.getValue({fieldId: 'createdfrom'});
	        				createdFromType		= fulfilmentRecord.getText({fieldId: 'createdfrom'}).split(" #").shift();
	        				tranId				= fulfilmentRecord.getValue({fieldId: 'tranid'});
	        				
	        				// get value of the 'Created PO' field from the first item line of lines on the fulfilment
	        				var dropShipPO = fulfilmentRecord.getSublistValue({
													        					sublistId: 	'item',
													        					fieldId: 	'createdpo',
													        					line: 		0
													        					});
	        				
	        				// if we have a drop ship PO
	        				if (dropShipPO)
	        					{
	        						// lookup fields on the PO record (1Gu's)
	        						supplierID = search.lookupFields({
								        							type: 		search.Type.PURCHASE_ORDER,
								        							id: 		dropShipPO,
								        							columns: 	['entity']
								        							}).entity[0].value;
	        					}
	        				
	        				// if we have a customer ID
	        				if (customerID)
	        					{
			        				//Load the customer (5GU's)
					        		//
					        		try
					        			{
					        				customerRecord = record.load({
					        					type:		record.Type.CUSTOMER,
					        					id:			customerID
					        					});
					        			}
					        		catch(err)
					        			{
						        			log.error({
						        				title:		'Error loading customer record with id = ' + customerId,
												details:	err
											});
						        			
						        			customerRecord 	= null;
					        			}
	        					}
		
			        		//if(customerRecord != null)
			        			//{
					        		//Load the transaction record (10GU's)
					        		//
					        		try
					        			{
					        				if (createdFromType == 'Sales Order')
					        					{					        			
							        				transactionRecord = record.load({
														        					type:		record.Type.SALES_ORDER,
																					id:			createdFromID
																					});
					        					}
					        				else if (createdFromType == 'Transfer Order')
					        					{
						        					transactionRecord = record.load({
																					type:		record.Type.TRANSFER_ORDER,
																					id:			createdFromID
																					});
					        					}
					        			}
					        		catch(err)
					        			{
						        			log.error({
						        				title:		'Error loading ' + createdFromType + ' record with id = ' + createdFromID,
												details:	err
											});
					        			
						        			transactionRecord	= null;
					        			}
					        		
					        		if(transactionRecord != null)
					        			{
					        				//Build the output now we have all the records to work with
					        				//						        			
						        			var salesOrderNumber 			= isNull(transactionRecord.getValue({fieldId: 'tranid'}),'');
						        			var salesOrderTotal				= Number(transactionRecord.getValue({fieldId: 'total'})).toFixed(2);
						        			var salesOrderSubTotal			= Number(transactionRecord.getValue({fieldId: 'subtotal'})).toFixed(2);
						        			var subsidiaryDetails			= getSubsidiaryInfo(transactionRecord.getValue({fieldId: 'subsidiary'}));
						        			var shippedTotal				= Number(0);
						        			var shippedVat					= Number(0);
						        			
						        			if (createdFromType == 'Transfer Order')
						        				{
						        				
						        					//Read in the location record
						        					//
						        					var locationRecord = record.load({
															        					type:		record.Type.LOCATION,
																						id:			fulfilmentRecord.getValue({fieldId: 'transferlocation'})
																						});
						        					
						        					var customerFullName 		= isNull(fulfilmentRecord.getText({fieldId: 'transferlocation'}),'');

								        			var customerEmail 			= isNull(locationRecord.getValue({fieldId: 'custrecord_bbs_location_email'}),'');
						        					var customerPhone 			= isNull(locationRecord.getValue({fieldId: 'custrecord_bbs_location_phone'}),'');
								        			var customerMobile 			= isNull(locationRecord.getValue({fieldId: 'custrecord_bbs_location_phone'}),'');
								        			var customerEORI			= '';
								        			
								        			var customerNumber			= isNull(fulfilmentRecord.getText({fieldId: 'transferlocation'}),'');						        				
						        					var salesOrderChannel 		= 'Transfer';
						        					var salesOrderShopify 		= isNull(transactionRecord.getValue({fieldId: 'tranid'}),'');
						        					var salesOrderCustRef		= isNull(transactionRecord.getValue({fieldId: 'tranid'}),'');
						        					var salesOrderTax			= Number(0).toFixed(2);
								        			var salesOrderDiscount		= Number(0).toFixed(2);
								        			var salesOrderDiscountCode	= '';
								        			
								        			//Additional code to get the billing address, which in this case is the location address
								        			//
								        			var salesOrderBillingAdress	= isNull(locationRecord.getSubrecord({fieldId: 'mainaddress'}),'');
								        			var salesOrderAddr1			= isNull(salesOrderBillingAdress.getValue({fieldId: 'addr1'}),'');
								        			var salesOrderAddr2			= isNull(salesOrderBillingAdress.getValue({fieldId: 'addr2'}),'');
								        			var salesOrderAddr3			= isNull(salesOrderBillingAdress.getValue({fieldId: 'addr3'}),'');
								        			var salesOrderCity			= isNull(salesOrderBillingAdress.getValue({fieldId: 'city'}),'');
								        			var salesOrderState			= isNull(salesOrderBillingAdress.getValue({fieldId: 'state'}),'');
								        			var salesOrderZip			= isNull(salesOrderBillingAdress.getValue({fieldId: 'zip'}),'');
								        			var salesOrderCountry		= isNull(countries_list[salesOrderBillingAdress.getValue({fieldId: 'country'})],'');
								        			
						        				}
						        			else if (createdFromType == 'Sales Order')
						        				{
						        					var customerCompanyName		= isNull(customerRecord.getValue({fieldId: 'companyname'}),'');
						        					var customerFirstName 		= isNull(customerRecord.getValue({fieldId: 'firstname'}),'');
								        			var customerLastName 		= isNull(customerRecord.getValue({fieldId: 'lastname'}),'');
								        			var customerFullName 		= (customerFirstName + ' ' + customerLastName).trim();
								        			var customerEmail			= isNull(customerRecord.getValue({fieldId: 'email'}),'');
								        			var customerPhone 			= isNull(customerRecord.getValue({fieldId: 'phone'}),'');
								        			var customerMobile 			= isNull(customerRecord.getValue({fieldId: 'mobilephone'}),'');
								        			var customerNumber			= isNull(customerRecord.getValue({fieldId: 'entityid'}),'');
								        			var customerEORI			= isNull(customerRecord.getValue({fieldId: 'custentity_bbs_eori'}),'');
								        			
								        			customerFullName 			= (customerFullName != '' ? customerFullName : customerCompanyName);
						        				
						        					var salesOrderChannel 		= isNull(transactionRecord.getText({fieldId: 'class'}),'');
						        					var salesOrderShopify 		= isNull(transactionRecord.getValue({fieldId: 'custbody_bbs_shopify_order_number'}),'');
						        					var salesOrderOtherRef 		= isNull(transactionRecord.getValue({fieldId: 'otherrefnum'}),'');
								        			var salesOrderFarapp		= isNull(transactionRecord.getValue({fieldId: 'custbody_fa_channel_order'}),'');
								        			var salesOrderCustRef		= (salesOrderFarapp != '' ? salesOrderFarapp : (salesOrderOtherRef != '' ? salesOrderOtherRef : ''));
								        			var salesOrderTax			= Number(transactionRecord.getValue({fieldId: 'taxtotal'})).toFixed(2);
								        			var salesOrderDiscount		= Math.abs(Number(transactionRecord.getValue({fieldId: 'discounttotal'}))).toFixed(2);
								        			var salesOrderDiscountCode	= isNull(transactionRecord.getText({fieldId: 'discountitem'}),'');
								        			
								        			//Additional code to get the billing address from the sales order
								        			//
								        			var salesOrderBillingAdress		= isNull(transactionRecord.getSubrecord({fieldId: 'billingaddress'}),'');
								        			var salesOrderAddr1				= isNull(salesOrderBillingAdress.getValue({fieldId: 'addr1'}),'');
								        			var salesOrderAddr2				= isNull(salesOrderBillingAdress.getValue({fieldId: 'addr2'}),'');
								        			var salesOrderAddr3				= isNull(salesOrderBillingAdress.getValue({fieldId: 'addr3'}),'');
								        			var salesOrderCity				= isNull(salesOrderBillingAdress.getValue({fieldId: 'city'}),'');
								        			var salesOrderState				= isNull(salesOrderBillingAdress.getValue({fieldId: 'state'}),'');
								        			var salesOrderZip				= isNull(salesOrderBillingAdress.getValue({fieldId: 'zip'}),'');
								        			var salesOrderCountry			= isNull(countries_list[salesOrderBillingAdress.getValue({fieldId: 'country'})],'');
								        			
						        				}
						        			
						        			var fulfilmentShippingCost		= Number(fulfilmentRecord.getValue({fieldId: 'shippingcost'})).toFixed(2);
						        			var fulfilmentShippingMethod	= isNull(fulfilmentRecord.getText({fieldId: 'shipmethod'}),'');
						        			var fulfilmentShippingMethodId	= isNull(fulfilmentRecord.getValue({fieldId: 'shipmethod'}),'');
						        			var fulfilmentShippingCarrier	= isNull(shippingCarriers[fulfilmentShippingMethodId],'');
						        			var fulfilmentDate				= isNull(fulfilmentRecord.getText({fieldId: 'trandate'}),'');
						        			var fulfilmentShippedDate		= isNull(fulfilmentRecord.getText({fieldId: 'shippeddate'}),'');
						        			var fulfilmentReference			= isNull(fulfilmentRecord.getValue({fieldId: 'tranid'}),'');
						        			var fulfilmentCurrency			= isNull(fulfilmentRecord.getValue({fieldId: 'currencycode'}),'');
						        			var fulfilmentShipAdress		= isNull(fulfilmentRecord.getSubrecord({fieldId: 'shippingaddress'}),'');
						        			var fulfilmentAddr1				= isNull(fulfilmentShipAdress.getValue({fieldId: 'addr1'}),'');
						        			var fulfilmentAddr2				= isNull(fulfilmentShipAdress.getValue({fieldId: 'addr2'}),'');
						        			var fulfilmentAddr3				= isNull(fulfilmentShipAdress.getValue({fieldId: 'addr3'}),'');
						        			var fulfilmentCity				= isNull(fulfilmentShipAdress.getValue({fieldId: 'city'}),'');
						        			var fulfilmentState				= isNull(fulfilmentShipAdress.getValue({fieldId: 'state'}),'');
						        			var fulfilmentZip				= isNull(fulfilmentShipAdress.getValue({fieldId: 'zip'}),'');
						        			var fulfilmentAddrPhone			= isNull(fulfilmentShipAdress.getValue({fieldId: 'addrphone'}),'');
						        			var fulfilmentCountry			= isNull(countries_list[fulfilmentShipAdress.getValue({fieldId: 'country'})],'');
						        			
						        			customerPhone = (customerPhone == null || customerPhone == '' ? fulfilmentAddrPhone : customerPhone);
						        			
						        			//Start of xml
						        			//
					        				xmlString += '<Despatch xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
					        				xmlString += '<ImportFormat>SHP</ImportFormat>\n';
					        				xmlString += '<CustomerName>' 				+ xml.escape({xmlText: customerFullName.substring(0,35)}) 			+ '</CustomerName>\n';
					        				xmlString += '<CustomerEmail>' 				+ xml.escape({xmlText: customerEmail}) 								+ '</CustomerEmail>\n';
					        				xmlString += '<CarrierName>' 				+ xml.escape({xmlText: fulfilmentShippingCarrier}) 					+ '</CarrierName>\n';
					        				xmlString += '<ServiceTypeName>' 			+ xml.escape({xmlText: fulfilmentShippingMethod}) 					+ '</ServiceTypeName>\n';
					        				xmlString += '<SalesOrderNumber>' 			+ xml.escape({xmlText: salesOrderNumber}) 							+ '</SalesOrderNumber>\n';
					        				xmlString += '<ShippingCost>' 				+ xml.escape({xmlText: fulfilmentShippingCost}) 					+ '</ShippingCost>\n';
					        				xmlString += '<CustomerReference>' 			+ xml.escape({xmlText: salesOrderCustRef}) 							+ '</CustomerReference>\n';
					        				xmlString += '<CustomerPhone>' 				+ xml.escape({xmlText: customerPhone}) 								+ '</CustomerPhone>\n';
					        				xmlString += '<CustomerMobile>' 			+ xml.escape({xmlText: customerMobile}) 							+ '</CustomerMobile>\n';
					        		//		xmlString += '<TotalSale>' 					+ xml.escape({xmlText: salesOrderTotal}) 							+ '</TotalSale>\n';
					        				xmlString += '<TotalSale>' 					+ '{shiptotal}'														+ '</TotalSale>\n';
					        				xmlString += '<Discount>' 					+ xml.escape({xmlText: salesOrderDiscount}) 						+ '</Discount>\n';
					        		//		xmlString += '<TaxPaid>' 					+ xml.escape({xmlText: salesOrderTax}) 								+ '</TaxPaid>\n';
					        				xmlString += '<TaxPaid>' 					+ '{vattotal}' 														+ '</TaxPaid>\n';
					        				
					        				xmlString += '<CreatedDate>' 				+ xml.escape({xmlText: fulfilmentDate}) 							+ '</CreatedDate>\n';
					        				xmlString += '<ChannelName>' 				+ xml.escape({xmlText: salesOrderChannel}) 							+ '</ChannelName>\n';
					        				
					        				xmlString += '<InvoiceAddressCustomerName>'	+ xml.escape({xmlText: customerFullName.substring(0,35)}) 			+ '</InvoiceAddressCustomerName>\n';
					        				xmlString += '<InvoiceAddressLine1>' 		+ xml.escape({xmlText: salesOrderAddr1.substring(0,35)}) 			+ '</InvoiceAddressLine1>\n';
					        				xmlString += '<InvoiceAddressLine2>' 		+ xml.escape({xmlText: salesOrderAddr2.substring(0,35)}) 			+ '</InvoiceAddressLine2>\n';
					        				xmlString += '<InvoiceAddressTownCity>' 	+ xml.escape({xmlText: salesOrderCity.substring(0,35)}) 			+ '</InvoiceAddressTownCity>\n';
					        				xmlString += '<InvoiceAddressRegion>' 		+ xml.escape({xmlText: salesOrderState.substring(0,35)}) 			+ '</InvoiceAddressRegion>\n';
					        				xmlString += '<InvoiceAddressPostCode>' 	+ xml.escape({xmlText: salesOrderZip}) 								+ '</InvoiceAddressPostCode>\n';
					        				xmlString += '<InvoiceAddressCountry>' 		+ xml.escape({xmlText: salesOrderCountry.substring(0,35)}) 				+ '</InvoiceAddressCountry>\n';
					        			
					        				xmlString += '<ShippingAddressLine1>' 		+ xml.escape({xmlText: fulfilmentAddr1.substring(0,35)}) 			+ '</ShippingAddressLine1>\n';
					        				xmlString += '<ShippingAddressLine2>' 		+ xml.escape({xmlText: fulfilmentAddr2.substring(0,35)}) 			+ '</ShippingAddressLine2>\n';
					        				xmlString += '<ShippingAddressTownCity>' 	+ xml.escape({xmlText: fulfilmentCity.substring(0,35)}) 			+ '</ShippingAddressTownCity>\n';
					        				xmlString += '<ShippingAddressRegion>' 		+ xml.escape({xmlText: fulfilmentState.substring(0,35)}) 			+ '</ShippingAddressRegion>\n';
					        				xmlString += '<ShippingAddressPostCode>' 	+ xml.escape({xmlText: fulfilmentZip}) 								+ '</ShippingAddressPostCode>\n';
					        				xmlString += '<ShippingAddressCountry>' 	+ xml.escape({xmlText: fulfilmentCountry.substring(0,35)}) 			+ '</ShippingAddressCountry>\n';
					        				xmlString += '<DespatchNumber>' 			+ xml.escape({xmlText: fulfilmentReference}) 						+ '</DespatchNumber>\n';
					        				xmlString += '<DespatchDate>' 				+ xml.escape({xmlText: fulfilmentShippedDate}) 						+ '</DespatchDate>\n';
					        									        				
					        				//Items
					        				//
					        				xmlString += '<Items>\n';
					        				
					        				var itemCount = fulfilmentRecord.getLineCount({sublistId: 'item'});
					        				
					        				for (var items = 0; items < itemCount; items++) 
					        					{
					        						var itemId				= fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: items});
					        						var itemType			= fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: items});
				        							var itemName			= fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'itemname', line: items});
					        						var itemDescription		= fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'description', line: items});
						        					var itemQuantity		= Number(fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: items}));
						        					var itemPackages		= getPackages(fulfilmentRecord, items);
						        					var itemSoLine			= Number(fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'orderline', line: items}));
						        					var itemUnitWeight		= getItemWeightInKilos(itemId, itemDataArray);
						        					var itemSoRate			= Number(0);
						        					var itemSoCost			= Number(0);
						        					var itemSoVat			= Number(0);
						        					var itemSoVatRate		= Number(0);
						        					
						        					//Get additional info from the item record (commodity code, country of manufacture, item group name & prefered supplier address)
						        					//
						        					var itemAdditionalDetails = getItemAdditionalDetails(itemId, itemType, countries_list, itemDataArray);
						        					
						        					//Save any manufacturers address
						        					//
						        					manufacturersObject[itemAdditionalDetails.countryOfManufacture] = itemAdditionalDetails.address;
						        					
						        					
						        					//Get the item rate & cost from the related sales order line
						        					//
						        					var soLineCount = transactionRecord.getLineCount({sublistId: 'item'});
							        				
						        					for (var soLine = 0; soLine < soLineCount; soLine++) 
							        					{
						        							//Get the current sales order line number
						        							//
						        							var	soLineNumber 		= Number(transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'line', line: soLine}));
						        							
						        							//Do the line numbers match?
						        							//
						        							if(soLineNumber == itemSoLine)
						        								{
										        					itemSoRate			= Number(transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: soLine}));
										        					itemSoCost			= Number(transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'costestimaterate', line: soLine}));
										        					itemSoVat			= Number(transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'tax1amt', line: soLine}));
										        					itemSoVatRate		= Number(transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'taxrate1', line: soLine}));
										        					
										        					break;
						        								}
							        					}
						        					
						        					//Calculate the shipped value & vat
						        					//
						        					shippedTotal 	+= (itemSoRate * itemQuantity);
						        					shippedVat		+= ((itemSoRate * itemQuantity) / 100.00) * itemSoVatRate;
						        						
						        					//Save info about the item & what packages it belongs to
						        					//
						        					itemsArray.push(new itemInfo(itemName, 
						        												itemDescription, 
						        												itemQuantity, 
						        												itemSoRate, 
						        												itemSoCost, 
						        												itemPackages, 
						        												itemUnitWeight, 
						        												itemSoVat, 
						        												itemAdditionalDetails.commodityCode, 
						        												itemAdditionalDetails.countryOfManufacture, 
						        												itemAdditionalDetails.groupName));
						        					
						        					//Output item detail
						        					//
						        					xmlString += '<Item>\n';
						        					
						        					xmlString += '<Name>' 					+ xml.escape({xmlText: itemAdditionalDetails.displayName + ' ' + itemAdditionalDetails.size})		+ '</Name>\n';
						        					xmlString += '<Description>' 			+ xml.escape({xmlText: itemDescription}) 															+ '</Description>\n';
						        					xmlString += '<ItemCode>' 				+ xml.escape({xmlText: itemName}) 																	+ '</ItemCode>\n';
						        					xmlString += '<QuantityOrdered>' 		+ xml.escape({xmlText: itemQuantity.toFixed(2)}) 													+ '</QuantityOrdered>\n';
						        					xmlString += '<BuyPrice>' 				+ xml.escape({xmlText: (itemQuantity * itemSoCost).toFixed(2)}) 									+ '</BuyPrice>\n';
						        					xmlString += '<RetailPrice>' 			+ xml.escape({xmlText: (itemQuantity * itemSoRate).toFixed(2)}) 									+ '</RetailPrice>\n';
						        					xmlString += '<Weight>' 				+ xml.escape({xmlText: itemUnitWeight.toFixed(2)}) 													+ '</Weight>\n';
						        					xmlString += '<TotalGrossWeight></TotalGrossWeight>\n';
						        					xmlString += '<Attribute1>' 			+ xml.escape({xmlText: itemSoRate.toFixed(2)}) 														+ '</Attribute1>\n';
						        					xmlString += '<Attribute2>' 			+ xml.escape({xmlText: itemSoVat.toFixed(2)}) 														+ '</Attribute2>\n';
						        					xmlString += '<CommodityCode>' 			+ xml.escape({xmlText: itemAdditionalDetails.commodityCode}) 										+ '</CommodityCode>\n';
						        					xmlString += '<CountryOfManufacture>' 	+ xml.escape({xmlText: itemAdditionalDetails.countryOfManufacture}) 								+ '</CountryOfManufacture>\n';
						        					xmlString += '<ItemGroupName>' 			+ xml.escape({xmlText: itemAdditionalDetails.groupName}) 											+ '</ItemGroupName>\n';
						        					
						        					xmlString += '</Item>\n';
						        					
					        					}
					        				
					        				xmlString += '</Items>\n';
					        				
					        			
					        				//Packages
					        				//
					        				xmlString += '<Packages>\n';
					        				
					        				var packageCount 		= fulfilmentRecord.getLineCount({sublistId: 'package'});
					        				var totalPackageWeight	= Number(0);
					        				
					        				for (var packages = 0; packages < packageCount; packages++) 
					        					{
					        						var packageWeight	= Number(fulfilmentRecord.getSublistValue({sublistId: 'package', fieldId: 'packageweight', line: packages}));
					        						var packageName		= fulfilmentRecord.getSublistValue({sublistId: 'package', fieldId: 'packagedescr', line: packages});
					        					
					        						if(packageName != null && packageName != '')
					        							{
							        						totalPackageWeight += packageWeight;
							        						
							        						//Start of new package
							        						//
							        						xmlString += '<DespatchPackage>\n';
							        						xmlString += '<PackageName>' 			+ xml.escape({xmlText: packageName}) 					+ '</PackageName>\n';
							        						xmlString += '<Weight>' 				+ xml.escape({xmlText: packageWeight.toFixed(2)}) 		+ '</Weight>\n';
							        						xmlString += '<TotalGrossWeight></TotalGrossWeight>\n';
								        					
								        					//Items in package
								        					//
								        					xmlString += '<Items>\n';
								        					
								        					for (var itemIndex = 0; itemIndex < itemsArray.length; itemIndex++) 
								        						{
								        							var packagesArray = itemsArray[itemIndex].packages;
								        							
								        							for (var packageIndex = 0; packageIndex < packagesArray.length; packageIndex++) 
											        					{
									        								if(packagesArray[packageIndex].package == packageName)
										        								{
											        								xmlString += '<Item>\n';
											        								
														        					xmlString += '<Name>' 					+ xml.escape({xmlText: itemsArray[itemIndex].description}) 																+ '</Name>\n';
														        					xmlString += '<ItemCode>' 				+ xml.escape({xmlText: itemsArray[itemIndex].name}) 																	+ '</ItemCode>\n';
														        					xmlString += '<QuantityOrdered>' 		+ xml.escape({xmlText: packagesArray[packageIndex].quantity.toFixed(2)}) 												+ '</QuantityOrdered>\n';
														        					xmlString += '<BuyPrice>' 				+ xml.escape({xmlText: (packagesArray[packageIndex].quantity * itemsArray[itemIndex].cost).toFixed(2)}) 				+ '</BuyPrice>\n';
														        					xmlString += '<RetailPrice>' 			+ xml.escape({xmlText: (packagesArray[packageIndex].quantity * itemsArray[itemIndex].rate).toFixed(2)}) 				+ '</RetailPrice>\n';
														        					xmlString += '<Weight>' 				+ xml.escape({xmlText: itemsArray[itemIndex].itemUnitWeight.toFixed(2)}) 												+ '</Weight>\n';
														        					xmlString += '<TotalGrossWeight></TotalGrossWeight>\n';
														        					xmlString += '<Attribute1>' 			+ xml.escape({xmlText: itemsArray[itemIndex].rate.toFixed(2)}) 															+ '</Attribute1>\n';
														        					xmlString += '<Attribute2>' 			+ xml.escape({xmlText: itemsArray[itemIndex].vat.toFixed(2)}) 															+ '</Attribute2>\n';
														        					xmlString += '<CommodityCode>' 			+ xml.escape({xmlText: itemsArray[itemIndex].commodityCode}) 															+ '</CommodityCode>\n';
														        					xmlString += '<CountryOfManufacture>' 	+ xml.escape({xmlText: itemsArray[itemIndex].countryOfManufacture}) 													+ '</CountryOfManufacture>\n';
														        					xmlString += '<ItemGroupName>' 			+ xml.escape({xmlText: itemsArray[itemIndex].groupName}) 																+ '</ItemGroupName>\n';
														        					
														        					xmlString += '</Item>\n';
										        								}
											        					}
								        						}
								        					
								        					xmlString += '</Items>\n';
								        					
								        					//End of package
								        					//
								        					xmlString += '</DespatchPackage>\n';
						        					
					        							}
					        					}
					        				
					        				//End of packages
					        				//
					        				xmlString += '</Packages>\n';
					        				
					        				
					        				//Custom attributes
					        				//
					        				xmlString += '<Attribute1>' 				+ xml.escape({xmlText: customerNumber}) 			+ '</Attribute1>\n';
					        				
					        				//Fill in the manufacturers details if any
					        				//
					        				xmlString += '<Attribute2>';
					        				
					        				for (var manufacturer in manufacturersObject) 
						        				{
						    						xmlString += (manufacturersObject[manufacturer].address1 != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].address1}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].address2 != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].address2}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].town != ''     	? xml.escape({xmlText: manufacturersObject[manufacturer].town}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].county != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].county}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].postCode != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].postCode}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].country != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].country}) + '&#10;&#10;' : '');
					        					}		        				
					        				
					        				xmlString += '</Attribute2>\n';
					        						        				
					        				//Custom attributes
					        				//
					        				xmlString += '<Attribute3>' 				+ xml.escape({xmlText: salesOrderDiscountCode}) 	+ '</Attribute3>\n';
					        		//		xmlString += '<Attribute4>' 				+ xml.escape({xmlText: salesOrderSubTotal}) 		+ '</Attribute4>\n';
					        				xmlString += '<Attribute4>' 				+ shippedTotal.toFixed(2)							+ '</Attribute4>\n';
					        				
					        				// if we have a supplierID
					        				if (supplierID)
					        					{
					        						// add the Attribute5 tag
					        						xmlString += '<Attribute5>' + xml.escape({xmlText: supplierID}) + '</Attribute5>\n';
					        					}
					        				
					        				// if we have subsidiary details
					        				if (subsidiaryDetails)
					        					{
					        						// add the Attribute6 tag
					        						xmlString += '<Attribute6>' + xml.escape({xmlText: subsidiaryDetails}) + '</Attribute6>\n';
					        					}
					        				
					        				if(customerEORI != null && customerEORI != '')
					        					{
						        					// add the Attribute7 tag
					        						xmlString += '<Attribute7>' + xml.escape({xmlText: customerEORI}) + '</Attribute7>\n';
					        					}
					        				
					        				//Other sundry tags
					        				//
					        				xmlString += '<PaymentMethod/>\n';
					        				xmlString += '<PropertyName/>\n';
					        				xmlString += '<TotalGrossWeight></TotalGrossWeight>\n';
					        			//	xmlString += '<TotalPrice>' 			+ xml.escape({xmlText: salesOrderTotal}) 					+ '</TotalPrice>\n';
					        				xmlString += '<TotalPrice>' 			+ (shippedTotal + shippedVat).toFixed(2)					+ '</TotalPrice>\n';
					        				xmlString += '<CurrencyCode>' 			+ xml.escape({xmlText: fulfilmentCurrency}) 				+ '</CurrencyCode>\n';
					        				xmlString += '<WeightType>KG</WeightType>\n';
					        				xmlString += '<MeasureType>CM</MeasureType>\n';
					        				xmlString += '<ImportFormat>SHP</ImportFormat>\n';
					        				xmlString += '<ImportFileFormat>XML</ImportFileFormat>\n';
					        				xmlString += '</Despatch>\n';
					        				
					        				//Update the placeholders for the sales & vat totals
					        				//
					        				xmlString = xmlString.replace("{shiptotal}", (shippedTotal + shippedVat).toFixed(2));
					        				xmlString = xmlString.replace("{vattotal}",  shippedVat.toFixed(2));
					        				
					        				
					        				//Create a file to hold the results (0GU's)
					        				//
					        				fileObj = file.create({
					        										name:		'Shipster_' + tranId + '.shp',
					        										fileType:	file.Type.PLAINTEXT,
					        										contents:	xmlString
					        										});
					        				
					        				//Update the fulfilment record to show it's been exported to Shipster
					        				//
					        				try
					        					{
					        						record.submitFields({
					        											type:		record.Type.ITEM_FULFILLMENT,
					        											id:			recordID,
					        											values:		{
					        															shipstatus:							'C',
					        															custbody_bbs_exported_to_shipster:	true
					        														},
					        											options:	{
					        														enablesourcing:			false,
					        														ignoreMandatoryFields:	true
					        														}
					        											});

					        					}
					        				catch(err)
					        					{
						        					log.error({
																title:		'Error marking fulfillment record as exported to shipster with id = ' + recordID,
																details:	err
																});
					        					}
					        				
					        				//Return the file to the browser
					        				//
					        				context.response.writeFile({
					        											file:		fileObj,
					        											isInline:	false
					        											});
					        			//}
			        			}
	        			}
		    	}
	    }
    
    function isNull(_string, _replacer)
	    {
	    	if(_string == null)
	    		{
	    			return _replacer;
	    		}
	    	else
	    		{
	    			return _string;
	    		}
	    }

    function getItemRecordType(_itemType)
	    {
	    	var itemRecordType = '';
	    	
	    	switch(_itemType)
	    	{
	    		case 'InvtPart':
	    			itemRecordType = 'inventoryitem';
	    			break;
	    		
	    		case 'NonInvtPart':
	    			itemRecordType = 'noninventoryitem';
	    			break;
	    		
	    		case 'Assembly':
	    			itemRecordType = 'assemblyitem';
	    			break;
	    			
	    		case 'NonInvtPart':
	    			itemRecordType = 'noninventoryitem';
	    			break;
	    	}
	
	    	return itemRecordType;
	    }
    
    function getItemAdditionalDetails(_itemId, _itemType, _countries_list, _itemDataArray)
    	{
    		var additionalInfoObj 		= null;
    		var itemRecord 				= null;
    		var commodityCode			= '';
    		var countryOfManufacture 	= '';
    		var groupName				= '';
    		var addr1 					= '';
			var addr2 					= '';
			var city 					= '';
			var state 					= '';
			var zip 					= '';
			var country 				= '';
			var displayName				= '';
			var size					= '';
			
			try
				{
					commodityCode 			= _itemDataArray[_itemId].itemCommodityCode;
					countryOfManufacture	= _itemDataArray[_itemId].itemManuCountry;
					groupName				= _itemDataArray[_itemId].item01Cat;
					displayName				= _itemDataArray[_itemId].itemDisplayName;
					size					= _itemDataArray[_itemId].item05Size;
					addr1					= _itemDataArray[_itemId].itemSuppAddr1;
					addr2					= _itemDataArray[_itemId].itemSuppAddr2;
					city					= _itemDataArray[_itemId].itemSuppCity;
					state					= _itemDataArray[_itemId].itemSuppCounty;
					zip						= _itemDataArray[_itemId].itemSuppPostCode;
					country					= _itemDataArray[_itemId].itemSuppCountry;
					
					if(countryOfManufacture != null && countryOfManufacture != '')
		    			{
							countryOfManufacture = _countries_list[countryOfManufacture];
		    			}
					
					if(country != null && country != '')
		    			{
							country = _countries_list[country];
		    			}
				}
			catch(err)
				{
				
				}
			
			additionalInfoObj = new itemAdditionalInfo(
														commodityCode, 
														countryOfManufacture, 
														groupName,
														displayName,
														size,
														new addressObject(addr1, addr2, city, state, zip, country)
														); 
    		return additionalInfoObj;
    	}
    
    function getItemWeightInKilos(_itemId, _itemDataArray)
    	{
    		var weightInKg 		= 0;
    		var itemWeightUnit 	= null;
    		var itemWeight		= 0;
    		
    		try
    			{
    				weightInKg 		= Number(_itemDataArray[_itemId].itemWeight);
    				itemWeightUnit 	= Number(_itemDataArray[_itemId].itemWeightUnit);
    			}
    		catch(err)
    			{
    				itemWeight		= 0;
    				itemWeightUnit 	= null;
    				
    				log.error({
		    			 		title: 'Error Retrieving Item Weight',
		    			 		details: err
    			 			});
    			}

    		
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

    		return weightInKg;
    	}
    
    function getPackages(_fulfilmentRecord, _lineNo)
	    {
	    	var packageData = [];
	    	
	    	var inventoryDetail = _fulfilmentRecord.getSublistSubrecord({
																    	    sublistId: 	'item',
																    	    fieldId: 	'inventorydetail',
																    	    line: 		_lineNo
	    																});
	    	if(inventoryDetail != null)
	    		{
	    			var inventoryAssignments = inventoryDetail.getLineCount({sublistId: 'inventoryassignment'});
	    			
	    			for (var inventoryAssignment = 0; inventoryAssignment < inventoryAssignments; inventoryAssignment++) 
	    				{
    						var packageName = inventoryDetail.getSublistValue({sublistId: 'inventoryassignment', fieldId: 'custrecord_wmsse_packing_container', line: inventoryAssignment});		
    						var packageQty 	= Number(inventoryDetail.getSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', line: inventoryAssignment}));	
    						
    						packageData.push(new packageInfo(packageName, packageQty));
	    				}
	    		}
	    	
	    	return packageData;
	    }
    
    function getShippingCarriers()
    	{
    		var shipppingItemObj = {};
    		
	    	var shipitemSearchObj = getResults(search.create({
									    		   type: "shipitem",
									    		   filters:
									    		   [
									    		      ["isinactive","is","F"]
									    		   ],
									    		   columns:
									    		   [
									    		      search.createColumn({name: "itemid",label: "Name"}),
									    		      search.createColumn({name: "carrier", label: "Carrier"}),
									    		      search.createColumn({name: "description", label: "Description"}),
									    		      search.createColumn({name: "displayname", label: "Display Name"}),
									    		      search.createColumn({name: "internalid", label: "Internal ID"})
									    		   ]
									    		}));
	    	if(shipitemSearchObj != null && shipitemSearchObj.length > 0)
	    		{
		    		for (var shipItem = 0; shipItem < shipitemSearchObj.length; shipItem++) 
						{
		    				var shipItemId 		= shipitemSearchObj[shipItem].getValue({name: "internalid"});
		    				var shipItemCarrier = shipitemSearchObj[shipItem].getValue({name: "description"});
						
		    				shipppingItemObj[shipItemId] = shipItemCarrier;
						}
	    		}
    	
	    	return shipppingItemObj;
    	}
    
    function getItemDataInfo(_fulfilmentRecord)
    	{
	    	var itemCount 	= _fulfilmentRecord.getLineCount({sublistId: 'item'});
	    	var itemData 	= {};
	    	var itemIds		= [];
    		
			for (var items = 0; items < itemCount; items++) 
				{
					var itemId = _fulfilmentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: items});
					itemIds.push(itemId);
				}
			
    		    		
    		var itemSearchObj = getResults(search.create({
    			   type: "item",
    			   filters:
    			   [
    			    	["internalid","anyof",itemIds]
    			   ],
    			   columns:
    			   [
    			      search.createColumn({name: "itemid",sort: search.Sort.ASC,label: "Name"}),
    			      search.createColumn({name: "internalid", label: "Internal ID"}),
    			      search.createColumn({name: "custitem_commodity_code", label: "Commodity Code"}),
    			      search.createColumn({name: "countryofmanufacture", label: "Manufacturer Country"}),
    			      search.createColumn({name: "displayname", label: "Display Name"}),
    			      search.createColumn({name: "weight", label: "Weight"}),
    			      search.createColumn({name: "weightunit", label: "Weight Units"}),
    			      search.createColumn({name: "custitem_bbs_matrix_cat", label: "01-CAT"}),
    			      search.createColumn({name: "custitem_bbs_matrix_size", label: "05-Size"}),
    			      search.createColumn({name: "entityid",join: "preferredVendor",label: "Preferred Supplier Name"}),
    			      search.createColumn({name: "billaddress1",join: "preferredVendor",label: "Billing Address 1"}),
    			      search.createColumn({name: "billaddress2",join: "preferredVendor",label: "Billing Address 2"}),
    			      search.createColumn({name: "billaddress3",join: "preferredVendor",label: "Billing Address 3"}),
    			      search.createColumn({name: "billcity",join: "preferredVendor",label: "Billing City"}),
    			      search.createColumn({name: "billcountry",join: "preferredVendor",label: "Billing Country"}),
    			      search.createColumn({name: "billzipcode",join: "preferredVendor",label: "Billing Zip"}),
    			      search.createColumn({name: "billstate",join: "preferredVendor",label: "Billing State/Province"}),
    			      search.createColumn({name: "billcountrycode",join: "preferredVendor",label: "Billing Country Code"}),
    			       search.createColumn({name: "shipaddress1",join: "preferredVendor",label: "Shipping Address 1"}),
    			       search.createColumn({name: "shipaddress2",join: "preferredVendor",label: "Shipping Address 2"}),
    			       search.createColumn({name: "shipaddress3",join: "preferredVendor",label: "Shipping Address 3"}),
    			       search.createColumn({name: "shipcity",join: "preferredVendor",label: "Shipping City"}),
    			       search.createColumn({name: "shipcountry",join: "preferredVendor",label: "Shipping Country"}),
    			       search.createColumn({name: "shipcountrycode",join: "preferredVendor",label: "Shipping Country Code"}),
    			       search.createColumn({name: "shipstate",join: "preferredVendor",label: "Shipping State/Province"}),
    			       search.createColumn({name: "shipzip",join: "preferredVendor",label: "Shipping Zip"})
    			   ]
    			}));
    			
    		if(itemSearchObj != null && itemSearchObj.length > 0)
    			{
    				for (var itemLoop = 0; itemLoop < itemSearchObj.length; itemLoop++) 
	    				{
	    					var itemName	 		= itemSearchObj[itemLoop].getValue({name:	"itemid"});
	    					var itemInternalId 		= itemSearchObj[itemLoop].getValue({name:	"internalid"});
	    					var itemCommodityCode	= itemSearchObj[itemLoop].getValue({name:	"custitem_commodity_code"});
	    					var itemManuCountry		= itemSearchObj[itemLoop].getValue({name:	"countryofmanufacture"});
	    					var itemDisplayName		= itemSearchObj[itemLoop].getValue({name:	"displayname"});
	    					var itemWeight			= itemSearchObj[itemLoop].getValue({name:	"weight"});
	    					var itemWeightUnit 		= itemSearchObj[itemLoop].getValue({name:	"weightunit"});
	    					var item01Cat			= itemSearchObj[itemLoop].getText({name:	"custitem_bbs_matrix_cat"});
	    					var item05Size			= itemSearchObj[itemLoop].getText({name:	"custitem_bbs_matrix_size"});
	    					var itemSuppName 		= itemSearchObj[itemLoop].getValue({name: 	"entityid",			join: "preferredVendor"});
	    					var itemSuppAddr1		= itemSearchObj[itemLoop].getValue({name: 	"shipaddress1",		join: "preferredVendor"});
	    					var itemSuppAddr2 		= itemSearchObj[itemLoop].getValue({name:	"shipaddress2",		join: "preferredVendor"});
	    					var itemSuppAddr3 		= itemSearchObj[itemLoop].getValue({name:	"shipaddress3",		join: "preferredVendor"});
	    					var itemSuppCity 		= itemSearchObj[itemLoop].getValue({name: 	"shipcity",			join: "preferredVendor"});
	    					var itemSuppCountry		= itemSearchObj[itemLoop].getValue({name: 	"shipcountry",		join: "preferredVendor"});
	    					var itemSuppPostCode	= itemSearchObj[itemLoop].getValue({name: 	"shipzip",			join: "preferredVendor"});
	    					var itemSuppCounty		= itemSearchObj[itemLoop].getValue({name: 	"shipstate",		join: "preferredVendor"});
	    					var itemSuppCountryCode = itemSearchObj[itemLoop].getValue({name: 	"shipcountrycode",	join: "preferredVendor"});
							
	    					itemData[itemInternalId] = new itemDataInfoObj(itemName,itemInternalId,itemCommodityCode,itemManuCountry,itemDisplayName,itemWeight,itemWeightUnit,item01Cat,item05Size,itemSuppName,itemSuppAddr1,itemSuppAddr2,itemSuppAddr3,itemSuppCity,itemSuppCountry,itemSuppPostCode,itemSuppCounty,itemSuppCountryCode );
						}
    			} 
    		
    		
    		return itemData;
    	}
    
 
    function addressObject(_address1, _address2, _town, _county, _postCode, _country)
    	{
	    	this.address1				= _address1;
			this.address2				= _address2;
			this.town					= _town;
			this.county					= _county;
			this.postCode				= _postCode;
			this.country				= _country;
    	}
    
    function itemAdditionalInfo(_commodityCode, _countryOfManufacture, _groupName, _displayName, _size, _address)
    	{
    		this.commodityCode			= _commodityCode;
    		this.countryOfManufacture	= _countryOfManufacture;
    		this.groupName				= _groupName;
    		this.displayName			= _displayName;
    		this.size					= _size;
    		this.address				= _address;
    	}
    
    function itemDataInfoObj(_itemName,_itemInternalId,_itemCommodityCode,_itemManuCountry,_itemDisplayName,_itemWeight,_itemWeightUnit,_item01Cat,_item05Size,_itemSuppName,_itemSuppAddr1,_itemSuppAddr2,_itemSuppAddr3,_itemSuppCity,_itemSuppCountry,_itemSuppPostCode,_itemSuppCounty,_itemSuppCountryCode )
    	{
	    	this.itemName	 			= _itemName;
	    	this.itemInternalId 		= _itemInternalId;
	    	this.itemCommodityCode		= _itemCommodityCode;
	    	this.itemManuCountry		= _itemManuCountry;
	    	this.itemDisplayName		= _itemDisplayName;
	    	this.itemWeight				= _itemWeight;
	    	this.itemWeightUnit 		= _itemWeightUnit;
	    	this.item01Cat				= _item01Cat;
	    	this.item05Size				= _item05Size;
	    	this.itemSuppName 			= _itemSuppName;
	    	this.itemSuppAddr1			= _itemSuppAddr1;
	    	this.itemSuppAddr2 			= _itemSuppAddr2;
	    	this.itemSuppAddr3 			= _itemSuppAddr3;
	    	this.itemSuppCity 			= _itemSuppCity;
	    	this.itemSuppCountry		= _itemSuppCountry;
	    	this.itemSuppPostCode		= _itemSuppPostCode;
	    	this.itemSuppCounty			= _itemSuppCounty;
	    	this.itemSuppCountryCode 	= _itemSuppCountryCode;
    	}
    
    function itemInfo(_name, _description, _quantity, _rate, _cost, _packages, _itemUnitWeight, _vat, _commodityCode, _countryOfManufacture, _groupName)
    	{
    		this.name					= _name;
    		this.description			= _description;
    		this.quantity				= _quantity;
    		this.rate					= _rate;
    		this.cost					= _cost;
    		this.packages				= _packages;
    		this.itemUnitWeight			= _itemUnitWeight;
    		this.vat					= _vat;
    		this.commodityCode			= _commodityCode;
    		this.countryOfManufacture	= _countryOfManufacture;
    		this.groupName				= _groupName;
    	}
    
    function packageInfo(_package, _quantity)
		{
			this.quantity		= _quantity;
			this.package		= _package;
		}
	    
	 function getSubsidiaryInfo(subsidiaryID) {
		 
		 // declare and initialize variables
		 var returnString = '';
		 
		 try
		 	{
			 	// load the subsidiary record
			 	var subsidiaryRecord = record.load({
			 		type: record.Type.SUBSIDIARY,
			 		id: subsidiaryID
			 	});
			 	
			 	// retrieve values from the subsidiary record
			 	var companyReg = subsidiaryRecord.getValue({
			 		fieldId: 'custrecord_bbs_company_reg_no'
			 	});
			 	
			 	// get the address subrecord
			 	var addressSubrecord = subsidiaryRecord.getSubrecord({
			 		fieldId: 'mainaddress'
			 	});
			 	
			 	// get address fields
			 	var address1 = addressSubrecord.getValue({
			 		fieldId: 'addr1'
			 	});
			 	
			 	var address2 = addressSubrecord.getValue({
			 		fieldId: 'addr2'
			 	});
			 	
			 	var addressCity = addressSubrecord.getValue({
			 		fieldId: 'city'
			 	});
			 	
			 	var addressCounty = addressSubrecord.getValue({
			 		fieldId: 'state'
			 	});
			 	
			 	var addressPostcode = addressSubrecord.getValue({
			 		fieldId: 'zip'
			 	});
			 	
			 	// add to the returnString variable
			 	returnString += 'Company Reg No: ';
			 	returnString += companyReg;
			 	returnString += ' Registered Office: ';;
			 	returnString += address1 + ', ';
			 	returnString += address2 + ', ';
			 	returnString += addressCity + ', ';
			 	returnString += addressCounty + ', ';
			 	returnString += addressPostcode;
		 	}
		 catch(e)
		 	{
			 	log.error({
			 		title: 'Error Retrieving Subsidiary Details',
			 		details: e
			 	});
		 	}
		 
		 return returnString;
		 
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
    return 	{
        	onRequest: onRequest
    		};
    
});
