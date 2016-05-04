var theDB;
            
var tmpCount;
var tmpHours;           
var tmpPeriod;

var tmpId;

var tmpName_;

var z;
var w;

var soundOption;
var vibrationOption;
//var lightsOption;

var preferences;

var alertMsg_;

var updateMode = false;


function onBodyLoad() {        
    document.addEventListener("deviceready", onDeviceReady, true);              
}


function onDeviceReady() {
    
    console.log("onDeviceReady fired");
    theDB = window.openDatabase("medidozDB", "1.0", "Medidoz DB", 3 * 1024 * 1024);
    if (theDB) 
    {
        theDB.transaction(createTable, onTxError, onTxSuccess);
    } 
    else 
    {
        console.log("theDB object has NOT been created");
    }
    

    $('.nativetimepicker').live('click', function() {
        var btn = $(this);
        var currentTime = btn.data("mytime"); 
        var myNewTime = null;
        
        myNewTime = new Date();
        myNewTime.setHours(currentTime.substr(0, 2));
        myNewTime.setMinutes(currentTime.substr(3, 2));
                                console.log("");
        window.plugins.datePicker.show({
            date : myNewTime,
            mode : 'time', // date or time or blank for both
            //allowOldDates : false
        }, function(returnVal) {
            var mynew = returnVal.toString();
            mynew = mynew.substr(16,2)+":"+mynew.substr(19,2);
            btn.data("mytime", mynew);
            btn.text(mynew);
            btn.button("refresh");
        });
    });
    
    
    $("#pageMedicines").on("pageshow", function(e) {
        listMedicines();
    });
    
    
    z = setInterval("showDate()", 300); 
    w = setInterval("listReminders()", 300);
                
    
    $("#pageReminders").on("pageshow", function(e) {            
        if (z == null)
        {
            z = setInterval("showDate()", 300);
        }
        if (w == null)
        {
            w = setInterval("listReminders()", 300);
        }   
    }); 
    
    
    $("#pageReminders").on("pagehide", function(e) {            
        if (z != null)
        {
            clearInterval(z);
            z = null;
        }
        if (w != null)
        {
            clearInterval(w);
            w = null;
        }
    });
    
    
    $("#pageAddMedicine").on("pagebeforeshow", function(e) {
        
        if (updateMode == true)
        {
            $("#btnSaveMedicine").text("Update");
            $("#btnSaveMedicine").button("refresh");
            getValues(sessionStorage.getItem("id"));
        }
        else
        {
            $("#btnSaveMedicine").text("Save");
            $("#btnSaveMedicine").button("refresh");
        }
    }); 

    soundOption = "on";
    vibrationOption = "on";
    //lightsOption = "on";

  // preferences = cordova.require("cordova/plugin/applicationpreferences");
    preferences = window.plugins.applicationPreferences;
    preferences.get("soundOption", function(value) {
        soundOption = value;
        }, function(error) {
            console.log("Error! " + JSON.stringify(error));
    });
    
    preferences.get("vibrationOption", function(value) {
        vibrationOption = value;
        }, function(error) {
            console.log("Error! " + JSON.stringify(error));
    });
    
//    preferences.get("lightsOption", function(value) {
//        lightsOption = value;
//        }, function(error) {
//            console.log("Error! " + JSON.stringify(error));
//    });
                
    $("#pageSettings").on("pageshow", function(e) {
        var switchSound = $("#flipSound");
        var switchVibration = $("#flipVibration");
        //var switchLights = $("#flipLights");
        if (soundOption == "off")
        {               
            switchSound[0].selectedIndex = 0;
        }
        else
        {
            switchSound[0].selectedIndex = 1;
        }
        if (vibrationOption == "off")
        {
            switchVibration[0].selectedIndex = 0;
        } 
        else
        {           
            switchVibration[0].selectedIndex = 1;
        }
//        if (lightsOption == "off")
//        {
//            switchLights[0].selectedIndex = 0;
//        }
//        else
//        {
//            switchLights[0].selectedIndex = 1;
//        }
        switchSound.slider("refresh");
        switchVibration.slider("refresh");
        //switchLights.slider("refresh");
    });
    
    
    //Google Analytics
    window.plugins.googleAnalyticsPlugin.startTrackerWithAccountID("UA-37532539-2",
            function() {console.log("Google Analytics plug-in starts: success");}, 
            function() {console.log("Google Analytics plug-in starts: failure");}
    );
        
}


function createTable(tx) {
    var sqlStr = 'CREATE TABLE IF NOT EXISTS MEDICINE (id INTEGER PRIMARY KEY, dateSaved INTEGER,'
        + ' medicineName TEXT NOT NULL, medicineType TEXT NOT NULL, medicineDosage TEXT NOT NULL,'
        + ' medicineDailyTakeCount INTEGER NOT NULL, medicineTakeHours TEXT NOT NULL,'
        + ' medicineTakePeriod INTEGER NOT NULL)';
    tx.executeSql(sqlStr, [], onSqlSuccess, onSqlError);
}


function onSqlSuccess(tx, res) {
    if(res)
    {
     //console.log("Inside create table success");
    }
}


function onSqlError(tx, err) {
    var msgText;
    if(err) 
    {
        msgText = "SQL: " + err.message + " (" + err.code + ")";
    } 
    else 
    {
        msgText = "SQL: Unknown error";
    }
    console.error(msgText);
    alert(msgText);
}


function onTxError(tx, err) {
    var msgText;
    if(err) {
        msgText = "TX: " + err.message + " (" + err.code + ")";
    } 
    else {
        msgText = "TX: Unknown error";
    }
    console.error(msgText);
    alert(msgText);
}


function onTxSuccess() {
    //console.log("TX: success");
}


