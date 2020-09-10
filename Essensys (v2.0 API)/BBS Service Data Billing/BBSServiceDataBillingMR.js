/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format', 'N/render', 'N/file', 'N/task'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, search, record, format, render, file, task) {
	
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
	
	// declare new date object. Global variable so can be accessed throughout the script
	invoiceDate = new Date();
	invoiceDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 0); // set date to be the last day of the previous month
	
	// call function to calculate the accounting period. Pass invoiceDate
	accountingPeriod = calculateAccountingPeriod(invoiceDate);
   
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
    			name: 'custrecord_bbs_service_data_site_record',
    			operator: 'noneof',
    			values: ['@NONE@']
    		},
    				{
    			name: 'custrecord_bbs_service_data_product_rec',
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
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_service_data_site_record',
    			summary: 'GROUP',
    			sort: search.Sort.ASC
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
				
				invoiceRecord.setText({
    				fieldId: 'postingperiod',
    				value: accountingPeriod
    			});
				
				invoiceRecord.setValue({
					fieldId: 'location',
					value: locationID
				});
				
				invoiceRecord.setValue({
					fieldId: 'custbody_bbs_service_data_records',
					value: serviceDataRecords
				});
				
				invoiceRecord.setValue({
					fieldId: 'custbody_bbs_site_name',
					value: siteID
				});
				
				invoiceRecord.setValue({
					fieldId: 'class',
					value: 1 // 1 = Connect
				});
				
				// create search to find service data records to be billed
				var serviceDataSearch = search.create({
					type: 'customrecord_bbs_service_data',
					
					columns: [{
						name: 'custrecord_bbs_service_data_product_rec',
						summary: 'GROUP'
					},
							{
						name: 'custrecord_bbs_service_data_service_name',
						summary: 'MAX',
					},
    					{
		    			name: 'formuladate',
		    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_start_date} ELSE LAST_DAY(ADD_MONTHS({today},-2))+1 END",
		    			summary: 'GROUP'
		    		},
		    				{
		    			name: 'formuladate',
		    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_end_date} ELSE LAST_DAY(ADD_MONTHS({today}, -1)) END",
		    			summary: 'GROUP'
		    		},
							{
						name: 'formulacurrency',
						summary: 'GROUP',
						formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_frequency} = 'One off' THEN {custrecord_bbs_service_data_op_cost} ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'DD') = TO_CHAR({custrecord_bbs_service_data_start_date},'DD') AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END END END, 2)"
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
		    			name: 'custrecord_bbs_service_data_customer_rec',
		    			operator: 'noneof',
		    			values: ['@NONE@']
		    		},
		    				{
		    			name: 'custrecord_bbs_service_data_product_rec',
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
		    		}],
					
				});
				
				// run search and process results
				serviceDataSearch.run().each(function(result) {
					
					// retrieve search results. Using column numbers to return formulas
					var item = result.getValue(result.columns[0]);
					var description = result.getValue(result.columns[1]);
					
					var dateFrom = result.getValue(result.columns[2]);
						
					// format dateFrom as a date object
					dateFrom = format.parse({
						type: format.Type.DATE,
						value: dateFrom
					});
					
					var dateTo = result.getValue(result.columns[3]);
						
					// format dateTo as a date object
					dateTo = format.parse({
						type: format.Type.DATE,
						value: dateTo
					});
					
					var rate = result.getValue(result.columns[4]);
					var quantity = result.getValue(result.columns[5]);
					
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
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_bbs_date_from',
						value: dateFrom
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_bbs_date_to',
						value: dateTo
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
					details: 'Site ID: ' + siteID + '<br>Site Name: ' + siteName + '<br>Invoice ID: ' + invoiceID
				});
				
				// call function to create CSV report. Pass invoiceID, siteID and siteAlias variables
				createCSVReport(invoiceID, siteID, siteAlias);
			}
		catch(e)
			{
				log.error({
					title: 'Unable to Create Invoice',
					details: 'Site ID: ' + siteID + '<br>Site Name: ' + siteName + '<br>Error: ' + e
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
    	    scriptId: 'customscript_bbs_create_site_reports',
    	    deploymentId: 'customdeploy_bbs_create_site_reports',
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
    		details: 'BBS Create Site Reports script has been Scheduled. Job ID ' + scheduledTaskID
    	});

    }
    
    // ===============================
    // FUNCTION TO CREATE CSV REPORT
    // ===============================
    
    function createCSVReport(invoiceID, siteID, siteAlias)
    	{
	    	// lookup fields on the invoice record
    		var invoiceLookup = search.lookupFields({
    			type: search.Type.INVOICE,
    			id: invoiceID,
    			columns: ['tranid']
    		});
    		
    		// return values from the invoiceLookup
    		var tranID = invoiceLookup.tranid;
    	
    		// declare a new date object
			var fileDate = new Date();
			fileDate = new Date(fileDate.getFullYear(), fileDate.getMonth(), 0); // set date to be the last day of the previous month
			fileDate = fileDate.format('ymd'); // format date in the following format YYMMDD
    	
    		// specify the file name
    		var fileName = filePrefix + '-' + fileDate + '-' + siteAlias + '-arrears_invoice_reports_' + tranID + '.csv';
    		
    		// start off the CSV
    		var CSV = '"Accounts id","Account Name","Invoice Number","Date From","Date To","Service Name","Quantity","Operator Cost","Operator Total Cost","Tenant Alias","Tenant Name","Tenant Billing Reference","Tenant Cost","Tenant Total","Margin"\r\n';
    	
    		// create search to find service data records for this site
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
	    			name: 'custrecord_bbs_service_data_site_name',
	    		},
	    				{
	    			name: 'formuladate',
	    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_start_date} ELSE LAST_DAY(ADD_MONTHS({today},-2))+1 END"
	    		},
	    				{
	    			name: 'formuladate',
	    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_end_date} ELSE LAST_DAY(ADD_MONTHS({today}, -1)) END"
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_service_name'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_quantity'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_op_cost} = 0 THEN 0 ELSE CASE WHEN {custrecord_bbs_service_data_frequency} = 'One off' THEN {custrecord_bbs_service_data_op_cost} ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'DD') = TO_CHAR({custrecord_bbs_service_data_start_date},'DD') AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END END END END, 2)"
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "(ROUND(CASE WHEN {custrecord_bbs_service_data_op_cost} = 0 THEN 0 ELSE CASE WHEN {custrecord_bbs_service_data_frequency} = 'One off' THEN {custrecord_bbs_service_data_op_cost} ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'DD') = TO_CHAR({custrecord_bbs_service_data_start_date},'DD') AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END END END END, 2)) * {custrecord_bbs_service_data_quantity}"
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_tenant_alias'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_tenant_name',
	    			sort: search.Sort.ASC
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_billing_ref'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_sales_price} = 0 THEN 0 ELSE CASE WHEN {custrecord_bbs_service_data_frequency} = 'One off' THEN {custrecord_bbs_service_data_sales_price} ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'DD') = TO_CHAR({custrecord_bbs_service_data_start_date},'DD') AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END END END END, 2)"
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "(ROUND(CASE WHEN {custrecord_bbs_service_data_sales_price} = 0 THEN 0 ELSE CASE WHEN {custrecord_bbs_service_data_frequency} = 'One off' THEN {custrecord_bbs_service_data_sales_price} ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'DD') = TO_CHAR({custrecord_bbs_service_data_start_date},'DD') AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END END END END, 2)) * {custrecord_bbs_service_data_quantity}"
	    		}],
	    		
    		});
    		
    		// run search and process results
    		serviceDataSearch.run().each(function(result){
    			
    			// retrieve search results. Using column numbers to return formula values
				var accountName = result.getValue(result.columns[0]);
				var dateFrom = result.getValue(result.columns[1]);
				var dateTo = result.getValue(result.columns[2]);
				var product = result.getValue(result.columns[3]);
				var quantity = result.getValue(result.columns[4]);			
				var operatorCost = result.getValue(result.columns[5]);
				var operatorTotal = result.getValue(result.columns[6]);
				var tenantAlias = result.getValue(result.columns[7]);
				var tenantName = result.getValue(result.columns[8]);
				var tenantBillingRef = result.getValue(result.columns[9]);
				var tenantCost = result.getValue(result.columns[10]);
				var tenantTotal = result.getValue(result.columns[11]);
				var margin = parseFloat(tenantTotal - operatorTotal); // calculate total
				
				// add the service data details to the CSV
				CSV += siteAlias + ',' + accountName + ',' + tranID + ',' + dateFrom + ',' + dateTo + ',' + product + ',' + quantity + ',' + operatorCost + ',' + operatorTotal + ',' + tenantAlias + ',' + tenantName + ',' + tenantBillingRef + ',' + tenantCost + ',' + tenantTotal + ',' + margin;
				CSV += '\r\n';
    			
    			// continue processing search results
    			return true;
     			
    		});
    		
    		try
	    		{
		    		// create THE CSV file
			    	var csvFile = file.create({
			    		fileType: file.Type.CSV,
			    		name: fileName,
			    		contents: CSV,
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
    
    // =======================================
    // FUNCTION TO CALCULATE ACCOUNTING PERIOD
    // =======================================
    
    function calculateAccountingPeriod(date)
    	{
    		// create array of months
    		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    		
    		// calculate the posting period
    		var postingPeriod = months[date.getMonth()] + ' ' + date.getFullYear();
    		
    		// return the posting period
    		return postingPeriod;
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
