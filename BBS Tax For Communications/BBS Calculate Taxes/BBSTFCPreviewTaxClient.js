/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/url', 'N/currentRecord'],

function(url, currentRecord) 
{
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function previewTaxPI(scriptContext) 
	    {
    		debugger;
	    }

    function previewTax()
	    {
    		debugger;
    		
    		try
    			{		
    				var currRec = currentRecord.get();
        		
    				Ext.Ajax.timeout = (60000*5);
    				
    				var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Getting Tax Value'});
    				myMask.show();
    				
    				//Call the suitelet to get the tax calculation
    				//
    				Ext.Ajax.request({
    									url: 		url.resolveScript({scriptId: 'customscript_bbstfc_tax_prev_suitelet', deploymentId: 'customdeploy_bbstfc_tax_prev_suitelet'}),
    									method: 	'GET',
    									headers: 	{'Content-Type': 'application/json'},
    									params: 	{requesttype: 'H'},
    									success: 	function (response, result) 	{
	    																				myMask.hide();
	    																				try
	    																					{
	    																						//Extract the response
	    																						//
	    																						var respObj = JSON.parse(response.responseText);
	    																						
	    																						//Process the response
	    																						//
	    																						var AVA_TotalTax = Number(respObj.taxTotal);
	    																						
	    																						if(this.document)
	    																							{
	    																								 document.forms['main_form'].elements['taxamountoverride'].value = format_currency(AVA_TotalTax);  
	    																								 setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(AVA_TotalTax));
	    																							}
	    																						
	    																						currRec.setValue({fieldId: 'taxamountoverride', value: AVA_TotalTax, ignoreFieldChange: false});
	    																						
	    																						var TaxTotal = Number(0);
	    																						var Subtotal = Number(0);
	    																						var discount = Number(0);
	    																						var Shippingcost = Number(0);
	    																						var Handlingcost = Number(0);
	    																						var GiftCertCost = Number(0);
	    																						
	    																						TaxTotal 	= (currRec.getValue({fieldId: 'taxamountoverride'}) != null && currRec.getValue({fieldId: 'taxamountoverride'}) != '' )? parseFloat(currRec.getValue({fieldId: 'taxamountoverride'})) : 0; 

	    																						Subtotal	= parseFloat(currRec.getValue({fieldId: 'subtotal'}));
	    																						
	    																						discount = parseFloat(currRec.getValue({fieldId: 'discounttotal'}));

	    																						if((currRec.getValue({fieldId: 'shippingcost'}) != null) && (currRec.getValue({fieldId: 'shippingcost'}) != ''))
	    																						     {
	    																						       	Shippingcost = parseFloat(currRec.getValue({fieldId: 'shippingcost'}));
	    																						     }
	    																						
	    																						if((currRec.getValue({fieldId: 'handlingcost'}) != null) && (currRec.getValue({fieldId: 'handlingcost'}) != ''))
	    																						     {
	    																						    	 Handlingcost = parseFloat(currRec.getValue({fieldId: 'handlingcost'}));
	    																						     }

	    																						if((currRec.getValue({fieldId: 'giftcertapplied'}) != null) && (currRec.getValue({fieldId: 'giftcertapplied'}) != ''))
	    																							{
	    																								GiftCertCost = parseFloat(currRec.getValue({fieldId: 'giftcertapplied'}));
	    																							}

	    																						var NetTotal = Subtotal + discount + TaxTotal + Shippingcost + Handlingcost + GiftCertCost;
	    																						
	    																						NetTotal = Math.round((NetTotal * 100.00)) / 100.00;
	    																						
	    																						currRec.setValue({fieldId: 'total', value: NetTotal, ignoreFieldChange: false});
	    																						
	    																						
	    																					}
	    																				catch(err)
	    																					{
	    																					
	    																					}
    																				},
    									failure: 	function (response, result) 	{
	    																				myMask.hide();
	    																				alert(response.responseText);
    																				}
    								});
    			}
		    catch(e) 
		    	{
		            if (e instanceof nlobjError) 
		            	{
		                	alert(e.getCode() + '\n' + e.getDetails());
		            	}
		            else 
		            	{
		                	alert(e.toString());
		            	}
		        }
	    }



    return {
        	pageInit: 			previewTaxPI,
        	previewTax:			previewTax
    		};
    
});
