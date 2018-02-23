//http://www.w3school.com.cn/tags/html_ref_eventattributes.asp

/*
 * mouse event
 */
window.onmousemove = function(e) {
    if (!is_offer) {
      var msg = {"event":"onmousemove", "data" : [e.clientX, e.clientY]};
      var last=JSON.stringify(msg); //将JSON对象转化为JSON字符
      rtcsdk.SendData(last);    
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
  