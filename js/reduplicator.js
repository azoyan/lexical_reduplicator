window.onload = function() {
var timerId;
var delay = 700;
var vowels = "àîóýûÿ¸þåè";
var sms = document.getElementById('sms');

sms.onfocus = function() {	
	var lastValue = sms.value;
    timerId = setInterval(function() {
        if (sms.value != lastValue) {
        show();
        lastValue = sms.value;
        }
    }, delay);
};

sms.onblur = function() {
    clearInterval(timerId);
};


var isVowel = function (c) {
    for (i = 0; i < vowels.length; ++i) if (vowels[i] == c) {
        return true;
    }
    return false;
};

var transform = function (str) {
    var reduplicate = function (str) {
        for (var i = 0; i < 5; ++i) if (str[0] == vowels[i]) {
            return vowels[i+5] + str.substring(1);
        }  
        return  str;
    };	
    for (var i = 0; i < 4; ++i) {
        if (isVowel(str[i])) break;
    }
    return "õó" + reduplicate(str.substring(i));
}; 


function show() {
    if (sms.value.length > 0) {
        if (timerId > 0) {
            result.innerHTML = transform(sms.value.toLowerCase());
        }
    }
    else result.innerHTML = "";
}
}