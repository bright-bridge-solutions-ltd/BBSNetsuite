/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
function(record, search) {

    function beforeSubmit(context) {
    	
    	// check if record is being created
    	if (context.type == 'create')
    		{
    			var currentRecord = context.newRecord;
    			
    			// get line item count
    			var lineCount = currentRecord.getLineCount({
    				sublistId: 'revenueelement'
    			});
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the value of the source field
    					var source = currentRecord.getSublistValue({
    						sublistId: 'revenueelement',
    						fieldId: 'source',
    						line: i
    					});
    					
    					log.debug({
    						title: 'Source',
    						details: source
    					});
    					
    					// check if the source variable contains 'Credit Memo'
    					if (source.indexOf('Credit Memo') !== -1)
    						{
    							// get the internal ID of the source record
    							var creditMemoID = currentRecord.getSublistValue({
    								sublistId: 'revenueelement',
    								fieldId: 'referenceid',
    								line: i
    							});
    							
    							creditMemoID = creditMemoID.substring(16, 9); // use substring as referenceid field returns CustCred_67510
    							
    							log.debug({
    	    						title: 'Source ID',
    	    						details: creditMemoID
    	    					});
    							
    							// lookup billing type field on the credit memo record
    							var fieldLookup = search.lookupFields({
    			                    type: search.Type.CREDIT_MEMO,
    			                    id: creditMemoID,
    			                    columns: 'class'
    			                });
    							
    							var billingType = fieldLookup.class[0].value; // retrieve first 'class' value from fieldLookup array
    							
    							log.debug({
    	    						title: 'Billing Type',
    	    						details: billingType
    	    					});
    							
    							// run search against the BBS GL PLugin Mapping custom record to find correct GL account
    							var mappingSearch = search.create({
    								   type: 'customrecord_bbs_gl_plugin_mapping',
    								   
    								   columns: [{
    										name: 'custrecord_bbs_gl_to_account'
    									}],
    									
    									filters: [{
    										name: 'custrecord_bbs_gl_billing_type',
    										operator: 'anyof',
    										values: [billingType]
    									}],
    							});
    							
    							// process search results (only need the first result)
    							mappingSearch.run().each(function(result){

    								// get the internal ID of the 'To Account' from the search results
        					    	var toAccount = result.getValue({
        				    			name: 'custrecord_bbs_gl_to_account'
        					    	});
        					    	
        					    	// use the toAccount variable to set the recognition account field
        					    	currentRecord.setSublistValue({
        					    		sublistId: 'revenueelement',
        					    		fieldId: 'recognitionaccount',
        					    		value: toAccount,
        					    		line: i
        					    	});

 								});
    						}
    				}
    		}
    }
    
    return {
    	beforeSubmit: beforeSubmit,
    }

});
    			