/**
* Copyright (c) 1998-2017 NetSuite, Inc. 2955 Campus Drive, Suite 100, San
* Mateo, CA, USA 94403-2511 All Rights Reserved.
*
* This software is the confidential and proprietary information of NetSuite,
* Inc. ("Confidential Information"). You shall not disclose such Confidential
* Information and shall use it only in accordance with the terms of the license
* agreement you entered into with NetSuite.
*/

/**
* Module Description:
*
*
*
*
* Module Name
*
*
* Version Date Author Remarks
* 1.00 Nov 7, 2017 vopavsky
* 2.00 Dec 5, 2017 vopavsky new data model adjustments
* 3.00 Dec 27, 2017 vopavsky new data model adjustments
*
*/
/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/record', 'N/runtime', 'N/search', 'N/task', 'N/email'],
/**
 * @param {format} format
 * @param {record} record
 * @param {runtime} runtime
 */

function(format, record, runtime, search, task, email) {


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
	function getInputData()
	{
		var	objScript = runtime.getCurrentScript();

		var data = objScript.getParameter(
		{
			name : 'custscript_invoice_data'
		});

		data = JSON.parse(data)
		log.debug("Data JSON", data);
		log.debug("Data JSON", Object.keys(data).length);
		return data;
	}


 /**
 * Executes when the reduce entry point is triggered and applies to each group.
 *
 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
 * @since 2015.1
 */
	 function reduce(context)
			{

				try
				{
					var data = JSON.parse(context.values[0])['data'];
//					log.debug("***", data);
					
					var typeSearch = search.create(
					{
						type : search.Type.TRANSACTION,
						filters : [ [ 'internalid', 'is', data['invoiceID'] ] ],
						columns : [ 'type' ]
					});

					var type = typeSearch.run().getRange(
					{
						start : 0,
						end : 1
					})[0].getValue('type');
//					log.debug("transaction type", type);
					switch (type)
					{
						case 'CustInvc':
							type = record.Type.INVOICE;
							break;
						case 'CustCred':
							type = record.Type.CREDIT_MEMO;
							break;
						default:
							break;
					}

					var arrInvoiceFields = search.lookupFields(
							{
								type : type,
								id : data['invoiceID'],
								columns : [ 'class', 'entity' , 'type']
							})
					
							
							arrInvoiceFields['class'][0].value;
					var dateString = data['date'];
					var splitDate = dateString.split('/');
					var month = splitDate[1] - 1; // Javascript months are
													// 0-11

					var date = new Date(splitDate[2], month, splitDate[0]);

					var intPaymentRun;
					var mySearch = search.create(
					{
						type : "customrecord_payment_run",
						columns : [
							{
								name : 'internalid'
							},
							{
								name : 'custrecord_dd_collection_date'
							},
							{
								name : 'custrecord_dd_status'
							} ],
						filters : [
							{
								name : 'custrecord_dd_collection_date',
								operator : search.Operator.ON,
								values : [ format.format(
								{
									value : date,
									type : format.Type.DATE
								}) ]
							},
	
							{
								name : 'custrecord_dd_class',
								operator : search.Operator.IS,
								values : [ arrInvoiceFields['class'][0].value]
							} ]
					});

					mySearch.run().each(function(result)
						{
							if ([ "Open", "In Progress" ].indexOf(result.getText(
							{
								name : "custrecord_dd_status"
							})) != -1)
							{
								intPaymentRun = result.getValue(
								{
									name : "internalid"
								});
			
								if (result.getText(
								{
									name : "custrecord_dd_status"
								}) === "Open")
								{
									record.submitFields(
									{
										type : "customrecord_payment_run",
										id : intPaymentRun,
										values :
										{
											custrecord_dd_status : 3
										}
									});
								}
			
							} else
							{
								return true;
							}
						});

					if (!intPaymentRun)
					{
						var objRecord = record.create(
						{
							type : "customrecord_payment_run",
							isDynamic : true,

						});

						objRecord.setValue(
						{
							fieldId : "custrecord_dd_collection_date",
							value : date
						});
						objRecord.setValue(
						{
							fieldId : "custrecord_dd_status",
							value : 3
						});
						objRecord.setValue(
						{
							fieldId : "custrecord_dd_class",
							value : arrInvoiceFields['class'][0].value
						});
						intPaymentRun = objRecord.save();

					}
//					log.debug("payment run", intPaymentRun);
					var customrecord_paymet_run_assignmentSearchObj = search.create(
					{
						type : "customrecord_paymet_run_assignment",
						filters : [ [ "custrecord_dd_customer", "anyof", arrInvoiceFields['entity'][0].value ], "AND",
								[ "custrecord_dd_payment_run", "anyof", intPaymentRun ] ],
						columns : [ search.createColumn(
						{
							name : "custrecord_dd_payable_amount",
							summary : search.Summary.GROUP
						}), search.createColumn(
						{
							name : "custrecord_dd_tran_type",
							summary : search.Summary.GROUP,
							sort : search.Sort.DESC
						}) ]
					});
					var fltSum = 0.0;
					var searchResultCount = customrecord_paymet_run_assignmentSearchObj.runPaged().count;
					customrecord_paymet_run_assignmentSearchObj.run().each(function(result)
					{
						
						fltSum += (((result.getValue(
						{
							name : 'custrecord_dd_tran_type',  summary: search.Summary.GROUP
						}) == "Invoice") ? 1 : -1) * result.getValue(
						{
							name : "custrecord_dd_payable_amount",  summary: search.Summary.GROUP
						}));
						return true;
					});

					
					if ((fltSum + (parseFloat(data['amount']) * (type == record.Type.INVOICE ? 1 : -1))) > 0.0)
					{
						var searchPRA = search.create(
						{
							type : "customrecord_paymet_run_assignment",
							columns : [
							{
								name : 'internalid'
							} ],
							filters : [
							{
								name : 'custrecord_dd_payment_run',
								operator : search.Operator.IS,
								values : [ intPaymentRun ]
							},

							{
								name : 'custrecord_dd_invoice',
								operator : search.Operator.IS,
								values : [ data['invoiceID'] ]
							} ]
						});
						var intPRAId = null;
						searchPRA.run().each(function(result)
						{
							intPRAId = result.getValue(
							{
								name : "internalid"
							});

						});

						var recPaymentRunAssign;
						if (!intPRAId)
						{

							recPaymentRunAssign = record.create(
							{
								type : "customrecord_paymet_run_assignment",
								isDynamic : true
							});

						} else
						{
							recPaymentRunAssign = record.load(
							{
								type : "customrecord_paymet_run_assignment",
								isDynamic : true,
								id : intPRAId
							});
						}
						recPaymentRunAssign.setValue(
						{
							fieldId : 'custrecord_dd_payment_run',
							value : intPaymentRun
						});

						recPaymentRunAssign.setValue(
						{
							fieldId : 'custrecord_dd_invoice',
							value : data['invoiceID']
						});

						recPaymentRunAssign.setValue(
						{
							fieldId : 'custrecord_dd_payable_amount',
							value : data['amount']
						});
						
						recPaymentRunAssign.setValue(
								{
									fieldId : 'custrecord_dd_payable_amount_remaining',
									value : data['amount']
								});

						recPaymentRunAssign.setValue(
						{
							fieldId : 'custrecorddd_in_query',
							value : (data['inquery'] == 'T')
						});
						
						recPaymentRunAssign.save();
//						log.debug("pra", JSON.stringify(recPaymentRunAssign));
						var lookupFields = search.lookupFields(
						{
							type : search.Type.CUSTOMER,
							id : arrInvoiceFields['entity'][0].value,
							columns : [ 'email' ]
						});
						
						context.write(intPaymentRun,
						{
							customer : arrInvoiceFields['entity'][0].value,
							transaction : data['invoiceID'],
							email : lookupFields['email'],
							amount : Math.abs(data['amount']) * (arrInvoiceFields['type'][0].value == 'custcred' ? -1 : 1),
							customerId : arrInvoiceFields['entity'][0].value,
							date : data['date'],
							sender : data['sender'],
							paymentRun : intPaymentRun
						});

					} else {
						log.debug("something else",(fltSum + (parseFloat(data['amount']) * (type == record.Type.INVOICE ? 1 : -1))));
						log.debug("***", data);
						log.debug(((fltSum + (parseFloat(data['amount']) * (type == record.Type.INVOICE ? 1 : -1))) > 0.0),
								fltSum + " - "  + parseFloat(data['amount']) + " - " + type);
						
						
					}
				} catch (e)
				{
					log.error("Error", JSON.stringify(e));
				}
			}


 /**
 * Executes when the summarize entry point is triggered and applies to the result set.
 *
 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
 * @since 2015.1
 */
 function summarize(summary) {

	 var emailData = {};
	 var arrMailData = [];
	 var sender;
	 var paymentRuns = {};
				summary.output.iterator().each(function(key, value)
				{
//					log.debug(key, value);
					value = JSON.parse(value);
					sender = value['sender'];
					paymentRuns[value['paymentRun']] = 1;
//					if (paymentRuns.indexOf(value['paymentRun']) == -1)
//					{
//						paymentRuns.push(value['paymentRun'])
//					}
					arrMailData.push(value);
					return true;
				});


//				var mapReduceTask = task.create(
//				{
//					taskType : task.TaskType.MAP_REDUCE
//				});
//				
//				mapReduceTask.scriptId = 'customscript_mr_dd_send_email';
//				mapReduceTask.deploymentId = 'customdeploy_mr_dd_send_email';
//				mapReduceTask.params =
//				{
//						custscript_email_data : JSON.stringify(arrMailData)
//				};
//
//		 		var mapReduceTaskId = mapReduceTask.submit();

				paymentRuns = Object.keys(paymentRuns);
				
				for (var run in paymentRuns)
				{
					record.submitFields(
							{
								type : "customrecord_payment_run",
								id : paymentRuns[run],
								values :
								{
									custrecord_dd_status : 1
								}
							});
				}
				

		if (Object.keys(paymentRuns).length > 0)
		{
			email.send(
			{
				author : sender,
				recipients : [ sender ],
				subject : 'Payment Runs Created',
				body : "Dear User, payment runs " + paymentRuns.join(',') + " were created or adjusted. NetSuite"

			});
		}
// log.debug("Emails",JSON.stringify(emailData));
 	log.debug("Summary",JSON.stringify(summary));
 }

 return {
	 getInputData: getInputData,
	
	 reduce: reduce,
	 summarize: summarize
 };

});
