/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule WebSocketBase
 * @flow
 */
'use strict';

/**
 * Shared base for platform-specific WebSocket implementations.
 */
class WebSocketBase {
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;

  onclose: ?Function;
  onerror: ?Function;
  onmessage: ?Function;
  onopen: ?Function;

  binaryType: ?string;
  bufferedAmount: number;
  extension: ?string;
  protocol: ?string;
  readyState: number;
  url: ?string;

  constructor(url: string, protocols: ?any) {
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;

    var parsedUrl = parseUrl(url);
    if (!parsedUrl) {
      throw new Error('Failed to construct \`WebSocket\`: The url \'' + url + '\' is invalid.');
    }
    var [host, port, resourceName, secure] = parsedUrl;

    if (!protocols) {
      protocols = [];
    }

    this.connectToSocketImpl(host, port, resourceName, resource);
  }

  close(code: ?number, reason: ?string): void {
    if (this.readyState === WebSocketBase.CLOSING ||
        this.readyState === WebSocketBase.CLOSED) {
      return;
    }

    if (this.readyState === WebSocketBase.CONNECTING) {
      this.cancelConnectionImpl();
    }

    this.closeConnectionImpl(code, reason);
  }

  send(data: any): void {
    if (this.readyState === WebSocketBase.CONNECTING) {
      throw new Error('INVALID_STATE_ERR');
    }

    if (typeof data === 'string') {
      this.sendStringImpl(data);
    }
    else if (data instanceof ArrayBuffer) {
      this.sendArrayBufferImpl(data);
    }
    else {
      throw new Error('Not supported data type');
    }
  }

  connectToSocketImpl(): void {
    throw new Error('Subclass must define connectToSocketImpl method');
  }

  cancelConnectingImpl(): void {
    throw new Error('Subclass must define cancelConnectingImpl method');
  }

  sendStringImp(): void {
    throw new Error('Subclass must define sendStringImpl method');
  }

  sendArrayBufferImpl(): void {
    throw new Error('Subclass must define sendArrayBufferImpl method');
  }

}

module.exports = WebSocketBase;
