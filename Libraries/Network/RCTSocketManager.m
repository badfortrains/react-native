#import "RCTSocketManager.h"

#import "RCTAssert.h"
#import "RCTLog.h"
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTSparseArray.h"
#import "RCTEventDispatcher.h"


@implementation RCTSocket{
    SRWebSocket *_webSocket;
    RCTBridge *_bridge;
    NSNumber* _idx;
}

- (instancetype)init:(NSString *)url
                bridge: (RCTBridge *)bridge
                idx: (NSNumber*) idx
 {
    if ((self = [super init])) {
        NSLog(@"create a web socket");
        _bridge = bridge;
        _idx = idx;

        NSURL* u = [NSURL URLWithString:url];
        if( u == NULL ){
            [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketFailed"
                                            body:@{@"message":@"badly formed url",@"id":_idx}];
            return self;
        }

        _webSocket = [[SRWebSocket alloc] initWithURLRequest:[NSURLRequest requestWithURL:u]];
        _webSocket.delegate = self;
        [_webSocket open];
    }
    return self;
}

- (void)send:(id)data;
{
	[_webSocket send:data];
}

- (void)close;
{
    [_webSocket close];
}


- (void)webSocketDidOpen:(SRWebSocket *)webSocket;
{
    [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketOpen"
                                                body:@{@"id":_idx}];

    NSLog(@"Websocket Connected");
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message;
{
    [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketMessage"
                                                body:@{@"data":message,@"id":_idx}];

    NSLog(@"Received \"%@\"", message);
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error;
{

    [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketFailed"
                                            body:@{@"message":[error localizedDescription],@"id":_idx}];
    NSLog(@":( Websocket Failed With Error %@", error);
    _webSocket = nil;
}


- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean;
{
    NSDictionary *closeEvent =  @{
        @"code": [NSNumber numberWithInt:code],
        @"reason": reason,
        @"clean": [NSNumber numberWithBool:wasClean],
        @"id": _idx
        };


    [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketClosed"
                                                body:closeEvent];

    NSLog(@"WebSocket closed");
    _webSocket = nil;
}

@end


@implementation RCTSocketManager{;
    RCTSparseArray *_socketRegistry;
    NSInteger current_id;
}
@synthesize bridge = _bridge;

- (instancetype)init
{
  if ((self = [super init])) {
    _socketRegistry = [[RCTSparseArray alloc] init];
      current_id = 0;
  }

  return self;
}

- (void) connect:(NSString *)url
{
    RCT_EXPORT();
    
    _socketRegistry[current_id] = [[RCTSocket alloc] init:url bridge:_bridge idx: [NSNumber numberWithInt:current_id]];
    current_id++;
    
}

- (void) send_message:(NSString *)message
            idx: (NSInteger)idx
{
	RCT_EXPORT();
	[_socketRegistry[idx] send:message];
}

- (void) destroy:(NSInteger)idx
{
    RCT_EXPORT();
    _socketRegistry[idx] = nil;
}

- (void) close:(NSInteger)idx
{
    RCT_EXPORT();
    [_socketRegistry[idx] close];
}


@end
