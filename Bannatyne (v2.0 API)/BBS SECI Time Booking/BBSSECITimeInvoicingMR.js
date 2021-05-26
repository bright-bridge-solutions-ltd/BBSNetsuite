/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
    // call function to retrieve script parameters. Script parameters are global variables so can be accessed throughout the script
	scriptParameters = getScriptParameters();
	
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
    	
    	// run search to find SECIs pay
    	return search.create({
    		type: 'customrecord_bbs_seci_time_entry',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_seci_time_entry_approval',
    			operator: search.Operator.ANYOF,
    			values: [1] // 1 = Approved
    		},
    				{
    			name: 'custrecord_bbs_seci_time_entry_invoiced',
    			operator: search.Operator.IS,
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'custrecordbbs_seci_time_entry_supplier',
    			summary: search.Summary.GROUP
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_seci_time_entry_location',
    			summary: search.Summary.MAX
    		},
    				{
    			name: 'formulatext',
    			summary: search.Summary.MAX,
    			formula: "REPLACE(NS_CONCAT({internalid}), ',',',')"
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
    	
    	// declare and initialize variables
    	var vendorBillID = null;
    	
    	// retrieve search results
    	var searchResult 		= JSON.parse(context.value);
    	var supplierID			= searchResult.values['GROUP(custrecordbbs_seci_time_entry_supplier)'].value;
    	var locationID			= searchResult.values['MAX(internalid.custrecord_bbs_seci_time_entry_location)'];
    	var timeEntryRecords	= searchResult.values['MAX(formulatext)'];
    	
    	log.audit({
    		title: 'Processing Supplier',
    		details: supplierID
    	});
    	
    	try
    		{
    			// create a new vendor bill record
    			var vendorBill = record.transform({
    				fromType: record.Type.VENDOR,
    				fromId: supplierID,
    				toType: record.Type.VENDOR_BILL,
    				isDynamic: true
    			});
    			
    			// set fields on the vendor bill record
    			vendorBill.setValue({
    				fieldId: 'tranid',
    				value: 'TEST' //TODO
    			});
    			
    			vendorBill.setValue({
    				fieldId: 'location',
    				value: locationID
    			});
    			
    			vendorBill.setValue({
    				fieldId: 'department',
    				value: scriptParameters.department
    			});
    			
    			vendorBill.setValue({
    				fieldId: 'class',
    				value: scriptParameters.lineOfBusiness
    			});
    			
    			// run search to find time entries to be billed
    			search.create({
    				type: 'customrecord_bbs_seci_time_entry_li',
    				
    				filters: [{
    					name: 'isinactive',
    					operator: search.Operator.IS,
    					values: ['F']
    				},
    						{
    					name: 'custrecord_bbs_seci_time_entry_invoiced',
    					join: 'custrecord_bbs_seci_time_entry_li_parent',
    					operator: search.Operator.IS,
    					values: ['F']
    				},
    						{
    					name: 'custrecord_bbs_seci_time_entry_approval',
    					join: 'custrecord_bbs_seci_time_entry_li_parent',
    	    			operator: search.Operator.ANYOF,
    	    			values: [1] // 1 = Approved
    	    		},
    						{
    					name: 'custrecordbbs_seci_time_entry_supplier',
    					join: 'custrecord_bbs_seci_time_entry_li_parent',
    					operator: search.Operator.ANYOF,
    					values: [supplierID]
    				}],
    				
    				columns: [{
    					name: 'custrecord_bbs_seci_time_entry_li_date'
    				},
    						{
    					name: 'custrecord_bbs_seci_time_entry_li_class'
    				},
    						{
    					name: 'custrecord_bbs_seci_time_entry_li_length'
    				},
    						{
    					name: 'custrecord_bbs_seci_time_entry_li_rate'
    				}],
    				
    			}).run().each(function(result){
    				
    				// retrieve search results
    				var classDate = result.getValue({
    					name: 'custrecord_bbs_seci_time_entry_li_date'
    				});
    				
    				var className = result.getValue({
    					name: 'custrecord_bbs_seci_time_entry_li_class'
    				});
    				
    				var classLength = result.getValue({
    					name: 'custrecord_bbs_seci_time_entry_li_length'
    				});
    				
    				var hourlyRate = result.getValue({
    					name: 'custrecord_bbs_seci_time_entry_li_rate'
    				});
    				
    				// add a new line to the vendor bill record
    				vendorBill.selectNewLine({
    					sublistId: 'item'
    				});
    				
    				vendorBill.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'item',
    					value: scriptParameters.item
    				});
    				
    				vendorBill.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'description',
    					value: 'Date of Class: ' + classDate + '<br>Class: ' + className
    				});
    				
    				vendorBill.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'quantity',
    					value: classLength
    				});
    				
    				vendorBill.setCurrentSublistValue({
    					sublistId: 'item',
    					fieldId: 'rate',
    					value: hourlyRate
    				});
    				
    				vendorBill.commitLine({
    					sublistId: 'item'
    				});
    				
    				// continue processing search results
    				return true;
    				
    			});
    			
    			// save the vendor bill record
    			vendorBillID = vendorBill.save();
    			
    			log.audit({
    				title: 'Vendor Bill Created Successfully',
    				details: 'Supplier ID: ' + supplierID + '<br>Vendor Bill ID: ' + vendorBillID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Vendor Bill for Supplier ' + supplierID,
    				details: e.message
    			});
    		}
    	
    	// did we manage to successfully create the invoice?
    	if (vendorBillID)
    		{
	    		// split the timeEntryRecords string to create an array
    			timeEntryRecords = timeEntryRecords.split(',');
    			
    			// loop through time entry records
    			for (var i = 0; i < timeEntryRecords.length; i++)
    				{
    					try
    						{
    							// mark the SECI time entry record as invoiced
    							record.submitFields({
    								type: 'customrecord_bbs_seci_time_entry',
    								id: timeEntryRecords[i],
    								values: {
    									custrecord_bbs_seci_time_entry_invoiced: true
    								}
    							});
    							
    							log.audit({
    								title: 'SECI Time Entry Record Updated',
    								details: timeEntryRecords[i]
    							});
    						}
    					catch(e)
    						{
    							log.error({
    								title: 'Error Updating SECI Time Entry Record ' + timeEntryRecords[i],
    								details: e.message
    							});
    						}
    				}
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

    }
    
    // ======================================
    // FUNCTION TO RETRIEVE SCRIPT PARAMETERS
    // ======================================
    
    function getScriptParameters() {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var department = currentScript.getParameter({
    		name: 'custscript_bbs_seci_time_invoicing_dept'
    	});
    	
    	var lineOfBusiness = currentScript.getParameter({
    		name: 'custscript_bbs_seci_time_invoicing_lob'
    	});
    	
    	var item = currentScript.getParameter({
    		name: 'custscript_bbs_seci_time_invoicing_item'
    	});
    	
    	// return values to main script function
    	return {
    		department:		department,
    		lineOfBusiness:	lineOfBusiness,
    		item:			item
    	}
    	
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
