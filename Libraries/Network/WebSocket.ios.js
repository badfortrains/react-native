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

  connectToSocketImpl(url: string): void {
    RCTSocketManager.connect(url);
    this._socketId = WebSocketId++;
    this._registerEvents(this._socketId);
  }

  closeConnectionImpl(): void{
    RCTSocketManager.close(this._socketId)
  }

  cancelConnectingImpl(): void {
    RCTSocketManager.close(this._socketId)
  }

  sendStringImpl(message: string): void {
    RCTSocketManager.send_message(message,this._socketId);
  }

  sendArrayBufferImpl(): void {
    // TODO
  }

  _unregisterEvents(): void{
    this.subs.forEach(e => e.remove())
    this.subs = [];
  }

  _registerEvents(id: number): void{
    this.subs = [
      RCTDeviceEventEmitter.addListener(
        'websocketMessage',
        function(ev){
          if(ev.id != id)
            return;
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
          this.readyState = this.OPEN
          this.onopen && this.onopen();
        }.bind(this)
      ),
      RCTDeviceEventEmitter.addListener(
        'websocketClosed',
        function(ev){
          if(ev.id != id)
            return;
          this.readyState = this.CLOSED
          this.onClose && this.onclose(ev)
          this._unregisterEvents();
          RCTSocketManager.destroy(id)
        }.bind(this)
      ),
      RCTDeviceEventEmitter.addListener(
        'websocketFailed',
        function(ev){
          if(ev.id != id)
            return;
          this.onError && this.onerror(new Error(ev.message))
          this._unregisterEvents();
          RCTSocketManager.destroy(id)
        }.bind(this)
      )
    ]
  }

}

module.exports = WebSocket;
