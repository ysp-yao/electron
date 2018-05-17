import { Peer } from './peer'
const { desktopCapturer } = window.require('electron');
//
// C42 = 6种组合
//   合法：AUDIO+VIDEO, AUDIO+DATA, AUDIO+DESTOP, VIDEO+DATA, DATA+DESTOP
//   非法：VIDEO+DESTOP
//
// C43 = 4种组合
//   合法：AUDIO+VIDEO+DATA, AUDIO+DATA+DESTOP
//   非法：VIDEO+DESTOP+*
//
const RTC_PEER_TYPE = {
  AUDIO:1,
  VIDEO:2,
  DATA:4,
  DESKTOP:8
};
export {RTC_PEER_TYPE};

export class RtcParam {
  construct() {
  this.ice_server='';
  this.ice_port='';
  this.ice_user = '';
  this.ice_pwd = '';
  this.sdp = null;
  this.call_back = null;
  this.local_render= null;
  this.remote_render= null;
  }
};

export class Rtcsdk {

  constructor(call_back) {
    console.log('RTC_INFO, Rtcsdk::Rtcsdk()');
    this.stream_ = null;
    this.peer_map_ = new Map();

    this.OnRtcsdkMsg = call_back;
  }

  getChromeMediaSourceId() {
    return new Promise(function (resolve, reject) {
      desktopCapturer.getSources({ types: ['screen'] }, function (error, sources) {
        //for (let i = 0; i < sources.length; ++i) {
          //console.log('sources id::', sources[i].id);
          //if (sources[i].id == 'screen:0:0') break;
          resolve(sources[0].id);
        //}
      });
    });
  }

  async CreatePeer(peer_id, peer_type, rtc_param) {
    // TODO:检测peer_id
    console.log("===========================RTC_INFO, Rtcsdk::CreatePeer(), RtcParam : ", rtc_param);
    let constraints = {};
    let has_datachannel = false;
    if (peer_type&RTC_PEER_TYPE.VIDEO && peer_type&RTC_PEER_TYPE.DESKTOP) {
      console.log("RTC_ERROR, Rtcsdk::CreatePeer(), wrong peer-type");
      return;
    }
    if (peer_type&RTC_PEER_TYPE.AUDIO)
      constraints.audio = true;
    if (peer_type&RTC_PEER_TYPE.VIDEO)
      constraints.video = true;
    if (peer_type&RTC_PEER_TYPE.DESKTOP) {
      let id = await this.getChromeMediaSourceId();
      //constraints.video = { mandatory: { chromeMediaSource: 'desktop',chromeMediaSourceId: id, maxWidth: 1280, maxHeight: 720, minWidth: 1280, minHeight: 720, } }
      //constraints.video = { mandatory: { chromeMediaSource: 'desktop',chromeMediaSourceId: id , maxWidth: 1280, maxHeight: 720,} }
      constraints.video = { mandatory: { chromeMediaSource: 'desktop',chromeMediaSourceId: id , maxWidth: 1280, maxHeight: 720,} }
    }
    if (peer_type&RTC_PEER_TYPE.DATA)
      has_datachannel = true;

    console.log("RTC_INFO, Rtcsdk::CreatePeer(), getUserMedia() ：", constraints);
    console.log("RTC_INFO, Rtcsdk::CreatePeer(), has_datachannel", has_datachannel);

    let len  = Object.keys(constraints).length;  
    if (len!==0 && this.stream_===null) {
      this.stream_ = await navigator.mediaDevices.getUserMedia(constraints);
      if (rtc_param.local_render !== null) {
        rtc_param.local_render.src = window.URL.createObjectURL(this.stream_);
        rtc_param.local_render.play();      
      }
    }

    let peer = new Peer();
    this.peer_map_.set(peer_id, peer);
    console.log("RTC_INFO, Rtcsdk::CreatePeer(), RtcParam : ", rtc_param);
    this.peer_map_.get(peer_id).CreatePeer(peer_id, rtc_param, this.stream_, has_datachannel);
  }

  SetRemoteSDP(remote_id, remote_sdp) {
      // TODO 
      this.peer_map_.get(remote_id).SetRemoteSDP(remote_sdp);
  }

  SendData(peer_id, data) {
    //console.log("RTC_INFO, Rtcsdk::SendData(), ", peer_id);
    this.peer_map_.get(peer_id).SendData(data);
  }

  DestroyAll() {


    this.peer_map_.forEach(function (value, key, map) {
      value.Close();
    });
    console.log('RTC_DEBUG, ', this.stream_.getTracks());
    //let aaa = typeof this.stream_.stop === 'function' ? this.stream_ : this.stream_.getTracks()[0];
    //aaa.stop();
    //this._mediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[1];
    //this._mediaStreamTrack.stop();
    //this.stream_.getTracks()[1].stop();
  }

  DestroyOne(peer_id) {
    // TODO
  }
};



