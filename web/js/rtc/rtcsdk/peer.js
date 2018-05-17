


export class Peer {
  constructor() {
    self = this;
    this.remote_id_ = null;
    this.local_sdp_ = null;
    this.peer_conn_ = null;
    this.remote_render_ = null;
    this.OnRtcsdkMsg_ = null;
    this.type_ = null;
    this.data_channel_ = null;
  }    

  PeerCallBack(peer_id, msg_type, msg, data_size) {
    this.OnRtcsdkMsg_(peer_id, msg_type, msg, data_size);
  }

  CreatePeer(peer_id, rtc_param, stream, has_datachannel) {
    console.log("RTC_INFO, Peer::CreatePeer(), RtcParam : ", rtc_param);

    this.OnRtcsdkMsg_ = rtc_param.call_back; 
    this.remote_id_ = peer_id;
    this.remote_render_ = rtc_param.remote_render;
    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',rtc_param.remote_render);
    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',this.remote_render_);
    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',self.remote_render_);

    let ice_server = null;
    if (rtc_param.ice_server !== null) {
      let _url = 'turn:'+rtc_param.ice_server+':'+rtc_param.ice_port;
      ice_server = {
        iceServer: [{ url: _url, username: rtc_param.ice_user, password: rtc_param.ice_pwd }],
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'negotiate'
      };
    }

    this.peer_conn_ = new RTCPeerConnection(ice_server);
    if (stream)
      this.peer_conn_.addStream(stream);
    this.peer_conn_.oniceconnectionstatechange = this._OnIceConnectionStateChange;
    this.peer_conn_.onicecandidate = this._OnIceCandidate;



    if (rtc_param.sdp === null) {
      console.log("RTC_INFO, Peer::CreatePeer(), CreateOffer");
      
      if (has_datachannel) {
        this.data_channel_ = this.peer_conn_.createDataChannel('sendDataChannel', null);
        this.data_channel_.onopen = this._OnDataChannelOpen;
        this.data_channel_.onmessage = this._OnData;
      }
       
      this.type_ = 'offer';
      this.peer_conn_.createOffer (
        (signalDesc)=>{
          this.local_sdp_ = JSON.parse(JSON.stringify(signalDesc.sdp));
          this.peer_conn_.setLocalDescription(signalDesc, ()=>{}, (err)=>{console.log('RTC_ERROR, Peer::PeerConnection::setLocalDescription(), '+err);})
        },
        (err)=>{ console.log('RTC_ERROR, Peer::PeerConnection::createOffer(), '+err);}
      )  
    }
    else {
      console.log("RTC_INFO, Peer::CreatePeer(), CreateAnswer");

      if (has_datachannel) {
        this.peer_conn_.ondatachannel = function(event) {
          self.data_channel_ = event.channel;
          self.data_channel_.onopen = self._OnDataChannelOpen;
          self.data_channel_.onmessage = self._OnData;
        }
      }

      this.type_ = 'answer';
      this.SetRemoteSDP(rtc_param.sdp, 'offer');
      this.peer_conn_.createAnswer(
        (answer) => {
          this.local_sdp_ = answer.sdp;
          this.peer_conn_.setLocalDescription({sdp:answer.sdp,type:'answer'});
        }, 
        (err) => { console.log('RTC_ERROR, Peer::PeerConnection::createAnswer(), '+err); }
      );
    }
  }

  SetRemoteSDP(sdp, type='answer') {
    var sd = this.peer_conn_.remoteDescription;
    sd.type = type;
    sd.sdp = sdp;
    this.peer_conn_.setRemoteDescription(
      sd, 
      () => {
        self.peer_conn_.onaddstream = (event) => {
          console.log('RTC_ERROR, Peer::SetRemoteSDP(), ', self.remote_render_);
          if (self.remote_render_ !== null) {
            self.remote_render_.src = URL.createObjectURL(event.stream);
            self.remote_render_.play();
          }
        };
      }, 
      (err) => { console.log('RTC_ERROR, Peer::SetRemoteSDP()::PeerConnection::setRemoteDescription(), '+err);}
    );
  }


  Close() {
    this.peer_conn_.close();
  }

  SendData(data) {
    if (self.data_channel_)
      self.data_channel_.send(data);
  }


  _OnIceConnectionStateChange(event) {
    if (self.peer_conn_.iceConnectionState === 'connected') {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", self.peer_conn_.iceConnectionState);
      self.PeerCallBack(self.remote_id_, 103, -1, -1);
    }
  }

  _OnIceCandidate(event) {
    if (event.candidate) {
      if (event.candidate.candidate.indexOf("udp")!=-1) {
        let MAX = 3;//TODO
        let ice = 'a=' + event.candidate.candidate + '\r\n'; 
        let iceTag = 'm=' + event.candidate.sdpMid;
        if (iceTag === 'm=data') {
          iceTag = "m=application";
          MAX = 2;
        }
        let pos = self.local_sdp_.indexOf(iceTag);
        for (let i = 0; i < MAX; ++i)
          pos = self.local_sdp_.indexOf("\r\n", pos+1);
        self.local_sdp_ = self.local_sdp_.substring(0, pos+2) 
                        + ice + self.local_sdp_.substring(pos+2, self.local_sdp_.length)
      }
    }
    else { // 完成ice生成
      console.log('RTC_INFO, Peer::_OnIceCandidate(), finished');      
      self.PeerCallBack(self.remote_id_, self.type_=='offer'?101:102 , self.local_sdp_, -1);
    }
  }

  _OnDataChannelOpen(event) {
    console.log('RTC_INFO, datachannel is opened');
    self.PeerCallBack(self.remote_id_, 301, -1, -1);
  }

  _OnData(event) {
    console.log('RTC_INFO, recieve data from ', self.remote_id_);
    //console.log(event.data);
    self.PeerCallBack(self.remote_id_, 'kData', event.data, -1);
  }

};