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
	    	//Only work on create of the dummy record used for importing
    		//
	    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
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
	    					
		    				//Create the real order reservation record
		    				//
		    				var orderReservationRecord 	= null;
		    				var orderReservationId 		= null;
		    				
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
		    				
		    				if(orderReservationRecord != null)
		    					{
		    						//Set field values
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
		    								log.error({title: 'Error saving order reservation record, id = ', description: err});
		    							}
		    						
		    						if(orderReservationId != null)
		    							{
			    							//Delete the dummy record
						    				//
						    				try
						    					{
						    						record.delete({
						    										type:		currentType,
						    										id:			currentId
						    									});
						    					}
						    				catch(err)
						    					{
						    						log.error({title: 'Error deleting order reservation import record, id = ' + currentId, description: err});
						    					}
		    							}
		    					}
	    				}
    		}
    }
    
   
    return 	{
        	afterSubmit: 	afterSubmit
    		};
    
});