function listReminders()
{
    var sqlStr = "SELECT id, dateSaved, medicineName, medicineDailyTakeCount, medicineTakeHours, " 
        + "medicineTakePeriod FROM MEDICINE ORDER BY id DESC";
    theDB.transaction(function(tx) { 
        tx.executeSql(sqlStr, [], onQuerySuccess_listReminders, onQueryFailure);
    }, onTxError, onTxSuccess);         
}


function onQuerySuccess_listReminders(tx, results) {
    if (results.rows) {
        var len = results.rows.length;
        if (len > 0) {
            var jsonArray = [];
            //$("#noReminders").hide();
            $("#listReminders").empty();
//            $("#listReminders").show(); 
            document.getElementById("listReminders").style.display = "block";
            document.getElementById("noReminders").style.display = "none";
            $.each(results.rows, function(index) {
                var row = results.rows.item(index);
                var count = row['medicineDailyTakeCount'];
                for (var i = 0; i < count; i++)
                {
                    var tmpHour;
                    if (i == 0)
                    {
                        tmpHour = row['medicineTakeHours'].substr(0, 5);
                    }
                    if (i == 1)
                    {
                        tmpHour = row['medicineTakeHours'].substr(6, 5);
                    }
                    if (i == 2)
                    {
                        tmpHour = row['medicineTakeHours'].substr(12, 5);
                    }
                    if (i == 3)
                    {
                        tmpHour = row['medicineTakeHours'].substr(18, 5);
                    }
                    if (i == 4)
                    {
                        tmpHour = row['medicineTakeHours'].substr(24, 5);
                    }
                    jsonArray.push({medicineName : row['medicineName'], takeHour: tmpHour, dosageNo: i + 1,
                        dateSaved: row['dateSaved'], medicineTakePeriod: row['medicineTakePeriod'] });  
                }
            });
            
            jsonArray.sort(predicatBy("takeHour"));
            
            $(jsonArray).each(function(index){
                var htmlToAppend;
                var today = new Date();
                var mins = today.getMinutes();
                var mins_;
                var hours = today.getHours();
                var hours_;
                if (mins < 10)
                {
                    mins_ = "0" + mins.toString();
                }
                else
                {
                    mins_ = mins.toString();
                }
                if (hours < 10)
                {
                    hours_ = "0" + hours.toString();
                }
                else
                {
                    hours_ = hours.toString();
                }
                var currentTimeStr = hours_ + ":" + mins_;
                
                var period = this.medicineTakePeriod;
                if (parseInt(period) > 1)
                {
                    var day1 = today.getDate();
                    var month1 = today.getMonth();
                    var year1 = today.getFullYear(); 
                    var dateToday = new Date(year1, month1, day1);
                    
                    var dateSaved_ = new Date(this.dateSaved);
                    var day2 = dateSaved_.getDate();
                    var month2 = dateSaved_.getMonth();
                    var year2 = dateSaved_.getFullYear();
                    var dateSaved = new Date(year2, month2, day2);
                    
                    var diffDays = (dateToday - dateSaved) / (1000 * 3600 * 24);
                    //console.log("diffDays: " + diffDays);
                    if ((diffDays % period) == 0)
                    {
                        if (currentTimeStr > this.takeHour)
                        {
                            htmlToAppend = "<li><span style=\"color: #d3d3d3;\">" + this.takeHour 
                            + " " + this.medicineName + " - " + convertDoseOrderToEnglishOrdinalIndicator(this.dosageNo) 
                            + "</span></li>"
                        }
                        else
                        {
                            htmlToAppend = "<li>" + this.takeHour + " " + this.medicineName + " - " 
                                + convertDoseOrderToEnglishOrdinalIndicator(this.dosageNo) + "</span></li>";
                        }
                    } 
                }
                else
                {
                    if (currentTimeStr > this.takeHour)
                    {
                        htmlToAppend = "<li><span style=\"color: #d3d3d3;\">" + this.takeHour 
                        + " " + this.medicineName + " - " + convertDoseOrderToEnglishOrdinalIndicator(this.dosageNo) 
                        + "</span></li>"
                    }
                    else
                    {
                        htmlToAppend = "<li>" + this.takeHour + " " + this.medicineName + " - " 
                        + convertDoseOrderToEnglishOrdinalIndicator(this.dosageNo) + "</span></li>";
                    }
                }

                $("#listReminders").append(htmlToAppend);
            });
            
            $("#listReminders").listview("refresh");                            
        }
        else
        {
            //$("#noReminders").show();
            document.getElementById("noReminders").style.display = "block";
            //$("#listReminders").hide();
            document.getElementById("listReminders").style.display = "none";
        }   
    }
    else
    {
        alert("No records match selection criteria.");
    }
}


function showDate()
{
    var today = new Date();
    
    var mins = today.getMinutes();
    var mins_;
    var hours = today.getHours();
    var hours_;
    if (mins < 10)
    {
        mins_ = "0" + mins.toString();
    }
    else
    {
        mins_ = mins.toString();
    }
    if (hours < 10)
    {
        hours_ = "0" + hours.toString();
    }
    else
    {
        hours_ = hours.toString();
    }
    
    document.getElementById("lblToday").innerHTML = today.getDate() + " " 
        + convertToMonthName(today.getMonth()) + " " + convertToWeekdayName(today.getDay()) 
        + "<BR />" + hours_ + ":" + mins_;
}

 
function addMedicine() {
    updateMode = false;
    $.mobile.changePage($("#pageAddMedicine"));
    resetControls();
}


