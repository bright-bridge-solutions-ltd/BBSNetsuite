/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/search', 'N/record'],
/**
 * @param {search} search
 */
function(format, search, record) {
   
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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
    		{
		    	// declare and initialize variables
		    	contractRecord = null;
		    	itemRecord = null;
		    	errorMessages = null;
		    	
		    	// get the current record object
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the internal id of the record
		    	var recordID = currentRecord.id;
		    	
		    	// get the item
		    	var itemID = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_ims_usage_data_item'
		    	});
		    	
		    	// get the sales force ID
		    	var salesForceID = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_ims_usage_data_sf_id'
				});
		    	
		    	// get the subsidiary
		    	var subsidiary = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_ims_usage_data_subsidiary'
		    	});
				    	
				// get the date of the search
				var searchDate = currentRecord.getValue({
				    fieldId: 'custrecord_bbs_ims_usage_data_date'
				});
				
				// format searchDate as a date string
				searchDate = format.format({
					type: format.Type.DATE,
				    value: searchDate
				});
				
				// call function to return the matching item record
				var itemRecord = searchItems(itemID);
				
				// call function to return details for the matching contract record
				var contractRecordSearch = searchContracts(salesForceID, subsidiary, searchDate);
				
				// retrieve values from the contractRecordSearch array
				var contractRecord = contractRecordSearch[0];
				var customer = contractRecordSearch[1];
				var location = contractRecordSearch[2];
				var currency = contractRecordSearch[3];
				var salesRep = contractRecordSearch[4];
				var poNumber = contractRecordSearch[5];
		    	
		    	// check that we have a contract record
				if (contractRecord != null)
					{
						// call function to return the open sales order ID (if there is one)
						var salesOrderID = searchSalesOrders(contractRecord);
					}
				else
					{
						// declare salesOrderID as null
						var salesOrderID = null;
					}
				
				// update fields on the IMS Usage Date record
				record.submitFields({
					type: 'customrecord_bbs_ims_usage_data',
					id: recordID,
					values: {
						custrecord_bbs_ims_usage_data_contract: contractRecord,
						custrecord_bbs_ims_usage_data_customer: customer,
						custrecord_bbs_ims_usage_data_location: location,
						custrecord_bbs_ims_usage_data_currency: currency,
						custrecord_bbs_ims_usage_data_sales_rep: salesRep,
						custrecord_bbs_ims_usage_data_po_no: poNumber,
						custrecord_bbs_ims_usage_data_item_rec: itemRecord,
						custrecord_bbs_ims_usage_data_sales_ord: salesOrderID
					}
				});
    		}

    }
    
    // =========================
    // FUNCTIONS TO RUN SEARCHES
    // =========================
    
    function searchItems(itemID)
    	{
    		// declare and initialize variables
    		var itemRecord = null;
    		
    		// create search to find product for this item id
	    	var itemSearch = search.create({
	    		type: search.Type.ITEM,
	    		
	    		filters: [{
	    			name: 'isinactive',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    			{
	    			name: 'internalid',
	    			operator: 'anyof',
	    			values: [itemID]
	    		}],
	    		
	    		columns: [{
	    			name: 'internalid'
	    		}],
	    	});
	    	
	    	// run search and process results
	    	itemSearch.run().each(function(result){
	    		
	    		itemRecord = result.getValue({
	    			name: 'internalid'
	    		});
	    		
	    	});
	    	
	    	// return itemRecord
	    	return itemRecord;  	
    	}
    
    function searchContracts(salesForceID, subsidiary, searchDate)
    	{
    		// declare array to hold contract record data
    		var contractData = new Array();
    		
    		// create search to find contract record for this sales force id
			var contractSearch = search.create({
				type: 'customrecord_bbs_contract',
			    		
			    filters: [
			    			["isinactive","is","F"],
			    			"AND",
			    			["custrecord_bbs_contract_status","anyof","1"], // 1 = Approved
			    			"AND",
			    			["custrecord_bbs_contract_sales_force_id","is",salesForceID],
			    			"AND",
			    			["custrecord_bbs_contract_customer.subsidiary","anyof",subsidiary],
			    			"AND",
			    			["custrecord_bbs_contract_start_date","onorbefore",searchDate],
			    			"AND",
			    			["custrecord_bbs_contract_end_date","onorafter",searchDate],
			    			"AND",
			    			[["custrecord_bbs_contract_early_end_date","isempty",""],"OR",["custrecord_bbs_contract_early_end_date","onorafter",searchDate]],
			    		],
			    				
			    columns: [{
			    		name: 'custrecord_bbs_contract_customer'
			    	},
			    			{
			    		name: 'custrecord_bbs_contract_location'
			    	},
			    			{
			    		name: 'custrecord_bbs_contract_currency',			    		
			    	},
			    			{
			    		name: 'custrecord_bbs_contract_sales_rep'
			    	},
			    			{
			    		name: 'custrecord_bbs_contract_po_number'
			    	}],
			    		
			});
			    	
			// run search and process results
			contractSearch.run().each(function(result){
			    		
				// get values from the search
			    var contractRecord = result.id;
			    
			    var customer = result.getValue({
			    	name: 'custrecord_bbs_contract_customer'
			    });
			    
			    var location = result.getValue({
			    	name: 'custrecord_bbs_contract_location'
			    });
			    
			    var currency = result.getValue({
			    	name: 'custrecord_bbs_contract_currency'
			    });
			    
			    var salesRep = result.getValue({
			    	name: 'custrecord_bbs_contract_sales_rep'
			    });
			    
			    var poNumber = result.getValue({
			    	name: 'custrecord_bbs_contract_po_number'
			    });
			    
			    // push the search results to the contractData array
			    contractData.push(contractRecord);
			    contractData.push(customer);
			    contractData.push(location);
			    contractData.push(currency);
			    contractData.push(salesRep);
			    contractData.push(poNumber);
	
			});
			
			// return contractData array
			return contractData;
    	}
    
    function searchSalesOrders(contractRecord)
    	{
    		// declare and initialize variables
    		var salesOrderID = null;
    		
    		// create search to find open sales orders for this contract record
    		var salesOrderSearch = search.create({
    			type: search.Type.SALES_ORDER,
    			
    			filters: [{
    				name: 'mainline',
    				operator: 'is',
    				values: ['T']
    			},
    					{
    				name: 'status',
    				operator: 'anyof',
    				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
    			},
    					{
        			name: 'custbody_bbs_contract_record',
        			operator: 'anyof',
        			values: [contractRecord]
        		}],
        		
        		columns: [{
        			name: 'externalid'
        		}],
    			
    		});
    		
    		// run search and process results
    		salesOrderSearch.run().each(function(result){
    			
    			// get the external id of the sales order
    			salesOrderID = result.getValue({
    				name: 'externalid'
    			});
    			
    		});
    		
    		// return salesOrderID
    		return salesOrderID;
    	}
    

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
