/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the item sublist
    			var itemSublist = scriptContext.form.getSublist({
    				id: 'item'
    			});
    			
    			// if we have been able to get the item sublist
    			if (itemSublist)
    				{
    					// set client script to run on the form
    					scriptContext.form.clientScriptFileId = 172159;
    				
    					// add a button to the item sublist
    					itemSublist.addButton({
    						id: 'custpage_resetexpectedshipdates',
    						label: 'Reset Expected Ship Dates',
    						functionName: 'resetExpectedShipDates()'
    					});
    				}
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
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{   	
		    	// declare and initialize variables
    			var shipDate = null;
    		
    			// get the current record
		    	var currentRecord 	= scriptContext.newRecord;
		    	var recordID		= currentRecord.id;
		    	
		    	// run search to find the earliest ship date for this sales order
		    	search.create({
		    		type: search.Type.SALES_ORDER,
		    		
		    		filters: [{
		    			name: 'internalid',
		    			operator: search.Operator.ANYOF,
		    			values: [recordID]
		    		},
		    				{
		    			name: 'mainline',
		    			operator: search.Operator.IS,
		    			values: ['F']
		    		},
		    				{
		    			name: 'cogs',
		    			operator: search.Operator.IS,
		    			values: ['F']
		    		},
		    				{
		    			name: 'shipping',
		    			operator: search.Operator.IS,
		    			values: ['F']
		    		},
		    				{
		    			name: 'taxline',
		    			operator: search.Operator.IS,
		    			values: ['F']
		    		},
		    				{
		    			name: 'formulanumeric',
		    			formula: '{quantity} - {quantityshiprecv}',
		    			operator: search.Operator.GREATERTHAN,
		    			values: [0]
		    		},
		    				{
		    			name: 'shipdate',
		    			operator: search.Operator.ISNOTEMPTY
		    		},
		    				{
		    			name: 'shipdate',
		    			operator: search.Operator.ONORAFTER,
		    			values: ['today']
		    		}],
		    		
		    		columns: [{
		    			name: 'shipdate',
		    			summary: 'MIN'
		    		}],
		    		
		    	}).run().each(function(result){
		    		
		    		// get the earliest ship date from the search results
		    		shipDate = result.getValue({
		    			name: 'shipdate',
		    			summary: 'MIN'
		    		});
		    		
		    	});
		    	
		    	try
		    		{
		    			// update the ship date on the sales order
		    			record.submitFields({
		    				type: record.Type.SALES_ORDER,
		    				id: recordID,
		    				values: {
		    					shipdate: shipDate
		    				}
		    			});
		    			
		    			log.audit({
		    				title: 'Sales Order Updated',
		    				details: recordID
		    			});
		    		}
		    	catch(e)
		    		{
		    			log.error({
		    				title: 'Error Updating Sales Order',
		    				details: 'Record ID: ' + recordID + '<br>Error: ' + e.message
		    			});
		    		}
    		}

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
