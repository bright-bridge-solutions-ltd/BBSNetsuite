/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/file', 'N/task'],
function(runtime, search, file, task) {
   
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	fileCabinetFolder = currentScript.getParameter({
    	name: 'custscript_bbs_service_data_bill_folder'
    });
	
	subsidiary = currentScript.getParameter({
		name: 'custscript_bbs_subsidiary_select'
	});
	
	subsidiaryText = currentScript.getParameter({
		name: 'custscript_bbs_subsidiary_text'
	});
	
	emailSender = currentScript.getParameter({
		name: 'custscript_bbs_billing_run_email_sender'
	});
	
	initiatingUser = currentScript.getParameter({
		name: 'custscript_bbs_service_data_billing_user'
	});
	
	// if subsidiary is 2 (UK)
	if (subsidiary == 2)
		{
			// set filePrefix variable to UK
			filePrefix = 'UK';
		}
	else if (subsidiary == 3) // if subsidiary is 3 (US)
		{
			// set filePrefix variable to US
			filePrefix = 'US';
		}
	
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
    	
    	// run search to find service data sites to create a report for
    	return search.create({
			type: 'customrecord_bbs_service_data',
			
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'subsidiary',
    			join: 'custrecord_bbs_service_data_customer_rec',
    			operator: 'anyof',
    			values: [subsidiary]
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
	    	
	    	columns: [{
	    		name: 'custrecord_bbs_service_data_site_record',
	    		summary: 'GROUP',
	    		sort: search.Sort.ASC
	    	},
	    			{
	    		name: 'custrecord_bbs_service_data_site_alias',
	    		summary: 'MAX'
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
    	
    	// set the date of the report
    	var reportDate = new Date();
    	reportDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), 0); // set date to be the last day of the previous month
    	reportDate = reportDate.format('ymd'); // format the report date in the following format YYYY-MM-DD
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the site ID and alias from the search results
		var siteID		= searchResult.values['GROUP(custrecord_bbs_service_data_site_record)'].value;
		var siteAlias	= searchResult.values['MAX(custrecord_bbs_service_data_site_alias)'];
		
		// call functions to create CSV reports
		createSummaryTenantChargesReports(reportDate, siteID, siteAlias);
		createTenantChargesReports(reportDate, siteID, siteAlias);
		
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
    function summarize(summary) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});
    	
    	// ==============================================================
    	// NOW SCHEDULE SCHEDULED SCRIPT TO CREATE ADDITIONAL CSV REPORTS
    	// ==============================================================
    	
    	// create a scheduled task
    	var scheduledTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_create_customer_reports',
    	    deploymentId: 'customdeploy_bbs_create_customer_reports',
    	    params: {
    	    	custscript_bbs_subsidiary_select: subsidiary,
    	    	custscript_bbs_subsidiary_text: subsidiaryText,
    	    	custscript_bbs_service_data_billing_user: initiatingUser
    	    }
    	});
    	
    	// submit the scheduled task
    	var scheduledTaskID = scheduledTask.submit();
    	
    	log.audit({
    		title: 'Script Scheduled',
    		details: 'BBS Create Customer Reports script has been Scheduled. Job ID ' + scheduledTaskID
    	});

    }
    
    // ==============================
    // FUNCTION TO CREATE CSV REPORTS
    // ==============================
    
    function createSummaryTenantChargesReports(reportDate, siteID, siteAlias) {
    	
    	log.audit({
    		title: 'CREATING SUMMARY TENANT CHARGES REPORT',
    		details: siteAlias
    	});
    	
    	// specify the file name
		var fileName = filePrefix + '-' + reportDate + '-' + siteAlias + '-mp_clientservices.csv';
		
		// start off the CSV
		var CSV = '"ClientID","ClientAmount","OperatorAmount","Margin","ClientName","StartDateTime","EndDateTime","Site","BillingRef","LinkInvoiceYear","LinkInvoiceMonth"\r\n';
		
		// create search to find service data records to be included in the report
		var serviceDataSearch = search.create({
			type: 'customrecord_bbs_service_data',
		
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
    		
    		columns: [{
    			name: 'custrecord_bbs_service_data_tenant_alias',
    			label: 'ClientID'
    		},
    				{
    			name: 'formulacurrency',
    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_frequency} = 'One off' THEN {custrecord_bbs_service_data_sales_price} ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'DD') = TO_CHAR({custrecord_bbs_service_data_start_date},'DD') AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END END END, 2) * {custrecord_bbs_service_data_quantity}",
    			label: 'ClientAmount'
    		},
    				{
    			name: 'formulacurrency',
    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_frequency} = 'One off' THEN {custrecord_bbs_service_data_op_cost} ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'DD') = TO_CHAR({custrecord_bbs_service_data_start_date},'DD') AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END END END, 2) * {custrecord_bbs_service_data_quantity}",
    			label: 'OperatorAmount'
    		},
    				{
    			name: 'custrecord_bbs_service_data_tenant_name',
    			label: 'ClientName'
    		},
    				{
    			name: 'formuladate',
    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_start_date} ELSE LAST_DAY(ADD_MONTHS({today},-2))+1 END",
    			label: 'StartDateTime'
    		},
    				{
    			name: 'formuladate',
    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_end_date} ELSE LAST_DAY(ADD_MONTHS({today}, -1)) END",
    			label: 'EndDateTime'
    		},
    				{
    			name: 'custrecord_bbs_service_data_site_name',
    			label: 'Site'
    		},
    				{
    			name: 'custrecord_bbs_service_data_site_alias',
    			label: 'BillingRef'
    		},
    				{
    			name: 'formulatext',
    			formula: "TO_CHAR({today},'YYYY')",
    			label: 'LinkInvoiceYear'
    		},
    				{
    			name: 'formulatext',
    			formula: "TO_CHAR({today},'MM') - 1",
    			label: 'LinkInvoiceMonth'
    		}],
			
		});
	
		// get all the search results
		var searchResults = getAllResults(serviceDataSearch);
		
		// process search results
		for (var i = 0; i < searchResults.length; i++)
			{
				// retrieve search results. Using column numbers to return formula values
				var clientID = searchResults[i].getValue(searchResults[i].columns[0]);
				var clientAmount = searchResults[i].getValue(searchResults[i].columns[1]);
				var operatorAmount = searchResults[i].getValue(searchResults[i].columns[2]);
				var margin = parseFloat(operatorAmount - clientAmount); // calculate the margin
				var clientName = searchResults[i].getValue(searchResults[i].columns[3]);			
				var startDateTime = searchResults[i].getValue(searchResults[i].columns[4]);
				var endDateTime = searchResults[i].getValue(searchResults[i].columns[5]);
				var site = searchResults[i].getValue(searchResults[i].columns[6]);
				var billingRef = searchResults[i].getValue(searchResults[i].columns[7]);
				var linkInvoiceYear = searchResults[i].getValue(searchResults[i].columns[8]);
				var linkInvoiceMonth = searchResults[i].getValue(searchResults[i].columns[9]);
				
				// add the service data record details to the CSV
    			CSV += clientID + ',' + clientAmount + ',' + operatorAmount + ',' + margin + ',' + clientName + ',' + startDateTime + ',' + endDateTime + ',' + site + ',' + billingRef + ',' + linkInvoiceYear + ',' + linkInvoiceMonth;
    			CSV += '\r\n';
			}
	
		// call function to create the CSV file
		createCSV(fileName, CSV);

    }
    
    function createTenantChargesReports(reportDate, siteID, siteAlias) {
    	
    	log.audit({
    		title: 'CREATING TENANT CHARGES REPORT',
    		details: siteAlias
    	});
    	
    	// specify the file name
		var fileName = filePrefix + '-' + reportDate + '-' + siteAlias + '-arrears_invoice_reports.csv';
		
		// start off the CSV
		var CSV = '"Quantity","Telephone","AccountCode","Product","Type","Due","Unit Cost","Discount","Cost"\r\n';
		
		// create search to find service data records to be included in the report
		var serviceDataSearch = search.create({
			type: 'customrecord_bbs_service_data',
			
			filters: [{
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
	    	
	    	columns: [{
    			name: 'custrecord_bbs_service_data_quantity',
    			summary: 'SUM'
    		},
    				{
    			name: 'custrecord_bbs_service_data_tenant_name',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_service_data_parent_prod',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_service_data_sales_price',
    			summary: 'GROUP'
    		},
    				{
    			name: 'formulacurrency',
    			formula: "SUM({custrecord_bbs_service_data_quantity}) * MAX({custrecord_bbs_service_data_sales_price})",
    			summary: 'MAX'
    		}],
			
		});
		
		// get all the search results
		var searchResults = getAllResults(serviceDataSearch);
		
		// process search results
		for (var i = 0; i < searchResults.length; i++)
			{
				// retrieve search results
    			var quantity = searchResults[i].getValue({
    				name: 'custrecord_bbs_service_data_quantity',
    				summary: 'SUM'
    			});
    			
    			var accountCode = searchResults[i].getValue({
    				name: 'custrecord_bbs_service_data_tenant_name',
    				summary: 'GROUP'
    			});
    			
    			var product = searchResults[i].getValue({
    				name: 'custrecord_bbs_service_data_parent_prod',
    				summary: 'GROUP'
    			});
    			
    			var unitCost = searchResults[i].getValue({
    				name: 'custrecord_bbs_service_data_sales_price',
    				summary: 'GROUP'
    			});
    			
    			var cost = searchResults[i].getValue({
    				name: 'formulacurrency',
    				summary: 'MAX'
    			});
			
    			// add the service data record details to the CSV
    			CSV += quantity + ',' + ',' + accountCode + ',' + product + ',' + ',' + ',' + unitCost + ',' + 0 + ',' + cost;
    			CSV += '\r\n';
			}
		
		// call function to create the CSV file
		createCSV(fileName, CSV);
    	
    }
    
    // ===============================
    // FUNCTION TO CREATE THE CSV FILE
    // ===============================
    
    function createCSV(fileName, fileContents)
    	{
	    	try
	    		{
		    		// create a CSV file
			    	var csvFile = file.create({
			    		fileType: file.Type.CSV,
			    		name: fileName,
			    		contents: fileContents,
			    		folder: fileCabinetFolder
			    	});
			    	
			    	// save the file
			    	var fileID = csvFile.save();
	    	
			    	log.audit({
			    		title: 'CSV File Saved',
			    		details: 'File ID: ' + fileID
			    	});
	    		}
	    	catch(e)
	    		{
	    			log.error({
	    				title: 'Error Creating CSV',
	    				details: 'Error: ' + e
	    			});
	    		}
    	}
    
    // ============================================================
    // FUNCTION TO RETURN ALL SEARCH RESULTS WHEN OVER 4000 RESULTS
    // ============================================================
    
    function getAllResults(_search) 
    	{
	       	// run the search
    		var searchResult = _search.run();
    	
    		// get the initial set of results
			var start = 0;
			var end = 1000;
			
			var searchResultSet = searchResult.getRange({
			    start: start, 
			    end: end
			});
			
			var resultlen = searchResultSet.length;
		
			// if there is more than 1000 results, page through them
			while (resultlen == 1000) 
				{
						start += 1000;
						end += 1000;
		
						var moreSearchResultSet = searchResult.getRange({
						    start: start, 
						    end: end
						});
						
						resultlen = moreSearchResultSet.length;
		
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
			
			return searchResultSet;
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
        reduce: reduce,
        summarize: summarize
    };
    
});
