/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/render'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, search, record, render) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	fileCabinetFolder = currentScript.getParameter({
    	name: 'custscript_bbs_service_data_bill_folder'
    });
	
	// declare new date object. Global variable so can be accessed throughout the script
	invoiceDate = new Date();
	invoiceDate.setDate(0); // set date to be the last day of the previous month
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// create search to find service data customers to be processed
    	return search.create({
    		type: 'customrecord_bbs_service_data',
    		
    		columns: [{
    			name: 'custrecord_bbs_service_data_site_record',
    			summary: 'GROUP'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_service_data_customer_rec',
    			summary: 'MAX'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_service_data_location',
    			summary: 'MAX'
    		},
    				{
    			name: 'custrecord_bbs_service_data_site_alias',
    			summary: 'MAX'
    		},
    				{
    			name: 'formulatext',
    			summary: 'MAX',
    			formula: "REPLACE(NS_CONCAT({internalid}), ',','|')"
    		}],
    		
    		filters: [{
    			name: 'custrecord_bbs_service_data_customer_rec',
    			operator: 'noneof',
    			values: ['@NONE@']
    		},
    				{
    			name: 'custrecord_bbs_service_data_start_date',
    			operator: 'notafter',
    			values: ['lastmonth'] // lastmonth means end of last month
    		},
    				{
    			name: 'custrecord_bbs_service_data_end_date',
    			operator: 'notbefore',
    			values: ['startoflastmonth']
    		},
    				{
    			name: 'internalid',
    			operator: 'anyof',
    			values: ['20903', '20904']
    		}],
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	log.debug({
    		title: "Script Check",
    		details: searchResult
    	});
    	
    	// retrieve search results
    	var siteID = searchResult.values['GROUP(custrecord_bbs_service_data_site_record)'].value;
    	var siteName = searchResult.values['GROUP(custrecord_bbs_service_data_site_record)'].text;
    	var siteAlias = searchResult.values['MAX(custrecord_bbs_service_data_site_alias)'];
    	var customerID = searchResult.values['MAX(internalid.custrecord_bbs_service_data_customer_rec)'];
    	var locationID = searchResult.values['MAX(internalid.custrecord_bbs_service_data_location)'];
    	var serviceDataRecords = searchResult.values['MAX(formulatext)'];
    	serviceDataRecords = serviceDataRecords.split('|'); // split on '|' as needs to be an array to set multi-select field
    	
    	log.audit({
			title: 'Processing Site Record',
			details: 'Site ID: ' + siteID + '<br>Site Name: ' + siteName
		});
		
		try
			{
				// create a new invoice record
				var invoiceRecord = record.transform({
				    fromType: record.Type.CUSTOMER,
				    fromId: customerID,
				    toType: record.Type.INVOICE,
				    isDynamic: true
				});
				
				// set header fields on the invoice record
				invoiceRecord.setValue({
					fieldId: 'trandate',
					value: invoiceDate
				});
				
				invoiceRecord.setValue({
					fieldId: 'location',
					value: locationID
				});
				
				invoiceRecord.setValue({
					fieldId: 'custbody_bbs_service_data_records',
					value: serviceDataRecords
				});
				
				// create search to find service data records to be billed
				var serviceDataSearch = search.create({
					type: 'customrecord_bbs_service_data',
					
					columns: [{
						name: 'custrecord_bbs_service_data_product_rec',
						summary: 'GROUP'
					},
							{
						name: 'formulatext',
						summary: 'MAX',
						formula: "CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN CONCAT({custrecord_bbs_service_data_service_name}, CONCAT(CONCAT('<br>Start Date: ', {custrecord_bbs_service_data_start_date}), CONCAT('<br>End Date: ', {custrecord_bbs_service_data_end_date}))) ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN CONCAT({custrecord_bbs_service_data_service_name}, CONCAT(CONCAT('<br>Start Date: ', LAST_DAY(ADD_MONTHS({custrecord_bbs_service_data_end_date}, -1))+1), CONCAT('<br>End Date: ', {custrecord_bbs_service_data_end_date}))) ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN CONCAT({custrecord_bbs_service_data_service_name}, CONCAT(CONCAT('<br>Start Date: ', {custrecord_bbs_service_data_start_date}), CONCAT('<br>End Date: ', LAST_DAY({custrecord_bbs_service_data_start_date})))) ELSE CONCAT({custrecord_bbs_service_data_service_name}, CONCAT(CONCAT('<br>Start Date: ', LAST_DAY(ADD_MONTHS({today}, -2))+1), CONCAT('<br>End Date: ', LAST_DAY(ADD_MONTHS({today}, -1))))) END END END"
					},
							{
						name: 'formulacurrency',
						summary: 'GROUP',
						formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END, 2)"
					},
							{
						name: 'custrecord_bbs_service_data_quantity',
						summary: 'SUM'
					}],
					
					filters: [{
						name: 'isinactive',
						operator: 'is',
						values: ['F']
					},
							{
						name: 'custrecord_bbs_service_data_site_record',
						operator: 'anyof',
						values: [siteID]
					},
							{
		    			name: 'custrecord_bbs_service_data_start_date',
		    			operator: 'notafter',
		    			values: ['lastmonth'] // lastmonth means end of last month
		    		},
		    				{
		    			name: 'custrecord_bbs_service_data_end_date',
		    			operator: 'notbefore',
		    			values: ['startoflastmonth']
		    		}],
					
				});
				
				// run search and process results
				serviceDataSearch.run().each(function(result) {
					
					log.debug({
						title: 'Result',
						details: result
					});
					
					// retrieve search results
					var item = result.getValue({
						name: 'custrecord_bbs_service_data_product_rec',
						summary: 'GROUP'
					});
					
					var description = result.getValue({
						name: 'formulatext',
						summary: 'MAX'
					});
					
					var rate = result.getValue({
						name: 'formulacurrency',
						summary: 'GROUP'
					});
					
					var quantity = result.getValue({
						name: 'custrecord_bbs_service_data_quantity',
						summary: 'SUM'
					});
					
					// select a new line on the invoice record
					invoiceRecord.selectNewLine({
						sublistId: 'item'
					});
					
					// set fields on the new line
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						value: item
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'description',
						value: description
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: quantity
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: rate
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_bbs_site',
						value: siteID
					});
					
					// commit the line
					invoiceRecord.commitLine({
						sublistId: 'item'
					});

					// continue processing results
					return true;
					
				});
				
				// submit the invoice record
				var invoiceID = invoiceRecord.save({
		    		enableSourcing: false,
				    ignoreMandatoryFields: true
		    	});
				
				log.audit({
					title: 'Invoice Created',
					details: 'Invoice ID: ' + invoiceID
				});
				
				// call function to create PDF invoice. Pass invoiceID and siteAlias variables
				createPDFInvoice(invoiceID, siteAlias);
			}
		catch(e)
			{
				log.error({
					title: 'Unable to Create Invoice',
					details: 'Error: ' + e
				});
			}
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(context) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Units Used: ' + context.usage + '<br>Number of Yields: ' + context.yields
    	});

    }
    
    // ====================================================================
    // FUNCTION TO CREATE A PDF OF THE INVOICE AND SAVE TO THE FILE CABINET
    // ====================================================================
    
    function createPDFInvoice(invoiceID, siteAlias)
    	{
    		// Generate the PDF
			var PDF_File = render.transaction({
				entityId: invoiceID,
				printMode: render.PrintMode.PDF,
				inCustLocale: false
		    });
			
			// get the invoice tran ID from the PDF_File object
			var invoiceTranID = PDF_File.name;
			invoiceTranID = invoiceTranID.replace("Invoice_", ""); // remove 'Invoice_' from string
			
			// format the invoice date in the following format YYMMDD
			var fileDate = invoiceDate.format('ymd');
			
			// set the file name
			PDF_File.name = siteAlias + ' - ' + fileDate + ' - ' + invoiceTranID;
			
			// set the attachments folder
			PDF_File.folder = fileCabinetFolder;
			
			try
				{
					PDF_File.save();
					
					log.audit({
						title: 'PDF Created',
						details: 'Invoice ID: ' + invoiceID
					});
				}
			catch(e)
				{
					log.error({
						title: 'Error Creating PDF',
						details: 'Invoice ID: ' + invoiceID + '<br>Error: ' + e
					});
				}
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
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
