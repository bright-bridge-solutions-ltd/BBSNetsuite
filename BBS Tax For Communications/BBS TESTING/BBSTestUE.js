/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/runtime', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, record)
	{	
	

		/**
	     * Function definition to be triggered after record is saved.
	     *
	     * @param {Object} scriptContext
	     * @param {Record} scriptContext.newRecord - New record
	     * @param {Record} scriptContext.oldRecord - Old record
	     * @param {string} scriptContext.type - Trigger type
	     * @Since 2015.2
	     */
	    function calculateTaxesAS(scriptContext) 
		    {
	    		debugger;
	    	
								var newRecord 			= 	scriptContext.newRecord;
								var oldRecord 			= 	scriptContext.oldRecord;
								var currentRecordType	=	newRecord.type;
								var currentRecordID		=	newRecord.id;
								var recordMode 			= 	scriptContext.type;
								
								//Work out what to do based on the record mode
								//
								switch(recordMode)
									{
										case scriptContext.UserEventType.CREATE:
											
											//Calculate the taxes based on the new record only
											//
											calculateTaxes(newRecord, currentRecordType, currentRecordID, false);	//Parameters are plugin, record to process, record type, record id, adjustment true/false
											
											break;
											
										case scriptContext.UserEventType.EDIT:
											
											//Calculate the taxes based on the old & new record
											//
											calculateTaxes(oldRecord, currentRecordType, currentRecordID, true);		
											calculateTaxes(newRecord, currentRecordType, currentRecordID, false);	
											
											break;
									}


		    }
	
	    function calculateTaxes(_transactionRecord, _transactionRecordType, _transactionRecordId, _adjustmentFlag)
		    {
		    	
						var tranDate			=	_transactionRecord.getValue({fieldId: 'trandate'});
						var createdFrom			=	_transactionRecord.getValue({fieldId: 'createdfrom'});
						var customerID			=	_transactionRecord.getValue({fieldId: 'entity'});
						var currency			=	_transactionRecord.getValue({fieldId: 'currency'});
						var subsidiaryID		=	_transactionRecord.getValue({fieldId: 'subsidiary'});
						var lineCount			=	_transactionRecord.getLineCount({sublistId: 'item'});
						

							//Loop through each item line to process
								//
								for (var i = 0; i < lineCount; i++)
									{
								        //Retrieve line item values
										//
										var itemID				=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
										var itemType			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
										var itemRate			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
										var quantity			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
										var salesType			=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_sales_type', line: i});
										var discountType		=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_discount_type', line: i});
										var privateLineSplit	=	_transactionRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_private_line_split', line: i});
										

									}
		    }
	    
	    return 	{
	    			afterSubmit: 	calculateTaxesAS
	    		};
	    
	});
