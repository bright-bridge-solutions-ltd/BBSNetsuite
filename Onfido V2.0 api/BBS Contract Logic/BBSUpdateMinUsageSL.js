/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/redirect'],
function(ui, record, search, redirect) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method === 'GET')
			{
    			// retrieve parameters that have been passed to the Suitelet
    			var recordID = context.request.parameters.record; // record is passed as a parameter the the page
    		
    			// create form
				var form = ui.createForm({
	                title: 'Update Minimum Usage',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 143274;
				
				// add a field to the form to store the internal ID of the record
				var recordIdField = form.addField({
					id: 'recordid',
					type: ui.FieldType.TEXT,
					label: 'Record ID'
				});
				
				// set the recordIdField's value using the recordID variable
				recordIdField.defaultValue = recordID;
				
				// set the recordIdField to be hidden
				recordIdField.updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});
				
				// add logo inline HTML field to the form
				var pageLogo = form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				// set default value of the pageLogo field
				pageLogo.defaultValue = "<img src='https://5554661.app.netsuite.com/core/media/media.nl?id=23854&c=5554661&h=268a7aa2af99ce665d56' alt='Onfido Logo' style='width: 300px; height: 100px;'>";
				
				// add a field to the form to display the contract record
				var contractRecordField = form.addField({
					id: 'contractrecord',
					type: ui.FieldType.TEXT,
					label: 'Contract Record'
				});
				
				// set the contractRecordField to be inline
				contractRecordField.updateDisplayType({
					displayType: ui.FieldDisplayType.INLINE
				});
				
				// update contractRecordField break type
				contractRecordField.updateBreakType({
				    breakType: ui.FieldBreakType.STARTCOL
				});
				
				// lookup fields on the contract record
				var contractRecordLookup = search.lookupFields({
					type: 'customrecord_bbs_contract',
					id: recordID,
					columns: ['name']
				});
				
				// retrieve values from the contractRecordLookup
				var tranID = contractRecordLookup.name;
				
				// set the default value of the contractRecordField and contractEndDateField fields
				contractRecordField.defaultValue = tranID;
				
				// add a sublist to the form
				var sublist = form.addSublist({
					type: ui.SublistType.LIST,
					id: 'minimumusagesublist',
					label: 'Minimum Usage',
				});
				
				// add fields to the sublist
				sublist.addField({
					type: ui.FieldType.CHECKBOX,
					id: 'update',
					label: 'Update'
				}).updateDisplayType({
					displayType: ui.FieldDisplayType.DISABLED
				});
				
				sublist.addField({
					type: ui.FieldType.TEXT,
					id: 'internalid',
					label: 'Internal ID'
				}).updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN
				});
				
				sublist.addField({
					type: ui.FieldType.INTEGER,
					id: 'month',
					label: 'Month'
				});
				
				sublist.addField({
					type: ui.FieldType.CURRENCY,
					id: 'minimumusage',
					label: 'Minimum Usage'
				}).updateDisplayType({
					displayType: ui.FieldDisplayType.ENTRY
				});
				
				// call function to search for minimum usage records. Pass recordID
				var searchResults = minimumUsageSearch(recordID);
				
				// initiate line variable
				var line = 0;
				
				// run search and process results
				searchResults.run().each(function(result){
					
					// retrieve search results
					var internalID = result.id;
					
					var month = result.getValue({
						name: 'custrecord_bbs_contract_min_usage_month'
					});
					
					var minimumUsage = result.getValue({
						name: 'custrecord_bbs_contract_min_usage'
					});
					
					// set sublist fields
					sublist.setSublistValue({
						id: 'internalid',
						line: line,
						value: internalID
					});
					
					sublist.setSublistValue({
						id: 'month',
						line: line,
						value: month
					});
					
					sublist.setSublistValue({
						id: 'minimumusage',
						line: line,
						value: minimumUsage
					});
					
					// increase line variable
					line ++;
					
					// continue processing additional results
					return true;
					
				});
				
				// add submit button to the form
   		 		form.addSubmitButton({
   		 			label : 'Submit'
   		 		});
   		 		
   		 		// add cancel button to the form
   		 		form.addButton({
   		 			id: 'custpage_cancel_button',
   		 			label: 'Cancel',
   		 			functionName: 'cancelButton(' + recordID + ')' // pass recordID as a parameter to the script function
   		 		});
				
				// write the response to the page
				context.response.writePage(form);

			}
    	else if (context.request.method === 'POST')
			{
    			// get the value of the recordid field
    			var recordID = context.request.parameters.recordid;
    		
    			// get count of sublist lines
    			var lineCount = context.request.getLineCount('minimumusagesublist');
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the value of the 'Update' checkbox
    					var update = context.request.getSublistValue({
    						group: 'minimumusagesublist',
    						name: 'update',
    						line: i
    					});
    					
    					// only process lines where the update checkbox is ticked
    					if (update == 'T')
    						{
    							// get the internal ID and minimum usage for the line
    							var internalID = context.request.getSublistValue({
    	    						group: 'minimumusagesublist',
    	    						name: 'internalid',
    	    						line: i
    	    					});
    							
    							var minimumUsage = context.request.getSublistValue({
    	    						group: 'minimumusagesublist',
    	    						name: 'minimumusage',
    	    						line: i
    	    					});
    							
    							try
    								{
    									// update the minimum usage record
    									record.submitFields({
    										type: 'customrecord_bbs_contract_minimum_usage',
    										id: internalID,
    										values: {
    											custrecord_bbs_contract_min_usage: minimumUsage
    										}
    									});
    								}
    							catch(e)
    								{
    									log.error({
    										title: 'Error Updating Minimum Usage Record',
    										details: 'Record ID: ' + internalID + '<br>Error: ' + e
    									});
    								}
    						}
    				}
    			
    			// return the user to the contract record
				redirect.toRecord({
				    type: 'customrecord_bbs_contract', 
				    id: recordID
				});
    		
			}	

    }
    
    // =================================================================
    // FUNCTION TO SEARCH/RETURN MINIMUM USAGE RECORDS FOR THIS CONTRACT
    // =================================================================
    
    function minimumUsageSearch(contractRecordID)
    	{
	    	// create search to find minimum usage records for this contract
			var minimumUsageSearch = search.create({
				type: 'customrecord_bbs_contract_minimum_usage',
				
				filters: [{
					name: 'isinactive',
					operator: 'is',
					values: ['F']
				},
						{
					name: 'custrecord_bbs_contract_min_usage_parent',
					operator: 'anyof',
					values: [contractRecordID]
				}],
				
				columns: [{
					name: 'custrecord_bbs_contract_min_usage_month',
					sort: search.Sort.ASC
				},
						{
					name: 'custrecord_bbs_contract_min_usage'
				}],
	
			});
			
			return minimumUsageSearch;
			
    	}

    return {
        onRequest: onRequest
    };
    
});
