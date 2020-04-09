/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Oct 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function poCheckBudgetBL(type, form, request)
{
	if(type == 'copy' || type == 'create')
		{
			var lines = nlapiGetLineItemCount('item');
			
			for (var int = 1; int <= lines; int++) 
				{
					nlapiSetLineItemValue('item', 'custcol_bbs_budget_ytd', int, null);
					nlapiSetLineItemValue('item', 'custcol_bbs_available_budget', int, null);
					nlapiSetLineItemValue('item', 'custcol_bbs_actual_spend', int, null);
					nlapiSetLineItemValue('item', 'custcol_bbs_actual_spend', int, null);
				}
		}
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function poCheckBudgetAS(type)
{
	//Get the current purchase order record
	//
	var newRecord = nlapiGetNewRecord();
	var poId = newRecord.getId();
	var poType = newRecord.getFieldValue('custbody_po_type');
	var poApprovalStage = newRecord.getFieldValue('custbody_bbs_opex_app_stag');
	
	if(type == 'create' || (type == 'edit' && (poApprovalStage == 6 || poApprovalStage == 1))) //PO Rejected, Pending Submission
		{
			//Get environment
			//
			var context = nlapiGetContext();
			var amoritizationAccount = context.getSetting('SCRIPT', 'custscript_bbs_amortization_account');
			
			if(poType == '2')	//OPEX
				{
					//Init variables
					//
					var poRecord = null;
					var accountBalances = {};
					var poOverBudget = false;
					var warningSymbol = '⚠️';
					var okSymbol = '✅';
					var errorSymbol = '🚫';
					var noBudgetSymbol = '❗';
					var noBudgetValue = Number(999999);
					
					//Read the PO record
					//
					try
						{
							poRecord = nlapiLoadRecord('purchaseorder', poId);
						}
					catch(err)
						{
							poRecord = null;
						}
					
					//Have we loaded the record ok
					//
					if(poRecord != null)
						{
							//Get header level data from the PO
							//
							var poSubsidiary = poRecord.getFieldValue('subsidiary');
							var poCostCentre = poRecord.getFieldValue('class');
							var poDate = poRecord.getFieldValue('trandate');
							var poItemLines = poRecord.getLineItemCount('item');
							var poCurrency = poRecord.getLineItemCount('currency');
							poCurrency = (poCurrency == -1 ? 1 : poCurrency);
							
							//Get the data from the subsidiary, fiscal calendar & currency
							//
							var fiscalCalendar = nlapiLookupField('subsidiary', poSubsidiary, 'fiscalcalendar', false);
							var subsidiaryCurrency = nlapiLookupField('subsidiary', poSubsidiary, 'currency', false);
							
							//Work out what the exchange rate is between the po currency & the subsidiary currency
							//
							var exchangeRate = Number(1);
							
							if(poCurrency != subsidiaryCurrency)
								{
									exchangeRate = nlapiExchangeRate(poCurrency, subsidiaryCurrency, poDate);
								}
							
							//Find the start and end dates for the relevant financial year based on the tran date of the PO
							//
							var finCalDates = findFinCalDates(poDate, fiscalCalendar);
							
							//Did we get the dates?
							//
							if(finCalDates != null)
								{
									//Now process each line on the PO
									//
									for (var int = 1; int <= poItemLines; int++) 
										{
											var poLineItem = poRecord.getLineItemValue('item', 'item', int);
											var poLineItemType = poRecord.getLineItemValue('item', 'itemtype', int);
											var poLineItemAccount = nlapiLookupField(getItemRecType(poLineItemType), poLineItem, 'expenseaccount', false);
											var poLineAmount = Number(poRecord.getLineItemValue('item', 'amount', int)) * exchangeRate;
													
											//Find the ytd spend on the account
											//
											var accountSpend = findYTD(poLineItemAccount, poSubsidiary, poCostCentre, finCalDates, amoritizationAccount, poId);
													
											//Find the ytd budget for the account
											//
											var accountBudget = findYTDBudget(poCostCentre, poSubsidiary, poLineItemAccount, finCalDates.id, noBudgetValue)
													
											//Calc the remaining budget
											//
											var remaining = accountBudget - accountSpend;
													
											//Save away the account balance
											//
											if(!accountBalances[poLineItemAccount])
												{
													accountBalances[poLineItemAccount] = remaining;
												}
													
											//Reduce the remaining balance by the amount on the line
											//
											accountBalances[poLineItemAccount] -= poLineAmount;
													
											//Work out what icon to use on the line
											//
											var lineIcon = '';
													
											if(remaining - poLineAmount >= 0)
												{
													//Remaining budget less the current line is positive, so we are ok
													//
													lineIcon = okSymbol;
												}
													
											if(remaining - poLineAmount < 0)
												{
													//Remaining budget less the current line is negative, so this line is definitely bad
													//
													lineIcon = errorSymbol;
													poOverBudget = true;
												}
												
											if(accountBudget == noBudgetValue)
												{
													//If there was no budget found, then we should flag a warning
													//
													lineIcon = noBudgetSymbol;
												}
											
											//Update the line with the relevant fields
											//
											if(accountBudget != noBudgetValue)
												{
													poRecord.setLineItemValue('item', 'custcol_bbs_budget_ytd', int, accountBudget);
													poRecord.setLineItemValue('item', 'custcol_bbs_available_budget', int, remaining);
													
												}
											else
												{
													poRecord.setLineItemValue('item', 'custcol_bbs_budget_ytd', int, null);
													poRecord.setLineItemValue('item', 'custcol_bbs_available_budget', int, null);
												}
											poRecord.setLineItemValue('item', 'custcol_bbs_actual_spend', int, accountSpend);
											poRecord.setLineItemValue('item', 'custcol_bbs_budget_check', int, lineIcon);
										}
									
									//Now re-process each line on the PO checking for cumulative over budgets
									//
									for (var int = 1; int <= poItemLines; int++) 
										{
											var poLineItem = poRecord.getLineItemValue('item', 'item', int);
											var poLineItemType = poRecord.getLineItemValue('item', 'itemtype', int);
											var poLineItemAccount = nlapiLookupField(getItemRecType(poLineItemType), poLineItem, 'expenseaccount', false);
											var poLineIcon = poRecord.getLineItemValue('item', 'custcol_bbs_budget_check', int);	
											
											//Check the cumulative account balance
											//
											if(accountBalances[poLineItemAccount] <= 0 && poLineIcon != errorSymbol)
												{
													//Update the line with the warning symbol for cumulative over budget scenarios, but only if the line was previously 'ok'
													//
													poRecord.setLineItemValue('item', 'custcol_bbs_budget_check', int, warningSymbol);
													
													poOverBudget = true;
												}
										}
										
									//Update the over budget flag on the po header
									//
									poRecord.setFieldValue('custbody_bbs_opex_over', (poOverBudget ? 'T' : 'F'));
		
									//Save the PO record
									//
									nlapiSubmitRecord(poRecord, false, true);
								}
						}
				}
		}

		function findFinCalDates(_trandate, _fiscalCalendar)
		{
			var returnedData = null;
			
			//Search for an accounting period 'year' record
			//
			var accountingperiodSearch = nlapiSearchRecord("accountingperiod",null,
					[
					   ["isyear","is","T"], 
					   "AND", 
					   ["fiscalcalendar","anyof",_fiscalCalendar], 
					   "AND", 
					   ["isinactive","is","F"], 
					   "AND", 
					   ["startdate","onorbefore",_trandate], 
					   "AND", 
					   ["enddate","onorafter",_trandate]
					], 
					[
					   new nlobjSearchColumn("periodname").setSort(false), 
					   new nlobjSearchColumn("enddate"), 
					   new nlobjSearchColumn("startdate"), 
					   new nlobjSearchColumn("isyear")
					]
					);
			
			//Did we find a record?
			//
			if(accountingperiodSearch != null && accountingperiodSearch.length == 1)
				{
					var start = accountingperiodSearch[0].getValue("startdate");
					var end = accountingperiodSearch[0].getValue("enddate");
					var id = accountingperiodSearch[0].getId();
					
					returnedData = new calendarDates(start, end, id)
				}
			
			return returnedData;
		}

		function findYTDBudget(_costCentre, _subsidiary, _account, _year, _noBudgetValue)
		{
			//Start of with a max budget figure
			//
			var ytdBudget = _noBudgetValue;
			
			//Search for a budget
			//
			var budgetimportSearch = nlapiSearchRecord("budgetimport",null,
					[
					   ["class","anyof",_costCentre], 
					   "AND", 
					   ["subsidiary","anyof",_subsidiary], 
					   "AND", 
					   ["account","anyof",_account], 
					   "AND", 
					   ["year","anyof",_year]
					], 
					[
					   new nlobjSearchColumn("account").setSort(false), 
					   new nlobjSearchColumn("amount") 
					]
					);

			//Did we find a budget?
			//
			if(budgetimportSearch != null && budgetimportSearch.length == 1)
				{
					ytdBudget = Number(budgetimportSearch[0].getValue("amount"));
				}
			
			return ytdBudget;
		}


		function findYTD(_account, _subsidiary, _costCentre, _calDates, _amortizationAccount, _poId)
		{
			var ytdValue = Number(0);
			
			//Find the total value of all transactions for a specific account
			//
			var transactionSearch = nlapiSearchRecord("transaction",null,
					[
					   ["posting","is","T"], 
					   "AND", 
					   ["subsidiary","anyof",_subsidiary], 
					   "AND", 
					   ["class","anyof",_costCentre], 
					   "AND", 
					   ["trandate","within",_calDates.startDate,_calDates.endDate], 
					   "AND", 
					   ["account","anyof",_account]
					], 
					[
					   new nlobjSearchColumn("amount",null,"SUM")
					]
					);

			//Did we get any results?
			//
			if(transactionSearch != null && transactionSearch.length == 1)
				{
					ytdValue = Number(transactionSearch[0].getValue("amount",null,"SUM"));	
				}

			//Find the total value of all transactions for the amoritization account
			//
			if(_amortizationAccount != null && _amortizationAccount != '')
				{
					var transactionSearch = nlapiSearchRecord("transaction",null,
							[
							   ["posting","is","T"], 
							   "AND", 
							   ["subsidiary","anyof",_subsidiary], 
							   "AND", 
							   ["class","anyof",_costCentre], 
							   "AND", 
							   ["trandate","within",_calDates.startDate,_calDates.endDate], 
							   "AND", 
							   ["account","anyof",_amortizationAccount],
							   "AND", 
							   ["item.account","anyof",_account],
							], 
							[
							   new nlobjSearchColumn("amount",null,"SUM")
							]
							);
		
					//Did we get any results?
					//
					if(transactionSearch != null && transactionSearch.length == 1)
						{
							ytdValue += Math.abs(Number(transactionSearch[0].getValue("amount",null,"SUM")));	
						}
					
					//Find the total value of any open PO records (excluding the po we are working on)
					//
					var purchaseorderSearch = nlapiSearchRecord("purchaseorder",null,
							[
							   ["type","anyof","PurchOrd"], 
							   "AND", 
							   ["mainline","is","F"], 
							   "AND", 
							   ["cogs","is","F"], 
							   "AND", 
							   ["taxline","is","F"], 
							   "AND", 
							   ["shipping","is","F"], 
							   "AND", 
							   ["status","anyof","PurchOrd:D","PurchOrd:F","PurchOrd:E","PurchOrd:B"], 
							   "AND", 
							   ["account","anyof", _account], 
							   "AND", 
							   ["internalid","noneof", _poId],
							   "AND", 
							   ["class","anyof", _costCentre], 
							   "AND", 
							   ["trandate","within", _calDates.startDate, _calDates.endDate],
							   "AND", 
							   ["subsidiary","anyof", _subsidiary]
							], 
							[
							   new nlobjSearchColumn("amount",null,"SUM")
							]
							);
					
					//Did we get any results?
					//
					if(purchaseorderSearch != null && purchaseorderSearch.length == 1)
						{
							ytdValue += Math.abs(Number(purchaseorderSearch[0].getValue("amount",null,"SUM")));	
						}
				}
			
			return ytdValue;
		}

		function getItemRecType(ItemType)
		{
			//Translate the record types
			//
			var itemType = '';
			
			switch(ItemType)
			{
				case 'InvtPart':
					itemType = 'inventoryitem';
					break;
					
				case 'Assembly':
					itemType = 'assemblyitem';
					break;
					
				case 'NonInvtPart':
					itemType = 'noninventoryitem';
					break;
					
				case 'OthCharge':
					itemType = 'otherchargeitem';
					break;
			}

			return itemType;
		}

		function calendarDates(_start, _end, _id)
		{
			//Object to hold the calendar dates
			//
			this.startDate = _start;
			this.endDate = _end;
			this.id = _id;

		
		}
}
