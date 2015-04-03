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

var WebSocketBase = require('WebSocketBase');

class WebSocket extends WebSocketBase {



  connectToSocketImpl(url): void {
    // onMessage,
    // onFail,
    // onClose
    // onOpen,
    RCTSocketManager.connect(url,
      (message) =>{ 
        console.log(message) 
        this.onmessage && this.onmessage({
          data:message
        });
      },
      errorMessage => { 
        console.log(errorMessage)
        this.onError && this.onError(new Error(errorMessage))
      },
      (code,reason,clean) => { 
        console.log("closed",err,reason,clean)
        this.onClose && this.onClose({
          code:code,
          reason: reason,
          clean: clean
        })
      },
      () =>{ 
        console.log("opened");
        this.readyState = this.OPEN
        this.onOpen && this.onOpen();
       }

    );
    // TODO
  }

  cancelConnectingImpl(): void {
    // TODO
  }

  sendStringImpl(message): void {
    RCTSocketManager.send_message(message);
  }

  sendArrayBufferImpl(): void {
    // TODO
  }

}

module.exports = WebSocket;
