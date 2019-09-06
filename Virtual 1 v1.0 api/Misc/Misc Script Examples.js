/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Sep 2019     cedricgriffiths
 *
 */
var today = new Date(2019, 8, 8);

var daysToSub = 3;


while(today.getDay() == 0 || today.getDay() == 6)
{
today.setDate(today.getDate() -1);
}

while(daysToSub > 0)
{
    today.setDate(today.getDate() -1);
    var dow = today.getDay();
    if(dow != 0 && dow != 6)
      {
         daysToSub --;
         
    
      }
     
}


var z = '';

function addWorkDays(startDate, days) 
{
    if(isNaN(days)) 
        {
            return
        }

    if(!(startDate instanceof Date)) 
        {
            return
        }

    // Get the day of the week as a number (0 = Sunday, 1 = Monday, .... 6 = Saturday)
    //
    var dow = startDate.getDay();
    var daysToAdd = parseInt(days);

    // If the current day is Sunday add one day
    //
    if (dow == 0)
        {
            daysToAdd++;
        }

    // If the start date plus the additional days falls on or after the closest Saturday calculate weekends
    //
    if (dow + daysToAdd >= 6) 
        {
            //Subtract days in current working week from work days
            //
            var remainingWorkDays = daysToAdd - (5 - dow);

            //Add current working week's weekend
            //
            daysToAdd += 2;

            if (remainingWorkDays > 5) 
                {
                    //Add two days for each working week by calculating how many weeks are included
                    //
                    daysToAdd += 2 * Math.floor(remainingWorkDays / 5);

                    //Exclude final weekend if remainingWorkDays resolves to an exact number of weeks
                    //
                    if (remainingWorkDays % 5 == 0)
                        {
                            daysToAdd -= 2;
                        }
                }
        }

    startDate.setDate(startDate.getDate() + daysToAdd);
    
    return startDate;
}

//And use it like so (months are zero based)
var today = new Date(2019, 8, 5);
today = addWorkDays(today, 2);

var z = '';

