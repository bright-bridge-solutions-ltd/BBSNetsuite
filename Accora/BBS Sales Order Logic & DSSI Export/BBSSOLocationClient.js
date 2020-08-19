/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2018     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function salesOrderLineInit(type) 
{
  var subsidiaryId = nlapiGetFieldValue('subsidiary');
  var location_header_field = 'location';
  var location_detail_field = 'inventorylocation';
  
  if(subsidiaryId == '7')
    {
      location_header_field = 'custpage_subsid_location';
    }
    
     var mainLocation = nlapiGetFieldValue(location_header_field);
     
     if(mainLocation) // if we have a location
       {
    	 	// get the subsidiary from the location record
    	 	var locationSubsidiary = getLocationSubsidiary(mainLocation);
    	 
    	 	nlapiSetCurrentLineItemValue('item', location_detail_field, mainLocation, true, true);
    	 	nlapiSetCurrentLineItemValue('item', 'inventorysubsidiary', locationSubsidiary, true, true);
       }
}

function salesOrderFieldChanged(type, name, linenum)
{
   if(type == null && (name == 'location' || name == 'custpage_subsid_location'))
     {
      var subsidiaryId = nlapiGetFieldValue('subsidiary');
      var location_header_field = 'location';
      var location_detail_field = 'inventorylocation';
      
      if(subsidiaryId == '7')
        {
          location_header_field = 'custpage_subsid_location';
          
          nlapiSetFieldValue('custbody_bbs_fulfil_location', nlapiGetFieldText(location_header_field), false, true);
        }
        
      var mainLocation = nlapiGetFieldValue(location_header_field);
      
      var lines = Number(nlapiGetLineItemCount('item'));
      
      if(lines != 0)
        {
          for (var int = 1; int <= lines; int++) 
            {
              nlapiSelectLineItem('item', int);
              nlapiSetCurrentLineItemValue('item', location_detail_field, mainLocation, true, true);
              nlapiCommitLineItem('item');
            }
        }
     }
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function SalesOrderValidateLine(type)
{
  var subsidiaryId = nlapiGetFieldValue('subsidiary');
  var location_header_field = 'location';
  var location_detail_field = 'inventorylocation';
  
  if(subsidiaryId == '7')
    {
      	location_header_field = 'custpage_subsid_location';
    }
  
  var mainLocation = nlapiGetFieldValue(location_header_field);
  
  var lineLocation = nlapiGetCurrentLineItemValue('item', location_detail_field);
  
  if (!lineLocation) // if lineLocation is empty
	  {
	  		if (mainLocation) // if we have a main location
	  			{
			  		nlapiSetCurrentLineItemValue('item', location_detail_field, mainLocation, true, true);
			  		return true;
	  			}
	  		else
	  			{
		  			alert("Please enter a value for location");
		            return false;
	  			}
	  }
  else
	  {
	  		return true;
	  }
  
  
  
  
    
  if (mainLocation)
  	{
	  	nlapiSetCurrentLineItemValue('item', location_detail_field, mainLocation, true, true);
	  	return true;
  	}
  else
	  {
		  alert("Please enter a value for location");
	      return false;
	  }

}

function salesOrderSaveRecord()
{
	var validated = true;
	
	var subsidiaryId = nlapiGetFieldValue('subsidiary');
	var formId = nlapiGetFieldValue('customform');
	
	if(subsidiaryId == '7' && formId == '151')
		{
			var location = nlapiGetFieldValue('custpage_subsid_location');
			
			if(location == null || location == '' || location == '0')
				{
					alert('Please provide a value for Cross Subsidiary Location');
					
					validated = false;
				}
		}

    return validated;
}

// =======================================
// FUNCTION TO GET THE LOCATION SUBSIDIARY
// =======================================

function getLocationSubsidiary(locationID)
{
	// declare and initialize variables
	var subsidiaryID = null;
	
	try
		{
			// load the location record
			var locationRecord = nlapiLoadRecord('location', locationID);
			
			// get the value of the subsidiary field from the location record
			subsidiaryID = locationRecord.getFieldValue('subsidiary');
		}
	catch(e)
		{
			nlapiLogExecution('ERROR', 'Error Loading Location Record', e);
		}
	
	return subsidiaryID;
}
