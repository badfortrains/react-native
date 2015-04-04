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

class WebSocket extends WebSocketBase {



  connectToSocketImpl(url): void {
    RCTSocketManager.connect(url);

    RCTDeviceEventEmitter.addListener(
      'websocketMessage',
      function(message){
        console.log(message) 
        this.onmessage && this.onmessage({
          data:message
        });
      }.bind(this)
    )

    RCTDeviceEventEmitter.addListener(
      'websocketOpen',
      function(){
        console.log("opened");
        this.readyState = this.OPEN
        this.onopen && this.onopen();
      }.bind(this)
    )

    RCTDeviceEventEmitter.addListener(
      'websocketClosed',
      function(closedEvent){
        console.log("closed",closedEvent.err,closedEvent.reason,closedEvent.clean)
        this.onClose && this.onclose(closedEvent)
      }.bind(this)
    )

    RCTDeviceEventEmitter.addListener(
      'websocketFailed',
      function(errorMessage){
        console.log("websocket fail",errorMessage)
        this.onError && this.onerror(new Error(errorMessage))
      }.bind(this)
    )
  }

  closeConnectionImpl(): void{
    console.log("close connection")
  }

  cancelConnectingImpl(): void {
    // TODO
  }

  sendStringImpl(message): void {
    console.log("send message",message)
    RCTSocketManager.send_message(message);
  }

  sendArrayBufferImpl(): void {
    // TODO
  }

}

module.exports = WebSocket;
