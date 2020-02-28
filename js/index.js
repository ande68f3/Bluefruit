// Based on an example:
//https://github.com/don/cordova-plugin-ble-central


// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is ble hm-10 UART service
/*var blue= {
    serviceUUID: "0000FFE0-0000-1000-8000-00805F9B34FB",
    characteristicUUID: "0000FFE1-0000-1000-8000-00805F9B34FB"
};*/

//the bluefruit UART Service
var blue ={
	serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
}

var ConnDeviceId;
var deviceList =[];
 
function onLoad(){
	document.addEventListener('deviceready', onDeviceReady, false);
    bleDeviceList.addEventListener('touchstart', conn, false); // assume not scrolling
}

function onDeviceReady(){
	refreshDeviceList();
}

	 
function refreshDeviceList(){
	//deviceList =[];
	document.getElementById("bleDeviceList").innerHTML = ''; // empties the list
	if (cordova.platformId === 'android') { // Android filtering is broken
		ble.scan([], 5, onDiscoverDevice, onError);
	} else {
		//alert("Disconnected");
		ble.scan([blue.serviceUUID], 5, onDiscoverDevice, onError);
	}
}


function onDiscoverDevice(device){
	//Make a list in html and show devises
	if (device.name == "MPBLUE"){
		var listItem = document.createElement('li'),
		html = device.name+ "," + device.id;
		listItem.innerHTML = html;
		document.getElementById("bleDeviceList").appendChild(listItem);
	}
}
Fingerprint.isAvailable(isAvailableSuccess, isAvailableError);
 
    function isAvailableSuccess(result) {
      /*
      result depends on device and os. 
      iPhone X will return 'face' other Android or iOS devices will return 'finger'  
      */
      alert("Fingerprint available");
    }
 
    function isAvailableError(error) {
      // 'error' will be an object with an error code and message
      alert(error.message);
    }
	
Fingerprint.show({
      description: "Some biometric description"
    }, successCallback, errorCallback);
 
    function successCallback(){
      alert("Authentication successful");
    }
 
    function errorCallback(error){
      alert("Authentication invalid " + error.message);
    }

function conn(){
	var  deviceTouch= event.srcElement.innerHTML;
	document.getElementById("debugDiv").innerHTML =""; // empty debugDiv
	var deviceTouchArr = deviceTouch.split(",");
	ConnDeviceId = deviceTouchArr[1];
	//document.getElementById("debugDiv").innerHTML += "<br>"+deviceTouchArr[0]+"<br>"+deviceTouchArr[1]; //for debug:
	ble.connect(ConnDeviceId, onConnect, onConnError);
 }
 
 //succes
function onConnect(){
	document.getElementById("statusDiv").innerHTML = " Status: Connected";
	document.getElementById("bleId").innerHTML = ConnDeviceId;
	ble.startNotification(ConnDeviceId, blue.serviceUUID, blue.rxCharacteristic, onData, onError);
}

//failure
function onConnError(){
	alert("Problem connecting");
	document.getElementById("statusDiv").innerHTML = " Status: Disonnected";
}

 function onData(data){ // data received from Arduino
	document.getElementById("receiveDiv").innerHTML =  "Received: " + bytesToString(data) + "<br/>";
}

function data(txt){
	GemtInput.value = txt;
	sendData();
}	

function sendData() { // send data to Arduino
	var data = stringToBytes(GemtInput.value)
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, data, onSend, onError);
}
	
function onSend(){
	document.getElementById("sendDiv").innerHTML = "Sent: " + GemtInput.value + "<br/>";
}


function disconnect() {
	ble.disconnect(ConnDeviceId, onDisconnect, onError);
}

function onDisconnect(){
	document.getElementById("statusDiv").innerHTML = "Status: Disconnected";
}
function onError(reason)  {
	alert("ERROR: " + reason); // real apps should use notification.alert
}
const Page = require("sf-core/ui/page");
const extend = require("js-base/core/extend");
const Button = require('sf-core/ui/button');
const FlexLayout = require('sf-core/ui/flexlayout');
const System = require('sf-core/device/system');

var pageFingerprint = extend(Page)(
    function(_super) {
        _super(this);
        
        var myButtonFingerPrintAvailable = new Button({
            text: 'FingerPrint Available',
            height: 75,
            width: 200,
            margin: 15,
            alignSelf: FlexLayout.AlignSelf.CENTER,
            onPress: function() {
                alert("System.fingerPrintAvailable: "+ System.fingerPrintAvailable);
            }.bind(this)
        });
        
        var myButtonAuthFingerPrint = new Button({
            text: 'Authenticate with FingerPrint',
            height: 75,
            width: 200,
            margin: 15,
            alignSelf: FlexLayout.AlignSelf.CENTER,
            onPress: function() {
                if(System.fingerPrintAvailable){
                    System.validateFingerPrint({
                           android: {
                               title: "Title"
                           },
                           message : "Message",
                           onSuccess : function(){
                                 alert("You have been successfully logged in");
                           },
                           onError : function(){
                                 alert("Login failed");
                           }
                     });
                }
                else{
                    if(System.OS === 'iOS'){
                        alert("Fingerprint is not available. You should enable TouchID to use this authentication.");
                    }
                    else{
                        alert("Fingerprint is not available. If your device supprorts fingerprint, you should add at least one fingerprint.");
                    }
                }
            }.bind(this)
        });
        
        this.layout.flexDirection = FlexLayout.FlexDirection.COLUMN;
        this.layout.justifyContent = FlexLayout.JustifyContent.CENTER;
        
        this.layout.addChild(myButtonFingerPrintAvailable);
        this.layout.addChild(myButtonAuthFingerPrint);
    }
);
module.exports = pageFingerprint;

	
