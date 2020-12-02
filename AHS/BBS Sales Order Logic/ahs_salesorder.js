/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Nov 2016     Krish
 *
 */


function beforeLoad(type, form, request) {

}

function beforeSubmitSo(type) {
	
	var currentContext = nlapiGetContext();
	var executionContext = currentContext.getExecutionContext();
	var orderSource = parseInt(nlapiGetFieldValue('custbody_ahs_order_source'));
	nlapiLogExecution('DEBUG', 'Before Submit executionContext -', executionContext + ', orderSource -' + orderSource);
	if((executionContext == 'webservices') && (type == 'create' || type == 'edit')) {
		var count = nlapiGetLineItemCount('item');
		var flg;
		for (ma = 1; ma <= count; ma++){ // Processing Maganto order line
			var itemtypeMa = nlapiGetLineItemValue('item', 'itemtype', ma);
			var itemMa = nlapiGetLineItemValue('item', 'item', ma);
			var qryMa = nlapiGetLineItemValue('item', 'quantity', ma);
			flg = 0;
			
			nlapiSetLineItemValue('item', 'custcol_line_id_custom', ma, ma);
			if (itemtypeMa == 'InvtPart') {
				
				nlapiInsertLineItem('item', ma+1);
				nlapiSetLineItemValue('item', 'item', ma+1, 252);
				nlapiSetLineItemValue('item', 'quantity', ma+1, 1);
				nlapiSetLineItemValue('item', 'amount', ma+1, 0);
				nlapiSetLineItemValue('item', 'custcol1', ma+1, itemMa);
				nlapiSetLineItemValue('item', 'custcol2', ma+1, qryMa);
				nlapiInsertLineItem('item', ma+2);
				nlapiSetLineItemValue('item', 'item', ma+2, 253);
				nlapiSetLineItemValue('item', 'quantity', ma+2, 1);
				nlapiSetLineItemValue('item', 'amount', ma+2, 0);
				flg++;
				nlapiLogExecution('DEBUG', 'BS Magnato ma - ',ma +', count-'+ count);
				if (parseInt(itemMa) == 1283 || parseInt(itemMa) == 1285 ){
					nlapiInsertLineItem('item', ma+3);
					nlapiSetLineItemValue('item', 'item', ma+3, 1303);
					nlapiSetLineItemValue('item', 'quantity', ma+3, 1);
					nlapiSetLineItemValue('item', 'amount', ma+3, 0);
					nlapiInsertLineItem('item', ma+4);
					nlapiSetLineItemValue('item', 'item', ma+4, 1305);
					nlapiSetLineItemValue('item', 'quantity', ma+4, 1);
					nlapiSetLineItemValue('item', 'amount', ma+4, 0);
					flg++;
					nlapiLogExecution('DEBUG', 'BS Magnato Ensele item added ma - ',ma +', count-'+ count);
				}
				if (flg == 1){
					ma = ma + 2;
					count = count + 2;
				} else if (flg == 2){
					ma = ma + 4;
					count = count + 4;
				}
				flg = 0;
			}
		}
	}
	if ((executionContext != 'webservices' && orderSource == 1) && type == 'edit') {
		for (i = 1; i <= nlapiGetLineItemCount('item'); i++) {
			var isAhsSupplier = nlapiGetLineItemValue('item', 'custcol_po_vendor',i);
			if (parseInt(isAhsSupplier) == 16336 || parseInt(isAhsSupplier) == 25848 || parseInt(isAhsSupplier) == 26118 || parseInt(isAhsSupplier) == 38980 || parseInt(isAhsSupplier) == 39153 ){
				nlapiSetLineItemValue('item', 'custcol_create_po', i, '');
                if (parseInt(supp) == 16336 && itemtypeMa == 'InvtPart'){
						nlapiSetLineItemValue('item', 'location', i, 2);
						//nlapiLogExecution('DEBUG', ' Location set at line 1 - ',supp);
					}
				nlapiLogExecution('DEBUG', 'BS MA set create_po to null -',isAhsSupplier);
			}
		}
		nlapiSetFieldValue('custbody_ahs_last_line_number',i, true, true);
	}
	if ((executionContext != 'webservices' && orderSource != 1) && type == 'create') {
		//var currentContext = nlapiGetContext();
		//var executionContext = currentContext.getExecutionContext();
		var cust = nlapiGetFieldValue('entity');
		var custdept = nlapiLookupField('customer', cust,'custentity_cust_department');
		var esd = nlapiGetFieldValue('custbody_exp_ship_date_so');
		var department = nlapiGetFieldValue('department');
		//var lastLine = 0;
		if (department == '' || department == null) {
			nlapiSetFieldValue('department', custdept, true, true);
		}
		for (i = 1; i <= nlapiGetLineItemCount('item'); i++) {
			var item;
			var n = 0;
			item = nlapiGetLineItemValue('item', 'item', i);
			var itemtype = nlapiGetLineItemValue('item', 'itemtype', i);
			var qty = nlapiGetLineItemValue('item', 'quantity', i);
			var un = nlapiGetLineItemText('item', 'units', i);
			nlapiLogExecution('DEBUG', 'Before Submit -', i + ', item -' + item+ ', itemtype -' + itemtype);
			/*if (itemtype == 'NonInvtPart'&& (parseInt(item) == 252 || parseInt(item) == 253)) {
				nlapiSetLineItemValue('item', 'quantity', i, '1');
				if (parseInt(item) == 252) {
					nlapiSetLineItemValue('item', 'custcol9', i - 1,nlapiGetLineItemValue('item', 'custcol_po_vendor',i));
				}
			}*/
			if (itemtype == 'Group') {
				var units = nlapiGetLineItemText('item', 'units', i + 1);
				nlapiLogExecution('DEBUG', 'Before Submit - unit', i+ ', unit -' + units);
				nlapiSetLineItemValue('item', 'custcol4', i, units);
				n = 0;
				var houlier;
				for (var n = i; n <= i + 3; n++) {
					var sd = i;
					var gitem = parseInt(nlapiGetLineItemValue('item', 'item',n));
					var gitemtype = nlapiGetLineItemValue('item', 'itemtype', n);
					if (gitemtype == 'InvtPart' && nlapiGetLineItemValue('item', 'custcol_po_vendor', n) != nlapiGetLineItemValue('item', 'custcol_po_vendor', n+1)) {
						nlapiSetLineItemValue('item', 'custcol9', n ,nlapiGetLineItemValue('item', 'custcol_po_vendor',n+1));
						nlapiLogExecution('DEBUG', 'BS Create Houliar -', n +' hou -'+nlapiGetLineItemValue('item', 'custcol_po_vendor',n+1));
					}
					nlapiLogExecution('DEBUG', 'Group Item -', n + ', gitem -'+ gitem + ', gitemtype -' + gitemtype);
					if (gitem == 253) {
						var gitemdelivery = nlapiGetLineItemValue('item','custcol_special_delivery_type_so', n);
						nlapiLogExecution('DEBUG', 'Group Item SP-', n+ ', gitemdelivery-' + gitemdelivery);
						nlapiSetLineItemValue('item','custcol_special_delivery_type_so', sd,gitemdelivery);

					}
				}
			}
			if (itemtype != 'EndGroup') {
				var linedept = nlapiGetLineItemValue('item', 'department', i);
				var esdline = nlapiGetLineItemValue('item', 'expectedshipdate',i);
				var supp = nlapiGetLineItemValue('item', 'custcol_po_vendor',i);
				//var ahscost = nlapiGetLineItemValue('item', 'custcol_po_rate',i);
				//var avecost = nlapiGetLineItemValue('item','custcol_item_average_cost', i);
				nlapiLogExecution('DEBUG', 'Before Submit line dept -',linedept);
				nlapiSetLineItemValue('item', 'custcol_line_id_custom', i, i);
				if (parseInt(supp) == 16336 || parseInt(supp) == 25848 || parseInt(supp) == 26118 || parseInt(supp) == 38980 || parseInt(supp) == 39153 ){
					nlapiSetLineItemValue('item', 'custcol_create_po', i, '');
                    if (parseInt(supp) == 16336 && itemtype == 'InvtPart'){
						nlapiSetLineItemValue('item', 'location', i, 2);
						//nlapiLogExecution('DEBUG', ' Location set at line 1 - ',supp);
					}
				}
				if (linedept == null || linedept == '') {
					nlapiSetLineItemValue('item', 'department', i, custdept);
				}
				if (esdline == '' || esd != esdline) {
					nlapiSetLineItemValue('item', 'expectedshipdate', i, esd);
					nlapiLogExecution('DEBUG', 'Before Submit -', esdline);
				}
				if (itemtype == 'InvtPart') {
                  nlapiSetLineItemValue('item', 'costestimatetype', i,'CUSTOM');
					/*if (ahscost != null) {
						nlapiSetLineItemValue('item', 'costestimatetype', i,'CUSTOM');
						nlapiSetLineItemValue('item', 'costestimate', i,ahscost);
					} else if (ahscost == null || ahscost == '') {
						if (avecost != null) {
							nlapiSetLineItemValue('item', 'costestimatetype',i, 'CUSTOM');
							nlapiSetLineItemValue('item', 'costestimate', i,avecost);
						}
					}*/
					for (var k = i + 1; k <= i + 2; k++) {
						if (nlapiGetLineItemValue('item', 'item', k) == 252 && nlapiGetLineItemValue('item', 'custcol_po_vendor', i) != nlapiGetLineItemValue('item', 'custcol_po_vendor', k)) {
							nlapiLogExecution('DEBUG','Copy item to delivery create-', itemtype);
							nlapiSetLineItemValue('item', 'custcol1', k, item);
							nlapiSetLineItemValue('item', 'custcol2', k, qty);
							nlapiSetLineItemValue('item', 'custcol3', k, un);
						}
					}
				} else if (itemtype == 'NonInvtPart') {
                  nlapiSetLineItemValue('item', 'costestimatetype', i,'CUSTOM');
					/*if (ahscost != null) {
						nlapiSetLineItemValue('item', 'costestimatetype', i,'CUSTOM');
						nlapiSetLineItemValue('item', 'costestimate', i,ahscost);
					}*/
				}
			}
			//lastLine = i;
		}// End - Processing at line level
		nlapiSetFieldValue('custbody_ahs_last_line_number',i, true, true);
		nlapiLogExecution('DEBUG', 'Before Submit create line Id -', i);
	} // type create
	if ((executionContext != 'webservices' && orderSource != 1) && type == 'edit') {
		var lastLine = parseInt(nlapiGetFieldValue('custbody_ahs_last_line_number'))
		nlapiLogExecution('DEBUG', 'Before Submit edit last line before usr-', lastLine);
		var flag = 0;
		for (i = 1; i <= nlapiGetLineItemCount('item'); i++) {
			var item;
			item = nlapiGetLineItemValue('item', 'item', i);
			var itemtype = nlapiGetLineItemValue('item', 'itemtype', i);
			var qty = nlapiGetLineItemValue('item', 'quantity', i);
			var un = nlapiGetLineItemText('item', 'units', i);
			//var ahscost = nlapiGetLineItemValue('item', 'custcol_po_rate', i);
			//var avecost = nlapiGetLineItemValue('item','custcol_item_average_cost', i);
			nlapiLogExecution('DEBUG', 'Before Submit -', i + ', item -' + item+ ', itemtype -' + itemtype);
			/*if (itemtype == 'NonInvtPart'&& (parseInt(item) == 252 || parseInt(item) == 253)) {
				nlapiSetLineItemValue('item', 'quantity', i, '1');
				if (parseInt(item) == 252) {
					nlapiSetLineItemValue('item', 'custcol9', i - 1,nlapiGetLineItemValue('item', 'custcol_po_vendor',i));
				}
			}*/
			if (itemtype == 'Group') {
				n = 0;
				for (var n = i; n <= i + 3; n++) {
					var sd = i;
					var gitem = parseInt(nlapiGetLineItemValue('item', 'item',n));
					var gitemtype = nlapiGetLineItemValue('item', 'itemtype', n);
					if (gitemtype == 'InvtPart' && nlapiGetLineItemValue('item', 'custcol_po_vendor', n) != nlapiGetLineItemValue('item', 'custcol_po_vendor', n+1)) {
						nlapiSetLineItemValue('item', 'custcol9', n ,nlapiGetLineItemValue('item', 'custcol_po_vendor',n+1));
						nlapiLogExecution('DEBUG', ' BS Edit Houliar -', n +' hou -'+nlapiGetLineItemValue('item', 'custcol_po_vendor',n+1));
					} else if (gitemtype == 'InvtPart' && nlapiGetLineItemValue('item', 'custcol_po_vendor', n) == nlapiGetLineItemValue('item', 'custcol_po_vendor', n+1)) {
						nlapiSetLineItemValue('item', 'custcol9', n ,'');
					}
				}
			}
			if (itemtype == 'InvtPart') {
				if (nlapiGetLineItemValue('item', 'costestimatetype', i) != 'CUSTOM') {
					nlapiSetLineItemValue('item', 'costestimatetype', i,'CUSTOM');
				}
				for (var k = i + 1; k <= i + 2; k++) {
					if (nlapiGetLineItemValue('item', 'item', k) == 252 && nlapiGetLineItemValue('item', 'custcol_po_vendor', i) != nlapiGetLineItemValue('item', 'custcol_po_vendor', k)) {
						nlapiLogExecution('DEBUG','Copy item to delivery Edit-', itemtype);
						nlapiSetLineItemValue('item', 'custcol1', k, item);
						nlapiSetLineItemValue('item', 'custcol2', k, qty);
						nlapiSetLineItemValue('item', 'custcol3', k, un);
					} else if (nlapiGetLineItemValue('item', 'item', k) == 252 && nlapiGetLineItemValue('item', 'custcol_po_vendor', i) == nlapiGetLineItemValue('item', 'custcol_po_vendor', k)) {
						nlapiLogExecution('DEBUG','Copy item to delivery Edit-', itemtype);
						nlapiSetLineItemValue('item', 'custcol1', k, '');
						nlapiSetLineItemValue('item', 'custcol2', k, '');
						nlapiSetLineItemValue('item', 'custcol3', k, '');
					}
				}
			} else if (itemtype == 'NonInvtPart') {
				if (nlapiGetLineItemValue('item', 'costestimatetype', i) != 'CUSTOM') {
					nlapiSetLineItemValue('item', 'costestimatetype', i,'CUSTOM');
				}
			}
			if (itemtype != 'EndGroup'){
				var supp = nlapiGetLineItemValue('item', 'custcol_po_vendor',i);
				var lineItemId = nlapiGetLineItemValue('item', 'custcol_line_id_custom',i);
				if (parseInt(supp) == 16336 || parseInt(supp) == 25848 || parseInt(supp) == 26118 || parseInt(supp) == 38980 || parseInt(supp) == 39153){
					nlapiSetLineItemValue('item', 'custcol_create_po', i, '');
                    if (parseInt(supp) == 16336 && itemtype == 'InvtPart'){
						nlapiSetLineItemValue('item', 'location', i, 2);
						//nlapiLogExecution('DEBUG', ' Location set at line 1 - ',supp);
					}
				} else{
					if (parseInt(nlapiGetLineItemValue('item', 'custcol_create_po', i)) != 1 ){
						nlapiSetLineItemValue('item', 'custcol_create_po', i, 1);
					}
				}
				if ( lineItemId == null ){
					//lastLine ++;
					flag ++;
					nlapiSetLineItemValue('item', 'custcol_line_id_custom', i, lastLine);
					lastLine ++;
				}
			}
		} // for edit 
		if ( flag != 0 ){
			nlapiSetFieldValue('custbody_ahs_last_line_number',lastLine, true, true);
			nlapiLogExecution('DEBUG', 'Before Submit edit line Id -', lastLine+', i-'+i);
		}
	}
}

