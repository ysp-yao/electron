import { RtcParam, Rtcsdk, RTC_PEER_TYPE } from './js/rtc/rtcsdk/rtcsdk'

let ws = null; // websocket
let is_offer = false;

function onRtcsdkMsg(peer_id, msg_type, msg, data_size) {
  ws.send(msg);
}

function onSignalingMsg(evt) {  
  console.log("onSignalingMsg", evt.data)
  if (is_offer) {
    rtcsdk.SetRemoteSDP("caller", evt.data);
  }
  else {
    async function create() {
      let peer_id = "callee";
      let peer_type=RTC_PEER_TYPE.DATA;     
      let rtc_param2 = new RtcParam();  
      rtc_param2.ice_server=null;
      rtc_param2.ice_port=null;
      rtc_param2.ice_user =null;
      rtc_param2.ice_pwd =null;
      rtc_param2.sdp =  evt.data;
      rtc_param2.call_back = onRtcsdkMsg;
      rtc_param2.local_render= null;
      rtc_param2.remote_render= document.getElementById('remoteVideo');
      await rtcsdk.CreatePeer(peer_id, peer_type, rtc_param2);
    } 
    create();
  }
}

var rtcsdk = new Rtcsdk();

async function Call() {
  is_offer = true;

  let peer_id = "caller";
  let peer_type=RTC_PEER_TYPE.DESKTOP|RTC_PEER_TYPE.DATA;     
  let rtc_param2 = new RtcParam();  
  rtc_param2.ice_server=null;
  rtc_param2.ice_port=null;
  rtc_param2.ice_user =  null;
  rtc_param2.ice_pwd = null;
  rtc_param2.sdp = null;
  rtc_param2.call_back = onRtcsdkMsg;
  rtc_param2.local_render= null;
  rtc_param2.remote_render= null;
  await rtcsdk.CreatePeer(peer_id, peer_type, rtc_param2);
}

function onOpen(evt) {
  document.getElementById('ConnetToServer').disabled = true;
}

document.getElementById('Call').onclick = Call;

document.getElementById('ConnetToServer').onclick = function() {
    console.log("========================ConnetToServer");
    var x=document.getElementById("ws_addr").value;
    ws = new WebSocket(x);
    ws.onmessage = function(evt) { 
      onSignalingMsg(evt); 
    }; 
    ws.onopen = function(evt) {
      onOpen(evt);
    };
}