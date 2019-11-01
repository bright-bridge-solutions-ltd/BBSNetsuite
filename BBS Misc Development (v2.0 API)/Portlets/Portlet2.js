/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define([],

function() {
   
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
	    	params.portlet.title = 'My Portlet';
	        var content = '<table>';
	        content += '<tr style="height: 100px;"><td  style="width: 300px; background-color: #ff0000; color: #ffffff;">This is some data</td><td style="width: 300px; background-color: #33cc33; color: #ffffff;">This is other data</td></tr>';
	        content += '<tr style="height: 100px;"><td  style="width: 300px; background-color: #ffff00; color: #ffffff;">This is some data</td><td style="width: 300px; background-color: #0066ff; color: #ffffff;">This is other data</td></tr>';
	        content += '</table>';
	        params.portlet.html = content;
	    }

    return {
        render: render
    };
    
});