function resetControls() {
    $("#medicineName").val("");
    $("input:radio[name=rcMedicineType]").each(function () {
        if ($(this).val() == "0") {
            $(this).prop("checked", true);
            return false;
        }
    });
    $("input:radio[name=rcMedicineType]").checkboxradio("refresh");
    document.getElementById("divMedicineType0Dosage").style.display = "none";
    document.getElementById("divMedicineType1Dosage").style.display = "none";
    document.getElementById("divMedicineType2Dosage").style.display = "none";
    document.getElementById("divMedicineType3Dosage").style.display = "none";
    document.getElementById("divMedicineType4Dosage").style.display = "none";
    document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";
    document.getElementById("divMedicineType0Dosage").style.display = "block";
    $("input:radio[name=rcMedicineType0Dosage]").each(function () {
        if ($(this).val() == "0") {
            $(this).prop("checked", true);
            return false;
        }
    });
    $("input:radio[name=rcMedicineType0Dosage]").checkboxradio("refresh");
    
    $("input:radio[name=rcMedicineType1Dosage]").each(function () {
        if ($(this).val() == "0") {
            $(this).prop("checked", true);
            return false;
        }
    });
    $("input:radio[name=rcMedicineType1Dosage]").checkboxradio("refresh");    
    $('input[name=ml]').val("");    
    var dtc = $("#dailyTakeCount");             
    dtc.val("2").prop("selected", true).siblings("option").removeAttr("selected");
    dtc.selectmenu("refresh", true);                
    document.getElementById("divMedicineTakeHours").innerHTML = '';
    var div0 = document.createElement("div");
    div0.setAttribute("id", "divMedicineTakeHour0");
    div0.setAttribute("style", "display: inline-block; margin-right: 10px;");
    var button0 = document.createElement("button");
    button0.setAttribute("id", "btnMedicineTakeHour0");
    button0.setAttribute("value", "08:00");
    button0.setAttribute("data-mytime", "08:00");
    button0.setAttribute("class", "nativetimepicker");
    var div1 = document.createElement("div");
    div1.setAttribute("id", "divMedicineTakeHour1");
    div1.setAttribute("style", "display: inline-block; margin-right: 10px;");
    var button1 = document.createElement("button");
    button1.setAttribute("id", "btnMedicineTakeHour1"); 
    button1.setAttribute("value", "20:00");
    button1.setAttribute("data-mytime", "20:00");                       
    button1.setAttribute("class", "nativetimepicker");  
    div0.appendChild(button0);
    div1.appendChild(button1);
    document.getElementById("divMedicineTakeHours").appendChild(div0);
    document.getElementById("divMedicineTakeHours").appendChild(div1);
    $("#divMedicineTakeHours").trigger('create');    
    $("#rcMedicineTakePeriod0").prop("checked", true).checkboxradio("refresh");
    $("#rcMedicineTakePeriod1").prop("checked", false).checkboxradio("refresh");
    $("#rcMedicineTakePeriod2").prop("checked", false).checkboxradio("refresh");
    $("#rcMedicineTakePeriod3").prop("checked", false).checkboxradio("refresh");   
    $("#piecesPerTake_Type2").val("1").prop("selected", false).siblings("option").removeAttr("selected");
    $("#piecesPerTake_Type3").val("1").prop("selected", false).siblings("option").removeAttr("selected");
    $("#piecesPerTake_Type4").val("1").prop("selected", false).siblings("option").removeAttr("selected");
    $("#piecesPerTake").val("3").prop("selected", true).siblings("option").removeAttr("selected");
    $("#piecesPerTake_Type2").selectmenu("refresh", true);
    $("#piecesPerTake_Type3").selectmenu("refresh", true);
    $("#piecesPerTake_Type4").selectmenu("refresh", true);
    $("#piecesPerTake").selectmenu("refresh", true);
}

        
function saveMedicine() {
    if (validateControls())
    {
        theDB.transaction(insertOrUpdateRecord, onTxError, onTxSuccess);
    }
    else
    {
        alert(alertMsg_);
        return;
    }               
    $.mobile.changePage($("#pageMedicines"));
}


function validateControls()
{
    var medName = $("#medicineName").val();
                    
    if (medName == "")
    {
        alertMsg_ = "Please enter the name of the medicine";
        return false;
    }
    else if (medName.length < 2)
    {
        alertMsg_ = "Medicine name must consist of minumum 2 characters";
        return false;
    }
    
    var medType = $('input[name=rcMedicineType]:checked').val();        
    if (medType == 1)
    {
        var dosageType = $('input[name=rcMedicineType1Dosage]:checked').val();
        if (dosageType == 0)
        {
            var ml = $('input[name=ml]').val();
            if (isValidMl(ml))
            {
                return true;
            }
            else
            {
                alertMsg_ = "Please enter a valid ml value";
                return false;
            }               
        }
        return true;
    }
    return true;
}


