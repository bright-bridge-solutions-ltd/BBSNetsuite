/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Jan 2020     cedricgriffiths
 *
 */


function json2xml(o, tab) 
{
   var toXml = function(v, name, ind) 
      {
         var xml = "";

         if (v instanceof Array) 
            {
               for (var i=0, n=v.length; i<n; i++)
                  xml += ind + toXml(v[i], name, ind+"\t") + "\n";
            }
         else if (typeof(v) == "object") 
            {
               var hasChild = false;
               xml += ind + "<v5:" + name;

               for (var m in v) 
                  {
                     if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                     else
                        hasChild = true;
                  }
               xml += hasChild ? ">" : "/>";

               if (hasChild) 
                  {
                     for (var m in v) 
                        {
                           if (m == "#text")
                              xml += v[m];
                           else if (m.charAt(0) != "@")
                              xml += toXml(v[m], m, ind+"\t");
                        }
                     xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</v5:" + name + ">";
                  }

            }
         else 
            {
               xml += ind + "<v5:" + name + ">" + v.toString() +  "</v5:" + name + ">";
            }

         return xml;

      }

      var xml="";

   for (var m in o)
      xml += toXml(o[m], m, "");

   return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}


var a = {};

a.AuthenticationDetails = {};
a.AuthenticationDetails.VersionId = {};
a.AuthenticationDetails.VersionId.Major = '5';
a.AuthenticationDetails.VersionId.Minor = '0';
a.AuthenticationDetails.VersionId.Intermediate = '1';
a.AuthenticationDetails.UserID = 'cedric';
a.AuthenticationDetails.UserPassword = 'mypassword';

var RequestedShipment = {};
RequestedShipment.Recipient = 'aaa';
RequestedShipment.Shipment = 'ssssss';
RequestedShipment.Paypoint = 'ddddd';

a.Shipments = {};

a.Shipments.RequestedShipment = [];
a.Shipments.RequestedShipment[0] = RequestedShipment;
a.Shipments.RequestedShipment[1] = RequestedShipment;


var b = json2xml(a, '') 

var z = '';