function afterSubmitSo(type) {
	var currentContext = nlapiGetContext();
	var executionContext = currentContext.getExecutionContext();
	nlapiLogExecution('DEBUG', 'After submit type -', type);
	var thisorderID = nlapiGetRecordId();
	var so = nlapiLoadRecord('salesorder', thisorderID);
	var orderSource = parseInt(so.getFieldValue('custbody_ahs_order_source'));
	if ((type == 'create' || type == 'edit') && (executionContext != 'webservices' && orderSource != 1)) {
		
		var poList = [];
		var tranIdList = [];
		var flag;
		var tranIdFlag;
		var allTranId='';
		var draft = so.getFieldValue('custbody_ahs_block_invoicing_so');
		var esd = so.getFieldValue('custbody_exp_ship_date_so');
		var dateCreated = nlapiStringToDate(so.getFieldValue('createddate'),'datetimetz');
		var scriptDate = nlapiStringToDate('02/02/2017 00:00:01 am','datetimetz');
		nlapiLogExecution('DEBUG', '1 Draft : datec ', dateCreated+', scriptDate-'+scriptDate);
		/*if (dateCreated > scriptDate){
			nlapiLogExecution('DEBUG', '2 Draft : datec ', dateCreated+', scriptDate-'+scriptDate+'True');
		} else if (dateCreated <= scriptDate){
			nlapiLogExecution('DEBUG', '3 Draft : datec ', dateCreated+', scriptDate-'+scriptDate+'else');
		}*/
		
		for (i = 1; i <= so.getLineItemCount('item'); i++)// Processing atline level
		{
			var item;
			flag = 0;
			tranIdFlag = 0;
			item = nlapiGetLineItemValue('item', 'item', i);
			var itemtype = so.getLineItemValue('item', 'itemtype', i);
			var ahscost = so.getLineItemValue('item', 'custcol_po_rate',i);
			var avecost = so.getLineItemValue('item','custcol_item_average_cost', i);
			if (itemtype == 'InvtPart') {
				if (ahscost != null) {
					//so.setLineItemValue('item', 'costestimatetype', i,'CUSTOM');
                  //so.commitLineItem('item');
					so.setLineItemValue('item', 'costestimaterate', i, ahscost);
					so.commitLineItem('item');
					nlapiLogExecution('DEBUG', 'AS ahs not null -', i +' item-'+item+', ahscost-'+ahscost+', avecost-'+avecost);
				} else if (ahscost == null ) {
					if (avecost != null) {
						//so.setLineItemValue('item', 'costestimatetype', i,'CUSTOM');
                      //so.commitLineItem('item');
						so.setLineItemValue('item', 'costestimaterate', i, avecost);
						so.commitLineItem('item');
						nlapiLogExecution('DEBUG', 'AS ahs null-', i +' item-'+item+', ahscost-'+ahscost+', avecost-'+avecost);
					}
				}
			} else if (itemtype == 'NonInvtPart') {
				if (ahscost != null) {
					//so.setLineItemValue('item', 'costestimatetype', i,'CUSTOM');
                  //so.commitLineItem('item');
					so.setLineItemValue('item', 'costestimaterate', i, ahscost);
					so.commitLineItem('item');
                  nlapiLogExecution('DEBUG', 'AS ahs null non inv-', i +' item-'+item+', ahscost-'+ahscost+', avecost-'+avecost);
				}
			}
			/*
			 * if (itemtype == 'NonInvtPart' && ( parseInt(item) == 252 ||
			 * parseInt(item) == 253 )){ so.setLineItemValue('item', 'quantity',
			 * i, '1'); }
			 */
			if (item != 0) {
				var createpo = so.getLineItemValue('item', 'custcol_create_po',i);
				var povendor = so.getLineItemValue('item', 'custcol_po_vendor',i);
				var porate = so.getLineItemValue('item', 'custcol_po_rate', i);

				if (createpo != null && type == 'create') {
					so.setLineItemValue('item', 'createpo', i, 'DropShip');
					so.setLineItemValue('item', 'povendor', i, povendor);
					so.setLineItemValue('item', 'porate', i, porate);
					so.commitLineItem('item');
					nlapiLogExecution('DEBUG', 'Line Create' + i + ', createpo-'+ createpo + ', povendor-' + povendor + ', porate-'+ porate);
				} 
				if (type == 'edit' && createpo != null && (povendor != so.getLineItemValue('item', 'povendor',i) || porate != so.getLineItemValue('item', 'porate',i))) {
					so.setLineItemValue('item', 'createpo', i, 'DropShip');
					so.setLineItemValue('item', 'povendor', i, povendor);
					so.setLineItemValue('item', 'porate', i, porate);
					so.commitLineItem('item');
					nlapiLogExecution('DEBUG', 'Line Edit not null' + i + ', createpo-'+ createpo + ', povendor-' + povendor + ', porate-'+ porate);
				} else if (createpo == null) {
					so.setLineItemValue('item', 'createpo', i, '');
					// so.setLineItemValue('item', 'povendor', i, );
					// so.setLineItemValue('item', 'porate', i, porate);
					so.commitLineItem('item');
					nlapiLogExecution('DEBUG', 'Line Edit null' + i + ', createpo-'+ createpo);
				}
				if (draft == 'T') {
					if (so.getLineItemValue('item', 'createpo', i)) {
						var ponum = so.getLineItemValue('item', 'poid', i);
						// nlapiLogExecution('DEBUG', 'ponum : ',ponum);
						for (var allPo = 0; allPo <= poList.length; allPo++) {
							// nlapiLogExecution('DEBUG', 'All ProcessedLoc :
							// ',poList);
							if (poList[allPo] == ponum) {
								flag = 1;
							}
						}
						if (flag == 0) {
							poList.push(ponum);
							// nlapiLogExecution('DEBUG', 'Po push' ,ponum);
						}
					}
				}
				if ( type == 'edit' ){
					var soItem    = so.getLineItemValue('item', 'item',i);
					var soUni     = so.getLineItemValue('item', 'units',i);
					var soAhsCost = so.getLineItemValue('item', 'custcol_po_rate',i);
					var soColAdd  = so.getLineItemValue('item', 'custcol_collection_address',i);
					var soColNam  = so.getLineItemValue('item', 'custcol_collection_address_name',i);
					var soSitCon  = so.getLineItemValue('item', 'custcol7',i);
					var soNot     = so.getLineItemValue('item', 'custcol_dspo_haulier_notes',i);
					var soQtyCol  = so.getLineItemValue('item', 'custcol2',i);
					var soUniCol  = so.getLineItemValue('item', 'custcol3',i);
					var soDes     = so.getLineItemValue('item', 'description',i);
					var soLineId  = so.getLineItemValue('item', 'custcol_line_id_custom',i);
					//nlapiLogExecution('DEBUG', 'SO Edit : ',i+', soUni-'+soUni+', soAhsCost-'+soAhsCost+', soColAdd-'+soColAdd+', soColNam-'+soColNam+', soSitCon-'+soSitCon+', soNot-'+soNot+', soQtyCol-'+soQtyCol+', soUniCol-'+soUniCol+', soDes-'+soDes+', poLineId-'+poLineId);
					if (so.getLineItemValue('item', 'createpo', i)) {
						var ponum = so.getLineItemValue('item', 'poid', i);
						nlapiLogExecution('DEBUG', 'ponum : ',ponum);
							 
						
						///app/accounting/transactions/purchord.nl?id=2043
						if ( ponum != null ){
							var thispo = nlapiLoadRecord('purchaseorder', ponum);
							
							if ( parseInt(soItem) == 252){
								var tranId = thispo.getFieldValue('tranid');
								for (var allTran = 0; allTran <= tranIdList.length; allTran++) {
									//nlapiLogExecution('DEBUG', 'All ProcessedTranId :',tranIdList);
									if (tranIdList[allTran] == tranId) {
										tranIdFlag = 1;
									}
								}
								if (tranIdFlag == 0) {
									tranIdList.push(tranId);
									allTranId = allTranId+tranId+', ';
									//allTranId= allTranId+ 'https://system.eu1.netsuite.com/app/accounting/transactions/purchord.nl?id='+ponum+', ';
									//nlapiLogExecution('DEBUG', 'PO TranId: ',i+', id-'+tranId);
								}
							}
							
							var flag2 = 0;
							var poEsd     = thispo.getFieldValue('custbody_exp_ship_date_so');
							if (esd != poEsd) {
								thispo.setFieldValue('custbody_exp_ship_date_so', esd);
								flag2 ++;
							}
							if (dateCreated >= scriptDate){
							for (j = 1; j <= thispo.getLineItemCount('item'); j++){ // processing po line level
								var poItem    = thispo.getLineItemValue('item', 'item',j);
								var poUni     = thispo.getLineItemValue('item', 'units',j);
								var poAhsCost = thispo.getLineItemValue('item', 'rate',j);
								var poColAdd  = thispo.getLineItemValue('item', 'custcol_collection_address',j);
								var poColNam  = thispo.getLineItemValue('item', 'custcol_collection_address_name',j);
								var poSitCon  = thispo.getLineItemValue('item', 'custcol7',j);
								var poNot     = thispo.getLineItemValue('item', 'custcol_dspo_haulier_notes',j);
								var poQtyCol  = thispo.getLineItemValue('item', 'custcol2',j);
								var poUniCol  = thispo.getLineItemValue('item', 'custcol3',j);
								var poDes     = thispo.getLineItemValue('item', 'description',j);
								var poLineId  = thispo.getLineItemValue('item', 'custcol_line_id_custom',j);
								var flag1 = 0;
								//nlapiLogExecution('DEBUG', 'PO Details : ',j+', poUni-'+poUni+', poAhsCost-'+poAhsCost+', poColAdd-'+poColAdd+', poColNam-'+poColNam+', poSitCon-'+poSitCon+', poNot-'+poNot+', poQtyCol-'+poQtyCol+', poUniCol-'+poUniCol+', poDes-'+poDes+', poLineId-'+poLineId);
							
								/*if (soItem == poItem && soUni != poUni){
									thispo.setLineItemValue('item', 'units', j, soUni);
								}*/
								if (soLineId == poLineId && soAhsCost != poAhsCost){
									thispo.setLineItemValue('item', 'rate', j, soAhsCost);
									flag1 ++;
									nlapiLogExecution('DEBUG', 'PO Edited : ',j+', poAhsCost-'+poAhsCost+', soAhsCost-'+soAhsCost);
								}
								if (soLineId == poLineId && soColAdd != poColAdd){
									thispo.setLineItemValue('item', 'custcol_collection_address', j, soColAdd);
									flag1 ++;
									nlapiLogExecution('DEBUG', 'PO Edited : ',j+', poColAdd-'+poColAdd+', soColAdd-'+soColAdd);
								}
								if (soLineId == poLineId && soColNam != poColNam){
									thispo.setLineItemValue('item', 'custcol_collection_address_name', j, soColNam);
									flag1 ++;
									nlapiLogExecution('DEBUG', 'PO Edited : ',j+', poColNam-'+poColNam+', soColNam-'+soColNam);
								}
								if (soLineId == poLineId && soSitCon != poSitCon){
									thispo.setLineItemValue('item', 'custcol7', j, soSitCon);
									flag1 ++;
									nlapiLogExecution('DEBUG', 'PO Edited : ',j+', poSitCon-'+poSitCon+', soSitCon-'+soSitCon);
								}
								if (soLineId == poLineId && soNot != poNot){
									thispo.setLineItemValue('item', 'custcol_dspo_haulier_notes', j, soNot);
									flag1 ++;
									nlapiLogExecution('DEBUG', 'PO Edited : ',j+', poNot-'+poNot+', soNot-'+soNot);
								}
								if (soLineId == poLineId && soQtyCol != poQtyCol){
									thispo.setLineItemValue('item', 'custcol2', j, soQtyCol);
									flag1 ++;
									nlapiLogExecution('DEBUG', 'PO Edited : ',j+', poQtyCol-'+poQtyCol+', soQtyCol-'+soQtyCol);
								}
								/*if (soLineId == poLineId && soUniCol != poUniCol){
									thispo.setLineItemValue('item', 'custcol3', j, soUniCol);
									flag1 ++;
								}*/
								if (soLineId == poLineId && soDes != poDes){
									thispo.setLineItemValue('item', 'description', j, soDes);
									flag1 ++;
									nlapiLogExecution('DEBUG', 'PO Edited : ',j+', poDes-'+poDes+', soDes-'+soDes);
								}
								if ( flag1 != 0 ){
									thispo.commitLineItem('item');
									flag2 ++;
									nlapiLogExecution('DEBUG', 'PO Line commited : ',j+', flag1-'+flag1);
								}
							}
							}
							if ( flag2 != 0 ){
								var poid = nlapiSubmitRecord(thispo, true);
								nlapiLogExecution('DEBUG', 'PO sumitted : ',poid+', flag2-'+flag2);
							}
						}
					}
				}
			} // End of if item
			// nlapiLogExecution('DEBUG', 'Draft for : ',draft);
		} // End of for
		if (draft == 'T') {
			for (var allPo = 0; allPo <= poList.length; allPo++) {
				if (poList[allPo] != null) {
					var po = nlapiLoadRecord('purchaseorder', poList[allPo]);
					po.setFieldValue('custbody_in_dispute_po', 'T');
					var poID = nlapiSubmitRecord(po, true);
					// nlapiLogExecution('DEBUG', 'PO ',poList[allPo]+', draft
					// -'+draft);
				}
			}
		}
		if( allTranId != ''){
			so.setFieldValue('custbody_ahs_po_num_inso', allTranId);
		}
	}
	if (( type == 'edit') && (executionContext != 'webservices' && orderSource == 1)) {
		
		for (i = 1; i <= so.getLineItemCount('item'); i++) {
			var createpo = so.getLineItemValue('item', 'custcol_create_po',i);
			var povendor = so.getLineItemValue('item', 'custcol_po_vendor',i);
			var porate = so.getLineItemValue('item', 'custcol_po_rate', i);

			if (type == 'edit' && createpo != null && (povendor != so.getLineItemValue('item', 'povendor',i) || porate != so.getLineItemValue('item', 'porate',i))) {
				so.setLineItemValue('item', 'createpo', i, 'DropShip');
				so.setLineItemValue('item', 'povendor', i, povendor);
				so.setLineItemValue('item', 'porate', i, porate);
				so.commitLineItem('item');
				nlapiLogExecution('DEBUG', 'Line Edit not null for Ma' + i + ', createpo-'+ createpo + ', povendor-' + povendor + ', porate-'+ porate);
			} else if (createpo == null || (parseInt(povendor) == 16336 || parseInt(povendor) == 25848 || parseInt(povendor) == 26118 || parseInt(povendor) == 38980 || parseInt(povendor) == 39153)) {
				so.setLineItemValue('item', 'createpo', i, '');
				// so.setLineItemValue('item', 'povendor', i, );
				// so.setLineItemValue('item', 'porate', i, porate);
				so.commitLineItem('item');
				nlapiLogExecution('DEBUG', 'Line Edit null for Ma' + i + ', createpo-'+ createpo+', povendor-'+povendor);
			}
		}
	}
	// Magento set purchase price to ahs cost to inventory items	Start
   if (( type == 'create') && (executionContext == 'webservices')) {
		for (var ci = 1; ci <= so.getLineItemCount('item'); ci++) {
			var maItmTyp = so.getLineItemValue('item', 'itemtype', ci);
			//var lstPoPrs = null;
			if (maItmTyp == 'InvtPart') {
				var maItem   = so.getLineItemValue('item', 'item',ci);
				var lstPoPrs = so.getLineItemValue('item', 'custcol_bb_ahs_cst_is',ci);
				/**if(!isNullOrEmpty(maItem)){
					lstPoPrs = nlapiLookupField('item', maItem,'lastpurchaseprice');
				}**/
				//if(!isNullOrEmpty(lstPoPrs)){
					so.setLineItemValue('item', 'custcol_po_rate', ci, lstPoPrs);
                    so.commitLineItem('item');
                    nlapiLogExecution('DEBUG', '***@@@ MA line111', ci + ', maItmTyp-'+ maItmTyp+', maItem-'+maItem+', lstPoPrs-'+lstPoPrs);
				//}
				//so.setLineItemValue('item', 'custcol_po_rate', ci, porate);
				//nlapiLogExecution('DEBUG', '*** MA line', ci + ', maItmTyp-'+ maItmTyp+', maItem-'+maItem+', lstPoPrs-'+lstPoPrs);
			}
		}
	}
   // Magento set purchase price to ahs cost to inventory items	Start
   
  /*
  // Get Employee Month total
   if (type == 'create' || type == 'edit') {
	   var monthTotal;
	   var salesrep    = so.getFieldValue('salesrep'); 
	   if(salesrep){
		   var saToVa;
		   var saToQt = new Array();
		   var salesorderSearch = nlapiSearchRecord("salesorder",null,
			   [
			      ["type","anyof","SalesOrd"], 
			      "AND", 
			      ["mainline","is","T"], 
			      "AND", 
			      ["status","noneof","SalesOrd:A","SalesOrd:C","SalesOrd:H"], 
			      "AND", 
			      ["custbody_exp_ship_date_so","within","thismonthtodate"], 
			      "AND", 
			      ["salesrep","anyof",salesrep]
			   ], 
			   [
			      saToQt[0] = new nlobjSearchColumn("netamountnotax",null,"SUM")
			   ]
			   );
	   
		   if(!isNullOrEmpty(salesorderSearch[0].getValue(saToQt[0])))		monthTotal = parseFloat(salesorderSearch[0].getValue(saToQt[0])).toFixed(2);
			
		   // monthTotal  = salesorderSearch[cr_i].getValue('netamountnotax',null,'sum');
		  // if(monthTotal){
			//   monthTotal = parseFloat(monthTotal).toFixed(2);
		   //}
		   
		   var empRec   = nlapiLoadRecord('employee', salesrep);
		   var target   = parseFloat(empRec.getFieldValue('custentity_bbs_sales_target_for_month'));
		   if(target){
			   empRec.setFieldValue('custentity_bbs_sales_target_to_go', target - monthTotal);
			   empRec.setFieldValue('custentitysales_actual_for_month', monthTotal);
			   nlapiLogExecution('DEBUG', 'Sales Rep target-', target + ', monthTotal-'+ monthTotal);
			   var empRecId = nlapiSubmitRecord(empRec, true);
		   }
		   
	   }
   }
  // Get Employee Month total
  */
  
	var soId = nlapiSubmitRecord(so, true);
}
function isNullOrEmpty(strVal){return(strVal == undefined || strVal == null || strVal === "");}
