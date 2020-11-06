/*************************************************************************************
 * Name: 			transformCashSale.js
 * 
 * Script Type: 	User Event - after record submit
 * 
 * Version: 		1.0.0 - 29/01/2013 - Initial release - SA
 *  				1.0.2 - 10/02/2013 - added request suitelet inorder to speed up the process (suitelet - approveSalesOrder.js)- SA
 *  				1.0.3 - 12/02/2013 - removed edit type from triggering - SA
 *  				1.0.4 - 13/02/2013 - removed custom approve button, and added type = "approve", used standard approve button for approval process - SA
 *  				1.0.5 - 03/03/2013 - removed 1.0.1, cash sale to be create if payment method is chose and order status is pending fulfillment - SA
 * 					1.0.6 - 24/03/2014 - Set export to Magento 'T' on creation. - JA 
 *                  1.0.7 - 23/04/2014 - Before load check ship date against the current date and if before don't allow approval - SM
 *                  1.0.8 - 02/05/2014 - Allow approval when the ship date is null - SM
 *                 	1.0.9 - 10/09/2014 - Send the eKomi feedback email to the customer when a cash sales is created - LE
 *                 	1.0.10 - 05/12/2014 - changed logic around setting Can Be Fulfilled flag from web - MJL
 *                 	1.0.11 - 09/12/2014 - for all web orders that result in a cash sale mark can be fulfilled true - JM
 *                 	1.0.12 - 11/12/2014 - bug fixed for 1.0.11 - JM
 *                 	1.0.13 - 28/01/2015 - change context for cash sale creation so it's on the approve button from back office - JM
 *                  1.0.14 - 28/06/2015 - Expanded scope of function to process sample orders for S8184 - CW
 * 
 * Author: 			First Hosted Ltd
 * 
 * Purpose: 		transform cash sale from sales order record.   if its sample order (already  in approved stage) create cash sale. If warehouse order, 
 * 					approve when user approves using button or bulk approval process, and create a cash sale record.
 * 
 * Script: 			customscript_transformcashsale 
 * Deploy: 			customdeploy_transformcashsale
 * 
 * Notes: 			
 * 
 * Dependencies: 	
 * 					
 * 				 	
 * 
 * Library: 	 	Library.js
 *************************************************************************************/
var salesOrderID = 0;
var salesOrderRecord = null;
var paymentMethod = 0;
var creditCardAproved = 'F' ;
var orderStatus = '';
var isWeb = 'F';

var cashSaleRecord = null;
var cashSaleID = 0;					// 1.0.13

var pendingApproval = 'A';			// pending approval status id
var pendingFulfillment = 'B';		// pending fulfillment status id

var AMAZON_PAY_PAYMENT_METHOD = '22';
var AMAZON_PAY_ACCOUNT = '403';
/**
 * transform Cash Sale - after record submit function
 * 
 * 1.0.3 - 12/02/2013- removed edit type from triggering - SA
 * 1.0.4 - 13/02/2013- removed custom approve button, and added type = "approve", used standard approve button for approval process - SA
 * 1.0.5 - 03/03/2013- removed 1.0.1, cash sale to be create if payment method is chose and order status is pending fulfillment - SA
 * 1.0.10 - 05/12/2014 - changed logic around setting Can Be Fulfilled flag from web - MJL
 * 1.0.11 - 09/12/2014 - if web order and cash sale created, can be fulfilled = true
 * 1.0.12 - 11/12/2014 - bug fixed - JM
 * 1.0.13 - 28/01/2015 - context change for cash sale creation to approval button from back office + general tidy up- JM
 **/
function transformCashSale(type)
{
	try
	{
		if((type == 'approve') || (type == 'create')) // 1.0.14 
		{		
			salesOrderID = nlapiGetRecordId();
			salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderID);
			paymentMethod = salesOrderRecord.getFieldValue('paymentmethod');
			orderStatus = salesOrderRecord.getFieldValue('orderstatus');

			if(paymentMethod > 0 && (orderStatus == pendingFulfillment))
			{		
				cashSaleRecord = nlapiTransformRecord('salesorder', salesOrderID, 'cashsale'); 
              
              	if(paymentMethod == AMAZON_PAY_PAYMENT_METHOD){
                  cashSaleRecord.setFieldValue('account', AMAZON_PAY_ACCOUNT);
                }
				cashSaleID = nlapiSubmitRecord(cashSaleRecord, true);
				sendEkomiFeedbackEmail(cashSaleID); //1.0.10 MJL
			}

			if(cashSaleID > 0)
			{
				nlapiSubmitField('salesorder', salesOrderID, 'custbody_canbefulfilled', 'T');
			}
		}
	}
	catch (e)
	{
		errorHandler ("transformCashSale", e);
	}
}

/**
 * 1.0.9
 * Send the eKomi feedback email to the customer when a cash sales is created
 */
function sendEkomiFeedbackEmail(id)
{
	var url = '';
	
	try
	{
		url = nlapiResolveURL("SUITELET", "customscript_ekomi_send_review", "customdeploy_ekomi_send_review", true);
		url += ("&cs_id=" + id);
		nlapiRequestURL(url);
	}
	catch (e)
	{
		errorHandler("sendEkomiFeedbackEmail", e);
	}
}

/**
 * Before Load function to disable the 'approve' button 
 * 1.0.7 Before load created for sales order on approval
 * 1.0.8 Allow approval when the ship date is null
 */
function checkShipDateBeforeLoad(type)
{
    var salesRecord = null;
    var status = '';
    var shipDate = '';
    var today = null;
    var button = null;
    
    try
    {
        if(type == 'view')
        {
            salesOrderID = nlapiGetRecordId();
            salesRecord = nlapiLoadRecord('salesorder', salesOrderID);
            status = salesRecord.getFieldValue('status');
            
            today = getCurrentDate();
            today = nlapiStringToDate(today);
            
            if(status == 'Pending Approval')
            {
                shipDate = salesRecord.getFieldValue('shipdate');
                shipDate = nlapiStringToDate(shipDate);
                //1.0.8
                if(shipDate < today && shipDate != null)
                {
                    button = form.getButton('approve');
                    button.setDisabled(true);
                }
            }
        }
    }
    catch(e)
    {
        errorHandler ("beforeLoad()", e);
    }
}

/**
 * Get the date for when the certificate is printed
 */
function getCurrentDate()
{
    var day = '';
    var month = '';
    var year = '';
    var today = null;
    
    try
    {
        today = new Date();
        day = today.getDate();
        month = today.getMonth()+1;
        year = today.getFullYear();

        today = day + '/' + month + '/' + year;
    }
    catch(e)
    {
        errorHandler('getCurrentDate', e);
    }
    return today;
}