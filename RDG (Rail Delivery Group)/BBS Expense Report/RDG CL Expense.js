/**
 * Module Description
 * 
 * Version    	Date            	Author          Remarks
 * 1.00       	16 Mar 2017     	krish			Initial version
 * 1.01      	22 Mar 2018			Suceen		   	Added Page Init and Line Init
 * 1.02			09 Jan 2020			sambatten		Amended postSourcing function to set tax code to Z:GB for ALL expense categories
 *
 */



 function expensePageInit(type){
	  var userDept = nlapiGetDepartment();  // id of the current user's department 
	  nlapiLogExecution('DEBUG', 'Employee Department pageinit:', userDept);
	  if(!CK_UTILS.isNullOrEmpty(userDept)) {
		  nlapiSetCurrentLineItemValue('expense', 'custcol_bb_depart_temp', userDept, true, true);
	  }
	   
}


function clientSaveRecord(){

    return true;
}


function clientValidateField(type, name, linenum){
   
    return true;
}


function clientFieldChanged(type, name, linenum){
 
}

//145 = standard
//13 = exempt
function postSourcing(type, name) {
	//alert('PS Cat -'+type+'nm-'+name);
	if(type == 'expense' && name == 'category'){
		
		// set the tax code to 147 (Z-GB)
		nlapiSetCurrentLineItemValue('expense', 'taxcode', 147, true, true);
		
		/*var cat = parseInt(nlapiGetCurrentLineItemValue('expense', 'category'));
		if (cat == 2){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 3){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 4){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 6){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 7){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 8){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 9){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 10){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 11){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 12){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 13){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 14){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 15){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 16){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 17){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 18){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 19){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 20){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 21){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 22){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 23){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 24){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 25){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 26){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 27){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 28){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 29){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 30){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 31){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 32){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 33){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 34){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 35){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 36){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 37){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 39){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		if (cat == 40){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 41){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 42){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 43){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 44){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 45){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 46){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 47){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 145, true, true);
			nlapiLogExecution('DEBUG','code', 145);

		}
		if (cat == 48){
			nlapiSetCurrentLineItemValue('expense', 'taxcode', 13, true, true);
			nlapiLogExecution('DEBUG','code', 13);

		}
		nlapiLogExecution('DEBUG','Location line init', cat);*/
		//alert('PS Cat -'+cat);
	}
	/*if(type=='expense' && name== 'expmediaitem'){
		var attachFile = nlapiGetCurrentLineItemValue('expense', 'expmediaitem');
		if ( attachFile == null){
			 alert('Please attach a file  -'+attachFile);
		 }
	}*/
		/*var department = nlapiGetFieldValue('department');
		var subsidiary = parseInt(nlapiGetFieldValue('subsidiary'));
		if(customercentre == 0 && subsidiary != 4)
			{
				var deflocation = nlapiGetFieldValue('custbody_so_master_location');
				var headerlocation = nlapiGetFieldValue('location');
				if(headerlocation == '' || headerlocation == null)
					{
						nlapiSetFieldValue('location', deflocation, true, true);
					}
				var linelocation = nlapiGetCurrentLineItemValue('item', 'location');
				if(headerlocation != linelocation)
					{
	  					nlapiSetCurrentLineItemValue('item', 'location', deflocation, true, true);
	  					nlapiLogExecution('DEBUG','Location line init', deflocation);
					}
		
			}
		nlapiSetCurrentLineItemValue('item', 'department', department, false, false);*/
   
}


function lineInit(type) {
	//var cat = nlapiGetCurrentLineItemValue('expense', 'category');
	//alert('Cat -'+cat);
	/*var department = nlapiGetFieldValue('department');
	nlapiSetCurrentLineItemValue('item', 'department', department, false, false); 
var deflocation = nlapiGetFieldValue('custbody_so_master_location');
var headerlocation = nlapiGetFieldValue('location');
	if(headerlocation == '' || headerlocation == null)
	{
		nlapiSetFieldValue('location', deflocation, true, true);
	}
var linelocation = nlapiGetCurrentLineItemValue('item', 'location');
	if(headerlocation != linelocation)
	{
	  nlapiSetCurrentLineItemValue('item', 'location', deflocation, true, true);
	  nlapiLogExecution('DEBUG','Location line init', deflocation);
	}*/
}


function expeselineInit(type) {
	var userDept = nlapiGetDepartment();
	nlapiLogExecution('DEBUG', 'Employee Department Lineinit:', userDept);
	nlapiSetCurrentLineItemValue('expense', 'custcol_bb_depart_temp', userDept, true, true);  
}


function validateLine(type){
	var attachFile = nlapiGetCurrentLineItemValue('expense', 'expmediaitem');
	var cat = parseInt(nlapiGetCurrentLineItemValue('expense', 'category'));
	if ( attachFile == '' && cat != 37){
		alert('Please attach a file');
		return false;
	}
	/*if (type == expense)
	var attachFile = nlapiGetLineItemValue('expense', 'expmediaitem');
	 if ( attachFile == null){
		 alert('Please attach a file  -'+attachFile);
	 }*/
    return true;
}


function clientRecalc(type){
 
}


function clientValidateInsert(type){
  
    return true;
}


function clientValidateDelete(type){
   
    return true;
}


var CK_UTILS = {};
CK_UTILS.isNullOrEmpty = function (stValue) {
    return (stValue == '') || (stValue == null) || (stValue == undefined);
};
