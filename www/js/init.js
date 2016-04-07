// JavaScript Document
// PROJECT: Phonegap LocalNotifications
// AUTHOR: Drew Dahlman ( www.drewdahlman.com )
// DATE: 1.26.2012

/*
 NOTES:
 We will be creating LocalNotifications that can be set to fire while app is inactive,
 and create a callback for the JS to know when the app has come back from a notification.
 
 One thing that is deceptive about the LocalNotifications plugin is that when it shows a notification
 has been created it shows it based on the timezone +0000 which can throw you off.
 
 in the call for setting the notification we simply call notification.local_timed("13:00") - note that I supplied a string.
 
 The ability to set repeating notifications has been added!
 - daily
 - weekly
 - monthly
 - yearly
 
 
 */


// NOTIFICATION CENTER
/*
 I like to set up one object that's only job is to manage notifications
 */
var notification = {
init:function(){
    
},
    
	// This will fire after 60 seconds
	// This will fire based on the time provided.
	// Something to note is that the iPhone goes off of 24hr time
	// it defaults to no timezone adjustment so +0000 !IMPORTANT
custom_timed:function(dt,msg,almid,timeperiod){
    // the example time we provide is 13:00
    // This means the alarm will go off at 1pm +0000
    // how does this translate to your time? While the phone schedules 1pm +0000
    // it will still go off at your desired time base on your phones time.
    var sd;
    if(timeperiod == 1)
    {
        rpt = 'daily';
    }
    else if(timeperiod == 2)
    {
        rpt = 'alternatedays';
    }
    else if(timeperiod == 7)
    {
        rpt = 'weekly';
    }
    else if(timeperiod == 30)
    {
        rpt = 'monthly';
    }
     dt = new Date(dt);
    preferences = window.plugins.applicationPreferences;
    preferences.get("soundOption", function(value) {
                    soundOption = value; //console.log("SOUND OPTION IS"+soundOption);
                   if(soundOption == "off")
                    {
                    plugins.localNotification.add({
                                                  date: dt,
                                                  repeat:rpt,
                                                  message: msg,
                                                  hasAction: true,
                                                  badge: 1,
                                                  id: almid,
                                                  sound:'',
                                                  background:'app.background',
                                                  foreground:'app.running'
                                                  });
                    }
                    else
                    {
                    plugins.localNotification.add({
                                                  date: dt,
                                                  repeat:rpt,
                                                  message: msg,
                                                  hasAction: true,
                                                  badge: 1,
                                                  id: almid,
                                                  sound:'horn.caf',
                                                  background:'app.background',
                                                  foreground:'app.running'
                                                  });
                    }
                    }, function(error) {
                    console.log("Error! " + JSON.stringify(error));
                    });

    // Now lets make a new date
   // console.log("SD IS"+sd);
   
},

clear:function(id){
    console.log("clear notification"+id);
    plugins.localNotification.cancel(id);
},
tomorrow:function(hh,mm,days){
    // Now lets make a new date
    var d = new Date();
    d = d.setSeconds(00);
    d = new Date(d);
    d = d.setMinutes(mm);
    d = new Date(d);
    d = d.setHours(hh);
    d = new Date(d);
    
    // add a day
    d = d.setDate(d.getDate()+days);
    d = new Date(d);
    
    plugins.localNotification.add({
                                  date: d,
                                  repeat:'daily',
                                  message: 'This went off just as expected!',
                                  hasAction: true,
                                  badge: 1,
                                  id: '3',
                                  sound:'horn.caf',
                                  background:'app.background',
                                  foreground:'app.running'
                                  });
}
    
}

// APP
var app = {
bodyLoad:function(){
    document.addEventListener("deviceready", app.deviceReady, false);
},
deviceReady:function(){
    app.init();
},
init:function(){
    
},
background:function(id){
    console.log("I was in the background but i'm back now! ID="+id);
},
running:function(id){
    console.log("I am currently running, what should I do? ID="+id);
}
};