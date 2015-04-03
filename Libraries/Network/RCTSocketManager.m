#import "RCTSocketManager.h"

#import "RCTAssert.h"
#import "RCTLog.h"
#import "RCTUtils.h"
#import "RCTSparseArray.h"


@implementation RCTSocket{
    SRWebSocket *_webSocket;
    RCTResponseSenderBlock _onMessage;
    RCTResponseSenderBlock _onFail;
    RCTResponseSenderBlock _onClose;
    RCTResponseSenderBlock _onOpen;
}

- (instancetype)init:(NSString *)url
				onMessage: (RCTResponseSenderBlock)onMessage
				onFail: (RCTResponseSenderBlock)onFail
				onClose: (RCTResponseSenderBlock)onClose
				onOpen: (RCTResponseSenderBlock)onOpen
{
    if ((self = [super init])) {
        NSLog(@"create a web socket");
        _onMessage = onMessage;
        _onFail = onFail;
        _onClose = onClose;
        _onOpen = onOpen;

        _webSocket = [[SRWebSocket alloc] initWithURLRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:url]]];
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
    NSLog(@"Websocket Connected");
    _onOpen(@[]);
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message;
{
    NSLog(@"Received \"%@\"", message);
    _onMessage(@[message]);
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error;
{
    NSLog(@":( Websocket Failed With Error %@", error);
    _webSocket = nil;
    _onFail(@[[error localizedDescription]]);
}


- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean;
{
    NSLog(@"WebSocket closed");
    _onClose(@[[NSNumber numberWithInt:code],reason,[NSNumber numberWithBool:wasClean]]);
    _webSocket = nil;
}

@end


@implementation RCTSocketManager{;
    RCTSparseArray *_socketRegistry;
}

- (instancetype)init
{
  if ((self = [super init])) {
    _socketRegistry = [[RCTSparseArray alloc] init];
  }

  return self;
}

- (void) connect:(NSString *)url
            onMessage: (RCTResponseSenderBlock)onMessage
            onFail: (RCTResponseSenderBlock)onFail
            onClose: (RCTResponseSenderBlock)onClose
            onOpen: (RCTResponseSenderBlock)onOpen
{
    RCT_EXPORT();
    
    _socketRegistry[_socketRegistry.count] = [[RCTSocket alloc] init:url onMessage:onMessage onFail:onFail onClose:onClose onOpen:onOpen];
}

- (void) send_message:(NSString *)message
{
	RCT_EXPORT();
	[_socketRegistry[_socketRegistry.count-1] send:message];
}

@end
