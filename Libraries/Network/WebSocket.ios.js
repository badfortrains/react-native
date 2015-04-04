/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule WebSocket
 * @flow
 */
'use strict';

var RCTSocketManager = require('NativeModules').SocketManager;
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var WebSocketBase = require('WebSocketBase');

var WebSocketId = 0;

class WebSocket extends WebSocketBase {

  unregisterEvents(): void{
    this.subs.forEach(e => e.remove())
  }

  registerEvents(id: number): void{
    this._socketId = id;
    this.subs = [
      RCTDeviceEventEmitter.addListener(
        'websocketMessage',
        function(ev){
          if(ev.id != id)
            return;
          console.log(ev.data) 
          this.onmessage && this.onmessage({
            data:ev.data
          });
        }.bind(this)
      ),
      RCTDeviceEventEmitter.addListener(
        'websocketOpen',
        function(ev){
          if(ev.id != id)
            return;
          console.log("opened");
          this.readyState = this.OPEN
          this.onopen && this.onopen();
        }.bind(this)
      ),
      RCTDeviceEventEmitter.addListener(
        'websocketClosed',
        function(ev){
          if(ev.id != id)
            return;
          console.log("closed",ev.err,ev.reason,ev.clean)
          this.readyState = this.CLOSED
          this.onClose && this.onclose(ev)
          this.unregisterEvents();
        }.bind(this)
      ),
      RCTDeviceEventEmitter.addListener(
        'websocketFailed',
        function(ev){
          if(ev.id != id)
            return;
          console.log("websocket fail",ev.message)
          this.onError && this.onerror(new Error(ev.message))
          this.unregisterEvents();
        }.bind(this)
      )
    ]
  }

  connectToSocketImpl(url: string): void {
    RCTSocketManager.connect(url);
    this.registerEvents(WebSocketId++);
  }

  closeConnectionImpl(): void{
    console.log("close connection")
  }

  cancelConnectingImpl(): void {
    // TODO
  }

  sendStringImpl(message): void {
    console.log("send message",message)
    RCTSocketManager.send_message(message,this._socketId);
  }

  sendArrayBufferImpl(): void {
    // TODO
  }

}

module.exports = WebSocket;
