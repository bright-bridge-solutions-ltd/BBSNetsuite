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
    			values: ['lastmonth']
    		},
    				{
    			name: 'custrecord_bbs_service_data_end_date',
    			operator: 'notbefore',
    			values: ['lastmonth']
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
						name: 'custrecord_bbs_service_data_service_name',
						summary: 'MAX'
					},
							{
						name: 'formulacurrency',
						summary: 'GROUP',
						formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END,2)"
					},
							{
						name: 'formulanumeric',
						summary: 'MAX',
						formula: "COUNT({internalid})"
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
		    			values: ['lastmonth']
		    		},
		    				{
		    			name: 'custrecord_bbs_service_data_end_date',
		    			operator: 'notbefore',
		    			values: ['lastmonth']
		    		}],
					
				});
				
				// run search and process results
				serviceDataSearch.run().each(function(result) {
					
					// retrieve search results
					var item = result.getValue({
						name: 'custrecord_bbs_service_data_product_rec',
						summary: 'GROUP'
					});
					
					var description = result.getValue({
						name: 'custrecord_bbs_service_data_service_name',
						summary: 'MAX'
					});
					
					var rate = result.getValue({
						name: 'formulacurrency',
						summary: 'GROUP'
					});
					
					var quantity = result.getValue({
						name: 'formulanumeric',
						summary: 'MAX'
					});
					
					// multiply rate by quantity
					rate = rate * quantity;
					
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
						fieldId: 'rate',
						value: rate
					});
					
					invoiceRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_bbs_site',
						value: siteID
					});
					
					// commmit the line
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
			
			// get date parts which will be used in the file name
			var fileDateMonth = invoiceDate.getMonth()+1;
			
			// check if fileDateMonth is less than 10
			if (fileDateMonth < 10)
				{
					// convert to string
					fileDateMonth = JSON.stringify(invoiceDate.getMonth()+1);
					
					// build up string with 0 at the start
					fileDateMonth = '0' + fileDateMonth;
				}
			
			var fileDate = invoiceDate.getDate();
			var fileDateYear = invoiceDate.getFullYear();
			fileDateYear = JSON.stringify(fileDateYear); // convert from object to string
			fileDateYear = fileDateYear.substring(2, 4); // remove first 2 characters from string
			
			// set the file name
			PDF_File.name = siteAlias + ' - ' + fileDateYear + fileDateMonth + fileDate + ' - ' + invoiceTranID;
			
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

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
