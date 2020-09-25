/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/task'],
function(ui, search, file, task) {
   
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
				// create a new form
	    		var form = ui.createForm({
	                title: 'Generate Refund Report',
	                hideNavBar: false
	            });
	    		
	    		// add fields to the form
	    		form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				}).defaultValue = "<img src='https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&c=4537381_SB1&h=7a14b6798dff769d5845' alt='Bannatyne Logo' style='width: 226px; height: 48px;'>";
	    		
	    		form.addField({
	    			id: 'refundtypeselect',
	    			type: ui.FieldType.SELECT,
	    			label: 'Refund Type',
	    			source: 'customlist_tbg_refund_types'
	    		}).isMandatory = true;
	    		
	    		// add submit button to the form
	    		form.addSubmitButton({
   		 			label: 'Generate Report'
   		 		});
	    		
	    		// write the response to the page
				context.response.writePage(form);  		
			}
    	else if (context.request.method == 'POST')
    		{
	    		// declare and initialize variables
    			var fileObj = null;
    		
    			// get the value of the refund type select field
				var refundType = parseInt(context.request.parameters.refundtypeselect);
				
				// switch the refund type to generate the appropriate CSV report
				switch(refundType) {
				
				case 1: // Bank Payment
					
					// start off the CSV
					var CSV = '"Due Date","Club","Document No.","Bank Account Name","Sort Code","Account No","Reference","Amount","Code"\r\n';
					
					// create a search to find refund requests to be processed
					search.create({
						type: 'customrecord_refund_request',
						
						filters: [{
							name: 'isinactive',
							operator: search.Operator.IS,
							values: ['F']
						},
								{
							name: 'custrecord_refund_processed',
							operator: search.Operator.IS,
							values: ['F']
						},
								{
							name: 'custrecord_refund_approval_status',
							operator: search.Operator.ANYOF,
							values: [2] // 2 = Approved
						},
								{
							name: 'custrecord_refund_method',
							operator: search.Operator.ANYOF,
							values: [refundType]
						}],
						
						columns: [{
							name: 'formuladate',
							formula: '{today}'
						},
								{
							name: 'custrecord_refund_location'
						},
								{
							name: 'custrecord_refund_bank_acc_name'
						},
								{
							name: 'custrecord_refund_sort_code'
						},
								{
							name: 'custrecord_refund_bank_account_number'
						},
								{
							name: 'custrecord_refund_amount'
						}],						
						
					}).run().each(function(result){
						
						// add the search results to the CSV
						CSV += result.getValue({name: 'formuladate'}) + ',';
						CSV += result.getText({name: 'custrecord_refund_location'}) + ',';
						CSV += result.id + ',';
						CSV += result.getValue({name: 'custrecord_refund_bank_acc_name'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_sort_code'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_bank_account_number'}) + ',';
						CSV += 'Bannatyne Refund' + ',';
						CSV += result.getValue({name: 'custrecord_refund_amount'}) + ',';
						CSV += '99' + ',';
						CSV += '\r\n';
						
						// continue processing search results
						return true;
						
					});
					
					// generate the CSV file
					fileObj = file.create({
						name: 'Bacs Report.csv',
						fileType: file.Type.CSV,
						contents: CSV
					});
					
				break;
					
				case 2: // Giftcard (Loylap)
					
					// start off the CSV
					var CSV = '"Date of Request","Customer Name","Amount","Club","Document No.","Area of Business","Email Address"\r\n';
					
					// create a search to find refund requests to be processed
					search.create({
						type: 'customrecord_refund_request',
						
						filters: [{
							name: 'isinactive',
							operator: search.Operator.IS,
							values: ['F']
						},
								{
							name: 'custrecord_refund_processed',
							operator: search.Operator.IS,
							values: ['F']
						},
								{
							name: 'custrecord_refund_approval_status',
							operator: search.Operator.ANYOF,
							values: [2] // 2 = Approved
						},
								{
							name: 'custrecord_refund_method',
							operator: search.Operator.ANYOF,
							values: [refundType]
						}],
						
						columns: [{
							name: 'formuladate',
							formula: '{today}'
						},
								{
							name: 'custrecord_refund_customer_name'
						},
								{
							name: 'custrecord_refund_amount'
						},
								{
							name: 'custrecord_refund_location'
						},
								{
							name: 'custrecord_refund_business_area'
						},
								{
							name: 'custrecord_refund_email'
						}],				
						
					}).run().each(function(result){
						
						// add the search results to the CSV
						CSV += result.getValue({name: 'formuladate'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_customer_name'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_amount'}) + ',';
						CSV += result.getText({name: 'custrecord_refund_location'}) + ',';
						CSV += result.id + ',';
						CSV += result.getText({name: 'custrecord_refund_business_area'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_email'}) + ',';
						CSV += '\r\n';
						
						// continue processing search results
						return true;
						
					});
					
					// generate the CSV file
					fileObj = file.create({
						name: 'Loylap Report.csv',
						fileType: file.Type.CSV,
						contents: CSV
					});
				
				break;
				
				case 3: // SagePay
					
					// start off the CSV
					var CSV = '"Customer Name","Date of Original Transaction","Last 4 Digits of Payment Card","Amount","Club","Document No.","Area of Business"\r\n';
					
					// create a search to find refund requests to be processed
					search.create({
						type: 'customrecord_refund_request',
						
						filters: [{
							name: 'isinactive',
							operator: search.Operator.IS,
							values: ['F']
						},
								{
							name: 'custrecord_refund_processed',
							operator: search.Operator.IS,
							values: ['F']
						},
								{
							name: 'custrecord_refund_approval_status',
							operator: search.Operator.ANYOF,
							values: [2] // 2 = Approved
						},
								{
							name: 'custrecord_refund_method',
							operator: search.Operator.ANYOF,
							values: [refundType]
						}],
						
						columns: [{
							name: 'custrecord_refund_customer_name'
						},
								{
							name: 'custrecord_refund_date_orig_tran'
						},
								{
							name: 'custrecord_refund_last_4_digits'
						},
								{
							name: 'custrecord_refund_amount'
						},
								{
							name: 'custrecord_refund_location'
						},
								{
							name: 'custrecord_refund_business_area'
						}],				
						
					}).run().each(function(result){
						
						// add the search results to the CSV
						CSV += result.getValue({name: 'custrecord_refund_customer_name'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_date_orig_tran'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_last_4_digits'}) + ',';
						CSV += result.getValue({name: 'custrecord_refund_amount'}) + ',';
						CSV += result.getText({name: 'custrecord_refund_location'}) + ',';
						CSV += result.id + ',';
						CSV += result.getText({name: 'custrecord_refund_business_area'}) + ',';
						CSV += '\r\n';
						
						// continue processing search results
						return true;
						
					});
					
					// generate the CSV file
					fileObj = file.create({
						name: 'SagePay Report.csv',
						fileType: file.Type.CSV,
						contents: CSV
					});
				
				}
				
				// return the file to the browser
				context.response.writeFile({
					file: fileObj,
					isInline: false
				});
				
				// schedule a map/reduce task to mark the refund requests as processed
				var mapReduceTaskID = task.create({
		    	    taskType: task.TaskType.MAP_REDUCE,
		    	    scriptId: 'customscript_bbs_refund_map_reduce',
		    	    deploymentId: 'customdeploy_bbs_refund_map_reduce',
		    	    params: {
		    	    	custscript_bbs_refund_type: refundType
    	    	    }
		    	}).submit();
				
				log.audit({
					title: 'Map Reduce Task Scheduled',
					details: mapReduceTaskID
				});
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
