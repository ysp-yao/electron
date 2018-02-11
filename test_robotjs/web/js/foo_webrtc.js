'use strict';



var pc = null;
var localStream;
var dataConstraint = null;
var sendChannel;

/* 
 * private
 */
function _get_stream(stream) {
    //localVideo.srcObject = stream;
    //window.localStream = localStream = stream;
}

function _get_remote_stream(e) {
    // Add remoteStream to global scope so it's accessible from the browser console
    trace("remote stream");
    window.remoteStream = remoteVideo.srcObject = e.stream;
}

function _onIceCandidate(pc, event) {
    if (event.candidate) {
      if (ws)
        ws.send(event.candidate.candidate);
    }
}

function _onIceStateChange(pc, event) {
    if (pc) {
      trace(' ICE state: ' + pc.iceConnectionState);
    }
}

function _onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function _onSetLocalSuccess(pc) {
  trace('setLocalDescription complete');
}

function _onSetSessionDescriptionError(error) {
  trace('Failed to set session description: ' + error.toString());
}

function _onCreateOfferSuccess(desc) {
  trace(desc.sdp);
  if (ws)
    ws.send(desc.sdp);
  pc.setLocalDescription(desc).then(
    function() {
      _onSetLocalSuccess(pc);
    },
    _onSetSessionDescriptionError
  );
}

function _onSetRemoteSuccess(pc) {
    trace("_onSetRemoteSuccess");
}

function _onAddIceCandidateSuccess(pc) {
    trace("_onAddIceCandidateSuccess");
}

function _onCreateAnswerSuccess(desc) {
    trace(desc.sdp);
    if (ws)
      ws.send(desc.sdp);
    pc.setLocalDescription(desc).then(
      function() {
        _onSetLocalSuccess(pc);
      },
      _onSetSessionDescriptionError
    );
}

function _onDataChannelData(event) {
  ipc_send(event.data);
  /*
  var obj = JSON.parse(event.data); //由JSON字符串转换为JSON对象
  if (obj.event == "mousemove") {
    console.log(obj.data[0]);
    console.log(obj.data[1]);    
  }*/
}

class Rtcsdk {
  
  CreateOffer(is_desktop, servers, offerOptions, is_datachannel) {
    console.log("CreateOffer");
    navigator.getUserMedia(
      constraints, 
      (stream) => {
        if (!is_desktop) {
          console.log("abcdef");
          localVideo.srcObject = stream;
          window.localStream = localStream = stream;
        }

        window.pc = pc = new RTCPeerConnection(servers);
  
        if (is_datachannel) {
          sendChannel = pc.createDataChannel('sendDataChannel', dataConstraint);
      
          sendChannel.onopen = function(event) {
            console.log('Hi you!');
          }
          sendChannel.onmessage = function(event) {
            _onDataChannelData(event);
            //console.log(event.data["event"]);
          }
        }

        pc.onicecandidate = function(e) {
          _onIceCandidate(pc, e);
        };
      
        pc.oniceconnectionstatechange = function(e) {
          _onIceStateChange(pc, e);
        };
      
        pc.onaddstream = function(e) {
            trace("asdaad");
            window.remoteStream = remoteVideo.srcObject = e.stream;
        }

        pc.addStream(stream);
      
        pc.createOffer(
          offerOptions
        ).then(
          _onCreateOfferSuccess,
          _onCreateSessionDescriptionError
        );
      }, 
      (err) => { 
        console.log('getUserMediaErr' + err); 
      }
    );
  }

  CreateAnswer(is_desktop, servers, remote_sdp, is_datachannel) {
    console.log("CreateAnswer");
///
    navigator.getUserMedia(
      constraints, 
      (stream) => {

        if (!is_desktop) {
          console.log("abcdef");
          localVideo.srcObject = stream;
          window.localStream = localStream = stream;
        }

        window.pc = pc = new RTCPeerConnection(servers);

        if (is_datachannel) {
          pc.ondatachannel = function(e) {
            sendChannel = event.channel;
            sendChannel.onopen = function(event) {
              console.log('Hi you!');
            }
            sendChannel.onmessage = function(event) {
              _onDataChannelData(event);
              //console.log(event.data);
            }
          }
        }
    
        pc.onicecandidate = function(e) {
          _onIceCandidate(pc, e);
        };
    
        pc.oniceconnectionstatechange = function(e) {
          _onIceStateChange(pc, e);
        };
        pc.onaddstream = _get_remote_stream;
    
        pc.addStream(stream);
    

        pc.setRemoteDescription(new RTCSessionDescription({type:"offer",sdp:remote_sdp})).then(
          function() {
            _onSetRemoteSuccess(pc);
          },
          _onSetSessionDescriptionError
        );
    
        pc.createAnswer().then(
          _onCreateAnswerSuccess,
          _onCreateSessionDescriptionError
        );
      }, 
      (err) => { 
        console.log('getUserMediaErr' + err); 
      }
    );
  }

  SetRemoteSDP(remote_sdp) {
    console.log("SetRemoteSDP");
 
    pc.setRemoteDescription({type:"answer",sdp:remote_sdp}).then(
        function() {
          _onSetRemoteSuccess(pc);
        },
        _onSetSessionDescriptionError
      );
  }

  addIceCandidate(remote_ice) {
    console.log(remote_ice);
    pc.addIceCandidate(
        new RTCIceCandidate({candidate: remote_ice})
      ).then(
        function() {
          _onAddIceCandidateSuccess(pc);
        },
        function(err) {
          _onAddIceCandidateError(pc, err);
        }
    );
  }

  SendData(x, y) {
    var msg = {"event":"mousemove", "data" : [x, y]};
    var last=JSON.stringify(msg); //将JSON对象转化为JSON字符
    sendChannel.send(last);
  }
}