/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Aug 2019     sambatten
 *
 */

function beforeSubmit(type)
	{
		// declare an array variable to store amounts, tax codes, and tax rates.
		var poleArr = new Array();
	
		// get the value of the exchange rate field
		var exchangeRate = nlapiGetFieldValue('exchangerate');

		// get line item count
		var itemCount = nlapiGetLineItemCount('item');
	
		// loop through the items and obtain relevant info and push to the PoleArr array.
		for (var x = 1; x <= itemCount; x++)
			{
				// get the tax code for the line
				var lineTaxCode = nlapiGetLineItemValue('item', 'taxcode', x);
				
				// check if the lineTaxCode variable returns a value
				if (lineTaxCode)
					{
						// get line item fields
						taxRate = nlapiGetLineItemValue('item', 'taxrate1', x);
						taxRate = parseFloat(taxRate).toFixed(2)+"%";
						taxAmt = nlapiGetLineItemValue('item', 'tax1amt', x);
						taxName = nlapiGetLineItemText('item', 'taxcode', x);
						goodsAmt = nlapiGetLineItemValue('item', 'amount', x);
						
						// push all tax codes and tax amounts to the poleArr
						poleArr.push({rate: taxRate, amt: taxAmt, amtconverted: ((taxAmt * exchangeRate)), name: taxName, code: lineTaxCode, goods: goodsAmt, goodsconverted: ((goodsAmt * exchangeRate))});
					}
			}
		
 		// get shipping amount and tax info to add this data to the poleArr array
		var shippingTaxCode = nlapiGetFieldValue('shippingtaxcode');
		
		// check if the shippingTaxCode variable returns a value
		if (shippingTaxCode)
			{
				// retrieve shipping tax rate and amounts
				shippingTaxRate = nlapiGetFieldValue('shippingtax1rate');
				shippingTaxRate = parseFloat(shippingTaxRate).toFixed(2)+"%";
				shippingTaxName = nlapiGetFieldText('shippingtaxcode');
				shippingAmt = nlapiGetFieldValue('shippingcost');
				shippingTaxAmt = shippingAmt * (shippingTaxRate/100);
					
				// push shipping data to the poleArr
				poleArr.push({rate: shippingTaxRate, amt: shippingTaxAmt, amtconverted: ((shippingTaxAmt * exchangeRate)), name: shippingTaxName, code: shippingTaxCode, goods: shippingAmt, goodsconverted: ((shippingAmt * exchangeRate))});
			}

			// get handling amount and tax info to add this data to the poleArr array
			var handlingTaxCode = nlapiGetFieldText('handlingtaxcode');
			
			// check if the handlingTaxCode variable returns a value
			if (handlingTaxCode)
				{
					// retrieve handling tax rate and amounts
					handlingTaxRate = nlapiGetFieldValue('handlingtax1rate');
					handlingTaxName = nlapiGetFieldValue('handlingtaxcode');
					handlingAmt = nlapiGetFieldValue('handlingcost');
					handlingTaxAmt = handlingAmt * (handlingTaxRate/100);
					handlingTaxRate = parseFloat(handlingTaxRate).toFixed(2)+"%";
					
					// push handling data to the poleArr
					poleArr.push({rate: handlingTaxRate, amt: handlingTaxAmt, amtconverted: ((handlingTaxAmt * exchangeRate)), name: handlingTaxName, code: handlingTaxCode, goods: handlingAmt, goodsconverted: ((handlingAmt * exchangeRate))});
				}

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
		nlapiSetFieldValue('custbody_bbs_vat_summary', jsonString);
	}
