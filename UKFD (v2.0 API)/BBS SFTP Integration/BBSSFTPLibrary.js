/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/format', 'N/runtime', 'N/url'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, format, runtime, url)  {

    // ===========================================
    // FUNCTION TO GET THE SFTP CONNECTION DETAILS
    // ===========================================
    
    function getSftpDetails(supplierID) {
    	
    	// declare and initialize variables
    	var endpoint 		= null;
    	var username 		= null;
    	var password 		= null;
    	var hostKey			= null;
    	var portNumber		= null;
    	var outDirectory	= null;
    	var inDirectory		= null;
    	var unitsOfQuantity	= null;
    	var leadTime		= null;
    	var processingDays	= null;
    	
    	// search for Supplier SFTP Detail records
    	search.create({
    		type: 'customrecord_bbs_sftp',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_sftp_supplier',
    			operator: search.Operator.ANYOF,
    			values: [supplierID]
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_sftp_endpoint'
    		},
    				{
    			name: 'custrecord_bbs_sftp_username'
    		},
    				{
    			name: 'custrecord_bbs_sftp_password'
    		},
    				{
    			name: 'custrecord_bbs_sftp_host_key'
    		},
    				{
    			name: 'custrecord_bbs_sftp_port_number'
    		},
    				{
    			name: 'custrecord_bbs_sftp_outbound_directory'
    		},
    				{
    			name: 'custrecord_bbs_sftp_inbound_directory'
    		},
    				{
    			name: 'custrecord_bbs_sftp_units_of_quantity'
    		},
    				{
    			name: 'custrecord_bbs_sftp_lead_time'
    		},
    				{
    			name: 'custrecord_bbs_sftp_processing_days'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the SFTP details from the search result
    		endpoint = result.getValue({
    			name: 'custrecord_bbs_sftp_endpoint'
    		});
    		
    		username = result.getValue({
    			name: 'custrecord_bbs_sftp_username'
    		});
    		
    		password = result.getValue({
    			name: 'custrecord_bbs_sftp_password'
    		});
    		
    		hostKey = result.getValue({
    			name: 'custrecord_bbs_sftp_host_key'
    		});
    		
    		portNumber = result.getValue({
    			name: 'custrecord_bbs_sftp_port_number'
    		});
    		
    		outDirectory = result.getValue({
    			name: 'custrecord_bbs_sftp_outbound_directory'
    		});
    		
    		inDirectory = result.getValue({
    			name: 'custrecord_bbs_sftp_inbound_directory'
    		});
    		
    		unitsOfQuantity = result.getText({
    			name: 'custrecord_bbs_sftp_units_of_quantity'
    		});
    		
    		leadTime = result.getValue({
    			name: 'custrecord_bbs_sftp_lead_time'
    		});
    		
    		processingDays = result.getValue({
    			name: 'custrecord_bbs_sftp_processing_days'
    		});
    		
    	});
    	
    	// return values to the main script function
    	return {
    		endpoint:			endpoint,
    		username:			username,
    		password:			password,
    		hostKey:			hostKey,
    		portNumber:			portNumber,
    		outDirectory:		outDirectory,
    		inDirectory:		inDirectory,
    		unitsOfQuantity:	unitsOfQuantity,
    		leadTime:			leadTime,
    		processingDays:		processingDays
    	}
    	
    }
    
    // =====================================================
	// FUNCTION TO LOOKUP DETAILS ON THE RELATED SALES ORDER
	// =====================================================
	
	function getSalesOrderInfo(salesOrderID) {
		
		// declare and initialize variables
		var menziesDepot 	= null;
		var shipDate		= null;
		
		// lookup values on the sales order
		var salesOrderLookup = search.lookupFields({
			type: search.Type.SALES_ORDER,
			id: salesOrderID,
			columns: ['custbody_bbs_menzies_depot_number', 'shipdate']
		});
		
		// return values to the main script function
		return {
			menziesDepot: 	salesOrderLookup.custbody_bbs_menzies_depot_number,
			shipDate:		salesOrderLookup.shipdate
		}
		
	}
	
	// ================================================
	// FUNCTION TO LOOKUP DETAILS ON THE PURCHASE ORDER
	// ================================================
	
	function getPurchaseOrderInfo(purchaseOrderID) {
		
		// declare and initialize variables
		var soShipDate = null;
		var supplierID = null;
		
		// lookup values on the purchase order
		var purchaseOrderLookup = search.lookupFields({
			type: search.Type.PURCHASE_ORDER,
			id: purchaseOrderID,
			columns: ['createdfrom.shipdate', 'entity']
		});
		
		// return values to the main script function
		return {
			soShipDate:		purchaseOrderLookup['createdfrom.shipdate'],
			supplierID:		purchaseOrderLookup.entity[0].value
		}
		
	}
	
	// =======================================
	// FUNCTION TO CALCULATE THE DELIVERY DATE
	// =======================================
	
	function calculateDeliveryDate(shipDate, sftpLeadTime, sftpProcessingDays) {
		
		// declare and initialize variables
		var validDate = false;
		
		// call function to get the bank holidays
		var bankHolidays = getBankHolidays();
		
		// split sftpProcessingDays on the , to create an array
		sftpProcessingDays = sftpProcessingDays.split(',');
		
		// convert the ship date to a date object
		var requiredDeliveryDate = format.parse({
			type: format.Type.DATE,
			value: shipDate
		});
		
		// while this is not a valid date
		while(validDate == false)
			{
				// subtract the lead time from the ship date to calculate the required delivery date
				requiredDeliveryDate.setDate(requiredDeliveryDate.getDate() - sftpLeadTime);
				
				// check if the date is a processingDay
				var processingDay = isProcessingDay(sftpProcessingDays, requiredDeliveryDate);
				
				// if this is a processing day
				if (processingDay == true)
					{
						// check if the date is a bank holiday
						var bankHoliday = isBankHoliday(bankHolidays, requiredDeliveryDate);
						
						// if this is not a bank holiday
						if (bankHoliday == false)
							{
								// set validDate to true
								validDate = true;
							}
					}
			}
		
		// convert requiredDeliveryDate back to a date string
		requiredDeliveryDate = format.format({
			type: format.Type.DATE,
			value: requiredDeliveryDate
		});
		
		// return values to main script function
		return requiredDeliveryDate;
		
	}
	
	// ===========================================
	// FUNCTION TO RETURN THE PUBLIC/BANK HOLIDAYS
	// ===========================================
	
	function getBankHolidays() {
		
		// declare and initialize variables
		var bankHolidays = new Array();
		
		// run search to return the bank holidays
		search.create({
			type: 'customrecord_bbs_bank_holiday',
			
			filters: [{
				name: 'isinactive',
				operator: search.Operator.IS,
				values: ['F']
			}],
			
			columns: [{
				name: 'custrecord_bbs_bank_holiday_date',
				sort: search.Sort.ASC
			}],
			
		}).run().each(function(result){
			
			// get the bank holiday date
			var bankHolidayDate = result.getValue({
				name: 'custrecord_bbs_bank_holiday_date'
			});
			
			// convert bankHoliday date to a date object
			bankHolidayDate = format.parse({
				type: format.Type.DATE,
				value: bankHolidayDate
			});
			
			// push the date to the bankHolidays array
			bankHolidays.push(bankHolidayDate);
			
			// continue processing search results
			return true;
			
		});
		
		// return values to the main script function
		return bankHolidays;
		
	}
	
	// =============================================
	// FUNCTION TO CHECK IF A DATE IS A BANK HOLIDAY
	// =============================================
	
	function isBankHoliday(bankHolidays, inputDate) {
		
		// declare and initialize variables
		var bankHoliday = false;
		
		// loop through bank holidays days
		for (var i = 0; i < bankHolidays.length; i++)
			{
				// get the bank holiday date
				var bankHolidayDate = bankHolidays[i];
				
				// if the bank holiday date matches the input date
				if (bankHolidayDate.getTime() == inputDate.getTime())
					{
						// set bankHoliday to true
						bankHoliday = true;
						
						// break the loop
						break;
					}
			}
		
		// return values to the main script function
		return bankHoliday;
		
	}
	
	// ===============================================
	// FUNCTION TO CHECK IF A DATE IS A PROCESSING DAY
	// ===============================================
	
	function isProcessingDay(processingDays, inputDate) {
		
		// declare and initialize variables
		var processingDay = false;
		
		// get the day of the week from the inputDate
		var dayOfWeek = inputDate.getDay();
		
		// loop through processing days
		for (var i = 0; i < processingDays.length; i++)
			{
				// get the processing day number
				var processingDay = processingDays[i];
				
				// if the processing day matches the day of the week of the required delivery date
				if (processingDay == dayOfWeek)
					{
						// set isProcessingDay to true
						processingDay = true;
						
						// break the loop
						break;
					}
			}
		
		// return values to the main script function
		return processingDay;
		
	}
    
    return {
    	getSftpDetails:			getSftpDetails,
    	getSalesOrderInfo:		getSalesOrderInfo,
    	getPurchaseOrderInfo:	getPurchaseOrderInfo,
    	calculateDeliveryDate:	calculateDeliveryDate
    };
    
});
