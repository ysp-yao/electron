import { RtcParam, Rtcsdk, RTC_PEER_TYPE } from './js/rtc/rtcsdk/rtcsdk'
import { RFB } from './js/rtc/remote_control/client/rfb'
import { Replay } from './js/rtc/remote_control/server/replay'

let ws = null; // websocket
let is_offer = false;
let rtcsdk = null;
let rfb = null;
let render = document.getElementById('remoteVideo');
let data_channel = false;
let replay = null;

function onRfbMsg(e) {
  if (data_channel&&!is_offer) {
      rtcsdk.SendData("callee", e.buffer);
  }
}

function onRtcsdkMsg(peer_id, msg_type, msg, data_size) {
  if (msg_type === 301) {
    data_channel = true;
  }
  else if (msg_type === 'kData') {
    replay.deal(msg);
  }
  else if (msg_type === 101 || msg_type === 102){
    ws.send(msg);
  }
}

function onSignalingMsg(evt) {  
  console.log("onSignalingMsg", evt.data)
  if (is_offer) {
    rtcsdk.SetRemoteSDP("caller", evt.data);
  }
  else {
    rfb = new RFB(render, null, onRfbMsg);
    render.focus();
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
      rtc_param2.remote_render= render;
      await rtcsdk.CreatePeer(peer_id, peer_type, rtc_param2);
    } 
    create();
  }
}


rtcsdk = new Rtcsdk();



async function Call() {
  replay = new Replay();
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