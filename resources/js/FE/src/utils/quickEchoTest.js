// Quick Echo test - chạy ngay khi import
import { debugEchoConnection, forceReconnectEcho } from './testEcho';

console.log('🚀 [quickEchoTest] Starting quick Echo test...');

// Chạy test ngay lập tức
debugEchoConnection().then(result => {
    console.log('📊 [quickEchoTest] Debug result:', result);
    
    if (!result.success) {
        console.log('🔄 [quickEchoTest] Trying force reconnect...');
        setTimeout(() => {
            forceReconnectEcho().then(reconnectResult => {
                console.log('📊 [quickEchoTest] Reconnect result:', reconnectResult);
            });
        }, 2000);
    }
});

// Export để có thể gọi từ console
window.quickEchoTest = {
    debug: debugEchoConnection,
    reconnect: forceReconnectEcho
};

console.log('💡 [quickEchoTest] Use window.quickEchoTest.debug() or window.quickEchoTest.reconnect() in console');