function insertOrUpdateRecord(tx) {
    var tmpName = $("#medicineName").val();
    tmpName_ = tmpName.toUpperCase();
    
    var tmpType = $('input[name=rcMedicineType]:checked').next().text();
    
    var tmpDosage;
    var indexType = $('input[name=rcMedicineType]:checked').val();
    
    switch (indexType)
    {
        case "0":
            if ($('input[name=rcMedicineType0Dosage]:checked').val() == 4)
            {
                tmpDosage = $("#piecesPerTake").val() + ' tablets';
            }
            else
            {
                tmpDosage = $('input[name=rcMedicineType0Dosage]:checked').next().text();
            }
            break;
        case "1":
            if ($('input[name=rcMedicineType1Dosage]:checked').val() == 0)
            {
                tmpDosage = $('input[name=ml]').val() + ' ml';
            }
            else
            {
                if ($('input[name=rcMedicineType1Dosage1]:checked').val() == 4)
                {
                    tmpDosage = $("#piecesPerTake").val() + ' spoons';
                }
                else
                {
                    tmpDosage = $('input[name=rcMedicineType1Dosage1]:checked').next().text();
                }                        
            }
            break;
        case "2":
            tmpDosage = $("#piecesPerTake_Type2").val() + " drops";
            break;
        case "3":
            tmpDosage = $("#piecesPerTake_Type3").val() + " shots";
            break;
        case "4":
            tmpDosage = $("#piecesPerTake_Type4").val() + " pieces";
            break;
    }
    
    var tmpDailyTakeCount = $("#dailyTakeCount").val();
    var tmpDailyTakeHours;
    
    tmpDailyTakeHours = $("#btnMedicineTakeHour0").data("mytime");  
    for (var i = 1; i < tmpDailyTakeCount; i++)
    {
        tmpDailyTakeHours += "-" + $("#btnMedicineTakeHour" + i).data("mytime");
    }   
    
    tmpPeriod = $('input[name=rcMedicineTakePeriod]:checked').val();
    
    switch (tmpPeriod)
    {
        case "0":
            tmpPeriod = 1;
            break;
        case "1":
            tmpPeriod = 2;
            break;
        case "2":
            tmpPeriod = 7;
            break;
        case "3":
            tmpPeriod = 30;
            break;
    }
    
    tmpDateSaved = new Date();                  
    tmpCount = tmpDailyTakeCount;
    tmpHours = tmpDailyTakeHours;
    
    var sqlStr;
    if (updateMode) {
        var id = sessionStorage.getItem("id");
        sqlStr = "UPDATE MEDICINE SET medicineName = '" + tmpName.toUpperCase() + "', medicineType = '" + tmpType 
            + "', medicineDosage = '" + tmpDosage + "', medicineDailyTakeCount = '" + tmpDailyTakeCount 
            + "', medicineTakeHours = '" + tmpDailyTakeHours + "', medicineTakePeriod = '" + tmpPeriod 
            + "' WHERE id = '" + id +"'";
        //Instead of checking the count of daily takes, simply delete all possible alarm id's.
        for (var i = 0; i < tmpCount; i++)
        {
            var notificationId = (id * 100) + i;
            //window.plugins.localNotification.cancel(notificationId.toString());
            notification.clear(notificationId.toString());
        }
        tx.executeSql(sqlStr, [], onSqlSuccess_insertOrUpdateRecord, onSqlError);
    }
    else {
        sqlStr = 'INSERT INTO MEDICINE (dateSaved, medicineName, medicineType, medicineDosage,'
            + ' medicineDailyTakeCount, medicineTakeHours, medicineTakePeriod) VALUES (?, ?, ?, ?, ?, ?, ?)';
        tx.executeSql(sqlStr, [tmpDateSaved, tmpName.toUpperCase(), tmpType, tmpDosage, tmpDailyTakeCount, tmpDailyTakeHours, tmpPeriod], 
            onSqlSuccess_insertOrUpdateRecord, onSqlError);
    }
        
} 


