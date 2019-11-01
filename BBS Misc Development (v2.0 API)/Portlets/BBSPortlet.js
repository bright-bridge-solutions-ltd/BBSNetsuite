/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/serverWidget'],
/**
 * @param {search} search
 * @param {serverWidget} serverWidget
 */
function(search, serverWidget) {
   
    /**
     * Definition of the Portlet script trigger point.
     * 
     * @param {Object} params
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @Since 2015.2
     */
    function render(params) 
	    {
    		
    		var portlet = params.portlet;
    		var entityId = params.entity;
    		
    		portlet.title = 'My Portlet (Id = ' + entityId + ')';
    		//portlet.clientScriptFileId = '';
    		
    		var fld = portlet.addField({
                id: 'text',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Contact'
            });
    		
            fld.updateLayoutType({
                layoutType: 'normal'
            });
            
            fld.updateBreakType({
                breakType: 'startcol'
            });
            
            var fld2 = portlet.addField({
                id: 'inline',
                type: serverWidget.FieldType.INLINEHTML,
                label: ''
            });
            
            fld2.updateBreakType({
                breakType: 'startcol'
            });
            
            fld2.defaultValue = '<iframe src="https://debugger.na0.netsuite.com/app/common/search/searchresults.nl?searchtype=Contact&amp;Contact_COMPANY=11&amp;searchid=64"></iframe>';
            
    		var contactSearch = getResults(search.create({
    			   type: "contact",
    			   filters:
    			   [
    			      ["company","anyof",entityId]
    			   ],
    			   columns:
    			   [
    			      search.createColumn({
    			    	  					name: "entityid",
    			    	  					sort: search.Sort.ASC,
    			    	  					label: "Name"
    			      						})
    			   ]
    			}));

    		if(contactSearch != null && contactSearch.length > 0)
    			{
    				fld.addSelectOption({value: '', text: '', isSelected: true});
    				
    				for (var int = 0; int < contactSearch.length; int++) 
	    				{
    						var contactId = contactSearch[int].id;
    						var contactName = contactSearch[int].getValue('entityid');
    						
    						fld.addSelectOption({value: contactId, text: contactName, isSelected: false});
						}
    			}
    		
    		
	    }

    
    function getResults(_searchObject)
    {
    	var results = [];

    	var pageData = _searchObject.runPaged({pageSize: 1000});

    	for (var int = 0; int < pageData.pageRanges.length; int++) 
    		{
    			var searchPage = pageData.fetch({index: int});
    			var data = searchPage.data;
    			
    			results = results.concat(data);
    		}

    	return results;
    }
    
    return {
        render: render
    };
    
});
