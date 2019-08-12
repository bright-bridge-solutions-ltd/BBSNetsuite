/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
function() {
	
    function beforeSubmit(context) {
    	
    	var currentRecord = context.newRecord;
    	
    	// declare an array variable to store amounts, tax codes, and tax rates.
    	var poleArr = new Array();
		
    	// get the value of the exchange rate field
    	var exchangeRate = currentRecord.getValue({
    		fieldId: 'exchangerate'
    	});
    	
    	log.debug({
    		title: 'Exchange Rate',
    		details: exchangeRate
    	});
    	
    	// get line item count
    	var itemCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through the items and obtain relevant info and push to the PoleArr array.
 		for (var x = 0; x <= itemCount; x++)
 			{
 				// get the tax code for the line
 				var lineTaxCode = currentRecord.getSublistValue({
 					sublistId: 'item',
 					fieldId: 'taxcode',
 					line: x
 				});
 				
 				// check if the lineTaxCode variable returns a value
 				if (lineTaxCode)
 					{
 						// get line item fields
 						taxRate = currentRecord.getSublistValue({
 							sublistId: 'item',
 							fieldId: 'taxrate1',
 							line: x
 						});
 						
 						taxAmt = currentRecord.getSublistValue({
 							sublistId: 'item',
 							fieldId: 'tax1amt',
 							line: x
 						});
 						
 						taxName = currentRecord.getSublistText({
 							sublistId: 'item',
 							fieldId: 'taxcode',
 							line: x
 						});
 						
 						goodsAmt = currentRecord.getSublistValue({
 							sublistId: 'item',
 							fieldId: 'amount',
 							line: x
 						});
 						
 						// check that taxAmt cariable is not null, empty or undefined
 						if (!taxAmt || taxAmt == null || taxAmt == '' || taxAmt == undefined)
 							{
	 							taxRate = currentRecord.getSublistValue({
	 	 							sublistId: 'item',
	 	 							fieldId: 'taxrate1',
	 	 							line: x
	 	 						});
	 							
	 							amount = currentRecord.getSublistValue({
	 								sublistId: 'item',
	 								fieldId: 'amount',
	 								line: x
	 							});
	 							
	 							taxAmt = parseFloat(taxRate) * parseFloat(amount) / 100;
 							}
 						
 						// push all tax codes and tax amounts to the poleArr
 						poleArr.push({rate: taxRate, amt: taxAmt, amtconverted: ((taxAmt * exchangeRate)), name: taxName, code: lineTaxCode, goods: goodsAmt, goodsconverted: ((goodsAmt * exchangeRate))});
 					}
 			}
 		
 			log.debug({
 				title: 'Array contents lines',
 				details: JSON.stringify(poleArr)
 			});
 		
	 		// get shipping amount and tax info to add this data to the poleArr array
 			var shippingTaxCode = currentRecord.getValue({
 				fieldId: 'shippingtaxcode'
 			});
 			
 			// check if the shippingTaxCode variable returns a value
 			if (shippingTaxCode)
 				{
 					// retrieve shipping tax rate and amounts
 					shippingTaxRate = currentRecord.getValue({
 						fieldId: 'shippingtax1rate'
 					});
 					
 					shippingTaxName = currentRecord.getText({
 						fieldId: 'shippingtaxcode'
 					});
 					
 					shippingAmt = currentRecord.getValue({
 						fieldId: 'shippingcost'
 					});
 					
 					shippingTaxAmt = shippingAmt * (shippingTaxRate/100);
 					
 					shippingTaxRate = parseFloat(shippingTaxRate).toFixed(1)+"%";
 					
 					// push shipping data to the poleArr
 					poleArr.push({rate: shippingTaxRate, amt: shippingTaxAmt, amtconverted: ((shippingTaxAmt * exchangeRate)), name: shippingTaxName, code: shippingTaxCode, goods: shippingAmt, goodsconverted: ((shippingAmt * exchangeRate))});
 				}
 			
 			log.debug({
 				title: 'Array contents shipping',
 				details: JSON.stringify(poleArr)
 			});

 			// get handling amount and tax info to add this data to the poleArr array
 			var handlingTaxCode = currentRecord.getValue({
 				fieldId: 'handlingtaxcode'
 			});
 			
 			// check if the handlingTaxCode variable returns a value
 			if (handlingTaxCode)
 				{
 					// retrieve handling tax rate and amounts
 					handlingTaxRate = currentRecord.getValue({
 						fieldId: 'handlingtax1rate'
 					});
 					
 					handlingTaxName = currentRecord.getText({
 						fieldId: 'handlingtaxcode'
 					});
 					
 					handlingAmt = currentRecord.getValue({
 						fieldId: 'handlingcost'
 					});
 					
 					handlingTaxAmt = handlingAmt * (handlingTaxRate/100);
 					
 					handlingTaxRate = parseFloat(handlingTaxRate).toFixed(1)+"%";
 					
 					// push handling data to the poleArr
 					poleArr.push({rate: handlingTaxRate, amt: handlingTaxAmt, amtconverted: ((handlingTaxAmt * exchangeRate)), name: handlingTaxName, code: handlingTaxCode, goods: handlingAmt, goodsconverted: ((handlingAmt * exchangeRate))});
 				}
 			
 			log.debug({
 				title: 'Array contents handling',
 				details: JSON.stringify(poleArr)
 			});
 			
 			// loop through poleArr to summarise the data. Put the summarised data into a new array 'r'
 			var arrLength = poleArr.length;
 			
 			//find unique Tax Codes and sum-up Tax Amount
 			var n ={},r=[];
 			
 			// loop through arr
 			for (var i = 0; i < arrLength; i++)
 				{
 					var testCode = poleArr[i].code;
 					
 					// unique tax Code
 					if (!n[testCode])
	 					{
	 						n[poleArr[i].code] = true;
	 						r.push(poleArr[i]);
	 					}
 					else // non unique Tax Code then count Tax Amount together
 						{
	 						for (var y = 0; y < r.length; y++)
		 						{
		 							if (testCode == r[y].code)
			 							{
			 								var sumNumber = parseFloat(r[y].amt) + parseFloat(poleArr[i].amt);
			 								r[y].amt = sumNumber.toFixed(2);
			 								var sumGoodsAmount = parseFloat(r[y].goods) + parseFloat(poleArr[i].goods);
			 								r[y].goods = sumGoodsAmount.toFixed(2);
			 								var sumTaxConverted = parseFloat(r[y].amtconverted) + parseFloat(poleArr[i].amtconverted);
			 								r[y].amtconverted = sumTaxConverted.toFixed(2);
			 								var sumGoodsConverted = parseFloat(r[y].goodsconverted) + parseFloat(poleArr[i].goodsconverted);
			 								r[y].goodsconverted = sumGoodsConverted.toFixed(2);
			 							}
		 						}
 						}
 				}
 			
 		// stringify to convert the contents of array 'r' to a string.
 		var jsonString = JSON.stringify(r);
 		
 		// set the value of the 'custbody_bbs_vat_summary' field using the jsonString variable
 		currentRecord.setValue({
 			fieldId: 'custbody_bbs_vat_summary',
 			value: jsonString
 		});
 	}
    
    return {
        beforeSubmit: beforeSubmit
    };
    
});