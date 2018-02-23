

/*
 * keyboard
 */
Mousetrap.bind('1', function() { console.log('4'); });

// https://www.w3schools.com/jsref/dom_obj_event.asp

// 	The event occurs when the user presses a key
window.onkeypress = function(e) {
    console.log(e.keyCode);
    if (!is_offer) {
        var msg = {"event":"onkeypress", "data" : e.keyCode};
        var last=JSON.stringify(msg); //将JSON对象转化为JSON字符
        rtcsdk.SendData(last);    
    }
}

// The event occurs when the user is pressing a key
window.onkeydown = function(e) {
    //console.log(e.keyCode);
}

// The event occurs when the user releases a key
window.onkeyup = function(e) {
    //console.log("e.keyCode");
}