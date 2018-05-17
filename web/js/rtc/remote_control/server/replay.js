var robot = require("robotjs");


const rfbKeyEvent = 4;
const rfbPointerEvent = 5;

const vnc2robotjs =  {
  0xff08:"backspace",
  0xff09:"tab" ,
  0xff0d:"enter",
  0xff1b:"escape",
  0xff63:"insert",
  0xffff:"delete",
  0xff50:"home",
  0xff57:"end",
  0xff55:"pageup",
  0xff56:"pagedown",
  0xff51:"left",
  0xff52:"up",
  0xff53:"right",
  0xff54:"down",
  0xffbe:"f1",
  0xffbf:"f2",
  0xffc0:"f3",
  0xffc1:"f4",
  0xffc2:"f5" ,
  0xffc3:"f6" ,
  0xffc4:"f7" ,
  0xffc5:"f8" ,
  0xffc6:"f9" ,
  0xffc7:"f10" ,
  0xffc8:"f11" ,
  0xffc9:"f12",
  0xffe1:"shift",
  0xffe2:"right_shift",
  0xffe3:"control",
  //  0xffe4:"Control (right)",
    0xffe9:"alt",
  // 0xffea:"Alt (right)"},

  0x0041 : "A",
  0x0042 : "B",
  0x0043 : "C",
  0x0044 : "D",
  0x0045 : "E",
  0x0046 : "F",
  0x0047 : "G",
  0x0048 : "H",
  0x0049 : "I",
  0x004a : "J",
  0x004b : "K",
  0x004c : "L",
  0x004d : "M",
  0x004e : "N",
  0x004f : "O",
  0x0050 : "P",
  0x0051 : "Q",
  0x0052 : "R",
  0x0053 : "S",
  0x0054 : "T",
  0x0055 : "U",
  0x0056 : "V",
  0x0057 : "W",
  0x0058 : "X",
  0x0059 : "Y",
  0x005a : "Z",
  0x0061 : "a",
  0x0062 : "b",
  0x0063 : "c",
  0x0064 : "d",
  0x0065 : "e",
  0x0066 : "f",
  0x0067 : "g",
  0x0068 : "h",
  0x0069 : "i",
  0x006a : "j",
  0x006b : "k",
  0x006c : "l",
  0x006d : "m",
  0x006e : "n",
  0x006f : "o",
  0x0070 : "p",
  0x0071 : "q",
  0x0072 : "r",
  0x0073 : "s",
  0x0074 : "t",
  0x0075 : "u",
  0x0076 : "v",
  0x0077 : "w",
  0x0078 : "x",
  0x0079 : "y",
  0x007a : "z",

  0x0020 : "space",
  45 : "-",
  61 : "+",
  91 : "[",
  92:"\\",
  93:"]",
  59:";",
  39:"'",
  44:",",
  46:".",
  47:"/",

  126:"~",
  33:"!",
  64:"@",
  35:"#",
  36:"$",
  37:"%",
  94:"^",
  38:"&",
  42:"*",
  40:"(",
  41:")",
  95:"_",
  43:"+",
  123:"{",
  125:"}",
  58:":",
  34:"\"",
  124:"|",
  60:"<",
  62:">",
  63:"?",




  0x0060 : "`",
  0x0030 : "0",
  0x0031 :"1",
  0x0032 :"2",
  0x0033 :"3",
  0x0034 :"4",
  0x0035 :"5",
  0x0036 :"6",
  0x0037 :"7",
  0x0038 :"8",
  0x0039 :"9"

}; 
  


export class Replay {
  constructor() {
    self = this;
    console.log("REMOTE_INFO, Replay::constructor()");
    //this.vnckeymap_ = new VncKeymap();
    var screenSize = robot.getScreenSize();
    this.scale_ = screenSize.height / 720;
    this.rfbPointerEventMsg = {
      type:"rfbPointerEvent", /* always rfbPointerEvent */
      buttonMask:-1, /* bits 0-7 are buttons 1-8, 0=up, 1=down */
      x: -1,
      y: -1
    };
  }

  _mouse_event(flags, x, y, wheel_movement, extra=null) { // 此接口模仿windows api
    // moveMouse
    // mouseClick
    // mouseToggle
    // dragMouse



  }
  win_test() {

    setTimeout(function(){
      // Speed up the mouse.
      robot.setMouseDelay(2);

      var twoPI = Math.PI * 2.0;
      var screenSize = robot.getScreenSize();
      var height = (screenSize.height / 2) - 10;
      var width = screenSize.width;

      for (var x = 0; x < width; x++)
      {
        var y = height * Math.sin((twoPI * x) / width) + height;
        robot.moveMouse(x, y);
      }
    }, 5000);
  }

  deal(msg) {
    let data = new Uint8Array(msg, 0, msg.byteLength);
    console.log("REMOTE_INFO, recieve data from client : ", data);
    switch (data[0]) {
      case rfbPointerEvent:
      {
        let mask = data[1];
        let x = data[2]<<8;
        let y = data[4]<<8;
        x += data[3];
        y += data[5];
        
        robot.mouse_event(mask, x, y);
      }
      break;
      case rfbKeyEvent:
      {
        let down = data[1];
        let keysym = data[7];
        keysym += data[6]<<8;
        keysym += data[5]<<16;
        keysym += data[4]<<24;
        let jap = 0;
        // TODO : 处理组合键,keyToggle的第三个参数
        // 同一个键上的不同符号keysym值是不同的
        robot.keyToggle(vnc2robotjs[keysym], (down===1)?"down":"up");
        //robot.key_event(keysym, down, jap);
      }
      break;
      default:
      break;
    }
  }
};