import { ipcMain } from 'electron'
// this.$ipc.send('new-window', 'http://localhost:9080/#/RTCP2P', 'RTCP2P')    
let rtcplugin_self = null;
export class Rtcplugin {

  constructor(rtc_service, newWindow) {
    console.log("zzzzzzzzzzzzz", newWindow);    
    rtcplugin_self = this;
    this.rtc_service_ = rtc_service;
    this.data_ = null;
    this.rtc_service_.regChannelEventCb(this.callback); 
    this.newWindow_ = newWindow;
  }

  setData(data) {
    this.data_ = data;    
  }

  getData() {
    let ret = this.data_;
    this.data_ = null;
    return ret;
  }


  callback(req) {
    if (req.type === 1) {
      rtcplugin_self.setData(req);
      if (req.videoType!==9) { // 音视频
        rtcplugin_self.newWindow_('RTCP2P', 'http://localhost:9080/#/RTCP2P', 800, 480);
      }
      else if (req.videoType===9) { // 远程协助
        rtcplugin_self.newWindow_('RemoteControl', 'http://localhost:9080/#/RemoteControl', 1440, 768);
      }
    }
  }

  regChannelEventCb(callback) {
    this.rtc_service_.regChannelEventCb(callback);     
  }

  resetCallback() {
      this.rtc_service_.regChannelEventCb(this.callback); 
  }

  getStunServer(call_back) {
    this.rtc_service_.getStunServer(call_back);
  }

  createChannel(request, call_back) {
    this.rtc_service_.createChannel(request, call_back);
  }

  acceptOrReject(request, call_back) {
    this.rtc_service_.acceptOrReject(request, call_back);
  }

  leaveChannel(call_back) {
    this.rtc_service_.leaveChannel(call_back);
  }
};