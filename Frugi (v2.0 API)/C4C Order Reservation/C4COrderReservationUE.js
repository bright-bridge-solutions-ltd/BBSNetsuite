/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) 
{
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) 
    	{
	    	//Only work on create or edit of the dummy record used for importing
    		//
	    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
	    		{
	    			try
	    				{
			    			var currentRecord 	= scriptContext.newRecord;
			    			var currentType		= currentRecord.type;
			    			var currentId		= currentRecord.id;
			    			var thisRecord		= null;
			    			
			    			//Try to get the full record
			    			//
			    			try
			    				{
			    					thisRecord = record.load({
			    												type:		currentType,
			    												id:			currentId,
			    												isDynamic:	true
			    											});
			    				}
			    			catch(err)
			    				{
			    					thisRecord	= null;
			    					log.error({title: 'Error reading order reservation import record, id = ' + currentId, description: err});
			    				}
			    			
			    			//Did we get it ok
			    			//
			    			if(thisRecord != null)
			    				{
			    					//Get field values
			    					//
				    				var recordName 				= thisRecord.getValue({fieldId: 'name'});
				    				var recordSubsidiary 		= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_subsidiary'});
				    				var recordItem				= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_item'});
				    				var recordSalesChannel 		= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_channel'});
				    				var recordLocation 			= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_location'});
				    				var recordStategy	 		= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_order_allo_strategy'});
				    				var recordStartDate 		= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_start_date'});
				    				var recordEndDate	 		= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_end_date'});
				    				var recordTransDate 		= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_transaction_date'});
				    				var recordQuantity 			= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_quantity'});
				    				var recordTargetQuantity	= thisRecord.getValue({fieldId: 'custrecord_c4c_scr_target_quantity'});
			    					
				    				//Create or load the real order reservation record
				    				//
				    				var orderReservationRecord 	= null;
				    				var orderReservationId 		= null;
				    				
				    				//Create
				    				//
				    				if (scriptContext.type == scriptContext.UserEventType.CREATE)
				    					{
					    					try
						    					{
						    						orderReservationRecord = record.create({
						    																type:		'OrderReservation',
						    																isDynamic:	true
						    																});
						    					}
						    				catch(err)
						    					{
						    						orderReservationRecord = null;
						    						log.error({title: 'Error creating order reservation record', description: err});
						    					}
				    					}
				    				
				    				//Load
				    				//
				    				if (scriptContext.type == scriptContext.UserEventType.EDIT)
				    					{
				    						var recordRelatedOrderReservation = thisRecord.getValue({fieldId: 'custrecord_c4c_scr_order_reservation_lin'});
				    					
					    					try
						    					{
						    						orderReservationRecord = record.load({
						    																type:		'OrderReservation',
						    																id:			recordRelatedOrderReservation,
						    																isDynamic:	true
						    																});
						    					}
						    				catch(err)
						    					{
						    						orderReservationRecord = null;
						    						log.error({title: 'Error loading order reservation record', description: err});
						    					}
				    					}
				    				
				    				//Carry on if we have created or loaded the record ok
				    				//
				    				if(orderReservationRecord != null)
				    					{
				    						//Set field values on the order reservation record
				    						//
					    					orderReservationRecord.setValue({fieldId: 'subsidiary',					value: recordSubsidiary});
					    					orderReservationRecord.setValue({fieldId: 'name',						value: recordName});
					    					orderReservationRecord.setValue({fieldId: 'item',						value: recordItem});
					    					orderReservationRecord.setValue({fieldId: 'location',					value: recordLocation});
					    					orderReservationRecord.setValue({fieldId: 'saleschannel',				value: recordSalesChannel});
					    					orderReservationRecord.setValue({fieldId: 'orderallocationstrategy',	value: recordStategy});
					    					orderReservationRecord.setValue({fieldId: 'startdate',					value: recordStartDate});
					    					orderReservationRecord.setValue({fieldId: 'enddate',					value: recordEndDate});
					    					orderReservationRecord.setValue({fieldId: 'transactiondate',			value: recordTransDate});
					    					orderReservationRecord.setValue({fieldId: 'quantity',					value: recordQuantity});
					    					orderReservationRecord.setValue({fieldId: 'targetquantity',				value: recordTargetQuantity});
						    				
				    						//Save record
				    						//
				    						try
				    							{
				    								orderReservationId = orderReservationRecord.save({
																    									enableSourcing: 		true,
																    									ignoreMandatoryFields:	true
																    								});
				    							}
				    						catch(err)
				    							{
				    								orderReservationId = null;
				    								log.error({title: 'Error saving order reservation record', description: err});
				    							}
				    						
				    						//Update the link to the created Order reservation
				    						//
				    						if(orderReservationId != null && scriptContext.type == scriptContext.UserEventType.CREATE)
				    							{
				    								try
				    									{
				    										record.submitFields({
								    											type: 	currentType,
								    											id: 	currentId,
								    											values: {
								    														custrecord_c4c_scr_order_reservation_lin:	orderReservationId
								    													}
								    											});
				    									}
				    								catch(err)
				    									{
				    										log.error({title: 'Error updating order reservation import record', description: err});
				    									}
				    							}
				    					}
			    				}
	    				}
	    			catch(err)
	    				{
	    					log.error({title: 'Unexpected error occured', description: err});
	    				}
    		}
    }
    
   
    return 	{
        	afterSubmit: 	afterSubmit
    		};
    
});
