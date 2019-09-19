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
    	
    	var request = context.request;
    	
    	if (context.request.method === 'GET')
			{
    			// retrieve parameters that have been passed to the Suitelet
    			var recordID = request.parameters.record; // record is passed as a parameter the the page
    		
    			// create form
				var form = ui.createForm({
	                title: 'End Contract Early',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 9545;
				
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
				pageLogo.defaultValue = "<img src='https://5554661-sb1.app.netsuite.com/core/media/media.nl?id=9544&c=5554661_SB1&h=3c1a74753ea9e8671a1c' alt='Onfido Logo' style='width: 250px; height: 102px;'>";
				
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
				
				// add a field to the form to display the contract end date
				var contractEndDateField = form.addField({
					id: 'contractenddate',
					type: ui.FieldType.TEXT,
					label: 'Contract End Date'
				});
				
				// set the contractEndDateField to be inline
				contractEndDateField.updateDisplayType({
					displayType: ui.FieldDisplayType.INLINE
				});
				
				// lookup fields on the contract record
				var contractRecordLookup = search.lookupFields({
					type: 'customrecord_bbs_contract',
					id: recordID,
					columns: ['name', 'custrecord_bbs_contract_end_date']
				});
				
				// retrieve values from the contractRecordLookup
				var tranID = contractRecordLookup.name;
				var endDate = contractRecordLookup.custrecord_bbs_contract_end_date;
				
				// set the default value of the contractRecordField and contractEndDateField fields
				contractRecordField.defaultValue = tranID;
				contractEndDateField.defaultValue = endDate;
				
				// add date select field to the form
				var dateSelect = form.addField({
                    id: 'dateselect',
                    type: ui.FieldType.DATE,
                    label: 'Early Termination Date'
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
    			var recordID = request.parameters.recordid;
    		
    			// get the value of the dateselect field
    			var dateSelect = request.parameters.dateselect;
    			
    			// update the early termination date field on the contract record
    			record.submitFields({
    				type: 'customrecord_bbs_contract',
    				id: recordID,
    				values: {
    					custrecord_bbs_contract_early_end_date: dateSelect
    				}
    			});
    			
    			// return the user to the contract record
				redirect.toRecord({
				    type: 'customrecord_bbs_contract', 
				    id: recordID
				});
    		
			}  	

    }

    return {
        onRequest: onRequest
    };
    
});
