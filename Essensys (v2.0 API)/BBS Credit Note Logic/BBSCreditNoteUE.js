/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format', 'N/record'],
function(search, format, record) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

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
    function beforeSubmit(scriptContext) {
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// declare and initialize variables
    			var calculationDate 		= null;
    			var periodStart				= null;
    			var periodEnd				= null;
    			var externalInvoiceNumber 	= null;
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
		    	
		    	// get the value of the site field from the invoice record
		    	var site = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_site_name'
		    	});
		    	
		    	// if we have a site
		    	if (site)
		    		{
			    		// lookup fields on the site record
						var siteLookup = search.lookupFields({
							type: 'customrecord_bbs_site',
							id: site,
							columns: ['custrecord_bbs_site_address_1', 'custrecord_bbs_site_address_2', 'custrecord_bbs_site_address_3', 'custrecord_bbs_site_address_city', 'custrecord_bbs_site_address_state', 'custrecord_bbs_site_address_zip', 'custrecord_bbs_site_country']
						});
						
						// return the address from the site lookup
		    			var address1 		= siteLookup.custrecord_bbs_site_address_1;
						var address2 		= siteLookup.custrecord_bbs_site_address_2;
						var address3 		= siteLookup.custrecord_bbs_site_address_3;
						var addressCity 	= siteLookup.custrecord_bbs_site_address_city;
						var addressCounty 	= siteLookup.custrecord_bbs_site_address_state[0].text;
						var addressPostcode = siteLookup.custrecord_bbs_site_address_zip;
						var addressCountry	= siteLookup.custrecord_bbs_site_country[0].text;
						
						// get the shipping address subrecord
						var shippingAddressSubrecord = currentRecord.getSubrecord({
							fieldId: 'shippingaddress'
						});
								
						// set fields on the shipping address subrecord
						shippingAddressSubrecord.setValue({
							fieldId: 'country',
							value: getISOCountryCode(addressCountry)
						});
								
						shippingAddressSubrecord.setValue({
							fieldId: 'addressee',
							value: null
						});
								
						shippingAddressSubrecord.setValue({
							fieldId: 'addr1',
							value: address1
						});
									
						shippingAddressSubrecord.setValue({
							fieldId: 'addr2',
							value: address2
						});
								
						shippingAddressSubrecord.setValue({
							fieldId: 'addr3',
							value: address3
						});
										
						shippingAddressSubrecord.setValue({
							fieldId: 'city',
							value: addressCity
						});
										
						shippingAddressSubrecord.setValue({
							fieldId: 'state',
							value: addressCounty
						});
										
						shippingAddressSubrecord.setValue({
							fieldId: 'zip',
							value: addressPostcode
						});
		    		}
		    	
		    	// get the value of the created from field
		    	var createdFrom = currentRecord.getValue({
		    		fieldId: 'createdfrom'
		    	});
		    	
		    	// if createdFrom returns a value
		    	if (createdFrom)
		    		{
		    			// get the text value of the createdFrom field
		    			var createdFromType = currentRecord.getText({
				    		fieldId: 'createdfrom'
				    	}).split(" #").shift();
		    			
		    			if (createdFromType == 'Credit Note Request')
		    				{
		    					// lookup fields on the credit note request record
		    					var fieldLookup = search.lookupFields({
		    						type: search.Type.RETURN_AUTHORIZATION,
		    						id: createdFrom,
		    						columns: ['createdfrom.custbody_bbs_ext_inv_no', 'createdfrom.trandate', 'createdfrom']
		    					});
		    					
		    					if (fieldLookup['createdfrom.trandate'])
		    						{
			    						calculationDate	= format.parse({
				    						type: format.Type.DATE,
				    						value: fieldLookup['createdfrom.trandate']
				    					});
		    						}
		    					
		    					externalInvoiceNumber = fieldLookup['createdfrom.custbody_bbs_ext_inv_no'];
		    				}
		    			else if (createdFromType == 'Invoice')
		    				{
			    				// lookup fields on the invoice record
		    					fieldLookup = search.lookupFields({
		    						type: search.Type.INVOICE,
		    						id: createdFrom,
		    						columns: ['custbody_bbs_ext_inv_no', 'trandate']
		    					});
		    					
		    					calculationDate	= format.parse({
		    						type: format.Type.DATE,
		    						value: fieldLookup['trandate']
		    					});
		    					
		    					externalInvoiceNumber = fieldLookup['custbody_bbs_ext_inv_no'];
		    				}
		    		}
		    	else
		    		{
		    			// get the transaction date
		    			calculationDate = currentRecord.getValue({
		    				fieldId: 'trandate'
		    			});
		    		}
		    	
		    	if (calculationDate)
		    		{
				    	// calculate the start and end of the calculation date's month
		    			periodStart = new Date(calculationDate.getFullYear(), calculationDate.getMonth(), 1);
		    			periodEnd 	= new Date(calculationDate.getFullYear(), calculationDate.getMonth()+1, 0);
		    		}
    			
    			// get count of lines on the current record
    			var lineCount = currentRecord.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// set the period start/end fields on the line
    					currentRecord.setSublistValue({
    						sublistId: 'item',
    						fieldId: 'custcol_bbs_date_from',
    						value: periodStart,
    						line: i
    					});
    					
    					currentRecord.setSublistValue({
    						sublistId: 'item',
    						fieldId: 'custcol_bbs_date_to',
    						value: periodEnd,
    						line: i
    					});
    				}
		    	
		    	// set the external invoice number field
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_ext_inv_no',
    				value: externalInvoiceNumber
    			});		    	
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
    function afterSubmit(scriptContext) {
    	
	    if (scriptContext.type == scriptContext.UserEventType.CREATE)
			{
		    	// get the value of the created from field
				var createdFrom = scriptContext.newRecord.getValue({
					fieldId: 'createdfrom'
				});
				    	
				if (createdFrom)
					{
						// get the text value of the createdFrom field
						var createdFromType = scriptContext.newRecord.getText({
							fieldId: 'createdfrom'
						}).split(" #").shift();
				    			
				    	if (createdFromType == 'Credit Note Request')
				    		{
				    			// lookup fields on the credit note request record
				    			var raLookup = search.lookupFields({
				    				type: search.Type.RETURN_AUTHORIZATION,
				    				id: createdFrom,
				    				columns: ['createdfrom']
				    			});
				    					
				    			if (raLookup.createdfrom.length > 0)
				    				{
						    			// get the ID of the linked invoice ID
				    					var linkedInvoice = raLookup.createdfrom[0].value;
				    				
				    					try
							    		    {
							    		    	// reload the record
							    		    	var creditMemoRecord = record.load({
							    		    		type: record.Type.CREDIT_MEMO,
							    		    		id: scriptContext.newRecord.id
							    		    	});
							    		    	
							    		    	// get count of 'Apply' sublist lines
							    	    		var lineCount = creditMemoRecord.getLineCount({
							    	    			sublistId: 'apply'
							    	    		});
							    	    			
							    	    		// loop through 'Apply' sublist
							    	    		for (var i = 0; i < lineCount; i++)
							    	    			{
							    	    				// get the invoice ID for the current line
							    	    				var lineInvoice = creditMemoRecord.getSublistValue({
							    	    					sublistId: 'apply',
							    	    					fieldId: 'internalid',
							    	    					line: i
							    	    				});
							    	    					
							    	    				if (lineInvoice == linkedInvoice)
							    	    					{
							    	    						// tick the 'Apply' checkbox for the line
							    	    						creditMemoRecord.setSublistValue({
							    	    							sublistId: 'apply',
							    	    							fieldId: 'apply',
							    	    							value: true,
							    	    							line: i
							    	    						});
							    	    					}
							    	    			}
							    	    		
							    	    		// save the changes to the credit memo record
							    	    		creditMemoRecord.save({
							    	    			ignoreMandatoryFields: true
							    	    		});
							    	    		
							    	    		log.audit({
							    	    			title: 'Credit Memo Applied',
							    	    			details: scriptContext.newRecord.id
							    	    		});
							    		    }
				    					catch(e)
								    		{
								    			log.error({
								    				title: 'Error Applying Credit Memo ' + scriptContext.newRecord.id,
								    				details: e.message
								    			});
								    		}
				    				}
				    		}
					}
			}

    }
    
    // ====================================================
    // FUNCTION TO CONVERT THE COUNTRY NAME TO THE ISO CODE
    // ====================================================
    
    function getISOCountryCode(countryName) {
    	
    	// declare and initialize variables
    	var countryCode = null;
    	
    	// declare list of countries
    	var countries = {
    			'Afghanistan' : 'AF',
    			'Aland Islands' : 'AX',
    			'Albania' : 'AL',
    			'Algeria' : 'DZ',
    			'American Samoa' : 'AS',
    			'Andorra' : 'AD',
    			'Angola' : 'AO',
    			'Anguilla' : 'AI',
    			'Antarctica' : 'AQ',
    			'Antigua And Barbuda' : 'AG',
    			'Argentina' : 'AR',
    			'Armenia' : 'AM',
    			'Aruba' : 'AW',
    			'Australia' : 'AU',
    			'Austria' : 'AT',
    			'Azerbaijan' : 'AZ',
    			'Bahamas' : 'BS',
    			'Bahrain' : 'BH',
    			'Bangladesh' : 'BD',
    			'Barbados' : 'BB',
    			'Belarus' : 'BY',
    			'Belgium' : 'BE',
    			'Belize' : 'BZ',
    			'Benin' : 'BJ',
    			'Bermuda' : 'BM',
    			'Bhutan' : 'BT',
    			'Bolivia' : 'BO',
    			'Bosnia And Herzegovina' : 'BA',
    			'Botswana' : 'BW',
    			'Bouvet Island' : 'BV',
    			'Brazil' : 'BR',
    			'British Indian Ocean Territory' : 'IO',
    			'Brunei Darussalam' : 'BN',
    			'Bulgaria' : 'BG',
    			'Burkina Faso' : 'BF',
    			'Burundi' : 'BI',
    			'Cambodia' : 'KH',
    			'Cameroon' : 'CM',
    			'Canada' : 'CA',
    			'Cape Verde' : 'CV',
    			'Cayman Islands' : 'KY',
    			'Central African Republic' : 'CF',
    			'Chad' : 'TD',
    			'Chile' : 'CL',
    			'China' : 'CN',
    			'Christmas Island' : 'CX',
    			'Cocos (Keeling) Islands' : 'CC',
    			'Colombia' : 'CO',
    			'Comoros' : 'KM',
    			'Congo' : 'CG',
    			'Congo, Democratic Republic' : 'CD',
    			'Cook Islands' : 'CK',
    			'Costa Rica' : 'CR',
    			'Cote D\'Ivoire' : 'CI',
    			'Croatia' : 'HR',
    			'Cuba' : 'CU',
    			'Cyprus' : 'CY',
    			'Czech Republic' : 'CZ',
    			'Denmark' : 'DK',
    			'Djibouti' : 'DJ',
    			'Dominica' : 'DM',
    			'Dominican Republic' : 'DO',
    			'Ecuador' : 'EC',
    			'Egypt' : 'EG',
    			'El Salvador' : 'SV',
    			'Equatorial Guinea' : 'GQ',
    			'Eritrea' : 'ER',
    			'Estonia' : 'EE',
    			'Ethiopia' : 'ET',
    			'Falkland Islands (Malvinas)' : 'FK',
    			'Faroe Islands' : 'FO',
    			'Fiji' : 'FJ',
    			'Finland' : 'FI',
    			'France' : 'FR',
    			'French Guiana' : 'GF',
    			'French Polynesia' : 'PF',
    			'French Southern Territories' : 'TF',
    			'Gabon' : 'GA',
    			'Gambia' : 'GM',
    			'Georgia' : 'GE',
    			'Germany' : 'DE',
    			'Ghana' : 'GH',
    			'Gibraltar' : 'GI',
    			'Greece' : 'GR',
    			'Greenland' : 'GL',
    			'Grenada' : 'GD',
    			'Guadeloupe' : 'GP',
    			'Guam' : 'GU',
    			'Guatemala' : 'GT',
    			'Guernsey' : 'GG',
    			'Guinea' : 'GN',
    			'Guinea-Bissau' : 'GW',
    			'Guyana' : 'GY',
    			'Haiti' : 'HT',
    			'Heard Island & Mcdonald Islands' : 'HM',
    			'Holy See (Vatican City State)' : 'VA',
    			'Honduras' : 'HN',
    			'Hong Kong' : 'HK',
    			'Hungary' : 'HU',
    			'Iceland' : 'IS',
    			'India' : 'IN',
    			'Indonesia' : 'ID',
    			'Iran, Islamic Republic Of' : 'IR',
    			'Iraq' : 'IQ',
    			'Ireland' : 'IE',
    			'Isle Of Man' : 'IM',
    			'Israel' : 'IL',
    			'Italy' : 'IT',
    			'Jamaica' : 'JM',
    			'Japan' : 'JP',
    			'Jersey' : 'JE',
    			'Jordan' : 'JO',
    			'Kazakhstan' : 'KZ',
    			'Kenya' : 'KE',
    			'Kiribati' : 'KI',
    			'Korea' : 'KR',
    			'Kuwait' : 'KW',
    			'Kyrgyzstan' : 'KG',
    			'Lao People\'s Democratic Republic' : 'LA',
    			'Latvia' : 'LV',
    			'Lebanon' : 'LB',
    			'Lesotho' : 'LS',
    			'Liberia' : 'LR',
    			'Libyan Arab Jamahiriya' : 'LY',
    			'Liechtenstein' : 'LI',
    			'Lithuania' : 'LT',
    			'Luxembourg' : 'LU',
    			'Macao' : 'MO',
    			'Macedonia' : 'MK',
    			'Madagascar' : 'MG',
    			'Malawi' : 'MW',
    			'Malaysia' : 'MY',
    			'Maldives' : 'MV',
    			'Mali' : 'ML',
    			'Malta' : 'MT',
    			'Marshall Islands' : 'MH',
    			'Martinique' : 'MQ',
    			'Mauritania' : 'MR',
    			'Mauritius' : 'MU',
    			'Mayotte' : 'YT',
    			'Mexico' : 'MX',
    			'Micronesia, Federated States Of' : 'FM',
    			'Moldova' : 'MD',
    			'Monaco' : 'MC',
    			'Mongolia' : 'MN',
    			'Montenegro' : 'ME',
    			'Montserrat' : 'MS',
    			'Morocco' : 'MA',
    			'Mozambique' : 'MZ',
    			'Myanmar' : 'MM',
    			'Namibia' : 'NA',
    			'Nauru' : 'NR',
    			'Nepal' : 'NP',
    			'Netherlands' : 'NL',
    			'Netherlands Antilles' : 'AN',
    			'New Caledonia' : 'NC',
    			'New Zealand' : 'NZ',
    			'Nicaragua' : 'NI',
    			'Niger' : 'NE',
    			'Nigeria' : 'NG',
    			'Niue' : 'NU',
    			'Norfolk Island' : 'NF',
    			'Northern Mariana Islands' : 'MP',
    			'Norway' : 'NO',
    			'Oman' : 'OM',
    			'Pakistan' : 'PK',
    			'Palau' : 'PW',
    			'Palestinian Territory, Occupied' : 'PS',
    			'Panama' : 'PA',
    			'Papua New Guinea' : 'PG',
    			'Paraguay' : 'PY',
    			'Peru' : 'PE',
    			'Philippines' : 'PH',
    			'Pitcairn' : 'PN',
    			'Poland' : 'PL',
    			'Portugal' : 'PT',
    			'Puerto Rico' : 'PR',
    			'Qatar' : 'QA',
    			'Reunion' : 'RE',
    			'Romania' : 'RO',
    			'Russian Federation' : 'RU',
    			'Rwanda' : 'RW',
    			'Saint Barthelemy' : 'BL',
    			'Saint Helena' : 'SH',
    			'Saint Kitts And Nevis' : 'KN',
    			'Saint Lucia' : 'LC',
    			'Saint Martin' : 'MF',
    			'Saint Pierre And Miquelon' : 'PM',
    			'Saint Vincent And Grenadines' : 'VC',
    			'Samoa' : 'WS',
    			'San Marino' : 'SM',
    			'Sao Tome And Principe' : 'ST',
    			'Saudi Arabia' : 'SA',
    			'Senegal' : 'SN',
    			'Serbia' : 'RS',
    			'Seychelles' : 'SC',
    			'Sierra Leone' : 'SL',
    			'Singapore' : 'SG',
    			'Slovakia' : 'SK',
    			'Slovenia' : 'SI',
    			'Solomon Islands' : 'SB',
    			'Somalia' : 'SO',
    			'South Africa' : 'ZA',
    			'South Georgia And Sandwich Isl.' : 'GS',
    			'Spain' : 'ES',
    			'Sri Lanka' : 'LK',
    			'Sudan' : 'SD',
    			'Suriname' : 'SR',
    			'Svalbard And Jan Mayen' : 'SJ',
    			'Swaziland' : 'SZ',
    			'Sweden' : 'SE',
    			'Switzerland' : 'CH',
    			'Syrian Arab Republic' : 'SY',
    			'Taiwan' : 'TW',
    			'Tajikistan' : 'TJ',
    			'Tanzania' : 'TZ',
    			'Thailand' : 'TH',
    			'Timor-Leste' : 'TL',
    			'Togo' : 'TG',
    			'Tokelau' : 'TK',
    			'Tonga' : 'TO',
    			'Trinidad And Tobago' : 'TT',
    			'Tunisia' : 'TN',
    			'Turkey' : 'TR',
    			'Turkmenistan' : 'TM',
    			'Turks And Caicos Islands' : 'TC',
    			'Tuvalu' : 'TV',
    			'Uganda' : 'UG',
    			'Ukraine' : 'UA',
    			'United Arab Emirates' : 'AE',
    			'United Kingdom' : 'GB',
    			'United States' : 'US',
    			'United States Outlying Islands' : 'UM',
    			'Uruguay' : 'UY',
    			'Uzbekistan' : 'UZ',
    			'Vanuatu' : 'VU',
    			'Venezuela' : 'VE',
    			'Viet Nam' : 'VN',
    			'Virgin Islands, British' : 'VG',
    			'Virgin Islands, U.S.' : 'VI',
    			'Wallis And Futuna' : 'WF',
    			'Western Sahara' : 'EH',
    			'Yemen' : 'YE',
    			'Zambia' : 'ZM',
    			'Zimbabwe' : 'ZW'
    	}
    	
    	// if we have the country name in the countries list
    	if (countries.hasOwnProperty(countryName))
    		{
            	// get the country code
    			countryCode = countries[countryName];
    		}
    	
    	// return countryCode variable to main script function
    	return countryCode;

    }

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

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
