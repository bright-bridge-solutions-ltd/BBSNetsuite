/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/ui/message', 'N/search', 'N/task', 'N/url', 'N/redirect'],
function(ui, message, search, task, url, redirect) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method == 'GET')
			{
	    		// retrieve parameters that have been passed to the Suitelet
				var scriptScheduled	= context.request.parameters.scriptscheduled;
    			var supplierID		= context.request.parameters.supplier;
    		
    			// create a new form
	    		var form = ui.createForm({
	                title: 'Mark Drop Ship Purchase Orders as Shipped',
	                hideNavBar: false
	            });
	    		
	    		// check if scriptScheduled returns true
				if (scriptScheduled == 'true')
					{
						// display a message at the top of the page
						form.addPageInitMessage({
				            type: message.Type.CONFIRMATION,
							title: 'Script Scheduled',
							message: 'A script has been scheduled to mark the selected purchase orders as shipped.<br><br>Please select another supplier to process further purchase orders.'
						});
					}
	    		
	    		// set client script to run on the page
				form.clientScriptFileId = 86525;
	    		
	    		// add fields to the form
	    		form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				}).defaultValue = "<img src='https://5731074-sb1.app.netsuite.com/core/media/media.nl?id=14&c=5731074_SB1&h=d1e7e6fd6a7836a47ff6' alt='Misco Logo' style='width: 226px; height: 48px;'>";
	    		
	    		var supplierField = form.addField({
	    			id: 'supplier_select',
	    			type: ui.FieldType.SELECT,
	    			label: 'Supplier',
	    			source: 'vendor'
	    		});
	    		
	    		supplierField.isMandatory = true;
	    		
	    		// if we have a supplier
	    		if (supplierID)
	    			{
	    				// set the default value of the supplier field
	    				supplierField.defaultValue = supplierID;
	    				
	    				// add a sublist to the form
						var poSublist = form.addSublist({
							type: ui.SublistType.LIST,
							id: 'po_sublist',
							label: 'Purchase Orders',
						});
						
						poSublist.addField({
							type: ui.FieldType.CHECKBOX,
							id: 'mark_shipped',
							label: 'Mark as Shipped'
						});
						
						poSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'internalid',
							label: 'Internal ID'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
						
						poSublist.addField({
							type: ui.FieldType.DATE,
							id: 'trandate',
							label: 'Date'
						});
						
						poSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'tranid',
							label: 'Purchase Order'
						});
						
						poSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'supplier_name',
							label: 'Supplier'
						});
						
						poSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'sales_order',
							label: 'Sales Order'
						});
						
						poSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'customer_name',
							label: 'Customer'
						});
						
						poSublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'po_total',
							label: 'PO Total'
						});
						
						poSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'currency',
							label: 'Currency'
						});
						
						// call function to search for purchase orders Pending Receipt for this supplier
						var searchResults = purchaseOrderSearch(supplierID);
						
						// initiate line variable
						var line = 0;
						
						// run search and process results
						searchResults.each(function(result){
							
							// retrieve search results
							var internalID = result.id;
							
							var tranDate = result.getValue({
								name: 'trandate'
							});
							
							var tranID = result.getValue({
								name: 'tranid'
							});
							
							var supplierName = result.getText({
								name: 'mainname'
							});
							
							var salesOrder = result.getValue({
								name: 'formulatext'
							});
							
							var customerName = result.getText({
								name: 'mainname',
								join: 'createdfrom'
							});
							
							var poTotal = result.getValue({
								name: 'fxamount'
							});
							
							var currency = result.getText({
								name: 'currency'
							});
							
							// set sublist fields
							poSublist.setSublistValue({
								id: 'internalid',
								value: internalID,
								line: line
							});
							
							poSublist.setSublistValue({
								id: 'trandate',
								value: tranDate,
								line: line
							});
							
							poSublist.setSublistValue({
								id: 'tranid',
								value: tranID,
								line: line
							});
							
							poSublist.setSublistValue({
								id: 'supplier_name',
								value: supplierName,
								line: line
							});
							
							poSublist.setSublistValue({
								id: 'sales_order',
								value: salesOrder,
								line: line
							});
							
							poSublist.setSublistValue({
								id: 'customer_name',
								value: customerName,
								line: line
							});
							
							poSublist.setSublistValue({
								id: 'po_total',
								value: poTotal,
								line: line
							});
							
							poSublist.setSublistValue({
								id: 'currency',
								value: currency,
								line: line
							});
							
							// increase line variable
							line++;
							
							// continue processing search results
							return true;
							
						});
						
						// add mark/unmark all buttons to the sublist
						poSublist.addMarkAllButtons();
						
						// add submit button to the form
		   		 		form.addSubmitButton({
		   		 			label : 'Submit'
		   		 		});
						
	    			}
	    		
	    		// write the response to the page
				context.response.writePage(form);
			}
    	else if (context.request.method == 'POST')
    		{
	    		// declare new array to hold IDs of sales orders to be processed
				var purchaseOrderArray = new Array();
				
				// get count of lines on the sublist
    			var lineCount = context.request.getLineCount('po_sublist');
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the value of the 'Mark as Shipped' checkbox
    					var markShipped = context.request.getSublistValue({
    						group: 'po_sublist',
    						name: 'mark_shipped',
    						line: i
    					});
    					
    					// only process lines where the marskShipped checkbox is ticked
    					if (markShipped == 'T')
    						{
    						 	// get the internal ID of the purchase order
    							var purchaseOrderID = context.request.getSublistValue({
    	    						group: 'po_sublist',
    	    						name: 'internalid',
    	    						line: i
    	    					});
    							
    							// push internalID to the purchaseOrderArray
    							purchaseOrderArray.push(purchaseOrderID);
    						}
    				}
    			
    			// create a scheduled task to mark the purchase orders as shipped
    	    	var scheduledTaskID = task.create({
    	    	    taskType: task.TaskType.SCHEDULED_SCRIPT,
    	    	    scriptId: 'customscript_bbs_purchase_order_sch',
    	    	    deploymentId: null,
    	    	    params: {
    	    	    	custscript_bbs_po_array: purchaseOrderArray
    	    	    }
    	    	}).submit();
    	    	
    	    	log.audit({
    	    		title: 'Script Scheduled',
    	    		details: scheduledTaskID
    	    	});
    	    	
    	    	// get the URL of the Suitelet
    			var suiteletURL = url.resolveScript({
    				scriptId: 'customscript_bbs_purchase_order_suitelet',
    				deploymentId: 'customdeploy_bbs_purchase_order_suitelet',
    				params: {
    					scriptscheduled: true
    				}
    			});
    			
    			// redirect user to the Suitelet
				redirect.redirect({
				    url: suiteletURL
				}); 
				
    		}

    }
    
    // ====================================================================================
    // FUNCTION TO RUN SEARCH FOR PURCHASE ORDERS PENDING RECEIPT FOR THE SELECTED SUPPLIER
    // ====================================================================================
    
    function purchaseOrderSearch(supplierID) {
    	
    	return search.create({
    		type: search.Type.PURCHASE_ORDER,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'mainname',
    			operator: search.Operator.ANYOF,
    			values: [supplierID]
    		},
    				{
    			name: 'status',
    			operator: search.Operator.ANYOF,
    			values: ['PurchOrd:B'] // PurchOrd:B = Purchase Order:Pending Receipt
    		},
    				{
    			name: 'createdfrom',
    			operator: search.Operator.NONEOF,
    			values: ['@NONE@']
    		}],
    		
    		columns: [{
    			name: 'trandate'
    		},
    				{
    			name: 'tranid',
    			sort: search.Sort.DESC
    		},
    				{
    			name: 'mainname'
    		},
    				{
    			name: 'formulatext',
    			formula: "REPLACE({createdfrom}, 'Sales Order #', '')"
    		},
    				{
    			name: 'mainname',
    			join: 'createdfrom'
    		},
    				{
    			name: 'fxamount'
    		},
    				{
    			name: 'currency'
    		}],
    		
    	}).run();
    	
    }

    return {
        onRequest: onRequest
    };
    
});
