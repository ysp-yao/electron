//
// 1. The Remote Framebuffer Protocol, rfc6143, https://www.rfc-editor.org/rfc/pdfrfc/rfc6143.txt.pdf
// 2. noVNC, https://github.com/novnc/noVNC
// 3. HTML焦点与键盘事件 https://blog.csdn.net/woxueliuyun/article/details/45152047
//
import Keyboard from "./input/keyboard.js";
import Mouse from "./input/mouse.js";
import XtScancode from "./input/xtscancodes.js";

export class RFB {
  constructor(mouse, keyboard, call_back) {
    console.log("RFB_INFO, RFB::RFB()");    

    mouse.addEventListener("mousedown", function() { mouse.focus(); }); 

    // Call back
    this._call_back = call_back;

    // Mouse state
    this._mouse_buttonMask = 0;
    this._mouse_arr = [];
    this._viewportDragging = false;
    this._viewportDragPos = {};
    this._viewportHasMoved = false;

    this.dragViewport = false; // ???????

    this._keyboard = new Keyboard(mouse);
    this._keyboard.onkeyevent = this._handleKeyEvent.bind(this);
    this._keyboard.grab();

    this._mouse = new Mouse(mouse);
    this._mouse.onmousebutton = this._handleMouseButton.bind(this);
    this._mouse.onmousemove = this._handleMouseMove.bind(this);
    this._mouse.grab();
  }

  _handleMouseButton(x, y, down, bmask) {

    if (down) {
      this._mouse_buttonMask |= bmask;
    } else {
      this._mouse_buttonMask &= ~bmask;
    }

    if (this.dragViewport) {
        if (down && !this._viewportDragging) {
            this._viewportDragging = true;
            this._viewportDragPos = {'x': x, 'y': y};
            this._viewportHasMoved = false;

            // Skip sending mouse events
            return;
        } else {
            this._viewportDragging = false;

            // If we actually performed a drag then we are done
            // here and should not send any mouse events
            if (this._viewportHasMoved) {
                return;
            }

            // Otherwise we treat this as a mouse click event.
            // Send the button down event here, as the button up
            // event is sent at the end of this function.
            // RFB.messages.pointerEvent(this._sock,
            //                           this._display.absX(x),
            //                           this._display.absY(y),
            //                           bmask);
        }
      }

      //if (this._viewOnly) { return; } // View only, skip mouse events

      //if (this._rfb_connection_state !== 'connected') { return; }
      //RFB.messages.pointerEvent(this._sock, this._display.absX(x), this._display.absY(y), this._mouse_buttonMask);
      //console.log("sssssssssssssssssssssssssssssss");
      RFB.messages.pointerEvent(this._call_back, x, y, this._mouse_buttonMask);
  }

  _handleMouseMove(x, y) {

    if (this._viewportDragging) {
      var deltaX = this._viewportDragPos.x - x;
      var deltaY = this._viewportDragPos.y - y;

      // The goal is to trigger on a certain physical width, the
      // devicePixelRatio brings us a bit closer but is not optimal.
      var dragThreshold = 10 * (window.devicePixelRatio || 1);

      if (this._viewportHasMoved || (Math.abs(deltaX) > dragThreshold ||
                                     Math.abs(deltaY) > dragThreshold)) {
          this._viewportHasMoved = true;

          this._viewportDragPos = {'x': x, 'y': y};
          //this._display.viewportChangePos(deltaX, deltaY);
      }

      // Skip sending mouse events
      return;
    }
    //if (this._viewOnly) { return; } // View only, skip mouse events
    //if (this._rfb_connection_state !== 'connected') { return; }
    RFB.messages.pointerEvent(this._call_back, x, y, this._mouse_buttonMask);
  }

  _handleKeyEvent(keysym, code, down) {
    this.sendKey(keysym, code, down);
  }

  sendKey(keysym, code, down) {
    //if (this._rfb_connection_state !== 'connected' || this._viewOnly) { return; }

    if (down === undefined) {
        this.sendKey(keysym, code, true);
        this.sendKey(keysym, code, false);
        return;
    }

    //var scancode = XtScancode[code];

    // if (this._qemuExtKeyEventSupported && scancode) {
    //     // 0 is NoSymbol
    //     keysym = keysym || 0;

    //     Log.Info("Sending key (" + (down ? "down" : "up") + "): keysym " + keysym + ", scancode " + scancode);

    //     RFB.messages.QEMUExtendedKeyEvent(this._sock, keysym, down, scancode);
    // } else {
    if (!keysym) {
        return;
    }
    //Log.Info("Sending keysym (" + (down ? "down" : "up") + "): " + keysym);
    RFB.messages.keyEvent(this._call_back, keysym, down ? 1 : 0);
    // }
  }
};


//
// 大端字节序
//
RFB.messages = {
  keyEvent: function (call_back, keysym, down) {
      console.log('RFB_INFO, RFB::keyEvent(), ', keysym, down);

      let buff = new Uint8Array(8);
      let offset = 0;

      buff[offset] = 4;  // msg-type
      buff[offset + 1] = down;

      buff[offset + 2] = 0;
      buff[offset + 3] = 0;

      buff[offset + 4] = (keysym >> 24);
      buff[offset + 5] = (keysym >> 16);
      buff[offset + 6] = (keysym >> 8);
      buff[offset + 7] = keysym;
      call_back(buff);
  },

  pointerEvent: function (call_back, x, y, mask) {
      console.log('RFB::pointerEvent(), ', x, y, mask);


      let buff = new Uint8Array(6);
      let offset = 0;
      buff[offset] = 5; // msg-type

      buff[offset + 1] = mask;

      buff[offset + 2] = x >> 8;
      buff[offset + 3] = x;

      buff[offset + 4] = y >> 8;
      buff[offset + 5] = y;

      call_back(buff);
  },
};