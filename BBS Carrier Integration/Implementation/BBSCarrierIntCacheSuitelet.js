/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/cache', 'N/http'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(serverWidget, cache, http) 
{
	const CACHE_NAME	= 'DPDCACHE';
	const CACHE_KEY		= 'DPD_GEO_SESSION';
	const CACHE_TTL		= 28800;				//Eight hours
	const CACHE_SCOPE	= cache.Scope.PUBLIC;
	
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) 
	    {
	    	if (context.request.method === http.Method.GET) 
		    	{
		    		//Create a form
	    			//
		            var form = serverWidget.createForm({
					                						title: 	'Clear DPD Cached Geosession Data'
					            						});
		            
		        			
					//Add columns to sublist
					//
		            var dataField = form.addField({
													id:		'custpage_cache_data',
													label:	'Current Cache Data',
													type:	serverWidget.FieldType.TEXT
													}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});			
											
		            //Get the cache instance or create one if it does not exist
					//
					var dpdCache = cache.getCache({
												    name:	CACHE_NAME,
												    scope: 	CACHE_SCOPE
													});
					
					if(dpdCache != null)
						{
							//Get the geosession from the cache, or create a new entry if the cache is empty or is new
							//
							var dpdGeoSession = dpdCache.get({
															key:	CACHE_KEY,
															ttl:	CACHE_TTL
														});
							
							var dpdGeoSessionObj = JSON.parse(dpdGeoSession);
							
							if(dpdGeoSessionObj != null && dpdGeoSessionObj.hasOwnProperty(CACHE_KEY))
								{
									dataField.defaultValue = dpdGeoSessionObj[CACHE_KEY];
								}
						}
					
					//Add a submit button
					//
					form.addSubmitButton({
										label: 'Clear Cache Data'
										});

		            //Return the form to the user
		            //
		            context.response.writePage(form);
		        } 
		    else 
		    	{
		    		var request = context.request;
		    		
		    		//Get the cache instance or create one if it does not exist
					//
					var dpdCache = cache.getCache({
												    name:	CACHE_NAME,
												    scope: 	CACHE_SCOPE
													});
					
					//Get the cache instance or create one if it does not exist
					//
					var dpdCache = cache.getCache({
												    name:	CACHE_NAME,
												    scope: 	CACHE_SCOPE
													});
					
					if(dpdCache != null)
						{
							//Get the geosession from the cache, or create a new entry if the cache is empty or is new
							//
							var dpdGeoSession = dpdCache.remove({
																key:	CACHE_KEY
																});
						}
		        }
	    }
    
    return {onRequest: onRequest};
});
