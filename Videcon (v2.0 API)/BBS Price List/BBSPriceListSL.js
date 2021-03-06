/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/render'],
function(ui, search, render) {
   
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
				var customerID 	= context.request.parameters.customer;
				var priceList	= context.request.parameters.pricelist;
				var brands		= context.request.parameters.brands;
    		
    			// create form that will be displayed to the user
				var form = ui.createForm({
	                title: 'Videcon - Generate Price List',
	                hideNavBar: false
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 270163;
				
				// add field groups to the form
   		 		form.addFieldGroup({
   		 			id: 'header',
   		 			label: 'Header'
   		 		}).isBorderHidden = true;
   		 		
	   		 	form.addFieldGroup({
		 			id: 'select_fields',
		 			label: 'Select Fields'
		 		}).isBorderHidden = true;
			 	
			 	// add fields to the form
				form.addField({
				    id: 'custpage_page_logo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Page Logo',
				    container: 'header'
				}).defaultValue = "<br/><img src='https://6765982.app.netsuite.com/core/media/media.nl?id=2273&amp;c=6765982&amp;h=l_StuPmlsC-62RMcdYxf3bUxn62g-5HlP-aFn8UlefU9XeLU' alt='Videcon Logo' style='width: 226px; height: 48px;'>";
				
				var customerSelect = form.addField({
					id: 'custpage_customer_select',
					type: ui.FieldType.SELECT,
					label: 'Customer',
					source: 'customer',
					container: 'select_fields'
				});
				
				customerSelect.isMandatory = true;
				
				var customerName = form.addField({
					id: 'custpage_customer_name',
					type: ui.FieldType.TEXT,
					label: 'Customer Name',
					container: 'select_fields'
				});
				
				customerName.updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN
				});
				
				var priceListSelect = form.addField({
					id: 'custpage_price_list_select',
					type: ui.FieldType.SELECT,
					label: 'Price List',
					container: 'select_fields'
				});
				
				priceListSelect.addSelectOption({
					value: 0,
					text: '',
					isSelected: true
				});
				
				priceListSelect.addSelectOption({
					value: 1,
					text: 'Fire'
				});
				
				priceListSelect.addSelectOption({
					value: 2,
					text: 'Videcon'
				});
				
				priceListSelect.addSelectOption({
					value: 3,
					text: 'Custom'
				});
				
				priceListSelect.isMandatory = true;
				
				var brandSelect = form.addField({
					id: 'custpage_brand_select',
					type: ui.FieldType.MULTISELECT,
					label: 'Brands',
					source: 'customrecord_cseg_bbs_brands',
					container: 'select_fields'
				});
				
				brandSelect.updateBreakType({
					breakType: ui.FieldBreakType.STARTCOL
				});
				
				brandSelect.updateDisplayType({
					displayType: ui.FieldDisplayType.DISABLED
				});
				
				// if the user has selected a customer and a price list
    			if (customerID != '' && customerID != null && priceList != '' && priceList != null)
    				{
    					// declare and initialize variables
    					var priceListSearch = null;
    				
    					// set the customer and price list select fields
    					customerSelect.defaultValue 	= customerID;
    					customerName.defaultValue		= getCustomerName(customerID);
    					priceListSelect.defaultValue 	= priceList;
    				
    					// add a sublist to the form
	    				var sublist = form.addSublist({
							type: ui.SublistType.LIST,
							id: 'custpage_items',
							label: 'Items'
						});
	    				
	    				sublist.addField({
							type: ui.FieldType.TEXT,
							id: 'custpage_brand',
							label: 'Brand'
						});
	    				
	    				sublist.addField({
							type: ui.FieldType.TEXT,
							id: 'custpage_item',
							label: 'Item'
						});
	    				
	    				sublist.addField({
							type: ui.FieldType.TEXT,
							id: 'custpage_description',
							label: 'Description'
						});
	    				
	    				sublist.addField({
							type: ui.FieldType.TEXT,
							id: 'custpage_sale_unit',
							label: 'Sale Unit'
						});
	    				
	    				sublist.addField({
							type: ui.FieldType.TEXT,
							id: 'custpage_currency',
							label: 'Currency'
						});
	    				
	    				sublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'custpage_unit_price',
							label: 'Unit Price'
						});
	    				
	    				switch(priceList) {
	    				
	    				case '1': // Fire
	    					
	    					// create search to find item pricing for the selected customer/brands
		    				pricingSearch = search.create({
		    					type: search.Type.PRICING,
		    					
		    					filters: [{
		    						name: 'customer',
		    						operator: search.Operator.ANYOF,
		    						values: [customerID]
		    					},
		    							{
		    						name: 'formulanumeric',
		    						formula: '{unitprice}',
		    						operator: search.Operator.GREATERTHAN,
		    						values: [0]
		    					},
		    							{
		    						name: 'custitem_bbs_exclude_from_price_list',
		    						join: 'item',
		    						operator: search.Operator.IS,
		    						values: ['F']
		    					},
		    							{
		    						name: 'custitem_bbs_fire_price_list',
		    						join: 'item',
		    						operator: search.Operator.IS,
		    						values: ['T']
		    					}],
		    					
		    					columns: [{
		    						name: 'cseg_bbs_brands',
		    						join: 'item',
		    						sort: search.Sort.ASC
		    					},
		    							{
		    						name: 'item',
		    						sort: search.Sort.ASC
		    					},
		    							{
		    						name: 'salesdescription',
		    						join: 'item'
		    					},
										{
		    						name: 'saleunit'
								},
										{
		    						name: 'currency'
								},
										{
									name: 'unitprice'
								}],
		    					
		    				});
	    					
	    					break;
	    				
	    				case '2': // Videcon
	    					
	    					// create search to find item pricing for the selected customer/brands
		    				pricingSearch = search.create({
		    					type: search.Type.PRICING,
		    					
		    					filters: [{
		    						name: 'customer',
		    						operator: search.Operator.ANYOF,
		    						values: [customerID]
		    					},
		    							{
		    						name: 'formulanumeric',
		    						formula: '{unitprice}',
		    						operator: search.Operator.GREATERTHAN,
		    						values: [0]
		    					},
		    							{
		    						name: 'custitem_bbs_exclude_from_price_list',
		    						join: 'item',
		    						operator: search.Operator.IS,
		    						values: ['F']
		    					},
		    							{
		    						name: 'custitem_bbs_videcon_price_list',
		    						join: 'item',
		    						operator: search.Operator.IS,
		    						values: ['T']
		    					}],
		    					
		    					columns: [{
		    						name: 'cseg_bbs_brands',
		    						join: 'item',
		    						sort: search.Sort.ASC
		    					},
		    							{
		    						name: 'item',
		    						sort: search.Sort.ASC
		    					},
		    							{
		    						name: 'salesdescription',
		    						join: 'item'
		    					},
										{
		    						name: 'saleunit'
								},
										{
		    						name: 'currency'
								},
										{
									name: 'unitprice'
								}],
		    					
		    				});
	    					
	    					 break;
	    				
	    				case '3': // Custom
	    					
	    					// enable the brand select field and make it mandatory
	    					brandSelect.updateDisplayType({
	    						displayType: ui.FieldDisplayType.NORMAL
	    					});
	    					
	    					brandSelect.isMandatory = true;
	    					
	    					// create search to find item pricing for the selected customer/brands
		    				pricingSearch = search.create({
		    					type: search.Type.PRICING,
		    					
		    					filters: [{
		    						name: 'customer',
		    						operator: search.Operator.ANYOF,
		    						values: [customerID]
		    					},
		    							{
		    						name: 'formulanumeric',
		    						formula: '{unitprice}',
		    						operator: search.Operator.GREATERTHAN,
		    						values: [0]
		    					},
		    							{
		    						name: 'custitem_bbs_exclude_from_price_list',
		    						join: 'item',
		    						operator: search.Operator.IS,
		    						values: ['F']
		    					}],
		    					
		    					columns: [{
		    						name: 'cseg_bbs_brands',
		    						join: 'item',
		    						sort: search.Sort.ASC
		    					},
		    							{
		    						name: 'item',
		    						sort: search.Sort.ASC
		    					},
		    							{
		    						name: 'salesdescription',
		    						join: 'item'
		    					},
										{
		    						name: 'saleunit'
								},
										{
		    						name: 'currency'
								},
										{
									name: 'unitprice'
								}],
		    					
		    				});
	    					
	    					break;
	    				
	    				}
	    				
	    				if (brands != '' && brands != null)
	    					{
		    					// set the value of the brands select field
	    						brandSelect.defaultValue = brands;
	    					
	    						// add a new search filter filter using .push() method
		    	    			pricingSearch.filters.push(
							    	    					search.createFilter({
							    	    						name: 'cseg_bbs_brands',
							    	    						join: 'item',
							    	    						operator: search.Operator.ANYOF,
							    	    						values: brands.split(',')
									    					})
				    									);
	    					}
	    				
	    				// get all the search results
	    				var searchResults = getAllResults(pricingSearch);
	    				
	    				// process search results
	    				for (var i = 0; i < searchResults.length; i++)
	    					{
	    						// retrieve search results
	    						var brand = searchResults[i].getText({
									name: 'cseg_bbs_brands',
		    						join: 'item'
								});
	    						
	    						var item = searchResults[i].getText({
									name: 'item'
								});
	    						
	    						var description = searchResults[i].getValue({
									name: 'salesdescription',
		    						join: 'item'
								});
	    						
	    						var saleUnit = searchResults[i].getText({
									name: 'saleunit'
								});
	    						
	    						var currency = searchResults[i].getText({
									name: 'currency'
								});
	    						
	    						var unitPrice = searchResults[i].getValue({
									name: 'unitprice'
								});
	    						
	    						if (brand != null && brand != '')
	    							{
	    								sublist.setSublistValue({
											id: 'custpage_brand',
											value: brand,
											line: i
			    						});
	    							}
	    						
	    						if (item != null && item != '')
	    							{
		    							sublist.setSublistValue({
											id: 'custpage_item',
											value: item,
											line: i
										});
	    							}
	    					
		    					if (description != null && description != '')
		    						{
			    						sublist.setSublistValue({
											id: 'custpage_description',
											value: description,
											line: i
										});
		    						}
		    					
		    					if (saleUnit != null && saleUnit != '')
		    						{
				    					sublist.setSublistValue({
											id: 'custpage_sale_unit',
											value: saleUnit,
											line: i
										});
		    						}
		    					
		    					if (currency != null && currency != '')
		    						{
				    					sublist.setSublistValue({
											id: 'custpage_currency',
											value: currency,
											line: i
										});
		    						}
		    					
		    					if (unitPrice != null && unitPrice != '')
		    						{
				    					sublist.setSublistValue({
											id: 'custpage_unit_price',
											value: unitPrice,
											line: i
										});
		    						}
	    					}
	    				
	    				// add submit button to the form
	    	    		form.addSubmitButton({
	       		 			label: 'Generate Price List'
	       		 		});
	    				
    				}
				
				// write the response to the page
				context.response.writePage(form);
				
			}
    	else if (context.request.method == 'POST')
			{
    			// declare and initialize variables
    			var xml = '';
    			
    			switch(context.request.parameters.custpage_price_list_select) {
    			
	    			case '1': // Fire
	    				
	    				xml += 	'<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
	    				xml +=	'<pdfset>';
	    				xml +=	'<pdf>';
	    				xml += 	'<head>';
	    				xml +=	'<macrolist>';
	    				xml +=	'<macro id="header">';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="footer">';
	    				xml	+=	'<p align="center"><span style="font-size:24px; font-weight: bold;">' + new Date().format('F Y').toUpperCase() + '</span></p>';
	    				xml +=	'<br/><p align="center"><span style="font-size:24px; font-weight: bold;">' + context.request.parameters.custpage_customer_name.replace(/&/g, '&amp;') + '</span></p>';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="watermark">';
	    				xml +=	'<img src="https://6765982.app.netsuite.com/core/media/media.nl?id=270154&amp;c=6765982&amp;h=FjF0Bde-j4gLBrcM8M94_0cQ_1o-GwGDfqqcAG0M-63rsN_m" style="width: 750px; height: 1050px;" />';
	    				xml +=	'</macro>';
	    				xml +=	'</macrolist>';
	    				xml +=	'<style type="text/css">';
	    		    	xml += 	'* {font-family: Arial, sans-serif;}';
	    		    	xml += 	'table {font-size: 10pt;}';
	    		    	xml += 	'th {font-weight: bold; font-size: 10pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #B32826; color: #FFFFFF;}';
	    		    	xml +=	'hr {width: 100%; margin-top: 20px; margin-bottom: 5px; height: 28px; background-color: #B32826;}';
	    		    	xml +=	'p { margin-top: 0; margin-bottom: 0; margin-left: 0; margin-right: 0;}';
	    		        xml += 	'</style>';
	    				xml	+=	'</head>';
	    				xml +=	'<body background-macro="watermark" header="header" header-height="0pt" footer="footer" footer-height="115pt" padding="0.0in 0.0in 0.0in 0.0in" size="A4">';
	    				xml +=	'<p align="center">&nbsp;</p>';
	    				xml +=	'</body>';
	        			xml +=	'</pdf>';
	    				xml +=	'<pdf>';
	    				xml +=	'<head>';
	    				xml +=	'<macrolist>';
	    				xml +=	'<macro id="header">';
	    				xml +=	'</macro>';
	    				xml +=	'</macrolist>';
	    				xml	+=	'</head>';
	    				xml +=	'<body padding="0.0in 0.0in 0.0in 0.0in" header="header" header-height="0pt" size="A4">';
	    				xml +=	'<img src="https://6765982.app.netsuite.com/core/media/media.nl?id=270155&amp;c=6765982&amp;h=AKnBpt9fiRjT9CAYx-fuFjPwRrgd6lTXrdZz1-J2nnwdxJ-R" style="width: 750px; height: 1050px;" />';
	    				xml +=	'</body>';
	        			xml +=	'</pdf>';
	    				xml +=	'<pdf>';
	    				xml += 	'<head>';
	    				xml +=	'<macrolist>';
	    				xml +=	'<macro id="header">';
	    				xml +=	'<table style="width: 100%; font-size: 12pt;">';
	    				xml +=	'<tr>';
	    				xml += 	'<td colspan="4"><img src="https://6765982.app.netsuite.com/core/media/media.nl?id=270157&amp;c=6765982&amp;h=nO_g0uMa_jhu9F1vKqaKViZ5YGmmsQhbLbdQB8KnONzV7Ue8" style="width: 250px; height: 50px;" /></td>';
	    				xml +=	'<td colspan="4" style="vertical-align: middle;">&nbsp;</td>';
	    				xml +=	'<td align="right" colspan="4" style="vertical-align: middle;">Page <pagenumber/> of <totalpages/></td>';
	    				xml +=	'</tr>';
	    				xml +=	'</table>';
	    				xml	+=	'<hr/>';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="footer">';
	    				xml	+=	'<hr/>';
	    				xml +=	'<table style="width: 100%; font-size: 14pt; margin-top: 20px;">';
	    				xml +=	'<tr>';
	    				xml +=	'<td colspan="12" align="center">01924 528001  •  fire@videcon.co.uk  •  www.videcon.co.uk</td>';
	    				xml +=	'</tr>';
	    				xml +=	'</table>';
	    				xml +=	'</macro>';
	    				xml +=	'</macrolist>';
	    				xml +=	'<style type="text/css">';
	    		    	xml += 	'* {font-family: Arial, sans-serif;}';
	    		    	xml += 	'table {font-size: 10pt;}';
	    		    	xml +=	'table.itemtable {page-break-after: always;}';
	    		    	xml += 	'th {font-weight: bold; font-size: 10pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #B32826; color: #FFFFFF;}';
	    		    	xml	+=	'td {padding: 5px 6px 3px;}';
	    		    	xml +=	'hr {width: 100%; margin-top: 20px; margin-bottom: 5px; height: 28px; background-color: #B32826;}';
	    		        xml += 	'</style>';
	    				xml	+=	'</head>';
	    				xml +=	'<body header="header" header-height="75pt" footer="footer" footer-height="40pt" padding="0.4in 0.4in 0.4in 0.4in" size="A4">';
	    				xml +=	'<table class="itemtable" style="width: 100%;">';
	    				xml +=	'<thead>';
	    				xml += 	'<tr>';
	    				xml += 	'<th colspan="4">Part Ref</th>';
	    				xml += 	'<th colspan="10">Item Description</th>';
	    				xml += 	'<th colspan="2" align="right">Cost</th>';
	    				xml += 	'</tr>';
	    				xml +=	'</thead>';
	    				
	    				// get count of lines on the sublist
	        			var lineCount = context.request.getLineCount('custpage_items');
	    				
	    				// loop through line count
	        			for (var i = 0; i < lineCount; i++)
	        				{
	        					// retrieve sublist values
	        					var brand = context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_brand',
	        						line: i
	        					});
	        					
	        					var item = context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_item',
	        						line: i
	        					});
	        					
	        					var description = context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_description',
	        						line: i
	        					});
	        					
	        					var unitPrice = parseFloat(context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_unit_price',
	        						line: i
	        					})).toFixed(2);
	        					
	        					// if this is the first line
	        					if (i == 0)
	        						{
	        							// add a brand line to the item table
	        							xml += 	'<tr>';
	        							xml	+=	'<td colspan="4" style="background-color: #949599;">&nbsp;</td>';
	        							xml +=	'<td colspan="10" style="background-color: #949599; color: #FFFFFF; font-weight: bold;">' + (brand != null && brand != '' ? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase() : '') + '</td>';
	        							xml +=	'<td colspan="2" style="background-color: #949599;">&nbsp;</td>';
	        							xml	+=	'</tr>';
	        						}
	        					else
	        						{
	        							// is the brand different to the line above
	        							var lastBrand = context.request.getSublistValue({
	        	    						group: 'custpage_items',
	        	    						name: 'custpage_brand',
	        	    						line: i-1
	        	    					});
	        							
	        							if (lastBrand != brand)
	        								{
	    	    								// end the current table, start a new table and a brand line to the item table
	        									xml += 	'</table>';
	        									xml +=	'<table class="itemtable" style="width: 100%;">';
	        				    				xml +=	'<thead>';
	        				    				xml += 	'<tr>';
	        				    				xml += 	'<th colspan="4">Part Ref</th>';
	        				    				xml += 	'<th colspan="10">Item Description</th>';
	        				    				xml += 	'<th colspan="2" align="right">Cost</th>';
	        				    				xml += 	'</tr>';
	        				    				xml +=	'</thead>';
	        									xml += 	'<tr>';
	    	        							xml	+=	'<td colspan="4" style="background-color: #949599;">&nbsp;</td>';
	    	        							xml +=	'<td colspan="10" style="background-color: #949599; color: #FFFFFF; font-weight: bold;">' + (brand != null && brand != '' ? brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase() : '') + '</td>';
	    	        							xml +=	'<td colspan="2" style="background-color: #949599;">&nbsp;</td>';
	    	        							xml	+=	'</tr>';
	        								}
	        						}
	        				
	        					// add the item details to the XML
	        					if (i%2 == 0)
	        						{
	    	    						xml += '<tr>';
	    								xml +=	'<td colspan="4" style="font-weight: bold;">' + (item != null && item != '' ? item.replace(/&/g, '&amp;') : '') + '</td>';
	    		    					xml +=	'<td colspan="10">' + (description != null && description != '' ? description.replace(/&/g, '&amp;') : '') + '</td>';
	    		    					xml +=	'<td colspan="2" align="right" style="font-weight: bold;">£' + unitPrice + '</td>';
	    		    					xml +=	'</tr>';
	        						}
	        					else
	        						{
	        							xml += '<tr>';
	        							xml +=	'<td colspan="4" style="font-weight: bold; background-color: #DCDCDF;">' + (item != null && item != '' ? item.replace(/&/g, '&amp;') : '') + '</td>';
	        	    					xml +=	'<td colspan="10" style="background-color: #DCDCDF;">' + (description != null && description != '' ? description.replace(/&/g, '&amp;') : '') + '</td>';
	        	    					xml +=	'<td colspan="2" align="right" style="font-weight: bold; background-color: #DCDCDF;">£' + unitPrice + '</td>';
	        	    					xml +=	'</tr>';
	        						}
	        				}
	        			
	        			// add closing XML tags
	        			xml += 	'</table>';
	        			xml +=	'</body>';
	        			xml +=	'</pdf>';
	        			xml +=	'<pdf>';
	    				xml += 	'<head>';
	    				xml +=	'<macrolist>';
	    				xml +=	'<macro id="header">';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="footer">';
	    				xml +=	'<br/><p align="center"><span style="font-size:24px; font-weight: bold; color: #FFFFFF;">' + context.request.parameters.custpage_customer_name.replace(/&/g, '&amp;') + '</span></p>';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="watermark">';
	    				xml +=	'<img src="https://6765982.app.netsuite.com/core/media/media.nl?id=270156&amp;c=6765982&amp;h=LbqE5qSqxS15kv2LiUcwbmqnQorjYtboMwLxJfNEDFjNDZTz" style="width: 750px; height: 1050px;" />';
	    				xml +=	'</macro>';
	    				xml +=	'</macrolist>';
	    				xml +=	'<style type="text/css">';
	    		    	xml += 	'* {font-family: Arial, sans-serif;}';
	    		    	xml += 	'table {font-size: 10pt;}';
	    		    	xml += 	'th {font-weight: bold; font-size: 10pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #B32826; color: #FFFFFF;}';
	    		    	xml +=	'hr {width: 100%; margin-top: 20px; margin-bottom: 5px; height: 28px; background-color: #B32826;}';
	    		    	xml +=	'p { margin-top: 0; margin-bottom: 0; margin-left: 0; margin-right: 0;}';
	    		        xml += 	'</style>';
	    				xml	+=	'</head>';
	    				xml +=	'<body background-macro="watermark" header="header" header-height="0pt" footer="footer" footer-height="375pt" padding="0.0in 0.0in 0.0in 0.0in" size="A4">';
	    				xml +=	'<p align="center">&nbsp;</p>';
	    				xml +=	'</body>';
	        			xml +=	'</pdf>';
	        			xml +=	'</pdfset>';
	    				
	    				break;
	    				
	    			default: // Videcon
	    				
	    				xml += 	'<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
	    				xml +=	'<pdfset>';
	    				xml +=	'<pdf>';
	    				xml += 	'<head>';
	    				xml +=	'<macrolist>';
	    				xml +=	'<macro id="header">';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="footer">';
	    				xml	+=	'<p align="center"><span style="font-size:24px; font-weight: bold;">' + new Date().format('F Y').toUpperCase() + '</span></p>';
	    				xml +=	'<br/><p align="center"><span style="font-size:24px; font-weight: bold;">' + context.request.parameters.custpage_customer_name.replace(/&/g, '&amp;') + '</span></p>';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="watermark">';
	    				xml +=	'<img src="https://6765982.app.netsuite.com/core/media/media.nl?id=270150&amp;c=6765982&amp;h=GJMXbcqQXmxh8mgNTK5BtneIXZ_oeRi1LTjEviTu-MgDIJcd" style="width: 750px; height: 1050px;" />';
	    				xml +=	'</macro>';
	    				xml +=	'</macrolist>';
	    				xml +=	'<style type="text/css">';
	    		    	xml += 	'* {font-family: Arial, sans-serif;}';
	    		    	xml += 	'table {font-size: 10pt;}';
	    		    	xml += 	'th {font-weight: bold; font-size: 10pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #B32826; color: #FFFFFF;}';
	    		    	xml +=	'hr {width: 100%; margin-top: 20px; margin-bottom: 5px; height: 28px; background-color: #B32826;}';
	    		    	xml +=	'p { margin-top: 0; margin-bottom: 0; margin-left: 0; margin-right: 0;}';
	    		        xml += 	'</style>';
	    				xml	+=	'</head>';
	    				xml +=	'<body background-macro="watermark" header="header" header-height="0pt" footer="footer" footer-height="140pt" padding="0.0in 0.0in 0.0in 0.0in" size="A4">';
	    				xml +=	'<p align="center">&nbsp;</p>';
	    				xml +=	'</body>';
	        			xml +=	'</pdf>';
	    				xml +=	'<pdf>';
	    				xml +=	'<body padding="0.0in 0.0in 0.0in 0.0in" size="A4">';
	    				xml +=	'<img src="https://6765982.app.netsuite.com/core/media/media.nl?id=270151&amp;c=6765982&amp;h=IFBkt5LtDe6GVHs4BM-wc3f6czdCPnrkuU1vCRLqQkl1Lx4c" style="width: 750px; height: 1050px;" />';
	    				xml +=	'</body>';
	        			xml +=	'</pdf>';
	    				xml +=	'<pdf>';
	    				xml += 	'<head>';
	    				xml +=	'<macrolist>';
	    				xml +=	'<macro id="header">';
	    				xml +=	'<table style="width: 100%; font-size: 12pt;">';
	    				xml +=	'<tr>';
	    				xml += 	'<td colspan="4"><img src="https://6765982.app.netsuite.com/core/media/media.nl?id=2273&amp;c=6765982&amp;h=l_StuPmlsC-62RMcdYxf3bUxn62g-5HlP-aFn8UlefU9XeLU" style="width: 225px; height: 50px;" /></td>';
	    				xml +=	'<td colspan="4" style="vertical-align: middle;">&nbsp;</td>';
	    				xml +=	'<td align="right" colspan="4" style="vertical-align: middle;">Page <pagenumber/> of <totalpages/></td>';
	    				xml +=	'</tr>';
	    				xml +=	'</table>';
	    				xml	+=	'<hr/>';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="footer">';
	    				xml	+=	'<hr/>';
	    				xml +=	'<table style="width: 100%; font-size: 14pt; margin-top: 20px;">';
	    				xml +=	'<tr>';
	    				xml +=	'<td colspan="12" align="center">01924 528000  •  sales@videcon.co.uk  •  www.videcon.co.uk</td>';
	    				xml +=	'</tr>';
	    				xml +=	'</table>';
	    				xml +=	'</macro>';
	    				xml +=	'</macrolist>';
	    				xml +=	'<style type="text/css">';
	    		    	xml += 	'* {font-family: Arial, sans-serif;}';
	    		    	xml += 	'table {font-size: 10pt;}';
	    		    	xml +=	'table.itemtable {page-break-after: always;}';
	    		    	xml += 	'th {font-weight: bold; font-size: 10pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #5180B8; color: #FFFFFF;}';
	    		    	xml	+=	'td {padding: 5px 6px 3px;}';
	    		    	xml +=	'hr {width: 100%; margin-top: 20px; margin-bottom: 5px; height: 28px; background-color: #5180B8;}';
	    		        xml += 	'</style>';
	    				xml	+=	'</head>';
	    				xml +=	'<body header="header" header-height="75pt" footer="footer" footer-height="40pt" padding="0.4in 0.4in 0.4in 0.4in" size="A4">';
	    				xml +=	'<table class="itemtable" style="width: 100%;">';
	    				xml +=	'<thead>';
	    				xml += 	'<tr>';
	    				xml += 	'<th colspan="4">Part Ref</th>';
	    				xml += 	'<th colspan="10">Item Description</th>';
	    				xml += 	'<th colspan="2" align="right">Cost</th>';
	    				xml += 	'</tr>';
	    				xml +=	'</thead>';
	    				
	    				// get count of lines on the sublist
	        			var lineCount = context.request.getLineCount('custpage_items');
	    				
	    				// loop through line count
	        			for (var i = 0; i < lineCount; i++)
	        				{
	        					// retrieve sublist values
	        					var brand = context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_brand',
	        						line: i
	        					}).replace(/&/g, '&amp;');
	        					
	        					var item = context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_item',
	        						line: i
	        					}).replace(/&/g, '&amp;');
	        					
	        					var description = context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_description',
	        						line: i
	        					}).replace(/&/g, '&amp;');
	        					
	        					var unitPrice = parseFloat(context.request.getSublistValue({
	        						group: 'custpage_items',
	        						name: 'custpage_unit_price',
	        						line: i
	        					})).toFixed(2);
	        					
	        					// if this is the first line
	        					if (i == 0)
	        						{
	        							// add a brand line to the item table
	        							xml += 	'<tr>';
	        							xml	+=	'<td colspan="4" style="background-color: #949599;">&nbsp;</td>';
	        							xml +=	'<td colspan="10" style="background-color: #949599; color: #FFFFFF; font-weight: bold;">' + brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase() + '</td>';
	        							xml +=	'<td colspan="2" style="background-color: #949599;">&nbsp;</td>';
	        							xml	+=	'</tr>';
	        						}
	        					else
	        						{
	        							// is the brand different to the line above
	        							var lastBrand = context.request.getSublistValue({
	        	    						group: 'custpage_items',
	        	    						name: 'custpage_brand',
	        	    						line: i-1
	        	    					});
	        							
	        							if (lastBrand != brand)
	        								{
	    	    								// end the current table, start a new table and a brand line to the item table
	        									xml += 	'</table>';
	        									xml +=	'<table class="itemtable" style="width: 100%;">';
	        				    				xml +=	'<thead>';
	        				    				xml += 	'<tr>';
	        				    				xml += 	'<th colspan="4">Part Ref</th>';
	        				    				xml += 	'<th colspan="10">Item Description</th>';
	        				    				xml += 	'<th colspan="2" align="right">Cost</th>';
	        				    				xml += 	'</tr>';
	        				    				xml +=	'</thead>';
	        									xml += 	'<tr>';
	    	        							xml	+=	'<td colspan="4" style="background-color: #949599;">&nbsp;</td>';
	    	        							xml +=	'<td colspan="10" style="background-color: #949599; color: #FFFFFF; font-weight: bold;">' + brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase() + '</td>';
	    	        							xml +=	'<td colspan="2" style="background-color: #949599;">&nbsp;</td>';
	    	        							xml	+=	'</tr>';
	        								}
	        						}
	        				
	        					// add the item details to the XML
	        					if (i%2 == 0)
	        						{
	    	    						xml += '<tr>';
	    								xml +=	'<td colspan="4" style="font-weight: bold;">' + item + '</td>';
	    		    					xml +=	'<td colspan="10">' + description + '</td>';
	    		    					xml +=	'<td colspan="2" align="right" style="font-weight: bold;">£' + unitPrice + '</td>';
	    		    					xml +=	'</tr>';
	        						}
	        					else
	        						{
	        							xml += '<tr>';
	        							xml +=	'<td colspan="4" style="font-weight: bold; background-color: #DCDCDF;">' + item + '</td>';
	        	    					xml +=	'<td colspan="10" style="background-color: #DCDCDF;">' + description + '</td>';
	        	    					xml +=	'<td colspan="2" align="right" style="font-weight: bold; background-color: #DCDCDF;">£' + unitPrice + '</td>';
	        	    					xml +=	'</tr>';
	        						}
	        				}
	        			
	        			// add closing XML tags
	        			xml += 	'</table>';
	        			xml +=	'</body>';
	        			xml +=	'</pdf>';
	        			xml +=	'<pdf>';
	    				xml += 	'<head>';
	    				xml +=	'<macrolist>';
	    				xml +=	'<macro id="header">';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="footer">';
	    				xml +=	'<br/><p align="center"><span style="font-size:24px; font-weight: bold; color: #FFFFFF;">' + context.request.parameters.custpage_customer_name.replace(/&/g, '&amp;') + '</span></p>';
	    				xml +=	'</macro>';
	    				xml +=	'<macro id="watermark">';
	    				xml +=	'<img src="https://6765982.app.netsuite.com/core/media/media.nl?id=270153&amp;c=6765982&amp;h=fOO0jaVN4S2aEx5hjy-_rMhiq-jmtGcp8w53noF7FnkoTxRt" style="width: 750px; height: 1050px;" />';
	    				xml +=	'</macro>';
	    				xml +=	'</macrolist>';
	    				xml +=	'<style type="text/css">';
	    		    	xml += 	'* {font-family: Arial, sans-serif;}';
	    		    	xml += 	'table {font-size: 10pt;}';
	    		    	xml += 	'th {font-weight: bold; font-size: 10pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #B32826; color: #FFFFFF;}';
	    		    	xml +=	'hr {width: 100%; margin-top: 20px; margin-bottom: 5px; height: 28px; background-color: #B32826;}';
	    		    	xml +=	'p { margin-top: 0; margin-bottom: 0; margin-left: 0; margin-right: 0;}';
	    		        xml += 	'</style>';
	    				xml	+=	'</head>';
	    				xml +=	'<body background-macro="watermark" header="header" header-height="0pt" footer="footer" footer-height="375pt" padding="0.0in 0.0in 0.0in 0.0in" size="A4">';
	    				xml +=	'<p align="center">&nbsp;</p>';
	    				xml +=	'</body>';
	        			xml +=	'</pdf>';
	        			xml +=	'</pdfset>';
	    				
	    				break;
    			
    			}
    			
    			// render the XML as a PDF file
    			var pdfFile = render.xmlToPdf({
    			    xmlString: xml
    			});
    			
    			pdfFile.name = new Date().format('F Y') + ' Price List.pdf';
    			
    			// return the file to the browser
    			context.response.writeFile({
    				file: pdfFile,
    				isInline: true
    			});
			}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getCustomerName(customerID) {
    	
    	// lookup fields on the customer record
    	return search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['companyname']
    	}).companyname;
    	
    }
    
    function getAllResults(_search) {
       	
    	// run the search
		var searchResult = _search.run();
		
		// get the initial set of results
		var start = 0;
		var end = 1000;
		
		var searchResultSet = searchResult.getRange({
		    start: start, 
		    end: end
		});
		
		var resultlen = searchResultSet.length;
	
		// if there is more than 1000 results, page through them
		while (resultlen == 1000) 
			{
					start += 1000;
					end += 1000;
	
					var moreSearchResultSet = searchResult.getRange({
					    start: start, 
					    end: end
					});
					
					resultlen = moreSearchResultSet.length;
	
					searchResultSet = searchResultSet.concat(moreSearchResultSet);
			}
		
		return searchResultSet;
	
    }
    
    //===========
	// PROTOTYPES
	//===========
	
	//Date & time formatting prototype 
	//
	(function() {

		Date.shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
		Date.longMonths = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
		Date.shortDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
		Date.longDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

		// defining patterns
		var replaceChars = {
		// Day
		d : function() {
			return (this.getDate() < 10 ? '0' : '') + this.getDate();
		},
		D : function() {
			return Date.shortDays[this.getDay()];
		},
		j : function() {
			return this.getDate();
		},
		l : function() {
			return Date.longDays[this.getDay()];
		},
		N : function() {
			return (this.getDay() == 0 ? 7 : this.getDay());
		},
		S : function() {
			return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
		},
		w : function() {
			return this.getDay();
		},
		z : function() {
			var d = new Date(this.getFullYear(), 0, 1);
			return Math.ceil((this - d) / 86400000);
		}, // Fixed now
		// Week
		W : function() {
			var target = new Date(this.valueOf());
			var dayNr = (this.getDay() + 6) % 7;
			target.setDate(target.getDate() - dayNr + 3);
			var firstThursday = target.valueOf();
			target.setMonth(0, 1);
			if (target.getDay() !== 4) {
				target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
			}
			var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

			return (retVal < 10 ? '0' + retVal : retVal);
		},
		// Month
		F : function() {
			return Date.longMonths[this.getMonth()];
		},
		m : function() {
			return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
		},
		M : function() {
			return Date.shortMonths[this.getMonth()];
		},
		n : function() {
			return this.getMonth() + 1;
		},
		t : function() {
			var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
			if (nextMonth === 12) {
				year = year++;
				nextMonth = 0;
			}
			return new Date(year, nextMonth, 0).getDate();
		},
		// Year
		L : function() {
			var year = this.getFullYear();
			return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
		}, // Fixed now
		o : function() {
			var d = new Date(this.valueOf());
			d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
			return d.getFullYear();
		}, //Fixed now
		Y : function() {
			return this.getFullYear();
		},
		y : function() {
			return ('' + this.getFullYear()).substr(2);
		},
		// Time
		a : function() {
			return this.getHours() < 12 ? 'am' : 'pm';
		},
		A : function() {
			return this.getHours() < 12 ? 'AM' : 'PM';
		},
		B : function() {
			return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
		}, // Fixed now
		g : function() {
			return this.getHours() % 12 || 12;
		},
		G : function() {
			return this.getHours();
		},
		h : function() {
			return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
		},
		H : function() {
			return (this.getHours() < 10 ? '0' : '') + this.getHours();
		},
		i : function() {
			return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
		},
		s : function() {
			return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
		},
		u : function() {
			var m = this.getMilliseconds();
			return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
		},
		// Timezone
		e : function() {
			return /\((.*)\)/.exec(new Date().toString())[1];
		},
		I : function() {
			var DST = null;
			for (var i = 0; i < 12; ++i) {
				var d = new Date(this.getFullYear(), i, 1);
				var offset = d.getTimezoneOffset();

				if (DST === null)
					DST = offset;
				else
					if (offset < DST) {
						DST = offset;
						break;
					}
					else
						if (offset > DST)
							break;
			}
			return (this.getTimezoneOffset() == DST) | 0;
		},
		O : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		},
		P : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		}, // Fixed now
		T : function() {
			return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
		},
		Z : function() {
			return -this.getTimezoneOffset() * 60;
		},
		// Full Date/Time
		c : function() {
			return this.format("Y-m-d\\TH:i:sP");
		}, // Fixed now
		r : function() {
			return this.toString();
		},
		U : function() {
			return this.getTime() / 1000;
		}
		};

		// Simulates PHP's date function
		Date.prototype.format = function(format) {
			var date = this;
			return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
				return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
			});
		};

	}).call(this);

    return {
        onRequest: onRequest
    };
    
});
