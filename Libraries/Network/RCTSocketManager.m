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
    NSInteger _idx;
}

- (instancetype)init:(NSString *)url
                bridge: (RCTBridge *)bridge
                idx: (NSInteger) idx
 {
    if ((self = [super init])) {
        NSLog(@"create a web socket");
        _bridge = bridge;
        _idx = idx;

        NSURL* u = [NSURL URLWithString:url];
        if( u == NULL ){
            [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketFailed"
                                            body:@"badly formed url"];
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

- (void)webSocketDidOpen:(SRWebSocket *)webSocket;
{
    [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketOpen"
                                                body:NULL];

    NSLog(@"Websocket Connected");
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message;
{
    [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketMessage"
                                                body:message];

    NSLog(@"Received \"%@\"", message);
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error;
{

    [_bridge.eventDispatcher sendDeviceEventWithName:@"websocketFailed"
                                            body:[error localizedDescription]];
    NSLog(@":( Websocket Failed With Error %@", error);
    _webSocket = nil;
}


- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean;
{
    NSDictionary *closeEvent =  @{
        @"code": [NSNumber numberWithInt:code],
        @"reason": reason,
        @"clean": [NSNumber numberWithBool:wasClean]
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
    
    _socketRegistry[current_id] = [[RCTSocket alloc] init:url bridge:_bridge idx: current_id];
    current_id++;
    
}

- (void) send_message:(NSString *)message
{
	RCT_EXPORT();
	[_socketRegistry[_socketRegistry.count-1] send:message];
}

@end
