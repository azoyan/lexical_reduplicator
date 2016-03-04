	//document.onload = function() {
	var timerId;
	var delay = 700;
	var vowels = "àîóýûÿ¸þåè";
	var input = document.getElementById('userInput');
	
	var userLang = navigator.language || navigator.userLanguage; 
	var keyword = "";
	
	if  (userLang === "ru") {
		keyword = "õó";
	}
	else {
		keyword = "dick";
	}
	
	
	console.log(userLang);

	input.onfocus = function() {	
		var lastValue = input.value;
		timerId = setInterval(function() {
			if (input.value != lastValue) {
				show();
				lastValue = input.value;
			}
		}, delay);
	};

	input.onblur = function() {
		clearInterval(timerId);
	};


	var isVowel = function (c) {
		for (i = 0; i < vowels.length; ++i) 
			if (vowels[i] == c) {
				return true;
			}
		return false;
	};

	var transform = function (str) {
		var result = keyword;
		if (userLang === "ru") {  // refactory me please
			var reduplicate = function (str) { 
				for (var i = 0; i < 5; ++i)
					if (str[0] == vowels[i]) {
						return vowels[i+5] + str.substring(1); 
					}  
				return  str;
			};	
			for (var i = 0; i < 4; ++i) {
				if (isVowel(str[i])) break;
			}
		result += reduplicate(str.substring(i));
		}
		else { //...please
			result += str;
		}
		return result;
	}; 


	function show() {
		if (input.value.length > 0) {
			if (timerId > 0) {
				result.innerHTML = transform(input.value.toLowerCase());
			}
		}
		else result.innerHTML = "";
	}
//}