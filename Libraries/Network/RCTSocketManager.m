#import "RCTSocketManager.h"

#import "RCTAssert.h"
#import "RCTLog.h"
#import "RCTUtils.h"


@implementation RCTSocket{
    SRWebSocket *_webSocket;
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message;
{
    NSLog(@"Received \"%@\"", message);
}

@end


@implementation RCTSocketManager{
    
}

- (void) connect
{
    RCT_EXPORT(connect);
}

@end