function onSqlSuccess_insertOrUpdateRecord(tx, res) {
    var id;
    if (updateMode) {
        id = sessionStorage.getItem("id");
    }
    else {
        id = res.insertId;
        
        window.plugins.googleAnalyticsPlugin.trackEvent("User", "Add medicine", tmpName_, 1, function(){console.log("Track: add medicine: success");}, function(){console.log("Track: add medicine: failure");});
    }
    for (var i = 0; i < tmpCount; i++)
    {
        if (tmpCount == 1)
        {
            var alarmId = (id * 100) + 1;
            tmpDate0 = new Date();
            tmpDate0.setHours(tmpHours.substr(0, 2));
            tmpDate0.setMinutes(tmpHours.substr(3, 2));
            
            tmpDate0 = new Date(tmpDate0);
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate0);
            if (typeof plugins !== "undefined") {
            var msg =  "Medidoz - Pill Reminder\r\n" + tmpHours.substr(0, 2) + ":"+ tmpHours.substr(3, 2) + " " + tmpName_ + " - 1st dose";
                notification.custom_timed(tmpDate0,msg,alarmId,tmpPeriod);
            }
        }

        
        if (tmpCount == 2)
        {
            var alarmId = (id * 100) + 1;
            var tmpDate0 = new Date();
            
            tmpDate0.setHours(tmpHours.substr(0, 2));
            tmpDate0.setMinutes(tmpHours.substr(3, 2));

            tmpDate0 = new Date(tmpDate0);
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate0);
            if (typeof plugins !== "undefined") {
                var msg =  "Medidoz - Pill Reminder\r\n" + tmpHours.substr(0, 2) + ":"+ tmpHours.substr(3, 2) + " " + tmpName_ + " - 1st dose";
                notification.custom_timed(tmpDate0,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 2;
            var tmpDate1 = new Date();
            tmpDate1.setHours(tmpHours.substr(6, 2));
            tmpDate1.setMinutes(tmpHours.substr(9, 2));
            tmpDate1 = new Date(tmpDate1);
           
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate1);
            if (typeof plugins !== "undefined") {
                var msg =  "Medidoz - Pill Reminder\r\n" + tmpHours.substr(56, 2) + ":"+ tmpHours.substr(59, 2) + " " + tmpName_ + " - 2nd dose";
                notification.custom_timed(tmpDate1,msg,alarmId,tmpPeriod);
            }
        }
        if (tmpCount == 3)
        {
            var alarmId = (id * 100) + 1;
            var tmpDate0 = new Date();
            tmpDate0.setHours(tmpHours.substr(0, 2));
            tmpDate0.setMinutes(tmpHours.substr(3, 2));
            tmpDate0 = new Date(tmpDate0);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate0);
            if (typeof plugins !== "undefined") {
                var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(0, 2) + ":"+ tmpHours.substr(3, 2) + " " + tmpName_ + " - 1st dose"; 
                notification.custom_timed(tmpDate0,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 2;
            var tmpDate1 = new Date();
            tmpDate1.setHours(tmpHours.substr(6, 2));
            tmpDate1.setMinutes(tmpHours.substr(9, 2));
            tmpDate1 = new Date(tmpDate1);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate1);
            if (typeof plugins !== "undefined") {
               var msg ="Medidoz - Pill Reminder\r\n" + tmpHours.substr(6, 2) + ":"+ tmpHours.substr(9, 2) + " " + tmpName_ + " - 2nd dose";
               notification.custom_timed(tmpDate1,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 3;
            var tmpDate2 = new Date();
            tmpDate2.setHours(tmpHours.substr(12, 2));
            tmpDate2.setMinutes(tmpHours.substr(15, 2));
            tmpDate2 = new Date(tmpDate2);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate2);
            if (typeof plugins !== "undefined") {
            var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(12, 2) + ":"+ tmpHours.substr(15, 2) + " " + tmpName_ + " - 3rd dose";
            notification.custom_timed(tmpDate2,msg,alarmId,tmpPeriod);
            }
        }   
        if (tmpCount == 4)
        {
            var alarmId = (id * 100) + 1;
            var tmpDate0 = new Date();
            tmpDate0.setHours(tmpHours.substr(0, 2));
            tmpDate0.setMinutes(tmpHours.substr(3, 2));
            tmpDate0 = new Date(tmpDate0);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate0);
            if (typeof plugins !== "undefined") {
            var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(0, 2) + ":"+ tmpHours.substr(3, 2) + " " + tmpName_ + " - 1st dose";
            notification.custom_timed(tmpDate0,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 2;
            var tmpDate1 = new Date();
            tmpDate1.setHours(tmpHours.substr(6, 2));
            tmpDate1.setMinutes(tmpHours.substr(9, 2));
            tmpDate1 = new Date(tmpDate1);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate1);
            if (typeof plugins !== "undefined") {
                var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(6, 2) + ":"+ tmpHours.substr(9, 2) + " " + tmpName_ + " - 2nd dose";
                    notification.custom_timed(tmpDate1,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 3;
            var tmpDate2 = new Date();
            tmpDate2.setHours(tmpHours.substr(12, 2));
            tmpDate2.setMinutes(tmpHours.substr(15, 2));
            tmpDate2 = new Date(tmpDate2);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate2);
            if (typeof plugins !== "undefined") {
               var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(12, 2) + ":"+ tmpHours.substr(15, 2) + " " + tmpName_ + " - 3rd dose"; 
                notification.custom_timed(tmpDate2,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 4;
            var tmpDate3 = new Date();
            tmpDate3.setHours(tmpHours.substr(18, 2));
            tmpDate3.setMinutes(tmpHours.substr(21, 2));
            tmpDate3 = new Date(tmpDate3);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate3);
            if (typeof plugins !== "undefined") {
               var msg= "Medidoz - Pill Reminder\r\n" + tmpHours.substr(18, 2) + ":"+ tmpHours.substr(21, 2) + " " + tmpName_ + " - 4th dose";
                    notification.custom_timed(tmpDate3,msg,alarmId,tmpPeriod);
            }
        }
        if (tmpCount == 5)
        {
            var alarmId = (id * 100) + 1;
            var tmpDate0 = new Date();
            tmpDate0.setHours(tmpHours.substr(0, 2));
            tmpDate0.setMinutes(tmpHours.substr(3, 2));
            tmpDate0 = new Date(tmpDate0);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate0);
            if (typeof plugins !== "undefined") {
                var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(0, 2) + ":"+ tmpHours.substr(3, 2) + " " + tmpName_ + " - 1st dose";
                    notification.custom_timed(tmpDate0,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 2;
            var tmpDate1 = new Date();
            tmpDate1.setHours(tmpHours.substr(6, 2));
            tmpDate1.setMinutes(tmpHours.substr(9, 2));
            tmpDate1 = new Date(tmpDate1);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate1);
            if (typeof plugins !== "undefined") {
               var msg ="Medidoz - Pill Reminder\r\n" + tmpHours.substr(6, 2) + ":"+ tmpHours.substr(9, 2) + " " + tmpName_ + " - 2nd dose";
                   notification.custom_timed(tmpDate1,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 3;
            var tmpDate2 = new Date();
            tmpDate2.setHours(tmpHours.substr(12, 2));
            tmpDate2.setMinutes(tmpHours.substr(15, 2));
            tmpDate2 = new Date(tmpDate2);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate2);
            if (typeof plugins !== "undefined") {
               var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(12, 2) + ":"+ tmpHours.substr(15, 2) + " " + tmpName_ + " - 3rd dose";
                notification.custom_timed(tmpDate2,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 4;
            var tmpDate3 = new Date();
            tmpDate3.setHours(tmpHours.substr(18, 2));
            tmpDate3.setMinutes(tmpHours.substr(21, 2));
            tmpDate3 = new Date(tmpDate3);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate3);
            if (typeof plugins !== "undefined") {
               var msg = "Medidoz - Pill Reminder\r\n" + tmpHours.substr(18, 2) + ":"+ tmpHours.substr(21, 2) + " " + tmpName_ + " - 4th dose";
                    notification.custom_timed(tmpDate3,msg,alarmId,tmpPeriod);
            }
            
            var alarmId = (id * 100) + 5;
            var tmpDate4 = new Date();
            tmpDate4.setHours(tmpHours.substr(24, 2));
            tmpDate4.setMinutes(tmpHours.substr(27, 2));
            tmpDate4 = new Date(tmpDate4);
            
            console.log("alarmId: " + alarmId + ", " + "date to be added as alarm: " + tmpDate4);
            if (typeof plugins !== "undefined") {
               var msg= "Medidoz - Pill Reminder\r\n" + tmpHours.substr(24, 2) + ":"+ tmpHours.substr(27, 2) + " " + tmpName_ + " - 5th dose";
                    notification.custom_timed(tmpDate4,msg,alarmId,tmpPeriod);
            }
        }
    }
}


//function onSqlSuccess_updateRecord(tx, res) {    
//    console.log("record with id " + sessionStorage.getItem("id") + " updated");
//}
            

function deleteMedicine(id) {
    var answer = confirm("Are you that you want to delete the medicine?");              
    if (answer)
    {
        tmpId = id;
        var sqlStr = "DELETE FROM MEDICINE WHERE id = " + id;
        theDB.transaction(function(tx) { 
            tx.executeSql(sqlStr, [], onDeleteSuccess, onSqlError);
        }, onTxError, onTxSuccess);
    }
}


function onDeleteSuccess(tx, results) {        
    //Instead of checking the count of daily takes, simply delete all possible alarm id's.
    for (var i = 0; i < 5; i++)
    {
        var notificationId = (tmpId * 100) + i;
        //window.plugins.localNotification.cancel(notificationId.toString());
        notification.clear(notificationId.toString());
    }
    listMedicines();
}
            
            
function listMedicines() {
    var sqlStr = "SELECT * FROM MEDICINE ORDER BY id DESC";
    theDB.transaction(function(tx) { 
        tx.executeSql(sqlStr, [], onQuerySuccess_listMedicines, onQueryFailure);
    }, onTxError, onTxSuccess);
}

    
function onQuerySuccess_listMedicines(tx, results) {
    if (results.rows) {
        var len = results.rows.length;
        if (len > 0) {
            $("#noSavedMedicine").hide();
            $("#listSavedMedicines").show();
            $("#listSavedMedicines").empty();
            $.each(results.rows, function(index) {
                var row = results.rows.item(index);
                var d = new Date(row['dateSaved']);
                var day;
                var month;
                var year = d.getFullYear();
                var hour;
                var min;
                if (d.getDate() < 10) { day = "0" + d.getDate(); } else { day = d.getDate(); }
                if (d.getMonth() < 10) { month = "0" + parseInt(d.getMonth() + 1); } else { month = parseInt(d.getMonth() + 1); }
                if (d.getHours() < 10) { hour = "0" + d.getHours(); } else { hour = d.getHours(); }
                if (d.getMinutes() < 10) { min = "0" + parseInt(d.getMinutes() + 1); } else { min = d.getMinutes(); }
                $("#listSavedMedicines").append('<li><a href="#" onclick="updateMedicine(' + row['id'] + ');">'
                    + '<h3 class="ui-li-heading">' + row['medicineName'] + ' (' + row['medicineType'] + ')' 
                    + '</h3><p class="ui-li-desc">' + convertToPeriodName(row['medicineTakePeriod']) + ', ' 
                    + row['medicineDailyTakeCount'] + ' times a day (' + row['medicineTakeHours'] + ') ' 
                    + row['medicineDosage'].toLowerCase() + '</p><p>Saved on: ' + day + '.' + month + '.' + year 
                    + ' ' + hour + ':' + min + '</p></a><a href="#" onclick="deleteMedicine(' + row['id'] + ');" data-icon="delete"></a></li>');
            });
            $("#listSavedMedicines").listview("refresh");                           
        }
        else
        {
            $("#listSavedMedicines").hide();
            $("#noSavedMedicine").show();
        }   
    }
    else
    {
        alert("No records match selection criteria.");
    }
}


function onQueryFailure(tx, err) {
    var msgText;
    if (err) 
    {
        msgText = "Query: " + err;
    } 
    else 
    {
        msgText = "Query: Unknown error";
    }
    console.error(msgText);
    alert(msgText);
}     


function rcMedicineTypeClick(medicineTypeVal) { 
    var lblMedicineType = document.getElementById("lblMedicineType");
    
    document.getElementById("divMedicineType0Dosage").style.display = "none";
    document.getElementById("divMedicineType1Dosage").style.display = "none";
    document.getElementById("divMedicineType2Dosage").style.display = "none";
    document.getElementById("divMedicineType3Dosage").style.display = "none";
    document.getElementById("divMedicineType4Dosage").style.display = "none";
    document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";
    
    switch(medicineTypeVal)
    {
        case 0:
            document.getElementById("divMedicineType0Dosage").style.display = "block";
            var isType0Dosage4 = $('#rcMedicineType0Dosage4').is(':checked');
            if (isType0Dosage4)
            {
                document.getElementById("divMedicineType0_1_Dosage4").style.display = "block";
                lblMedicineType.innerHTML = "&nbsp;tablets";
            }
            else
            {
                document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";
            }
            break;
        case 1:
            document.getElementById("divMedicineType1Dosage").style.display = "block";
            
            var isType1Dosage1 = $('#rcMedicineType1Dosage1').is(':checked');
            if (isType1Dosage1)
            {
                var isType1Dosage1_4 = $('#rcMedicineType1Dosage1_4').is(':checked');
                if (isType1Dosage1_4)
                {
                    document.getElementById("divMedicineType0_1_Dosage4").style.display = "block";
                    lblMedicineType.innerHTML = "&nbsp;spoons";
                }
                else
                {
                    document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";
                }
            }
            break;
        case 2:
            document.getElementById("divMedicineType2Dosage").style.display = "block";  
            break;
        case 3:
            document.getElementById("divMedicineType3Dosage").style.display = "block";
            break;
        case 4:
            document.getElementById("divMedicineType4Dosage").style.display = "block";
            break;
    } 
}


function rcMedicineType0DosageClick() {        
    document.getElementById("divMedicineType0Dosage").style.display = "block";
    document.getElementById("divMedicineType1Dosage").style.display = "none";
    
    var isType0Dosage4 = $('#rcMedicineType0Dosage4').is(':checked');
    if (isType0Dosage4)
    {
        var lblMedicineType = document.getElementById("lblMedicineType");
        document.getElementById("divMedicineType0_1_Dosage4").style.display = "block";
        lblMedicineType.innerHTML = "&nbsp;tablets";
    }
    else
    {
        document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";
    }
}


function rcMedicineType1DosageClick(dosage) {
    document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";

    if (dosage.value == "0")
    {
        document.getElementById("divMedicineType1Dosage0").style.display = "block";
        document.getElementById("divMedicineType1Dosage1").style.display = "none";
    }
    else
    {
        document.getElementById("divMedicineType1Dosage0").style.display = "none";
        document.getElementById("divMedicineType1Dosage1").style.display = "block";
        
        var lblMedicineType = document.getElementById("lblMedicineType");
        
        var isType1Dosage4 = $('#rcMedicineType1Dosage1_4').is(':checked');
        if (isType1Dosage4)
        {
            document.getElementById("divMedicineType0_1_Dosage4").style.display = "block";
            lblMedicineType.innerHTML = "&nbsp;spoons";
        }
        else
        {
            document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";
        }
    }
}
   

function rcMedicineType1Dosage1Click() {
    var lblMedicineType = document.getElementById("lblMedicineType");

    var isType1Dosage1_4 = $('#rcMedicineType1Dosage1_4').is(':checked');
    if (isType1Dosage1_4)
    {
        document.getElementById("divMedicineType0_1_Dosage4").style.display = "block";
        lblMedicineType.innerHTML = "&nbsp;spoons";
    }
    else
    {
        document.getElementById("divMedicineType0_1_Dosage4").style.display = "none";
    }
}


function selectDailyTakeCountChange() {
    var count = $("#dailyTakeCount").val();
    
    document.getElementById("divMedicineTakeHours").innerHTML = '';
    
    for (var i = 0; i < count; i++)
    {
        var div = document.createElement("div");
        div.setAttribute("id", "divMedicineTakeHour" + i);
        div.setAttribute("style", "display: inline-block; margin-right: 10px;");
        var button = document.createElement("button");
        button.setAttribute("id", "btnMedicineTakeHour" + i);           
        
        if (i == 0)
        {
            button.setAttribute("value", "08:00");
            button.setAttribute("data-mytime", "08:00");
        }
        if (i == 1)
        {
            switch (count)
            {
                case "2":
                    button.setAttribute("value", "20:00");
                    button.setAttribute("data-mytime", "20:00");
                    break;
                case "3":
                    button.setAttribute("value", "16:00");
                    button.setAttribute("data-mytime", "16:00");
                    break;
                case "4":
                    button.setAttribute("value", "13:00");
                    button.setAttribute("data-mytime", "13:00");
                    break;  
                case "5":
                    button.setAttribute("value", "12:00");
                    button.setAttribute("data-mytime", "12:00");
                    break;
            }
        }
        if (i == 2)
        {
            switch (count)
            {
                case "3":
                    button.setAttribute("value", "23:59");
                    button.setAttribute("data-mytime", "23:59");
                    break;
                case "4":
                    button.setAttribute("value", "18:00");
                    button.setAttribute("data-mytime", "18:00");
                    break;  
                case "5":
                    button.setAttribute("value", "16:00");
                    button.setAttribute("data-mytime", "16:00");
                    break;
            }
        }
        if (i == 3)
        {
            switch (count)
            {
                case "4":
                    button.setAttribute("value", "23:00");
                    button.setAttribute("data-mytime", "23:00");
                    break;  
                case "5":
                    button.setAttribute("value", "20:00");
                    button.setAttribute("data-mytime", "20:00");
                    break;
            }
        }
        if (i == 4)
        {
            button.setAttribute("value", "23:59");
            button.setAttribute("data-mytime", "23:59");
        }
        
        button.setAttribute("class", "nativetimepicker");   
        div.appendChild(button);
        document.getElementById("divMedicineTakeHours").appendChild(div);
    }   
    $("#divMedicineTakeHours").trigger('create');
}


function soundSettingChanged()
{
    soundOption = $("#flipSound").val();
    console.log("***soundOption: " + soundOption);
    preferences.set("soundOption", soundOption, function(value) {
            console.log("SoundOption successfully saved as " + value);
        }, function(error) {
            console.log("Error! " + JSON.stringify(error));
    });
}


function vibrationSettingChanged()
{
    vibrationOption = $("#flipVibration").val();
    console.log("***vibrationOption: " + vibrationOption);      
    preferences.set("vibrationOption", vibrationOption, function(value) {
            console.log("vibrationOption successfully saved as " + value);
        }, function(error) {
            console.log("Error! " + JSON.stringify(error));
    });
}


//function lightsSettingChanged()
//{
//    lightsOption = $("#flipLights").val();
//    console.log("***lightsOption: " + lightsOption);      
//    preferences.set("lightsOption", lightsOption, function(value) {
//            console.log("lightsOption successfully saved as " + value);
//        }, function(error) {
//            console.log("Error! " + JSON.stringify(error));
//    });
//}


function updateMedicine(id)
{
    updateMode = true;
    sessionStorage.setItem("id", id);   
    $.mobile.changePage("#pageAddMedicine");            
}


function getValues(id)
{
    sqlStr = "SELECT * FROM MEDICINE WHERE id == " + id;
    theDB.transaction(function(tx) { 
        tx.executeSql(sqlStr, [], onQuerySuccess_getMedicineData, onQueryFailure);
    }, onTxError, onTxSuccess);
}


function onQuerySuccess_getMedicineData(tx, results) {
    if (results.rows) 
    {
        var row = results.rows.item(0);
        sessionStorage.setItem("id", row['id']);
        sessionStorage.setItem("medicineName", row['medicineName']);
        sessionStorage.setItem("medicineType", row['medicineType']);
        sessionStorage.setItem("medicineDosage", row['medicineDosage']);
        sessionStorage.setItem("medicineDailyTakeCount", row['medicineDailyTakeCount']);
        sessionStorage.setItem("medicineTakeHours", row['medicineTakeHours']);
        sessionStorage.setItem("medicineTakePeriod", row['medicineTakePeriod']);
        setValues();
    }
    else
    {
        alert("No records match selection criteria.");
    }
}


function setValues()
{   
    var valueType;
    
    resetControls();    
    
    $("#medicineName").val(sessionStorage.getItem("medicineName"));

    var medicineTypeText = sessionStorage.getItem("medicineType");
    $("input:radio[name=rcMedicineType]").each(function () {
        if ($(this).next().text() == medicineTypeText) {
            $(this).prop("checked", true);
            valueType = $(this).val();
            return false;
        }
    });
    $("input:radio[name=rcMedicineType]").checkboxradio("refresh");
    
    rcMedicineTypeClick(parseInt(valueType));
    
    var medicineDosageText = sessionStorage.getItem("medicineDosage");
    
    //if the medicine is a tablet... DONE
    if (valueType == 0)
    {
        var isOtherInType0 = true;
        $("input:radio[name=rcMedicineType0Dosage]").each(function () {
            if ($(this).next().text() == medicineDosageText) {
                $(this).prop("checked", true);
                isOtherInType0 = false;
                return false;
            }
        });
        $("input:radio[name=rcMedicineType0Dosage]").checkboxradio("refresh");
        
        if (isOtherInType0)
        {
            $("input:radio[name=rcMedicineType0Dosage]").filter("[value=4]").prop("checked", true);
            $("input:radio[name=rcMedicineType0Dosage]").checkboxradio("refresh");
            rcMedicineType0DosageClick();
            var dosage = medicineDosageText.substr(0, 1);
            $("#piecesPerTake").val(dosage).prop("selected", true);
            $("#piecesPerTake").selectmenu("refresh");
        }        
    }
    
    //if the medicine is a syrup... DONE
    if (valueType == 1)
    {
        var n = medicineDosageText.toLowerCase().search("spoons");
        
        if (n != -1)
        {
            var isOtherInType1 = true;
            
            $("input:radio[name=rcMedicineType1Dosage]").each(function () {
                if ($(this).val() == "1") {
                    $(this).prop("checked", true);
                    return false;
                }
            });
            rcMedicineType1DosageClick("1");
            
            $("input:radio[name=rcMedicineType1Dosage1]").each(function () {
                if ($(this).next().text() == medicineDosageText) {
                    $(this).prop("checked", true);
                    isOtherInType1 = false;
                    return false;
                }
            });
            rcMedicineType1Dosage1Click();
            if (isOtherInType1)
            {  
                var dosage = medicineDosageText.substr(0, 1);
                $("input:radio[name=rcMedicineType1Dosage1]").filter("[value=4]").attr("checked", true);
                rcMedicineType1Dosage1Click();
                $("#piecesPerTake").val(dosage).prop("selected", true);
                $("#piecesPerTake").selectmenu("refresh");
            }   
        }
        else
        {
            $("input:radio[name=rcMedicineType1Dosage]").each(function () {
                if ($(this).val() == "0") {
                    $(this).prop("checked", true);
                    return false;
                }
            });
            dosage = medicineDosageText.slice(0, medicineDosageText.length - 3);
            $("#ml").val(dosage);
        }
        $("#rcMedicineType1Dosage").checkboxradio("refresh");
        $("input:radio[name=rcMedicineType1Dosage]").checkboxradio("refresh");
        $("input:radio[name=rcMedicineType1Dosage1]").checkboxradio("refresh");
    }
    
    //if the medicine is of another type... DONE
    if (valueType == 2 || valueType == 3 || valueType == 4)
    {
        var dosage = medicineDosageText.substr(0, 1);    
        $("#piecesPerTake_Type" + valueType).val(dosage).prop("selected", true);
        $("#piecesPerTake_Type" + valueType).selectmenu("refresh");
    }
    
    var dailyTakeCount = sessionStorage.getItem("medicineDailyTakeCount");
    $("#dailyTakeCount").val(dailyTakeCount).prop("selected", true);
    $("#dailyTakeCount").selectmenu("refresh");
    
    var takeHours = sessionStorage.getItem("medicineTakeHours");
    selectDailyTakeCountChange();
    var hour;
    for (var i = 0; i < dailyTakeCount; i++)
    {
        if (i == 0) {
            hour = takeHours.substr(0, 5);
            $("#btnMedicineTakeHour0").prop("value", hour);
            $("#btnMedicineTakeHour0").data("mytime", hour);
            $("#btnMedicineTakeHour0").button("refresh");
        }
        if (i == 1) {
            hour = takeHours.substr(6, 5);
            $("#btnMedicineTakeHour1").prop("value", hour);
            $("#btnMedicineTakeHour1").data("mytime", hour);
            $("#btnMedicineTakeHour1").button("refresh");
        }
        if (i == 2) {
            hour = takeHours.substr(12, 5);
            $("#btnMedicineTakeHour2").prop("value", hour);
            $("#btnMedicineTakeHour2").data("mytime", hour);
            $("#btnMedicineTakeHour2").button("refresh");
        }
        if (i == 3) {
            hour = takeHours.substr(18, 5);
            $("#btnMedicineTakeHour3").prop("value", hour);
            $("#btnMedicineTakeHour3").data("mytime", hour);
            $("#btnMedicineTakeHour3").button("refresh");
        }
        if (i == 4) {
            hour = takeHours.substr(24, 5);
            $("#btnMedicineTakeHour4").prop("value", hour);
            $("#btnMedicineTakeHour4").data("mytime", hour);
            $("#btnMedicineTakeHour4").button("refresh");
        }
    }
    
    var period = sessionStorage.getItem("medicineTakePeriod");
    switch (period)
    {
        case "1":
            period = 0;
            break;
        case "2":
            period = 1;
            break;
        case "7":
            period = 2;
            break;
        case "30":
            period = 3;
            break;
    }
    $("input:radio[name=rcMedicineTakePeriod]").each(function () {
        if ($(this).val() == period) {
            $(this).prop("checked", true);
            return false;
        }
    });
    $("input:radio[name=rcMedicineTakePeriod]").checkboxradio("refresh");
    
}
