/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/record', 'N/search', 'N/http', 'N/xml', 'N/format'],
/**
 * @param {file} file
 * @param {record} record
 * @param {search} search
 */
function(file, record, search, http, xml, format) 
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
	        		var salesOrderRecord	= null;
	        		var customerId			= null;
	        		var createdFromId		= null;
	        		var fileObj				= null;
	        		var tranId	 			= '';
	        		var xmlString 			= '';
	        		var itemsArray			= [];
	        		var shippingCarriers	= getShippingCarriers();
	        		var manufacturersObject	= {};
	        		
	        		//Load the item fulfilment
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
	        				customerId 		= fulfilmentRecord.getValue({fieldId: 'entity'});
	        				createdFromId	= fulfilmentRecord.getValue({fieldId: 'createdfrom'});
	        				tranId			= fulfilmentRecord.getValue({fieldId: 'tranid'});
	        				
			        		//Load the customer
			        		//
			        		try
			        			{
			        				customerRecord = record.load({
																	type:		record.Type.CUSTOMER,
																	id:			customerId
																	});
			        			}
			        		catch(err)
			        			{
				        			log.error({
												title:		'Error loading customer record with id = ' + customerId,
												details:	err
												});
				        			
				        			customerRecord 		= null;
			        			}
		
			        		if(customerRecord != null)
			        			{
					        		//Load the sales order
					        		//
					        		try
					        			{
					        				salesOrderRecord = record.load({
																			type:		record.Type.SALES_ORDER,
																			id:			createdFromId
																			});
					        			}
					        		catch(err)
					        			{
						        			log.error({
														title:		'Error loading sales order record with id = ' + createdFromId,
														details:	err
														});
					        			
						        			salesOrderRecord	= null;
					        			}
					        		
					        		if(salesOrderRecord	!= null)
					        			{
					        				//Build the output now we have all the records to work with
					        				//
						        			var customerFirstName 			= customerRecord.getValue({fieldId: 'firstname'});
						        			var customerLastName 			= customerRecord.getValue({fieldId: 'lastname'});
						        			var customerFullName 			= (customerFirstName + ' ' + customerLastName).trim();
						        			var customerCompanyName			= customerRecord.getValue({fieldId: 'companyname'});
						        			var customerEmail 				= customerRecord.getValue({fieldId: 'email'});
						        			var customerPhone 				= customerRecord.getValue({fieldId: 'phone'});
						        			var customerMobile 				= customerRecord.getValue({fieldId: 'mobilephone'});
						        			var customerNumber				= customerRecord.getValue({fieldId: 'entityid'});
						        			
						        			customerFullName 				= (customerFullName != '' ? customerFullName : customerCompanyName);
						        			
						        			var salesOrderNumber 			= salesOrderRecord.getValue({fieldId: 'tranid'});
						        			var salesOrderChannel 			= salesOrderRecord.getText({fieldId: 'class'});
						        			var salesOrderShopify 			= salesOrderRecord.getValue({fieldId: 'custbody_bbs_shopify_order_number'});
						        			var salesOrderJoor 				= salesOrderRecord.getValue({fieldId: 'custbody_bbs_joor_so_number'});
						        			var salesOrderCustRef			= (salesOrderShopify != '' ? salesOrderShopify : (salesOrderJoor != '' ? salesOrderJoor : ''))
						        			var salesOrderTotal				= Number(salesOrderRecord.getValue({fieldId: 'total'})).toFixed(2);
						        			var salesOrderSubTotal			= Number(salesOrderRecord.getValue({fieldId: 'subtotal'})).toFixed(2);
						        			var salesOrderTax				= Number(salesOrderRecord.getValue({fieldId: 'taxtotal'})).toFixed(2);
						        			var salesOrderDiscount			= Math.abs(Number(salesOrderRecord.getValue({fieldId: 'discounttotal'}))).toFixed(2);
						        			var salesOrderDiscountCode		= salesOrderRecord.getText({fieldId: 'discountitem'});
						        			
						        			var fulfilmentShippingCost		= Number(fulfilmentRecord.getValue({fieldId: 'shippingcost'})).toFixed(2);
						        			var fulfilmentShippingMethod	= fulfilmentRecord.getText({fieldId: 'shipmethod'});
						        			var fulfilmentShippingMethodId	= fulfilmentRecord.getValue({fieldId: 'shipmethod'});
						        			var fulfilmentShippingCarrier	= shippingCarriers[fulfilmentShippingMethodId];
						        			var fulfilmentDate				= fulfilmentRecord.getText({fieldId: 'trandate'});
						        			var fulfilmentShippedDate		= fulfilmentRecord.getText({fieldId: 'shippeddate'});
						        			var fulfilmentReference			= fulfilmentRecord.getValue({fieldId: 'tranid'});
						        			var fulfilmentCurrency			= fulfilmentRecord.getValue({fieldId: 'currencycode'});
						        			var fulfilmentShipAdress		= fulfilmentRecord.getSubrecord({fieldId: 'shippingaddress'});
						        			var fulfilmentAddr1				= fulfilmentShipAdress.getValue({fieldId: 'addr1'});
						        			var fulfilmentAddr2				= fulfilmentShipAdress.getValue({fieldId: 'addr2'});
						        			var fulfilmentAddr3				= fulfilmentShipAdress.getValue({fieldId: 'addr3'});
						        			var fulfilmentCity				= fulfilmentShipAdress.getValue({fieldId: 'city'});
						        			var fulfilmentState				= fulfilmentShipAdress.getValue({fieldId: 'state'});
						        			var fulfilmentZip				= fulfilmentShipAdress.getValue({fieldId: 'zip'});
						        			var fulfilmentAddrPhone			= fulfilmentShipAdress.getValue({fieldId: 'addrphone'});
						        			var fulfilmentCountry			= countries_list[fulfilmentShipAdress.getValue({fieldId: 'country'})];
						        			
						        			customerPhone = (customerPhone == null || customerPhone == '' ? fulfilmentAddrPhone : customerPhone);
						        			
						        			//Start of xml
						        			//
					        				xmlString += '<Despatch xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
					        				xmlString += '<ImportFormat>SHP</ImportFormat>\n';
					        				xmlString += '<CustomerName>' 				+ xml.escape({xmlText: customerFullName}) 			+ '</CustomerName>\n';
					        				xmlString += '<CustomerEmail>' 				+ xml.escape({xmlText: customerEmail}) 				+ '</CustomerEmail>\n';
					        				xmlString += '<CarrierName>' 				+ xml.escape({xmlText: fulfilmentShippingCarrier}) 	+ '</CarrierName>\n';
					        				xmlString += '<ServiceTypeName>' 			+ xml.escape({xmlText: fulfilmentShippingMethod}) 	+ '</ServiceTypeName>\n';
					        				xmlString += '<SalesOrderNumber>' 			+ xml.escape({xmlText: salesOrderNumber}) 			+ '</SalesOrderNumber>\n';
					        				xmlString += '<ShippingCost>' 				+ xml.escape({xmlText: fulfilmentShippingCost}) 	+ '</ShippingCost>\n';
					        				xmlString += '<CustomerReference>' 			+ xml.escape({xmlText: salesOrderCustRef}) 			+ '</CustomerReference>\n';
					        				xmlString += '<CustomerPhone>' 				+ xml.escape({xmlText: customerPhone}) 				+ '</CustomerPhone>\n';
					        				xmlString += '<CustomerMobile>' 			+ xml.escape({xmlText: customerMobile}) 			+ '</CustomerMobile>\n';
					        				xmlString += '<TotalSale>' 					+ xml.escape({xmlText: salesOrderTotal}) 			+ '</TotalSale>\n';
					        				xmlString += '<Discount>' 					+ xml.escape({xmlText: salesOrderDiscount}) 		+ '</Discount>\n';
					        				xmlString += '<TaxPaid>' 					+ xml.escape({xmlText: salesOrderTax}) 				+ '</TaxPaid>\n';
					        				xmlString += '<CreatedDate>' 				+ xml.escape({xmlText: fulfilmentDate}) 			+ '</CreatedDate>\n';
					        				xmlString += '<ChannelName>' 				+ xml.escape({xmlText: salesOrderChannel}) 			+ '</ChannelName>\n';
					        				xmlString += '<ShippingAddressLine1>' 		+ xml.escape({xmlText: fulfilmentAddr1}) 			+ '</ShippingAddressLine1>\n';
					        				xmlString += '<ShippingAddressLine2>' 		+ xml.escape({xmlText: fulfilmentAddr2}) 			+ '</ShippingAddressLine2>\n';
					        				xmlString += '<ShippingAddressTownCity>' 	+ xml.escape({xmlText: fulfilmentCity}) 			+ '</ShippingAddressTownCity>\n';
					        				xmlString += '<ShippingAddressRegion>' 		+ xml.escape({xmlText: fulfilmentState}) 			+ '</ShippingAddressRegion>\n';
					        				xmlString += '<ShippingAddressPostCode>' 	+ xml.escape({xmlText: fulfilmentZip}) 				+ '</ShippingAddressPostCode>\n';
					        				xmlString += '<ShippingAddressCountry>' 	+ xml.escape({xmlText: fulfilmentCountry}) 			+ '</ShippingAddressCountry>\n';
					        				xmlString += '<DespatchNumber>' 			+ xml.escape({xmlText: fulfilmentReference}) 		+ '</DespatchNumber>\n';
					        				xmlString += '<DespatchDate>' 				+ xml.escape({xmlText: fulfilmentShippedDate}) 		+ '</DespatchDate>\n';
					        				
					        				
					        				
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
						        					var itemUnitWeight		= getItemWeightInKilos(itemId);
						        					var itemSoRate			= Number(0);
						        					var itemSoCost			= Number(0);
						        					var itemSoVat			= Number(0);
						        					
						        					//Get additional info from the item record (commodity code, country of manufacture, item group name & prefered supplier address)
						        					//
						        					var itemAdditionalDetails = getItemAdditionalDetails(itemId, itemType, countries_list);
						        					
						        					//Save any manufacturers address
						        					//
						        					manufacturersObject[itemAdditionalDetails.countryOfManufacture] = itemAdditionalDetails.address;
						        					
						        					
						        					//Get the item rate & cost from the related sales order line
						        					//
						        					var soLineCount = salesOrderRecord.getLineCount({sublistId: 'item'});
							        				
						        					for (var soLine = 0; soLine < soLineCount; soLine++) 
							        					{
						        							//Get the current sales order line number
						        							//
						        							var	soLineNumber 		= Number(salesOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'line', line: soLine}));
						        							
						        							//Do the line numbers match?
						        							//
						        							if(soLineNumber == itemSoLine)
						        								{
										        					itemSoRate			= Number(salesOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: soLine}));
										        					itemSoCost			= Number(salesOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'costestimaterate', line: soLine}));
										        					itemSoVat			= Number(salesOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'tax1amt', line: soLine}));
										        					
										        					break;
						        								}
							        					}
						        					
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
						        					
						        					xmlString += '<Name>' 					+ xml.escape({xmlText: itemDescription}) 								+ '</Name>\n';
						        					xmlString += '<ItemCode>' 				+ xml.escape({xmlText: itemName}) 										+ '</ItemCode>\n';
						        					xmlString += '<QuantityOrdered>' 		+ xml.escape({xmlText: itemQuantity.toFixed(2)}) 						+ '</QuantityOrdered>\n';
						        					xmlString += '<BuyPrice>' 				+ xml.escape({xmlText: (itemQuantity * itemSoCost).toFixed(2)}) 		+ '</BuyPrice>\n';
						        					xmlString += '<RetailPrice>' 			+ xml.escape({xmlText: (itemQuantity * itemSoRate).toFixed(2)}) 		+ '</RetailPrice>\n';
						        					xmlString += '<Weight>' 				+ xml.escape({xmlText: itemUnitWeight.toFixed(2)}) 						+ '</Weight>\n';
						        					xmlString += '<TotalGrossWeight>' 		+ xml.escape({xmlText: (itemQuantity * itemUnitWeight).toFixed(2)}) 	+ '</TotalGrossWeight>\n';
						        					xmlString += '<Attribute1>' 			+ xml.escape({xmlText: itemSoRate.toFixed(2)}) 							+ '</Attribute1>\n';
						        					xmlString += '<Attribute2>' 			+ xml.escape({xmlText: itemSoVat.toFixed(2)}) 							+ '</Attribute2>\n';
						        					xmlString += '<CommodityCode>' 			+ xml.escape({xmlText: itemAdditionalDetails.commodityCode}) 			+ '</CommodityCode>\n';
						        					xmlString += '<CountryOfManufacture>' 	+ xml.escape({xmlText: itemAdditionalDetails.countryOfManufacture}) 	+ '</CountryOfManufacture>\n';
						        					xmlString += '<ItemGroupName>' 			+ xml.escape({xmlText: itemAdditionalDetails.groupName}) 				+ '</ItemGroupName>\n';
						        					
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
					        					
					        						totalPackageWeight += packageWeight;
					        						
					        						//Start of new package
					        						//
					        						xmlString += '<DespatchPackage>\n';
					        						xmlString += '<PackageName>' 			+ xml.escape({xmlText: packageName}) 					+ '</PackageName>\n';
					        						xmlString += '<Weight>' 				+ xml.escape({xmlText: packageWeight.toFixed(2)}) 		+ '</Weight>\n';
					        						xmlString += '<TotalGrossWeight>' 		+ xml.escape({xmlText: packageWeight.toFixed(2)}) 		+ '</TotalGrossWeight>\n';
						        					
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
												        					xmlString += '<TotalGrossWeight>' 		+ xml.escape({xmlText: (packagesArray[packageIndex].quantity * itemsArray[itemIndex].itemUnitWeight).toFixed(2)}) 		+ '</TotalGrossWeight>\n';
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
					        				
					        				//End of packages
					        				//
					        				xmlString += '</Packages>\n';
					        				
					        				
					        				//Custom attributes
					        				//
					        				xmlString += '<Attribute1>' 				+ xml.escape({xmlText: customerNumber}) 			+ '</Attribute1>\n';
					        				
					        				//Fill in the manufacturers details if any
					        				//
					        				xmlString += '<Attribute2>';
					        //				xmlString += '<![CDATA[';
					        //				xmlString += '<Manufacturers>';
					        				
					        				for ( var manufacturer in manufacturersObject) 
						        				{
					        //						xmlString += '<Manufacturer>';
					        
					        						
						    						xmlString += (manufacturersObject[manufacturer].address1 != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].address1}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].address2 != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].address2}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].town != ''     	? xml.escape({xmlText: manufacturersObject[manufacturer].town}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].county != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].county}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].postCode != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].postCode}) + '&#10;' : '');
							        				xmlString += (manufacturersObject[manufacturer].country != '' 	? xml.escape({xmlText: manufacturersObject[manufacturer].country}) + '&#10;&#10;' : '');
							
					        //						xmlString += '<CountryOfManufacture>' 	+ xml.escape({xmlText: manufacturer}) 									+ '</CountryOfManufacture>';
					        //						xmlString += '<ManuAddressLine1>' 		+ xml.escape({xmlText: manufacturersObject[manufacturer].address1})		+ '</ManuAddressLine1>';
							//       				xmlString += '<ManuAddressLine2>' 		+ xml.escape({xmlText: manufacturersObject[manufacturer].address2})		+ '</ManuAddressLine2>';
							//        				xmlString += '<ManuAddressTownCity>' 	+ xml.escape({xmlText: manufacturersObject[manufacturer].town}) 		+ '</ManuAddressTownCity>';
							//        				xmlString += '<ManuAddressRegion>' 		+ xml.escape({xmlText: manufacturersObject[manufacturer].county}) 		+ '</ManuAddressRegion>';
							//        				xmlString += '<ManuAddressPostCode>' 	+ xml.escape({xmlText: manufacturersObject[manufacturer].postCode})		+ '</ManuAddressPostCode>';
							//        				xmlString += '<ManuAddressCountry>' 	+ xml.escape({xmlText: manufacturersObject[manufacturer].country})		+ '</ManuAddressCountry>';
							        				
					        //						xmlString += '</Manufacturer>';
												}		        				
					        				
					        //				xmlString += '</Manufacturers>';
					        //				xmlString += ']]>';
					        				xmlString += '</Attribute2>\n';
					        			
					        				
					        				//Custom attributes
					        				//
					        				xmlString += '<Attribute3>' 				+ xml.escape({xmlText: salesOrderDiscountCode}) 	+ '</Attribute3>\n';
					        				xmlString += '<Attribute4>' 				+ xml.escape({xmlText: salesOrderSubTotal}) 		+ '</Attribute4>\n';
					        				
					        				//Other sundry tags
					        				//
					        				xmlString += '<PaymentMethod/>\n';
					        				xmlString += '<PropertyName/>\n';
					        				xmlString += '<TotalGrossWeight>' 		+ xml.escape({xmlText: totalPackageWeight.toFixed(2)}) 		+ '</TotalGrossWeight>\n';
					        				xmlString += '<TotalPrice>' 			+ xml.escape({xmlText: salesOrderTotal}) 					+ '</TotalPrice>\n';
					        				xmlString += '<CurrencyCode>' 			+ xml.escape({xmlText: fulfilmentCurrency}) 				+ '</CurrencyCode>\n';
					        				xmlString += '<WeightType>KG</WeightType>\n';
					        				xmlString += '<MeasureType>CM</MeasureType>\n';
					        				xmlString += '<ImportFormat>SHP</ImportFormat>\n';
					        				xmlString += '<ImportFileFormat>XML</ImportFileFormat>\n';
					        				xmlString += '</Despatch>\n';
					        				
					        				
					        				//Create a file to hold the results
					        				//
					        				fileObj = file.create({
					        										name:		'Shipster_' + tranId + '.shp',
					        										fileType:	file.Type.PLAINTEXT,
					        										contents:	xmlString
					        										});
					        				
					        				//Return the file to the browser
					        				//
					        				context.response.writeFile({
					        											file:		fileObj,
					        											isInline:	false
					        											});
					        			}
			        			}
	        			}
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
    
    function getItemAdditionalDetails(_itemId, _itemType, _countries_list)
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
				
    		try
    			{
	    			itemRecord = record.load({
												type:		getItemRecordType(_itemType),
												id:			_itemId
												});
    			}
    		catch(err)
    			{
    				itemRecord = null;
    				
    				log.error({
								title:		'Error loading item record with id = ' + _itemId + ' type = ' + _itemType,
								details:	err
								});
    			}
    		
    		if(itemRecord != null)
    			{
	    			commodityCode 			= itemRecord.getValue({fieldId: 'custitem_commodity_code'});
	        		countryOfManufacture 	= itemRecord.getValue({fieldId: 'countryofmanufacture'});
	        		
	        		try
	        			{
	        				groupName		= itemRecord.getText({fieldId: 'custitem_bbs_matrix_cat'})[0];
	        			}
	        		catch(err)
	        			{
	        				groupName		= '';
	        			}
	        		
	        		if(countryOfManufacture != null && countryOfManufacture != '')
		    			{
		    				countryOfManufacture = _countries_list[countryOfManufacture];
		    			}
	    			
	        		var suppliers = itemRecord.getLineCount({sublistId: 'itemvendor'});
	        		
	        		for (var supplier = 0; supplier < suppliers; supplier++) 
	        			{
	        				var supplierId = itemRecord.getSublistValue({sublistId: 'itemvendor', fieldId: 'vendor', line: supplier});
	        				
	        				//Read in the supplier
	        				//
	        				var supplierRecord = null;
	        				
	        				try
	        					{
		        					supplierRecord = record.load({
																	type:		record.Type.VENDOR,
																	id:			supplierId
																	});
	        					}
	        				catch(err)
	        					{
	        						supplierRecord = null;
	        					}
	        				
	        				if(supplierRecord != null)
	        					{
	        						//Read the address subrecord
	        						//
		        					var addressLines = supplierRecord.getLineCount({sublistId: 'addressbook'}); 
									
									for (var addressLine = 0; addressLine < addressLines; addressLine++) 
										{
											var addressSubRecord = supplierRecord.getSublistSubrecord({
															    									    sublistId: 	'addressbook',
															    									    fieldId: 	'addressbookaddress',
															    									    line: 		addressLine
															    										});
											
											addr1 	= addressSubRecord.getValue({fieldId: 'addr1'});
											addr2 	= addressSubRecord.getValue({fieldId: 'addr2'});
											city 	= addressSubRecord.getValue({fieldId: 'city'});
											state 	= addressSubRecord.getValue({fieldId: 'state'});
											zip 	= addressSubRecord.getValue({fieldId: 'zip'});
											country = addressSubRecord.getValue({fieldId: 'country'});
												
											if(country != null && country != '')
								    			{
													country = _countries_list[country];
								    			}
											
											break;
										}
	        					}
	        			}
    			}
    		
    		additionalInfoObj = new itemAdditionalInfo(
    													commodityCode, 
    													countryOfManufacture, 
    													groupName, 
    													new addressObject(addr1, addr2, city, state, zip, country)
    													); 
    	
    		return additionalInfoObj;
    	}
    
    function getItemWeightInKilos(_itemId)
    	{
    		var weightInKg = 0;
    	
    		var searchResult = search.lookupFields({
	    											type:		search.Type.ITEM,
	    											id:			_itemId,
	    											columns:	['weight', 'weightunit']
	    											});
    		
    		var itemWeight 		= Number(searchResult.weight);
    		var itemWeightUnit 	= null;
    		
    		try
    			{
    				itemWeightUnit 	= Number(searchResult.weightunit[0].value);
    			}
    		catch(err)
    			{
    				itemWeightUnit 	= null;
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
    
    function addressObject(_address1, _address2, _town, _county, _postCode, _country)
    	{
	    	this.address1				= _address1;
			this.address2				= _address2;
			this.town					= _town;
			this.county					= _county;
			this.postCode				= _postCode;
			this.country				= _country;
    	}
    
    function itemAdditionalInfo(_commodityCode, _countryOfManufacture, _groupName, _address)
    	{
    		this.commodityCode			= _commodityCode;
    		this.countryOfManufacture	= _countryOfManufacture;
    		this.groupName				= _groupName;
    		this.address				= _address;
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
    return 	{
        	onRequest: onRequest
    		};
    
});
