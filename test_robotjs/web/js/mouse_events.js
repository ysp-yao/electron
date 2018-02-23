//http://www.w3school.com.cn/tags/html_ref_eventattributes.asp

/*
 * mouse event
 */

var x = -1;
var y = -1;
var min_move = 10.0;
var is_drag = 0;

window.onmousemove = function(e) {
  if (!is_offer) {
    var msg;
    if (is_drag) {
      var move = Math.sqrt((e.clientX-x)*(e.clientX-x)+(e.clientY-y)*(e.clientY-y));
      if (move < min_move)
        return;
      msg = {"event":"onmousedrag", "data" : [x,y,e.clientX, e.clientY]};  
      x =  e.clientX;
      y = e.clientY;     
    }
    else {
      msg = {"event":"onmousemove", "data" : [e.clientX, e.clientY]};
    }    
    var last=JSON.stringify(msg); //将JSON对象转化为JSON字符
    rtcsdk.SendData(last);
    console.log(last);
  }
}
   
window.ondblclick = function(e) {
  if (!is_offer) {
    var msg = {"event":"ondblclick", "data" : ""};
    var last=JSON.stringify(msg); //将JSON对象转化为JSON字符
    rtcsdk.SendData(last);    
  }
}

window.onclick = function(e) {
  console.log(e.button);
  if (!is_offer) {
    var msg = {"event":"onclick", "data" : e.button};
    var last=JSON.stringify(msg); //将JSON对象转化为JSON字符
    rtcsdk.SendData(last);    
  }
}
  

/*
 * drag
 */

window.onmousedown = function(e) {
  if (!is_offer) {
    x = e.clientX;
    y = e.clientY;
    is_drag = 1;
  }
}

window.onmouseup = function(e) {
  if (!is_offer) {
    is_drag = 0;
    x = -1;
    y = -1;
  }
}