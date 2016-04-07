/* Helper functions for Medidoz */
function predicatBy(prop)
{
    return function(a, b)
    {
        if( a[prop] > b[prop])
        {
            return 1;
        }
        else if( a[prop] < b[prop] )
        {
            return -1;
        }
        return 0;
    }
}


function convertDoseOrderToEnglishOrdinalIndicator(order)
{
    switch (order)
    {
        case 1: 
            return "1st dose";
            break;
        case 2:
            return "2nd dose";
            break;
        case 3:
            return "3rd dose";
            break;
        case 4:
            return "4th dose;"
            break;
        case 5:
            return "5th dose";
            break;
    }
}


function convertToPeriodName(period)
{
    switch (period)
    {
        case 1:
            return "Every day";
            break;
        case 2:
            return "Every 2 days";
            break;
        case 7:
            return "Once a week";
            break;
        case 30:
            return "Once a month";
            break;
    }
}


function convertToMonthName(month)
{
    switch (month)
    {
        case 0:
            return "January";
            break;
        case 1:
            return "February";
            break;
        case 2:
            return "March";
            break;
        case 3:
            return "April";
            break;
        case 4:
            return "May";
            break;
        case 5:
            return "June";
            break;
        case 6:
            return "July";
        break;
        case 7:
            return "August";
            break;
        case 8:
            return "September";
            break;
        case 9:
            return "October";
            break;
        case 10:
            return "November";
            break;
        case 11:
            return "December";
            break;
    }
}


function convertToWeekdayName(weekday)
{
    switch (weekday)
    {
        case 0:
            return "Sunday";
            break;
        case 1:
            return "Monday";
            break;
        case 2:
            return "Tuesday";
            break;
        case 3:
            return "Wednesday";
            break;
        case 4:
            return "Thursday";
            break;
        case 5:
            return "Friday";
            break;
        case 6:
            return "Saturday";
            break;
    }
}


function isValidMl(val)
{
    if (val == null) 
    {
        return false;
    }
    if (val.length == 0 || val.length > 4) 
    {
        return false;
    }
    for (var i = 0; i < val.length; i++)
    {
        var ch = val.charAt(i)
        if (ch < "0" || ch > "9") 
        {
            return false;
        }
    }
    return true;
}

