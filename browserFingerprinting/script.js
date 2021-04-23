/*Operating System*/
    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
    if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS/iOS";
    if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
    if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux/Android";
    $("#os").append("<b>Operating System: </b>" + OSName + "<br>");

/*Browser via User Agent*/
    if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {$("#browser").append("Opera");}
    else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
        if(navigator.userAgent.indexOf("Edg") != -1) {
            $("#browser").append("Microsoft Edge");
        } else {
        $("#browser").append("Google Chrome");
        }
    }
    else if(navigator.userAgent.indexOf("Safari") != -1){$("#browser").append("Safari");}
    else if(navigator.userAgent.indexOf("Firefox") != -1 ) {$("#browser").append("Mozilla Firefox");}
    else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {$("#browser").append("Microsoft Internet Explorer");}
    else {$("#browser").append("<span class='text-danger'>Unknown browser</span>");}

/*Browser via ducktyping*/
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 71
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    if (isOpera == true) {$("#browserDuck").append("Opera");}
    else if (isFirefox == true) {$("#browserDuck").append("Mozilla Firefox");}
    else if (isSafari == true) {$("#browserDuck").append("Safari");}
    else if (isIE == true) {$("#browserDuck").append("Microsoft Internet Explorer");}
    else if (isEdge == true) {$("#browserDuck").append("Microsoft Edge");}
    else if (isChrome == false) {$("#browserDuck").append("Google Chrome");}
    else {$("#browserDuck").append("<span class='text-info'>Unknown browser</span>");}

/*Plugins installed*/
    var x = navigator.plugins.length; 
    var txt = "<br>";
    if (x == 0) {
        $("#plugins").append("<span class='text-danger'>No plugins available or your plugins are hidden.</span>");
    } else {
        for(var i=0;i<x;i++)
        {
          txt+=navigator.plugins[i].name + "<br>"; 
        }
        $("#plugins").append(txt);
    }
/*cookies*/
    if (window.navigator.cookeEnabled == true) {
        $("#cookies").append("True");
    } else {
        $("#cookies").append("False");
    }
/*dnc*/
    if (window.navigator.doNotTrack == true) {
        $("#dnc").append("True");
    } else {
        $("#dnc").append("False");
    }

/*CPU info*/
    if (navigator.hardwareConcurrency > 0) {
        $("#cpu").append(navigator.hardwareConcurrency + " core(s)");
    } else {
        $("#cpu").append("No information available.");
    }
/*GPU info*/
    function getVideoCardInfo() {
        const gl = document.createElement('canvas').getContext('webgl');
        if (!gl) {
            return {
                error: "no webgl",
            };
        }
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer:  gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        } : {
            error: "no WEBGL_debug_renderer_info",
        };
    }
    $("#gpu").append(getVideoCardInfo().renderer);
    $("#screenRes").append(screen.width + " x " + screen.height);
/*Canvas*/
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.font = "32px Arial";
ctx.fillStyle = "green";
ctx.textAlign = "center";
ctx.fillText("Canvas text", canvas.width/2, canvas.height/2);
ctx.fillStyle = "red";
ctx.fillText("Canvas text", canvas.width/2.5, canvas.height/2.5);
ctx.fillStyle = "blue";
ctx.fillText("Canvas text", canvas.width/1.7, canvas.height/1.7);

var canvas = document.getElementById('myCanvas');
var dataURL = canvas.toDataURL();

function stringToHash(string) {             
    var hash = 0;
    if (string.length == 0) return hash;
    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; //convert to 32bit int
    }
    return Math.abs(hash);
}

hashVal = stringToHash(dataURL);
 $("#canvas").append("<p>Simple canvas data hash value (collisions may be possible): "+ hashVal +"</p>");

/*Battery info*/
    try {
        navigator.getBattery().then(function(battery) {
            var level = Math.round(battery.level*100);
            $("#battery").append("Your battery percentage is: " + level + "%.");
            if (battery.charging == false) {
                if (level == 100) {
                    $("#battery").append("<p>Your battery is fully charged!</p>");
                } else if (level >= 75 && level <= 99) {
                    $("#battery").append("<p>Your device is almost fully charged!</p>");
                } else if (level >= 30 && level < 75) {
                    $("#battery").append("<p>You will need to charge your device later.</p>");
                } else if (level >= 15 && level < 30) {
                    $("#battery").append("<p>You need to charge your device.</p>");
                } else {
                    $("#battery").append("<p>Your battery is critically low!</p>");
                }
            } else {
                $("#battery").append("<p>Your device is currently charging.</p>");
            }
    })
} catch (error) {
    console.error(error);
    $("#battery").append("<p class='text-danger'>You are not using a battery or your browser does not support this feature.</p>");
}

/*IP address*/
    function text(url) {
        return fetch(url).then(res => res.text());
    }

    text('https://www.cloudflare.com/cdn-cgi/trace').then(data => {
        let ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
        let ip = data.match(ipRegex)[0];
        $("#ip").append(ip);
    });

/*connection*/
    $("#conSpeed").append(navigator.connection.downlink + " Mbits per second");
    $("#conType").append(navigator.connection.effectiveType);

/*accelerometer and gyro*/
    let acl = new Accelerometer({frequency: 60});

    acl.addEventListener('reading', () => {
        $("#aclX").html("<b>X = </b>" + Math.round(acl.x * 10) / 10);
        $("#aclY").html("<b>Y = </b>" + Math.round(acl.y * 10) / 10);
        $("#aclZ").html("<b>Z = </b>" + Math.round(acl.z * 10) / 10);
    });
    acl.start();

    let gyroscope = new Gyroscope({frequency: 60});

    gyroscope.addEventListener('reading', e => {
        $("#gyroX").html("<b>X = </b>" + Math.round(gyroscope.x * 10) / 10);
        $("#gyroY").html("<b>Y = </b>" + Math.round(gyroscope.y * 10) / 10);
        $("#gyroZ").html("<b>Z = </b>" + Math.round(gyroscope.z * 10) / 10);
    });
    gyroscope.start();
/*orientation*/
    window.addEventListener("deviceorientation", handleOrientation, true);

    function handleOrientation(event) {
        var absolute = event.absolute;
        var alpha    = event.alpha; //turn your body around <- and ->
        var beta     = event.beta; //flip deivce /\ and \/
        var gamma    = event.gamma; //spin device <- and ->

        $("#orientation").html("<br><img alt='compass' src='compass.png' width='256px' style='-webkit-transform:rotate("+alpha+"deg);-moz-transform:rotate("+alpha+"deg);-ms-transform:rotate("+alpha+"deg);-o-transform:rotate("+alpha+"deg);-transform:rotate("+alpha+"deg);'><br>");
        if (beta < 45) {
            $("#orientation").append("<br><p>Your device is probably laying down.</p>");
        } else {
            $("#orientation").append("<br><p>Your device is probably in your hands or sitting upright.</p>");
        }
    }
/*geolocation*/
    var x = document.getElementById("location");

function getLocation() {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude;
}