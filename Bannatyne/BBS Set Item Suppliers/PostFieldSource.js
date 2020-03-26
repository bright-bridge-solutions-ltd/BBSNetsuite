/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 May 2019     jondent
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */

function poFieldPostSource(type, name) {

  if(type == 'item' && name == 'custcol_tbg_supplier_item'){
    var customItem1 = nlapiGetCurrentLineItemValue('item', 'custcol_tbg_supplier_item');
    nlapiLogExecution('DEBUG', 'Custom item:- ',customItem1);
    nlapiSetCurrentLineItemValue('item', 'item', customItem1, true, true);
  }

}

function poFieldChanged(type, name, linenum){

  if(type == 'item' && name == 'custcol_tbg_supplier_item'){
    var customItem1 = nlapiGetCurrentLineItemValue('item', 'custcol_tbg_supplier_item');
    nlapiLogExecution('DEBUG', 'Custom item:- ',customItem1);
    nlapiSetCurrentLineItemValue('item', 'item', customItem1, true, true);
  }
}
