const {ipcRenderer} = require('electron')

function init() {
  //监听mian process里发出的message
  ipcRenderer.on('asynchronous-reply', (event, arg) => {
     alert("web2" + arg);// prints "pong"  在electron中web page里的console方法不起作用，因此使用alert作为测试方法
  })
}

function ipc_send (json_msg) {
 //在web page里向main process发出message
  ipcRenderer.send('asynchronous-message', json_msg) // prints "pong"   
  // ipcRenderer.sendSync('synchronous-message', 'ping') // prints "pong"   
  // alert("web1" + 'ping');
}