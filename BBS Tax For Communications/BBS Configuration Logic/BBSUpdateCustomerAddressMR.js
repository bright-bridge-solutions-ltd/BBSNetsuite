/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, search) {
   
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
    	
    	// run search to find customers to be processed
    	return search.create({
    		type: search.Type.CUSTOMER,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'country',
    			join: 'billingaddress',
    			operator: search.Operator.ANYOF,
    			values: ['US']
    		}],
    		
    		columns: [{
    			name: 'entityid'
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
    	var searchResult 	= JSON.parse(context.value);
    	var customerID		= searchResult.id;
    	var customerName	= searchResult.values['entityid'];
    	
    	log.audit({
    		title: 'Processing Customer',
    		details: 'Name: ' + customerName + '<br>ID: ' + customerID
    	});
    	
    	try
    		{
    			// load the customer record
    			var customerRec = record.load({
    				type: record.Type.CUSTOMER,
    				id: customerID,
    				isDynamic: true
    			});
    			
    			// get count of customer addresses
    			var addresses = customerRec.getLineCount({
    				sublistId: 'addressbook'
    			});
    			
    			// loop through addresses
    			for (var i = 0; i < addresses; i++)
    				{
    					// select the line
    					customerRec.selectLine({
    						sublistId: 'addressbook',
    						line: i
    					});
    					
    					// get the address subrecord
    					var addressSubrecord = customerRec.getCurrentSublistSubrecord({
    					    sublistId: 'addressbook',
    					    fieldId: 'addressbookaddress'
    					});
    					
    					// get the country from the address subrecord
    					var country = addressSubrecord.getValue({
    						fieldId: 'country'
    					});
    					
    					// if the country is 'US'
    					if (country == 'US')
    						{
    							// set the incorporated flag on the address subrecord
    							addressSubrecord.setValue({
    								fieldId: 'custrecord_bbstfc_incorporated',
    								value: true
    							});
    							
    							// save the changes to the line
    							customerRec.commitLine({
    								sublistId: 'addressbook'
    							})
    						}
    				}
    			
    			// save the customer record
    			customerRec.save({
    				ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Customer Updated',
    				details: customerID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Customer Addresses',
    				details: 'Customer ID: ' + customerID + '<br>Error: ' + e
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
	
    }

    return {
    	getInputData: getInputData,
    	map: map,
    	reduce: reduce,
    	summarize: summarize
    };
    
});
